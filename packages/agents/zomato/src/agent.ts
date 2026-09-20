import type { Agent, MessageContext, AgentResponse } from '@pam/core';
import { createZomatoProvider, type ZomatoProvider } from './provider.js';

export class ZomatoAgent implements Agent {
  readonly id = 'zomato';
  readonly name = 'Zomato';
  readonly icon = '🍔';
  readonly description = 'Order food from restaurants';
  readonly keywords = ['food', 'restaurant', 'order food', 'hungry', 'eat', 'dinner', 'lunch', 'breakfast', 'pizza', 'biryani', 'burger'];

  private provider: ZomatoProvider;

  constructor(provider?: ZomatoProvider) {
    this.provider = provider || createZomatoProvider();
  }

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();

    // Remove @mention or agent name prefix for cleaner parsing
    const cleanText = text
      .replace(/@zomato\s*/i, '')
      .replace(/^zomato[:\s]+/i, '')
      .trim();

    // Parse intent - order matters! More specific intents first
    if (this.matchesIntent(cleanText, ['cancel'])) {
      return this.handleCancel(ctx);
    }

    if (this.matchesIntent(cleanText, ['status', 'track', 'where is', 'my order'])) {
      return this.handleOrderStatus(ctx);
    }

    if (this.matchesIntent(cleanText, ['search', 'find', 'show', 'restaurants', 'nearby'])) {
      return this.handleSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['menu', 'what do they have', 'dishes'])) {
      return this.handleMenu();
    }

    if (this.matchesIntent(cleanText, ['order', 'place order', 'book', 'get'])) {
      return this.handleOrder(ctx);
    }

    // Default: show options
    return this.showOptions();
  }

  async handleInteraction(ctx: MessageContext, interactionId: string): Promise<AgentResponse> {
    if (interactionId.startsWith('restaurant_')) {
      const restaurantId = interactionId.replace('restaurant_', '');
      return this.showRestaurantMenu(restaurantId);
    }

    if (interactionId.startsWith('order_')) {
      return this.confirmOrder(ctx, interactionId);
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `🍔 *Zomato Agent*

I can help you order food from restaurants!

*Commands:*
• \`search [cuisine/restaurant]\` - Find restaurants
• \`menu\` - View menu of selected restaurant  
• \`order\` - Place a new order
• \`status\` - Track your order
• \`cancel\` - Cancel current order

*Examples:*
• @zomato search pizza
• @zomato order biryani
• @zomato track my order

_Note: This is a demo. Real orders are not placed._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private async handleSearch(query: string): Promise<AgentResponse> {
    // Extract search term
    const searchTerm = query
      .replace(/search|find|show|restaurants|nearby/gi, '')
      .trim() || 'food';

    const restaurants = await this.provider.searchRestaurants(searchTerm);

    if (restaurants.length === 0) {
      return {
        text: `No restaurants found for "${searchTerm}". Try a different search term!`,
        buttons: [
          { id: 'search_pizza', title: '🍕 Pizza' },
          { id: 'search_biryani', title: '🍚 Biryani' },
          { id: 'search_burger', title: '🍔 Burgers' },
        ],
      };
    }

    const restaurantList = restaurants
      .slice(0, 5)
      .map((r, i) => `${i + 1}. *${r.name}*\n   ${r.cuisine}\n   ⭐ ${r.rating} | 🕐 ${r.deliveryTime} | ${r.priceRange}`)
      .join('\n\n');

    return {
      text: `🔍 *Restaurants matching "${searchTerm}"*\n\n${restaurantList}\n\n_Tap a restaurant to view menu_`,
      list: {
        buttonText: 'Select Restaurant',
        sections: [{
          title: 'Restaurants',
          rows: restaurants.slice(0, 5).map((r) => ({
            id: `restaurant_${r.id}`,
            title: r.name,
            description: `${r.cuisine} | ⭐${r.rating}`,
          })),
        }],
      },
    };
  }

  private async handleMenu(): Promise<AgentResponse> {
    return this.showRestaurantMenu('r1');
  }

  private async showRestaurantMenu(restaurantId: string): Promise<AgentResponse> {
    const menu = await this.provider.getMenu(restaurantId);

    if (menu.length === 0) {
      return { text: 'Menu not available. Please try another restaurant.' };
    }

    const menuText = menu
      .map((item) => `${item.isVeg ? '🟢' : '🔴'} *${item.name}* - ₹${item.price}\n   ${item.description}`)
      .join('\n\n');

    return {
      text: `📋 *Menu*\n\n${menuText}\n\n_Select an item to add to cart_`,
      list: {
        buttonText: 'Order Items',
        sections: [{
          title: 'Menu Items',
          rows: menu.map((item) => ({
            id: `order_${item.id}`,
            title: `${item.isVeg ? '🟢' : '🔴'} ${item.name}`,
            description: `₹${item.price} - ${item.description.substring(0, 50)}`,
          })),
        }],
      },
    };
  }

  private async handleOrder(_ctx: MessageContext): Promise<AgentResponse> {
    const order = await this.provider.placeOrder('r1', [{ itemId: 'm1', quantity: 1 }]);

    return {
      text: `✅ *Order Placed!*

📦 Order ID: \`${order.id}\`
🏪 ${order.restaurantName}
💰 Total: ₹${order.total}
🕐 Estimated: ${order.estimatedDelivery}

_Your order has been placed successfully!_
_(Demo mode - no real order placed)_`,
      buttons: [
        { id: 'track_order', title: '📍 Track Order' },
        { id: 'cancel_order', title: '❌ Cancel' },
      ],
    };
  }

  private async confirmOrder(_ctx: MessageContext, interactionId: string): Promise<AgentResponse> {
    const itemId = interactionId.replace('order_', '');
    const order = await this.provider.placeOrder('r1', [{ itemId, quantity: 1 }]);

    return {
      text: `✅ *Order Confirmed!*

📦 Order ID: \`${order.id}\`
💰 Total: ₹${order.total}
🕐 ${order.estimatedDelivery}

_(Demo mode - no real order placed)_`,
    };
  }

  private async handleOrderStatus(_ctx: MessageContext): Promise<AgentResponse> {
    await this.provider.getOrderStatus('DEMO123');

    return {
      text: `📦 *Order Status*

Order ID: \`DEMO123\`
Status: 🔄 *Preparing*
Restaurant: Domino's Pizza

🕐 Estimated delivery: 25-30 minutes

_Your order is being prepared by the restaurant._
_(Demo mode)_`,
      buttons: [
        { id: 'refresh_status', title: '🔄 Refresh' },
        { id: 'contact_support', title: '📞 Support' },
      ],
    };
  }

  private async handleCancel(_ctx: MessageContext): Promise<AgentResponse> {
    return {
      text: `❌ *Cancel Order*

Are you sure you want to cancel your order?

_Note: Cancellation may not be possible if the restaurant has already started preparing._
_(Demo mode)_`,
      buttons: [
        { id: 'confirm_cancel', title: '✅ Yes, Cancel' },
        { id: 'keep_order', title: '❌ No, Keep It' },
      ],
    };
  }

  private showOptions(): Promise<AgentResponse> {
    return Promise.resolve({
      text: `What would you like to do?

• 🔍 *Search* - Find restaurants near you
• 📋 *Menu* - Browse dishes
• 🛒 *Order* - Place an order
• 📦 *Track* - Check order status

Just tell me what you're craving!`,
      buttons: [
        { id: 'search_food', title: '🔍 Search Food' },
        { id: 'view_orders', title: '📦 My Orders' },
        { id: 'help', title: '❓ Help' },
      ],
    });
  }
}

export function createZomatoAgent(): Agent {
  return new ZomatoAgent();
}

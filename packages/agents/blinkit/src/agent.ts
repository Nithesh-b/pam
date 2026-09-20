import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class BlinkitAgent implements Agent {
  readonly id = 'blinkit';
  readonly name = 'Blinkit';
  readonly icon = '🛵';
  readonly description = 'Quick grocery delivery in minutes';
  readonly keywords = ['grocery', 'groceries', 'vegetables', 'fruits', 'milk', 'bread', 'quick delivery', 'blinkit', 'instant'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@blinkit\s*/i, '').replace(/^blinkit[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['order', 'buy', 'get', 'need'])) {
      return this.handleOrder(cleanText);
    }

    if (this.matchesIntent(cleanText, ['search', 'find', 'show'])) {
      return this.handleSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['cart', 'my cart'])) {
      return this.handleCart();
    }

    if (this.matchesIntent(cleanText, ['track', 'status', 'where'])) {
      return this.handleTracking();
    }

    if (this.matchesIntent(cleanText, ['categories', 'browse'])) {
      return this.handleCategories();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `🛵 *Blinkit Agent*

I can help you order groceries delivered in minutes!

*Commands:*
• \`order [item]\` - Quick order items
• \`search [product]\` - Find products
• \`cart\` - View your cart
• \`track\` - Track your delivery

_Note: This is a demo. Real orders are not placed._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handleOrder(text: string): AgentResponse {
    const item = text.replace(/order|buy|get|need/gi, '').trim() || 'groceries';

    return {
      text: `🛵 *Quick Order*

Looking for: *${item}*

⏱️ Delivery in *10-15 minutes*

*Popular items:*
🥛 Amul Toned Milk 1L - ₹66
🍞 Britannia Bread - ₹45
🥚 Eggs (12 pack) - ₹84
🧈 Amul Butter 100g - ₹56

_(Demo mode - no real order)_`,
      list: {
        buttonText: 'Add Items',
        sections: [{
          title: 'Quick Add',
          rows: [
            { id: 'item_milk', title: '🥛 Milk 1L', description: '₹66 | Amul Toned' },
            { id: 'item_bread', title: '🍞 Bread', description: '₹45 | Britannia' },
            { id: 'item_eggs', title: '🥚 Eggs 12pc', description: '₹84 | Farm Fresh' },
            { id: 'item_butter', title: '🧈 Butter 100g', description: '₹56 | Amul' },
          ],
        }],
      },
    };
  }

  private handleSearch(text: string): AgentResponse {
    const searchTerm = text.replace(/search|find|show/gi, '').trim() || 'products';

    return {
      text: `🔍 *Results for "${searchTerm}"*

1. *Amul Taaza Milk 1L*
   ₹29 | ⏱️ 8 min delivery
   
2. *Mother Dairy Full Cream 1L*
   ₹68 | ⏱️ 10 min delivery

3. *Nestle a+ Slim Milk 1L*
   ₹55 | ⏱️ 12 min delivery

_(Demo mode - sample products)_`,
      buttons: [
        { id: 'add_all', title: '➕ Add All' },
        { id: 'filter', title: '🔍 Filter' },
      ],
    };
  }

  private handleCart(): AgentResponse {
    return {
      text: `🛒 *Your Cart*

1. 🥛 Amul Milk 1L x2 = ₹132
2. 🍞 Bread x1 = ₹45
3. 🥚 Eggs 12pc x1 = ₹84

───────────────
📦 Items: 4
💰 Subtotal: ₹261
🚚 Delivery: FREE
───────────────
💵 *Total: ₹261*

⏱️ *Delivery in 12 minutes*

_(Demo mode - sample cart)_`,
      buttons: [
        { id: 'place_order', title: '✅ Place Order' },
        { id: 'add_more', title: '➕ Add More' },
        { id: 'clear_cart', title: '🗑️ Clear' },
      ],
    };
  }

  private handleTracking(): AgentResponse {
    return {
      text: `📍 *Order Tracking*

Order #BL98765432

🟢 *On the way!*

👤 Delivery Partner: Ravi
📞 +91 98xxx xxxxx

⏱️ Arriving in *5 minutes*

🛵 → → → 📍 Your Location

_Your groceries are almost there!_
_(Demo mode)_`,
      buttons: [
        { id: 'call_delivery', title: '📞 Call' },
        { id: 'share_location', title: '📍 Share Location' },
      ],
    };
  }

  private handleCategories(): AgentResponse {
    return {
      text: `📋 *Shop by Category*

Browse our wide selection:`,
      list: {
        buttonText: 'Browse Categories',
        sections: [{
          title: 'Categories',
          rows: [
            { id: 'cat_dairy', title: '🥛 Dairy & Eggs', description: 'Milk, curd, paneer, eggs' },
            { id: 'cat_fruits', title: '🍎 Fruits & Vegetables', description: 'Fresh produce daily' },
            { id: 'cat_snacks', title: '🍿 Snacks', description: 'Chips, biscuits, namkeen' },
            { id: 'cat_beverages', title: '🥤 Beverages', description: 'Juices, soft drinks' },
            { id: 'cat_household', title: '🧹 Household', description: 'Cleaning supplies' },
          ],
        }],
      },
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `🛵 *Blinkit - Delivery in Minutes*

What would you like to order?

• 🛒 *Order* - Quick order groceries
• 🔍 *Search* - Find products
• 📋 *Browse* - Shop by category
• 📍 *Track* - Track your delivery

Tell me what you need!`,
      buttons: [
        { id: 'quick_order', title: '🛒 Quick Order' },
        { id: 'browse', title: '📋 Categories' },
        { id: 'track', title: '📍 Track Order' },
      ],
    };
  }
}

export function createBlinkitAgent(): Agent {
  return new BlinkitAgent();
}

import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class FlipkartAgent implements Agent {
  readonly id = 'flipkart';
  readonly name = 'Flipkart';
  readonly icon = '🛒';
  readonly description = 'Shop for products online';
  readonly keywords = ['shop', 'buy', 'shopping', 'product', 'order', 'flipkart', 'electronics', 'fashion', 'mobile', 'laptop'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@flipkart\s*/i, '').replace(/^flipkart[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['search', 'find', 'show', 'looking for'])) {
      return this.handleSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['cart', 'my cart', 'checkout'])) {
      return this.handleCart();
    }

    if (this.matchesIntent(cleanText, ['orders', 'my orders', 'track', 'status'])) {
      return this.handleOrders();
    }

    if (this.matchesIntent(cleanText, ['deals', 'offers', 'sale', 'discount'])) {
      return this.handleDeals();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `🛒 *Flipkart Agent*

I can help you shop online!

*Commands:*
• \`search [product]\` - Find products
• \`cart\` - View your cart
• \`orders\` - Track your orders
• \`deals\` - View current offers

_Note: This is a demo. Real orders are not placed._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handleSearch(text: string): AgentResponse {
    const searchTerm = text.replace(/search|find|show|looking for/gi, '').trim() || 'products';

    return {
      text: `🔍 *Search Results for "${searchTerm}"*

1. *iPhone 15 Pro Max 256GB*
   ₹1,34,900 ~~₹1,49,900~~ (10% off)
   ⭐ 4.6 | Free Delivery

2. *Samsung Galaxy S24 Ultra*
   ₹1,29,999 ~~₹1,34,999~~ (4% off)
   ⭐ 4.5 | Free Delivery

3. *OnePlus 12 256GB*
   ₹64,999 ~~₹69,999~~ (7% off)
   ⭐ 4.4 | Free Delivery

_(Demo mode - sample products)_`,
      list: {
        buttonText: 'View Products',
        sections: [{
          title: 'Top Results',
          rows: [
            { id: 'product_1', title: 'iPhone 15 Pro Max', description: '₹1,34,900 | ⭐ 4.6' },
            { id: 'product_2', title: 'Samsung Galaxy S24', description: '₹1,29,999 | ⭐ 4.5' },
            { id: 'product_3', title: 'OnePlus 12', description: '₹64,999 | ⭐ 4.4' },
          ],
        }],
      },
    };
  }

  private handleCart(): AgentResponse {
    return {
      text: `🛒 *Your Cart*

1. *Boat Rockerz 450* x1
   ₹1,499

2. *USB-C Cable 2m* x2
   ₹399 each = ₹798

───────────────
📦 Items: 3
💰 *Total: ₹2,297*
🚚 Delivery: FREE

_(Demo mode - sample cart)_`,
      buttons: [
        { id: 'checkout', title: '💳 Checkout' },
        { id: 'continue_shopping', title: '🛍️ Continue' },
        { id: 'clear_cart', title: '🗑️ Clear Cart' },
      ],
    };
  }

  private handleOrders(): AgentResponse {
    return {
      text: `📦 *Your Orders*

1. *Order #FK789456123*
   iPhone Case - ₹599
   🚚 *Out for Delivery*
   Expected: Today by 6 PM

2. *Order #FK789456100*
   Wireless Mouse - ₹899
   ✅ *Delivered*
   Sep 18, 2024

3. *Order #FK789455999*
   Book Set - ₹1,299
   ✅ *Delivered*
   Sep 10, 2024

_(Demo mode - sample orders)_`,
      buttons: [
        { id: 'track_order_1', title: '📍 Track Order' },
        { id: 'order_help', title: '❓ Need Help' },
      ],
    };
  }

  private handleDeals(): AgentResponse {
    return {
      text: `🔥 *Today's Deals*

⚡ *Flash Sale - Ends in 2h 30m*

📱 *Mobiles*
Up to 40% off on smartphones

💻 *Electronics*
Laptops starting ₹29,999

👕 *Fashion*
Min 50% off on top brands

🏠 *Home & Kitchen*
Up to 70% off

_(Demo mode - sample deals)_`,
      list: {
        buttonText: 'Browse Deals',
        sections: [{
          title: 'Categories',
          rows: [
            { id: 'deal_mobiles', title: '📱 Mobiles', description: 'Up to 40% off' },
            { id: 'deal_electronics', title: '💻 Electronics', description: 'Starting ₹29,999' },
            { id: 'deal_fashion', title: '👕 Fashion', description: 'Min 50% off' },
            { id: 'deal_home', title: '🏠 Home', description: 'Up to 70% off' },
          ],
        }],
      },
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `What would you like to shop for?

• 🔍 *Search* - Find products
• 🛒 *Cart* - View your cart
• 📦 *Orders* - Track orders
• 🔥 *Deals* - Today's offers

Tell me what you're looking for!`,
      buttons: [
        { id: 'search_products', title: '🔍 Search' },
        { id: 'view_cart', title: '🛒 My Cart' },
        { id: 'view_deals', title: '🔥 Deals' },
      ],
    };
  }
}

export function createFlipkartAgent(): Agent {
  return new FlipkartAgent();
}

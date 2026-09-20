import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class AirtelAgent implements Agent {
  readonly id = 'airtel';
  readonly name = 'Airtel';
  readonly icon = '📱';
  readonly description = 'Mobile recharge, bill payments, and plans';
  readonly keywords = ['recharge', 'airtel', 'mobile', 'prepaid', 'postpaid', 'data', 'plan', 'bill', 'broadband', 'dth'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@airtel\s*/i, '').replace(/^airtel[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['recharge', 'topup', 'prepaid'])) {
      return this.handleRecharge(cleanText);
    }

    if (this.matchesIntent(cleanText, ['bill', 'postpaid', 'pay bill'])) {
      return this.handleBillPayment();
    }

    if (this.matchesIntent(cleanText, ['plan', 'plans', 'offer', 'data pack'])) {
      return this.handlePlans();
    }

    if (this.matchesIntent(cleanText, ['balance', 'usage', 'data left'])) {
      return this.handleBalance();
    }

    if (this.matchesIntent(cleanText, ['broadband', 'fiber', 'wifi'])) {
      return this.handleBroadband();
    }

    if (this.matchesIntent(cleanText, ['dth', 'tv', 'digital tv'])) {
      return this.handleDTH();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `📱 *Airtel Agent*

I can help you with mobile recharges and bill payments!

*Commands:*
• \`recharge [amount]\` - Mobile recharge
• \`bill\` - Pay postpaid bill
• \`plans\` - View available plans
• \`balance\` - Check balance/usage
• \`broadband\` - Fiber internet
• \`dth\` - TV recharge

_Note: This is a demo. Real transactions are not processed._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handleRecharge(text: string): AgentResponse {
    const amountMatch = text.match(/(\d+)/);
    const amount = amountMatch ? amountMatch[1] : '299';

    return {
      text: `📱 *Mobile Recharge*

📞 Number: +91 98765 43210
💰 Amount: ₹${amount}

*Popular Plans:*

1. *₹299* - 28 Days
   2GB/day + Unlimited Calls
   ⭐ Best Seller

2. *₹479* - 56 Days
   1.5GB/day + Unlimited Calls
   💰 Best Value

3. *₹719* - 84 Days
   2GB/day + Unlimited Calls
   📅 Long Validity

_(Demo mode - no real recharge)_`,
      list: {
        buttonText: 'Select Plan',
        sections: [{
          title: 'Recharge Plans',
          rows: [
            { id: 'plan_299', title: '₹299 | 28 Days', description: '2GB/day | Unlimited Calls' },
            { id: 'plan_479', title: '₹479 | 56 Days', description: '1.5GB/day | Unlimited Calls' },
            { id: 'plan_719', title: '₹719 | 84 Days', description: '2GB/day | Unlimited Calls' },
          ],
        }],
      },
    };
  }

  private handleBillPayment(): AgentResponse {
    return {
      text: `📄 *Postpaid Bill*

📞 Number: +91 98765 43210
📅 Bill Date: Sep 15, 2024

*Bill Summary:*
───────────────
Monthly Charges: ₹499
Data Add-on: ₹149
Taxes: ₹117
───────────────
💰 *Total Due: ₹765*

📅 Due Date: Sep 25, 2024

_(Demo mode - no real payment)_`,
      buttons: [
        { id: 'pay_now', title: '💳 Pay Now' },
        { id: 'view_details', title: '📄 View Details' },
        { id: 'autopay', title: '🔄 Setup Autopay' },
      ],
    };
  }

  private handlePlans(): AgentResponse {
    return {
      text: `📋 *Airtel Plans*

*Prepaid Plans:*

🔥 *Unlimited Plans*
• ₹299 - 2GB/day, 28 days
• ₹479 - 1.5GB/day, 56 days
• ₹719 - 2GB/day, 84 days

📊 *Data Add-ons*
• ₹19 - 1GB (1 day)
• ₹98 - 6GB (28 days)
• ₹251 - 50GB (28 days)

📞 *Talktime*
• ₹100 - ₹81.75 Talktime
• ₹500 - ₹423.73 Talktime

_(Demo mode - sample plans)_`,
      list: {
        buttonText: 'View All Plans',
        sections: [
          {
            title: 'Unlimited',
            rows: [
              { id: 'plan_u1', title: '₹299 | 28 Days', description: '2GB/day + Unlimited Calls' },
              { id: 'plan_u2', title: '₹479 | 56 Days', description: '1.5GB/day + Unlimited Calls' },
            ],
          },
          {
            title: 'Data Add-ons',
            rows: [
              { id: 'plan_d1', title: '₹19 | 1GB', description: '1 Day validity' },
              { id: 'plan_d2', title: '₹251 | 50GB', description: '28 Days validity' },
            ],
          },
        ],
      },
    };
  }

  private handleBalance(): AgentResponse {
    return {
      text: `📊 *Balance & Usage*

📞 +91 98765 43210

*Current Plan:* ₹299 Unlimited
📅 Valid till: Oct 15, 2024

*Data Usage:*
📊 Used: 12.5 GB / 56 GB
▓▓▓▓░░░░░░ 22%
🗓️ Resets: Tomorrow

*Calls:* Unlimited ✅
*SMS:* 89/100 used

_(Demo mode - sample data)_`,
      buttons: [
        { id: 'buy_data', title: '📊 Buy More Data' },
        { id: 'view_history', title: '📋 Usage History' },
        { id: 'recharge_now', title: '🔄 Recharge' },
      ],
    };
  }

  private handleBroadband(): AgentResponse {
    return {
      text: `🌐 *Airtel Xstream Fiber*

*Your Connection:*
📍 Plan: 100 Mbps Unlimited
📅 Bill Date: 25th of month

*Current Bill:*
💰 ₹849/month (incl. taxes)

*Popular Upgrades:*
• 200 Mbps - ₹1,099/month
• 300 Mbps - ₹1,499/month
• 1 Gbps - ₹3,999/month

_(Demo mode - sample data)_`,
      buttons: [
        { id: 'pay_broadband', title: '💳 Pay Bill' },
        { id: 'upgrade_plan', title: '⬆️ Upgrade' },
        { id: 'speed_test', title: '🚀 Speed Test' },
      ],
    };
  }

  private handleDTH(): AgentResponse {
    return {
      text: `📺 *Airtel Digital TV*

*Your Account:*
🆔 Customer ID: 12345678
📅 Balance: ₹245

*Quick Recharge:*
• ₹220 - 1 Month Base
• ₹600 - 3 Months Base
• ₹1,100 - 6 Months Base

*Add-on Packs:*
• Sports: ₹59/month
• Movies: ₹49/month
• Kids: ₹35/month

_(Demo mode - no real recharge)_`,
      buttons: [
        { id: 'recharge_dth', title: '📺 Recharge' },
        { id: 'add_channels', title: '➕ Add Channels' },
        { id: 'view_packages', title: '📋 Packages' },
      ],
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `📱 *Airtel*

How can I help you?

• 📱 *Recharge* - Mobile prepaid
• 📄 *Bill* - Postpaid payment
• 📋 *Plans* - View all plans
• 📊 *Balance* - Check usage
• 🌐 *Broadband* - Fiber internet
• 📺 *DTH* - TV recharge

What would you like to do?`,
      buttons: [
        { id: 'mobile_recharge', title: '📱 Recharge' },
        { id: 'pay_bill', title: '📄 Pay Bill' },
        { id: 'check_balance', title: '📊 Balance' },
      ],
    };
  }
}

export function createAirtelAgent(): Agent {
  return new AirtelAgent();
}

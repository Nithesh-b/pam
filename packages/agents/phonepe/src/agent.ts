import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class PhonePeAgent implements Agent {
  readonly id = 'phonepe';
  readonly name = 'PhonePe';
  readonly icon = '💳';
  readonly description = 'UPI payments and money transfers';
  readonly keywords = ['pay', 'payment', 'upi', 'transfer', 'send money', 'money', 'balance', 'transaction', 'bill'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@phonepe\s*/i, '').replace(/^phonepe[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['pay', 'send', 'transfer'])) {
      return this.handlePayment(cleanText);
    }

    if (this.matchesIntent(cleanText, ['balance', 'check balance'])) {
      return this.handleBalance();
    }

    if (this.matchesIntent(cleanText, ['history', 'transactions', 'recent'])) {
      return this.handleHistory();
    }

    if (this.matchesIntent(cleanText, ['bill', 'recharge', 'electricity', 'mobile'])) {
      return this.handleBills();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `💳 *PhonePe Agent*

I can help you with UPI payments and transfers!

*Commands:*
• \`pay [amount] to [name/number]\` - Send money
• \`balance\` - Check account balance
• \`history\` - View recent transactions
• \`bill\` - Pay bills

_Note: This is a demo. Real payments are not processed._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handlePayment(text: string): AgentResponse {
    const amountMatch = text.match(/(\d+)/);
    const amount = amountMatch ? amountMatch[1] : '500';

    return {
      text: `💳 *Send Money*

💰 Amount: ₹${amount}
📱 To: Enter UPI ID or phone number

*Quick Actions:*
Send to recent contacts or enter new details.

_(Demo mode - no real payment)_`,
      buttons: [
        { id: 'pay_recent_1', title: '👤 Rahul - ₹500' },
        { id: 'pay_recent_2', title: '👤 Priya - ₹1000' },
        { id: 'pay_new', title: '➕ New Payment' },
      ],
    };
  }

  private handleBalance(): AgentResponse {
    return {
      text: `💰 *Account Balance*

🏦 *HDFC Bank ****4521*
Available: ₹24,567.89

🏦 *SBI ****8876*
Available: ₹12,340.00

💳 *PhonePe Wallet*
Balance: ₹890.50

_Last updated: Just now_
_(Demo mode - sample data)_`,
      buttons: [
        { id: 'refresh_balance', title: '🔄 Refresh' },
        { id: 'add_money', title: '➕ Add Money' },
      ],
    };
  }

  private handleHistory(): AgentResponse {
    return {
      text: `📋 *Recent Transactions*

1. ⬆️ *Sent* ₹500 to Rahul
   Today, 2:30 PM | UPI

2. ⬇️ *Received* ₹1,200 from Mom
   Yesterday | UPI

3. ⬆️ *Paid* ₹299 to Netflix
   Sep 18 | Bill Payment

4. ⬆️ *Sent* ₹2,000 to Priya
   Sep 15 | UPI

_(Demo mode - sample data)_`,
      buttons: [
        { id: 'download_statement', title: '📄 Statement' },
        { id: 'filter_transactions', title: '🔍 Filter' },
      ],
    };
  }

  private handleBills(): AgentResponse {
    return {
      text: `📄 *Pay Bills*

Select a bill category:

⚡ *Electricity* - Pending: ₹1,250
📱 *Mobile Recharge* - Airtel, Jio, Vi
🏠 *Broadband* - Due: Sep 25
💧 *Water* - No pending
📺 *DTH* - Tata Play, Airtel

_(Demo mode - no real payment)_`,
      list: {
        buttonText: 'Select Bill',
        sections: [{
          title: 'Bill Categories',
          rows: [
            { id: 'bill_electricity', title: '⚡ Electricity', description: 'BESCOM, TPDDL, etc.' },
            { id: 'bill_mobile', title: '📱 Mobile Recharge', description: 'Prepaid & Postpaid' },
            { id: 'bill_broadband', title: '🌐 Broadband', description: 'Internet bills' },
            { id: 'bill_dth', title: '📺 DTH', description: 'TV recharge' },
          ],
        }],
      },
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `What would you like to do?

• 💸 *Pay* - Send money via UPI
• 💰 *Balance* - Check account balance
• 📋 *History* - View transactions
• 📄 *Bills* - Pay utility bills

Just tell me what you need!`,
      buttons: [
        { id: 'send_money', title: '💸 Send Money' },
        { id: 'check_balance', title: '💰 Balance' },
        { id: 'pay_bills', title: '📄 Pay Bills' },
      ],
    };
  }
}

export function createPhonePeAgent(): Agent {
  return new PhonePeAgent();
}

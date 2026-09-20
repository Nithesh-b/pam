import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class TruecallerAgent implements Agent {
  readonly id = 'truecaller';
  readonly name = 'Truecaller';
  readonly icon = '📞';
  readonly description = 'Caller ID, spam detection, and number lookup';
  readonly keywords = ['call', 'caller', 'number', 'phone', 'spam', 'who called', 'lookup', 'block', 'truecaller'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@truecaller\s*/i, '').replace(/^truecaller[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['lookup', 'search', 'who is', 'find', 'check'])) {
      return this.handleLookup(cleanText);
    }

    if (this.matchesIntent(cleanText, ['spam', 'report', 'block'])) {
      return this.handleSpamReport(cleanText);
    }

    if (this.matchesIntent(cleanText, ['recent', 'calls', 'history', 'missed'])) {
      return this.handleCallHistory();
    }

    if (this.matchesIntent(cleanText, ['blocked', 'block list'])) {
      return this.handleBlockedList();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `📞 *Truecaller Agent*

I can help identify callers and block spam!

*Commands:*
• \`lookup [number]\` - Identify a number
• \`spam [number]\` - Report spam
• \`recent\` - View recent calls
• \`blocked\` - View blocked numbers

_Note: This is a demo. Real lookups are simulated._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handleLookup(text: string): AgentResponse {
    const numberMatch = text.match(/(\+?\d[\d\s-]{8,})/);
    const number = numberMatch ? numberMatch[1].replace(/[\s-]/g, '') : '+91 98765 43210';

    return {
      text: `🔍 *Number Lookup*

📱 *${number}*

👤 *Rajesh Kumar*
🏢 HDFC Bank - Sales
📍 Mumbai, Maharashtra

🛡️ *Spam Score: Low*
✅ Verified Business

📊 *Community Reports:*
• 89% identified as Bank
• 2,456 searches
• Marked spam by 12 users

_(Demo mode - simulated data)_`,
      buttons: [
        { id: 'save_contact', title: '💾 Save Contact' },
        { id: 'report_spam', title: '🚫 Report Spam' },
        { id: 'block_number', title: '🔒 Block' },
      ],
    };
  }

  private handleSpamReport(text: string): AgentResponse {
    const numberMatch = text.match(/(\+?\d[\d\s-]{8,})/);
    const number = numberMatch ? numberMatch[1] : 'the number';

    return {
      text: `🚫 *Report Spam*

Number: *${number}*

What type of spam is this?`,
      list: {
        buttonText: 'Select Type',
        sections: [{
          title: 'Spam Categories',
          rows: [
            { id: 'spam_telemarketing', title: '📢 Telemarketing', description: 'Sales or promotional calls' },
            { id: 'spam_scam', title: '⚠️ Scam', description: 'Fraud or scam attempt' },
            { id: 'spam_robocall', title: '🤖 Robocall', description: 'Automated recorded message' },
            { id: 'spam_other', title: '❓ Other', description: 'Other unwanted calls' },
          ],
        }],
      },
    };
  }

  private handleCallHistory(): AgentResponse {
    return {
      text: `📋 *Recent Calls*

1. 📞 *Missed* - +91 98765 43210
   👤 Unknown | 🕐 10 min ago
   ⚠️ *Likely Spam*

2. 📞 *Incoming* - Mom
   ✅ Known | 🕐 1 hour ago

3. 📞 *Outgoing* - Swiggy Support
   🏢 Business | 🕐 2 hours ago

4. 📞 *Missed* - +91 88888 55555
   🚫 *Spam* | 🕐 Yesterday

_(Demo mode - sample calls)_`,
      buttons: [
        { id: 'lookup_spam', title: '🔍 Lookup Spam' },
        { id: 'block_all_spam', title: '🚫 Block All Spam' },
      ],
    };
  }

  private handleBlockedList(): AgentResponse {
    return {
      text: `🔒 *Blocked Numbers*

1. +91 88888 55555
   🚫 Spam | Blocked Sep 18

2. +91 77777 44444
   🚫 Telemarketer | Blocked Sep 15

3. +91 66666 33333
   🚫 Scam | Blocked Sep 10

*Stats:*
📊 Total blocked: 23 numbers
🛡️ Calls blocked this month: 47

_(Demo mode - sample data)_`,
      buttons: [
        { id: 'unblock_recent', title: '🔓 Unblock' },
        { id: 'clear_all', title: '🗑️ Clear All' },
      ],
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `📞 *Truecaller*

How can I help you?

• 🔍 *Lookup* - Identify unknown numbers
• 🚫 *Report* - Report spam calls
• 📋 *Recent* - View call history
• 🔒 *Blocked* - Manage blocked list

Send me a number to look up!`,
      buttons: [
        { id: 'lookup_number', title: '🔍 Lookup Number' },
        { id: 'recent_calls', title: '📋 Recent Calls' },
        { id: 'blocked_list', title: '🔒 Blocked' },
      ],
    };
  }
}

export function createTruecallerAgent(): Agent {
  return new TruecallerAgent();
}

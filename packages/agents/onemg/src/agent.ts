import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class OneMgAgent implements Agent {
  readonly id = 'onemg';
  readonly name = '1mg';
  readonly icon = '💊';
  readonly description = 'Order medicines and healthcare products';
  readonly keywords = ['medicine', 'medicines', 'pharmacy', 'health', 'tablet', 'prescription', 'doctor', 'lab test', '1mg'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@1mg\s*/i, '').replace(/@onemg\s*/i, '').replace(/^1mg[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['search', 'find', 'order', 'buy', 'need'])) {
      return this.handleSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['prescription', 'upload', 'rx'])) {
      return this.handlePrescription();
    }

    if (this.matchesIntent(cleanText, ['lab', 'test', 'blood test', 'checkup'])) {
      return this.handleLabTests();
    }

    if (this.matchesIntent(cleanText, ['consult', 'doctor', 'appointment'])) {
      return this.handleConsultation();
    }

    if (this.matchesIntent(cleanText, ['orders', 'my orders', 'track'])) {
      return this.handleOrders();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `💊 *1mg Agent*

I can help you order medicines and book health services!

*Commands:*
• \`search [medicine]\` - Find medicines
• \`prescription\` - Upload prescription
• \`lab test\` - Book lab tests
• \`consult\` - Doctor consultation
• \`orders\` - Track your orders

_Note: This is a demo. Real orders are not placed._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handleSearch(text: string): AgentResponse {
    const searchTerm = text.replace(/search|find|order|buy|need/gi, '').trim() || 'medicines';

    return {
      text: `🔍 *Search Results for "${searchTerm}"*

1. *Dolo 650mg* (Paracetamol)
   Strip of 15 tablets
   💰 ₹30 ~~₹32~~ (6% off)
   ✅ In Stock

2. *Crocin Advance 500mg*
   Strip of 20 tablets
   💰 ₹45 ~~₹48~~ (6% off)
   ✅ In Stock

3. *Combiflam Tablet*
   Strip of 20 tablets
   💰 ₹42 ~~₹45~~ (7% off)
   ✅ In Stock

⚠️ _Some medicines require prescription_
_(Demo mode - sample products)_`,
      list: {
        buttonText: 'View Medicines',
        sections: [{
          title: 'Results',
          rows: [
            { id: 'med_1', title: 'Dolo 650mg', description: '₹30 | Paracetamol | In Stock' },
            { id: 'med_2', title: 'Crocin Advance', description: '₹45 | Paracetamol | In Stock' },
            { id: 'med_3', title: 'Combiflam', description: '₹42 | Pain Relief | In Stock' },
          ],
        }],
      },
    };
  }

  private handlePrescription(): AgentResponse {
    return {
      text: `📋 *Upload Prescription*

Upload your prescription to order medicines that require Rx.

*How it works:*
1. 📸 Upload a clear photo of prescription
2. 🔍 Our pharmacist will verify
3. ✅ Medicines added to cart
4. 🚚 Delivered to your door

*Accepted formats:*
• Image (JPG, PNG)
• PDF

_(Demo mode - upload simulation)_`,
      buttons: [
        { id: 'upload_photo', title: '📸 Upload Photo' },
        { id: 'upload_pdf', title: '📄 Upload PDF' },
        { id: 'past_prescriptions', title: '📋 Past Rx' },
      ],
    };
  }

  private handleLabTests(): AgentResponse {
    return {
      text: `🔬 *Lab Tests*

*Popular Health Packages:*

1. *Full Body Checkup*
   70+ tests | Fasting required
   💰 ₹1,499 ~~₹2,999~~ (50% off)

2. *Diabetes Screening*
   HbA1c, FBS, PPBS + more
   💰 ₹599 ~~₹1,200~~ (50% off)

3. *Thyroid Profile*
   T3, T4, TSH
   💰 ₹399 ~~₹800~~ (50% off)

🏠 *Home sample collection available*

_(Demo mode - sample tests)_`,
      list: {
        buttonText: 'View Tests',
        sections: [{
          title: 'Health Packages',
          rows: [
            { id: 'test_full', title: 'Full Body Checkup', description: '₹1,499 | 70+ tests' },
            { id: 'test_diabetes', title: 'Diabetes Screening', description: '₹599 | Sugar tests' },
            { id: 'test_thyroid', title: 'Thyroid Profile', description: '₹399 | T3, T4, TSH' },
          ],
        }],
      },
    };
  }

  private handleConsultation(): AgentResponse {
    return {
      text: `👨‍⚕️ *Doctor Consultation*

*Consult online with verified doctors*

🩺 *General Physician*
Available now | ₹199
For fever, cold, cough, etc.

🧠 *Dermatologist*
Available in 15 min | ₹349
Skin, hair, nail issues

💊 *Gynecologist*
Available now | ₹299
Women's health

🔒 *100% Private & Secure*

_(Demo mode - sample doctors)_`,
      buttons: [
        { id: 'consult_gp', title: '🩺 General Physician' },
        { id: 'consult_derma', title: '🧴 Dermatologist' },
        { id: 'view_all_doctors', title: '👨‍⚕️ All Specialists' },
      ],
    };
  }

  private handleOrders(): AgentResponse {
    return {
      text: `📦 *My Orders*

*Active Orders:*

1. Order #1MG456789
   🕐 Arriving Today by 6 PM
   • Dolo 650mg x2
   • Vitamin D3 x1
   💰 ₹185

*Past Orders:*

2. Order #1MG456700
   ✅ Delivered Sep 15
   • Crocin Advance
   💰 ₹45

_(Demo mode - sample orders)_`,
      buttons: [
        { id: 'track_order', title: '📍 Track Order' },
        { id: 'reorder', title: '🔄 Reorder' },
        { id: 'order_help', title: '❓ Help' },
      ],
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `💊 *1mg*

How can I help with your health needs?

• 🔍 *Search* - Find medicines
• 📋 *Prescription* - Upload Rx
• 🔬 *Lab Tests* - Book tests
• 👨‍⚕️ *Consult* - Talk to a doctor
• 📦 *Orders* - Track orders

Tell me what you need!`,
      buttons: [
        { id: 'search_medicine', title: '🔍 Search Medicine' },
        { id: 'book_lab_test', title: '🔬 Lab Tests' },
        { id: 'consult_doctor', title: '👨‍⚕️ Consult Doctor' },
      ],
    };
  }
}

export function createOneMgAgent(): Agent {
  return new OneMgAgent();
}

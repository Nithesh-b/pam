import type { Agent, MessageContext, AgentResponse } from '@pam/core';

export class MakeMyTripAgent implements Agent {
  readonly id = 'makemytrip';
  readonly name = 'MakeMyTrip';
  readonly icon = '✈️';
  readonly description = 'Book flights, hotels, and travel packages';
  readonly keywords = ['flight', 'flights', 'hotel', 'hotels', 'travel', 'trip', 'book', 'vacation', 'train', 'bus'];

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();
    const cleanText = text.replace(/@makemytrip\s*/i, '').replace(/^makemytrip[:\s]+/i, '').trim();

    if (this.matchesIntent(cleanText, ['flight', 'flights', 'fly'])) {
      return this.handleFlightSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['hotel', 'hotels', 'stay', 'room'])) {
      return this.handleHotelSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['train', 'railway'])) {
      return this.handleTrainSearch(cleanText);
    }

    if (this.matchesIntent(cleanText, ['my trips', 'bookings', 'upcoming'])) {
      return this.handleMyTrips();
    }

    if (this.matchesIntent(cleanText, ['deals', 'offers', 'discount'])) {
      return this.handleDeals();
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `✈️ *MakeMyTrip Agent*

I can help you plan and book your travel!

*Commands:*
• \`flights [from] to [to]\` - Search flights
• \`hotels [city]\` - Search hotels
• \`trains [from] to [to]\` - Search trains
• \`my trips\` - View your bookings
• \`deals\` - Travel offers

_Note: This is a demo. Real bookings are not made._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private handleFlightSearch(text: string): AgentResponse {
    const toMatch = text.match(/to\s+(\w+)/i);
    const fromMatch = text.match(/from\s+(\w+)/i);
    const destination = toMatch ? toMatch[1] : 'Goa';
    const origin = fromMatch ? fromMatch[1] : 'Delhi';

    return {
      text: `✈️ *Flight Search*

📍 ${origin} → ${destination}
📅 Tomorrow | 1 Adult

*Available Flights:*

1. *IndiGo 6E-2145*
   06:00 → 08:30 | 2h 30m
   💰 ₹4,567 | Non-stop

2. *Air India AI-865*
   09:15 → 11:50 | 2h 35m
   💰 ₹5,234 | Non-stop

3. *SpiceJet SG-422*
   14:30 → 17:15 | 2h 45m
   💰 ₹3,899 | Non-stop

_(Demo mode - sample flights)_`,
      list: {
        buttonText: 'View Flights',
        sections: [{
          title: 'Flights',
          rows: [
            { id: 'flight_1', title: '6E-2145 | ₹4,567', description: '06:00-08:30 | IndiGo | Non-stop' },
            { id: 'flight_2', title: 'AI-865 | ₹5,234', description: '09:15-11:50 | Air India | Non-stop' },
            { id: 'flight_3', title: 'SG-422 | ₹3,899', description: '14:30-17:15 | SpiceJet | Non-stop' },
          ],
        }],
      },
    };
  }

  private handleHotelSearch(text: string): AgentResponse {
    const cityMatch = text.match(/in\s+(\w+)/i) || text.match(/(\w+)\s+hotel/i);
    const city = cityMatch ? cityMatch[1] : 'Goa';

    return {
      text: `🏨 *Hotels in ${city}*

📅 Check-in: Tomorrow
📅 Check-out: Day after | 1 Room

*Top Hotels:*

1. *Taj Fort Aguada* ⭐⭐⭐⭐⭐
   Candolim Beach | ₹12,500/night
   ⭐ 4.8 | Free Breakfast

2. *Novotel Goa* ⭐⭐⭐⭐
   Dona Paula | ₹7,200/night
   ⭐ 4.5 | Pool, Spa

3. *Treebo Jesant Valley* ⭐⭐⭐
   Vagator | ₹2,800/night
   ⭐ 4.2 | Free WiFi

_(Demo mode - sample hotels)_`,
      list: {
        buttonText: 'View Hotels',
        sections: [{
          title: 'Hotels',
          rows: [
            { id: 'hotel_1', title: 'Taj Fort Aguada', description: '₹12,500/night | ⭐ 4.8' },
            { id: 'hotel_2', title: 'Novotel Goa', description: '₹7,200/night | ⭐ 4.5' },
            { id: 'hotel_3', title: 'Treebo Jesant Valley', description: '₹2,800/night | ⭐ 4.2' },
          ],
        }],
      },
    };
  }

  private handleTrainSearch(_text: string): AgentResponse {
    return {
      text: `🚂 *Train Search*

📍 Delhi → Mumbai
📅 Tomorrow

*Available Trains:*

1. *Rajdhani Express (12951)*
   16:55 → 08:35+1 | 15h 40m
   💰 3AC: ₹2,180 | 2AC: ₹3,125

2. *Duronto Express (12261)*
   23:00 → 14:40+1 | 15h 40m
   💰 3AC: ₹1,955 | 2AC: ₹2,825

3. *August Kranti (12953)*
   17:40 → 11:05+1 | 17h 25m
   💰 SL: ₹705 | 3AC: ₹1,875

_(Demo mode - sample trains)_`,
      buttons: [
        { id: 'book_rajdhani', title: '🚂 Book Rajdhani' },
        { id: 'change_date', title: '📅 Change Date' },
        { id: 'check_availability', title: '✅ Availability' },
      ],
    };
  }

  private handleMyTrips(): AgentResponse {
    return {
      text: `📋 *My Trips*

*Upcoming:*

1. ✈️ *Delhi → Goa*
   Oct 15, 2024 | IndiGo 6E-2145
   PNR: ABC123 | Confirmed ✅

2. 🏨 *Taj Fort Aguada, Goa*
   Oct 15-18, 2024 | 3 Nights
   Booking ID: MMT789456

*Past Trips:*

3. ✈️ *Mumbai → Bangalore*
   Sep 5, 2024 | Completed

_(Demo mode - sample trips)_`,
      buttons: [
        { id: 'view_details', title: '📄 View Details' },
        { id: 'download_ticket', title: '🎫 Download' },
        { id: 'cancel_trip', title: '❌ Cancel' },
      ],
    };
  }

  private handleDeals(): AgentResponse {
    return {
      text: `🔥 *Travel Deals*

*Flash Sale - Ends in 4h!*

✈️ *Domestic Flights*
Flat ₹1,500 off | Code: FLYFAST

🏨 *Hotels*
Up to 40% off on 4-5 star hotels

🌴 *Holiday Packages*
Goa 3N/4D from ₹9,999

🚂 *Trains*
Free cancellation on select routes

_(Demo mode - sample deals)_`,
      buttons: [
        { id: 'flight_deals', title: '✈️ Flight Deals' },
        { id: 'hotel_deals', title: '🏨 Hotel Deals' },
        { id: 'packages', title: '🌴 Packages' },
      ],
    };
  }

  private showOptions(): AgentResponse {
    return {
      text: `✈️ *MakeMyTrip*

Where would you like to go?

• ✈️ *Flights* - Search & book flights
• 🏨 *Hotels* - Find accommodation
• 🚂 *Trains* - Book train tickets
• 📋 *My Trips* - View bookings
• 🔥 *Deals* - Travel offers

Tell me your travel plans!`,
      buttons: [
        { id: 'search_flights', title: '✈️ Flights' },
        { id: 'search_hotels', title: '🏨 Hotels' },
        { id: 'view_deals', title: '🔥 Deals' },
      ],
    };
  }
}

export function createMakeMyTripAgent(): Agent {
  return new MakeMyTripAgent();
}

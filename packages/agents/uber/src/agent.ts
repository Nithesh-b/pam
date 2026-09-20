import type { Agent, MessageContext, AgentResponse } from '@pam/core';
import { createUberProvider, type UberProvider, type Location } from './provider.js';

export class UberAgent implements Agent {
  readonly id = 'uber';
  readonly name = 'Uber';
  readonly icon = '🚗';
  readonly description = 'Book cabs and track rides';
  readonly keywords = ['cab', 'taxi', 'ride', 'car', 'uber', 'book cab', 'need a ride', 'drop me', 'pick me'];

  private provider: UberProvider;

  constructor(provider?: UberProvider) {
    this.provider = provider || createUberProvider();
  }

  async handleMessage(ctx: MessageContext): Promise<AgentResponse> {
    const text = ctx.text.toLowerCase();

    // Remove @mention or agent name prefix
    const cleanText = text
      .replace(/@uber\s*/i, '')
      .replace(/^uber[:\s]+/i, '')
      .trim();

    // Parse intent - order matters! More specific intents first
    if (this.matchesIntent(cleanText, ['cancel'])) {
      return this.handleCancel(ctx);
    }

    if (this.matchesIntent(cleanText, ['history', 'past', 'previous'])) {
      return this.handleHistory();
    }

    if (this.matchesIntent(cleanText, ['status', 'track', 'where is', 'driver', 'eta'])) {
      return this.handleStatus(ctx);
    }

    if (this.matchesIntent(cleanText, ['price', 'fare', 'estimate', 'cost', 'how much'])) {
      return this.handleFareEstimate(cleanText);
    }

    if (this.matchesIntent(cleanText, ['book', 'ride', 'cab', 'need', 'get', 'call'])) {
      return this.handleBooking(ctx, cleanText);
    }

    // Default: show options
    return this.showOptions();
  }

  async handleInteraction(ctx: MessageContext, interactionId: string): Promise<AgentResponse> {
    if (interactionId.startsWith('ride_')) {
      const rideTypeId = interactionId.replace('ride_', '');
      return this.confirmBooking(ctx, rideTypeId);
    }

    if (interactionId === 'confirm_cancel') {
      return this.executeCancel(ctx);
    }

    return this.showOptions();
  }

  getHelp(): string {
    return `🚗 *Uber Agent*

I can help you book rides and track your trips!

*Commands:*
• \`book [destination]\` - Book a cab
• \`status\` - Track your current ride
• \`cancel\` - Cancel your ride
• \`fare [from] to [destination]\` - Get fare estimate
• \`history\` - View past rides

*Examples:*
• @uber book to airport
• @uber where is my driver
• @uber how much to MG Road

_Note: This is a demo. Real rides are not booked._`;
  }

  private matchesIntent(text: string, intents: string[]): boolean {
    return intents.some((intent) => text.includes(intent));
  }

  private async handleBooking(_ctx: MessageContext, text: string): Promise<AgentResponse> {
    // Extract destination from text
    const toMatch = text.match(/to\s+(.+)/i);
    const destination = toMatch ? toMatch[1] : 'your destination';

    const mockPickup: Location = {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Current Location (Bangalore)',
    };

    const mockDestination: Location = {
      latitude: 12.9352,
      longitude: 77.6245,
      address: destination,
    };

    const options = await this.provider.searchRideOptions(mockPickup, mockDestination);

    const optionsText = options
      .map((opt) => `*${opt.name}* - ${opt.estimatedPrice}\n   ${opt.description} | 🕐 ${opt.estimatedTime}`)
      .join('\n\n');

    return {
      text: `🚗 *Book a Ride*

📍 From: Current Location
📍 To: *${destination}*

*Available rides:*

${optionsText}

_Select your ride type below_`,
      list: {
        buttonText: 'Choose Ride',
        sections: [{
          title: 'Ride Options',
          rows: options.map((opt) => ({
            id: `ride_${opt.id}`,
            title: `${opt.name} - ${opt.estimatedPrice}`,
            description: `${opt.estimatedTime} away | ${opt.capacity} seats`,
          })),
        }],
      },
    };
  }

  private async confirmBooking(_ctx: MessageContext, rideTypeId: string): Promise<AgentResponse> {
    const mockPickup: Location = {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Current Location',
    };

    const mockDestination: Location = {
      latitude: 12.9352,
      longitude: 77.6245,
      address: 'Destination',
    };

    const ride = await this.provider.bookRide(mockPickup, mockDestination, rideTypeId);

    return {
      text: `✅ *Ride Booked!*

🔍 *Looking for drivers nearby...*

📦 Ride ID: \`${ride.id}\`
🚗 Type: ${ride.rideType}
💰 Estimated: ${ride.price}

📍 Pickup: Current Location
📍 Drop: Destination

_You'll be notified when a driver accepts._
_(Demo mode - no real ride booked)_`,
      buttons: [
        { id: 'track_ride', title: '📍 Track Ride' },
        { id: 'cancel_ride', title: '❌ Cancel' },
      ],
    };
  }

  private async handleStatus(_ctx: MessageContext): Promise<AgentResponse> {
    return {
      text: `📍 *Ride Status*

🚗 *Driver Assigned!*

👤 *Rajesh Kumar* ⭐ 4.8
🚙 Maruti Swift Dzire (White)
📋 DL 01 AB 1234

🕐 Arriving in *3 minutes*

📍 Your driver is on the way to pick you up.

_(Demo mode)_`,
      buttons: [
        { id: 'call_driver', title: '📞 Call Driver' },
        { id: 'share_ride', title: '📤 Share Trip' },
        { id: 'cancel_ride', title: '❌ Cancel' },
      ],
    };
  }

  private async handleCancel(_ctx: MessageContext): Promise<AgentResponse> {
    return {
      text: `❌ *Cancel Ride*

Are you sure you want to cancel?

⚠️ A cancellation fee of ₹50 may apply if the driver is already on the way.

_(Demo mode)_`,
      buttons: [
        { id: 'confirm_cancel', title: '✅ Yes, Cancel' },
        { id: 'keep_ride', title: '❌ No, Keep Ride' },
      ],
    };
  }

  private async executeCancel(_ctx: MessageContext): Promise<AgentResponse> {
    return {
      text: `✅ *Ride Cancelled*

Your ride has been cancelled. No cancellation fee was charged.

Need another ride? Just say "book a cab"!

_(Demo mode)_`,
    };
  }

  private async handleFareEstimate(text: string): Promise<AgentResponse> {
    const toMatch = text.match(/to\s+(.+)/i);
    const destination = toMatch ? toMatch[1] : 'destination';

    const estimate = await this.provider.getEstimatedFare(
      { latitude: 0, longitude: 0, address: 'Current' },
      { latitude: 0, longitude: 0, address: destination }
    );

    return {
      text: `💰 *Fare Estimate*

📍 To: *${destination}*

*Estimated fares:*
🚗 UberGo: ₹${estimate.min} - ₹${estimate.max}
🚙 Premier: ₹${Math.round(estimate.min * 1.5)} - ₹${Math.round(estimate.max * 1.5)}
🛺 Auto: ₹${Math.round(estimate.min * 0.6)} - ₹${Math.round(estimate.max * 0.6)}

_Prices may vary based on traffic and demand._
_(Demo mode)_`,
      buttons: [
        { id: 'book_now', title: '🚗 Book Now' },
      ],
    };
  }

  private async handleHistory(): Promise<AgentResponse> {
    return {
      text: `📋 *Ride History*

*Recent rides:*

1. 🕐 Yesterday, 6:30 PM
   Home → Office
   ₹145 | UberGo | ⭐ 5.0

2. 🕐 Sep 18, 2:15 PM
   Office → Airport
   ₹380 | Premier | ⭐ 4.8

3. 🕐 Sep 15, 9:00 AM
   Home → Mall
   ₹95 | Auto | ⭐ 4.5

_(Demo mode - sample data)_`,
      buttons: [
        { id: 'book_again_1', title: '🔄 Rebook Last' },
        { id: 'view_receipts', title: '🧾 Receipts' },
      ],
    };
  }

  private showOptions(): Promise<AgentResponse> {
    return Promise.resolve({
      text: `Where would you like to go?

• 🚗 *Book* - Book a cab to any destination
• 📍 *Track* - Track your current ride
• 💰 *Fare* - Get fare estimate
• 📋 *History* - View past rides

Just tell me where you want to go!`,
      buttons: [
        { id: 'book_ride', title: '🚗 Book Ride' },
        { id: 'track_ride', title: '📍 Track Ride' },
        { id: 'fare_estimate', title: '💰 Get Fare' },
      ],
    });
  }
}

export function createUberAgent(): Agent {
  return new UberAgent();
}

/**
 * Uber Provider Interface
 * Stub interface for future real API integration
 */

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface RideOption {
  id: string;
  name: string;
  description: string;
  estimatedPrice: string;
  estimatedTime: string;
  capacity: number;
}

export interface Ride {
  id: string;
  status: 'searching' | 'driver_assigned' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
  driver?: {
    name: string;
    rating: number;
    vehicle: string;
    licensePlate: string;
    photo?: string;
  };
  pickup: Location;
  destination: Location;
  rideType: string;
  estimatedArrival: string;
  price: string;
}

export interface UberProvider {
  searchRideOptions(pickup: Location, destination: Location): Promise<RideOption[]>;
  bookRide(pickup: Location, destination: Location, rideTypeId: string): Promise<Ride>;
  getRideStatus(rideId: string): Promise<Ride>;
  cancelRide(rideId: string): Promise<boolean>;
  getEstimatedFare(pickup: Location, destination: Location): Promise<{ min: number; max: number }>;
}

/**
 * Stub implementation with mock data
 */
export class StubUberProvider implements UberProvider {
  private activeRides: Map<string, Ride> = new Map();

  private rideOptions: RideOption[] = [
    { id: 'ubergo', name: 'UberGo', description: 'Affordable, compact rides', estimatedPrice: '₹150-180', estimatedTime: '3 min', capacity: 4 },
    { id: 'uberpremier', name: 'Premier', description: 'Comfortable sedans, top-rated drivers', estimatedPrice: '₹250-300', estimatedTime: '5 min', capacity: 4 },
    { id: 'uberxl', name: 'UberXL', description: 'Affordable rides for groups up to 6', estimatedPrice: '₹280-350', estimatedTime: '7 min', capacity: 6 },
    { id: 'uberauto', name: 'Auto', description: 'Auto rickshaw at your doorstep', estimatedPrice: '₹80-100', estimatedTime: '2 min', capacity: 3 },
    { id: 'ubermoto', name: 'Moto', description: 'Affordable bike rides', estimatedPrice: '₹50-70', estimatedTime: '2 min', capacity: 1 },
  ];

  async searchRideOptions(_pickup: Location, _destination: Location): Promise<RideOption[]> {
    // Simulate slight variation in times based on "distance"
    return this.rideOptions.map((option) => ({
      ...option,
      estimatedTime: `${parseInt(option.estimatedTime) + Math.floor(Math.random() * 3)} min`,
    }));
  }

  async bookRide(pickup: Location, destination: Location, rideTypeId: string): Promise<Ride> {
    const rideType = this.rideOptions.find((r) => r.id === rideTypeId) || this.rideOptions[0];
    const rideId = `UBER${Date.now().toString(36).toUpperCase()}`;

    const ride: Ride = {
      id: rideId,
      status: 'searching',
      pickup,
      destination,
      rideType: rideType.name,
      estimatedArrival: rideType.estimatedTime,
      price: rideType.estimatedPrice,
    };

    // Simulate driver assignment after a moment
    setTimeout(() => {
      const existingRide = this.activeRides.get(rideId);
      if (existingRide && existingRide.status === 'searching') {
        existingRide.status = 'driver_assigned';
        existingRide.driver = {
          name: 'Rajesh Kumar',
          rating: 4.8,
          vehicle: 'Maruti Swift Dzire (White)',
          licensePlate: 'DL 01 AB 1234',
        };
      }
    }, 2000);

    this.activeRides.set(rideId, ride);
    return ride;
  }

  async getRideStatus(rideId: string): Promise<Ride> {
    const ride = this.activeRides.get(rideId);
    if (!ride) {
      return {
        id: rideId,
        status: 'completed',
        pickup: { latitude: 0, longitude: 0, address: 'Unknown' },
        destination: { latitude: 0, longitude: 0, address: 'Unknown' },
        rideType: 'Unknown',
        estimatedArrival: 'Unknown',
        price: 'Unknown',
      };
    }
    return ride;
  }

  async cancelRide(rideId: string): Promise<boolean> {
    const ride = this.activeRides.get(rideId);
    if (ride && ride.status !== 'in_progress' && ride.status !== 'completed') {
      ride.status = 'cancelled';
      return true;
    }
    return false;
  }

  async getEstimatedFare(_pickup: Location, _destination: Location): Promise<{ min: number; max: number }> {
    return { min: 120, max: 180 };
  }
}

export function createUberProvider(): UberProvider {
  return new StubUberProvider();
}

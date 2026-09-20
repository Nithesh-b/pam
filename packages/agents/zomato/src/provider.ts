/**
 * Zomato Provider Interface
 * This is a stub interface for future real API integration
 */

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  priceRange: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
}

export interface Order {
  id: string;
  restaurantName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  estimatedDelivery: string;
}

export interface ZomatoProvider {
  searchRestaurants(query: string, location?: string): Promise<Restaurant[]>;
  getMenu(restaurantId: string): Promise<MenuItem[]>;
  placeOrder(restaurantId: string, items: Array<{ itemId: string; quantity: number }>): Promise<Order>;
  getOrderStatus(orderId: string): Promise<Order>;
  cancelOrder(orderId: string): Promise<boolean>;
}

/**
 * Stub implementation with mock data
 */
export class StubZomatoProvider implements ZomatoProvider {
  private mockRestaurants: Restaurant[] = [
    { id: 'r1', name: "Domino's Pizza", cuisine: 'Italian, Pizza', rating: 4.2, deliveryTime: '25-30 min', priceRange: '₹₹' },
    { id: 'r2', name: 'Biryani Blues', cuisine: 'Biryani, North Indian', rating: 4.5, deliveryTime: '30-40 min', priceRange: '₹₹' },
    { id: 'r3', name: 'Burger King', cuisine: 'American, Burgers', rating: 4.0, deliveryTime: '20-25 min', priceRange: '₹₹' },
    { id: 'r4', name: 'Haldirams', cuisine: 'North Indian, Sweets', rating: 4.3, deliveryTime: '35-45 min', priceRange: '₹₹₹' },
    { id: 'r5', name: 'Chai Point', cuisine: 'Beverages, Snacks', rating: 4.1, deliveryTime: '15-20 min', priceRange: '₹' },
  ];

  private mockOrders: Map<string, Order> = new Map();

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const lowerQuery = query.toLowerCase();
    return this.mockRestaurants.filter(
      (r) => r.name.toLowerCase().includes(lowerQuery) || r.cuisine.toLowerCase().includes(lowerQuery)
    );
  }

  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    const restaurant = this.mockRestaurants.find((r) => r.id === restaurantId);
    if (!restaurant) return [];

    return [
      { id: 'm1', name: 'Special Combo', description: 'Chef\'s special today', price: 299, category: 'Combos', isVeg: true },
      { id: 'm2', name: 'Classic Meal', description: 'Traditional recipe', price: 199, category: 'Main Course', isVeg: true },
      { id: 'm3', name: 'Premium Platter', description: 'For the connoisseur', price: 449, category: 'Premium', isVeg: false },
    ];
  }

  async placeOrder(restaurantId: string, items: Array<{ itemId: string; quantity: number }>): Promise<Order> {
    const restaurant = this.mockRestaurants.find((r) => r.id === restaurantId);
    const orderId = `ZMT${Date.now().toString(36).toUpperCase()}`;
    
    const order: Order = {
      id: orderId,
      restaurantName: restaurant?.name || 'Restaurant',
      items: items.map((i) => ({ name: `Item ${i.itemId}`, quantity: i.quantity, price: 199 })),
      total: items.reduce((sum, i) => sum + i.quantity * 199, 0),
      status: 'placed',
      estimatedDelivery: '30-40 minutes',
    };

    this.mockOrders.set(orderId, order);
    return order;
  }

  async getOrderStatus(orderId: string): Promise<Order> {
    const order = this.mockOrders.get(orderId);
    if (!order) {
      return {
        id: orderId,
        restaurantName: 'Unknown',
        items: [],
        total: 0,
        status: 'placed',
        estimatedDelivery: 'Unknown',
      };
    }
    return order;
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    return this.mockOrders.delete(orderId);
  }
}

export function createZomatoProvider(): ZomatoProvider {
  return new StubZomatoProvider();
}

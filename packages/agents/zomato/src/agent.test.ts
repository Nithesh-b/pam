import { describe, it, expect, beforeEach } from 'vitest';
import { ZomatoAgent } from './agent.js';
import type { MessageContext } from '@pam/core';

function createMockContext(text: string, phoneNumber = '+1234567890'): MessageContext {
  return {
    phoneNumber,
    messageId: 'msg_123',
    text,
    timestamp: new Date(),
    session: {
      id: 'sess_123',
      phoneNumber,
      activeAgent: 'zomato',
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

describe('ZomatoAgent', () => {
  let agent: ZomatoAgent;

  beforeEach(() => {
    agent = new ZomatoAgent();
  });

  describe('metadata', () => {
    it('should have correct id and name', () => {
      expect(agent.id).toBe('zomato');
      expect(agent.name).toBe('Zomato');
      expect(agent.icon).toBe('🍔');
    });

    it('should have food-related keywords', () => {
      expect(agent.keywords).toContain('food');
      expect(agent.keywords).toContain('restaurant');
      expect(agent.keywords).toContain('pizza');
    });
  });

  describe('handleMessage', () => {
    it('should handle search intent', async () => {
      const ctx = createMockContext('@zomato search pizza');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Restaurants');
      expect(response.list).toBeDefined();
    });

    it('should handle order intent', async () => {
      const ctx = createMockContext('@zomato order food');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Order');
      expect(response.text).toContain('Order ID');
    });

    it('should handle status/track intent', async () => {
      const ctx = createMockContext('@zomato track my order');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Order Status');
    });

    it('should handle cancel intent', async () => {
      const ctx = createMockContext('@zomato cancel order');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Cancel');
    });

    it('should show options for unknown intent', async () => {
      const ctx = createMockContext('@zomato hello');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('What would you like to do');
      expect(response.buttons).toBeDefined();
    });

    it('should handle plain text without @mention', async () => {
      const ctx = createMockContext('search restaurants');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toBeDefined();
    });
  });

  describe('getHelp', () => {
    it('should return help text', () => {
      const help = agent.getHelp();

      expect(help).toContain('Zomato');
      expect(help).toContain('search');
      expect(help).toContain('order');
      expect(help).toContain('status');
    });
  });

  describe('handleInteraction', () => {
    it('should handle restaurant selection', async () => {
      const ctx = createMockContext('');
      const response = await agent.handleInteraction(ctx, 'restaurant_r1');

      expect(response.text).toContain('Menu');
    });

    it('should handle order item selection', async () => {
      const ctx = createMockContext('');
      const response = await agent.handleInteraction(ctx, 'order_m1');

      expect(response.text).toContain('Confirmed');
    });
  });
});

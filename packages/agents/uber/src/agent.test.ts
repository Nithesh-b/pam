import { describe, it, expect, beforeEach } from 'vitest';
import { UberAgent } from './agent.js';
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
      activeAgent: 'uber',
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

describe('UberAgent', () => {
  let agent: UberAgent;

  beforeEach(() => {
    agent = new UberAgent();
  });

  describe('metadata', () => {
    it('should have correct id and name', () => {
      expect(agent.id).toBe('uber');
      expect(agent.name).toBe('Uber');
      expect(agent.icon).toBe('🚗');
    });

    it('should have ride-related keywords', () => {
      expect(agent.keywords).toContain('cab');
      expect(agent.keywords).toContain('ride');
      expect(agent.keywords).toContain('taxi');
    });
  });

  describe('handleMessage', () => {
    it('should handle booking intent', async () => {
      const ctx = createMockContext('@uber book a cab to airport');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Book a Ride');
      expect(response.text).toContain('airport');
      expect(response.list).toBeDefined();
    });

    it('should handle status intent', async () => {
      const ctx = createMockContext('@uber where is my driver');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Ride Status');
      expect(response.text).toContain('Driver');
    });

    it('should handle cancel intent', async () => {
      const ctx = createMockContext('@uber cancel ride');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Cancel');
      expect(response.buttons).toBeDefined();
    });

    it('should handle fare estimate intent', async () => {
      const ctx = createMockContext('@uber how much to MG Road');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Fare Estimate');
      expect(response.text.toLowerCase()).toContain('mg road');
    });

    it('should handle history intent', async () => {
      const ctx = createMockContext('@uber show my past rides');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Ride History');
    });

    it('should show options for unknown intent', async () => {
      const ctx = createMockContext('@uber hello there');
      const response = await agent.handleMessage(ctx);

      expect(response.text).toContain('Where would you like to go');
      expect(response.buttons).toBeDefined();
    });
  });

  describe('getHelp', () => {
    it('should return help text', () => {
      const help = agent.getHelp();

      expect(help).toContain('Uber');
      expect(help).toContain('book');
      expect(help).toContain('status');
      expect(help).toContain('fare');
    });
  });

  describe('handleInteraction', () => {
    it('should handle ride type selection', async () => {
      const ctx = createMockContext('');
      const response = await agent.handleInteraction(ctx, 'ride_ubergo');

      expect(response.text).toContain('Ride Booked');
      expect(response.text).toContain('Ride ID');
    });

    it('should handle cancel confirmation', async () => {
      const ctx = createMockContext('');
      const response = await agent.handleInteraction(ctx, 'confirm_cancel');

      expect(response.text).toContain('Cancelled');
    });
  });
});

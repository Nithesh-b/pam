import { describe, it, expect, beforeEach } from 'vitest';
import { createAgentRegistry, createSessionStore, createRouter } from './index.js';
import type { Agent, MessageContext, AgentRegistry, SessionStore, Router } from './types.js';

function createMockAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'test-agent',
    name: 'Test',
    icon: '🧪',
    description: 'Test agent',
    keywords: ['test', 'testing'],
    handleMessage: async () => ({ text: 'Test response' }),
    getHelp: () => 'Test help',
    ...overrides,
  };
}

function createMockContext(
  text: string, 
  phoneNumber = '+1234567890',
  activeAgent: string | null = null
): MessageContext {
  return {
    phoneNumber,
    messageId: 'msg_123',
    text,
    timestamp: new Date(),
    session: {
      id: 'sess_123',
      phoneNumber,
      activeAgent,
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = createAgentRegistry();
  });

  it('should register and retrieve an agent', () => {
    const agent = createMockAgent({ id: 'zomato', name: 'Zomato' });
    registry.register(agent);
    
    expect(registry.get('zomato')).toBe(agent);
  });

  it('should throw when registering duplicate agent', () => {
    const agent = createMockAgent({ id: 'zomato' });
    registry.register(agent);
    
    expect(() => registry.register(agent)).toThrow('already registered');
  });

  it('should find agent by keyword', () => {
    const agent = createMockAgent({ 
      id: 'uber', 
      name: 'Uber',
      keywords: ['cab', 'ride', 'taxi'] 
    });
    registry.register(agent);
    
    expect(registry.findByKeyword('book a cab')).toBe(agent);
    expect(registry.findByKeyword('I need a ride')).toBe(agent);
  });

  it('should find agent by @mention', () => {
    const agent = createMockAgent({ id: 'zomato', name: 'Zomato' });
    registry.register(agent);
    
    expect(registry.findByMention('@zomato order pizza')).toBe(agent);
    expect(registry.findByMention('@Zomato show menu')).toBe(agent);
  });

  it('should find agent by name prefix', () => {
    const agent = createMockAgent({ id: 'zomato', name: 'Zomato' });
    registry.register(agent);
    
    expect(registry.findByMention('Zomato: order pizza')).toBe(agent);
    expect(registry.findByMention('zomato show menu')).toBe(agent);
  });

  it('should return all registered agents', () => {
    const agent1 = createMockAgent({ id: 'agent1' });
    const agent2 = createMockAgent({ id: 'agent2' });
    registry.register(agent1);
    registry.register(agent2);
    
    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(agent1);
    expect(all).toContain(agent2);
  });
});

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    store = createSessionStore(':memory:');
  });

  it('should create a new session', async () => {
    const session = await store.create('+1234567890');
    
    expect(session.phoneNumber).toBe('+1234567890');
    expect(session.activeAgent).toBeNull();
    expect(session.context).toEqual({});
  });

  it('should get an existing session', async () => {
    await store.create('+1234567890');
    const session = await store.get('+1234567890');
    
    expect(session).not.toBeNull();
    expect(session?.phoneNumber).toBe('+1234567890');
  });

  it('should return null for non-existent session', async () => {
    const session = await store.get('+9999999999');
    expect(session).toBeNull();
  });

  it('should set active agent', async () => {
    await store.create('+1234567890');
    await store.setActiveAgent('+1234567890', 'zomato');
    
    const session = await store.get('+1234567890');
    expect(session?.activeAgent).toBe('zomato');
  });

  it('should set context', async () => {
    await store.create('+1234567890');
    await store.setContext('+1234567890', { orderId: '123' });
    
    const session = await store.get('+1234567890');
    expect(session?.context).toEqual({ orderId: '123' });
  });

  it('should reset session', async () => {
    await store.create('+1234567890');
    await store.setActiveAgent('+1234567890', 'zomato');
    await store.setContext('+1234567890', { orderId: '123' });
    
    await store.reset('+1234567890');
    
    const session = await store.get('+1234567890');
    expect(session?.activeAgent).toBeNull();
    expect(session?.context).toEqual({});
  });
});

describe('MessageRouter', () => {
  let registry: AgentRegistry;
  let sessionStore: SessionStore;
  let router: Router;

  beforeEach(() => {
    registry = createAgentRegistry();
    sessionStore = createSessionStore(':memory:');
    router = createRouter({ registry, sessionStore });
  });

  it('should handle /help command', async () => {
    const ctx = createMockContext('/help');
    const result = await router.route(ctx);
    
    expect(result).not.toBeNull();
    expect(result?.agent.id).toBe('system');
    expect(result?.response.text).toContain('PAM');
    expect(result?.response.text).toContain('Personal Agent Manager');
  });

  it('should handle /agents command', async () => {
    const agent = createMockAgent({ id: 'zomato', name: 'Zomato', icon: '🍔' });
    registry.register(agent);
    
    const ctx = createMockContext('/agents');
    const result = await router.route(ctx);
    
    expect(result).not.toBeNull();
    expect(result?.response.list).toBeDefined();
  });

  it('should handle /reset command', async () => {
    await sessionStore.create('+1234567890');
    await sessionStore.setActiveAgent('+1234567890', 'zomato');
    
    const ctx = createMockContext('/reset', '+1234567890');
    const result = await router.route(ctx);
    
    expect(result?.response.text).toContain('Reset');
    
    const session = await sessionStore.get('+1234567890');
    expect(session?.activeAgent).toBeNull();
  });

  it('should route by @mention', async () => {
    const agent = createMockAgent({ 
      id: 'zomato', 
      name: 'Zomato',
      icon: '🍔',
      handleMessage: async () => ({ text: 'Zomato response' }),
    });
    registry.register(agent);
    
    const ctx = createMockContext('@zomato order pizza');
    const result = await router.route(ctx);
    
    expect(result?.agent.id).toBe('zomato');
    expect(result?.response.text).toContain('Zomato');
    expect(result?.response.text).toContain('Zomato response');
  });

  it('should route by keyword', async () => {
    const agent = createMockAgent({ 
      id: 'uber', 
      name: 'Uber',
      icon: '🚗',
      keywords: ['cab', 'ride', 'taxi'],
      handleMessage: async () => ({ text: 'Uber response' }),
    });
    registry.register(agent);
    
    const ctx = createMockContext('I need a cab');
    const result = await router.route(ctx);
    
    expect(result?.agent.id).toBe('uber');
    expect(result?.response.text).toContain('Uber response');
  });

  it('should route to active agent', async () => {
    const agent = createMockAgent({ 
      id: 'zomato', 
      name: 'Zomato',
      icon: '🍔',
      handleMessage: async () => ({ text: 'Zomato response' }),
    });
    registry.register(agent);
    
    const ctx = createMockContext('show my orders', '+1234567890', 'zomato');
    const result = await router.route(ctx);
    
    expect(result?.agent.id).toBe('zomato');
  });

  it('should show help when no agent matches', async () => {
    const ctx = createMockContext('random gibberish xyz');
    const result = await router.route(ctx);
    
    expect(result?.agent.id).toBe('system');
    expect(result?.response.text).toContain('PAM');
  });

  it('should prefix agent response with icon and name', async () => {
    const agent = createMockAgent({ 
      id: 'zomato', 
      name: 'Zomato',
      icon: '🍔',
      handleMessage: async () => ({ text: 'Here is your order' }),
    });
    registry.register(agent);
    
    const ctx = createMockContext('@zomato status');
    const result = await router.route(ctx);
    
    expect(result?.response.text).toMatch(/🍔.*Zomato/);
    expect(result?.response.text).toContain('Here is your order');
  });
});

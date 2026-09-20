import Fastify from 'fastify';
import { createWhatsAppClient, WhatsAppClient } from '@pam/whatsapp';
import { createRouter, createSessionStore } from '@pam/core';
import { loadConfig, validateConfig } from './config.js';
import { setupAgents } from './agents.js';
import { registerWebhookRoutes } from './webhook.js';

async function main(): Promise<void> {
  // Load configuration
  const config = loadConfig();
  
  // Create Fastify instance
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Validate configuration (warn but don't fail for demo mode)
  const configErrors = validateConfig(config);
  if (configErrors.length > 0) {
    app.log.warn({ errors: configErrors }, 'Configuration warnings - running in demo mode');
  }

  // Create WhatsApp client (may fail if not configured)
  let whatsappClient: WhatsAppClient;
  try {
    whatsappClient = createWhatsAppClient(config.whatsapp);
  } catch (error) {
    app.log.warn('WhatsApp client not configured - running in demo mode without message sending');
    // Create a mock client for demo mode
    whatsappClient = {
      sendText: async (to: string, text: string) => {
        app.log.info({ to: to.slice(-4), text: text.substring(0, 100) }, 'DEMO: Would send text');
        return { messaging_product: 'whatsapp' as const, contacts: [], messages: [{ id: 'demo' }] };
      },
      sendButtons: async (to: string, text: string) => {
        app.log.info({ to: to.slice(-4), text: text.substring(0, 100) }, 'DEMO: Would send buttons');
        return { messaging_product: 'whatsapp' as const, contacts: [], messages: [{ id: 'demo' }] };
      },
      sendList: async (to: string, text: string) => {
        app.log.info({ to: to.slice(-4), text: text.substring(0, 100) }, 'DEMO: Would send list');
        return { messaging_product: 'whatsapp' as const, contacts: [], messages: [{ id: 'demo' }] };
      },
      sendMessage: async () => {
        return { messaging_product: 'whatsapp' as const, contacts: [], messages: [{ id: 'demo' }] };
      },
      verifyWebhook: (mode: string, token: string, challenge: string) => {
        if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
          return challenge;
        }
        return null;
      },
      verifyWebhookSignature: () => true,
    } as unknown as WhatsAppClient;
  }

  // Setup agents and router
  const registry = setupAgents();
  const sessionStore = createSessionStore(':memory:'); // Use in-memory SQLite for demo
  const router = createRouter({ registry, sessionStore });

  app.log.info({ agentCount: registry.getAll().length }, 'Agents registered');
  registry.getAll().forEach((agent) => {
    app.log.info({ id: agent.id, name: agent.name, icon: agent.icon }, 'Agent loaded');
  });

  // Register webhook routes
  registerWebhookRoutes(app, {
    whatsappClient,
    router,
    sessionStore,
    verifyToken: config.whatsapp.verifyToken || 'demo_verify_token',
  });

  // Start server
  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`🚀 PAM Gateway running on http://${config.host}:${config.port}`);
    app.log.info('📱 WhatsApp webhook endpoint: /webhook');
    app.log.info('🏥 Health check endpoint: /health');
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

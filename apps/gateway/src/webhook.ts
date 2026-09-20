import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { WhatsAppClient, WebhookEntry, IncomingMessage } from '@pam/whatsapp';
import type { Router, SessionStore, MessageContext } from '@pam/core';

interface WebhookBody {
  object: string;
  entry: WebhookEntry[];
}

interface VerifyQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}

export interface WebhookHandlerConfig {
  whatsappClient: WhatsAppClient;
  router: Router;
  sessionStore: SessionStore;
  verifyToken: string;
}

export function registerWebhookRoutes(
  app: FastifyInstance,
  config: WebhookHandlerConfig
): void {
  const { whatsappClient, router, sessionStore, verifyToken } = config;

  // Webhook verification endpoint (GET)
  app.get('/webhook', async (request: FastifyRequest<{ Querystring: VerifyQuery }>, reply: FastifyReply) => {
    const mode = request.query['hub.mode'];
    const token = request.query['hub.verify_token'];
    const challenge = request.query['hub.challenge'];

    app.log.info({ mode, token: token ? '***' : undefined }, 'Webhook verification request');

    if (mode === 'subscribe' && token === verifyToken) {
      app.log.info('Webhook verified successfully');
      return reply.status(200).send(challenge);
    }

    app.log.warn('Webhook verification failed');
    return reply.status(403).send('Forbidden');
  });

  // Webhook message handler (POST)
  app.post('/webhook', async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
    const body = request.body;

    // WhatsApp webhooks should always have object = 'whatsapp_business_account'
    if (body.object !== 'whatsapp_business_account') {
      app.log.warn({ object: body.object }, 'Invalid webhook object');
      return reply.status(400).send('Invalid webhook');
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const messages = value.messages || [];

        for (const message of messages) {
          try {
            await handleIncomingMessage(
              message,
              { whatsappClient, router, sessionStore },
              app.log
            );
          } catch (error) {
            app.log.error({ error, messageId: message.id }, 'Error processing message');
          }
        }
      }
    }

    // Always respond 200 to acknowledge receipt
    return reply.status(200).send('OK');
  });

  // Health check endpoint
  app.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Root endpoint
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      name: 'PAM - Personal Agent Manager',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        webhook: '/webhook',
        health: '/health',
      },
    });
  });
}

async function handleIncomingMessage(
  message: IncomingMessage,
  deps: {
    whatsappClient: WhatsAppClient;
    router: Router;
    sessionStore: SessionStore;
  },
  log: FastifyInstance['log']
): Promise<void> {
  const { whatsappClient, router, sessionStore } = deps;

  // Only handle text messages for now
  if (message.type !== 'text' || !message.text?.body) {
    log.debug({ type: message.type }, 'Skipping non-text message');
    return;
  }

  const phoneNumber = message.from;
  const text = message.text.body;

  log.info({ phoneNumber: phoneNumber.slice(-4), text: text.substring(0, 50) }, 'Processing message');

  // Get or create session
  let session = await sessionStore.get(phoneNumber);
  if (!session) {
    session = await sessionStore.create(phoneNumber);
  }

  // Build message context
  const ctx: MessageContext = {
    phoneNumber,
    messageId: message.id,
    text,
    timestamp: new Date(parseInt(message.timestamp) * 1000),
    session,
  };

  // Route the message to an agent
  const result = await router.route(ctx);

  if (!result) {
    log.warn({ phoneNumber: phoneNumber.slice(-4) }, 'No agent could handle message');
    return;
  }

  const { response } = result;

  // Send response based on type
  try {
    if (response.list) {
      await whatsappClient.sendList(
        phoneNumber,
        response.text,
        response.list.buttonText,
        response.list.sections
      );
    } else if (response.buttons && response.buttons.length > 0) {
      await whatsappClient.sendButtons(
        phoneNumber,
        response.text,
        response.buttons
      );
    } else {
      await whatsappClient.sendText(phoneNumber, response.text);
    }

    log.info({ phoneNumber: phoneNumber.slice(-4), agentId: result.agent.id }, 'Response sent');
  } catch (error) {
    log.error({ error, phoneNumber: phoneNumber.slice(-4) }, 'Failed to send response');
    throw error;
  }
}

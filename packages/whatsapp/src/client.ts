import type {
  WhatsAppConfig,
  SendMessagePayload,
  SendMessageResponse,
  OutgoingTextMessage,
  OutgoingInteractiveMessage,
  InteractiveButton,
  InteractiveSection,
  WhatsAppApiError,
} from './types.js';

const WHATSAPP_API_BASE = 'https://graph.facebook.com/v19.0';

export class WhatsAppClient {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  private get apiUrl(): string {
    return `${WHATSAPP_API_BASE}/${this.config.phoneNumberId}/messages`;
  }

  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Send a raw message payload to WhatsApp Cloud API
   */
  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json() as WhatsAppApiError;
      throw new Error(`WhatsApp API error: ${error.error?.message || response.statusText}`);
    }

    return response.json() as Promise<SendMessageResponse>;
  }

  /**
   * Send a text message
   */
  async sendText(to: string, text: string, previewUrl = false): Promise<SendMessageResponse> {
    const textPayload: OutgoingTextMessage = {
      body: text,
      preview_url: previewUrl,
    };

    return this.sendMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: textPayload,
    });
  }

  /**
   * Send an interactive button message (max 3 buttons)
   */
  async sendButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string
  ): Promise<SendMessageResponse> {
    if (buttons.length > 3) {
      throw new Error('WhatsApp buttons support maximum 3 buttons');
    }

    const interactiveButtons: InteractiveButton[] = buttons.map((btn) => ({
      type: 'reply' as const,
      reply: {
        id: btn.id,
        title: btn.title.substring(0, 20), // Max 20 chars
      },
    }));

    const interactive: OutgoingInteractiveMessage = {
      type: 'button',
      body: { text: bodyText },
      action: { buttons: interactiveButtons },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }

    if (footerText) {
      interactive.footer = { text: footerText };
    }

    return this.sendMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    });
  }

  /**
   * Send an interactive list message
   */
  async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    headerText?: string,
    footerText?: string
  ): Promise<SendMessageResponse> {
    const interactiveSections: InteractiveSection[] = sections.map((section) => ({
      title: section.title,
      rows: section.rows.map((row) => ({
        id: row.id,
        title: row.title.substring(0, 24), // Max 24 chars
        description: row.description?.substring(0, 72), // Max 72 chars
      })),
    }));

    const interactive: OutgoingInteractiveMessage = {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonText.substring(0, 20), // Max 20 chars
        sections: interactiveSections,
      },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }

    if (footerText) {
      interactive.footer = { text: footerText };
    }

    return this.sendMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    });
  }

  /**
   * Verify webhook signature using app secret
   */
  verifyWebhookSignature(_payload: string, signature: string): boolean {
    if (!this.config.appSecret) {
      console.warn('App secret not configured, skipping signature verification');
      return true;
    }

    // Use Node.js crypto for HMAC verification
    // Note: In production, use crypto.timingSafeEqual for constant-time comparison
    const crypto = globalThis.crypto;
    if (!crypto || !crypto.subtle) {
      console.warn('Web Crypto API not available, skipping signature verification');
      return true;
    }

    // For now, we'll skip signature verification in development
    // In production, implement proper HMAC-SHA256 verification
    const expectedPrefix = 'sha256=';
    if (!signature.startsWith(expectedPrefix)) {
      return false;
    }

    // TODO: Implement proper signature verification with crypto
    console.warn('Signature verification not fully implemented');
    return true;
  }

  /**
   * Verify webhook challenge for initial setup
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.verifyToken) {
      return challenge;
    }
    return null;
  }
}

export function createWhatsAppClient(config?: Partial<WhatsAppConfig>): WhatsAppClient {
  const finalConfig: WhatsAppConfig = {
    accessToken: config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || '',
    phoneNumberId: config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    verifyToken: config?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || '',
    appSecret: config?.appSecret || process.env.WHATSAPP_APP_SECRET,
  };

  if (!finalConfig.accessToken || !finalConfig.phoneNumberId || !finalConfig.verifyToken) {
    throw new Error('Missing required WhatsApp configuration. Set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_VERIFY_TOKEN');
  }

  return new WhatsAppClient(finalConfig);
}

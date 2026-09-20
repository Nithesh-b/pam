/**
 * WhatsApp Cloud API Types
 * Based on the official Meta WhatsApp Cloud API documentation
 */

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
  appSecret?: string;
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: WebhookValue;
  field: string;
}

export interface WebhookValue {
  messaging_product: 'whatsapp';
  metadata: WebhookMetadata;
  contacts?: WebhookContact[];
  messages?: IncomingMessage[];
  statuses?: MessageStatus[];
  errors?: WebhookError[];
}

export interface WebhookMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WebhookContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: MessageType;
  text?: TextMessage;
  image?: MediaMessage;
  audio?: MediaMessage;
  video?: MediaMessage;
  document?: MediaMessage;
  location?: LocationMessage;
  contacts?: ContactMessage[];
  interactive?: InteractiveResponse;
  button?: ButtonResponse;
  context?: MessageContext;
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'audio' 
  | 'video' 
  | 'document' 
  | 'location' 
  | 'contacts' 
  | 'interactive'
  | 'button'
  | 'reaction';

export interface TextMessage {
  body: string;
}

export interface MediaMessage {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
}

export interface LocationMessage {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface ContactMessage {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  phones?: Array<{
    phone: string;
    type: string;
  }>;
}

export interface InteractiveResponse {
  type: 'button_reply' | 'list_reply';
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface ButtonResponse {
  payload: string;
  text: string;
}

export interface MessageContext {
  from: string;
  id: string;
}

export interface MessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: WebhookError[];
}

export interface WebhookError {
  code: number;
  title: string;
  message?: string;
  error_data?: {
    details: string;
  };
}

// Outgoing message types
export interface SendMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: OutgoingMessageType;
  text?: OutgoingTextMessage;
  interactive?: OutgoingInteractiveMessage;
  template?: OutgoingTemplateMessage;
}

export type OutgoingMessageType = 'text' | 'interactive' | 'template' | 'image' | 'audio' | 'video' | 'document';

export interface OutgoingTextMessage {
  preview_url?: boolean;
  body: string;
}

export interface OutgoingInteractiveMessage {
  type: 'button' | 'list';
  header?: InteractiveHeader;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: InteractiveAction;
}

export interface InteractiveHeader {
  type: 'text' | 'image' | 'video' | 'document';
  text?: string;
  image?: { link: string };
  video?: { link: string };
  document?: { link: string };
}

export interface InteractiveBody {
  text: string;
}

export interface InteractiveFooter {
  text: string;
}

export interface InteractiveAction {
  buttons?: InteractiveButton[];
  button?: string;
  sections?: InteractiveSection[];
}

export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface InteractiveSection {
  title?: string;
  rows: InteractiveRow[];
}

export interface InteractiveRow {
  id: string;
  title: string;
  description?: string;
}

export interface OutgoingTemplateMessage {
  name: string;
  language: {
    code: string;
  };
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: string;
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
}

export interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

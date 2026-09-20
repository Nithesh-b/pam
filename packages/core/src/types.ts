/**
 * Core types for PAM agent system
 */

export interface UserSession {
  id: string;
  phoneNumber: string;
  activeAgent: string | null;
  context: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageContext {
  phoneNumber: string;
  messageId: string;
  text: string;
  timestamp: Date;
  session: UserSession;
}

export interface AgentResponse {
  text: string;
  buttons?: Array<{ id: string; title: string }>;
  list?: {
    buttonText: string;
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  };
}

export interface Agent {
  /** Unique identifier for the agent */
  id: string;
  /** Display name (e.g., "Zomato") */
  name: string;
  /** Emoji icon for the agent */
  icon: string;
  /** Short description of what this agent does */
  description: string;
  /** Keywords/intents this agent handles */
  keywords: string[];
  /** Process a message and return a response */
  handleMessage(ctx: MessageContext): Promise<AgentResponse>;
  /** Handle interactive button/list responses */
  handleInteraction?(ctx: MessageContext, interactionId: string): Promise<AgentResponse>;
  /** Get help text for this agent */
  getHelp(): string;
}

export interface AgentRegistry {
  register(agent: Agent): void;
  get(id: string): Agent | undefined;
  getAll(): Agent[];
  findByKeyword(keyword: string): Agent | undefined;
  findByMention(text: string): Agent | undefined;
}

export interface Router {
  route(ctx: MessageContext): Promise<{ agent: Agent; response: AgentResponse } | null>;
}

export interface SessionStore {
  get(phoneNumber: string): Promise<UserSession | null>;
  create(phoneNumber: string): Promise<UserSession>;
  update(phoneNumber: string, updates: Partial<UserSession>): Promise<UserSession>;
  setActiveAgent(phoneNumber: string, agentId: string | null): Promise<void>;
  setContext(phoneNumber: string, context: Record<string, unknown>): Promise<void>;
  reset(phoneNumber: string): Promise<void>;
}

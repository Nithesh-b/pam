import type { 
  Agent, 
  AgentRegistry, 
  AgentResponse, 
  MessageContext, 
  Router, 
  SessionStore 
} from './types.js';

export interface RouterConfig {
  registry: AgentRegistry;
  sessionStore: SessionStore;
}

export class MessageRouter implements Router {
  private registry: AgentRegistry;
  private sessionStore: SessionStore;

  constructor(config: RouterConfig) {
    this.registry = config.registry;
    this.sessionStore = config.sessionStore;
  }

  async route(ctx: MessageContext): Promise<{ agent: Agent; response: AgentResponse } | null> {
    const text = ctx.text.trim();

    // Handle system commands first
    const commandResponse = await this.handleCommand(ctx, text);
    if (commandResponse) {
      return commandResponse;
    }

    // Check for @mention routing
    const mentionedAgent = this.registry.findByMention(text);
    if (mentionedAgent) {
      await this.sessionStore.setActiveAgent(ctx.phoneNumber, mentionedAgent.id);
      const response = await mentionedAgent.handleMessage(ctx);
      return { agent: mentionedAgent, response: this.prefixResponse(mentionedAgent, response) };
    }

    // Check if user has an active agent session
    if (ctx.session.activeAgent) {
      const activeAgent = this.registry.get(ctx.session.activeAgent);
      if (activeAgent) {
        const response = await activeAgent.handleMessage(ctx);
        return { agent: activeAgent, response: this.prefixResponse(activeAgent, response) };
      }
    }

    // Try to route by keyword/intent
    const keywordAgent = this.registry.findByKeyword(text);
    if (keywordAgent) {
      await this.sessionStore.setActiveAgent(ctx.phoneNumber, keywordAgent.id);
      const response = await keywordAgent.handleMessage(ctx);
      return { agent: keywordAgent, response: this.prefixResponse(keywordAgent, response) };
    }

    // No matching agent found - show help
    return this.showHelp();
  }

  private async handleCommand(
    ctx: MessageContext, 
    text: string
  ): Promise<{ agent: Agent; response: AgentResponse } | null> {
    const lowerText = text.toLowerCase();

    if (lowerText === '/help' || lowerText === 'help') {
      return this.showHelp();
    }

    if (lowerText === '/agents' || lowerText === 'agents') {
      return this.showAgents();
    }

    if (lowerText === '/reset' || lowerText === 'reset') {
      await this.sessionStore.reset(ctx.phoneNumber);
      return {
        agent: this.createSystemAgent(),
        response: {
          text: '🔄 *Session Reset*\n\nYour session has been cleared. All agent contexts have been reset.\n\nType /help to see available commands or @mention an agent to start.',
        },
      };
    }

    return null;
  }

  private showHelp(): { agent: Agent; response: AgentResponse } {
    const agents = this.registry.getAll();
    const agentList = agents
      .map((a) => `${a.icon} *${a.name}* - ${a.description}`)
      .join('\n');

    const helpText = `🤖 *PAM - Personal Agent Manager*

Your WhatsApp-based personal OS with ${agents.length} specialist agents.

*How to use:*
• @mention an agent: \`@zomato order pizza\`
• Use keywords: \`book a cab\` → routes to Uber
• Type agent name: \`Zomato: show menu\`

*Available Agents:*
${agentList}

*Commands:*
/help - Show this message
/agents - List all agents with details
/reset - Reset your session

_Note: All services are currently in demo mode._`;

    return {
      agent: this.createSystemAgent(),
      response: { text: helpText },
    };
  }

  private showAgents(): { agent: Agent; response: AgentResponse } {
    const agents = this.registry.getAll();
    
    const sections = agents.map((agent) => ({
      title: `${agent.icon} ${agent.name}`,
      rows: [
        {
          id: `agent_help_${agent.id}`,
          title: agent.name,
          description: agent.description.substring(0, 72),
        },
      ],
    }));

    return {
      agent: this.createSystemAgent(),
      response: {
        text: `📋 *Available Agents*\n\nTap an agent below to see what they can do, or @mention them directly.`,
        list: {
          buttonText: 'View Agents',
          sections,
        },
      },
    };
  }

  private prefixResponse(agent: Agent, response: AgentResponse): AgentResponse {
    return {
      ...response,
      text: `${agent.icon} *${agent.name}*\n\n${response.text}`,
    };
  }

  private createSystemAgent(): Agent {
    return {
      id: 'system',
      name: 'PAM',
      icon: '🤖',
      description: 'Personal Agent Manager',
      keywords: [],
      handleMessage: async () => ({ text: '' }),
      getHelp: () => 'System agent',
    };
  }
}

export function createRouter(config: RouterConfig): Router {
  return new MessageRouter(config);
}

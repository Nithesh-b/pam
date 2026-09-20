import type { Agent, AgentRegistry } from './types.js';

export class DefaultAgentRegistry implements AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  register(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with id "${agent.id}" is already registered`);
    }
    this.agents.set(agent.id, agent);
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  findByKeyword(keyword: string): Agent | undefined {
    const lowerKeyword = keyword.toLowerCase();
    for (const agent of this.agents.values()) {
      if (agent.keywords.some((k) => lowerKeyword.includes(k.toLowerCase()))) {
        return agent;
      }
    }
    return undefined;
  }

  findByMention(text: string): Agent | undefined {
    const lowerText = text.toLowerCase();
    
    // Check for @mention pattern (e.g., @zomato, @uber)
    const mentionMatch = lowerText.match(/@(\w+)/);
    if (mentionMatch) {
      const mentionedName = mentionMatch[1];
      for (const agent of this.agents.values()) {
        if (agent.id.toLowerCase() === mentionedName || 
            agent.name.toLowerCase() === mentionedName) {
          return agent;
        }
      }
    }

    // Check for direct agent name at the start
    for (const agent of this.agents.values()) {
      const agentNameLower = agent.name.toLowerCase();
      if (lowerText.startsWith(agentNameLower + ' ') || 
          lowerText.startsWith(agentNameLower + ':') ||
          lowerText.startsWith(agentNameLower + ',')) {
        return agent;
      }
    }

    return undefined;
  }
}

export function createAgentRegistry(): AgentRegistry {
  return new DefaultAgentRegistry();
}

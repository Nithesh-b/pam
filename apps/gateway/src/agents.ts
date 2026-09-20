import { createAgentRegistry, type AgentRegistry } from '@pam/core';
import { createZomatoAgent } from '@pam/agent-zomato';
import { createUberAgent } from '@pam/agent-uber';
import { createPhonePeAgent } from '@pam/agent-phonepe';
import { createFlipkartAgent } from '@pam/agent-flipkart';
import { createBlinkitAgent } from '@pam/agent-blinkit';
import { createJioHotstarAgent } from '@pam/agent-jiohotstar';
import { createTruecallerAgent } from '@pam/agent-truecaller';
import { createMakeMyTripAgent } from '@pam/agent-makemytrip';
import { createOneMgAgent } from '@pam/agent-onemg';
import { createAirtelAgent } from '@pam/agent-airtel';

export function setupAgents(): AgentRegistry {
  const registry = createAgentRegistry();

  // Register all 10 specialist agents
  registry.register(createZomatoAgent());
  registry.register(createUberAgent());
  registry.register(createPhonePeAgent());
  registry.register(createFlipkartAgent());
  registry.register(createBlinkitAgent());
  registry.register(createJioHotstarAgent());
  registry.register(createTruecallerAgent());
  registry.register(createMakeMyTripAgent());
  registry.register(createOneMgAgent());
  registry.register(createAirtelAgent());

  return registry;
}

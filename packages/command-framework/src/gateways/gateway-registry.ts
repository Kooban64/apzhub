import type { AiActionGateway } from "./ai-action-gateway";
import { createStubAiActionGateway } from "./ai-action-gateway";
import type { AutomationCommandGateway } from "./automation-gateway";
import { createStubAutomationCommandGateway } from "./automation-gateway";
import type { InvocationGatewayDependencies } from "./types";
import type { VoiceActionGateway } from "./voice-action-gateway";
import { createStubVoiceActionGateway } from "./voice-action-gateway";

export interface InvocationGatewayRegistry {
  readonly ai: AiActionGateway;
  readonly voice: VoiceActionGateway;
  readonly automation: AutomationCommandGateway;
}

export interface CreateInvocationGatewayRegistryOptions extends InvocationGatewayDependencies {
  readonly ai?: AiActionGateway;
  readonly voice?: VoiceActionGateway;
  readonly automation?: AutomationCommandGateway;
}

/** Default stub gateways for AF-018 — replace in future milestones. */
export function createDefaultInvocationGatewayRegistry(
  options: CreateInvocationGatewayRegistryOptions = {},
): InvocationGatewayRegistry {
  const dependencies: InvocationGatewayDependencies = {
    delegate: options.delegate,
  };

  return {
    ai: options.ai ?? createStubAiActionGateway(dependencies),
    voice: options.voice ?? createStubVoiceActionGateway(dependencies),
    automation: options.automation ?? createStubAutomationCommandGateway(dependencies),
  };
}

export function buildInvocationGatewayDiagnostics(
  registry: InvocationGatewayRegistry,
): Readonly<{
  ai: ReturnType<AiActionGateway["getDiagnostics"]>;
  voice: ReturnType<VoiceActionGateway["getDiagnostics"]>;
  automation: ReturnType<AutomationCommandGateway["getDiagnostics"]>;
}> {
  return Object.freeze({
    ai: registry.ai.getDiagnostics(),
    voice: registry.voice.getDiagnostics(),
    automation: registry.automation.getDiagnostics(),
  });
}

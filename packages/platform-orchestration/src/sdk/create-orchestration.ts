import type { OrchestrationKernelConfig } from "../contracts/configuration";
import type { OrchestrationEventPublisher } from "../contracts/events";
import { OrchestrationContainer, ORCHESTRATION_DI_TOKENS } from "../di/container";
import { OrchestrationKernel } from "../kernel/orchestration-kernel";
import type { OrchestrationLogger } from "../kernel/logger";
import { CapabilityRegistry } from "../registry/capability-registry";
import { ContractRegistry } from "../registry/contract-registry";
import { LifecycleRegistry } from "../registry/lifecycle-registry";
import { TriggerBindingRegistry } from "../triggers/trigger-binding-registry";
import { TriggerEngine } from "../triggers/trigger-engine";
import { PLATFORM_ORCHESTRATION_VERSION } from "../version";

export interface CreatePlatformOrchestrationOptions {
  readonly config?: OrchestrationKernelConfig;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly logger?: OrchestrationLogger;
  readonly autoInitialise?: boolean;
}

export interface PlatformOrchestration {
  readonly kernel: OrchestrationKernel;
  readonly capabilities: CapabilityRegistry;
  readonly contracts: ContractRegistry;
  readonly lifecycles: LifecycleRegistry;
  readonly triggers: TriggerEngine;
  readonly triggerBindings: TriggerBindingRegistry;
  readonly container: OrchestrationContainer;
}

/**
 * Bootstrap the reusable APZHUB Orchestration Platform (QO-001…QO-003).
 * Trigger Engine routes normalized triggers only — no Quality Flow execution.
 */
export async function createPlatformOrchestration(
  options: CreatePlatformOrchestrationOptions = {},
): Promise<PlatformOrchestration> {
  const kernel = new OrchestrationKernel({
    config: options.config,
    publishEvent: options.publishEvent,
    logger: options.logger,
  });

  if (options.autoInitialise !== false) {
    await kernel.initialise("bootstrap");
  }

  kernel.contracts.register({
    contractId: "orchestration.trigger.v1",
    kind: "trigger",
    version: PLATFORM_ORCHESTRATION_VERSION,
    name: "Normalized Trigger Routing",
    description:
      "Provider-neutral trigger ingest/route — no provider adapters, no flow execution",
  });

  const triggerBindings = new TriggerBindingRegistry();
  const triggers = new TriggerEngine({
    bindings: triggerBindings,
    publishEvent: options.publishEvent,
    orchestrationId: kernel.orchestrationId,
  });

  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.triggerEngine)) {
    kernel.container.register(ORCHESTRATION_DI_TOKENS.triggerEngine, triggers);
  }
  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.triggerBindings)) {
    kernel.container.register(ORCHESTRATION_DI_TOKENS.triggerBindings, triggerBindings);
  }

  return {
    kernel,
    capabilities: kernel.capabilities,
    contracts: kernel.contracts,
    lifecycles: kernel.lifecycles,
    triggers,
    triggerBindings,
    container: kernel.container,
  };
}

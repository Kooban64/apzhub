import type { OrchestrationKernelConfig } from "../contracts/configuration";
import type { OrchestrationEventPublisher } from "../contracts/events";
import { OrchestrationContainer, ORCHESTRATION_DI_TOKENS } from "../di/container";
import { QualityFlowEngine } from "../flows/quality-flow-engine";
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
  readonly qualityFlows: QualityFlowEngine;
  readonly container: OrchestrationContainer;
}

/**
 * Bootstrap the reusable APZHUB Orchestration Platform (QO-001…QO-004).
 * Quality Flow Engine manages lifecycle state only — no capability execution.
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

  kernel.contracts.register({
    contractId: "orchestration.quality_flow.v1",
    kind: "lifecycle",
    version: PLATFORM_ORCHESTRATION_VERSION,
    name: "Quality Flow Lifecycle",
    description:
      "Immutable definitions, mutable instances, table-driven state machine — no capability execution",
  });

  const triggerBindings = new TriggerBindingRegistry();
  const triggers = new TriggerEngine({
    bindings: triggerBindings,
    publishEvent: options.publishEvent,
    orchestrationId: kernel.orchestrationId,
  });

  const qualityFlows = new QualityFlowEngine({
    capabilities: kernel.capabilities,
    publishEvent: options.publishEvent,
    orchestrationId: kernel.orchestrationId,
  });

  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.triggerEngine)) {
    kernel.container.register(ORCHESTRATION_DI_TOKENS.triggerEngine, triggers);
  }
  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.triggerBindings)) {
    kernel.container.register(ORCHESTRATION_DI_TOKENS.triggerBindings, triggerBindings);
  }
  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.qualityFlowEngine)) {
    kernel.container.register(ORCHESTRATION_DI_TOKENS.qualityFlowEngine, qualityFlows);
  }
  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.qualityFlowDefinitions)) {
    kernel.container.register(
      ORCHESTRATION_DI_TOKENS.qualityFlowDefinitions,
      qualityFlows.definitions,
    );
  }

  return {
    kernel,
    capabilities: kernel.capabilities,
    contracts: kernel.contracts,
    lifecycles: kernel.lifecycles,
    triggers,
    triggerBindings,
    qualityFlows,
    container: kernel.container,
  };
}

import type { OrchestrationKernelConfig } from "../contracts/configuration";
import type { OrchestrationEventPublisher } from "../contracts/events";
import { OrchestrationContainer, ORCHESTRATION_DI_TOKENS } from "../di/container";
import { QualityFlowEngine } from "../flows/quality-flow-engine";
import { ImpactCorrelationEngine } from "../impact/impact-correlation-engine";
import { OrchestrationKernel } from "../kernel/orchestration-kernel";
import type { OrchestrationLogger } from "../kernel/logger";
import { PolicySelectionEngine } from "../policy/policy-selection-engine";
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
  readonly impact: ImpactCorrelationEngine;
  readonly policySelection: PolicySelectionEngine;
  readonly container: OrchestrationContainer;
}

/**
 * Bootstrap the reusable APZHUB Orchestration Platform (QO-001…QO-006).
 * Policy Selection produces advisory quality decisions — never executes activities.
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

  kernel.contracts.register({
    contractId: "orchestration.impact_correlation.v1",
    kind: "correlation",
    version: PLATFORM_ORCHESTRATION_VERSION,
    name: "Impact Correlation",
    description:
      "Explainable impact graph, confidence, risk, and advisory quality scope — no execution selection",
  });

  kernel.contracts.register({
    contractId: "orchestration.policy_selection.v1",
    kind: "policy",
    version: PLATFORM_ORCHESTRATION_VERSION,
    name: "Policy & Quality Selection",
    description:
      "Declarative PDP for governed quality activity selection — never executes activities",
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

  const impact = new ImpactCorrelationEngine({
    capabilities: kernel.capabilities,
    publishEvent: options.publishEvent,
    orchestrationId: kernel.orchestrationId,
  });

  const policySelection = new PolicySelectionEngine({
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
  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.impactCorrelation)) {
    kernel.container.register(ORCHESTRATION_DI_TOKENS.impactCorrelation, impact);
  }
  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.impactKnowledge)) {
    kernel.container.register(
      ORCHESTRATION_DI_TOKENS.impactKnowledge,
      impact.knowledge,
    );
  }
  if (!kernel.container.has(ORCHESTRATION_DI_TOKENS.policySelection)) {
    kernel.container.register(ORCHESTRATION_DI_TOKENS.policySelection, policySelection);
  }

  return {
    kernel,
    capabilities: kernel.capabilities,
    contracts: kernel.contracts,
    lifecycles: kernel.lifecycles,
    triggers,
    triggerBindings,
    qualityFlows,
    impact,
    policySelection,
    container: kernel.container,
  };
}

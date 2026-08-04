import type { OrchestrationKernelConfig } from "../contracts/configuration";
import type { OrchestrationEventPublisher } from "../contracts/events";
import { OrchestrationContainer } from "../di/container";
import { OrchestrationKernel } from "../kernel/orchestration-kernel";
import type { OrchestrationLogger } from "../kernel/logger";
import { CapabilityRegistry } from "../registry/capability-registry";
import { ContractRegistry } from "../registry/contract-registry";
import { LifecycleRegistry } from "../registry/lifecycle-registry";

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
  readonly container: OrchestrationContainer;
}

/**
 * Bootstrap the reusable APZHUB Orchestration Platform kernel (QO-001).
 * Does not start Quality Flows, triggers, or peer integrations.
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

  return {
    kernel,
    capabilities: kernel.capabilities,
    contracts: kernel.contracts,
    lifecycles: kernel.lifecycles,
    container: kernel.container,
  };
}

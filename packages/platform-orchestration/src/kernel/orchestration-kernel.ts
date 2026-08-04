import {
  validateOrchestrationKernelConfig,
  type OrchestrationKernelConfig,
  type ValidatedOrchestrationKernelConfig,
} from "../contracts/configuration";
import type { CapabilityRegistrationRecord } from "../contracts/contracts";
import type { OrchestrationContractDescriptor } from "../contracts/contracts";
import type {
  OrchestrationDiagnosticsReport,
  OrchestrationHealthReport,
} from "../contracts/diagnostics";
import { OrchestrationError } from "../contracts/errors";
import {
  ORCHESTRATION_KERNEL_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import type {
  OrchestrationKernelSnapshot,
  OrchestrationKernelState,
} from "../contracts/state";
import { OrchestrationContainer, ORCHESTRATION_DI_TOKENS } from "../di/container";
import { assertTransition } from "../lifecycle/transitions";
import { CapabilityRegistry } from "../registry/capability-registry";
import { ContractRegistry } from "../registry/contract-registry";
import { LifecycleRegistry } from "../registry/lifecycle-registry";
import {
  PLATFORM_ORCHESTRATION_PROGRAMME,
  PLATFORM_ORCHESTRATION_SLICE,
  PLATFORM_ORCHESTRATION_VERSION,
} from "../version";
import { createSilentOrchestrationLogger, type OrchestrationLogger } from "./logger";

export interface OrchestrationKernelOptions {
  readonly config?: OrchestrationKernelConfig;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly logger?: OrchestrationLogger;
  readonly capabilities?: CapabilityRegistry;
  readonly contracts?: ContractRegistry;
  readonly lifecycles?: LifecycleRegistry;
  readonly container?: OrchestrationContainer;
}

/**
 * Reusable orchestration kernel.
 * Owns lifecycle, registries, diagnostics, and metadata — not Quality Flow execution.
 */
export class OrchestrationKernel {
  readonly container: OrchestrationContainer;
  readonly capabilities: CapabilityRegistry;
  readonly contracts: ContractRegistry;
  readonly lifecycles: LifecycleRegistry;

  private readonly config: ValidatedOrchestrationKernelConfig;
  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly logger: OrchestrationLogger;
  private state: OrchestrationKernelState = "created";
  private updatedAt: string;
  private failureReason?: string;

  constructor(options: OrchestrationKernelOptions = {}) {
    this.config = validateOrchestrationKernelConfig(options.config);
    this.capabilities = options.capabilities ?? new CapabilityRegistry();
    this.contracts = options.contracts ?? new ContractRegistry();
    this.lifecycles = options.lifecycles ?? new LifecycleRegistry();
    this.container = options.container ?? new OrchestrationContainer();
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.logger = options.logger ?? createSilentOrchestrationLogger();
    this.updatedAt = new Date().toISOString();

    this.wireContainer();
    this.registerKernelContracts();
    this.lifecycles.register({
      registrationId: "orchestration.kernel.lifecycle",
      name: "Orchestration Kernel Lifecycle",
      states: [
        "created",
        "initialising",
        "ready",
        "paused",
        "stopping",
        "stopped",
        "failed",
      ],
      registeredAt: this.updatedAt,
    });

    void this.publishEvent({
      type: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelCreated,
      occurredAt: this.updatedAt,
      orchestrationId: this.config.orchestrationId,
      correlationId: "kernel-bootstrap",
      payload: { name: this.config.name, version: PLATFORM_ORCHESTRATION_VERSION },
    });
  }

  get orchestrationId(): string {
    return this.config.orchestrationId;
  }

  get name(): string {
    return this.config.name;
  }

  snapshot(): OrchestrationKernelSnapshot {
    return {
      orchestrationId: this.config.orchestrationId,
      state: this.state,
      version: PLATFORM_ORCHESTRATION_VERSION,
      programme: PLATFORM_ORCHESTRATION_PROGRAMME,
      slice: PLATFORM_ORCHESTRATION_SLICE,
      updatedAt: this.updatedAt,
      failureReason: this.failureReason,
    };
  }

  /** Initialise kernel to ready — no Quality Flow / peer integration. */
  async initialise(
    correlationId = "kernel-init",
  ): Promise<OrchestrationKernelSnapshot> {
    this.transition("initialising", correlationId);
    try {
      this.assertConfiguration();
      this.transition("ready", correlationId);
      void this.publishEvent({
        type: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelReady,
        occurredAt: this.updatedAt,
        orchestrationId: this.config.orchestrationId,
        correlationId,
      });
      return this.snapshot();
    } catch (error) {
      const reason = error instanceof Error ? error.message : "initialisation failed";
      this.fail(reason, correlationId);
      throw error;
    }
  }

  pause(correlationId = "kernel-pause"): OrchestrationKernelSnapshot {
    this.transition("paused", correlationId);
    void this.publishEvent({
      type: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelPaused,
      occurredAt: this.updatedAt,
      orchestrationId: this.config.orchestrationId,
      correlationId,
    });
    return this.snapshot();
  }

  resume(correlationId = "kernel-resume"): OrchestrationKernelSnapshot {
    this.transition("ready", correlationId);
    void this.publishEvent({
      type: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelReady,
      occurredAt: this.updatedAt,
      orchestrationId: this.config.orchestrationId,
      correlationId,
    });
    return this.snapshot();
  }

  async stop(correlationId = "kernel-stop"): Promise<OrchestrationKernelSnapshot> {
    if (this.state !== "stopping" && this.state !== "stopped") {
      this.transition("stopping", correlationId);
    }
    if (this.state !== "stopped") {
      this.transition("stopped", correlationId);
    }
    void this.publishEvent({
      type: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelStopped,
      occurredAt: this.updatedAt,
      orchestrationId: this.config.orchestrationId,
      correlationId,
    });
    return this.snapshot();
  }

  registerCapability(
    record: CapabilityRegistrationRecord,
    correlationId = "capability-register",
  ): void {
    this.requireMutableRegistry();
    this.capabilities.register(record);
    void this.publishEvent({
      type: ORCHESTRATION_KERNEL_EVENT_TYPES.capabilityRegistered,
      occurredAt: new Date().toISOString(),
      orchestrationId: this.config.orchestrationId,
      correlationId,
      payload: {
        capabilityId: record.capabilityId,
        lifecycle: record.lifecycle,
      },
    });
  }

  registerContract(
    descriptor: OrchestrationContractDescriptor,
    correlationId = "contract-register",
  ): void {
    this.requireMutableRegistry();
    this.contracts.register(descriptor);
    void this.publishEvent({
      type: ORCHESTRATION_KERNEL_EVENT_TYPES.contractRegistered,
      occurredAt: new Date().toISOString(),
      orchestrationId: this.config.orchestrationId,
      correlationId,
      payload: { contractId: descriptor.contractId, kind: descriptor.kind },
    });
  }

  health(): OrchestrationHealthReport {
    const ready = this.state === "ready";
    const status =
      this.state === "failed"
        ? "unhealthy"
        : this.state === "ready"
          ? "healthy"
          : this.state === "paused" || this.state === "initialising"
            ? "degraded"
            : "unhealthy";
    return {
      status,
      state: this.state,
      version: PLATFORM_ORCHESTRATION_VERSION,
      programme: PLATFORM_ORCHESTRATION_PROGRAMME,
      slice: PLATFORM_ORCHESTRATION_SLICE,
      ready,
      checkedAt: new Date().toISOString(),
      details: {
        name: this.config.name,
        orchestrationId: this.config.orchestrationId,
        ...(this.failureReason ? { failureReason: this.failureReason } : {}),
      },
    };
  }

  readiness(): { readonly ready: boolean; readonly state: OrchestrationKernelState } {
    return { ready: this.state === "ready", state: this.state };
  }

  version(): {
    readonly version: string;
    readonly programme: string;
    readonly slice: string;
  } {
    return {
      version: PLATFORM_ORCHESTRATION_VERSION,
      programme: PLATFORM_ORCHESTRATION_PROGRAMME,
      slice: PLATFORM_ORCHESTRATION_SLICE,
    };
  }

  diagnostics(): OrchestrationDiagnosticsReport {
    return {
      orchestrationId: this.config.orchestrationId,
      name: this.config.name,
      state: this.state,
      version: PLATFORM_ORCHESTRATION_VERSION,
      capabilityCount: this.capabilities.count(),
      contractCount: this.contracts.count(),
      lifecycleRegistrationCount: this.lifecycles.count(),
      configValid: true,
      checkedAt: new Date().toISOString(),
    };
  }

  private wireContainer(): void {
    this.container.register(ORCHESTRATION_DI_TOKENS.config, this.config);
    this.container.register(ORCHESTRATION_DI_TOKENS.logger, this.logger);
    this.container.register(
      ORCHESTRATION_DI_TOKENS.capabilityRegistry,
      this.capabilities,
    );
    this.container.register(ORCHESTRATION_DI_TOKENS.contractRegistry, this.contracts);
    this.container.register(ORCHESTRATION_DI_TOKENS.lifecycleRegistry, this.lifecycles);
    this.container.register(ORCHESTRATION_DI_TOKENS.kernel, this);
  }

  private registerKernelContracts(): void {
    this.contracts.register({
      contractId: "orchestration.kernel.v1",
      kind: "kernel",
      version: PLATFORM_ORCHESTRATION_VERSION,
      name: "Orchestration Kernel",
      description: "Lifecycle, diagnostics, and empty registration framework",
    });
    this.contracts.register({
      contractId: "orchestration.diagnostics.v1",
      kind: "diagnostics",
      version: PLATFORM_ORCHESTRATION_VERSION,
      name: "Orchestration Diagnostics",
    });
  }

  private assertConfiguration(): void {
    if (!this.config.orchestrationId) {
      throw new OrchestrationError(
        "configuration",
        "MISSING_ORCHESTRATION_ID",
        "orchestrationId is required",
      );
    }
  }

  private requireMutableRegistry(): void {
    if (this.state === "stopped" || this.state === "stopping") {
      throw new OrchestrationError(
        "lifecycle",
        "REGISTRY_IMMUTABLE",
        `Cannot mutate registry while kernel is ${this.state}`,
        { state: this.state },
      );
    }
  }

  private transition(to: OrchestrationKernelState, correlationId: string): void {
    assertTransition(this.state, to);
    const from = this.state;
    this.state = to;
    this.updatedAt = new Date().toISOString();
    if (to !== "failed") {
      this.failureReason = undefined;
    }
    this.logger({
      level: "info",
      message: "orchestration.kernel.transition",
      orchestrationId: this.config.orchestrationId,
      correlationId,
      at: this.updatedAt,
      fields: { from, to },
    });
  }

  private fail(reason: string, correlationId: string): void {
    if (this.state !== "failed") {
      assertTransition(this.state, "failed");
      this.state = "failed";
    }
    this.failureReason = reason;
    this.updatedAt = new Date().toISOString();
    void this.publishEvent({
      type: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelFailed,
      occurredAt: this.updatedAt,
      orchestrationId: this.config.orchestrationId,
      correlationId,
      payload: { reason },
    });
  }
}

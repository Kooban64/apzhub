/**
 * Enterprise Quality Flow Engine (QO-004).
 *
 * Owns definitions, instances, lifecycle, transitions, recovery, audit.
 * Coordinates state only — never executes capabilities or provider logic.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  QUALITY_FLOW_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import type { CapabilityCatalogueRecord } from "../contracts/capability-catalogue";
import type {
  CreateQualityFlowInstanceInput,
  QualityFlowDefinition,
  QualityFlowDefinitionInput,
  QualityFlowInstance,
  QualityFlowState,
  QualityFlowTransitionRecord,
  QualityFlowTransitionRequest,
} from "../contracts/quality-flow";
import { isTerminalQualityFlowState } from "../contracts/quality-flow";
import type { TriggerRoutingResult } from "../contracts/trigger";
import type { CapabilityRegistry } from "../registry/capability-registry";
import { QualityFlowDefinitionRegistry } from "./quality-flow-definition-registry";
import {
  assertQualityFlowTransition,
  canTransitionQualityFlow,
  listAllowedTransitions,
} from "./state-machine";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface QualityFlowSecurityContext {
  readonly tenantId?: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly permissionContext?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface QualityFlowEngineOptions {
  readonly definitions?: QualityFlowDefinitionRegistry;
  readonly capabilities?: CapabilityRegistry;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

export interface QualityFlowDiagnostics {
  readonly definitionCount: number;
  readonly instanceCount: number;
  readonly activeInstanceCount: number;
  readonly terminalInstanceCount: number;
  readonly stateCounts: Readonly<Record<string, number>>;
  readonly transitionCount: number;
  readonly lifecycleValidation: "pass" | "fail";
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

export class QualityFlowEngine {
  readonly definitions: QualityFlowDefinitionRegistry;

  private readonly capabilities?: CapabilityRegistry;
  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly instances: DurableMap<QualityFlowInstance>;
  private transitionCount = 0;

  constructor(options: QualityFlowEngineOptions = {}) {
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.definitions =
      options.definitions ??
      new QualityFlowDefinitionRegistry({
        documentStore: options.documentStore,
        orchestrationId: this.orchestrationId,
      });
    this.capabilities = options.capabilities;
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.instances = new DurableMap<QualityFlowInstance>(
      "flow_instance",
      options.documentStore,
      (inst) => ({
        tenantId: inst.tenantId,
        projectId: inst.projectId,
        orchestrationId: this.orchestrationId,
        correlationId: inst.correlationId,
        status: inst.currentState,
        actorId: inst.history.at(-1)?.actor,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.definitions.hydrate();
    await this.instances.hydrate();
  }

  // —— Definitions (immutable) ——

  async registerDefinition(
    input: QualityFlowDefinitionInput,
  ): Promise<QualityFlowDefinition> {
    const def = await this.definitions.register(input);
    this.emit(QUALITY_FLOW_EVENT_TYPES.definitionRegistered, def.flowId, {
      flowId: def.flowId,
      version: def.version,
    });
    return def;
  }

  async versionDefinition(
    flowId: string,
    input: Omit<QualityFlowDefinitionInput, "flowId">,
  ): Promise<QualityFlowDefinition> {
    const def = await this.definitions.version(flowId, input);
    this.emit(QUALITY_FLOW_EVENT_TYPES.definitionVersioned, flowId, {
      flowId: def.flowId,
      version: def.version,
    });
    return def;
  }

  getDefinition(flowId: string, version: string): QualityFlowDefinition {
    return this.definitions.get(flowId, version);
  }

  listDefinitions(): readonly QualityFlowDefinition[] {
    return this.definitions.list();
  }

  // —— Instances ——

  async createInstance(
    input: CreateQualityFlowInstanceInput,
  ): Promise<QualityFlowInstance> {
    const flowId = input.flowId.trim();
    const triggerId = input.triggerId.trim();
    const correlationId = input.correlationId.trim();
    const tenantId = input.tenantId.trim();

    if (!flowId || !triggerId || !correlationId || !tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_FLOW_INSTANCE",
        "flowId, triggerId, correlationId, and tenantId are required",
      );
    }

    // Reject provider-specific keys in metadata (Trigger Engine alignment).
    this.assertProviderNeutralMetadata(input.metadata);

    const definition = input.definitionVersion
      ? this.definitions.get(flowId, input.definitionVersion)
      : this.definitions.getLatest(flowId);

    if (definition.status === "retired") {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_DEFINITION_RETIRED",
        `Cannot create instance from retired definition: ${flowId}@${definition.version}`,
        { flowId, version: definition.version },
      );
    }

    const instanceId = createId("qfi");
    const qualityFlowId = createId("qf");
    const now = new Date().toISOString();
    const actor = (input.actor ?? "system").trim() || "system";

    const bootstrap: QualityFlowTransitionRecord = {
      transitionId: createId("qft"),
      fromState: "registered",
      toState: "registered",
      timestamp: now,
      actor,
      reason: "instance_created",
      correlationId,
      metadata: Object.freeze({ operation: "create" }),
    };

    const instance: QualityFlowInstance = {
      instanceId,
      flowDefinitionId: definition.flowId,
      definitionVersion: definition.version,
      triggerId,
      correlationId,
      causationId: input.causationId?.trim() || undefined,
      qualityFlowId,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      currentState: "registered",
      previousState: undefined,
      createdAt: now,
      completedAt: undefined,
      paused: false,
      recoveryPoint: "registered",
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      history: Object.freeze([bootstrap]),
    };

    await this.instances.set(instanceId, instance);
    this.transitionCount += 1;
    this.emit(
      QUALITY_FLOW_EVENT_TYPES.instanceCreated,
      correlationId,
      {
        instanceId,
        qualityFlowId,
        flowId: definition.flowId,
        definitionVersion: definition.version,
        triggerId,
        tenantId,
      },
      tenantId,
    );

    return instance;
  }

  /**
   * Create an instance from a QO-003 routing result.
   * Accepts only routed disposition; stores Trigger ID — never provider payloads.
   */
  async createInstanceFromRouting(
    routing: TriggerRoutingResult,
    context: {
      readonly tenantId: string;
      readonly projectId?: string;
      readonly actor?: string;
      readonly definitionVersion?: string;
      readonly metadata?: Readonly<Record<string, string>>;
    },
  ): Promise<QualityFlowInstance> {
    if (routing.disposition !== "routed") {
      throw new OrchestrationError(
        "lifecycle",
        "TRIGGER_NOT_ROUTED",
        `Cannot create Quality Flow instance from disposition: ${routing.disposition}`,
        { disposition: routing.disposition },
      );
    }
    const flowId = routing.qualityFlowId?.trim();
    if (!flowId) {
      throw new OrchestrationError(
        "validation",
        "ROUTING_MISSING_FLOW",
        "Routed trigger missing qualityFlowId",
      );
    }

    return await this.createInstance({
      flowId,
      definitionVersion: context.definitionVersion,
      triggerId: routing.triggerId,
      correlationId: routing.correlationId,
      causationId: routing.causationId,
      tenantId: context.tenantId,
      projectId: context.projectId,
      actor: context.actor,
      metadata: context.metadata,
    });
  }

  getInstance(instanceId: string): QualityFlowInstance {
    const instance = this.instances.get(instanceId.trim());
    if (!instance) {
      throw new OrchestrationError(
        "validation",
        "FLOW_INSTANCE_MISSING",
        `Quality Flow instance not found: ${instanceId}`,
        { instanceId },
      );
    }
    return instance;
  }

  listInstances(): readonly QualityFlowInstance[] {
    return [...this.instances.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  getHistory(instanceId: string): readonly QualityFlowTransitionRecord[] {
    return this.getInstance(instanceId).history;
  }

  getStatus(instanceId: string): {
    readonly instanceId: string;
    readonly currentState: QualityFlowState;
    readonly previousState?: QualityFlowState;
    readonly paused: boolean;
    readonly recoveryPoint?: QualityFlowState;
    readonly completedAt?: string;
  } {
    const i = this.getInstance(instanceId);
    return {
      instanceId: i.instanceId,
      currentState: i.currentState,
      previousState: i.previousState,
      paused: i.paused,
      recoveryPoint: i.recoveryPoint,
      completedAt: i.completedAt,
    };
  }

  getMetadata(instanceId: string): Readonly<Record<string, string>> {
    return this.getInstance(instanceId).metadata;
  }

  // —— State transitions ——

  async transition(
    instanceId: string,
    request: QualityFlowTransitionRequest,
  ): Promise<QualityFlowInstance> {
    const instance = this.getInstance(instanceId);
    if (instance.paused) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_PAUSED",
        "Cannot transition a paused Quality Flow instance; resume first",
        { instanceId, currentState: instance.currentState },
      );
    }
    if (isTerminalQualityFlowState(instance.currentState)) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_TERMINAL",
        `Cannot transition terminal Quality Flow instance in state: ${instance.currentState}`,
        { instanceId, currentState: instance.currentState },
      );
    }

    const toState = request.toState;
    const actor = request.actor.trim();
    const reason = request.reason.trim();
    const correlationId = request.correlationId.trim();
    if (!actor || !reason || !correlationId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_TRANSITION_REQUEST",
        "actor, reason, and correlationId are required",
      );
    }

    this.assertProviderNeutralMetadata(request.metadata);
    assertQualityFlowTransition(instance.currentState, toState);

    return await this.applyTransition(instance, {
      toState,
      actor,
      reason,
      correlationId,
      metadata: request.metadata,
      paused: false,
    });
  }

  canTransition(instanceId: string, toState: QualityFlowState): boolean {
    const instance = this.getInstance(instanceId);
    if (instance.paused || isTerminalQualityFlowState(instance.currentState)) {
      return false;
    }
    return canTransitionQualityFlow(instance.currentState, toState);
  }

  allowedTransitions(instanceId: string) {
    const instance = this.getInstance(instanceId);
    if (instance.paused || isTerminalQualityFlowState(instance.currentState)) {
      return [];
    }
    return listAllowedTransitions(instance.currentState);
  }

  // —— Recovery (state coordination only — no capability execution) ——

  async pause(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
    _security?: QualityFlowSecurityContext,
  ): Promise<QualityFlowInstance> {
    const instance = this.getInstance(instanceId);
    if (isTerminalQualityFlowState(instance.currentState)) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_TERMINAL",
        "Cannot pause a terminal Quality Flow instance",
        { instanceId, currentState: instance.currentState },
      );
    }
    if (instance.paused) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_ALREADY_PAUSED",
        "Quality Flow instance is already paused",
        { instanceId },
      );
    }
    return await this.applyRecoveryRecord(instance, {
      actor,
      reason,
      correlationId,
      operation: "pause",
      paused: true,
      recoveryPoint: instance.currentState,
    });
  }

  async resume(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
    _security?: QualityFlowSecurityContext,
  ): Promise<QualityFlowInstance> {
    const instance = this.getInstance(instanceId);
    if (!instance.paused) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_NOT_PAUSED",
        "Quality Flow instance is not paused",
        { instanceId },
      );
    }
    if (isTerminalQualityFlowState(instance.currentState)) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_TERMINAL",
        "Cannot resume a terminal Quality Flow instance",
        { instanceId, currentState: instance.currentState },
      );
    }
    return await this.applyRecoveryRecord(instance, {
      actor,
      reason,
      correlationId,
      operation: "resume",
      paused: false,
      recoveryPoint: instance.recoveryPoint ?? instance.currentState,
    });
  }

  async cancel(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
  ): Promise<QualityFlowInstance> {
    return await this.controlTransition(
      instanceId,
      "cancelled",
      actor,
      reason,
      correlationId,
      "cancel",
    );
  }

  async fail(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
  ): Promise<QualityFlowInstance> {
    return await this.controlTransition(
      instanceId,
      "failed",
      actor,
      reason,
      correlationId,
      "fail",
    );
  }

  async timeout(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
  ): Promise<QualityFlowInstance> {
    return await this.controlTransition(
      instanceId,
      "timed_out",
      actor,
      reason,
      correlationId,
      "timeout",
    );
  }

  async reject(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
  ): Promise<QualityFlowInstance> {
    return await this.controlTransition(
      instanceId,
      "rejected",
      actor,
      reason,
      correlationId,
      "reject",
    );
  }

  async supersede(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
  ): Promise<QualityFlowInstance> {
    return await this.controlTransition(
      instanceId,
      "superseded",
      actor,
      reason,
      correlationId,
      "supersede",
    );
  }

  /**
   * Retry from failed → last recovery point.
   * Resumes lifecycle coordination only — does not re-execute capabilities.
   */
  async retry(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
  ): Promise<QualityFlowInstance> {
    const instance = this.getInstance(instanceId);
    if (instance.currentState !== "failed") {
      throw new OrchestrationError(
        "lifecycle",
        "RETRY_NOT_ALLOWED",
        `Retry requires failed state; current: ${instance.currentState}`,
        { instanceId, currentState: instance.currentState },
      );
    }
    const target = instance.recoveryPoint ?? "ready";
    return await this.applyTransition(instance, {
      toState: target,
      actor: actor.trim(),
      reason: reason.trim(),
      correlationId: correlationId.trim(),
      metadata: { operation: "retry", recoveryPoint: target },
      paused: false,
      allowFromTerminal: true,
    });
  }

  /**
   * Restart from a recoverable terminal state back to ready.
   */
  async restart(
    instanceId: string,
    actor: string,
    reason: string,
    correlationId: string,
  ): Promise<QualityFlowInstance> {
    const instance = this.getInstance(instanceId);
    return await this.applyTransition(instance, {
      toState: "ready",
      actor: actor.trim(),
      reason: reason.trim(),
      correlationId: correlationId.trim(),
      metadata: { operation: "restart" },
      paused: false,
      allowFromTerminal: true,
    });
  }

  // —— Capability Registry integration (discover only) ——

  /**
   * Discover registered capabilities that intersect this flow's stages.
   * Never invokes, executes, or resolves implementations.
   */
  discoverCapabilities(
    flowId: string,
    version?: string,
  ): readonly CapabilityCatalogueRecord[] {
    if (!this.capabilities) {
      return [];
    }
    const definition = version
      ? this.definitions.get(flowId, version)
      : this.definitions.getLatest(flowId);
    const stages = new Set(definition.supportedCapabilityStages);
    if (stages.size === 0) {
      return this.capabilities.list();
    }
    return this.capabilities
      .list()
      .filter((c) => c.supportedQualityFlowStages.some((s) => stages.has(s)));
  }

  // —— Diagnostics ——

  diagnostics(): QualityFlowDiagnostics {
    const stateCounts: Record<string, number> = {};
    let active = 0;
    let terminal = 0;
    for (const instance of this.instances.values()) {
      stateCounts[instance.currentState] =
        (stateCounts[instance.currentState] ?? 0) + 1;
      if (isTerminalQualityFlowState(instance.currentState)) {
        terminal += 1;
      } else {
        active += 1;
      }
    }

    const lifecycleValidation = this.validateLifecycleIntegrity() ? "pass" : "fail";

    return {
      definitionCount: this.definitions.count(),
      instanceCount: this.instances.size,
      activeInstanceCount: active,
      terminalInstanceCount: terminal,
      stateCounts,
      transitionCount: this.transitionCount,
      lifecycleValidation,
      health: lifecycleValidation === "pass" ? "healthy" : "unhealthy",
      ready: lifecycleValidation === "pass",
      checkedAt: new Date().toISOString(),
    };
  }

  health(): { readonly status: "healthy" | "unhealthy"; readonly ready: boolean } {
    const d = this.diagnostics();
    return { status: d.health === "healthy" ? "healthy" : "unhealthy", ready: d.ready };
  }

  // —— Internals ——

  private async controlTransition(
    instanceId: string,
    toState: QualityFlowState,
    actor: string,
    reason: string,
    correlationId: string,
    operation: string,
  ): Promise<QualityFlowInstance> {
    const instance = this.getInstance(instanceId);
    if (isTerminalQualityFlowState(instance.currentState)) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_TERMINAL",
        `Cannot transition terminal Quality Flow instance in state: ${instance.currentState}`,
        { instanceId, currentState: instance.currentState },
      );
    }
    return await this.applyTransition(instance, {
      toState,
      actor: actor.trim(),
      reason: reason.trim(),
      correlationId: correlationId.trim(),
      metadata: { operation },
      paused: false,
      allowFromTerminal: false,
    });
  }

  private async applyTransition(
    instance: QualityFlowInstance,
    args: {
      readonly toState: QualityFlowState;
      readonly actor: string;
      readonly reason: string;
      readonly correlationId: string;
      readonly metadata?: Readonly<Record<string, string>>;
      readonly paused: boolean;
      readonly allowFromTerminal?: boolean;
    },
  ): Promise<QualityFlowInstance> {
    if (!args.allowFromTerminal && isTerminalQualityFlowState(instance.currentState)) {
      throw new OrchestrationError(
        "lifecycle",
        "FLOW_TERMINAL",
        `Cannot transition terminal Quality Flow instance in state: ${instance.currentState}`,
        { instanceId: instance.instanceId, currentState: instance.currentState },
      );
    }

    if (!args.actor || !args.reason || !args.correlationId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_TRANSITION_REQUEST",
        "actor, reason, and correlationId are required",
      );
    }

    const kind = assertQualityFlowTransition(instance.currentState, args.toState);
    const now = new Date().toISOString();
    const record: QualityFlowTransitionRecord = {
      transitionId: createId("qft"),
      fromState: instance.currentState,
      toState: args.toState,
      timestamp: now,
      actor: args.actor,
      reason: args.reason,
      correlationId: args.correlationId,
      metadata: Object.freeze({
        ...(args.metadata ?? {}),
        kind,
      }),
    };

    // History is append-only — never overwrite prior records.
    const history = Object.freeze([...instance.history, record]);
    const terminal = isTerminalQualityFlowState(args.toState);

    let recoveryPoint = instance.recoveryPoint;
    if (args.toState === "failed") {
      recoveryPoint = instance.recoveryPoint ?? instance.currentState;
    } else if (!terminal) {
      recoveryPoint = args.toState;
    }

    const next: QualityFlowInstance = {
      ...instance,
      previousState: instance.currentState,
      currentState: args.toState,
      completedAt: terminal ? now : undefined,
      paused: args.paused,
      recoveryPoint,
      history,
    };

    await this.instances.set(instance.instanceId, next);
    this.transitionCount += 1;
    this.emit(
      QUALITY_FLOW_EVENT_TYPES.stateTransitioned,
      args.correlationId,
      {
        instanceId: instance.instanceId,
        fromState: record.fromState,
        toState: record.toState,
        kind,
        actor: args.actor,
      },
      instance.tenantId,
    );
    return next;
  }

  private async applyRecoveryRecord(
    instance: QualityFlowInstance,
    args: {
      readonly actor: string;
      readonly reason: string;
      readonly correlationId: string;
      readonly operation: "pause" | "resume";
      readonly paused: boolean;
      readonly recoveryPoint: QualityFlowState;
    },
  ): Promise<QualityFlowInstance> {
    const actor = args.actor.trim();
    const reason = args.reason.trim();
    const correlationId = args.correlationId.trim();
    if (!actor || !reason || !correlationId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_RECOVERY_REQUEST",
        "actor, reason, and correlationId are required",
      );
    }

    const now = new Date().toISOString();
    const record: QualityFlowTransitionRecord = {
      transitionId: createId("qft"),
      fromState: instance.currentState,
      toState: instance.currentState,
      timestamp: now,
      actor,
      reason,
      correlationId,
      metadata: Object.freeze({
        operation: args.operation,
        kind: "recovery",
      }),
    };

    const next: QualityFlowInstance = {
      ...instance,
      paused: args.paused,
      recoveryPoint: args.recoveryPoint,
      history: Object.freeze([...instance.history, record]),
    };

    await this.instances.set(instance.instanceId, next);
    this.transitionCount += 1;
    this.emit(
      args.operation === "pause"
        ? QUALITY_FLOW_EVENT_TYPES.instancePaused
        : QUALITY_FLOW_EVENT_TYPES.instanceResumed,
      correlationId,
      {
        instanceId: instance.instanceId,
        currentState: instance.currentState,
        operation: args.operation,
      },
      instance.tenantId,
    );
    return next;
  }

  private assertProviderNeutralMetadata(
    metadata: Readonly<Record<string, string>> | undefined,
  ): void {
    if (!metadata) return;
    const banned = [
      "github",
      "gitlab",
      "bitbucket",
      "jenkins",
      "playwright",
      "azuredevops",
      "azure_devops",
    ];
    for (const [k, v] of Object.entries(metadata)) {
      const hay = `${k}:${v}`.toLowerCase();
      for (const token of banned) {
        if (hay.includes(token)) {
          throw new OrchestrationError(
            "validation",
            "PROVIDER_METADATA_REJECTED",
            `Provider-specific metadata rejected: ${k}`,
            { key: k },
          );
        }
      }
    }
  }

  private validateLifecycleIntegrity(): boolean {
    for (const instance of this.instances.values()) {
      if (instance.history.length === 0) return false;
      // History append-only integrity: timestamps non-decreasing
      for (let i = 1; i < instance.history.length; i++) {
        if (instance.history[i]!.timestamp < instance.history[i - 1]!.timestamp) {
          return false;
        }
      }
      const last = instance.history[instance.history.length - 1]!;
      if (
        last.toState !== instance.currentState &&
        !(instance.paused && last.fromState === instance.currentState)
      ) {
        // pause/resume keep toState === currentState
        if (last.toState !== instance.currentState) return false;
      }
    }
    return true;
  }

  private emit(
    type: (typeof QUALITY_FLOW_EVENT_TYPES)[keyof typeof QUALITY_FLOW_EVENT_TYPES],
    correlationId: string,
    payload: Record<string, unknown>,
    tenantId?: string,
  ): void {
    void this.publishEvent({
      type,
      occurredAt: new Date().toISOString(),
      orchestrationId: this.orchestrationId,
      correlationId,
      tenantId,
      payload,
    });
  }
}

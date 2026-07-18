import type { EventBus } from "@apzhub/event-notification-framework";
import type { PlatformGovernanceService } from "@apzhub/platform-governance";
import type { OutboxHandler, OutboxStore } from "@apzhub/platform-outbox";
import { DEFAULT_RETRY_POLICY } from "@apzhub/platform-outbox";

import type { ProvisioningAuditSink } from "./audit";
import {
  DEFAULT_PRODUCT_KEYS,
  OUTBOX_AGGREGATE_TYPE_PROVISIONING,
  OUTBOX_EVENT_TYPE_PROVISIONING_STEP,
  PROVISIONING_EVENT_COMPLETED,
  PROVISIONING_EVENT_FAILED,
  PROVISIONING_EVENT_STARTED,
  PROVISIONING_EVENT_STEP_COMPLETED,
} from "./constants";
import type { PublishCounters } from "./events/publish";
import { publishProvisioningEvent } from "./events/publish";
import type { ProvisioningFlowStore } from "./flow-store";
import type {
  ProvisioningFlow,
  ProvisioningFlowKind,
  ProvisioningOutboxStepPayload,
  ProvisioningStepId,
  StartProvisioningFlowInput,
} from "./types";
import { createUuid } from "./uuid";
import {
  executeProvisioningStep,
  isPermanentStepFailure,
  nextStep,
  stepsForKind,
} from "./workflow";

export type ProductProvisioningEngine = {
  startTenantEnablement(input: StartProvisioningFlowInput): Promise<ProvisioningFlow>;
  startProductEnablement(input: StartProvisioningFlowInput): Promise<ProvisioningFlow>;
  startProductActivation(input: StartProvisioningFlowInput): Promise<ProvisioningFlow>;
  getFlow(flowId: string): ProvisioningFlow | undefined;
  listFlows(filter?: { readonly tenantId?: string }): readonly ProvisioningFlow[];
  /** Advance one step (used by outbox handler and sync runner). */
  advanceStep(flowId: string, step: ProvisioningStepId): Promise<ProvisioningFlow>;
  createOutboxHandler(name?: string): OutboxHandler;
};

export type CreateProductProvisioningEngineOptions = {
  readonly governance: PlatformGovernanceService;
  readonly bus: EventBus;
  readonly store: ProvisioningFlowStore;
  readonly audit: ProvisioningAuditSink;
  readonly publishCounters: PublishCounters;
  readonly outboxStore?: OutboxStore;
};

export function createProductProvisioningEngine(
  options: CreateProductProvisioningEngineOptions,
): ProductProvisioningEngine {
  const { governance, bus, store, audit, publishCounters, outboxStore } = options;

  async function startKind(
    kind: ProvisioningFlowKind,
    input: StartProvisioningFlowInput,
  ): Promise<ProvisioningFlow> {
    const productKeys =
      input.productKeys && input.productKeys.length > 0
        ? [...input.productKeys]
        : [...DEFAULT_PRODUCT_KEYS];
    const correlationId = input.correlationId ?? createUuid();
    const now = new Date().toISOString();
    const firstStep = stepsForKind(kind)[0]!;

    let flow: ProvisioningFlow = {
      flowId: createUuid(),
      kind,
      tenantId: input.tenantId,
      productKeys,
      status: "pending",
      currentStep: firstStep,
      steps: [],
      correlationId,
      governanceRecordIds: [],
      actorId: input.actorId,
      createdAt: now,
      updatedAt: now,
      attemptCount: 0,
    };
    store.save(flow);

    publishProvisioningEvent(
      {
        bus,
        eventId: PROVISIONING_EVENT_STARTED,
        correlationId,
        tenantId: input.tenantId,
        actorId: input.actorId,
        payload: {
          flowId: flow.flowId,
          kind,
          productKeys,
        },
      },
      publishCounters,
    );

    audit.record({
      action: "flow.started",
      flowId: flow.flowId,
      detail: `Started ${kind} for tenant ${input.tenantId}`,
      correlationId,
    });

    if (input.async) {
      await enqueueStep(flow, firstStep);
      flow = {
        ...flow,
        status: "in_progress",
        updatedAt: new Date().toISOString(),
        message: "Queued for async provisioning",
      };
      store.save(flow);
      return flow;
    }

    // Synchronous: run all steps to completion or failure
    let step: ProvisioningStepId | undefined = firstStep;
    while (step) {
      flow = await advanceStepInternal(flow.flowId, step);
      if (flow.status === "failed" || flow.status === "completed") {
        return flow;
      }
      step = nextStep(kind, step);
    }
    return flow;
  }

  async function enqueueStep(
    flow: ProvisioningFlow,
    step: ProvisioningStepId,
  ): Promise<void> {
    if (!outboxStore?.insert) {
      throw new Error(
        "Async provisioning requires an OutboxStore with insert() support",
      );
    }
    const now = new Date().toISOString();
    const payload: ProvisioningOutboxStepPayload = {
      flowId: flow.flowId,
      kind: flow.kind,
      tenantId: flow.tenantId,
      productKeys: flow.productKeys,
      step,
      correlationId: flow.correlationId,
      governanceRecordIds: flow.governanceRecordIds,
      actorId: flow.actorId,
    };
    await outboxStore.insert({
      outboxEventId: createUuid(),
      tenantId: flow.tenantId,
      aggregateType: OUTBOX_AGGREGATE_TYPE_PROVISIONING,
      aggregateId: flow.flowId,
      eventType: OUTBOX_EVENT_TYPE_PROVISIONING_STEP,
      payload: { ...payload },
      status: "pending",
      attemptCount: 0,
      maxAttempts: DEFAULT_RETRY_POLICY.maxAttempts,
      correlationId: flow.correlationId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function advanceStepInternal(
    flowId: string,
    step: ProvisioningStepId,
  ): Promise<ProvisioningFlow> {
    const current = store.get(flowId);
    if (!current) {
      throw new Error(`Unknown provisioning flow: ${flowId}`);
    }

    let flow: ProvisioningFlow = {
      ...current,
      status: "in_progress",
      currentStep: step,
      attemptCount: current.attemptCount + 1,
      updatedAt: new Date().toISOString(),
    };
    store.save(flow);

    const executed = await executeProvisioningStep({
      governance,
      kind: flow.kind,
      tenantId: flow.tenantId,
      productKeys: flow.productKeys,
      step,
      existingRecordIds: flow.governanceRecordIds,
    });

    const steps = [...flow.steps, executed.stepResult];
    flow = {
      ...flow,
      steps,
      governanceRecordIds: executed.governanceRecordIds,
      updatedAt: new Date().toISOString(),
    };

    if (!executed.ok) {
      flow = {
        ...flow,
        status: "failed",
        message: executed.stepResult.message,
        completedAt: new Date().toISOString(),
      };
      store.save(flow);
      publishProvisioningEvent(
        {
          bus,
          eventId: PROVISIONING_EVENT_FAILED,
          correlationId: flow.correlationId,
          tenantId: flow.tenantId,
          actorId: flow.actorId,
          payload: {
            flowId: flow.flowId,
            kind: flow.kind,
            step,
            message: executed.stepResult.message,
          },
        },
        publishCounters,
      );
      audit.record({
        action: "flow.failed",
        flowId: flow.flowId,
        detail: executed.stepResult.message,
        correlationId: flow.correlationId,
      });
      return flow;
    }

    publishProvisioningEvent(
      {
        bus,
        eventId: PROVISIONING_EVENT_STEP_COMPLETED,
        correlationId: flow.correlationId,
        tenantId: flow.tenantId,
        actorId: flow.actorId,
        payload: {
          flowId: flow.flowId,
          kind: flow.kind,
          step,
          message: executed.stepResult.message,
        },
      },
      publishCounters,
    );

    audit.record({
      action: "step.completed",
      flowId: flow.flowId,
      detail: `${step}: ${executed.stepResult.message}`,
      correlationId: flow.correlationId,
    });

    const upcoming = nextStep(flow.kind, step);
    if (!upcoming) {
      flow = {
        ...flow,
        status: "completed",
        message: "Provisioning completed",
        completedAt: new Date().toISOString(),
      };
      store.save(flow);
      publishProvisioningEvent(
        {
          bus,
          eventId: PROVISIONING_EVENT_COMPLETED,
          correlationId: flow.correlationId,
          tenantId: flow.tenantId,
          actorId: flow.actorId,
          payload: {
            flowId: flow.flowId,
            kind: flow.kind,
            productKeys: flow.productKeys,
            governanceRecordIds: flow.governanceRecordIds,
          },
        },
        publishCounters,
      );
      audit.record({
        action: "flow.completed",
        flowId: flow.flowId,
        detail: `Completed ${flow.kind}`,
        correlationId: flow.correlationId,
      });
      return flow;
    }

    flow = {
      ...flow,
      currentStep: upcoming,
      status: "in_progress",
    };
    store.save(flow);
    return flow;
  }

  function createOutboxHandler(name = "provisioning-steps"): OutboxHandler {
    return {
      name,
      async handle(event) {
        if (event.eventType !== OUTBOX_EVENT_TYPE_PROVISIONING_STEP) {
          return { ok: true };
        }
        const payload = event.payload as unknown as ProvisioningOutboxStepPayload;
        if (!payload?.flowId || !payload.step) {
          return {
            ok: false,
            message: "Invalid provisioning outbox payload",
            permanent: true,
          };
        }

        // Ensure flow exists (may have been started async in this process)
        if (!store.get(payload.flowId)) {
          const now = new Date().toISOString();
          store.save({
            flowId: payload.flowId,
            kind: payload.kind,
            tenantId: payload.tenantId,
            productKeys: payload.productKeys,
            status: "in_progress",
            currentStep: payload.step,
            steps: [],
            correlationId: payload.correlationId,
            governanceRecordIds: payload.governanceRecordIds ?? [],
            actorId: payload.actorId,
            createdAt: now,
            updatedAt: now,
            attemptCount: 0,
          });
        }

        try {
          const flow = await advanceStepInternal(payload.flowId, payload.step);
          if (flow.status === "failed") {
            const permanent = isPermanentStepFailure(flow.message ?? "");
            return {
              ok: false,
              message: flow.message ?? "Provisioning step failed",
              permanent,
            };
          }
          if (flow.status === "completed") {
            return { ok: true };
          }
          const upcoming = flow.currentStep;
          await enqueueStep(flow, upcoming);
          return { ok: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return {
            ok: false,
            message,
            permanent: isPermanentStepFailure(message),
          };
        }
      },
    };
  }

  return {
    startTenantEnablement: (input) => startKind("tenant_enablement", input),
    startProductEnablement: (input) => startKind("product_enablement", input),
    startProductActivation: (input) => startKind("product_activation", input),
    getFlow: (flowId) => store.get(flowId),
    listFlows: (filter) => store.list(filter),
    advanceStep: (flowId, step) => advanceStepInternal(flowId, step),
    createOutboxHandler,
  };
}

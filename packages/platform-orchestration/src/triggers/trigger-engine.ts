import { OrchestrationError } from "../contracts/errors";
import {
  TRIGGER_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import type {
  NormalizedTrigger,
  TriggerDisposition,
  TriggerRoutingResult,
} from "../contracts/trigger";
import { TriggerBindingRegistry } from "./trigger-binding-registry";

export interface TriggerEngineOptions {
  readonly bindings?: TriggerBindingRegistry;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
}

/**
 * Trigger Engine (QO-003) — routes normalized triggers only.
 *
 * - Provider-neutral: never imports GitHub/GitLab/Jenkins/… types
 * - Routes: selects Quality Flow id / next stage metadata
 * - Does NOT execute Quality Flows or invoke capabilities
 */
export class TriggerEngine {
  readonly bindings: TriggerBindingRegistry;

  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly seenTriggerIds = new Set<string>();

  constructor(options: TriggerEngineOptions = {}) {
    this.bindings = options.bindings ?? new TriggerBindingRegistry();
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.orchestrationId = options.orchestrationId ?? "orch_default";
  }

  /**
   * Ingest a normalized trigger and produce a routing decision.
   * Idempotent on triggerId within process lifetime.
   */
  ingest(trigger: NormalizedTrigger): TriggerRoutingResult {
    this.assertNormalized(trigger);

    const routedAt = new Date().toISOString();
    void this.publishEvent({
      type: TRIGGER_EVENT_TYPES.received,
      occurredAt: routedAt,
      orchestrationId: this.orchestrationId,
      correlationId: trigger.correlationId,
      tenantId: trigger.tenantId,
      payload: {
        triggerId: trigger.triggerId,
        triggerType: trigger.triggerType,
        triggerSource: trigger.triggerSource,
        payloadRef: trigger.payloadRef,
      },
    });

    if (this.seenTriggerIds.has(trigger.triggerId)) {
      return this.result({
        disposition: "ignored",
        trigger,
        routedAt,
        reason: "duplicate_trigger_id",
      });
    }
    this.seenTriggerIds.add(trigger.triggerId);

    const matches = this.bindings.match({
      triggerType: trigger.triggerType,
      triggerSource: trigger.triggerSource,
      tenantId: trigger.tenantId,
      projectId: trigger.projectId,
    });

    if (matches.length === 0) {
      const ignored = this.result({
        disposition: "ignored",
        trigger,
        routedAt,
        reason: "no_matching_binding",
      });
      void this.publishEvent({
        type: TRIGGER_EVENT_TYPES.ignored,
        occurredAt: routedAt,
        orchestrationId: this.orchestrationId,
        correlationId: trigger.correlationId,
        tenantId: trigger.tenantId,
        payload: { triggerId: trigger.triggerId, reason: ignored.reason },
      });
      return ignored;
    }

    const selected = matches[0]!;
    const routed = this.result({
      disposition: "routed",
      trigger,
      routedAt,
      qualityFlowId: selected.qualityFlowId,
      bindingId: selected.bindingId,
      nextStage: selected.nextStage,
    });

    void this.publishEvent({
      type: TRIGGER_EVENT_TYPES.routed,
      occurredAt: routedAt,
      orchestrationId: this.orchestrationId,
      correlationId: trigger.correlationId,
      tenantId: trigger.tenantId,
      payload: {
        triggerId: trigger.triggerId,
        qualityFlowId: routed.qualityFlowId,
        bindingId: routed.bindingId,
        nextStage: routed.nextStage,
        causationId: trigger.causationId,
      },
    });

    return routed;
  }

  /** Explicit reject path for invalid/unauthorized normalized triggers. */
  reject(trigger: NormalizedTrigger, reason: string): TriggerRoutingResult {
    const routedAt = new Date().toISOString();
    const rejected = this.result({
      disposition: "rejected",
      trigger,
      routedAt,
      reason,
    });
    void this.publishEvent({
      type: TRIGGER_EVENT_TYPES.rejected,
      occurredAt: routedAt,
      orchestrationId: this.orchestrationId,
      correlationId: trigger.correlationId,
      tenantId: trigger.tenantId,
      payload: { triggerId: trigger.triggerId, reason },
    });
    return rejected;
  }

  get engineMode(): "route-only" {
    return "route-only";
  }

  private assertNormalized(trigger: NormalizedTrigger): void {
    if (!trigger.triggerId?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_TRIGGER_ID",
        "triggerId is required",
      );
    }
    if (!trigger.triggerType?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_TRIGGER_TYPE",
        "triggerType is required",
        { triggerId: trigger.triggerId },
      );
    }
    if (!trigger.triggerSource) {
      throw new OrchestrationError(
        "validation",
        "MISSING_TRIGGER_SOURCE",
        "triggerSource is required",
        { triggerId: trigger.triggerId },
      );
    }
    if (!trigger.tenantId?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_TENANT",
        "tenantId is required",
        { triggerId: trigger.triggerId },
      );
    }
    if (!trigger.correlationId?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_CORRELATION_ID",
        "correlationId is required and distinct from triggerId",
        { triggerId: trigger.triggerId },
      );
    }
    if (!trigger.payloadRef?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_PAYLOAD_REF",
        "payloadRef is required — raw provider payloads are forbidden",
        { triggerId: trigger.triggerId },
      );
    }
    if (!trigger.occurredAt?.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_OCCURRED_AT",
        "occurredAt is required",
        { triggerId: trigger.triggerId },
      );
    }
    // Hard guard: reject accidental provider product leakage in source class field
    const forbidden = [
      "github",
      "gitlab",
      "bitbucket",
      "azure",
      "jenkins",
      "playwright",
    ];
    const source = String(trigger.triggerSource).toLowerCase();
    if (forbidden.some((name) => source.includes(name))) {
      throw new OrchestrationError(
        "validation",
        "PROVIDER_SPECIFIC_SOURCE",
        "triggerSource must be a provider-neutral source class, not a product name",
        { triggerSource: trigger.triggerSource },
      );
    }
  }

  private result(input: {
    readonly disposition: TriggerDisposition;
    readonly trigger: NormalizedTrigger;
    readonly routedAt: string;
    readonly qualityFlowId?: string;
    readonly bindingId?: string;
    readonly nextStage?: TriggerRoutingResult["nextStage"];
    readonly reason?: string;
  }): TriggerRoutingResult {
    return {
      disposition: input.disposition,
      triggerId: input.trigger.triggerId,
      correlationId: input.trigger.correlationId,
      causationId: input.trigger.causationId,
      qualityFlowId: input.qualityFlowId,
      bindingId: input.bindingId,
      nextStage: input.nextStage,
      reason: input.reason,
      routedAt: input.routedAt,
      identities: {
        triggerId: input.trigger.triggerId,
        correlationId: input.trigger.correlationId,
        causationId: input.trigger.causationId,
        qualityFlowId: input.qualityFlowId,
      },
    };
  }
}

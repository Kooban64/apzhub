import type { TenantId } from "./value-objects";

export type PlanEventType =
  | "qep.plan.created"
  | "qep.plan.updated"
  | "qep.plan.review.requested"
  | "qep.plan.approved"
  | "qep.plan.rejected"
  | "qep.plan.ready"
  | "qep.plan.started"
  | "qep.plan.completed"
  | "qep.plan.archived"
  | "qep.plan.cancelled"
  | "qep.plan.superseded"
  | "qep.plan.item.added"
  | "qep.plan.item.updated"
  | "qep.plan.item.removed";

export type PlanEventBase = {
  readonly eventId: string;
  readonly type: PlanEventType;
  readonly occurredAt: string;
  readonly tenantId: TenantId;
  readonly planId: string;
  readonly actorId: string;
  readonly correlationId?: string;
};

export type PlanCreatedEvent = PlanEventBase & {
  readonly type: "qep.plan.created";
  readonly number: string;
};

export type PlanUpdatedEvent = PlanEventBase & {
  readonly type: "qep.plan.updated";
  readonly revision: number;
};

export type PlanReviewRequestedEvent = PlanEventBase & {
  readonly type: "qep.plan.review.requested";
};

export type PlanApprovedEvent = PlanEventBase & {
  readonly type: "qep.plan.approved";
  readonly versionLabel: string;
};

export type PlanRejectedEvent = PlanEventBase & {
  readonly type: "qep.plan.rejected";
  readonly comment: string;
};

export type PlanReadyEvent = PlanEventBase & {
  readonly type: "qep.plan.ready";
};

export type PlanStartedEvent = PlanEventBase & {
  readonly type: "qep.plan.started";
};

export type PlanCompletedEvent = PlanEventBase & {
  readonly type: "qep.plan.completed";
};

export type PlanArchivedEvent = PlanEventBase & {
  readonly type: "qep.plan.archived";
};

export type PlanCancelledEvent = PlanEventBase & {
  readonly type: "qep.plan.cancelled";
};

export type PlanSupersededEvent = PlanEventBase & {
  readonly type: "qep.plan.superseded";
  readonly successorPlanId: string;
};

export type PlanItemAddedEvent = PlanEventBase & {
  readonly type: "qep.plan.item.added";
  readonly itemId: string;
  readonly specificationId: string;
};

export type PlanItemUpdatedEvent = PlanEventBase & {
  readonly type: "qep.plan.item.updated";
  readonly itemId: string;
};

export type PlanItemRemovedEvent = PlanEventBase & {
  readonly type: "qep.plan.item.removed";
  readonly itemId: string;
};

export type PlanDomainEvent =
  | PlanCreatedEvent
  | PlanUpdatedEvent
  | PlanReviewRequestedEvent
  | PlanApprovedEvent
  | PlanRejectedEvent
  | PlanReadyEvent
  | PlanStartedEvent
  | PlanCompletedEvent
  | PlanArchivedEvent
  | PlanCancelledEvent
  | PlanSupersededEvent
  | PlanItemAddedEvent
  | PlanItemUpdatedEvent
  | PlanItemRemovedEvent;

export const PLAN_DOMAIN_EVENT_TYPES = [
  "qep.plan.created",
  "qep.plan.updated",
  "qep.plan.review.requested",
  "qep.plan.approved",
  "qep.plan.rejected",
  "qep.plan.ready",
  "qep.plan.started",
  "qep.plan.completed",
  "qep.plan.archived",
  "qep.plan.cancelled",
  "qep.plan.superseded",
  "qep.plan.item.added",
  "qep.plan.item.updated",
  "qep.plan.item.removed",
] as const;

type BuildEventInput = {
  readonly type: PlanEventType;
  readonly tenantId: TenantId;
  readonly planId: string;
  readonly actorId: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly revision?: number;
  readonly number?: string;
  readonly versionLabel?: string;
  readonly comment?: string;
  readonly successorPlanId?: string;
  readonly itemId?: string;
  readonly specificationId?: string;
};

function buildEventId(input: BuildEventInput): string {
  return `${input.type}:${input.planId}:${input.occurredAt}:${input.revision ?? 0}`;
}

function buildBase<T extends PlanEventType>(
  input: BuildEventInput & { readonly type: T },
): PlanEventBase & { readonly type: T } {
  return {
    eventId: buildEventId(input),
    type: input.type,
    occurredAt: input.occurredAt,
    tenantId: input.tenantId,
    planId: input.planId,
    actorId: input.actorId,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  };
}

export function buildPlanCreatedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly number: string },
): PlanCreatedEvent {
  return { ...buildBase({ ...input, type: "qep.plan.created" }), number: input.number };
}

export function buildPlanUpdatedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly revision: number },
): PlanUpdatedEvent {
  return {
    ...buildBase({ ...input, type: "qep.plan.updated" }),
    revision: input.revision,
  };
}

export function buildPlanReviewRequestedEvent(
  input: Omit<BuildEventInput, "type">,
): PlanReviewRequestedEvent {
  return { ...buildBase({ ...input, type: "qep.plan.review.requested" }) };
}

export function buildPlanApprovedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly versionLabel: string },
): PlanApprovedEvent {
  return {
    ...buildBase({ ...input, type: "qep.plan.approved" }),
    versionLabel: input.versionLabel,
  };
}

export function buildPlanRejectedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly comment: string },
): PlanRejectedEvent {
  return {
    ...buildBase({ ...input, type: "qep.plan.rejected" }),
    comment: input.comment,
  };
}

export function buildPlanReadyEvent(
  input: Omit<BuildEventInput, "type">,
): PlanReadyEvent {
  return { ...buildBase({ ...input, type: "qep.plan.ready" }) };
}

export function buildPlanStartedEvent(
  input: Omit<BuildEventInput, "type">,
): PlanStartedEvent {
  return { ...buildBase({ ...input, type: "qep.plan.started" }) };
}

export function buildPlanCompletedEvent(
  input: Omit<BuildEventInput, "type">,
): PlanCompletedEvent {
  return { ...buildBase({ ...input, type: "qep.plan.completed" }) };
}

export function buildPlanArchivedEvent(
  input: Omit<BuildEventInput, "type">,
): PlanArchivedEvent {
  return { ...buildBase({ ...input, type: "qep.plan.archived" }) };
}

export function buildPlanCancelledEvent(
  input: Omit<BuildEventInput, "type">,
): PlanCancelledEvent {
  return { ...buildBase({ ...input, type: "qep.plan.cancelled" }) };
}

export function buildPlanSupersededEvent(
  input: Omit<BuildEventInput, "type"> & { readonly successorPlanId: string },
): PlanSupersededEvent {
  return {
    ...buildBase({ ...input, type: "qep.plan.superseded" }),
    successorPlanId: input.successorPlanId,
  };
}

export function buildPlanItemAddedEvent(
  input: Omit<BuildEventInput, "type"> & {
    readonly itemId: string;
    readonly specificationId: string;
  },
): PlanItemAddedEvent {
  return {
    ...buildBase({ ...input, type: "qep.plan.item.added" }),
    itemId: input.itemId,
    specificationId: input.specificationId,
  };
}

export function buildPlanItemUpdatedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly itemId: string },
): PlanItemUpdatedEvent {
  return {
    ...buildBase({ ...input, type: "qep.plan.item.updated" }),
    itemId: input.itemId,
  };
}

export function buildPlanItemRemovedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly itemId: string },
): PlanItemRemovedEvent {
  return {
    ...buildBase({ ...input, type: "qep.plan.item.removed" }),
    itemId: input.itemId,
  };
}

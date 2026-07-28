import { randomUUID } from "node:crypto";

import type { RequirementId } from "../value-objects/requirement-id";
import type { RequirementStatus } from "../value-objects/requirement-status";

export type QepDomainEventBase = {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly requirementId: RequirementId;
};

export type RequirementCreated = QepDomainEventBase & {
  readonly type: "qep.requirement.created";
  readonly key: string;
};

export type RequirementUpdated = QepDomainEventBase & {
  readonly type: "qep.requirement.updated";
};

export type RequirementArchived = QepDomainEventBase & {
  readonly type: "qep.requirement.archived";
};

export type RequirementApproved = QepDomainEventBase & {
  readonly type: "qep.requirement.approved";
  readonly status: RequirementStatus;
};

export type RequirementRejected = QepDomainEventBase & {
  readonly type: "qep.requirement.rejected";
  readonly reason?: string;
};

export type RequirementStateChanged = QepDomainEventBase & {
  readonly type: "qep.requirement.state_changed";
  readonly from: RequirementStatus;
  readonly to: RequirementStatus;
  readonly action: string;
  readonly reason?: string;
};

export type RequirementSubmitted = QepDomainEventBase & {
  readonly type: "qep.requirement.submitted";
  readonly from: RequirementStatus;
  readonly to: RequirementStatus;
};

export type RequirementImplemented = QepDomainEventBase & {
  readonly type: "qep.requirement.implemented";
  readonly from: RequirementStatus;
  readonly to: RequirementStatus;
};

export type RequirementVerified = QepDomainEventBase & {
  readonly type: "qep.requirement.verified";
  readonly from: RequirementStatus;
  readonly to: RequirementStatus;
};

export type RequirementDeprecated = QepDomainEventBase & {
  readonly type: "qep.requirement.deprecated";
  readonly from: RequirementStatus;
  readonly to: RequirementStatus;
};

export type RequirementVersionCreated = QepDomainEventBase & {
  readonly type: "qep.requirement.version_created";
  readonly version: import("../value-objects/requirement-version").RequirementVersion;
};

export type RequirementContentVersionCreated = QepDomainEventBase & {
  readonly type: "qep.requirement.content_version_created";
  readonly versionNumber: number;
  readonly contentVersionId: string;
  readonly sourceRevision: number;
  readonly changeReason: string;
};

export type RequirementBaselineCreated = QepDomainEventBase & {
  readonly type: "qep.requirement.baseline_created";
  readonly baselineId: string;
};

export type RequirementDomainEvent =
  | RequirementCreated
  | RequirementUpdated
  | RequirementArchived
  | RequirementApproved
  | RequirementRejected
  | RequirementStateChanged
  | RequirementSubmitted
  | RequirementImplemented
  | RequirementVerified
  | RequirementDeprecated
  | RequirementVersionCreated
  | RequirementContentVersionCreated
  | RequirementBaselineCreated;

export const REQUIREMENT_DOMAIN_EVENT_TYPES = [
  "qep.requirement.created",
  "qep.requirement.updated",
  "qep.requirement.archived",
  "qep.requirement.approved",
  "qep.requirement.rejected",
  "qep.requirement.state_changed",
  "qep.requirement.submitted",
  "qep.requirement.implemented",
  "qep.requirement.verified",
  "qep.requirement.deprecated",
  "qep.requirement.version_created",
  "qep.requirement.content_version_created",
  "qep.requirement.baseline_created",
] as const;

// Version comparison is read-only and recorded through Platform Audit only; it emits no domain mutation event.

type EventBuilderBase = {
  readonly tenantId: string;
  readonly requirementId: RequirementId;
  readonly correlationId: string;
  readonly occurredAt?: string;
  readonly eventId?: string;
};

function baseEvent(input: EventBuilderBase): QepDomainEventBase {
  return {
    eventId: input.eventId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    tenantId: input.tenantId,
    requirementId: input.requirementId,
  };
}

export function buildRequirementContentVersionCreatedEvent(
  input: EventBuilderBase & {
    readonly versionNumber: number;
    readonly contentVersionId: string;
    readonly sourceRevision: number;
    readonly changeReason: string;
  },
): RequirementContentVersionCreated {
  return {
    ...baseEvent(input),
    type: "qep.requirement.content_version_created",
    versionNumber: input.versionNumber,
    contentVersionId: input.contentVersionId,
    sourceRevision: input.sourceRevision,
    changeReason: input.changeReason,
  };
}

export function buildRequirementStateChangedEvent(
  input: EventBuilderBase & {
    readonly from: RequirementStatus;
    readonly to: RequirementStatus;
    readonly action: string;
    readonly reason?: string;
  },
): RequirementStateChanged {
  return {
    ...baseEvent(input),
    type: "qep.requirement.state_changed",
    from: input.from,
    to: input.to,
    action: input.action,
    reason: input.reason,
  };
}

export function buildRequirementSubmittedEvent(
  input: EventBuilderBase & {
    readonly from: RequirementStatus;
    readonly to: RequirementStatus;
  },
): RequirementSubmitted {
  return {
    ...baseEvent(input),
    type: "qep.requirement.submitted",
    from: input.from,
    to: input.to,
  };
}

export function buildRequirementApprovedEvent(
  input: EventBuilderBase & { readonly status: RequirementStatus },
): RequirementApproved {
  return {
    ...baseEvent(input),
    type: "qep.requirement.approved",
    status: input.status,
  };
}

export function buildRequirementRejectedEvent(
  input: EventBuilderBase & { readonly reason?: string },
): RequirementRejected {
  return {
    ...baseEvent(input),
    type: "qep.requirement.rejected",
    reason: input.reason,
  };
}

export function buildRequirementImplementedEvent(
  input: EventBuilderBase & {
    readonly from: RequirementStatus;
    readonly to: RequirementStatus;
  },
): RequirementImplemented {
  return {
    ...baseEvent(input),
    type: "qep.requirement.implemented",
    from: input.from,
    to: input.to,
  };
}

export function buildRequirementVerifiedEvent(
  input: EventBuilderBase & {
    readonly from: RequirementStatus;
    readonly to: RequirementStatus;
  },
): RequirementVerified {
  return {
    ...baseEvent(input),
    type: "qep.requirement.verified",
    from: input.from,
    to: input.to,
  };
}

export function buildRequirementDeprecatedEvent(
  input: EventBuilderBase & {
    readonly from: RequirementStatus;
    readonly to: RequirementStatus;
  },
): RequirementDeprecated {
  return {
    ...baseEvent(input),
    type: "qep.requirement.deprecated",
    from: input.from,
    to: input.to,
  };
}

export function buildRequirementArchivedEvent(
  input: EventBuilderBase,
): RequirementArchived {
  return {
    ...baseEvent(input),
    type: "qep.requirement.archived",
  };
}

export function buildRequirementLifecycleDomainEvent(input: {
  readonly tenantId: string;
  readonly requirementId: RequirementId;
  readonly correlationId: string;
  readonly action: string;
  readonly from: RequirementStatus;
  readonly to: RequirementStatus;
  readonly reason?: string;
  readonly occurredAt?: string;
  readonly eventId?: string;
}): RequirementDomainEvent {
  switch (input.action) {
    case "submit":
      return buildRequirementSubmittedEvent(input);
    case "approve":
      return buildRequirementApprovedEvent({ ...input, status: input.to });
    case "reject":
      return buildRequirementRejectedEvent(input);
    case "mark_implemented":
      return buildRequirementImplementedEvent(input);
    case "mark_verified":
      return buildRequirementVerifiedEvent(input);
    case "deprecate":
      return buildRequirementDeprecatedEvent(input);
    case "archive":
      return buildRequirementArchivedEvent(input);
    default:
      return buildRequirementStateChangedEvent(input);
  }
}

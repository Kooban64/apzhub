import { randomUUID } from "node:crypto";

import type { RequirementBaselineId } from "./requirement-baseline-id";
import type {
  RequirementBaselineIntegrityVerificationStatus,
} from "./requirement-baseline-integrity";
import type { RequirementBaselineItem } from "./requirement-baseline-item";

export type RequirementBaselineEventBase = {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly baselineId: RequirementBaselineId;
};

export type BaselineCreated = RequirementBaselineEventBase & {
  readonly type: "qep.requirement_baseline.created";
  readonly number: number;
  readonly name: string;
};

export type BaselineItemAdded = RequirementBaselineEventBase & {
  readonly type: "qep.requirement_baseline.item_added";
  readonly item: RequirementBaselineItem;
};

export type BaselineItemRemoved = RequirementBaselineEventBase & {
  readonly type: "qep.requirement_baseline.item_removed";
  readonly contentVersionId: string;
};

export type BaselineLocked = RequirementBaselineEventBase & {
  readonly type: "qep.requirement_baseline.locked";
};

export type BaselineArchived = RequirementBaselineEventBase & {
  readonly type: "qep.requirement_baseline.archived";
};

export type BaselineCompared = RequirementBaselineEventBase & {
  readonly type: "qep.requirement_baseline.compared";
  readonly otherBaselineId: RequirementBaselineId;
  readonly addedCount: number;
  readonly removedCount: number;
  readonly unchangedCount: number;
};

export type BaselineIntegrityVerified = RequirementBaselineEventBase & {
  readonly type: "qep.requirement_baseline.integrity_verified";
  readonly verificationStatus: RequirementBaselineIntegrityVerificationStatus;
};

export type RequirementBaselineDomainEvent =
  | BaselineCreated
  | BaselineItemAdded
  | BaselineItemRemoved
  | BaselineLocked
  | BaselineArchived
  | BaselineCompared
  | BaselineIntegrityVerified;

type BaselineEventInput = {
  readonly tenantId: string;
  readonly baselineId: RequirementBaselineId;
  readonly correlationId: string;
  readonly eventId?: string;
  readonly occurredAt?: string;
};

function baseEvent(input: BaselineEventInput): RequirementBaselineEventBase {
  return {
    eventId: input.eventId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    tenantId: input.tenantId,
    baselineId: input.baselineId,
  };
}

export function buildBaselineCreatedEvent(
  input: BaselineEventInput & { readonly number: number; readonly name: string },
): BaselineCreated {
  return { ...baseEvent(input), type: "qep.requirement_baseline.created", number: input.number, name: input.name };
}

export function buildBaselineItemAddedEvent(
  input: BaselineEventInput & { readonly item: RequirementBaselineItem },
): BaselineItemAdded {
  return { ...baseEvent(input), type: "qep.requirement_baseline.item_added", item: input.item };
}

export function buildBaselineItemRemovedEvent(
  input: BaselineEventInput & { readonly contentVersionId: string },
): BaselineItemRemoved {
  return {
    ...baseEvent(input),
    type: "qep.requirement_baseline.item_removed",
    contentVersionId: input.contentVersionId,
  };
}

export function buildBaselineLockedEvent(input: BaselineEventInput): BaselineLocked {
  return { ...baseEvent(input), type: "qep.requirement_baseline.locked" };
}

export function buildBaselineArchivedEvent(input: BaselineEventInput): BaselineArchived {
  return { ...baseEvent(input), type: "qep.requirement_baseline.archived" };
}

export function buildBaselineComparedEvent(
  input: BaselineEventInput & {
    readonly otherBaselineId: RequirementBaselineId;
    readonly addedCount: number;
    readonly removedCount: number;
    readonly unchangedCount: number;
  },
): BaselineCompared {
  return {
    ...baseEvent(input),
    type: "qep.requirement_baseline.compared",
    otherBaselineId: input.otherBaselineId,
    addedCount: input.addedCount,
    removedCount: input.removedCount,
    unchangedCount: input.unchangedCount,
  };
}

export function buildBaselineIntegrityVerifiedEvent(
  input: BaselineEventInput & {
    readonly verificationStatus: RequirementBaselineIntegrityVerificationStatus;
  },
): BaselineIntegrityVerified {
  return {
    ...baseEvent(input),
    type: "qep.requirement_baseline.integrity_verified",
    verificationStatus: input.verificationStatus,
  };
}

import { VerificationInvariantViolation } from "../../shared/errors";
import {
  createVerificationAuthority,
  type VerificationAuthority,
} from "./verification-authority";
import {
  createVerificationComment,
  type VerificationComment,
} from "./verification-comment";
import {
  createVerificationContext,
  type VerificationContext,
} from "./verification-context";
import {
  createVerificationDecision,
  type VerificationDecision,
} from "./verification-decision";
import {
  buildVerificationAssignedEvent,
  buildVerificationCancelledEvent,
  buildVerificationCompletedEvent,
  buildVerificationCreatedEvent,
  buildVerificationExpiredEvent,
  buildVerificationFailedEvent,
  buildVerificationRejectedEvent,
  buildVerificationRequestedEvent,
  buildVerificationRetiredEvent,
  buildVerificationStartedEvent,
  buildVerificationSupersededEvent,
  buildVerificationVerifiedEvent,
  buildVerificationWithdrawnEvent,
  type VerificationDomainEvent,
} from "./verification-events";
import {
  appendVerificationHistory,
  createEmptyVerificationHistory,
  type VerificationHistory,
} from "./verification-history";
import { createVerificationId, type VerificationId } from "./verification-id";
import { assertVerificationLifecycleTransition } from "./verification-lifecycle-state";
import {
  createVerificationMetadata,
  mergeVerificationMetadata,
  type VerificationMetadata,
} from "./verification-metadata";
import {
  createVerificationOrigin,
  type VerificationOrigin,
} from "./verification-origin";
import {
  createVerificationOutcome,
  FAILURE_VERIFICATION_OUTCOMES,
  SUCCESS_VERIFICATION_OUTCOMES,
  type VerificationOutcome,
} from "./verification-outcome";
import {
  createVerificationPriority,
  type VerificationPriority,
} from "./verification-priority";
import {
  createVerificationRationale,
  type VerificationRationale,
} from "./verification-rationale";
import {
  createVerificationReason,
  type VerificationReason,
} from "./verification-reason";
import {
  createVerificationResultSummary,
  type VerificationResultSummary,
} from "./verification-result-summary";
import { createVerificationScope, type VerificationScope } from "./verification-scope";
import type { VerificationStatus } from "./verification-status";
import {
  createVerificationSubject,
  type VerificationSubjectReference,
} from "./verification-subject";
import { createVerificationTimestamp } from "./verification-timestamp";
import { assertSupersession } from "./verification-policy";
import { PolicyService } from "./verification-domain-service";

/**
 * Verification aggregate root — governed decision record over an artefact
 * (APZQEP-ENG-040A / ARCH-009). Status ≠ Outcome: status is lifecycle position,
 * outcome is the decision reached and is only set on completion.
 */
export type Verification = {
  readonly id: VerificationId;
  readonly tenantId: string;
  readonly status: VerificationStatus;
  readonly outcome?: VerificationOutcome;
  readonly subject: VerificationSubjectReference;
  readonly authority: VerificationAuthority;
  readonly context: VerificationContext;
  readonly scope: VerificationScope;
  readonly priority: VerificationPriority;
  readonly origin: VerificationOrigin;
  readonly rationale?: VerificationRationale;
  readonly reason?: VerificationReason;
  readonly comment?: VerificationComment;
  readonly decision?: VerificationDecision;
  readonly resultSummary?: VerificationResultSummary;
  readonly metadata: VerificationMetadata;
  readonly history: VerificationHistory;
  readonly revision: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly assignedTo?: string;
  readonly assignedAt?: string;
  readonly startedAt?: string;
  readonly startedBy?: string;
  readonly completedAt?: string;
  readonly completedBy?: string;
  readonly expiredAt?: string;
  readonly withdrawnAt?: string;
  readonly cancelledAt?: string;
  readonly retiredAt?: string;
  readonly supersededAt?: string;
  readonly supersededBy?: string;
  readonly successorVerificationId?: VerificationId;
  readonly domainEvents: readonly VerificationDomainEvent[];
};

export type CreateVerificationInput = {
  readonly id: string;
  readonly tenantId: string;
  readonly subject: {
    readonly kind: string;
    readonly artefactId: string;
    readonly contentVersionId?: string;
    readonly baselineId?: string;
    readonly externalUri?: string;
  };
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly context?: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable?: boolean;
  };
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly priority?: string;
  readonly origin?: string;
  readonly rationale?: string;
  readonly reason?: string;
  readonly comment?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly correlationId: string;
};

const MUTABLE_STATUSES: readonly VerificationStatus[] = [
  "draft",
  "requested",
  "assigned",
  "in_progress",
];

function assertUpdatable(status: VerificationStatus): void {
  if (!MUTABLE_STATUSES.includes(status)) {
    throw new VerificationInvariantViolation(
      `Verification in ${status} state cannot be updated`,
    );
  }
}

function clearEvents(v: Verification): Verification {
  return { ...v, domainEvents: [] };
}

function eventInput(v: Verification, occurredAt: string) {
  return {
    tenantId: v.tenantId,
    verificationId: v.id,
    correlationId: v.correlationId,
    occurredAt,
  };
}

function withChange(
  v: Verification,
  patch: Partial<Verification>,
  changedAt: string,
  changedBy: string,
  historyKind: string,
  historySummary: string,
  events: readonly VerificationDomainEvent[],
): Verification {
  const at = createVerificationTimestamp(changedAt);
  const by = changedBy.trim();
  if (!by) {
    throw new VerificationInvariantViolation("Verification change requires changedBy");
  }
  return {
    ...v,
    ...patch,
    revision: v.revision + 1,
    updatedAt: at,
    updatedBy: by,
    history: appendVerificationHistory(v.history, {
      at,
      by,
      kind: historyKind,
      summary: historySummary,
    }),
    domainEvents: [...v.domainEvents, ...events],
  };
}

/**
 * Creates a Verification aggregate exclusively in `draft`, with no outcome.
 */
export function createVerification(input: CreateVerificationInput): Verification {
  const tenantId = input.tenantId.trim();
  const createdAt = createVerificationTimestamp(input.createdAt);
  const createdBy = input.createdBy.trim();
  const correlationId = input.correlationId.trim();
  if (!tenantId || !createdBy || !correlationId) {
    throw new VerificationInvariantViolation(
      "Verification requires tenantId, createdBy, and correlationId",
    );
  }

  const id = createVerificationId(input.id);
  const subject = createVerificationSubject(input.subject);
  const authority = createVerificationAuthority(input.authority);
  const context = createVerificationContext(input.context);
  const scope = createVerificationScope(input.scope ?? { kind: "tenant_global" });
  const priority = createVerificationPriority(input.priority ?? "medium");
  const origin = createVerificationOrigin(input.origin ?? "user");
  const rationale = input.rationale
    ? createVerificationRationale(input.rationale)
    : undefined;
  const reason = input.reason ? createVerificationReason(input.reason) : undefined;
  const comment = input.comment ? createVerificationComment(input.comment) : undefined;
  const metadata = createVerificationMetadata(input.metadata);

  PolicyService.runCreatePolicies({ subject, authority });

  const history = appendVerificationHistory(createEmptyVerificationHistory(), {
    at: createdAt,
    by: createdBy,
    kind: "created",
    summary: `Verification created as draft for ${subject.kind}:${subject.artefactId}`,
  });

  const createdEvent = buildVerificationCreatedEvent({
    tenantId,
    verificationId: id,
    correlationId,
    occurredAt: createdAt,
    status: "draft",
    subjectKind: subject.kind,
  });

  return {
    id,
    tenantId,
    status: "draft",
    subject,
    authority,
    context,
    scope,
    priority,
    origin,
    rationale,
    reason,
    comment,
    metadata,
    history,
    revision: 1,
    createdAt,
    createdBy,
    updatedAt: createdAt,
    updatedBy: createdBy,
    correlationId,
    domainEvents: [createdEvent],
  };
}

export function requestVerification(
  v: Verification,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "requested");
  const occurredAt = createVerificationTimestamp(at);
  return withChange(
    base,
    { status: "requested" },
    at,
    by,
    "requested",
    "Verification requested",
    [buildVerificationRequestedEvent(eventInput(base, occurredAt))],
  );
}

export function assignVerification(
  v: Verification,
  assigneeId: string,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "assigned");
  const trimmedAssignee = assigneeId.trim();
  if (!trimmedAssignee) {
    throw new VerificationInvariantViolation(
      "Verification assignment requires assigneeId",
    );
  }
  const occurredAt = createVerificationTimestamp(at);
  return withChange(
    base,
    { status: "assigned", assignedTo: trimmedAssignee, assignedAt: occurredAt },
    at,
    by,
    "assigned",
    `Verification assigned to ${trimmedAssignee}`,
    [
      buildVerificationAssignedEvent({
        ...eventInput(base, occurredAt),
        assigneeId: trimmedAssignee,
      }),
    ],
  );
}

export function startVerification(
  v: Verification,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "in_progress");
  const occurredAt = createVerificationTimestamp(at);
  const trimmedBy = by.trim();
  return withChange(
    base,
    { status: "in_progress", startedAt: occurredAt, startedBy: trimmedBy },
    at,
    by,
    "started",
    "Verification started",
    [buildVerificationStartedEvent(eventInput(base, occurredAt))],
  );
}

export type CompleteVerificationInput = {
  readonly outcome: string;
  readonly rationale?: string;
  readonly comment?: string;
};

/**
 * Records a successful verification decision. Accepts only success outcomes
 * (verified, partially_verified, waived). Emits `verified` and `completed`.
 */
export function verifyVerification(
  v: Verification,
  input: CompleteVerificationInput,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "verified");
  if (!input.outcome) {
    throw new VerificationInvariantViolation(
      "Verification outcome is required to complete",
    );
  }
  const outcome = createVerificationOutcome(input.outcome);
  if (!SUCCESS_VERIFICATION_OUTCOMES.includes(outcome)) {
    throw new VerificationInvariantViolation(
      `Verification cannot be completed as verified with outcome ${outcome}`,
    );
  }
  const rationale = input.rationale
    ? createVerificationRationale(input.rationale)
    : base.rationale;
  const comment = input.comment
    ? createVerificationComment(input.comment)
    : base.comment;
  PolicyService.runCompletePolicies("verified", outcome, rationale);

  const occurredAt = createVerificationTimestamp(at);
  const trimmedBy = by.trim();
  const decision = createVerificationDecision({
    outcome,
    decidedAt: occurredAt,
    decidedBy: trimmedBy,
    rationale,
    comment,
  });

  return withChange(
    base,
    {
      status: "verified",
      outcome,
      decision,
      rationale,
      comment,
      completedAt: occurredAt,
      completedBy: trimmedBy,
    },
    at,
    by,
    "verified",
    `Verification decided as ${outcome}`,
    [
      buildVerificationVerifiedEvent({ ...eventInput(base, occurredAt), outcome }),
      buildVerificationCompletedEvent({ ...eventInput(base, occurredAt), outcome }),
    ],
  );
}

const REJECT_OUTCOMES = FAILURE_VERIFICATION_OUTCOMES;

/**
 * Records a rejection decision. Accepts only failure outcomes
 * (failed, inconclusive, blocked). Emits `rejected` + `completed`, and
 * additionally `failed` when the outcome is specifically `failed`.
 */
export function rejectVerification(
  v: Verification,
  input: CompleteVerificationInput,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "rejected");
  if (!input.outcome) {
    throw new VerificationInvariantViolation(
      "Verification outcome is required to complete",
    );
  }
  const outcome = createVerificationOutcome(input.outcome);
  if (!REJECT_OUTCOMES.includes(outcome)) {
    throw new VerificationInvariantViolation(
      `Verification cannot be rejected with outcome ${outcome}`,
    );
  }
  const rationale = input.rationale
    ? createVerificationRationale(input.rationale)
    : base.rationale;
  const comment = input.comment
    ? createVerificationComment(input.comment)
    : base.comment;
  PolicyService.runCompletePolicies("rejected", outcome, rationale);

  const occurredAt = createVerificationTimestamp(at);
  const trimmedBy = by.trim();
  const decision = createVerificationDecision({
    outcome,
    decidedAt: occurredAt,
    decidedBy: trimmedBy,
    rationale,
    comment,
  });

  const events: VerificationDomainEvent[] = [
    buildVerificationRejectedEvent({ ...eventInput(base, occurredAt), outcome }),
    buildVerificationCompletedEvent({ ...eventInput(base, occurredAt), outcome }),
  ];
  if (outcome === "failed") {
    events.push(
      buildVerificationFailedEvent({ ...eventInput(base, occurredAt), outcome }),
    );
  }

  return withChange(
    base,
    {
      status: "rejected",
      outcome,
      decision,
      rationale,
      comment,
      completedAt: occurredAt,
      completedBy: trimmedBy,
    },
    at,
    by,
    "rejected",
    `Verification rejected as ${outcome}`,
    events,
  );
}

export function expireVerification(
  v: Verification,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "expired");
  const occurredAt = createVerificationTimestamp(at);
  return withChange(
    base,
    { status: "expired", expiredAt: occurredAt },
    at,
    by,
    "expired",
    "Verification expired",
    [buildVerificationExpiredEvent(eventInput(base, occurredAt))],
  );
}

export function withdrawVerification(
  v: Verification,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "withdrawn");
  const occurredAt = createVerificationTimestamp(at);
  return withChange(
    base,
    { status: "withdrawn", withdrawnAt: occurredAt },
    at,
    by,
    "withdrawn",
    "Verification withdrawn",
    [buildVerificationWithdrawnEvent(eventInput(base, occurredAt))],
  );
}

export function supersedeVerification(
  v: Verification,
  successorVerificationId: string,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "superseded");
  const successor = createVerificationId(successorVerificationId);
  assertSupersession(base.id, successor);
  const occurredAt = createVerificationTimestamp(at);
  return withChange(
    base,
    {
      status: "superseded",
      supersededAt: occurredAt,
      supersededBy: by.trim(),
      successorVerificationId: successor,
    },
    at,
    by,
    "superseded",
    `Verification superseded by ${successor}`,
    [
      buildVerificationSupersededEvent({
        ...eventInput(base, occurredAt),
        successorVerificationId: successor,
      }),
    ],
  );
}

export function cancelVerification(
  v: Verification,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "cancelled");
  const occurredAt = createVerificationTimestamp(at);
  return withChange(
    base,
    { status: "cancelled", cancelledAt: occurredAt },
    at,
    by,
    "cancelled",
    "Verification cancelled",
    [buildVerificationCancelledEvent(eventInput(base, occurredAt))],
  );
}

export function retireVerification(
  v: Verification,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertVerificationLifecycleTransition(base.status, "retired");
  const occurredAt = createVerificationTimestamp(at);
  return withChange(
    base,
    { status: "retired", retiredAt: occurredAt },
    at,
    by,
    "retired",
    "Verification retired",
    [buildVerificationRetiredEvent(eventInput(base, occurredAt))],
  );
}

export function updateRationale(
  v: Verification,
  rationale: string,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertUpdatable(base.status);
  const next = createVerificationRationale(rationale);
  return withChange(
    base,
    { rationale: next },
    at,
    by,
    "rationale_changed",
    "Verification rationale updated",
    [],
  );
}

export function updateMetadata(
  v: Verification,
  patch: Readonly<Record<string, string>>,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertUpdatable(base.status);
  const metadata = mergeVerificationMetadata(base.metadata, patch);
  return withChange(
    base,
    { metadata },
    at,
    by,
    "metadata_changed",
    "Verification metadata updated",
    [],
  );
}

export function updatePriority(
  v: Verification,
  priority: string,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertUpdatable(base.status);
  const next = createVerificationPriority(priority);
  return withChange(
    base,
    { priority: next },
    at,
    by,
    "priority_changed",
    `Verification priority set to ${next}`,
    [],
  );
}

export function updateResultSummary(
  v: Verification,
  summary: string,
  at: string,
  by: string,
): Verification {
  const base = clearEvents(v);
  assertUpdatable(base.status);
  const next = createVerificationResultSummary(summary);
  return withChange(
    base,
    { resultSummary: next },
    at,
    by,
    "result_summary_changed",
    "Verification result summary updated",
    [],
  );
}

import {
  canonicalizeExecutionStatus,
  canonicalizeTestStatus,
  type EvidenceLifecycleStatus,
  type ExecutionLifecycleStatus,
  type ExecutionStatus,
  type TestStatus,
} from "@apzhub/testing-contracts";

export class DomainRuleError extends Error {
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "DomainRuleError";
    this.code = code;
    this.details = details;
  }
}

/** Case lifecycle: draft → review → approved → deprecated → archived (+ ready≡approved). */
const CASE_TRANSITIONS: Readonly<Record<string, readonly string[]>> = {
  draft: ["review", "archived"],
  review: ["approved", "draft", "archived"],
  ready: ["deprecated", "archived", "review"],
  approved: ["deprecated", "archived", "review"],
  deprecated: ["archived", "approved"],
  archived: [],
};

export function canTransitionTestStatus(from: TestStatus, to: TestStatus): boolean {
  if (from === to) return true;
  const allowed = CASE_TRANSITIONS[from] ?? [];
  if (allowed.includes(to)) return true;
  const fromCanon = canonicalizeTestStatus(from);
  const toCanon = canonicalizeTestStatus(to);
  if (fromCanon === toCanon) return true;
  const allowedCanon = CASE_TRANSITIONS[String(fromCanon)] ?? [];
  return allowedCanon.includes(String(toCanon)) || allowedCanon.includes(to);
}

export function assertTestStatusTransition(from: TestStatus, to: TestStatus): void {
  if (!canTransitionTestStatus(from, to)) {
    throw new DomainRuleError(
      "invalid_status_transition",
      `Cannot transition test status from ${from} to ${to}`,
      { from, to },
    );
  }
}

/**
 * Formal manual execution status graph (canonical statuses).
 * Legacy statuses are canonicalized before lookup.
 */
const EXECUTION_TRANSITIONS: Readonly<
  Record<ExecutionLifecycleStatus, readonly ExecutionLifecycleStatus[]>
> = {
  draft: ["assigned", "cancelled", "archived"],
  assigned: ["ready", "draft", "cancelled", "in_progress"],
  ready: ["in_progress", "cancelled", "assigned"],
  in_progress: ["paused", "blocked", "completed", "cancelled"],
  paused: ["in_progress", "blocked", "cancelled"],
  blocked: ["in_progress", "cancelled"],
  completed: ["under_review", "archived", "in_progress"],
  under_review: ["approved", "rejected", "in_progress"],
  approved: ["archived", "under_review"],
  rejected: ["in_progress", "cancelled", "archived"],
  cancelled: ["archived", "draft"],
  archived: [],
};

export function canTransitionExecutionStatus(
  from: ExecutionStatus,
  to: ExecutionStatus,
): boolean {
  if (from === to) return true;
  const fromCanon = canonicalizeExecutionStatus(from);
  const toCanon = canonicalizeExecutionStatus(to);
  if (fromCanon === toCanon) return true;
  return (EXECUTION_TRANSITIONS[fromCanon] ?? []).includes(toCanon);
}

export function assertExecutionStatusTransition(
  from: ExecutionStatus,
  to: ExecutionStatus,
): void {
  if (!canTransitionExecutionStatus(from, to)) {
    throw new DomainRuleError(
      "invalid_execution_transition",
      `Cannot transition execution status from ${from} to ${to}`,
      { from, to },
    );
  }
}

export function nextStatusAfterCancel(_from: ExecutionStatus): ExecutionStatus {
  const from = canonicalizeExecutionStatus(_from);
  if (from === "completed" || from === "approved" || from === "archived") {
    throw new DomainRuleError(
      "invalid_execution_transition",
      `Cannot cancel an execution in status ${from}`,
      { from },
    );
  }
  if (!canTransitionExecutionStatus(_from, "cancelled")) {
    throw new DomainRuleError(
      "invalid_execution_transition",
      `Cannot cancel an execution in status ${from}`,
      { from },
    );
  }
  return "cancelled";
}

export function isTerminalExecutionStatus(status: ExecutionStatus): boolean {
  const canon = canonicalizeExecutionStatus(status);
  return canon === "archived" || canon === "cancelled";
}

export function isCompletedLikeExecutionStatus(status: ExecutionStatus): boolean {
  const canon = canonicalizeExecutionStatus(status);
  return (
    canon === "completed" ||
    canon === "under_review" ||
    canon === "approved" ||
    canon === "rejected" ||
    canon === "archived" ||
    canon === "cancelled"
  );
}

/** Evidence lifecycle transitions. */
const EVIDENCE_TRANSITIONS: Readonly<
  Record<EvidenceLifecycleStatus, readonly EvidenceLifecycleStatus[]>
> = {
  pending: ["captured", "archived"],
  captured: ["submitted", "archived"],
  submitted: ["verified", "rejected", "archived"],
  verified: ["approved", "rejected", "archived"],
  rejected: ["captured", "archived"],
  approved: ["archived"],
  archived: [],
};

export function canTransitionEvidenceLifecycle(
  from: EvidenceLifecycleStatus,
  to: EvidenceLifecycleStatus,
): boolean {
  if (from === to) return true;
  return (EVIDENCE_TRANSITIONS[from] ?? []).includes(to);
}

export function assertEvidenceLifecycleTransition(
  from: EvidenceLifecycleStatus,
  to: EvidenceLifecycleStatus,
): void {
  if (!canTransitionEvidenceLifecycle(from, to)) {
    throw new DomainRuleError(
      "invalid_evidence_transition",
      `Cannot transition evidence lifecycle from ${from} to ${to}`,
      { from, to },
    );
  }
}

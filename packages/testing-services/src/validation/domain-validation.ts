import {
  isApprovalStatus,
  isCaseVersionReason,
  isExecutionApprovalState,
  isLikelihood,
  isPriority,
  isTestResultStatus,
  isTestStatus,
  isTraceabilityEntityKind,
  type ApprovalStatus,
  type TraceabilityEntityKind,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";

export function assertNonEmpty(value: string | undefined, field: string): string {
  if (!value || value.trim().length === 0) {
    throw new DomainRuleError("validation", `${field} is required`, { field });
  }
  return value;
}

export function assertValidTestStatus(value: string): void {
  if (!isTestStatus(value)) {
    throw new DomainRuleError("validation", `Invalid test status: ${value}`);
  }
}

export function assertValidPriority(value: string): void {
  if (!isPriority(value)) {
    throw new DomainRuleError("validation", `Invalid priority: ${value}`);
  }
}

export function assertValidTestResultStatus(value: string): void {
  if (!isTestResultStatus(value)) {
    throw new DomainRuleError("validation", `Invalid result status: ${value}`);
  }
}

export function assertValidLikelihood(value: string): void {
  if (!isLikelihood(value)) {
    throw new DomainRuleError("validation", `Invalid likelihood: ${value}`);
  }
}

export function assertValidCaseVersionReason(value: string): void {
  if (!isCaseVersionReason(value)) {
    throw new DomainRuleError("validation", `Invalid version reason: ${value}`);
  }
}

export function assertValidExecutionApprovalState(value: string): void {
  if (!isExecutionApprovalState(value)) {
    throw new DomainRuleError("validation", `Invalid approval state: ${value}`);
  }
}

export function assertTraceabilityKinds(
  sourceKind: string,
  targetKind: string,
): void {
  if (sourceKind.length === 0) {
    throw new DomainRuleError("validation", "sourceKind is required");
  }
  if (targetKind.length === 0) {
    throw new DomainRuleError("validation", "targetKind is required");
  }
  if (sourceKind === targetKind) {
    // self-links allowed only for related kinds when ids differ — checked by caller
  }
}

export function assertNoSelfLink(
  sourceKind: string,
  sourceId: string,
  targetKind: string,
  targetId: string,
): void {
  if (sourceKind === targetKind && sourceId === targetId) {
    throw new DomainRuleError(
      "invalid_relationship",
      "Cannot create a self-referential traceability link",
      { sourceKind, sourceId },
    );
  }
}

export function assertApprovalDecisionAllowed(
  current: ApprovalStatus,
  next: ApprovalStatus,
): void {
  if (!isApprovalStatus(next)) {
    throw new DomainRuleError("validation", `Invalid approval status: ${next}`);
  }
  const allowed: Record<string, readonly string[]> = {
    pending: ["approved", "rejected", "withdrawn", "conditional", "rework"],
    rework: ["pending", "withdrawn"],
    approved: ["withdrawn"],
    rejected: ["rework", "pending"],
    conditional: ["approved", "withdrawn", "rework"],
    withdrawn: [],
  };
  if (current === next) return;
  if (!(allowed[current] ?? []).includes(next)) {
    throw new DomainRuleError(
      "invalid_approval_transition",
      `Cannot move approval from ${current} to ${next}`,
      { current, next },
    );
  }
}

export function assertOwnershipId(userId: string | undefined, field: string): void {
  assertNonEmpty(userId, field);
}

export function assertVersionBump(
  current: number | undefined,
  next: number | undefined,
): void {
  const from = current ?? 1;
  const to = next ?? from + 1;
  if (to <= from) {
    throw new DomainRuleError(
      "invalid_version",
      `Version must increase (current ${from}, next ${to})`,
      { from, to },
    );
  }
}

export function isKnownTraceabilityKind(
  kind: string,
): kind is TraceabilityEntityKind {
  return isTraceabilityEntityKind(kind);
}

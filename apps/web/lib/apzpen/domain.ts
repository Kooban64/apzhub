/**
 * Pure APZPEN business rules — no I/O.
 */

import type {
  Engagement,
  EngagementStatus,
  Finding,
  FindingStatus,
  RulesOfEngagement,
  SecurityPosture,
} from "./types";

export class ApzpenDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApzpenDomainError";
    this.code = code;
  }
}

const DEFAULT_ALLOWED = [
  "authenticated_testing",
  "manual_exploration",
  "automated_scanning_approved_targets",
  "api_testing",
] as const;

const DEFAULT_RESTRICTED = [
  "denial_of_service",
  "destructive_testing",
  "social_engineering",
  "data_exfiltration_beyond_proof",
  "persistence",
] as const;

export const CATALOGUE_ALLOWED_TECHNIQUES: readonly string[] = DEFAULT_ALLOWED;
export const CATALOGUE_RESTRICTED_TECHNIQUES: readonly string[] = DEFAULT_RESTRICTED;

export function defaultAllowedTechniques(): readonly string[] {
  return DEFAULT_ALLOWED;
}

export function defaultRestrictedTechniques(): readonly string[] {
  return DEFAULT_RESTRICTED;
}

export function assertRoeApproved(roe: RulesOfEngagement): void {
  if (roe.status !== "approved") {
    throw new ApzpenDomainError(
      "ROE_NOT_APPROVED",
      "Rules of Engagement must be approved before testing can start.",
    );
  }
}

export function canStartTesting(engagement: Engagement): boolean {
  return (
    engagement.roe.status === "approved" &&
    engagement.scope.length > 0 &&
    (engagement.status === "approved" ||
      engagement.status === "scoped" ||
      engagement.status === "draft")
  );
}

export function transitionEngagementStatus(
  current: EngagementStatus,
  next: EngagementStatus,
  roe: RulesOfEngagement,
  scopeCount: number,
): EngagementStatus {
  if (current === next) return current;

  if (current === "closed" || current === "certified") {
    throw new ApzpenDomainError(
      "ENGAGEMENT_TERMINAL",
      `Engagement is ${current} and cannot transition to ${next}.`,
    );
  }

  if (next === "in_progress") {
    if (roe.status !== "approved") {
      throw new ApzpenDomainError(
        "ROE_NOT_APPROVED",
        "Cannot start testing without approved Rules of Engagement.",
      );
    }
    if (scopeCount < 1) {
      throw new ApzpenDomainError(
        "SCOPE_EMPTY",
        "Cannot start testing without at least one scope target.",
      );
    }
  }

  if (next === "certified") {
    if (current !== "reporting" && current !== "remediating") {
      throw new ApzpenDomainError(
        "CERTIFY_PRECONDITION",
        "Certification requires reporting or remediating status.",
      );
    }
  }

  return next;
}

const FINDING_TRANSITIONS: Record<FindingStatus, readonly FindingStatus[]> = {
  open: [
    "remediating",
    "retest_requested",
    "risk_accepted",
    "false_positive",
    "closed",
  ],
  remediating: ["retest_requested", "open", "risk_accepted", "closed"],
  retest_requested: ["retest_passed", "retest_failed", "remediating"],
  retest_passed: ["closed"],
  retest_failed: ["remediating", "retest_requested", "risk_accepted"],
  closed: [],
  risk_accepted: ["closed", "open"],
  false_positive: ["closed", "open"],
};

export function transitionFindingStatus(
  current: FindingStatus,
  next: FindingStatus,
): FindingStatus {
  if (current === next) return current;
  const allowed = FINDING_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new ApzpenDomainError(
      "INVALID_FINDING_TRANSITION",
      `Cannot transition finding from ${current} to ${next}.`,
    );
  }
  return next;
}

export function computeSecurityPosture(
  engagement: Engagement,
  findings: readonly Finding[],
): SecurityPosture {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    openCount: 0,
    remediatingCount: 0,
    retestCount: 0,
    closedCount: 0,
  };

  for (const f of findings) {
    counts[f.severity] += 1;
    if (f.status === "open") counts.openCount += 1;
    if (f.status === "remediating") counts.remediatingCount += 1;
    if (f.status === "retest_requested" || f.status === "retest_failed") {
      counts.retestCount += 1;
    }
    if (
      f.status === "closed" ||
      f.status === "retest_passed" ||
      f.status === "risk_accepted" ||
      f.status === "false_positive"
    ) {
      counts.closedCount += 1;
    }
  }

  return {
    engagementId: engagement.engagementId,
    status: engagement.status,
    assessmentPosition: engagement.assessmentPosition,
    ...counts,
    roeApproved: engagement.roe.status === "approved",
    scopeCount: engagement.scope.length,
  };
}

export function deriveAssessmentPosition(
  engagement: Engagement,
  findings: readonly Finding[],
): Engagement["assessmentPosition"] {
  if (engagement.status === "certified") return "complete";
  if (engagement.status === "draft" || engagement.status === "scoped") {
    return "not_started";
  }
  const openCritical = findings.filter(
    (f) =>
      f.severity === "critical" &&
      f.status !== "closed" &&
      f.status !== "risk_accepted" &&
      f.status !== "false_positive" &&
      f.status !== "retest_passed",
  ).length;
  const openHigh = findings.filter(
    (f) =>
      f.severity === "high" &&
      f.status !== "closed" &&
      f.status !== "risk_accepted" &&
      f.status !== "false_positive" &&
      f.status !== "retest_passed",
  ).length;

  if (openCritical > 0) return "blocked";
  if (openHigh > 0) return "conditional";
  if (engagement.status === "in_progress" || engagement.status === "reporting") {
    return "in_progress";
  }
  if (engagement.status === "remediating") return "conditional";
  return "in_progress";
}

export function normalizeSeverity(raw: string | undefined): Finding["severity"] {
  const v = (raw ?? "info").toLowerCase();
  if (v === "critical" || v === "high" || v === "medium" || v === "low") {
    return v;
  }
  if (v === "error" || v === "blocker") return "critical";
  if (v === "warning" || v === "warn") return "medium";
  return "info";
}

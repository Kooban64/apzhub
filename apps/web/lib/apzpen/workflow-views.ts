/**
 * APZPEN workflow queues — persona work surfaces over findings/engagements.
 * Authority: APZPEN vision IA (Remediation · Retests · Evidence · Certification).
 */

import type { Engagement, Finding, FindingStatus, SecurityPosture } from "./types";

export type WorkflowQueueId = "remediation" | "retests" | "evidence" | "certification";

const REMEDIATION_STATUSES: readonly FindingStatus[] = ["open", "remediating"];

const RETEST_STATUSES: readonly FindingStatus[] = [
  "retest_requested",
  "retest_passed",
  "retest_failed",
];

export function isRemediationFinding(finding: Finding): boolean {
  return REMEDIATION_STATUSES.includes(finding.status);
}

export function isRetestFinding(finding: Finding): boolean {
  return RETEST_STATUSES.includes(finding.status);
}

export function findingNeedsEvidence(finding: Finding): boolean {
  if (finding.status === "closed" || finding.status === "false_positive") {
    return false;
  }
  return (finding.evidence?.length ?? 0) === 0;
}

export function findingHasEvidence(finding: Finding): boolean {
  return (finding.evidence?.length ?? 0) > 0;
}

export function filterRemediationQueue(
  findings: readonly Finding[],
): readonly Finding[] {
  return findings
    .filter(isRemediationFinding)
    .slice()
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

export function filterRetestQueue(findings: readonly Finding[]): readonly Finding[] {
  return findings
    .filter(isRetestFinding)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function filterRiskAcceptedQueue(
  findings: readonly Finding[],
): readonly Finding[] {
  return findings
    .filter((f) => f.status === "risk_accepted")
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function filterEvidenceGaps(findings: readonly Finding[]): readonly Finding[] {
  return findings.filter(findingNeedsEvidence);
}

export function filterEvidenceLibrary(
  findings: readonly Finding[],
): readonly Finding[] {
  return findings.filter(findingHasEvidence);
}

/**
 * Assignee work queue — open/active findings assigned to the given actor
 * (email or id). Matching is case-insensitive.
 */
export function filterMyWorkQueue(
  findings: readonly Finding[],
  assignee: string,
): readonly Finding[] {
  const needle = assignee.trim().toLowerCase();
  if (!needle) return [];
  return findings
    .filter((f) => {
      const assigned = f.assignedTo?.trim().toLowerCase();
      if (!assigned || assigned !== needle) return false;
      return (
        f.status !== "closed" &&
        f.status !== "false_positive" &&
        f.status !== "risk_accepted"
      );
    })
    .slice()
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

export type CertificationRow = {
  readonly engagementId: string;
  readonly title: string;
  readonly customerName: string;
  readonly applicationName: string;
  readonly status: Engagement["status"];
  readonly assessmentPosition: Engagement["assessmentPosition"];
  readonly openCount: number;
  readonly critical: number;
  readonly high: number;
  readonly canCertify: boolean;
  readonly blockers: readonly string[];
  readonly roeStatus: Engagement["roe"]["status"];
};

export function certificationBlockers(
  engagement: Engagement & { posture?: SecurityPosture },
): readonly string[] {
  const blockers: string[] = [];
  if (engagement.status === "certified") {
    return ["Already certified"];
  }
  if (engagement.roe.status !== "approved") {
    blockers.push("Rules of Engagement not approved");
  }
  if (engagement.scope.length < 1) {
    blockers.push("No scope targets");
  }
  const critical = engagement.posture?.critical ?? 0;
  if (critical > 0) {
    blockers.push(`${critical} open critical finding(s)`);
  }
  if (engagement.status === "draft" || engagement.status === "scoped") {
    blockers.push("Testing not started");
  }
  return blockers;
}

export function buildCertificationBoard(
  engagements: readonly (Engagement & { posture?: SecurityPosture })[],
): readonly CertificationRow[] {
  return engagements
    .map((e) => {
      const blockers = certificationBlockers(e);
      return {
        engagementId: e.engagementId,
        title: e.title,
        customerName: e.customerName,
        applicationName: e.applicationName,
        status: e.status,
        assessmentPosition: e.assessmentPosition,
        openCount: e.posture?.openCount ?? 0,
        critical: e.posture?.critical ?? 0,
        high: e.posture?.high ?? 0,
        canCertify: blockers.length === 0 && e.status !== "certified",
        blockers,
        roeStatus: e.roe.status,
      };
    })
    .slice()
    .sort((a, b) => {
      const rank = (row: CertificationRow) => {
        if (row.status === "certified") return 3;
        if (row.blockers.length > 0) return 0;
        if (row.assessmentPosition === "conditional") return 1;
        return 2;
      };
      return rank(a) - rank(b);
    });
}

export type WorkQueueSummary = {
  readonly remediationCount: number;
  readonly retestCount: number;
  readonly evidenceGapCount: number;
  readonly certifiedCount: number;
  readonly blockedCount: number;
  readonly criticalOpen: number;
  readonly highOpen: number;
};

export function summariseWorkQueues(input: {
  readonly findings: readonly Finding[];
  readonly engagements: readonly (Engagement & {
    posture?: SecurityPosture;
  })[];
}): WorkQueueSummary {
  const openFindings = input.findings.filter(
    (f) =>
      f.status !== "closed" &&
      f.status !== "false_positive" &&
      f.status !== "risk_accepted",
  );
  return {
    remediationCount: filterRemediationQueue(input.findings).length,
    retestCount: filterRetestQueue(input.findings).length,
    evidenceGapCount: filterEvidenceGaps(input.findings).length,
    certifiedCount: input.engagements.filter(
      (e) => e.status === "certified" || e.assessmentPosition === "complete",
    ).length,
    blockedCount: input.engagements.filter((e) => e.assessmentPosition === "blocked")
      .length,
    criticalOpen: openFindings.filter((f) => f.severity === "critical").length,
    highOpen: openFindings.filter((f) => f.severity === "high").length,
  };
}

function severityRank(severity: Finding["severity"]): number {
  switch (severity) {
    case "critical":
      return 5;
    case "high":
      return 4;
    case "medium":
      return 3;
    case "low":
      return 2;
    default:
      return 1;
  }
}

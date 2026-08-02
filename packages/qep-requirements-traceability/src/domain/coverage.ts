/**
 * Coverage Calculator — derived only. Never accept manual coverage writes.
 */

import type {
  CoverageSnapshot,
  RequirementNode,
  RequirementRisk,
  VerificationStatus,
} from "./types";

export type CoverageInputs = {
  readonly requirement: RequirementNode;
  readonly planCount: number;
  readonly sessionCount: number;
  readonly completedSessionCount: number;
  readonly evidenceCount: number;
  readonly defectCount: number;
  readonly openDefectCount: number;
  readonly failedSessionCount: number;
  readonly passedSessionCount: number;
  readonly now: string;
};

function clampPct(value: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function verificationStatus(input: CoverageInputs): VerificationStatus {
  if (input.sessionCount === 0) return "not_started";
  if (input.completedSessionCount === 0) return "in_progress";
  if (input.openDefectCount > 0 || input.failedSessionCount > 0) {
    if (input.passedSessionCount > 0) return "partial";
    return input.failedSessionCount > 0 ? "failed" : "blocked";
  }
  if (input.passedSessionCount > 0 && input.failedSessionCount === 0) {
    return "passed";
  }
  return "partial";
}

function highRiskGap(
  risk: RequirementRisk,
  suiteLinked: boolean,
  overall: number,
  openDefects: number,
): boolean {
  if (risk !== "critical" && risk !== "high") return false;
  return !suiteLinked || overall < 50 || openDefects > 0;
}

export function calculateCoverage(input: CoverageInputs): CoverageSnapshot {
  const suiteCount = input.requirement.suiteLinks.length;
  const suiteLinked = suiteCount > 0;
  const suiteCoverage = suiteLinked ? 100 : 0;
  const executionCoverage = suiteLinked
    ? clampPct(
        (input.completedSessionCount / Math.max(suiteCount, input.sessionCount, 1)) *
          100,
      )
    : 0;
  const evidenceCoverage =
    input.completedSessionCount > 0
      ? clampPct(
          (Math.min(input.evidenceCount, input.completedSessionCount) /
            input.completedSessionCount) *
            100,
        )
      : 0;
  const defectCoverage =
    input.defectCount === 0
      ? suiteLinked && input.completedSessionCount > 0
        ? 100
        : 0
      : clampPct(
          ((input.defectCount - input.openDefectCount) / input.defectCount) * 100,
        );

  const overallCoverage = clampPct(
    suiteCoverage * 0.3 +
      executionCoverage * 0.35 +
      evidenceCoverage * 0.2 +
      defectCoverage * 0.15,
  );

  const status = verificationStatus(input);

  return {
    requirementId: input.requirement.requirementId,
    calculatedAt: input.now,
    suiteLinked,
    suiteCount,
    planCount: input.planCount,
    sessionCount: input.sessionCount,
    completedSessionCount: input.completedSessionCount,
    evidenceCount: input.evidenceCount,
    defectCount: input.defectCount,
    openDefectCount: input.openDefectCount,
    suiteCoverage,
    executionCoverage,
    evidenceCoverage,
    defectCoverage,
    overallCoverage,
    verificationStatus: status,
    uncovered: !suiteLinked,
    highRiskGap: highRiskGap(
      input.requirement.risk,
      suiteLinked,
      overallCoverage,
      input.openDefectCount,
    ),
  };
}

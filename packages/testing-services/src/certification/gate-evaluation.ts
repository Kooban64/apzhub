import type {
  CertificationEvidenceLinks,
  CertificationGateOutcome,
  CertificationRecommendationCode,
} from "@apzhub/testing-contracts";

export interface GateEvaluationInput {
  readonly gateKey: string;
  readonly required?: boolean;
  readonly evidenceLinks?: CertificationEvidenceLinks;
  readonly coveragePercent?: number;
  readonly coverageThreshold?: number;
  readonly openCriticalDefectCount?: number;
  readonly executionCompletePercent?: number;
  readonly manualCompletePercent?: number;
  readonly automationCompletePercent?: number;
  readonly pendingApprovalCount?: number;
  readonly highRiskUnresolvedCount?: number;
  readonly complianceComplete?: boolean;
  readonly documentationComplete?: boolean;
  readonly dataAvailable?: boolean;
}

export interface GateEvaluationResult {
  readonly status: CertificationGateOutcome;
  readonly reason: string;
  readonly supportingEvidence: readonly string[];
  readonly traceabilityRefs: readonly string[];
  readonly details?: Readonly<Record<string, unknown>>;
}

function emptyLinks(): CertificationEvidenceLinks {
  return {
    requirementIds: [],
    planIds: [],
    suiteIds: [],
    caseIds: [],
    executionIds: [],
    evidenceIds: [],
    coverageIds: [],
    defectIds: [],
    riskIds: [],
    readinessSummaryIds: [],
    qualitySummaryIds: [],
  };
}

function unknownResult(gateKey: string, reason: string): GateEvaluationResult {
  return {
    status: "unknown",
    reason,
    supportingEvidence: [],
    traceabilityRefs: [],
    details: { gateKey, dataMissing: true },
  };
}

/** Deterministic, explainable gate evaluation — never auto-approves. */
export function evaluateCertificationGate(
  input: GateEvaluationInput,
): GateEvaluationResult {
  const links = input.evidenceLinks ?? emptyLinks();
  const threshold = input.coverageThreshold ?? 80;

  switch (input.gateKey) {
    case "execution_complete": {
      if (input.executionCompletePercent === undefined) {
        return unknownResult(input.gateKey, "Execution completeness data missing");
      }
      if (input.executionCompletePercent >= 100) {
        return {
          status: "pass",
          reason: "All executions complete",
          supportingEvidence: links.executionIds,
          traceabilityRefs: links.executionIds,
          details: { percent: input.executionCompletePercent },
        };
      }
      return {
        status: "fail",
        reason: `Execution completeness ${input.executionCompletePercent}% < 100%`,
        supportingEvidence: links.executionIds,
        traceabilityRefs: links.executionIds,
        details: { percent: input.executionCompletePercent },
      };
    }
    case "coverage_threshold": {
      if (input.coveragePercent === undefined) {
        return unknownResult(input.gateKey, "Coverage data missing");
      }
      if (input.coveragePercent >= threshold) {
        return {
          status: "pass",
          reason: `Coverage ${input.coveragePercent}% meets threshold ${threshold}%`,
          supportingEvidence: links.coverageIds,
          traceabilityRefs: links.coverageIds,
          details: { percent: input.coveragePercent, threshold },
        };
      }
      if (input.coveragePercent >= threshold * 0.9) {
        return {
          status: "warning",
          reason: `Coverage ${input.coveragePercent}% below threshold ${threshold}%`,
          supportingEvidence: links.coverageIds,
          traceabilityRefs: links.coverageIds,
          details: { percent: input.coveragePercent, threshold },
        };
      }
      return {
        status: "fail",
        reason: `Coverage ${input.coveragePercent}% below threshold ${threshold}%`,
        supportingEvidence: links.coverageIds,
        traceabilityRefs: links.coverageIds,
        details: { percent: input.coveragePercent, threshold },
      };
    }
    case "evidence_complete": {
      if (links.evidenceIds.length === 0 && input.dataAvailable === false) {
        return unknownResult(input.gateKey, "Evidence linkage data missing");
      }
      if (links.evidenceIds.length > 0) {
        return {
          status: "pass",
          reason: `${links.evidenceIds.length} evidence item(s) linked`,
          supportingEvidence: links.evidenceIds,
          traceabilityRefs: links.evidenceIds,
        };
      }
      return {
        status: "fail",
        reason: "No evidence linked to certification",
        supportingEvidence: [],
        traceabilityRefs: [],
      };
    }
    case "manual_testing_complete": {
      if (input.manualCompletePercent === undefined) {
        return unknownResult(input.gateKey, "Manual testing completeness missing");
      }
      return input.manualCompletePercent >= 100
        ? {
            status: "pass",
            reason: "Manual testing complete",
            supportingEvidence: links.executionIds,
            traceabilityRefs: links.executionIds,
            details: { percent: input.manualCompletePercent },
          }
        : {
            status: "fail",
            reason: `Manual testing ${input.manualCompletePercent}% incomplete`,
            supportingEvidence: links.executionIds,
            traceabilityRefs: links.executionIds,
            details: { percent: input.manualCompletePercent },
          };
    }
    case "automation_complete": {
      if (input.automationCompletePercent === undefined) {
        return unknownResult(input.gateKey, "Automation completeness missing");
      }
      return input.automationCompletePercent >= 100
        ? {
            status: "pass",
            reason: "Automation complete",
            supportingEvidence: links.executionIds,
            traceabilityRefs: links.executionIds,
            details: { percent: input.automationCompletePercent },
          }
        : {
            status: "warning",
            reason: `Automation ${input.automationCompletePercent}% incomplete`,
            supportingEvidence: links.executionIds,
            traceabilityRefs: links.executionIds,
            details: { percent: input.automationCompletePercent },
          };
    }
    case "approvals_complete": {
      if (input.pendingApprovalCount === undefined) {
        return unknownResult(input.gateKey, "Approval status data missing");
      }
      return input.pendingApprovalCount === 0
        ? {
            status: "pass",
            reason: "No pending approvals",
            supportingEvidence: [],
            traceabilityRefs: [],
            details: { pendingApprovalCount: 0 },
          }
        : {
            status: "fail",
            reason: `${input.pendingApprovalCount} pending approval(s)`,
            supportingEvidence: [],
            traceabilityRefs: [],
            details: { pendingApprovalCount: input.pendingApprovalCount },
          };
    }
    case "no_critical_defects": {
      if (input.openCriticalDefectCount === undefined) {
        return unknownResult(input.gateKey, "Defect data missing");
      }
      return input.openCriticalDefectCount === 0
        ? {
            status: "pass",
            reason: "No open critical defects",
            supportingEvidence: links.defectIds,
            traceabilityRefs: links.defectIds,
          }
        : {
            status: "fail",
            reason: `${input.openCriticalDefectCount} open critical defect(s)`,
            supportingEvidence: links.defectIds,
            traceabilityRefs: links.defectIds,
            details: { openCriticalDefectCount: input.openCriticalDefectCount },
          };
    }
    case "risk_accepted": {
      if (input.highRiskUnresolvedCount === undefined) {
        return unknownResult(input.gateKey, "Risk data missing");
      }
      return input.highRiskUnresolvedCount === 0
        ? {
            status: "pass",
            reason: "No unresolved high/critical risks",
            supportingEvidence: links.riskIds,
            traceabilityRefs: links.riskIds,
          }
        : {
            status: "warning",
            reason: `${input.highRiskUnresolvedCount} unresolved high/critical risk(s)`,
            supportingEvidence: links.riskIds,
            traceabilityRefs: links.riskIds,
          };
    }
    case "compliance_complete": {
      if (input.complianceComplete === undefined) {
        return unknownResult(input.gateKey, "Compliance status missing");
      }
      return input.complianceComplete
        ? {
            status: "pass",
            reason: "Compliance complete",
            supportingEvidence: [],
            traceabilityRefs: [],
          }
        : {
            status: "fail",
            reason: "Compliance incomplete",
            supportingEvidence: [],
            traceabilityRefs: [],
          };
    }
    case "documentation_complete": {
      if (input.documentationComplete === undefined) {
        return unknownResult(input.gateKey, "Documentation status missing");
      }
      return input.documentationComplete
        ? {
            status: "pass",
            reason: "Documentation complete",
            supportingEvidence: [],
            traceabilityRefs: [],
          }
        : {
            status: "fail",
            reason: "Documentation incomplete",
            supportingEvidence: [],
            traceabilityRefs: [],
          };
    }
    default: {
      // Custom gates: pass when evidence linked; unknown otherwise.
      if (links.evidenceIds.length > 0 || links.requirementIds.length > 0) {
        return {
          status: "pass",
          reason: `Custom gate ${input.gateKey} has supporting links`,
          supportingEvidence: [...links.evidenceIds, ...links.requirementIds],
          traceabilityRefs: [...links.evidenceIds, ...links.requirementIds],
        };
      }
      return unknownResult(
        input.gateKey,
        `Custom gate ${input.gateKey} has insufficient data`,
      );
    }
  }
}

export function mapGateOutcomesToRecommendation(
  outcomes: readonly {
    readonly gateKey: string;
    readonly status: CertificationGateOutcome;
    readonly required?: boolean;
  }[],
): {
  readonly code: CertificationRecommendationCode;
  readonly reasons: readonly string[];
} {
  const reasons: string[] = [];
  let requiredFails = 0;
  let requiredUnknown = 0;
  let requiredWarnings = 0;
  let optionalFails = 0;

  for (const outcome of outcomes) {
    const required = outcome.required !== false;
    if (outcome.status === "fail") {
      reasons.push(`Gate ${outcome.gateKey} failed`);
      if (required) requiredFails += 1;
      else optionalFails += 1;
    } else if (outcome.status === "unknown" || outcome.status === "pending") {
      reasons.push(`Gate ${outcome.gateKey} is ${outcome.status}`);
      if (required) requiredUnknown += 1;
    } else if (outcome.status === "warning") {
      reasons.push(`Gate ${outcome.gateKey} has warning`);
      if (required) requiredWarnings += 1;
    }
  }

  if (requiredFails > 0) {
    return { code: "blocked", reasons };
  }
  if (requiredUnknown > 0) {
    return {
      code: "not_ready",
      reasons: reasons.length ? reasons : ["Required gate data incomplete"],
    };
  }
  if (requiredWarnings > 0 || optionalFails > 0) {
    return {
      code: "conditionally_ready",
      reasons: reasons.length ? reasons : ["Warnings or optional failures present"],
    };
  }
  if (outcomes.length === 0) {
    return { code: "not_ready", reasons: ["No gate evaluations available"] };
  }
  // All required gates pass — advisory only; humans still authorize.
  return {
    code: "ready_for_approval",
    reasons: ["All required gates passed — advisory only; human approval required"],
  };
}

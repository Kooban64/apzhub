import type {
  CertificationExceptionRecord,
  CertificationOutcome,
  QualityFactSnapshot,
  QualityGateEvaluationRecord,
  ReadinessPosture,
  ReadinessSnapshot,
} from "./types";

/**
 * Failed Blocking Gate enforcement (Owner lock 7).
 *
 * FAILED BLOCKING GATE + NO VALID AUTHORISED EXCEPTION
 *   = GO prohibited AND CONDITIONAL_GO prohibited
 *
 * FAILED BLOCKING GATE + VALID AUTHORISED CERTIFICATION EXCEPTION
 *   = GO still prohibited; CONDITIONAL_GO may be authorised
 *
 * Ordinary GO requires every Blocking Gate to be Passed.
 * Not Evaluated Blocking Gates also prohibit GO and CONDITIONAL_GO.
 * NO_GO and DEFER remain available.
 */
export function assertCertificationOutcomeAllowed(input: {
  readonly outcome: CertificationOutcome;
  readonly blockingEvaluations: readonly QualityGateEvaluationRecord[];
  readonly exceptions: readonly CertificationExceptionRecord[];
}): void {
  const failed = input.blockingEvaluations.filter((row) => row.result === "failed");
  const notEvaluated = input.blockingEvaluations.filter(
    (row) => row.result === "not_evaluated",
  );
  const uncoveredFailed = failed.filter(
    (row) => !hasValidException(input.exceptions, row),
  );

  if (input.outcome === "NO_GO" || input.outcome === "DEFER") {
    return;
  }

  if (notEvaluated.length > 0) {
    throw new Error("certification.blocking_gate_not_evaluated");
  }

  if (input.outcome === "GO") {
    if (failed.length > 0) {
      throw new Error("certification.blocking_gate_go_prohibited");
    }
    return;
  }

  if (input.outcome === "CONDITIONAL_GO") {
    if (uncoveredFailed.length > 0) {
      throw new Error("certification.blocking_gate_conditional_go_prohibited");
    }
    return;
  }
}

export function hasValidException(
  exceptions: readonly CertificationExceptionRecord[],
  evaluation: QualityGateEvaluationRecord,
): boolean {
  return exceptions.some(
    (row) =>
      row.status === "authorised" &&
      row.gateEvaluationId === evaluation.id &&
      row.gateDefinitionId === evaluation.gateDefinitionId &&
      row.applicationId === evaluation.applicationId &&
      row.changeEventId === evaluation.changeEventId &&
      row.environmentId === evaluation.environmentId,
  );
}

export function deriveReadinessPosture(
  evaluations: readonly QualityGateEvaluationRecord[],
): ReadinessPosture {
  const blocking = evaluations.filter(
    (row) => row.definitionSnapshot.gateType === "blocking",
  );
  const nonBlocking = evaluations.filter(
    (row) => row.definitionSnapshot.gateType === "non_blocking",
  );
  if (blocking.some((row) => row.result === "failed")) return "not_ready";
  if (blocking.some((row) => row.result === "not_evaluated"))
    return "insufficient_data";
  if (nonBlocking.some((row) => row.result === "failed")) return "at_risk";
  if (evaluations.length === 0) return "insufficient_data";
  if (evaluations.some((row) => row.result === "not_evaluated"))
    return "insufficient_data";
  return "ready";
}

export function composeReadinessSnapshot(input: {
  readonly evaluations: readonly QualityGateEvaluationRecord[];
  readonly facts: QualityFactSnapshot;
  readonly composedAt: string;
}): ReadinessSnapshot {
  const posture = deriveReadinessPosture(input.evaluations);
  const blocking = input.evaluations.filter(
    (row) => row.definitionSnapshot.gateType === "blocking",
  );
  const nonBlocking = input.evaluations.filter(
    (row) => row.definitionSnapshot.gateType === "non_blocking",
  );
  return {
    posture,
    facts: input.facts,
    gateEvaluationIds: input.evaluations.map((row) => row.id),
    blockingFailed: blocking
      .filter((row) => row.result === "failed")
      .map((row) => row.id),
    blockingNotEvaluated: blocking
      .filter((row) => row.result === "not_evaluated")
      .map((row) => row.id),
    nonBlockingFailed: nonBlocking
      .filter((row) => row.result === "failed")
      .map((row) => row.id),
    composedAt: input.composedAt,
  };
}

export function observedFact(
  facts: QualityFactSnapshot,
  kind: QualityGateEvaluationRecord["definitionSnapshot"]["condition"]["kind"],
): { readonly available: boolean; readonly value: number } {
  switch (kind) {
    case "unresolved_blocking_risks":
      return { available: facts.risksAvailable, value: facts.unresolvedBlockingRisks };
    case "open_critical_defects":
      return { available: facts.defectsAvailable, value: facts.openCriticalDefects };
    case "open_quality_issues":
      return { available: facts.issuesAvailable, value: facts.openQualityIssues };
    case "failed_customer_executions":
      return {
        available: facts.executionsAvailable,
        value: facts.failedCustomerExecutions,
      };
    case "required_evidence_missing":
      return {
        available: facts.evidenceAvailable,
        value: facts.requiredEvidenceMissing,
      };
  }
}

export function evaluateCondition(input: {
  readonly expected: number;
  readonly observed: { readonly available: boolean; readonly value: number };
}): {
  readonly result: "passed" | "failed" | "not_evaluated";
  readonly reason: string;
} {
  if (!input.observed.available) {
    return {
      result: "not_evaluated",
      reason: `Condition not evaluated: required facts were not available (expected ${input.expected}).`,
    };
  }
  if (input.observed.value === input.expected) {
    return {
      result: "passed",
      reason: `Observed ${input.observed.value}; expected ${input.expected}.`,
    };
  }
  return {
    result: "failed",
    reason: `Observed ${input.observed.value}; expected ${input.expected}.`,
  };
}

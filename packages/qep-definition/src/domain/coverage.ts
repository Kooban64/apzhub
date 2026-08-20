import type {
  CoverageFacts,
  CoverageState,
  QepAcceptanceCriterion,
  QepCriterionVerificationLink,
  ResultState,
  VerificationResult,
} from "./types";

export function deriveCriterionCoverage(input: {
  readonly archived: boolean;
  readonly verificationCount: number;
  readonly latestResults: readonly (VerificationResult | undefined)[];
}): { readonly coverage: CoverageState; readonly result: ResultState } {
  if (input.archived) {
    return { coverage: "none", result: "unavailable" };
  }
  if (input.verificationCount === 0) {
    return { coverage: "gap", result: "unverified" };
  }

  const known = input.latestResults.filter((value): value is VerificationResult =>
    Boolean(value),
  );
  if (known.length === 0) {
    return { coverage: "covered", result: "unavailable" };
  }
  if (known.some((value) => value === "blocked")) {
    return { coverage: "covered", result: "blocked" };
  }
  if (known.every((value) => value === "pass")) {
    return { coverage: "covered", result: "pass" };
  }
  if (known.every((value) => value === "fail")) {
    return { coverage: "covered", result: "fail" };
  }
  return { coverage: "partial", result: "fail" };
}

export function isCoveredState(coverage: CoverageState): boolean {
  return coverage === "covered" || coverage === "partial";
}

export function deriveAggregateCoverage(
  criteria: readonly {
    readonly status: QepAcceptanceCriterion["status"];
    readonly coverage: CoverageState;
  }[],
): CoverageFacts {
  const active = criteria.filter((row) => row.status !== "archived");
  if (active.length === 0) {
    return {
      coverage: "none",
      result: "unverified",
      criterionCount: 0,
      coveredCount: 0,
      gapCount: 0,
    };
  }
  const coveredCount = active.filter((row) => isCoveredState(row.coverage)).length;
  const gapCount = active.filter((row) => row.coverage === "gap").length;
  let coverage: CoverageState = "partial";
  if (gapCount === 0) coverage = "covered";
  else if (coveredCount === 0) coverage = "gap";
  return {
    coverage,
    result: "unavailable",
    criterionCount: active.length,
    coveredCount,
    gapCount,
  };
}

export function latestResultsFor(
  links: readonly QepCriterionVerificationLink[],
): readonly (VerificationResult | undefined)[] {
  return links.map((link) => link.latestResult);
}

export function coverageLabel(coverage: CoverageState): string {
  if (coverage === "covered") return "Full";
  if (coverage === "partial") return "Partial";
  if (coverage === "gap") return "Gap";
  return "—";
}

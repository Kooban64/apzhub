import { DomainRuleError } from "../services/errors";

export function assertCoverageIntegrity(covered: number, total: number): void {
  if (total < 0 || covered < 0) {
    throw new DomainRuleError(
      "coverage_integrity",
      "Coverage counts must be non-negative",
    );
  }
  if (covered > total) {
    throw new DomainRuleError(
      "coverage_integrity",
      `Coverage integrity violated: covered (${covered}) > total (${total})`,
    );
  }
}

export function assertRelationshipId(entityId: string, field: string): void {
  if (!entityId || !entityId.trim()) {
    throw new DomainRuleError(
      "relationship_integrity",
      `${field} is required for defect relationship`,
    );
  }
}

export function assertReleaseCalculationInputs(input: {
  readonly hasPlanOrRelease: boolean;
}): void {
  if (!input.hasPlanOrRelease) {
    throw new DomainRuleError(
      "release_inputs",
      "Release readiness requires planId or releaseLabel",
    );
  }
}

export function assertRegressionInputs(input: {
  readonly baselineLabel: string;
  readonly currentLabel: string;
  readonly baselineResults: readonly unknown[];
  readonly currentResults: readonly unknown[];
}): void {
  if (!input.baselineLabel.trim() || !input.currentLabel.trim()) {
    throw new DomainRuleError(
      "regression_inputs",
      "baselineLabel and currentLabel are required",
    );
  }
  if (!Array.isArray(input.baselineResults) || !Array.isArray(input.currentResults)) {
    throw new DomainRuleError(
      "regression_inputs",
      "baselineResults and currentResults must be arrays",
    );
  }
}

export function assertDefectCreateInput(input: {
  readonly providerKind?: string;
  readonly status?: string;
}): void {
  if (!input.providerKind) {
    throw new DomainRuleError("defect_create", "providerKind is required");
  }
  if (!input.status) {
    throw new DomainRuleError("defect_create", "status is required");
  }
}

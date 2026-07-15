/** Labelled count surfaced by the platform testing dashboard. */
export interface TestingDashboardCount {
  readonly label: string;
  readonly count: number;
}

/** Labelled percentage surfaced by the platform testing dashboard. */
export interface TestingDashboardPercentage {
  readonly label: string;
  readonly percentage: number;
}

/**
 * Platform testing dashboard aggregate.
 *
 * This contract only carries typed labels and counts from testing domain outputs;
 * it does not define calculation formulas.
 */
export interface TestingDashboardSummary {
  readonly capturedAt: string;
  readonly totals: {
    readonly plans: number;
    readonly suites: number;
    readonly cases: number;
    readonly requirements: number;
    readonly executions: number;
    readonly evidence: number;
    readonly certifications: number;
    readonly defects: number;
  };
  readonly executionCounts: readonly TestingDashboardCount[];
  readonly evidenceCounts: readonly TestingDashboardCount[];
  readonly certificationCounts: readonly TestingDashboardCount[];
  readonly defectCounts: readonly TestingDashboardCount[];
  readonly coveragePercentages: readonly TestingDashboardPercentage[];
  readonly qualityCounts: readonly TestingDashboardCount[];
}

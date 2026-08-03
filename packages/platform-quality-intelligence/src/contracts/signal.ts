/** Calculated quality signal kinds derived from observations. */
export type QualitySignalKind =
  | "coverage_trend"
  | "failure_concentration"
  | "execution_instability"
  | "repository_activity"
  | "requirement_volatility"
  | "defect_recurrence"
  | "evidence_completeness"
  | "automation_health";

export type SignalTrend = "improving" | "stable" | "degrading" | "unknown";

/**
 * A calculated quality signal derived from one or more observations.
 */
export interface QualitySignal {
  readonly signalId: string;
  readonly tenantId: string;
  readonly kind: QualitySignalKind;
  readonly value: number;
  readonly trend: SignalTrend;
  readonly calculatedAt: string;
  readonly observationIds: readonly string[];
  readonly summary: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}

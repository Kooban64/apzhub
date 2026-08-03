/** Quality score dimension keys — derived by the engine, never manually editable. */
export type QualityScoreDimension =
  | "product"
  | "project"
  | "execution"
  | "requirement"
  | "automation"
  | "repository"
  | "evidence"
  | "overall";

export interface QualityScoreComponent {
  readonly dimension: QualityScoreDimension;
  readonly value: number;
  readonly weight: number;
  readonly sourceSignalIds?: readonly string[];
}

/**
 * Derived quality score (0–100) with dimensional breakdown.
 */
export interface QualityScore {
  readonly scoreId: string;
  readonly tenantId: string;
  readonly dimension: QualityScoreDimension;
  readonly value: number;
  readonly components: readonly QualityScoreComponent[];
  readonly calculatedAt: string;
  readonly derivedFrom: readonly string[];
  readonly providerIds: readonly string[];
}

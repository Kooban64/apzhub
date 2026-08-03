import type { ConfidenceAssessment } from "./confidence";
import type { IntelligenceProviderId } from "./provider";

export type RecommendationType =
  | "improve_evidence"
  | "run_regression"
  | "stabilize_execution"
  | "review_requirements"
  | "address_defects"
  | "increase_coverage"
  | "investigate_failures"
  | "general_quality";

export type RecommendationPriority = "low" | "medium" | "high" | "critical";

export type RecommendationStatus = "proposed" | "accepted" | "rejected" | "superseded";

export interface RecommendationLifecycle {
  readonly proposedAt: string;
  readonly updatedAt: string;
  readonly acceptedAt?: string;
  readonly rejectedAt?: string;
  readonly supersededAt?: string;
  readonly actedBy?: string;
}

/**
 * Provider-neutral quality recommendation with mandatory explainability linkage.
 */
export interface Recommendation {
  readonly recommendationId: string;
  readonly tenantId: string;
  readonly type: RecommendationType;
  readonly priority: RecommendationPriority;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
  readonly observationIds: readonly string[];
  readonly confidence: ConfidenceAssessment;
  readonly providerId: IntelligenceProviderId;
  readonly status: RecommendationStatus;
  readonly lifecycle: RecommendationLifecycle;
  readonly explanationId: string;
  readonly correlationId: string;
}

import type { ConfidenceAssessment } from "./confidence";
import type { IntelligenceProviderId } from "./provider";

/**
 * Mandatory explainability record attached to every recommendation.
 */
export interface Explanation {
  readonly explanationId: string;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
  readonly contributingObservationIds: readonly string[];
  readonly confidence: ConfidenceAssessment;
  readonly providerId: IntelligenceProviderId;
  readonly inputs: Readonly<Record<string, string | number | boolean>>;
  readonly decisionPath: readonly string[];
  readonly timestamp: string;
}

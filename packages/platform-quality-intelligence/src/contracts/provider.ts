import type { ConfidenceAssessment } from "./confidence";
import type { Explanation } from "./explainability";
import type { QualityObservation } from "./observation";
import type { Recommendation } from "./recommendation";
import type { QualityScore } from "./scoring";
import type { QualitySignal } from "./signal";

/** Active foundation provider identifiers. */
export type ActiveIntelligenceProviderId =
  "rules" | "statistical" | "historical" | "dummy_ai";

/** Placeholder provider identifiers for future waves. */
export type PlaceholderIntelligenceProviderId =
  "openai" | "claude" | "gemini" | "azure_openai" | "local_llm" | "risk_engine";

export type IntelligenceProviderId =
  ActiveIntelligenceProviderId | PlaceholderIntelligenceProviderId;

export type IntelligenceProviderKind =
  "ai" | "rules" | "statistical" | "risk" | "historical";

export type IntelligenceProviderStatus = "active" | "placeholder";

export interface IntelligenceProviderDescriptor {
  readonly providerId: IntelligenceProviderId;
  readonly name: string;
  readonly kind: IntelligenceProviderKind;
  readonly version: string;
  readonly status: IntelligenceProviderStatus;
  readonly capabilities: readonly string[];
}

export interface IntelligenceEvaluationContext {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly observations: readonly QualityObservation[];
  readonly signals: readonly QualitySignal[];
  readonly signal?: AbortSignal;
}

export interface ProviderRecommendationDraft {
  readonly type: Recommendation["type"];
  readonly priority: Recommendation["priority"];
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
  readonly observationIds: readonly string[];
  readonly confidence: ConfidenceAssessment;
  readonly explanation: Omit<Explanation, "explanationId" | "timestamp">;
}

export interface ProviderSignalContribution {
  readonly kind: QualitySignal["kind"];
  readonly value: number;
  readonly trend: QualitySignal["trend"];
  readonly summary: string;
  readonly observationIds: readonly string[];
}

export interface ProviderScoreContribution {
  readonly dimension: QualityScore["dimension"];
  readonly value: number;
  readonly weight: number;
  readonly sourceSignalIds?: readonly string[];
}

export interface IntelligenceEvaluationOutcome {
  readonly recommendations: readonly ProviderRecommendationDraft[];
  readonly signalContributions: readonly ProviderSignalContribution[];
  readonly scoreContributions: readonly ProviderScoreContribution[];
  readonly explanations: readonly Omit<Explanation, "explanationId" | "timestamp">[];
}

/**
 * Intelligence Provider Interface — all quality intelligence engines implement this.
 * The Quality Intelligence Engine depends only on this contract, never on AI SDKs.
 */
export interface IntelligenceProvider {
  readonly descriptor: IntelligenceProviderDescriptor;
  health(): Promise<{ readonly ok: boolean; readonly detail?: string }>;
  evaluate(
    context: IntelligenceEvaluationContext,
  ): Promise<IntelligenceEvaluationOutcome>;
}

export type IntelligenceProviderFactory = () => IntelligenceProvider;

export function isActiveIntelligenceProvider(provider: IntelligenceProvider): boolean {
  return provider.descriptor.status === "active";
}

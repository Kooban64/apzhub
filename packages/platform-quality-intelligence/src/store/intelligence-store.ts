import type { RecommendationAuditRecord } from "../contracts/audit";
import type { Explanation } from "../contracts/explainability";
import type { QualityObservation } from "../contracts/observation";
import type { Recommendation } from "../contracts/recommendation";
import type { QualityScore } from "../contracts/scoring";
import type { QualitySignal } from "../contracts/signal";

export class InMemoryIntelligenceStore {
  private readonly observations = new Map<string, QualityObservation>();
  private readonly signals = new Map<string, QualitySignal>();
  private readonly recommendations = new Map<string, Recommendation>();
  private readonly explanations = new Map<string, Explanation>();
  private readonly scores = new Map<string, QualityScore>();
  private readonly audits: RecommendationAuditRecord[] = [];

  recordObservation(observation: QualityObservation): QualityObservation {
    if (this.observations.has(observation.observationId)) {
      throw new Error(
        `Observation already exists and is immutable: ${observation.observationId}`,
      );
    }
    this.observations.set(observation.observationId, observation);
    return observation;
  }

  listObservations(tenantId?: string): readonly QualityObservation[] {
    const all = [...this.observations.values()];
    return tenantId ? all.filter((o) => o.tenantId === tenantId) : all;
  }

  getObservation(observationId: string): QualityObservation | undefined {
    return this.observations.get(observationId);
  }

  saveSignal(signal: QualitySignal): QualitySignal {
    this.signals.set(signal.signalId, signal);
    return signal;
  }

  listSignals(tenantId?: string): readonly QualitySignal[] {
    const all = [...this.signals.values()];
    return tenantId ? all.filter((s) => s.tenantId === tenantId) : all;
  }

  getSignal(signalId: string): QualitySignal | undefined {
    return this.signals.get(signalId);
  }

  saveRecommendation(recommendation: Recommendation): Recommendation {
    this.recommendations.set(recommendation.recommendationId, recommendation);
    return recommendation;
  }

  updateRecommendation(recommendation: Recommendation): Recommendation {
    if (!this.recommendations.has(recommendation.recommendationId)) {
      throw new Error(`Recommendation not found: ${recommendation.recommendationId}`);
    }
    this.recommendations.set(recommendation.recommendationId, recommendation);
    return recommendation;
  }

  listRecommendations(tenantId?: string): readonly Recommendation[] {
    const all = [...this.recommendations.values()];
    return tenantId ? all.filter((r) => r.tenantId === tenantId) : all;
  }

  getRecommendation(recommendationId: string): Recommendation | undefined {
    return this.recommendations.get(recommendationId);
  }

  saveExplanation(explanation: Explanation): Explanation {
    this.explanations.set(explanation.explanationId, explanation);
    return explanation;
  }

  listExplanations(tenantId?: string): readonly Explanation[] {
    const all = [...this.explanations.values()];
    if (!tenantId) {
      return all;
    }
    const recommendationIds = new Set(
      this.listRecommendations(tenantId).map((r) => r.explanationId),
    );
    return all.filter((e) => recommendationIds.has(e.explanationId));
  }

  getExplanation(explanationId: string): Explanation | undefined {
    return this.explanations.get(explanationId);
  }

  saveScore(score: QualityScore): QualityScore {
    this.scores.set(score.scoreId, score);
    return score;
  }

  listScores(tenantId?: string): readonly QualityScore[] {
    const all = [...this.scores.values()];
    return tenantId ? all.filter((s) => s.tenantId === tenantId) : all;
  }

  getScore(scoreId: string): QualityScore | undefined {
    return this.scores.get(scoreId);
  }

  getLatestScoreByDimension(
    tenantId: string,
    dimension: QualityScore["dimension"],
  ): QualityScore | undefined {
    const matches = this.listScores(tenantId).filter((s) => s.dimension === dimension);
    return matches.sort((a, b) => b.calculatedAt.localeCompare(a.calculatedAt))[0];
  }

  recordAudit(audit: RecommendationAuditRecord): RecommendationAuditRecord {
    this.audits.unshift(audit);
    return audit;
  }

  listAudits(tenantId?: string): readonly RecommendationAuditRecord[] {
    return tenantId
      ? this.audits.filter((audit) => audit.tenantId === tenantId)
      : [...this.audits];
  }
}

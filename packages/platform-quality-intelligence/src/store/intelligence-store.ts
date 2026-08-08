import type { RecommendationAuditRecord } from "../contracts/audit";
import type { Explanation } from "../contracts/explainability";
import type { QualityObservation } from "../contracts/observation";
import type { Recommendation } from "../contracts/recommendation";
import type { QualityScore } from "../contracts/scoring";
import type { QualitySignal } from "../contracts/signal";

/**
 * Quality Intelligence Source of Record port (QX-PR-03).
 * Production implementations must survive process restart.
 */
export interface IntelligenceStore {
  recordObservation(observation: QualityObservation): Promise<QualityObservation>;
  listObservations(tenantId?: string): Promise<readonly QualityObservation[]>;
  getObservation(observationId: string): Promise<QualityObservation | undefined>;

  saveSignal(signal: QualitySignal): Promise<QualitySignal>;
  listSignals(tenantId?: string): Promise<readonly QualitySignal[]>;
  getSignal(signalId: string): Promise<QualitySignal | undefined>;

  saveRecommendation(recommendation: Recommendation): Promise<Recommendation>;
  updateRecommendation(recommendation: Recommendation): Promise<Recommendation>;
  listRecommendations(tenantId?: string): Promise<readonly Recommendation[]>;
  getRecommendation(recommendationId: string): Promise<Recommendation | undefined>;

  saveExplanation(explanation: Explanation, tenantId: string): Promise<Explanation>;
  listExplanations(tenantId?: string): Promise<readonly Explanation[]>;
  getExplanation(explanationId: string): Promise<Explanation | undefined>;

  saveScore(score: QualityScore): Promise<QualityScore>;
  listScores(tenantId?: string): Promise<readonly QualityScore[]>;
  getScore(scoreId: string): Promise<QualityScore | undefined>;
  getLatestScoreByDimension(
    tenantId: string,
    dimension: QualityScore["dimension"],
  ): Promise<QualityScore | undefined>;

  recordAudit(audit: RecommendationAuditRecord): Promise<RecommendationAuditRecord>;
  listAudits(tenantId?: string): Promise<readonly RecommendationAuditRecord[]>;
}

/** Process-local store — allowed in development/tests only. */
export class InMemoryIntelligenceStore implements IntelligenceStore {
  private readonly observations = new Map<string, QualityObservation>();
  private readonly signals = new Map<string, QualitySignal>();
  private readonly recommendations = new Map<string, Recommendation>();
  private readonly explanations = new Map<string, Explanation>();
  private readonly scores = new Map<string, QualityScore>();
  private readonly audits: RecommendationAuditRecord[] = [];

  async recordObservation(
    observation: QualityObservation,
  ): Promise<QualityObservation> {
    if (this.observations.has(observation.observationId)) {
      throw new Error(
        `Observation already exists and is immutable: ${observation.observationId}`,
      );
    }
    this.observations.set(observation.observationId, observation);
    return observation;
  }

  async listObservations(tenantId?: string): Promise<readonly QualityObservation[]> {
    const all = [...this.observations.values()];
    return tenantId ? all.filter((o) => o.tenantId === tenantId) : all;
  }

  async getObservation(observationId: string): Promise<QualityObservation | undefined> {
    return this.observations.get(observationId);
  }

  async saveSignal(signal: QualitySignal): Promise<QualitySignal> {
    this.signals.set(signal.signalId, signal);
    return signal;
  }

  async listSignals(tenantId?: string): Promise<readonly QualitySignal[]> {
    const all = [...this.signals.values()];
    return tenantId ? all.filter((s) => s.tenantId === tenantId) : all;
  }

  async getSignal(signalId: string): Promise<QualitySignal | undefined> {
    return this.signals.get(signalId);
  }

  async saveRecommendation(recommendation: Recommendation): Promise<Recommendation> {
    this.recommendations.set(recommendation.recommendationId, recommendation);
    return recommendation;
  }

  async updateRecommendation(recommendation: Recommendation): Promise<Recommendation> {
    if (!this.recommendations.has(recommendation.recommendationId)) {
      throw new Error(`Recommendation not found: ${recommendation.recommendationId}`);
    }
    this.recommendations.set(recommendation.recommendationId, recommendation);
    return recommendation;
  }

  async listRecommendations(tenantId?: string): Promise<readonly Recommendation[]> {
    const all = [...this.recommendations.values()];
    return tenantId ? all.filter((r) => r.tenantId === tenantId) : all;
  }

  async getRecommendation(
    recommendationId: string,
  ): Promise<Recommendation | undefined> {
    return this.recommendations.get(recommendationId);
  }

  async saveExplanation(
    explanation: Explanation,
    tenantId: string,
  ): Promise<Explanation> {
    this.explanations.set(explanation.explanationId, explanation);
    void tenantId;
    return explanation;
  }

  async listExplanations(tenantId?: string): Promise<readonly Explanation[]> {
    const all = [...this.explanations.values()];
    if (!tenantId) {
      return all;
    }
    const recommendationIds = new Set(
      (await this.listRecommendations(tenantId)).map((r) => r.explanationId),
    );
    return all.filter((e) => recommendationIds.has(e.explanationId));
  }

  async getExplanation(explanationId: string): Promise<Explanation | undefined> {
    return this.explanations.get(explanationId);
  }

  async saveScore(score: QualityScore): Promise<QualityScore> {
    this.scores.set(score.scoreId, score);
    return score;
  }

  async listScores(tenantId?: string): Promise<readonly QualityScore[]> {
    const all = [...this.scores.values()];
    return tenantId ? all.filter((s) => s.tenantId === tenantId) : all;
  }

  async getScore(scoreId: string): Promise<QualityScore | undefined> {
    return this.scores.get(scoreId);
  }

  async getLatestScoreByDimension(
    tenantId: string,
    dimension: QualityScore["dimension"],
  ): Promise<QualityScore | undefined> {
    const matches = (await this.listScores(tenantId)).filter(
      (s) => s.dimension === dimension,
    );
    return matches.sort((a, b) => b.calculatedAt.localeCompare(a.calculatedAt))[0];
  }

  async recordAudit(
    audit: RecommendationAuditRecord,
  ): Promise<RecommendationAuditRecord> {
    this.audits.unshift(audit);
    return audit;
  }

  async listAudits(tenantId?: string): Promise<readonly RecommendationAuditRecord[]> {
    return tenantId
      ? this.audits.filter((audit) => audit.tenantId === tenantId)
      : [...this.audits];
  }
}

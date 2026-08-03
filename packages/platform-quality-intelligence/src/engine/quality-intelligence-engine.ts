import { randomUUID } from "node:crypto";

import type {
  RecommendationAuditRecord,
  RecommendationHistoryEntry,
} from "../contracts/audit";
import type { ConfidenceAssessment } from "../contracts/confidence";
import { clampConfidenceNumeric } from "../contracts/confidence";
import type { QiEventPublisher } from "../contracts/events";
import { QI_EVENT_TYPES } from "../contracts/events";
import type { Explanation } from "../contracts/explainability";
import type {
  RecordObservationRequest,
  QualityObservation,
} from "../contracts/observation";
import type {
  IntelligenceEvaluationContext,
  IntelligenceProviderId,
  ProviderRecommendationDraft,
} from "../contracts/provider";
import type { Recommendation } from "../contracts/recommendation";
import type { QualityScore, QualityScoreDimension } from "../contracts/scoring";
import type { QualitySignal, QualitySignalKind } from "../contracts/signal";
import type { IntelligenceProviderRegistry } from "../registry/provider-registry";
import { InMemoryIntelligenceStore } from "../store/intelligence-store";
import { assessConfidence } from "./confidence-engine";

export interface QualityIntelligenceEngineOptions {
  readonly registry: IntelligenceProviderRegistry;
  readonly store?: InMemoryIntelligenceStore;
  readonly publishEvent?: QiEventPublisher;
}

const ACTIVE_PROVIDER_IDS: readonly IntelligenceProviderId[] = [
  "rules",
  "statistical",
  "historical",
  "dummy_ai",
];

export class QualityIntelligenceEngine {
  private readonly registry: IntelligenceProviderRegistry;
  private readonly store: InMemoryIntelligenceStore;
  private readonly publishEvent: QiEventPublisher;
  private readonly acceptedCount = new Map<string, number>();
  private readonly rejectedCount = new Map<string, number>();

  constructor(options: QualityIntelligenceEngineOptions) {
    this.registry = options.registry;
    this.store = options.store ?? new InMemoryIntelligenceStore();
    this.publishEvent = options.publishEvent ?? (async () => undefined);
  }

  listProviders() {
    return this.registry.list();
  }

  listObservations(tenantId?: string) {
    return this.store.listObservations(tenantId);
  }

  getObservation(observationId: string) {
    return this.store.getObservation(observationId);
  }

  listSignals(tenantId?: string) {
    return this.store.listSignals(tenantId);
  }

  getSignal(signalId: string) {
    return this.store.getSignal(signalId);
  }

  listRecommendations(tenantId?: string) {
    return this.store.listRecommendations(tenantId);
  }

  getRecommendation(recommendationId: string) {
    return this.store.getRecommendation(recommendationId);
  }

  listExplanations(tenantId?: string) {
    return this.store.listExplanations(tenantId);
  }

  getExplanation(explanationId: string) {
    return this.store.getExplanation(explanationId);
  }

  listScores(tenantId?: string) {
    return this.store.listScores(tenantId);
  }

  getScore(scoreId: string) {
    return this.store.getScore(scoreId);
  }

  listAudits(tenantId?: string): readonly RecommendationAuditRecord[] {
    return this.store.listAudits(tenantId);
  }

  listHistory(tenantId?: string): readonly RecommendationHistoryEntry[] {
    return this.store.listRecommendations(tenantId).map((recommendation) => ({
      recommendationId: recommendation.recommendationId,
      tenantId: recommendation.tenantId,
      type: recommendation.type,
      priority: recommendation.priority,
      status: recommendation.status,
      providerId: recommendation.providerId,
      confidenceLevel: recommendation.confidence.level,
      confidenceNumeric: recommendation.confidence.numeric,
      proposedAt: recommendation.lifecycle.proposedAt,
      updatedAt: recommendation.lifecycle.updatedAt,
      acceptedAt: recommendation.lifecycle.acceptedAt,
      rejectedAt: recommendation.lifecycle.rejectedAt,
      actedBy: recommendation.lifecycle.actedBy,
      reason: recommendation.reason,
    }));
  }

  listConfidence(tenantId?: string): readonly {
    readonly recommendationId: string;
    readonly providerId: IntelligenceProviderId;
    readonly confidence: ConfidenceAssessment;
  }[] {
    return this.store.listRecommendations(tenantId).map((recommendation) => ({
      recommendationId: recommendation.recommendationId,
      providerId: recommendation.providerId,
      confidence: recommendation.confidence,
    }));
  }

  async recordObservation(
    request: RecordObservationRequest,
  ): Promise<QualityObservation> {
    const observation: QualityObservation = Object.freeze({
      observationId: randomUUID(),
      tenantId: request.tenantId,
      source: request.source,
      kind: request.kind,
      summary: request.summary,
      recordedAt: new Date().toISOString(),
      correlationId: request.correlationId,
      evidenceRefs: request.evidenceRefs
        ? Object.freeze([...request.evidenceRefs])
        : undefined,
      metadata: request.metadata ? Object.freeze({ ...request.metadata }) : undefined,
      severity: request.severity,
    });

    this.store.recordObservation(observation);
    await this.emit({
      type: QI_EVENT_TYPES.observationCreated,
      occurredAt: observation.recordedAt,
      tenantId: observation.tenantId,
      correlationId: observation.correlationId,
      observationId: observation.observationId,
      payload: { source: observation.source, kind: observation.kind },
    });
    return observation;
  }

  async calculateSignals(
    tenantId: string,
    correlationId: string,
  ): Promise<readonly QualitySignal[]> {
    const observations = this.store.listObservations(tenantId);
    const context: IntelligenceEvaluationContext = {
      tenantId,
      correlationId,
      observations,
      signals: [],
    };

    const signalMap = new Map<QualitySignalKind, QualitySignal>();
    const now = new Date().toISOString();

    for (const providerId of ["statistical", "historical"] as const) {
      const provider = this.registry.require(providerId);
      if (provider.descriptor.status !== "active") {
        continue;
      }
      const outcome = await provider.evaluate(context);
      for (const contribution of outcome.signalContributions) {
        const existing = signalMap.get(contribution.kind);
        const observationIds = [
          ...new Set([
            ...(existing?.observationIds ?? []),
            ...contribution.observationIds,
          ]),
        ];
        const signal: QualitySignal = {
          signalId: existing?.signalId ?? randomUUID(),
          tenantId,
          kind: contribution.kind,
          value: existing
            ? clampConfidenceNumeric(
                Math.round((existing.value + contribution.value) / 2),
              )
            : contribution.value,
          trend: contribution.trend,
          calculatedAt: now,
          observationIds,
          summary: contribution.summary,
        };
        signalMap.set(contribution.kind, signal);
      }
    }

    const signals = [...signalMap.values()];
    for (const signal of signals) {
      this.store.saveSignal(signal);
      await this.emit({
        type: QI_EVENT_TYPES.signalCalculated,
        occurredAt: signal.calculatedAt,
        tenantId,
        correlationId,
        signalId: signal.signalId,
        signalKind: signal.kind,
        payload: { value: signal.value, trend: signal.trend },
      });
    }

    return signals;
  }

  async evaluateProviders(
    tenantId: string,
    correlationId: string,
  ): Promise<{
    readonly recommendations: readonly Recommendation[];
    readonly scores: readonly QualityScore[];
  }> {
    const observations = this.store.listObservations(tenantId);
    const signals = this.store.listSignals(tenantId);
    const context: IntelligenceEvaluationContext = {
      tenantId,
      correlationId,
      observations,
      signals,
    };

    const recommendationDrafts: Array<{
      readonly draft: ProviderRecommendationDraft;
      readonly providerId: IntelligenceProviderId;
    }> = [];
    const scoreBuckets = new Map<
      QualityScoreDimension,
      { total: number; weight: number; signalIds: string[]; providerIds: Set<string> }
    >();

    for (const providerId of ACTIVE_PROVIDER_IDS) {
      const provider = this.registry.require(providerId);
      if (provider.descriptor.status !== "active") {
        continue;
      }

      const health = await provider.health();
      await this.emit({
        type: QI_EVENT_TYPES.providerHealthChanged,
        occurredAt: new Date().toISOString(),
        tenantId,
        correlationId,
        providerId,
        payload: { ok: health.ok, detail: health.detail ?? "" },
      });

      const outcome = await provider.evaluate(context);

      for (const draft of outcome.recommendations) {
        recommendationDrafts.push({ draft, providerId });
      }

      for (const score of outcome.scoreContributions) {
        const bucket = scoreBuckets.get(score.dimension) ?? {
          total: 0,
          weight: 0,
          signalIds: [],
          providerIds: new Set<string>(),
        };
        bucket.total += score.value * score.weight;
        bucket.weight += score.weight;
        if (score.sourceSignalIds) {
          bucket.signalIds.push(...score.sourceSignalIds);
        }
        bucket.providerIds.add(providerId);
        scoreBuckets.set(score.dimension, bucket);
      }
    }

    const recommendations: Recommendation[] = [];
    for (const { draft, providerId } of recommendationDrafts) {
      const recommendation = await this.persistRecommendation(
        tenantId,
        correlationId,
        providerId,
        draft,
      );
      recommendations.push(recommendation);
    }

    const scores = await this.deriveScores(
      tenantId,
      correlationId,
      scoreBuckets,
      signals,
    );

    return { recommendations, scores };
  }

  async acceptRecommendation(
    recommendationId: string,
    actorId: string,
    correlationId: string,
  ): Promise<Recommendation> {
    const current = this.store.getRecommendation(recommendationId);
    if (!current) {
      throw new Error(`Recommendation not found: ${recommendationId}`);
    }
    if (current.status !== "proposed") {
      throw new Error(
        `Recommendation ${recommendationId} is not proposed (status=${current.status})`,
      );
    }

    const now = new Date().toISOString();
    const updated: Recommendation = {
      ...current,
      status: "accepted",
      lifecycle: {
        ...current.lifecycle,
        updatedAt: now,
        acceptedAt: now,
        actedBy: actorId,
      },
    };
    this.store.updateRecommendation(updated);
    this.acceptedCount.set(
      current.providerId,
      (this.acceptedCount.get(current.providerId) ?? 0) + 1,
    );
    this.store.recordAudit({
      auditId: randomUUID(),
      tenantId: updated.tenantId,
      recommendationId: updated.recommendationId,
      action: "accepted",
      status: updated.status,
      providerId: updated.providerId,
      actorId,
      occurredAt: now,
      correlationId,
    });

    await this.emit({
      type: QI_EVENT_TYPES.recommendationAccepted,
      occurredAt: now,
      tenantId: updated.tenantId,
      correlationId,
      recommendationId: updated.recommendationId,
      recommendationStatus: updated.status,
      providerId: updated.providerId,
      payload: { actorId },
    });

    return updated;
  }

  async rejectRecommendation(
    recommendationId: string,
    actorId: string,
    correlationId: string,
  ): Promise<Recommendation> {
    const current = this.store.getRecommendation(recommendationId);
    if (!current) {
      throw new Error(`Recommendation not found: ${recommendationId}`);
    }
    if (current.status !== "proposed") {
      throw new Error(
        `Recommendation ${recommendationId} is not proposed (status=${current.status})`,
      );
    }

    const now = new Date().toISOString();
    const updated: Recommendation = {
      ...current,
      status: "rejected",
      lifecycle: {
        ...current.lifecycle,
        updatedAt: now,
        rejectedAt: now,
        actedBy: actorId,
      },
    };
    this.store.updateRecommendation(updated);
    this.rejectedCount.set(
      current.providerId,
      (this.rejectedCount.get(current.providerId) ?? 0) + 1,
    );
    this.store.recordAudit({
      auditId: randomUUID(),
      tenantId: updated.tenantId,
      recommendationId: updated.recommendationId,
      action: "rejected",
      status: updated.status,
      providerId: updated.providerId,
      actorId,
      occurredAt: now,
      correlationId,
    });

    await this.emit({
      type: QI_EVENT_TYPES.recommendationRejected,
      occurredAt: now,
      tenantId: updated.tenantId,
      correlationId,
      recommendationId: updated.recommendationId,
      recommendationStatus: updated.status,
      providerId: updated.providerId,
      payload: { actorId },
    });

    return updated;
  }

  async dispatchProvider(
    providerId: IntelligenceProviderId,
    tenantId: string,
    correlationId: string,
  ): Promise<void> {
    const provider = this.registry.require(providerId);
    if (provider.descriptor.status !== "active") {
      throw new Error(
        `Provider ${providerId} is a placeholder and cannot evaluate in APZQEP-163`,
      );
    }
    const context: IntelligenceEvaluationContext = {
      tenantId,
      correlationId,
      observations: this.store.listObservations(tenantId),
      signals: this.store.listSignals(tenantId),
    };
    const outcome = await provider.evaluate(context);
    for (const draft of outcome.recommendations) {
      await this.persistRecommendation(tenantId, correlationId, providerId, draft);
    }
  }

  private async persistRecommendation(
    tenantId: string,
    correlationId: string,
    providerId: IntelligenceProviderId,
    draft: ProviderRecommendationDraft,
  ): Promise<Recommendation> {
    const accepted = this.acceptedCount.get(providerId) ?? 0;
    const rejected = this.rejectedCount.get(providerId) ?? 0;
    const total = accepted + rejected;
    const historicalAcceptanceRate = total > 0 ? accepted / total : undefined;

    const confidence = assessConfidence({
      baseNumeric: draft.confidence.numeric,
      evidenceRefCount: draft.evidenceRefs.length,
      observationCount: draft.observationIds.length,
      providerId,
      historicalAcceptanceRate,
    });
    const mergedConfidence = {
      ...confidence,
      factors: {
        ...draft.confidence.factors,
        ...confidence.factors,
      },
    };

    const now = new Date().toISOString();
    const explanationId = randomUUID();
    const explanation: Explanation = {
      explanationId,
      ...draft.explanation,
      confidence: mergedConfidence,
      providerId,
      timestamp: now,
    };
    this.store.saveExplanation(explanation);

    const recommendation: Recommendation = {
      recommendationId: randomUUID(),
      tenantId,
      type: draft.type,
      priority: draft.priority,
      reason: draft.reason,
      evidenceRefs: [...draft.evidenceRefs],
      observationIds: [...draft.observationIds],
      confidence: mergedConfidence,
      providerId,
      status: "proposed",
      lifecycle: {
        proposedAt: now,
        updatedAt: now,
      },
      explanationId,
      correlationId,
    };
    this.store.saveRecommendation(recommendation);
    this.store.recordAudit({
      auditId: randomUUID(),
      tenantId,
      recommendationId: recommendation.recommendationId,
      action: "created",
      status: recommendation.status,
      providerId,
      occurredAt: now,
      correlationId,
      detail: recommendation.type,
    });

    await this.emit({
      type: QI_EVENT_TYPES.recommendationCreated,
      occurredAt: now,
      tenantId,
      correlationId,
      recommendationId: recommendation.recommendationId,
      recommendationStatus: recommendation.status,
      providerId,
      payload: { type: recommendation.type, priority: recommendation.priority },
    });

    return recommendation;
  }

  private async deriveScores(
    tenantId: string,
    correlationId: string,
    scoreBuckets: Map<
      QualityScoreDimension,
      { total: number; weight: number; signalIds: string[]; providerIds: Set<string> }
    >,
    signals: readonly QualitySignal[],
  ): Promise<QualityScore[]> {
    const now = new Date().toISOString();
    const scores: QualityScore[] = [];

    for (const [dimension, bucket] of scoreBuckets) {
      const value =
        bucket.weight > 0
          ? clampConfidenceNumeric(Math.round(bucket.total / bucket.weight))
          : 0;
      const components = [
        {
          dimension,
          value,
          weight: bucket.weight,
          sourceSignalIds: [...new Set(bucket.signalIds)],
        },
      ];
      const score: QualityScore = {
        scoreId: randomUUID(),
        tenantId,
        dimension,
        value,
        components,
        calculatedAt: now,
        derivedFrom: signals.map((s) => s.signalId),
        providerIds: [...bucket.providerIds],
      };
      this.store.saveScore(score);
      scores.push(score);

      await this.emit({
        type: QI_EVENT_TYPES.qualityScoreUpdated,
        occurredAt: now,
        tenantId,
        correlationId,
        scoreId: score.scoreId,
        scoreDimension: dimension,
        payload: { value },
      });
    }

    const dimensionValues = scores.filter((s) => s.dimension !== "overall");
    if (dimensionValues.length > 0) {
      const overallValue = clampConfidenceNumeric(
        Math.round(
          dimensionValues.reduce((sum, s) => sum + s.value, 0) / dimensionValues.length,
        ),
      );
      const overall: QualityScore = {
        scoreId: randomUUID(),
        tenantId,
        dimension: "overall",
        value: overallValue,
        components: dimensionValues.map((s) => ({
          dimension: s.dimension,
          value: s.value,
          weight: 1,
        })),
        calculatedAt: now,
        derivedFrom: dimensionValues.map((s) => s.scoreId),
        providerIds: [...new Set(dimensionValues.flatMap((s) => s.providerIds))],
      };
      this.store.saveScore(overall);
      scores.push(overall);

      await this.emit({
        type: QI_EVENT_TYPES.qualityScoreUpdated,
        occurredAt: now,
        tenantId,
        correlationId,
        scoreId: overall.scoreId,
        scoreDimension: "overall",
        payload: { value: overallValue },
      });
    }

    return scores;
  }

  private async emit(event: Parameters<QiEventPublisher>[0]): Promise<void> {
    await this.publishEvent(event);
  }
}

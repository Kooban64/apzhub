import type { IntelligenceProviderId } from "./provider";
import type { RecommendationStatus } from "./recommendation";
import type { QualityScoreDimension } from "./scoring";
import type { QualitySignalKind } from "./signal";

/** Past-tense platform quality intelligence events (provider-neutral). */
export const QI_EVENT_TYPES = {
  observationCreated: "platform.quality_intelligence.observation.created",
  signalCalculated: "platform.quality_intelligence.signal.calculated",
  recommendationCreated: "platform.quality_intelligence.recommendation.created",
  recommendationUpdated: "platform.quality_intelligence.recommendation.updated",
  recommendationAccepted: "platform.quality_intelligence.recommendation.accepted",
  recommendationRejected: "platform.quality_intelligence.recommendation.rejected",
  qualityScoreUpdated: "platform.quality_intelligence.quality_score.updated",
  providerRegistered: "platform.quality_intelligence.provider.registered",
  providerHealthChanged: "platform.quality_intelligence.provider.health.changed",
} as const;

export type QiEventType = (typeof QI_EVENT_TYPES)[keyof typeof QI_EVENT_TYPES];

export interface QiDomainEvent {
  readonly type: QiEventType;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly providerId?: IntelligenceProviderId;
  readonly observationId?: string;
  readonly signalId?: string;
  readonly signalKind?: QualitySignalKind;
  readonly recommendationId?: string;
  readonly recommendationStatus?: RecommendationStatus;
  readonly scoreId?: string;
  readonly scoreDimension?: QualityScoreDimension;
  readonly payload?: Readonly<Record<string, string | number | boolean>>;
}

export type QiEventPublisher = (event: QiDomainEvent) => void | Promise<void>;

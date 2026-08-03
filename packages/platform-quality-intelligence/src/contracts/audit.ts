import type { IntelligenceProviderId } from "./provider";
import type { RecommendationStatus } from "./recommendation";

/** Append-only recommendation audit actions. */
export type RecommendationAuditAction =
  "created" | "updated" | "accepted" | "rejected" | "superseded";

/**
 * Immutable audit record for recommendation lifecycle transitions.
 */
export interface RecommendationAuditRecord {
  readonly auditId: string;
  readonly tenantId: string;
  readonly recommendationId: string;
  readonly action: RecommendationAuditAction;
  readonly status: RecommendationStatus;
  readonly providerId: IntelligenceProviderId;
  readonly actorId?: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly detail?: string;
}

/**
 * Recommendation history entry — lifecycle snapshot for workspace / API consumers.
 */
export interface RecommendationHistoryEntry {
  readonly recommendationId: string;
  readonly tenantId: string;
  readonly type: string;
  readonly priority: string;
  readonly status: RecommendationStatus;
  readonly providerId: IntelligenceProviderId;
  readonly confidenceLevel: string;
  readonly confidenceNumeric: number;
  readonly proposedAt: string;
  readonly updatedAt: string;
  readonly acceptedAt?: string;
  readonly rejectedAt?: string;
  readonly actedBy?: string;
  readonly reason: string;
}

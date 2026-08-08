/**
 * PostgreSQL IntelligenceStore — QX-PR-03.
 * Production Source of Record for Quality Intelligence artefacts.
 */
import {
  getDatabaseExecutor,
  qepQiAudit,
  qepQiExplanation,
  qepQiObservation,
  qepQiRecommendation,
  qepQiScore,
  qepQiSignal,
  type DatabaseExecutor,
} from "@apzhub/config";
import type { RecommendationAuditRecord } from "@apzhub/platform-quality-intelligence";
import type { Explanation } from "@apzhub/platform-quality-intelligence";
import type { QualityObservation } from "@apzhub/platform-quality-intelligence";
import type { Recommendation } from "@apzhub/platform-quality-intelligence";
import type { QualityScore } from "@apzhub/platform-quality-intelligence";
import type { QualitySignal } from "@apzhub/platform-quality-intelligence";
import type { IntelligenceStore } from "@apzhub/platform-quality-intelligence";
import { and, desc, eq, inArray } from "drizzle-orm";

function toObservation(row: typeof qepQiObservation.$inferSelect): QualityObservation {
  return row.observationJson as unknown as QualityObservation;
}

function toSignal(row: typeof qepQiSignal.$inferSelect): QualitySignal {
  return row.signalJson as unknown as QualitySignal;
}

function toRecommendation(
  row: typeof qepQiRecommendation.$inferSelect,
): Recommendation {
  return row.recommendationJson as unknown as Recommendation;
}

function toExplanation(row: typeof qepQiExplanation.$inferSelect): Explanation {
  return row.explanationJson as unknown as Explanation;
}

function toScore(row: typeof qepQiScore.$inferSelect): QualityScore {
  return row.scoreJson as unknown as QualityScore;
}

function toAudit(row: typeof qepQiAudit.$inferSelect): RecommendationAuditRecord {
  return row.auditJson as unknown as RecommendationAuditRecord;
}

export function createPostgresIntelligenceStore(
  db: DatabaseExecutor,
): IntelligenceStore {
  const exec = () => getDatabaseExecutor(db);

  return {
    async recordObservation(
      observation: QualityObservation,
    ): Promise<QualityObservation> {
      const existing = await exec()
        .select({ id: qepQiObservation.id })
        .from(qepQiObservation)
        .where(eq(qepQiObservation.id, observation.observationId))
        .limit(1);

      if (existing[0]) {
        throw new Error(
          `Observation already exists and is immutable: ${observation.observationId}`,
        );
      }

      await exec()
        .insert(qepQiObservation)
        .values({
          id: observation.observationId,
          tenantId: observation.tenantId,
          correlationId: observation.correlationId,
          recordedAt: new Date(observation.recordedAt),
          observationJson: observation as unknown as Record<string, unknown>,
        });

      return observation;
    },

    async listObservations(tenantId?: string): Promise<readonly QualityObservation[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepQiObservation)
            .where(eq(qepQiObservation.tenantId, tenantId))
            .orderBy(desc(qepQiObservation.recordedAt))
        : await exec()
            .select()
            .from(qepQiObservation)
            .orderBy(desc(qepQiObservation.recordedAt));
      return rows.map(toObservation);
    },

    async getObservation(
      observationId: string,
    ): Promise<QualityObservation | undefined> {
      const rows = await exec()
        .select()
        .from(qepQiObservation)
        .where(eq(qepQiObservation.id, observationId))
        .limit(1);
      return rows[0] ? toObservation(rows[0]) : undefined;
    },

    async saveSignal(signal: QualitySignal): Promise<QualitySignal> {
      const values = {
        id: signal.signalId,
        tenantId: signal.tenantId,
        kind: signal.kind,
        calculatedAt: new Date(signal.calculatedAt),
        signalJson: signal as unknown as Record<string, unknown>,
        revision: 1,
      };

      const existing = await exec()
        .select({ id: qepQiSignal.id, revision: qepQiSignal.revision })
        .from(qepQiSignal)
        .where(eq(qepQiSignal.id, signal.signalId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepQiSignal)
          .set({
            kind: values.kind,
            calculatedAt: values.calculatedAt,
            signalJson: values.signalJson,
            revision: existing[0].revision + 1,
          })
          .where(eq(qepQiSignal.id, signal.signalId));
        return signal;
      }

      await exec().insert(qepQiSignal).values(values);
      return signal;
    },

    async listSignals(tenantId?: string): Promise<readonly QualitySignal[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepQiSignal)
            .where(eq(qepQiSignal.tenantId, tenantId))
            .orderBy(desc(qepQiSignal.calculatedAt))
        : await exec()
            .select()
            .from(qepQiSignal)
            .orderBy(desc(qepQiSignal.calculatedAt));
      return rows.map(toSignal);
    },

    async getSignal(signalId: string): Promise<QualitySignal | undefined> {
      const rows = await exec()
        .select()
        .from(qepQiSignal)
        .where(eq(qepQiSignal.id, signalId))
        .limit(1);
      return rows[0] ? toSignal(rows[0]) : undefined;
    },

    async saveRecommendation(recommendation: Recommendation): Promise<Recommendation> {
      const values = {
        id: recommendation.recommendationId,
        tenantId: recommendation.tenantId,
        status: recommendation.status,
        providerId: recommendation.providerId,
        explanationId: recommendation.explanationId,
        correlationId: recommendation.correlationId,
        recommendationJson: recommendation as unknown as Record<string, unknown>,
        revision: 1,
        proposedAt: new Date(recommendation.lifecycle.proposedAt),
        updatedAt: new Date(recommendation.lifecycle.updatedAt),
      };

      const existing = await exec()
        .select({ id: qepQiRecommendation.id, revision: qepQiRecommendation.revision })
        .from(qepQiRecommendation)
        .where(eq(qepQiRecommendation.id, recommendation.recommendationId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepQiRecommendation)
          .set({
            status: values.status,
            providerId: values.providerId,
            explanationId: values.explanationId,
            correlationId: values.correlationId,
            recommendationJson: values.recommendationJson,
            revision: existing[0].revision + 1,
            proposedAt: values.proposedAt,
            updatedAt: values.updatedAt,
          })
          .where(eq(qepQiRecommendation.id, recommendation.recommendationId));
        return recommendation;
      }

      await exec().insert(qepQiRecommendation).values(values);
      return recommendation;
    },

    async updateRecommendation(
      recommendation: Recommendation,
    ): Promise<Recommendation> {
      const existing = await exec()
        .select({ id: qepQiRecommendation.id, revision: qepQiRecommendation.revision })
        .from(qepQiRecommendation)
        .where(eq(qepQiRecommendation.id, recommendation.recommendationId))
        .limit(1);

      if (!existing[0]) {
        throw new Error(`Recommendation not found: ${recommendation.recommendationId}`);
      }

      await exec()
        .update(qepQiRecommendation)
        .set({
          status: recommendation.status,
          providerId: recommendation.providerId,
          explanationId: recommendation.explanationId,
          correlationId: recommendation.correlationId,
          recommendationJson: recommendation as unknown as Record<string, unknown>,
          revision: existing[0].revision + 1,
          proposedAt: new Date(recommendation.lifecycle.proposedAt),
          updatedAt: new Date(recommendation.lifecycle.updatedAt),
        })
        .where(eq(qepQiRecommendation.id, recommendation.recommendationId));

      return recommendation;
    },

    async listRecommendations(tenantId?: string): Promise<readonly Recommendation[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepQiRecommendation)
            .where(eq(qepQiRecommendation.tenantId, tenantId))
            .orderBy(desc(qepQiRecommendation.updatedAt))
        : await exec()
            .select()
            .from(qepQiRecommendation)
            .orderBy(desc(qepQiRecommendation.updatedAt));
      return rows.map(toRecommendation);
    },

    async getRecommendation(
      recommendationId: string,
    ): Promise<Recommendation | undefined> {
      const rows = await exec()
        .select()
        .from(qepQiRecommendation)
        .where(eq(qepQiRecommendation.id, recommendationId))
        .limit(1);
      return rows[0] ? toRecommendation(rows[0]) : undefined;
    },

    async saveExplanation(
      explanation: Explanation,
      tenantId: string,
    ): Promise<Explanation> {
      const values = {
        id: explanation.explanationId,
        tenantId,
        providerId: explanation.providerId,
        explanationJson: explanation as unknown as Record<string, unknown>,
        revision: 1,
        createdAt: new Date(explanation.timestamp),
      };

      const existing = await exec()
        .select({ id: qepQiExplanation.id, revision: qepQiExplanation.revision })
        .from(qepQiExplanation)
        .where(eq(qepQiExplanation.id, explanation.explanationId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepQiExplanation)
          .set({
            providerId: values.providerId,
            explanationJson: values.explanationJson,
            revision: existing[0].revision + 1,
            createdAt: values.createdAt,
          })
          .where(eq(qepQiExplanation.id, explanation.explanationId));
        return explanation;
      }

      await exec().insert(qepQiExplanation).values(values);
      return explanation;
    },

    async listExplanations(tenantId?: string): Promise<readonly Explanation[]> {
      if (!tenantId) {
        const rows = await exec()
          .select()
          .from(qepQiExplanation)
          .orderBy(desc(qepQiExplanation.createdAt));
        return rows.map(toExplanation);
      }

      const recommendations = await this.listRecommendations(tenantId);
      const explanationIds = [...new Set(recommendations.map((r) => r.explanationId))];
      if (explanationIds.length === 0) {
        return [];
      }

      const rows = await exec()
        .select()
        .from(qepQiExplanation)
        .where(inArray(qepQiExplanation.id, explanationIds))
        .orderBy(desc(qepQiExplanation.createdAt));
      return rows.map(toExplanation);
    },

    async getExplanation(explanationId: string): Promise<Explanation | undefined> {
      const rows = await exec()
        .select()
        .from(qepQiExplanation)
        .where(eq(qepQiExplanation.id, explanationId))
        .limit(1);
      return rows[0] ? toExplanation(rows[0]) : undefined;
    },

    async saveScore(score: QualityScore): Promise<QualityScore> {
      const values = {
        id: score.scoreId,
        tenantId: score.tenantId,
        dimension: score.dimension,
        calculatedAt: new Date(score.calculatedAt),
        scoreJson: score as unknown as Record<string, unknown>,
        revision: 1,
      };

      const existing = await exec()
        .select({ id: qepQiScore.id, revision: qepQiScore.revision })
        .from(qepQiScore)
        .where(eq(qepQiScore.id, score.scoreId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepQiScore)
          .set({
            dimension: values.dimension,
            calculatedAt: values.calculatedAt,
            scoreJson: values.scoreJson,
            revision: existing[0].revision + 1,
          })
          .where(eq(qepQiScore.id, score.scoreId));
        return score;
      }

      await exec().insert(qepQiScore).values(values);
      return score;
    },

    async listScores(tenantId?: string): Promise<readonly QualityScore[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepQiScore)
            .where(eq(qepQiScore.tenantId, tenantId))
            .orderBy(desc(qepQiScore.calculatedAt))
        : await exec().select().from(qepQiScore).orderBy(desc(qepQiScore.calculatedAt));
      return rows.map(toScore);
    },

    async getScore(scoreId: string): Promise<QualityScore | undefined> {
      const rows = await exec()
        .select()
        .from(qepQiScore)
        .where(eq(qepQiScore.id, scoreId))
        .limit(1);
      return rows[0] ? toScore(rows[0]) : undefined;
    },

    async getLatestScoreByDimension(
      tenantId: string,
      dimension: QualityScore["dimension"],
    ): Promise<QualityScore | undefined> {
      const rows = await exec()
        .select()
        .from(qepQiScore)
        .where(
          and(eq(qepQiScore.tenantId, tenantId), eq(qepQiScore.dimension, dimension)),
        )
        .orderBy(desc(qepQiScore.calculatedAt))
        .limit(1);
      return rows[0] ? toScore(rows[0]) : undefined;
    },

    async recordAudit(
      audit: RecommendationAuditRecord,
    ): Promise<RecommendationAuditRecord> {
      await exec()
        .insert(qepQiAudit)
        .values({
          id: audit.auditId,
          tenantId: audit.tenantId,
          recommendationId: audit.recommendationId,
          occurredAt: new Date(audit.occurredAt),
          auditJson: audit as unknown as Record<string, unknown>,
        });
      return audit;
    },

    async listAudits(tenantId?: string): Promise<readonly RecommendationAuditRecord[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepQiAudit)
            .where(eq(qepQiAudit.tenantId, tenantId))
            .orderBy(desc(qepQiAudit.occurredAt))
        : await exec().select().from(qepQiAudit).orderBy(desc(qepQiAudit.occurredAt));
      return rows.map(toAudit);
    },
  };
}

/** Test helper — delete all QI rows for a tenant. */
export async function deleteQiDataForTenant(
  tenantId: string,
  db: DatabaseExecutor,
): Promise<void> {
  const executor = getDatabaseExecutor(db);
  await executor.delete(qepQiAudit).where(eq(qepQiAudit.tenantId, tenantId));
  await executor.delete(qepQiScore).where(eq(qepQiScore.tenantId, tenantId));
  await executor
    .delete(qepQiRecommendation)
    .where(eq(qepQiRecommendation.tenantId, tenantId));
  await executor
    .delete(qepQiExplanation)
    .where(eq(qepQiExplanation.tenantId, tenantId));
  await executor.delete(qepQiSignal).where(eq(qepQiSignal.tenantId, tenantId));
  await executor
    .delete(qepQiObservation)
    .where(eq(qepQiObservation.tenantId, tenantId));
}

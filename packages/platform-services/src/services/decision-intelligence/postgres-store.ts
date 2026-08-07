import {
  getDb,
  platformAnalyticsDecisionKpi,
  platformAnalyticsDecisionPack,
  platformAnalyticsDecisionTimeline,
  platformAnalyticsTrendPoint,
} from "@apzhub/config/db";
import { and, asc, desc, eq } from "drizzle-orm";

import type {
  DecisionAudienceRole,
  DecisionIndicator,
  DecisionKpi,
  DecisionKpiStatus,
  DecisionPack,
  DecisionTimelineEntry,
  DecisionTrendDomain,
  DecisionTrendPoint,
} from "@apzhub/platform-service-contracts";

import type { DecisionIntelligenceStore } from "./memory-store";

function mapPack(row: typeof platformAnalyticsDecisionPack.$inferSelect): DecisionPack {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    questionId: row.questionId,
    question: row.question,
    audienceRole: row.audienceRole as DecisionAudienceRole,
    indicators: Object.freeze([...(row.indicators ?? [])] as DecisionIndicator[]),
    supportingEvidence: Object.freeze([...(row.supportingEvidence ?? [])]),
    trendSummary: row.trendSummary,
    recommendedActions: Object.freeze([...(row.recommendedActions ?? [])]),
    generatedAt: row.generatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  });
}

function mapTrend(
  row: typeof platformAnalyticsTrendPoint.$inferSelect,
): DecisionTrendPoint {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    domain: row.domain as DecisionTrendDomain,
    label: row.label,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd.toISOString(),
    value: row.value,
    unit: row.unit,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  });
}

function mapKpi(row: typeof platformAnalyticsDecisionKpi.$inferSelect): DecisionKpi {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    description: row.description,
    owner: row.owner,
    targetValue: row.targetValue,
    currentValue: row.currentValue,
    unit: row.unit,
    domain: row.domain as DecisionTrendDomain,
    status: row.status as DecisionKpiStatus,
    history: Object.freeze([...(row.history ?? [])]),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapTimeline(
  row: typeof platformAnalyticsDecisionTimeline.$inferSelect,
): DecisionTimelineEntry {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    title: row.title,
    decision: row.decision,
    rationale: row.rationale,
    decidedBy: row.decidedBy,
    decidedAt: row.decidedAt.toISOString(),
    evidenceRefs: Object.freeze([...(row.evidenceRefs ?? [])]),
    relatedQuestionId: row.relatedQuestionId ?? undefined,
    relatedProduct: row.relatedProduct ?? undefined,
    sourceRecordRef: row.sourceRecordRef ?? undefined,
    createdAt: row.createdAt.toISOString(),
  });
}

export function createPostgresDecisionIntelligenceStore(): DecisionIntelligenceStore {
  return {
    async listPacks(tenantId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformAnalyticsDecisionPack)
        .where(eq(platformAnalyticsDecisionPack.tenantId, tenantId))
        .orderBy(desc(platformAnalyticsDecisionPack.generatedAt));
      return rows.map(mapPack);
    },
    async upsertPack(item) {
      const db = getDb();
      await db
        .insert(platformAnalyticsDecisionPack)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          questionId: item.questionId,
          question: item.question,
          audienceRole: item.audienceRole,
          indicators: [...item.indicators],
          supportingEvidence: [...item.supportingEvidence],
          trendSummary: item.trendSummary,
          recommendedActions: [...item.recommendedActions],
          generatedAt: new Date(item.generatedAt),
          createdAt: new Date(item.createdAt),
        })
        .onConflictDoUpdate({
          target: platformAnalyticsDecisionPack.id,
          set: {
            question: item.question,
            audienceRole: item.audienceRole,
            indicators: [...item.indicators],
            supportingEvidence: [...item.supportingEvidence],
            trendSummary: item.trendSummary,
            recommendedActions: [...item.recommendedActions],
            generatedAt: new Date(item.generatedAt),
          },
        });
      return item;
    },
    async listTrendPoints(tenantId, domain) {
      const db = getDb();
      const rows = domain
        ? await db
            .select()
            .from(platformAnalyticsTrendPoint)
            .where(
              and(
                eq(platformAnalyticsTrendPoint.tenantId, tenantId),
                eq(platformAnalyticsTrendPoint.domain, domain),
              ),
            )
            .orderBy(asc(platformAnalyticsTrendPoint.periodStart))
        : await db
            .select()
            .from(platformAnalyticsTrendPoint)
            .where(eq(platformAnalyticsTrendPoint.tenantId, tenantId))
            .orderBy(asc(platformAnalyticsTrendPoint.periodStart));
      return rows.map(mapTrend);
    },
    async upsertTrendPoint(item) {
      const db = getDb();
      await db
        .insert(platformAnalyticsTrendPoint)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          domain: item.domain,
          label: item.label,
          periodStart: new Date(item.periodStart),
          periodEnd: new Date(item.periodEnd),
          value: item.value,
          unit: item.unit,
          note: item.note ?? null,
          createdAt: new Date(item.createdAt),
        })
        .onConflictDoUpdate({
          target: platformAnalyticsTrendPoint.id,
          set: {
            label: item.label,
            value: item.value,
            unit: item.unit,
            note: item.note ?? null,
            periodStart: new Date(item.periodStart),
            periodEnd: new Date(item.periodEnd),
          },
        });
      return item;
    },
    async listKpis(tenantId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformAnalyticsDecisionKpi)
        .where(eq(platformAnalyticsDecisionKpi.tenantId, tenantId))
        .orderBy(desc(platformAnalyticsDecisionKpi.updatedAt));
      return rows.map(mapKpi);
    },
    async upsertKpi(item) {
      const db = getDb();
      await db
        .insert(platformAnalyticsDecisionKpi)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          name: item.name,
          description: item.description,
          owner: item.owner,
          targetValue: item.targetValue,
          currentValue: item.currentValue,
          unit: item.unit,
          domain: item.domain,
          status: item.status,
          history: [...item.history],
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformAnalyticsDecisionKpi.id,
          set: {
            name: item.name,
            description: item.description,
            owner: item.owner,
            targetValue: item.targetValue,
            currentValue: item.currentValue,
            unit: item.unit,
            domain: item.domain,
            status: item.status,
            history: [...item.history],
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },
    async listTimeline(tenantId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformAnalyticsDecisionTimeline)
        .where(eq(platformAnalyticsDecisionTimeline.tenantId, tenantId))
        .orderBy(desc(platformAnalyticsDecisionTimeline.decidedAt));
      return rows.map(mapTimeline);
    },
    async upsertTimelineEntry(item) {
      const db = getDb();
      await db
        .insert(platformAnalyticsDecisionTimeline)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          title: item.title,
          decision: item.decision,
          rationale: item.rationale,
          decidedBy: item.decidedBy,
          decidedAt: new Date(item.decidedAt),
          evidenceRefs: [...item.evidenceRefs],
          relatedQuestionId: item.relatedQuestionId ?? null,
          relatedProduct: item.relatedProduct ?? null,
          sourceRecordRef: item.sourceRecordRef ?? null,
          createdAt: new Date(item.createdAt),
        })
        .onConflictDoUpdate({
          target: platformAnalyticsDecisionTimeline.id,
          set: {
            title: item.title,
            decision: item.decision,
            rationale: item.rationale,
            decidedBy: item.decidedBy,
            decidedAt: new Date(item.decidedAt),
            evidenceRefs: [...item.evidenceRefs],
            relatedQuestionId: item.relatedQuestionId ?? null,
            relatedProduct: item.relatedProduct ?? null,
            sourceRecordRef: item.sourceRecordRef ?? null,
          },
        });
      return item;
    },
  };
}

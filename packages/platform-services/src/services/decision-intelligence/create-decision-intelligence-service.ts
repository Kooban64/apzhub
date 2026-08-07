import { randomUUID } from "node:crypto";

import type {
  CreateDecisionKpiInput,
  CreateDecisionTimelineEntryInput,
  DecisionAudienceRole,
  DecisionKpi,
  DecisionKpiStatus,
  DecisionPack,
  DecisionQuestion,
  DecisionTimelineEntry,
  DecisionTrendDomain,
  DecisionTrendPoint,
  DecisionTrendSeries,
  GenerateDecisionPackInput,
  ServiceRequestContext,
  UpdateDecisionKpiInput,
} from "@apzhub/platform-service-contracts";

import {
  getMemoryDecisionIntelligenceStore,
  type DecisionIntelligenceStore,
} from "./memory-store";
import { createPostgresDecisionIntelligenceStore } from "./postgres-store";
import { getDecisionQuestion, listDecisionQuestionsByRole } from "./question-catalogue";

function requireText(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`decision_intelligence_${field}_required`);
  return trimmed;
}

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

const TREND_DOMAINS: readonly DecisionTrendDomain[] = [
  "project_delivery",
  "support_performance",
  "workflow_throughput",
  "operational_quality",
];

const TREND_TITLES: Record<DecisionTrendDomain, string> = {
  project_delivery: "Project delivery",
  support_performance: "Support performance",
  workflow_throughput: "Workflow throughput",
  operational_quality: "Operational quality",
};

function kpiStatus(current: number, target: number): DecisionKpiStatus {
  if (target <= 0) return "unknown";
  const ratio = current / target;
  if (ratio >= 0.95) return "on_track";
  if (ratio >= 0.8) return "at_risk";
  return "off_track";
}

function weekAgo(weeks: number, from: Date): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - weeks * 7);
  return d;
}

export type DecisionIntelligenceService = {
  listQuestions(
    ctx: ServiceRequestContext,
    role?: DecisionAudienceRole,
  ): Promise<readonly DecisionQuestion[]>;
  getQuestion(
    ctx: ServiceRequestContext,
    questionId: string,
  ): Promise<DecisionQuestion | null>;
  generatePack(
    ctx: ServiceRequestContext,
    input: GenerateDecisionPackInput,
  ): Promise<DecisionPack>;
  listPacks(ctx: ServiceRequestContext): Promise<readonly DecisionPack[]>;
  ensureTrendSeed(ctx: ServiceRequestContext): Promise<void>;
  listTrends(
    ctx: ServiceRequestContext,
    domain?: DecisionTrendDomain,
  ): Promise<readonly DecisionTrendSeries[]>;
  listKpis(ctx: ServiceRequestContext): Promise<readonly DecisionKpi[]>;
  createKpi(
    ctx: ServiceRequestContext,
    input: CreateDecisionKpiInput,
  ): Promise<DecisionKpi>;
  updateKpi(
    ctx: ServiceRequestContext,
    kpiId: string,
    input: UpdateDecisionKpiInput,
  ): Promise<DecisionKpi>;
  listTimeline(ctx: ServiceRequestContext): Promise<readonly DecisionTimelineEntry[]>;
  createTimelineEntry(
    ctx: ServiceRequestContext,
    input: CreateDecisionTimelineEntryInput,
  ): Promise<DecisionTimelineEntry>;
};

let preferred: DecisionIntelligenceStore | undefined;

export function setDecisionIntelligenceStoreForTests(store: DecisionIntelligenceStore) {
  preferred = store;
}

export function resolveDecisionIntelligenceStore(): DecisionIntelligenceStore {
  if (preferred) return preferred;
  if (process.env.APZHUB_ANALYTICS_DECISION_STORE === "memory") {
    return getMemoryDecisionIntelligenceStore();
  }
  try {
    return createPostgresDecisionIntelligenceStore();
  } catch {
    return getMemoryDecisionIntelligenceStore();
  }
}

export function createDecisionIntelligenceService(
  store: DecisionIntelligenceStore = resolveDecisionIntelligenceStore(),
): DecisionIntelligenceService {
  const tenant = (ctx: ServiceRequestContext) => ctx.tenantId ?? "default";

  async function ensureTrendSeed(ctx: ServiceRequestContext) {
    const tenantId = tenant(ctx);
    const existing = await store.listTrendPoints(tenantId);
    if (existing.length > 0) return;

    const now = new Date();
    const seeds: Array<{
      domain: DecisionTrendDomain;
      label: string;
      unit: string;
      values: number[];
    }> = [
      {
        domain: "project_delivery",
        label: "On-track projects %",
        unit: "percent",
        values: [72, 74, 71, 76, 78, 80],
      },
      {
        domain: "support_performance",
        label: "SLA met %",
        unit: "percent",
        values: [88, 86, 87, 89, 90, 91],
      },
      {
        domain: "workflow_throughput",
        label: "Journeys completed",
        unit: "count",
        values: [12, 14, 13, 16, 15, 18],
      },
      {
        domain: "operational_quality",
        label: "Open critical risks",
        unit: "count",
        values: [9, 8, 8, 7, 6, 5],
      },
    ];

    for (const seed of seeds) {
      for (let i = 0; i < seed.values.length; i += 1) {
        const start = weekAgo(seed.values.length - i, now);
        const end = weekAgo(seed.values.length - i - 1, now);
        await store.upsertTrendPoint({
          id: id("atrend"),
          tenantId,
          domain: seed.domain,
          label: seed.label,
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
          value: seed.values[i]!,
          unit: seed.unit,
          note: "Derived insight snapshot — not a System of Record",
          createdAt: now.toISOString(),
        });
      }
    }
  }

  function summarizeChange(points: readonly DecisionTrendPoint[]): string {
    if (points.length < 2) return "Insufficient periods to describe change.";
    const first = points[0]!.value;
    const last = points[points.length - 1]!.value;
    const delta = last - first;
    if (Math.abs(delta) < 0.0001) {
      return `${points[0]!.label} is unchanged across the observed periods.`;
    }
    const direction = delta > 0 ? "increased" : "decreased";
    return `${points[0]!.label} ${direction} from ${first} to ${last} ${points[0]!.unit} over the observed periods.`;
  }

  return {
    async listQuestions(_ctx, role) {
      return listDecisionQuestionsByRole(role);
    },

    async getQuestion(_ctx, questionId) {
      return getDecisionQuestion(questionId) ?? null;
    },

    ensureTrendSeed,

    async generatePack(ctx, input) {
      const question = getDecisionQuestion(input.questionId);
      if (!question) throw new Error("decision_intelligence_question_not_found");
      if (!question.audienceRoles.includes(input.audienceRole)) {
        throw new Error("decision_intelligence_audience_role_invalid");
      }

      await ensureTrendSeed(ctx);
      const domain =
        question.domain === "support"
          ? "support_performance"
          : question.domain === "workflow"
            ? "workflow_throughput"
            : question.domain === "quality"
              ? "operational_quality"
              : "project_delivery";
      const points = await store.listTrendPoints(tenant(ctx), domain);
      const latest = points[points.length - 1];
      const previous = points[points.length - 2];
      const delta = latest && previous ? latest.value - previous.value : 0;
      const direction: "up" | "down" | "flat" =
        delta > 0 ? "up" : delta < 0 ? "down" : "flat";
      const significance =
        domain === "operational_quality"
          ? delta < 0
            ? "positive"
            : delta > 0
              ? "negative"
              : "neutral"
          : delta > 0
            ? "positive"
            : delta < 0
              ? "negative"
              : "neutral";

      const now = new Date().toISOString();
      const pack: DecisionPack = Object.freeze({
        id: id("apack"),
        tenantId: tenant(ctx),
        questionId: question.id,
        question: question.question,
        audienceRole: input.audienceRole,
        indicators: Object.freeze([
          {
            label: latest?.label ?? "Current indicator",
            value: latest ? `${latest.value} ${latest.unit}` : "Unavailable",
            direction,
            significance: significance as "positive" | "negative" | "neutral",
          },
          {
            label: "Period change",
            value: latest && previous ? `${delta > 0 ? "+" : ""}${delta}` : "n/a",
            direction,
            significance: significance as "positive" | "negative" | "neutral",
          },
        ]),
        supportingEvidence: Object.freeze([
          question.evidenceSummary,
          "Indicators are derived insight snapshots — originating products remain Systems of Record.",
        ]),
        trendSummary: summarizeChange(points),
        recommendedActions: Object.freeze([...question.recommendedActions]),
        generatedAt: now,
        createdAt: now,
      });
      return store.upsertPack(pack);
    },

    async listPacks(ctx) {
      return store.listPacks(tenant(ctx));
    },

    async listTrends(ctx, domain) {
      await ensureTrendSeed(ctx);
      const domains = domain ? [domain] : TREND_DOMAINS;
      const series: DecisionTrendSeries[] = [];
      for (const d of domains) {
        const points = await store.listTrendPoints(tenant(ctx), d);
        series.push(
          Object.freeze({
            domain: d,
            title: TREND_TITLES[d],
            points: Object.freeze(points),
            changeSummary: summarizeChange(points),
          }),
        );
      }
      return series;
    },

    async listKpis(ctx) {
      return store.listKpis(tenant(ctx));
    },

    async createKpi(ctx, input) {
      const now = new Date().toISOString();
      const current = input.currentValue;
      const target = input.targetValue;
      const item: DecisionKpi = Object.freeze({
        id: id("akpi"),
        tenantId: tenant(ctx),
        name: requireText(input.name, "name"),
        description: requireText(input.description, "description"),
        owner: requireText(input.owner, "owner"),
        targetValue: target,
        currentValue: current,
        unit: requireText(input.unit, "unit"),
        domain: input.domain,
        status: kpiStatus(current, target),
        history: Object.freeze([{ at: now, value: current }]),
        createdAt: now,
        updatedAt: now,
      });
      return store.upsertKpi(item);
    },

    async updateKpi(ctx, kpiId, input) {
      const existing = (await store.listKpis(tenant(ctx))).find((k) => k.id === kpiId);
      if (!existing) throw new Error("decision_intelligence_kpi_not_found");
      const now = new Date().toISOString();
      const currentValue = input.currentValue ?? existing.currentValue;
      const targetValue = input.targetValue ?? existing.targetValue;
      const history =
        input.currentValue !== undefined
          ? [...existing.history, { at: now, value: currentValue }]
          : [...existing.history];
      const item: DecisionKpi = Object.freeze({
        ...existing,
        name:
          input.name !== undefined ? requireText(input.name, "name") : existing.name,
        description:
          input.description !== undefined
            ? requireText(input.description, "description")
            : existing.description,
        owner:
          input.owner !== undefined
            ? requireText(input.owner, "owner")
            : existing.owner,
        targetValue,
        currentValue,
        unit:
          input.unit !== undefined ? requireText(input.unit, "unit") : existing.unit,
        status: kpiStatus(currentValue, targetValue),
        history: Object.freeze(history),
        updatedAt: now,
      });
      return store.upsertKpi(item);
    },

    async listTimeline(ctx) {
      return store.listTimeline(tenant(ctx));
    },

    async createTimelineEntry(ctx, input) {
      const now = new Date().toISOString();
      const item: DecisionTimelineEntry = Object.freeze({
        id: id("atimeline"),
        tenantId: tenant(ctx),
        title: requireText(input.title, "title"),
        decision: requireText(input.decision, "decision"),
        rationale: requireText(input.rationale, "rationale"),
        decidedBy: requireText(input.decidedBy, "decided_by"),
        decidedAt: input.decidedAt ?? now,
        evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
        relatedQuestionId: input.relatedQuestionId,
        relatedProduct: input.relatedProduct,
        sourceRecordRef: input.sourceRecordRef,
        createdAt: now,
      });
      return store.upsertTimelineEntry(item);
    },
  };
}

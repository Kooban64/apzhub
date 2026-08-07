import type {
  DecisionKpi,
  DecisionPack,
  DecisionTimelineEntry,
  DecisionTrendPoint,
} from "@apzhub/platform-service-contracts";

export type DecisionIntelligenceStore = {
  listPacks(tenantId: string): Promise<DecisionPack[]>;
  upsertPack(item: DecisionPack): Promise<DecisionPack>;
  listTrendPoints(tenantId: string, domain?: string): Promise<DecisionTrendPoint[]>;
  upsertTrendPoint(item: DecisionTrendPoint): Promise<DecisionTrendPoint>;
  listKpis(tenantId: string): Promise<DecisionKpi[]>;
  upsertKpi(item: DecisionKpi): Promise<DecisionKpi>;
  listTimeline(tenantId: string): Promise<DecisionTimelineEntry[]>;
  upsertTimelineEntry(item: DecisionTimelineEntry): Promise<DecisionTimelineEntry>;
};

function k(tenantId: string, id: string) {
  return `${tenantId}|${id}`;
}

export function createMemoryDecisionIntelligenceStore(): DecisionIntelligenceStore {
  const packs = new Map<string, DecisionPack>();
  const trends = new Map<string, DecisionTrendPoint>();
  const kpis = new Map<string, DecisionKpi>();
  const timeline = new Map<string, DecisionTimelineEntry>();

  return {
    async listPacks(tenantId) {
      return [...packs.values()]
        .filter((p) => p.tenantId === tenantId)
        .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
    },
    async upsertPack(item) {
      const frozen = Object.freeze({
        ...item,
        indicators: Object.freeze(item.indicators.map((i) => Object.freeze({ ...i }))),
        supportingEvidence: Object.freeze([...item.supportingEvidence]),
        recommendedActions: Object.freeze([...item.recommendedActions]),
      });
      packs.set(k(item.tenantId, item.id), frozen);
      return frozen;
    },
    async listTrendPoints(tenantId, domain) {
      return [...trends.values()]
        .filter(
          (t) =>
            t.tenantId === tenantId && (domain === undefined || t.domain === domain),
        )
        .sort((a, b) => a.periodStart.localeCompare(b.periodStart));
    },
    async upsertTrendPoint(item) {
      const frozen = Object.freeze({ ...item });
      trends.set(k(item.tenantId, item.id), frozen);
      return frozen;
    },
    async listKpis(tenantId) {
      return [...kpis.values()]
        .filter((item) => item.tenantId === tenantId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async upsertKpi(item) {
      const frozen = Object.freeze({
        ...item,
        history: Object.freeze(item.history.map((h) => Object.freeze({ ...h }))),
      });
      kpis.set(k(item.tenantId, item.id), frozen);
      return frozen;
    },
    async listTimeline(tenantId) {
      return [...timeline.values()]
        .filter((item) => item.tenantId === tenantId)
        .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
    },
    async upsertTimelineEntry(item) {
      const frozen = Object.freeze({
        ...item,
        evidenceRefs: Object.freeze([...item.evidenceRefs]),
      });
      timeline.set(k(item.tenantId, item.id), frozen);
      return frozen;
    },
  };
}

let singleton: DecisionIntelligenceStore | undefined;

export function getMemoryDecisionIntelligenceStore(): DecisionIntelligenceStore {
  if (!singleton) singleton = createMemoryDecisionIntelligenceStore();
  return singleton;
}

export function resetMemoryDecisionIntelligenceStoreForTests(): void {
  singleton = createMemoryDecisionIntelligenceStore();
}

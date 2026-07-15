/** In-process mock Engineering Intelligence client (APZTCMS-022). */

import type { EngineeringIntelligenceClient } from "./engineering-intelligence-client";
import type {
  BaselineViewModel,
  BenchmarkViewModel,
  EngineeringHealthViewModel,
  EngineeringRiskViewModel,
  EngineeringSnapshotViewModel,
  HistoricalSnapshotViewModel,
  QualityScoreViewModel,
  TrendSeriesViewModel,
} from "./engineering-intelligence-types";

export const MOCK_EI_SCORE: QualityScoreViewModel = {
  id: "qs_mock",
  score: 78.5,
  computedAt: "2026-07-12T12:00:00.000Z",
  scope: { tenantId: "tenant_1" },
  inputs: {
    coverage: 80,
    automation: 70,
    manualExecution: 30,
    failedTests: 5,
    openDefects: 10,
    certification: 90,
    approvals: 85,
    releaseReadiness: 75,
  },
  components: [
    {
      key: "coverage",
      weight: 0.15,
      input: 80,
      contribution: 12,
      inverted: false,
    },
  ],
};

export const MOCK_EI_RISK: EngineeringRiskViewModel = {
  overallScore: 22,
  overallLevel: "low",
  factors: [
    {
      key: "quality",
      score: 15,
      level: "low",
      reasons: ["Mock quality risk"],
    },
    {
      key: "defect",
      score: 20,
      level: "low",
      reasons: ["Mock defect risk"],
    },
  ],
  computedAt: "2026-07-12T12:00:00.000Z",
};

export const MOCK_EI_HEALTH: EngineeringHealthViewModel = {
  status: "watch",
  overallScore: 76,
  qualityScore: 78.5,
  stabilityScore: 80,
  releaseReadinessScore: 75,
  riskScore: 22,
  coverageScore: 80,
  automationScore: 70,
  certificationScore: 90,
  pipelineHealthScore: 95,
  computedAt: "2026-07-12T12:00:00.000Z",
  isDecision: false,
  risk: MOCK_EI_RISK,
};

export const MOCK_EI_SNAPSHOT: EngineeringSnapshotViewModel = {
  id: "eisnap_mock",
  label: "mock-snapshot",
  computedAt: "2026-07-12T12:00:00.000Z",
  qualityScore: MOCK_EI_SCORE,
  health: MOCK_EI_HEALTH,
  risk: MOCK_EI_RISK,
};

export const MOCK_EI_TRENDS: readonly TrendSeriesViewModel[] = [
  {
    id: "trend_quality",
    kind: "quality",
    direction: "improving",
    delta: 5,
    periodKind: "weekly",
    points: [
      { at: "2026-07-05T12:00:00.000Z", value: 73 },
      { at: "2026-07-12T12:00:00.000Z", value: 78.5 },
    ],
    computedAt: "2026-07-12T12:00:00.000Z",
  },
  {
    id: "trend_coverage",
    kind: "coverage",
    direction: "stable",
    delta: 0,
    periodKind: "weekly",
    points: [{ at: "2026-07-12T12:00:00.000Z", value: 80 }],
    computedAt: "2026-07-12T12:00:00.000Z",
  },
  {
    id: "trend_automation",
    kind: "automation",
    direction: "increase",
    delta: 3,
    periodKind: "weekly",
    points: [
      { at: "2026-07-05T12:00:00.000Z", value: 67 },
      { at: "2026-07-12T12:00:00.000Z", value: 70 },
    ],
    computedAt: "2026-07-12T12:00:00.000Z",
  },
  {
    id: "trend_execution",
    kind: "execution",
    direction: "stable",
    delta: 0,
    periodKind: "weekly",
    points: [{ at: "2026-07-12T12:00:00.000Z", value: 30 }],
    computedAt: "2026-07-12T12:00:00.000Z",
  },
  {
    id: "trend_release",
    kind: "release",
    direction: "improving",
    delta: 5,
    periodKind: "weekly",
    points: [
      { at: "2026-07-05T12:00:00.000Z", value: 70 },
      { at: "2026-07-12T12:00:00.000Z", value: 75 },
    ],
    computedAt: "2026-07-12T12:00:00.000Z",
  },
  {
    id: "trend_certification",
    kind: "certification",
    direction: "stable",
    delta: 0,
    periodKind: "weekly",
    points: [{ at: "2026-07-12T12:00:00.000Z", value: 90 }],
    computedAt: "2026-07-12T12:00:00.000Z",
  },
  {
    id: "trend_defect",
    kind: "defect",
    direction: "declining",
    delta: -4,
    periodKind: "weekly",
    points: [
      { at: "2026-07-05T12:00:00.000Z", value: 14 },
      { at: "2026-07-12T12:00:00.000Z", value: 10 },
    ],
    computedAt: "2026-07-12T12:00:00.000Z",
  },
];

export const MOCK_EI_BENCHMARK: BenchmarkViewModel = {
  id: "bench_mock",
  metricKey: "coverage",
  label: "coverage-bench",
  comparison: {
    current: 80,
    previous: 75,
    rollingAverage: 77.5,
    baseline: 70,
    best: 80,
    worst: 75,
    direction: "improving",
  },
  computedAt: "2026-07-12T12:00:00.000Z",
};

export const MOCK_EI_BASELINE: BaselineViewModel = {
  id: "base_mock",
  kind: "last_month",
  metricKey: "coverage",
  value: 70,
  label: "June",
  computedAt: "2026-07-12T12:00:00.000Z",
};

export const MOCK_EI_HISTORICAL: HistoricalSnapshotViewModel = {
  id: "hist_mock",
  qualityScore: 78.5,
  engineeringHealthScore: 76,
  immutable: true,
  period: {
    kind: "monthly",
    startAt: "2026-06-01T00:00:00.000Z",
    endAt: "2026-06-30T23:59:59.000Z",
    label: "June 2026",
  },
  computedAt: "2026-07-12T12:00:00.000Z",
};

export function createMockEngineeringIntelligenceClient(): EngineeringIntelligenceClient {
  return {
    getScore: async () => MOCK_EI_SCORE,
    scoreWithScope: async () => MOCK_EI_SCORE,
    getHealth: async () => MOCK_EI_HEALTH,
    assessHealth: async () => MOCK_EI_HEALTH,
    getRisk: async () => MOCK_EI_RISK,
    listSnapshots: async () => ({ items: [MOCK_EI_SNAPSHOT], total: 1 }),
    getSnapshot: async (id) => ({ ...MOCK_EI_SNAPSHOT, id }),
    computeSnapshot: async () => MOCK_EI_SNAPSHOT,
    listTrends: async () => ({ items: MOCK_EI_TRENDS, total: MOCK_EI_TRENDS.length }),
    buildTrend: async (input) => ({
      ...MOCK_EI_TRENDS[0]!,
      kind: input.kind,
    }),
    listBenchmarks: async () => ({ items: [MOCK_EI_BENCHMARK], total: 1 }),
    compareBenchmark: async () => MOCK_EI_BENCHMARK,
    listBaselines: async () => ({ items: [MOCK_EI_BASELINE], total: 1 }),
    listHistorical: async () => ({ items: [MOCK_EI_HISTORICAL], total: 1 }),
  };
}

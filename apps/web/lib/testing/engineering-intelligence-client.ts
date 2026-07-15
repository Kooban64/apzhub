/**
 * Typed Engineering Intelligence HTTP client — calls ONLY
 * `/api/v1/testing/engineering-intelligence/*`.
 */

import { EngineeringIntelligenceClientError } from "./engineering-intelligence-errors";
import type {
  BaselineViewModel,
  BenchmarkViewModel,
  EngineeringClientRequestOptions,
  EngineeringCollectionResult,
  EngineeringHealthViewModel,
  EngineeringRiskViewModel,
  EngineeringScopeInput,
  EngineeringSnapshotViewModel,
  HistoricalSnapshotViewModel,
  QualityScoreViewModel,
  TrendSeriesViewModel,
} from "./engineering-intelligence-types";

const API_BASE = "/api/v1";

type JsonRecord = Record<string, unknown>;
type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T; readonly meta?: JsonRecord };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly total?: number };
  readonly meta?: JsonRecord;
};

export interface EngineeringIntelligenceClient {
  getScore(options?: EngineeringClientRequestOptions): Promise<QualityScoreViewModel>;
  scoreWithScope(
    input?: { readonly scope?: EngineeringScopeInput; readonly weights?: Readonly<Record<string, number>> },
    options?: EngineeringClientRequestOptions,
  ): Promise<QualityScoreViewModel>;
  getHealth(options?: EngineeringClientRequestOptions): Promise<EngineeringHealthViewModel>;
  assessHealth(
    input?: { readonly scope?: EngineeringScopeInput },
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringHealthViewModel>;
  getRisk(options?: EngineeringClientRequestOptions): Promise<EngineeringRiskViewModel>;
  listSnapshots(
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringCollectionResult<EngineeringSnapshotViewModel>>;
  getSnapshot(
    snapshotId: string,
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringSnapshotViewModel>;
  computeSnapshot(
    input?: { readonly scope?: EngineeringScopeInput; readonly label?: string },
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringSnapshotViewModel>;
  listTrends(
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringCollectionResult<TrendSeriesViewModel>>;
  buildTrend(
    input: { readonly kind: string; readonly periodKind?: string; readonly scope?: EngineeringScopeInput },
    options?: EngineeringClientRequestOptions,
  ): Promise<TrendSeriesViewModel>;
  listBenchmarks(
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringCollectionResult<BenchmarkViewModel>>;
  compareBenchmark(
    input: {
      readonly metricKey: string;
      readonly values: readonly number[];
      readonly baselineValue?: number;
      readonly label?: string;
    },
    options?: EngineeringClientRequestOptions,
  ): Promise<BenchmarkViewModel>;
  listBaselines(
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringCollectionResult<BaselineViewModel>>;
  listHistorical(
    options?: EngineeringClientRequestOptions,
  ): Promise<EngineeringCollectionResult<HistoricalSnapshotViewModel>>;
}

function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" ? (value as JsonRecord) : {};
}

function mapScore(raw: unknown): QualityScoreViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    score: Number(r.score ?? 0),
    computedAt: String(r.computedAt ?? ""),
    scope: asRecord(r.scope),
    inputs: (r.inputs as Readonly<Record<string, number>>) ?? {},
    components: Array.isArray(r.components)
      ? (r.components as QualityScoreViewModel["components"])
      : [],
  };
}

function mapRisk(raw: unknown): EngineeringRiskViewModel {
  const r = asRecord(raw);
  return {
    overallScore: Number(r.overallScore ?? 0),
    overallLevel: String(r.overallLevel ?? "unknown"),
    factors: Array.isArray(r.factors)
      ? (r.factors as EngineeringRiskViewModel["factors"])
      : [],
    computedAt: String(r.computedAt ?? ""),
  };
}

function mapHealth(raw: unknown): EngineeringHealthViewModel {
  const r = asRecord(raw);
  return {
    status: String(r.status ?? "unknown"),
    overallScore: Number(r.overallScore ?? 0),
    qualityScore: Number(r.qualityScore ?? 0),
    stabilityScore: Number(r.stabilityScore ?? 0),
    releaseReadinessScore: Number(r.releaseReadinessScore ?? 0),
    riskScore: Number(r.riskScore ?? 0),
    coverageScore: Number(r.coverageScore ?? 0),
    automationScore: Number(r.automationScore ?? 0),
    certificationScore: Number(r.certificationScore ?? 0),
    pipelineHealthScore: Number(r.pipelineHealthScore ?? 0),
    computedAt: String(r.computedAt ?? ""),
    isDecision: false,
    risk: mapRisk(r.risk),
  };
}

function mapSnapshot(raw: unknown): EngineeringSnapshotViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    label: r.label !== undefined ? String(r.label) : undefined,
    computedAt: String(r.computedAt ?? ""),
    qualityScore: mapScore(r.qualityScore),
    health: mapHealth(r.health),
    risk: mapRisk(r.risk),
  };
}

function mapTrend(raw: unknown): TrendSeriesViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    kind: String(r.kind ?? ""),
    direction: String(r.direction ?? "unknown"),
    delta: Number(r.delta ?? 0),
    periodKind: String(r.periodKind ?? ""),
    points: Array.isArray(r.points) ? (r.points as TrendSeriesViewModel["points"]) : [],
    computedAt: String(r.computedAt ?? ""),
  };
}

function mapBenchmark(raw: unknown): BenchmarkViewModel {
  const r = asRecord(raw);
  const comparison = asRecord(r.comparison);
  return {
    id: String(r.id ?? ""),
    metricKey: String(r.metricKey ?? ""),
    label: r.label !== undefined ? String(r.label) : undefined,
    comparison: {
      current: Number(comparison.current ?? 0),
      previous:
        comparison.previous !== undefined ? Number(comparison.previous) : undefined,
      rollingAverage:
        comparison.rollingAverage !== undefined
          ? Number(comparison.rollingAverage)
          : undefined,
      baseline:
        comparison.baseline !== undefined ? Number(comparison.baseline) : undefined,
      best: comparison.best !== undefined ? Number(comparison.best) : undefined,
      worst: comparison.worst !== undefined ? Number(comparison.worst) : undefined,
      direction: String(comparison.direction ?? "unknown"),
    },
    computedAt: String(r.computedAt ?? ""),
  };
}

function mapBaseline(raw: unknown): BaselineViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    kind: String(r.kind ?? ""),
    metricKey: String(r.metricKey ?? ""),
    value: Number(r.value ?? 0),
    label: r.label !== undefined ? String(r.label) : undefined,
    computedAt: String(r.computedAt ?? ""),
  };
}

function mapHistorical(raw: unknown): HistoricalSnapshotViewModel {
  const r = asRecord(raw);
  const period = asRecord(r.period);
  return {
    id: String(r.id ?? ""),
    qualityScore: Number(r.qualityScore ?? 0),
    engineeringHealthScore: Number(r.engineeringHealthScore ?? 0),
    immutable: true,
    period: {
      kind: String(period.kind ?? ""),
      startAt: String(period.startAt ?? ""),
      endAt: String(period.endAt ?? ""),
      label: period.label !== undefined ? String(period.label) : undefined,
    },
    computedAt: String(r.computedAt ?? ""),
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: EngineeringClientRequestOptions,
): Promise<T> {
  if (!path.startsWith("/testing/engineering-intelligence")) {
    throw new EngineeringIntelligenceClientError({
      message: `Invalid Engineering Intelligence API path: ${path}`,
      code: "ENGINEERING_INTELLIGENCE_CLIENT_ROUTE_VIOLATION",
      status: 500,
    });
  }

  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (options?.correlationId) {
    headers.set("x-correlation-id", options.correlationId);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiErrorEnvelope &
    ApiSuccessEnvelope<unknown> &
    ApiCollectionEnvelope<unknown>;
  if (!response.ok) {
    const code = payload.error?.code;
    throw new EngineeringIntelligenceClientError({
      message: payload.error?.message ?? `Request failed (${response.status})`,
      code:
        response.status === 401
          ? "unauthorized"
          : response.status === 403
            ? "forbidden"
            : code,
      correlationId: payload.meta?.correlationId,
      status: response.status,
    });
  }
  return payload as T;
}

export function createHttpEngineeringIntelligenceClient(): EngineeringIntelligenceClient {
  return {
    async getScore(options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/score",
        { method: "GET" },
        options,
      );
      return mapScore(res.data);
    },
    async scoreWithScope(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/score",
        { method: "POST", body: JSON.stringify(input ?? {}) },
        options,
      );
      return mapScore(res.data);
    },
    async getHealth(options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/health",
        { method: "GET" },
        options,
      );
      return mapHealth(res.data);
    },
    async assessHealth(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/health",
        { method: "POST", body: JSON.stringify(input ?? {}) },
        options,
      );
      return mapHealth(res.data);
    },
    async getRisk(options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/risk",
        { method: "GET" },
        options,
      );
      return mapRisk(res.data);
    },
    async listSnapshots(options) {
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        "/testing/engineering-intelligence/snapshots",
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(mapSnapshot);
      return { items, total: items.length };
    },
    async getSnapshot(snapshotId, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        `/testing/engineering-intelligence/snapshots/${encodeURIComponent(snapshotId)}`,
        { method: "GET" },
        options,
      );
      return mapSnapshot(res.data);
    },
    async computeSnapshot(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/snapshots",
        { method: "POST", body: JSON.stringify(input ?? {}) },
        options,
      );
      return mapSnapshot(res.data);
    },
    async listTrends(options) {
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        "/testing/engineering-intelligence/trends",
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(mapTrend);
      return { items, total: items.length };
    },
    async buildTrend(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/trends",
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapTrend(res.data);
    },
    async listBenchmarks(options) {
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        "/testing/engineering-intelligence/benchmarks",
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(mapBenchmark);
      return { items, total: items.length };
    },
    async compareBenchmark(input, options) {
      const res = await requestJson<ApiSuccessEnvelope<unknown>>(
        "/testing/engineering-intelligence/benchmarks",
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapBenchmark(res.data);
    },
    async listBaselines(options) {
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        "/testing/engineering-intelligence/baselines",
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(mapBaseline);
      return { items, total: items.length };
    },
    async listHistorical(options) {
      const res = await requestJson<ApiCollectionEnvelope<unknown>>(
        "/testing/engineering-intelligence/historical",
        { method: "GET" },
        options,
      );
      const items = (Array.isArray(res.data) ? res.data : []).map(mapHistorical);
      return { items, total: items.length };
    },
  };
}

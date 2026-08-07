/**
 * Decision Intelligence client — APZ-ANALYTICS-CAPABILITY-001.
 * Calls ONLY `/api/v1/analytics/decision-*` routes.
 */

import { AnalyticsApiError } from "./errors";

export type DecisionAudienceRole =
  "executive" | "manager" | "project_manager" | "support_manager" | "team_member";

export type DecisionTrendDomain =
  | "project_delivery"
  | "support_performance"
  | "workflow_throughput"
  | "operational_quality";

export type DecisionQuestion = {
  readonly id: string;
  readonly question: string;
  readonly audienceRoles: readonly DecisionAudienceRole[];
  readonly domain: string;
  readonly horizon: string;
  readonly whyItMatters: string;
  readonly evidenceSummary: string;
  readonly recommendedActions: readonly string[];
  readonly relatedProducts: readonly string[];
};

export type DecisionPack = {
  readonly id: string;
  readonly questionId: string;
  readonly question: string;
  readonly audienceRole: DecisionAudienceRole;
  readonly indicators: readonly {
    readonly label: string;
    readonly value: string;
    readonly direction: string;
    readonly significance: string;
  }[];
  readonly supportingEvidence: readonly string[];
  readonly trendSummary: string;
  readonly recommendedActions: readonly string[];
  readonly generatedAt: string;
};

export type DecisionTrendSeries = {
  readonly domain: DecisionTrendDomain;
  readonly title: string;
  readonly changeSummary: string;
  readonly points: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly unit: string;
    readonly periodStart: string;
    readonly periodEnd: string;
  }[];
};

export type DecisionKpi = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly owner: string;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly unit: string;
  readonly domain: DecisionTrendDomain;
  readonly status: string;
  readonly history: readonly { readonly at: string; readonly value: number }[];
};

export type DecisionTimelineEntry = {
  readonly id: string;
  readonly title: string;
  readonly decision: string;
  readonly rationale: string;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly evidenceRefs: readonly string[];
  readonly relatedQuestionId?: string;
  readonly relatedProduct?: string;
};

type Options = { readonly signal?: AbortSignal };

async function requestJson<T>(
  path: string,
  init: RequestInit & Options = {},
): Promise<T> {
  const { signal, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api/v1${path}`, {
    ...rest,
    signal,
    credentials: "include",
    headers,
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const record =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const error =
    typeof record.error === "object" && record.error !== null
      ? (record.error as Record<string, unknown>)
      : undefined;
  if (!response.ok) {
    throw AnalyticsApiError.fromHttp({
      status: response.status,
      message: typeof error?.message === "string" ? error.message : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
    });
  }
  if (!("data" in record)) {
    throw AnalyticsApiError.fromHttp({
      status: 502,
      message: "Unexpected Analytics response envelope.",
    });
  }
  return body as T;
}

type DataEnvelope<T> = { readonly data: T };

export async function listDecisionQuestions(
  role?: DecisionAudienceRole,
  options?: Options,
) {
  const qs = role ? `?role=${encodeURIComponent(role)}` : "";
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly DecisionQuestion[] }>
  >(`/analytics/decision-questions${qs}`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function listDecisionPacks(options?: Options) {
  const envelope = await requestJson<DataEnvelope<{ items: readonly DecisionPack[] }>>(
    "/analytics/decision-packs",
    { ...options, method: "GET" },
  );
  return envelope.data.items;
}

export async function generateDecisionPack(
  input: { readonly questionId: string; readonly audienceRole: DecisionAudienceRole },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<DecisionPack>>(
    "/analytics/decision-packs",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listDecisionTrends(
  domain?: DecisionTrendDomain,
  options?: Options,
) {
  const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly DecisionTrendSeries[] }>
  >(`/analytics/decision-trends${qs}`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function listDecisionKpis(options?: Options) {
  const envelope = await requestJson<DataEnvelope<{ items: readonly DecisionKpi[] }>>(
    "/analytics/decision-kpis",
    { ...options, method: "GET" },
  );
  return envelope.data.items;
}

export async function createDecisionKpi(
  input: {
    readonly name: string;
    readonly description: string;
    readonly owner: string;
    readonly targetValue: number;
    readonly currentValue: number;
    readonly unit: string;
    readonly domain: DecisionTrendDomain;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<DecisionKpi>>(
    "/analytics/decision-kpis",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateDecisionKpi(
  kpiId: string,
  input: { readonly currentValue?: number; readonly targetValue?: number },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<DecisionKpi>>(
    `/analytics/decision-kpis/${kpiId}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listDecisionTimeline(options?: Options) {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly DecisionTimelineEntry[] }>
  >("/analytics/decision-timeline", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createDecisionTimelineEntry(
  input: {
    readonly title: string;
    readonly decision: string;
    readonly rationale: string;
    readonly decidedBy: string;
    readonly evidenceRefs?: readonly string[];
    readonly relatedQuestionId?: string;
    readonly relatedProduct?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<DecisionTimelineEntry>>(
    "/analytics/decision-timeline",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

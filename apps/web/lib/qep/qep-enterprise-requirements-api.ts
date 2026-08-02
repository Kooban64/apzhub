/**
 * Enterprise Requirements & Traceability HTTP client (APZQEP-140-E).
 */

import type {
  CoverageSnapshot,
  RequirementAggregate,
  RequirementCategory,
  RequirementLifecycleState,
  RequirementNode,
  RequirementPriority,
  RequirementRisk,
  TraceabilityMatrixRow,
  TraceLink,
} from "@apzhub/qep-requirements-traceability";

export type QepEnterpriseRequirementListParams = {
  readonly projectId?: string;
  readonly status?: string;
  readonly category?: string;
  readonly priority?: string;
  readonly risk?: string;
  readonly ownerId?: string;
  readonly suiteId?: string;
  readonly query?: string;
  readonly uncoveredOnly?: boolean;
  readonly highRiskOnly?: boolean;
  readonly includeArchived?: boolean;
  readonly sortBy?: "title" | "updatedAt" | "createdAt" | "priority" | "risk";
  readonly sortDirection?: "asc" | "desc";
};

export type CreateEnterpriseRequirementInput = {
  readonly title: string;
  readonly description?: string;
  readonly category?: RequirementCategory;
  readonly priority?: RequirementPriority;
  readonly criticality?: "critical" | "high" | "medium" | "low";
  readonly risk?: RequirementRisk;
  readonly tags?: readonly string[];
};

export type QepClientRequestOptions = { readonly signal?: AbortSignal };

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

async function parseCollection<T>(
  response: Response,
): Promise<{ readonly items: readonly T[] }> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  const body = (await response.json()) as { data: readonly T[] };
  return { items: body.data };
}

function qs(params?: QepEnterpriseRequirementListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

const BASE = "/api/v1/qep/enterprise-requirements";

export async function listEnterpriseRequirements(
  params?: QepEnterpriseRequirementListParams,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}${qs(params)}`, {
    signal: options?.signal,
  });
  return parseCollection<RequirementNode>(response);
}

export async function getEnterpriseRequirement(
  requirementId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(requirementId)}`, {
    signal: options?.signal,
  });
  return parseJson<RequirementAggregate>(response);
}

export async function createEnterpriseRequirement(
  input: CreateEnterpriseRequirementInput,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<RequirementNode>(response);
}

export async function transitionEnterpriseRequirement(
  requirementId: string,
  status: RequirementLifecycleState,
  reason?: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(requirementId)}/lifecycle`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
      signal: options?.signal,
    },
  );
  return parseJson<RequirementNode>(response);
}

export async function linkSuiteToRequirement(
  requirementId: string,
  suiteId: string,
  suiteName?: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(requirementId)}/link-suite`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        suiteId,
        ...(suiteName ? { suiteName } : {}),
      }),
      signal: options?.signal,
    },
  );
  return parseJson<RequirementNode>(response);
}

export async function getRequirementCoverage(
  requirementId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(requirementId)}/coverage-snapshot`,
    { signal: options?.signal },
  );
  return parseJson<CoverageSnapshot>(response);
}

export async function getRequirementTraceability(
  requirementId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(requirementId)}/traceability`,
    { signal: options?.signal },
  );
  return parseJson<{
    readonly links: readonly TraceLink[];
    readonly coverage: CoverageSnapshot;
  }>(response);
}

export async function getTraceabilityMatrix(
  params?: QepEnterpriseRequirementListParams,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/matrix${qs(params)}`, {
    signal: options?.signal,
  });
  return parseCollection<TraceabilityMatrixRow>(response);
}

export async function getCoverageDashboard(
  params?: QepEnterpriseRequirementListParams,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/coverage-dashboard${qs(params)}`, {
    signal: options?.signal,
  });
  return parseJson<{
    readonly items: readonly CoverageSnapshot[];
    readonly summary: {
      readonly total: number;
      readonly uncovered: number;
      readonly highRiskGaps: number;
      readonly averageCoverage: number;
    };
  }>(response);
}

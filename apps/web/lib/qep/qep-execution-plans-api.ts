/**
 * Enterprise Test Execution Planning HTTP client (APZQEP-140-B).
 */

import type {
  ExecutionPlanAggregate,
  ExecutionPlanLifecycleState,
  ExecutionPlanNode,
  PlanAssignments,
  PlanSchedule,
  ReadinessSnapshot,
} from "@apzhub/qep-execution-plans";

export type QepExecutionPlanListParams = {
  readonly projectId?: string;
  readonly status?: string;
  readonly readinessState?: string;
  readonly suiteId?: string;
  readonly ownerId?: string;
  readonly assigneeId?: string;
  readonly query?: string;
  readonly sortBy?: "name" | "updatedAt" | "createdAt" | "priority" | "plannedStartAt";
  readonly sortDirection?: "asc" | "desc";
};

export type QepClientRequestOptions = { readonly signal?: AbortSignal };

export type CreateQepExecutionPlanInput = {
  readonly name: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly suiteId: string;
  readonly suiteVersion?: number;
  readonly priority?: "low" | "normal" | "high" | "critical";
  readonly risk?: string;
  readonly tags?: readonly string[];
  readonly assignments?: Partial<PlanAssignments>;
  readonly environmentReferences?: readonly {
    readonly referenceId: string;
    readonly label: string;
    readonly kind?: string;
  }[];
  readonly schedule?: Partial<PlanSchedule>;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string };
    };
    const message = body.error?.message ?? `Request failed (${response.status})`;
    const error = new Error(message) as Error & {
      code?: string;
      status?: number;
    };
    error.code = body.error?.code;
    error.status = response.status;
    throw error;
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

function qs(params?: QepExecutionPlanListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

const BASE = "/api/v1/qep/execution-plans";

export async function listExecutionPlans(
  params?: QepExecutionPlanListParams,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}${qs(params)}`, {
    signal: options?.signal,
  });
  return parseCollection<ExecutionPlanNode>(response);
}

export async function getExecutionPlan(
  planId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(planId)}`, {
    signal: options?.signal,
  });
  return parseJson<ExecutionPlanAggregate>(response);
}

export async function createExecutionPlan(
  input: CreateQepExecutionPlanInput,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<ExecutionPlanNode>(response);
}

export async function transitionExecutionPlan(
  planId: string,
  status: ExecutionPlanLifecycleState,
  reason?: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(planId)}/lifecycle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
    signal: options?.signal,
  });
  return parseJson<ExecutionPlanNode>(response);
}

export async function evaluateExecutionPlanReadiness(
  planId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(planId)}/readiness`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: options?.signal,
  });
  return parseJson<ReadinessSnapshot>(response);
}

export async function scheduleExecutionPlan(
  planId: string,
  schedule: Partial<PlanSchedule>,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(planId)}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
    signal: options?.signal,
  });
  return parseJson<ExecutionPlanNode>(response);
}

export async function assignExecutionPlan(
  planId: string,
  assignments: Partial<PlanAssignments>,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(planId)}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assignments),
    signal: options?.signal,
  });
  return parseJson<ExecutionPlanNode>(response);
}

export async function cloneExecutionPlan(
  planId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(planId)}/clone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: options?.signal,
  });
  return parseJson<ExecutionPlanNode>(response);
}

export async function handoffExecutionPlan(
  planId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(planId)}/handoff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: options?.signal,
  });
  return parseJson<ExecutionPlanNode>(response);
}

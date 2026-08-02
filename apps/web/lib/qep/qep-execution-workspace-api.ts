/**
 * Enterprise Test Execution Workspace HTTP client (APZQEP-140-C).
 */

import type {
  ExecutionSessionAggregate,
  ExecutionSessionNode,
  StepOutcome,
} from "@apzhub/qep-execution-workspace";

export type QepExecutionSessionListParams = {
  readonly projectId?: string;
  readonly status?: string;
  readonly ownerId?: string;
  readonly assigneeId?: string;
  readonly planId?: string;
  readonly handoffId?: string;
  readonly query?: string;
  readonly sortBy?: "name" | "updatedAt" | "createdAt" | "percentComplete";
  readonly sortDirection?: "asc" | "desc";
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

function qs(params?: QepExecutionSessionListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

const BASE = "/api/v1/qep/execution-sessions";

export async function listExecutionSessions(
  params?: QepExecutionSessionListParams,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}${qs(params)}`, {
    signal: options?.signal,
  });
  return parseCollection<ExecutionSessionNode>(response);
}

export async function getExecutionSession(
  sessionId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(sessionId)}`, {
    signal: options?.signal,
  });
  return parseJson<ExecutionSessionAggregate>(response);
}

export async function createExecutionSessionFromHandoff(
  handoffId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handoffId }),
    signal: options?.signal,
  });
  return parseJson<ExecutionSessionNode>(response);
}

export async function lifecycleExecutionSession(
  sessionId: string,
  action: "open" | "pause" | "resume" | "block" | "complete" | "cancel" | "archive",
  reason?: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(sessionId)}/lifecycle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
    signal: options?.signal,
  });
  return parseJson<ExecutionSessionNode>(response);
}

export async function recordExecutionStepResult(
  sessionId: string,
  input: {
    readonly stepId: string;
    readonly outcome: StepOutcome;
    readonly comment?: string;
    readonly failureNotes?: string;
    readonly durationMs?: number;
  },
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(sessionId)}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<ExecutionSessionNode>(response);
}

export async function attachExecutionEvidence(
  sessionId: string,
  input: {
    readonly evidenceId: string;
    readonly stepId?: string;
    readonly note?: string;
  },
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(sessionId)}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<ExecutionSessionNode>(response);
}

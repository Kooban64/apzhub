/**
 * Enterprise Defect Management HTTP client (APZQEP-140-D).
 */

import type {
  DefectAggregate,
  DefectHistoryEntry,
  DefectLifecycleState,
  DefectNode,
  DefectPriority,
  DefectSeverity,
} from "@apzhub/qep-defects";

export type QepDefectListParams = {
  readonly projectId?: string;
  readonly status?: string;
  readonly severity?: string;
  readonly priority?: string;
  readonly assigneeId?: string;
  readonly reporterId?: string;
  readonly sessionId?: string;
  readonly suiteId?: string;
  readonly query?: string;
  readonly includeArchived?: boolean;
  readonly sortBy?: "title" | "updatedAt" | "createdAt" | "severity" | "priority";
  readonly sortDirection?: "asc" | "desc";
};

export type CreateQepDefectInput = {
  readonly title: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly severity?: DefectSeverity;
  readonly priority?: DefectPriority;
  readonly category?: string;
  readonly environment?: string;
  readonly component?: string;
  readonly tags?: readonly string[];
  readonly sessionId?: string;
  readonly stepId?: string;
  readonly evidenceIds?: readonly string[];
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

function qs(params?: QepDefectListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

const BASE = "/api/v1/qep/defects";

export async function listDefects(
  params?: QepDefectListParams,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}${qs(params)}`, {
    signal: options?.signal,
  });
  return parseCollection<DefectNode>(response);
}

export async function getDefect(defectId: string, options?: QepClientRequestOptions) {
  const response = await fetch(`${BASE}/${encodeURIComponent(defectId)}`, {
    signal: options?.signal,
  });
  return parseJson<DefectAggregate>(response);
}

export async function createDefect(
  input: CreateQepDefectInput,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<DefectNode>(response);
}

export async function createDefectFromExecution(
  input: {
    readonly sessionId: string;
    readonly stepId?: string;
    readonly title?: string;
    readonly description?: string;
    readonly severity?: DefectSeverity;
    readonly priority?: DefectPriority;
  },
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/from-execution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<DefectNode>(response);
}

export async function updateDefect(
  defectId: string,
  patch: Partial<CreateQepDefectInput> & {
    readonly resolution?: string;
    readonly rootCause?: string;
    readonly verificationNotes?: string;
  },
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(defectId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
    signal: options?.signal,
  });
  return parseJson<DefectNode>(response);
}

export async function transitionDefect(
  defectId: string,
  status: DefectLifecycleState,
  reason?: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(defectId)}/lifecycle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
    signal: options?.signal,
  });
  return parseJson<DefectNode>(response);
}

export async function assignDefect(
  defectId: string,
  assigneeId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(defectId)}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigneeId }),
    signal: options?.signal,
  });
  return parseJson<DefectNode>(response);
}

export async function attachDefectEvidence(
  defectId: string,
  evidenceId: string,
  note?: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(defectId)}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evidenceId, ...(note ? { note } : {}) }),
    signal: options?.signal,
  });
  return parseJson<DefectNode>(response);
}

export async function getDefectHistory(
  defectId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/${encodeURIComponent(defectId)}/history`, {
    signal: options?.signal,
  });
  return parseCollection<DefectHistoryEntry>(response);
}

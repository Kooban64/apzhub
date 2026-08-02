/**
 * Enterprise Test Suite Management HTTP client (APZQEP-140-A).
 * Presentation-only — binds to `/api/v1/qep/suites` DTOs.
 */

import type {
  SuiteAggregate,
  SuiteLifecycleState,
  SuiteNode,
} from "@apzhub/qep-suites";

export type QepSuiteListParams = {
  readonly projectId?: string;
  readonly status?: SuiteLifecycleState | string;
  readonly query?: string;
  readonly ownerId?: string;
  readonly sortBy?: "name" | "updatedAt" | "createdAt" | "priority";
  readonly sortDirection?: "asc" | "desc";
};

export type QepClientRequestOptions = {
  readonly signal?: AbortSignal;
};

export type CreateQepSuiteInput = {
  readonly name: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly parentSuiteId?: string;
  readonly folderPath?: string;
  readonly kind?: "standard" | "shared" | "reusable" | "template" | "reference";
  readonly priority?: "low" | "normal" | "high" | "critical";
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly risk?: string;
  readonly businessArea?: string;
  readonly application?: string;
  readonly component?: string;
  readonly classification?: string;
  readonly customMetadata?: Readonly<Record<string, unknown>>;
};

export type UpdateQepSuiteInput = Partial<CreateQepSuiteInput> & {
  readonly ownerId?: string;
};

export type QepCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total?: number;
  readonly limit?: number;
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

async function parseCollection<T>(response: Response): Promise<QepCollectionResult<T>> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  const body = (await response.json()) as {
    data: readonly T[];
    page?: { total?: number; limit?: number };
  };
  return {
    items: body.data,
    total: body.page?.total ?? body.data.length,
    limit: body.page?.limit,
  };
}

function buildListQuery(params?: QepSuiteListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.status) search.set("status", params.status);
  if (params.query) search.set("query", params.query);
  if (params.ownerId) search.set("ownerId", params.ownerId);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDirection) search.set("sortDirection", params.sortDirection);
  const query = search.toString();
  return query ? `?${query}` : "";
}

const BASE = "/api/v1/qep/suites";

export async function listSuites(
  params?: QepSuiteListParams,
  options?: QepClientRequestOptions,
): Promise<QepCollectionResult<SuiteNode>> {
  const response = await fetch(`${BASE}${buildListQuery(params)}`, {
    signal: options?.signal,
  });
  return parseCollection<SuiteNode>(response);
}

export async function listSuiteTree(
  options?: QepClientRequestOptions,
): Promise<QepCollectionResult<SuiteNode>> {
  const response = await fetch(`${BASE}/tree`, { signal: options?.signal });
  return parseCollection<SuiteNode>(response);
}

export async function getSuite(
  suiteId: string,
  options?: QepClientRequestOptions,
): Promise<SuiteAggregate> {
  const response = await fetch(`${BASE}/${encodeURIComponent(suiteId)}`, {
    signal: options?.signal,
  });
  return parseJson<SuiteAggregate>(response);
}

export async function createSuite(
  input: CreateQepSuiteInput,
  options?: QepClientRequestOptions,
): Promise<SuiteNode> {
  const response = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<SuiteNode>(response);
}

export async function updateSuite(
  suiteId: string,
  input: UpdateQepSuiteInput,
  options?: QepClientRequestOptions,
): Promise<SuiteNode> {
  const response = await fetch(`${BASE}/${encodeURIComponent(suiteId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<SuiteNode>(response);
}

export async function transitionSuite(
  suiteId: string,
  status: SuiteLifecycleState,
  options?: QepClientRequestOptions,
): Promise<SuiteNode> {
  const response = await fetch(`${BASE}/${encodeURIComponent(suiteId)}/lifecycle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    signal: options?.signal,
  });
  return parseJson<SuiteNode>(response);
}

export async function cloneSuite(
  suiteId: string,
  options?: QepClientRequestOptions,
): Promise<SuiteNode> {
  const response = await fetch(`${BASE}/${encodeURIComponent(suiteId)}/clone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: options?.signal,
  });
  return parseJson<SuiteNode>(response);
}

export async function versionSuite(
  suiteId: string,
  options?: QepClientRequestOptions,
): Promise<SuiteNode> {
  const response = await fetch(`${BASE}/${encodeURIComponent(suiteId)}/version`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: options?.signal,
  });
  return parseJson<SuiteNode>(response);
}

export async function moveSuite(
  suiteId: string,
  input: { readonly parentSuiteId?: string | null; readonly folderPath?: string },
  options?: QepClientRequestOptions,
): Promise<SuiteNode> {
  const response = await fetch(`${BASE}/${encodeURIComponent(suiteId)}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<SuiteNode>(response);
}

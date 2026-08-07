/**
 * Organisational Memory client — APZ-KNOWLEDGE-CAPABILITY-001.
 * Calls ONLY `/api/v1/knowledge/*` routes.
 */

import { KnowledgeApiError } from "./errors";

export type KnowledgeLifecycleStatus = "draft" | "review" | "approved" | "archived";

export type KnowledgeObjectKind =
  | "lesson"
  | "standard"
  | "procedure"
  | "best_practice"
  | "operational_guide"
  | "reference"
  | "decision_knowledge";

export type KnowledgeLibraryCategory =
  | "standards"
  | "procedures"
  | "best_practices"
  | "operational_guides"
  | "reference_material";

export type KnowledgeObject = {
  readonly id: string;
  readonly tenantId: string;
  readonly kind: KnowledgeObjectKind;
  readonly title: string;
  readonly summary: string;
  readonly body: Record<string, unknown>;
  readonly owner: string;
  readonly version: number;
  readonly status: KnowledgeLifecycleStatus;
  readonly tags: readonly string[];
  readonly relatedProducts: readonly string[];
  readonly relatedCapabilities: readonly string[];
  readonly libraryCategory?: KnowledgeLibraryCategory;
  readonly decisionRef?: string;
  readonly reviewDate?: string;
  readonly expiresAt?: string;
  readonly versionHistory: readonly {
    readonly version: number;
    readonly status: KnowledgeLifecycleStatus;
    readonly at: string;
    readonly note?: string;
    readonly actor?: string;
  }[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type KnowledgeQualityReport = {
  readonly totalObjects: number;
  readonly approvedCount: number;
  readonly draftCount: number;
  readonly reviewCount: number;
  readonly archivedCount: number;
  readonly staleCount: number;
  readonly duplicateGroups: number;
  readonly issues: readonly {
    readonly objectId: string;
    readonly title: string;
    readonly code: string;
    readonly message: string;
    readonly severity: "warning" | "error";
  }[];
  readonly computedAt: string;
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
    throw KnowledgeApiError.fromHttp({
      status: response.status,
      message: typeof error?.message === "string" ? error.message : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
    });
  }
  if (!("data" in record)) {
    throw KnowledgeApiError.fromHttp({
      status: 502,
      message: "Unexpected Knowledge response envelope.",
    });
  }
  return body as T;
}

type DataEnvelope<T> = { readonly data: T };

export async function listKnowledgeObjects(
  kind?: KnowledgeObjectKind,
  options?: Options,
) {
  const qs = kind ? `?kind=${encodeURIComponent(kind)}` : "";
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly KnowledgeObject[] }>
  >(`/knowledge/objects${qs}`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function getKnowledgeObject(objectId: string, options?: Options) {
  const envelope = await requestJson<DataEnvelope<KnowledgeObject>>(
    `/knowledge/objects/${encodeURIComponent(objectId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function createKnowledgeLesson(
  input: {
    readonly title: string;
    readonly summary: string;
    readonly context: string;
    readonly situation: string;
    readonly resolution: string;
    readonly recommendation: string;
    readonly owner: string;
    readonly relatedProducts?: readonly string[];
    readonly relatedCapabilities?: readonly string[];
    readonly tags?: readonly string[];
    readonly reviewDate?: string;
    readonly expiresAt?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<KnowledgeObject>>(
    "/knowledge/lessons",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function createKnowledgeLibraryItem(
  input: {
    readonly title: string;
    readonly summary: string;
    readonly content: string;
    readonly owner: string;
    readonly libraryCategory: KnowledgeLibraryCategory;
    readonly relatedProducts?: readonly string[];
    readonly relatedCapabilities?: readonly string[];
    readonly tags?: readonly string[];
    readonly reviewDate?: string;
    readonly expiresAt?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<KnowledgeObject>>(
    "/knowledge/library",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function createDecisionKnowledge(
  input: {
    readonly title: string;
    readonly summary: string;
    readonly rationale: string;
    readonly owner: string;
    readonly decisionRef: string;
    readonly relatedQuestionId?: string;
    readonly relatedProducts?: readonly string[];
    readonly tags?: readonly string[];
    readonly reviewDate?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<KnowledgeObject>>(
    "/knowledge/decision-knowledge",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateKnowledgeObject(
  objectId: string,
  input: {
    readonly title?: string;
    readonly summary?: string;
    readonly body?: Record<string, unknown>;
    readonly owner?: string;
    readonly tags?: readonly string[];
    readonly relatedProducts?: readonly string[];
    readonly relatedCapabilities?: readonly string[];
    readonly reviewDate?: string | null;
    readonly expiresAt?: string | null;
    readonly decisionRef?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<KnowledgeObject>>(
    `/knowledge/objects/${encodeURIComponent(objectId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function transitionKnowledgeLifecycle(
  objectId: string,
  input: { readonly status: KnowledgeLifecycleStatus; readonly note?: string },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<KnowledgeObject>>(
    `/knowledge/objects/${encodeURIComponent(objectId)}/lifecycle`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getKnowledgeQuality(options?: Options) {
  const envelope = await requestJson<DataEnvelope<KnowledgeQualityReport>>(
    "/knowledge/quality",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

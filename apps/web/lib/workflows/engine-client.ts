/**
 * Typed Workflow Engine HTTP client — calls ONLY `/api/v1/workflows/engine/*`.
 * Read-only. No platform-services or adapter imports.
 */

import { WorkflowEngineClientError } from "./engine-errors";
import type {
  WorkflowEngineCapabilitiesViewModel,
  WorkflowEngineClientRequestOptions,
  WorkflowEngineCollectionResult,
  WorkflowEngineCompatibilityViewModel,
  WorkflowEngineConnectionValidationViewModel,
  WorkflowEngineDiagnosticsViewModel,
  WorkflowEngineHealthViewModel,
  WorkflowEngineListQuery,
  WorkflowEngineProjectViewModel,
  WorkflowEngineTagViewModel,
  WorkflowEngineTemplateViewModel,
  WorkflowEngineUserViewModel,
  WorkflowEngineWorkflowViewModel,
} from "./engine-types";
import { assertWorkflowEngineApiPath, WORKFLOW_ENGINE_API_BASE } from "./routes";

const API_BASE = WORKFLOW_ENGINE_API_BASE;

type JsonRecord = Record<string, unknown>;
type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

function mapStringList(raw: unknown): readonly string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => String(item));
}

function mapWorkflow(raw: unknown): WorkflowEngineWorkflowViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    active: Boolean(r.active),
    createdAt: r.createdAt !== undefined ? String(r.createdAt) : undefined,
    updatedAt: r.updatedAt !== undefined ? String(r.updatedAt) : undefined,
    tagNames: mapStringList(r.tagNames),
    nodeCount: Number(r.nodeCount ?? 0),
    connectionCount: Number(r.connectionCount ?? 0),
    versionHint: r.versionHint !== undefined ? String(r.versionHint) : undefined,
    engine: String(r.engine ?? "workflow_engine"),
  };
}

function mapTemplate(raw: unknown): WorkflowEngineTemplateViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    description: r.description !== undefined ? String(r.description) : undefined,
    tagNames: mapStringList(r.tagNames),
    engine: String(r.engine ?? "workflow_engine"),
    support: String(r.support ?? "partial"),
  };
}

function mapTag(raw: unknown): WorkflowEngineTagViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    createdAt: r.createdAt !== undefined ? String(r.createdAt) : undefined,
    updatedAt: r.updatedAt !== undefined ? String(r.updatedAt) : undefined,
    engine: String(r.engine ?? "workflow_engine"),
  };
}

function mapUser(raw: unknown): WorkflowEngineUserViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    email: r.email !== undefined ? String(r.email) : undefined,
    displayName: r.displayName !== undefined ? String(r.displayName) : undefined,
    role: r.role !== undefined ? String(r.role) : undefined,
    engine: String(r.engine ?? "workflow_engine"),
  };
}

function mapProject(raw: unknown): WorkflowEngineProjectViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    type: r.type !== undefined ? String(r.type) : undefined,
    engine: String(r.engine ?? "workflow_engine"),
    support: r.support !== undefined ? String(r.support) : undefined,
  };
}

function mapCapabilities(raw: unknown): WorkflowEngineCapabilitiesViewModel {
  const r = asRecord(raw);
  const servicesRaw = Array.isArray(r.services) ? r.services : [];
  return {
    services: servicesRaw.map((service) => {
      const s = asRecord(service);
      return {
        serviceId: String(s.serviceId ?? ""),
        support: String(s.support ?? "partial"),
        implemented: Boolean(s.implemented),
        operations: mapStringList(s.operations),
        notes: Array.isArray(s.notes) ? mapStringList(s.notes) : undefined,
      };
    }),
    unsupportedOperations: mapStringList(r.unsupportedOperations),
  };
}

function mapHealth(raw: unknown): WorkflowEngineHealthViewModel {
  const r = asRecord(raw);
  return {
    level: String(r.level ?? "unknown"),
    reasons: mapStringList(r.reasons),
    sdkStatus: String(r.sdkStatus ?? "unavailable"),
  };
}

function mapDiagnostics(raw: unknown): WorkflowEngineDiagnosticsViewModel {
  const r = asRecord(raw);
  return {
    adapterVersion: String(r.adapterVersion ?? ""),
    healthLevel: String(r.healthLevel ?? "unknown"),
    reasons: mapStringList(r.reasons),
    apiStatus: String(r.apiStatus ?? "not_tested"),
    authenticationStatus: String(r.authenticationStatus ?? "unknown"),
    authMode: String(r.authMode ?? "unknown"),
    lastLatencyMs: r.lastLatencyMs !== undefined ? Number(r.lastLatencyMs) : undefined,
    coreServiceCount: Number(r.coreServiceCount ?? 0),
    compatibilityStatus: String(r.compatibilityStatus ?? "unknown"),
  };
}

function mapCompatibility(raw: unknown): WorkflowEngineCompatibilityViewModel {
  const r = asRecord(raw);
  return {
    compatibilityStatus: String(r.compatibilityStatus ?? "unknown"),
    supportedApi: String(r.supportedApi ?? ""),
    adapterVersion: String(r.adapterVersion ?? ""),
    unsupportedOperations: mapStringList(r.unsupportedOperations),
    notes: mapStringList(r.notes),
  };
}

function mapValidation(raw: unknown): WorkflowEngineConnectionValidationViewModel {
  const r = asRecord(raw);
  return {
    ok: Boolean(r.ok),
    message: String(r.message ?? ""),
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: WorkflowEngineClientRequestOptions,
): Promise<T> {
  assertWorkflowEngineApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...options?.headers,
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiSuccessEnvelope<T> | ApiCollectionEnvelope<unknown> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new WorkflowEngineClientError({
      message:
        err.error?.message ?? `Workflow engine request failed (${response.status})`,
      code: err.error?.code ?? "WORKFLOW_ENGINE_HTTP_ERROR",
      correlationId: err.meta?.correlationId,
      status: response.status,
    });
  }
  return payload as T;
}

export interface WorkflowEngineClient {
  listWorkflows(
    query?: WorkflowEngineListQuery,
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineCollectionResult<WorkflowEngineWorkflowViewModel>>;
  getWorkflow(
    workflowId: string,
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineWorkflowViewModel>;
  listTemplates(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineCollectionResult<WorkflowEngineTemplateViewModel>>;
  getTemplate(
    templateId: string,
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineTemplateViewModel>;
  listTags(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineCollectionResult<WorkflowEngineTagViewModel>>;
  listUsers(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineCollectionResult<WorkflowEngineUserViewModel>>;
  listProjects(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineCollectionResult<WorkflowEngineProjectViewModel>>;
  capabilities(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineCapabilitiesViewModel>;
  health(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineHealthViewModel>;
  diagnostics(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineDiagnosticsViewModel>;
  compatibility(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineCompatibilityViewModel>;
  validate(
    options?: WorkflowEngineClientRequestOptions,
  ): Promise<WorkflowEngineConnectionValidationViewModel>;
}

export function createHttpWorkflowEngineClient(): WorkflowEngineClient {
  return {
    async listWorkflows(query, options) {
      const params = new URLSearchParams();
      if (query?.limit) params.set("limit", String(query.limit));
      if (query?.cursor) params.set("cursor", query.cursor);
      const qs = params.toString();
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/workflows${qs ? `?${qs}` : ""}`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapWorkflow),
        page: {
          limit: envelope.page?.limit ?? (envelope.data ?? []).length,
          hasMore: Boolean(envelope.page?.hasMore),
        },
      };
    },
    async getWorkflow(workflowId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/workflows/${encodeURIComponent(workflowId)}`,
        { method: "GET" },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async listTemplates(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/templates`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapTemplate),
        page: {
          limit: envelope.page?.limit ?? (envelope.data ?? []).length,
          hasMore: Boolean(envelope.page?.hasMore),
        },
      };
    },
    async getTemplate(templateId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/templates/${encodeURIComponent(templateId)}`,
        { method: "GET" },
        options,
      );
      return mapTemplate(envelope.data);
    },
    async listTags(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/tags`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapTag),
        page: {
          limit: envelope.page?.limit ?? (envelope.data ?? []).length,
          hasMore: Boolean(envelope.page?.hasMore),
        },
      };
    },
    async listUsers(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/users`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapUser),
        page: {
          limit: envelope.page?.limit ?? (envelope.data ?? []).length,
          hasMore: Boolean(envelope.page?.hasMore),
        },
      };
    },
    async listProjects(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/projects`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapProject),
        page: {
          limit: envelope.page?.limit ?? (envelope.data ?? []).length,
          hasMore: Boolean(envelope.page?.hasMore),
        },
      };
    },
    async capabilities(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/capabilities`,
        { method: "GET" },
        options,
      );
      return mapCapabilities(envelope.data);
    },
    async health(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/health`,
        { method: "GET" },
        options,
      );
      return mapHealth(envelope.data);
    },
    async diagnostics(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/diagnostics`,
        { method: "GET" },
        options,
      );
      return mapDiagnostics(envelope.data);
    },
    async compatibility(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/compatibility`,
        { method: "GET" },
        options,
      );
      return mapCompatibility(envelope.data);
    },
    async validate(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/validate`,
        { method: "GET" },
        options,
      );
      return mapValidation(envelope.data);
    },
  };
}

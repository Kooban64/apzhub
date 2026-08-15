/**
 * Typed Platform Workflow HTTP client — calls ONLY `/api/v1/workflows/*`.
 * No execution / n8n / schedule methods. No platform-services imports.
 */

import { assertWorkflowApiPath, WORKFLOWS_API_BASE } from "./routes";
import { WorkflowClientError } from "./workflow-errors";
import type {
  CreateWorkflowCategoryClientInput,
  CreateWorkflowClientInput,
  CreateWorkflowFolderClientInput,
  CreateWorkflowTemplateClientInput,
  CreateWorkflowVersionClientInput,
  ListWorkflowsClientQuery,
  TransitionWorkflowClientInput,
  UpdateWorkflowClientInput,
  UpdateWorkflowTemplateClientInput,
  ValidateWorkflowClientInput,
  WorkflowAuditViewModel,
  WorkflowCategoryViewModel,
  WorkflowClientRequestOptions,
  WorkflowCollectionResult,
  WorkflowFolderViewModel,
  WorkflowManagementPlaneViewModel,
  WorkflowSummaryViewModel,
  WorkflowTemplateViewModel,
  WorkflowValidationViewModel,
  WorkflowDefinitionConnectionViewModel,
  WorkflowDefinitionGraphViewModel,
  WorkflowDefinitionNodeViewModel,
  WorkflowVersionViewModel,
  WorkflowViewModel,
} from "./workflow-types";

const API_BASE = WORKFLOWS_API_BASE;

function mapRecordList(
  raw: unknown,
): readonly Readonly<Record<string, unknown>>[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((item) => asRecord(item));
}

function mapGraph(raw: unknown): WorkflowDefinitionGraphViewModel | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const g = asRecord(raw);
  const nodesRaw = Array.isArray(g.nodes) ? g.nodes : [];
  const connectionsRaw = Array.isArray(g.connections) ? g.connections : [];
  const nodes: WorkflowDefinitionNodeViewModel[] = nodesRaw.map((node) => {
    const n = asRecord(node);
    return {
      id: String(n.id ?? ""),
      nodeKind: n.nodeKind !== undefined ? String(n.nodeKind) : undefined,
      kind: n.kind !== undefined ? String(n.kind) : undefined,
      label: n.label !== undefined ? String(n.label) : undefined,
      config: n.config && typeof n.config === "object" ? asRecord(n.config) : undefined,
    };
  });
  const connections: WorkflowDefinitionConnectionViewModel[] = connectionsRaw.map(
    (c) => {
      const row = asRecord(c);
      return {
        id: row.id !== undefined ? String(row.id) : undefined,
        sourceNodeId: String(row.sourceNodeId ?? ""),
        targetNodeId: String(row.targetNodeId ?? ""),
        label: row.label !== undefined ? String(row.label) : undefined,
      };
    },
  );
  return { nodes, connections };
}

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

export interface WorkflowClient {
  listWorkflows(
    query?: ListWorkflowsClientQuery,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCollectionResult<WorkflowSummaryViewModel>>;
  getWorkflow(
    workflowId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowViewModel>;
  createWorkflow(
    input: CreateWorkflowClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowViewModel>;
  updateWorkflow(
    workflowId: string,
    input: UpdateWorkflowClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowViewModel>;
  deleteWorkflow(
    workflowId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<{ readonly deleted: boolean; readonly workflowId: string }>;
  publishWorkflow(
    workflowId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowViewModel>;
  archiveWorkflow(
    workflowId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowViewModel>;
  restoreWorkflow(
    workflowId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowViewModel>;
  transitionWorkflow(
    workflowId: string,
    input: TransitionWorkflowClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowViewModel>;
  listVersions(
    workflowId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCollectionResult<WorkflowVersionViewModel>>;
  createVersion(
    workflowId: string,
    input: CreateWorkflowVersionClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowVersionViewModel>;
  getVersion(
    workflowId: string,
    versionId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowVersionViewModel>;
  listAudit(
    workflowId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCollectionResult<WorkflowAuditViewModel>>;
  listTemplates(
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCollectionResult<WorkflowTemplateViewModel>>;
  getTemplate(
    templateId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowTemplateViewModel>;
  createTemplate(
    input: CreateWorkflowTemplateClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowTemplateViewModel>;
  updateTemplate(
    templateId: string,
    input: UpdateWorkflowTemplateClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowTemplateViewModel>;
  deleteTemplate(
    templateId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<{ readonly deleted: boolean; readonly templateId: string }>;
  listCategories(
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCollectionResult<WorkflowCategoryViewModel>>;
  getCategory(
    categoryId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCategoryViewModel>;
  createCategory(
    input: CreateWorkflowCategoryClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCategoryViewModel>;
  listFolders(
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowCollectionResult<WorkflowFolderViewModel>>;
  getFolder(
    folderId: string,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowFolderViewModel>;
  createFolder(
    input: CreateWorkflowFolderClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowFolderViewModel>;
  validate(
    input: ValidateWorkflowClientInput,
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowValidationViewModel>;
  getCapabilities(
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowManagementPlaneViewModel>;
  getHealth(
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowManagementPlaneViewModel>;
  getReadiness(
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowManagementPlaneViewModel>;
  getDiagnostics(
    options?: WorkflowClientRequestOptions,
  ): Promise<WorkflowManagementPlaneViewModel>;
}

function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" ? (value as JsonRecord) : {};
}

function mapSummary(raw: unknown): WorkflowSummaryViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    lifecycle: String(r.lifecycle ?? ""),
    currentVersionId:
      r.currentVersionId !== undefined && r.currentVersionId !== null
        ? String(r.currentVersionId)
        : undefined,
    categoryId:
      r.categoryId !== undefined && r.categoryId !== null
        ? String(r.categoryId)
        : undefined,
    folderId:
      r.folderId !== undefined && r.folderId !== null ? String(r.folderId) : undefined,
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapWorkflow(raw: unknown): WorkflowViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: r.description !== undefined ? String(r.description) : undefined,
    lifecycle: String(r.lifecycle ?? ""),
    currentVersionId:
      r.currentVersionId !== undefined && r.currentVersionId !== null
        ? String(r.currentVersionId)
        : undefined,
    categoryId:
      r.categoryId !== undefined && r.categoryId !== null
        ? String(r.categoryId)
        : undefined,
    folderId:
      r.folderId !== undefined && r.folderId !== null ? String(r.folderId) : undefined,
    templateId:
      r.templateId !== undefined && r.templateId !== null
        ? String(r.templateId)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    archivedAt:
      r.archivedAt !== undefined && r.archivedAt !== null
        ? String(r.archivedAt)
        : undefined,
  };
}

function mapVersion(raw: unknown): WorkflowVersionViewModel {
  const r = asRecord(raw);
  const graph = mapGraph(r.graph);
  const topConnections = mapGraph({
    nodes: [],
    connections: r.connections,
  })?.connections;
  return {
    id: String(r.id ?? ""),
    workflowId: String(r.workflowId ?? ""),
    versionNumber: Number(r.versionNumber ?? 0),
    status: String(r.status ?? ""),
    lifecycle: String(r.lifecycle ?? ""),
    createdAt: String(r.createdAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    changeSummary: r.changeSummary !== undefined ? String(r.changeSummary) : undefined,
    graph,
    variables: mapRecordList(r.variables),
    parameters: mapRecordList(r.parameters),
    triggers: mapRecordList(r.triggers),
    actions: mapRecordList(r.actions),
    conditions: mapRecordList(r.conditions),
    connections: topConnections ?? graph?.connections,
  };
}

function mapTemplate(raw: unknown): WorkflowTemplateViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: r.description !== undefined ? String(r.description) : undefined,
    lifecycle: String(r.lifecycle ?? ""),
    categoryId:
      r.categoryId !== undefined && r.categoryId !== null
        ? String(r.categoryId)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    graph: mapGraph(r.graph),
    variables: mapRecordList(r.variables),
    parameters: mapRecordList(r.parameters),
  };
}

function mapCategory(raw: unknown): WorkflowCategoryViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    description: r.description !== undefined ? String(r.description) : undefined,
    parentCategoryId:
      r.parentCategoryId !== undefined && r.parentCategoryId !== null
        ? String(r.parentCategoryId)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapFolder(raw: unknown): WorkflowFolderViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    path: String(r.path ?? ""),
    parentFolderId:
      r.parentFolderId !== undefined && r.parentFolderId !== null
        ? String(r.parentFolderId)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapManagement(raw: unknown): WorkflowManagementPlaneViewModel {
  const r = asRecord(raw);
  const caps = asRecord(r.capabilities);
  return {
    workflowEnabled: Boolean(r.workflowEnabled),
    executionEnabled: false,
    engineConfigured: Boolean(r.engineConfigured),
    persistenceMode: String(r.persistenceMode ?? "unknown"),
    capabilities: {
      metadataCrud: Boolean(caps.metadataCrud ?? true),
      lifecycle: Boolean(caps.lifecycle ?? true),
      validation: Boolean(caps.validation ?? true),
      templates: Boolean(caps.templates ?? true),
      categories: Boolean(caps.categories ?? true),
      folders: Boolean(caps.folders ?? true),
      audit: Boolean(caps.audit ?? true),
      execution: false,
      schedules: false,
      n8n: Boolean(caps.n8n),
    },
    status: r.status !== undefined ? String(r.status) : undefined,
    healthy: r.healthy !== undefined ? Boolean(r.healthy) : undefined,
    ready: r.ready !== undefined ? Boolean(r.ready) : undefined,
    platformServicesVersion:
      r.platformServicesVersion !== undefined
        ? String(r.platformServicesVersion)
        : undefined,
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: WorkflowClientRequestOptions,
): Promise<T> {
  assertWorkflowApiPath(path.split("?")[0] ?? path);
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
    throw new WorkflowClientError({
      message: err.error?.message ?? `Workflow request failed (${response.status})`,
      code: err.error?.code ?? "WORKFLOW_HTTP_ERROR",
      correlationId: err.meta?.correlationId,
      status: response.status,
    });
  }
  return payload as T;
}

export function createHttpWorkflowClient(): WorkflowClient {
  return {
    async listWorkflows(query, options) {
      const params = new URLSearchParams();
      if (query?.query) params.set("query", query.query);
      if (query?.lifecycle) params.set("lifecycle", query.lifecycle);
      if (query?.categoryId) params.set("categoryId", query.categoryId);
      if (query?.folderId) params.set("folderId", query.folderId);
      if (query?.limit) params.set("limit", String(query.limit));
      const qs = params.toString();
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}${qs ? `?${qs}` : ""}`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapSummary),
        page: envelope.page,
      };
    },
    async getWorkflow(workflowId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}`,
        { method: "GET" },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async createWorkflow(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        API_BASE,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async updateWorkflow(workflowId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async deleteWorkflow(workflowId, options) {
      const envelope = await requestJson<
        ApiSuccessEnvelope<{ deleted: boolean; workflowId: string }>
      >(`${API_BASE}/${encodeURIComponent(workflowId)}`, { method: "DELETE" }, options);
      return {
        deleted: Boolean(envelope.data?.deleted),
        workflowId: String(envelope.data?.workflowId ?? workflowId),
      };
    },
    async publishWorkflow(workflowId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/publish`,
        { method: "POST" },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async archiveWorkflow(workflowId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/archive`,
        { method: "POST" },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async restoreWorkflow(workflowId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/restore`,
        { method: "POST" },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async transitionWorkflow(workflowId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/transition`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapWorkflow(envelope.data);
    },
    async listVersions(workflowId, options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/versions`,
        { method: "GET" },
        options,
      );
      return { items: (envelope.data ?? []).map(mapVersion), page: envelope.page };
    },
    async createVersion(workflowId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/versions`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapVersion(envelope.data);
    },
    async getVersion(workflowId, versionId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/versions/${encodeURIComponent(versionId)}`,
        { method: "GET" },
        options,
      );
      return mapVersion(envelope.data);
    },
    async listAudit(workflowId, options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(workflowId)}/audit`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map((row) => {
          const r = asRecord(row);
          return {
            id: String(r.id ?? ""),
            workflowId: String(r.workflowId ?? workflowId),
            action: String(r.action ?? ""),
            actorUserId: String(r.actorUserId ?? ""),
            createdAt: String(r.createdAt ?? ""),
          };
        }),
        page: envelope.page,
      };
    },
    async listTemplates(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/templates`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapTemplate),
        page: envelope.page,
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
    async createTemplate(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/templates`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapTemplate(envelope.data);
    },
    async updateTemplate(templateId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/templates/${encodeURIComponent(templateId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      );
      return mapTemplate(envelope.data);
    },
    async deleteTemplate(templateId, options) {
      const envelope = await requestJson<
        ApiSuccessEnvelope<{ deleted: boolean; templateId: string }>
      >(
        `${API_BASE}/templates/${encodeURIComponent(templateId)}`,
        { method: "DELETE" },
        options,
      );
      return {
        deleted: Boolean(envelope.data?.deleted),
        templateId: String(envelope.data?.templateId ?? templateId),
      };
    },
    async listCategories(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/categories`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapCategory),
        page: envelope.page,
      };
    },
    async getCategory(categoryId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/categories/${encodeURIComponent(categoryId)}`,
        { method: "GET" },
        options,
      );
      return mapCategory(envelope.data);
    },
    async createCategory(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/categories`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapCategory(envelope.data);
    },
    async listFolders(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/folders`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapFolder),
        page: envelope.page,
      };
    },
    async getFolder(folderId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/folders/${encodeURIComponent(folderId)}`,
        { method: "GET" },
        options,
      );
      return mapFolder(envelope.data);
    },
    async createFolder(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/folders`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapFolder(envelope.data);
    },
    async validate(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/validation`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      const r = asRecord(envelope.data);
      const issues = Array.isArray(r.issues) ? r.issues : [];
      return {
        valid: Boolean(r.valid),
        issues: issues.map((row) => {
          const issue = asRecord(row);
          return {
            code: String(issue.code ?? ""),
            message: String(issue.message ?? ""),
            path: issue.path !== undefined ? String(issue.path) : undefined,
            severity: String(issue.severity ?? "error"),
          };
        }),
      };
    },
    async getCapabilities(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/capabilities`,
        { method: "GET" },
        options,
      );
      return mapManagement(envelope.data);
    },
    async getHealth(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/health`,
        { method: "GET" },
        options,
      );
      return mapManagement(envelope.data);
    },
    async getReadiness(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/readiness`,
        { method: "GET" },
        options,
      );
      return mapManagement(envelope.data);
    },
    async getDiagnostics(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/diagnostics`,
        { method: "GET" },
        options,
      );
      return mapManagement(envelope.data);
    },
  };
}

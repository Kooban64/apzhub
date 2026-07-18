/**
 * In-memory Platform Workflow client for tests (APZWORKFLOW-003).
 */

import type { WorkflowClient } from "./workflow-client";
import type {
  WorkflowManagementPlaneViewModel,
  WorkflowSummaryViewModel,
  WorkflowTemplateViewModel,
  WorkflowVersionViewModel,
  WorkflowViewModel,
} from "./workflow-types";

const EMPTY_GRAPH = { nodes: [], connections: [] };

export const MOCK_WORKFLOW: WorkflowViewModel = {
  id: "wf_mock_1",
  key: "mock-onboarding",
  name: "Mock Onboarding",
  description: "Read-only mock workflow for client tests",
  lifecycle: "draft",
  currentVersionId: "wfv_mock_1",
  categoryId: "wfc_mock_1",
  folderId: "wff_mock_1",
  templateId: "wft_mock_1",
  createdAt: "2026-07-15T10:00:00.000Z",
  updatedAt: "2026-07-15T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
};

const MOCK_GRAPH = {
  nodes: [
    {
      id: "node_trigger",
      nodeKind: "trigger",
      kind: "manual",
      label: "Manual start",
      config: { enabled: true },
    },
    {
      id: "node_action",
      nodeKind: "action",
      kind: "notify",
      label: "Send notice",
      config: { channel: "in-app" },
    },
  ],
  connections: [
    {
      id: "conn_1",
      sourceNodeId: "node_trigger",
      targetNodeId: "node_action",
      label: "then",
    },
  ],
} as const;

export const MOCK_WORKFLOW_VERSION: WorkflowVersionViewModel = {
  id: "wfv_mock_1",
  workflowId: MOCK_WORKFLOW.id,
  versionNumber: 1,
  status: "draft",
  lifecycle: "draft",
  createdAt: "2026-07-15T10:00:00.000Z",
  createdBy: "user_1",
  changeSummary: "Initial draft",
  graph: MOCK_GRAPH,
  variables: [{ id: "var_1", key: "assignee", valueType: "string" }],
  parameters: [{ id: "param_1", key: "priority", valueType: "string" }],
  triggers: [{ id: "trig_1", kind: "manual", label: "Manual start" }],
  actions: [{ id: "act_1", kind: "notify", label: "Send notice" }],
  conditions: [],
  connections: MOCK_GRAPH.connections,
};

export const MOCK_WORKFLOW_VERSION_V2: WorkflowVersionViewModel = {
  id: "wfv_mock_2",
  workflowId: MOCK_WORKFLOW.id,
  versionNumber: 2,
  status: "draft",
  lifecycle: "draft",
  createdAt: "2026-07-15T11:00:00.000Z",
  createdBy: "user_1",
  changeSummary: "Added condition",
  graph: {
    nodes: [
      ...MOCK_GRAPH.nodes,
      {
        id: "node_condition",
        nodeKind: "condition",
        kind: "equals",
        label: "Priority high?",
        config: { field: "priority", equals: "high" },
      },
    ],
    connections: [
      ...MOCK_GRAPH.connections,
      {
        id: "conn_2",
        sourceNodeId: "node_action",
        targetNodeId: "node_condition",
        label: "check",
      },
    ],
  },
  variables: [
    { id: "var_1", key: "assignee", valueType: "string" },
    { id: "var_2", key: "dueDays", valueType: "number" },
  ],
  parameters: [{ id: "param_1", key: "priority", valueType: "string" }],
  triggers: [{ id: "trig_1", kind: "manual", label: "Manual start" }],
  actions: [{ id: "act_1", kind: "notify", label: "Send notice" }],
  conditions: [{ id: "cond_1", kind: "equals", label: "Priority high?" }],
  connections: [
    ...MOCK_GRAPH.connections,
    {
      id: "conn_2",
      sourceNodeId: "node_action",
      targetNodeId: "node_condition",
      label: "check",
    },
  ],
};

export const MOCK_WORKFLOW_TEMPLATE: WorkflowTemplateViewModel = {
  id: "wft_mock_1",
  key: "mock-template",
  name: "Mock Template",
  description: "Onboarding template",
  lifecycle: "draft",
  createdAt: "2026-07-15T10:00:00.000Z",
  updatedAt: "2026-07-15T10:00:00.000Z",
  graph: MOCK_GRAPH,
  variables: [{ id: "var_1", key: "assignee", valueType: "string" }],
  parameters: [{ id: "param_1", key: "priority", valueType: "string" }],
};

const MOCK_MANAGEMENT: WorkflowManagementPlaneViewModel = {
  workflowEnabled: true,
  executionEnabled: false,
  engineConfigured: false,
  persistenceMode: "memory",
  capabilities: {
    metadataCrud: true,
    lifecycle: true,
    validation: true,
    templates: true,
    categories: true,
    folders: true,
    audit: true,
    execution: false,
    schedules: false,
    n8n: false,
  },
};

export function createMockWorkflowClient(
  seed: readonly WorkflowViewModel[] = [MOCK_WORKFLOW],
): WorkflowClient {
  const workflows = new Map(seed.map((w) => [w.id, { ...w }]));
  const versions = new Map<string, WorkflowVersionViewModel[]>([
    [MOCK_WORKFLOW.id, [{ ...MOCK_WORKFLOW_VERSION }, { ...MOCK_WORKFLOW_VERSION_V2 }]],
  ]);
  const templates = new Map([
    [MOCK_WORKFLOW_TEMPLATE.id, { ...MOCK_WORKFLOW_TEMPLATE }],
  ]);
  let seq = 2;

  return {
    async listWorkflows(query) {
      let items: WorkflowSummaryViewModel[] = [...workflows.values()].map((w) => ({
        id: w.id,
        key: w.key,
        name: w.name,
        lifecycle: w.lifecycle,
        currentVersionId: w.currentVersionId,
        categoryId: w.categoryId,
        folderId: w.folderId,
        updatedAt: w.updatedAt,
      }));
      if (query?.query) {
        const q = query.query.toLowerCase();
        items = items.filter(
          (row) =>
            row.name.toLowerCase().includes(q) || row.key.toLowerCase().includes(q),
        );
      }
      if (query?.lifecycle) {
        items = items.filter((row) => row.lifecycle === query.lifecycle);
      }
      return { items, page: { limit: items.length, hasMore: false } };
    },
    async getWorkflow(workflowId) {
      const found = workflows.get(workflowId);
      if (!found) throw new Error(`Workflow not found: ${workflowId}`);
      return { ...found };
    },
    async createWorkflow(input) {
      const id = `wf_mock_${++seq}`;
      const created: WorkflowViewModel = {
        id,
        key: input.key,
        name: input.name,
        description: input.description,
        lifecycle: "draft",
        categoryId: input.categoryId,
        folderId: input.folderId,
        templateId: input.templateId,
        createdAt: "2026-07-15T12:00:00.000Z",
        updatedAt: "2026-07-15T12:00:00.000Z",
        createdBy: "user_1",
        updatedBy: "user_1",
      };
      workflows.set(id, created);
      versions.set(id, []);
      return created;
    },
    async updateWorkflow(workflowId, input) {
      const existing = await this.getWorkflow(workflowId);
      const updated = {
        ...existing,
        ...input,
        categoryId:
          input.categoryId === undefined
            ? existing.categoryId
            : (input.categoryId ?? undefined),
        folderId:
          input.folderId === undefined
            ? existing.folderId
            : (input.folderId ?? undefined),
        updatedAt: "2026-07-15T13:00:00.000Z",
      };
      workflows.set(workflowId, updated);
      return updated;
    },
    async deleteWorkflow(workflowId) {
      workflows.delete(workflowId);
      return { deleted: true, workflowId };
    },
    async publishWorkflow(workflowId) {
      const existing = await this.getWorkflow(workflowId);
      const updated = { ...existing, lifecycle: "active" };
      workflows.set(workflowId, updated);
      return updated;
    },
    async archiveWorkflow(workflowId) {
      const existing = await this.getWorkflow(workflowId);
      const updated = {
        ...existing,
        lifecycle: "archived",
        archivedAt: "2026-07-15T14:00:00.000Z",
      };
      workflows.set(workflowId, updated);
      return updated;
    },
    async restoreWorkflow(workflowId) {
      const existing = await this.getWorkflow(workflowId);
      const updated = {
        ...existing,
        lifecycle: "restored",
        archivedAt: undefined,
      };
      workflows.set(workflowId, updated);
      return updated;
    },
    async transitionWorkflow(workflowId, input) {
      const existing = await this.getWorkflow(workflowId);
      const updated = { ...existing, lifecycle: input.to };
      workflows.set(workflowId, updated);
      return updated;
    },
    async listVersions(workflowId) {
      const items = versions.get(workflowId) ?? [];
      return { items: [...items], page: { limit: items.length, hasMore: false } };
    },
    async createVersion(workflowId, input) {
      const created: WorkflowVersionViewModel = {
        id: `wfv_mock_${++seq}`,
        workflowId,
        versionNumber: (versions.get(workflowId)?.length ?? 0) + 1,
        status: "draft",
        lifecycle: "draft",
        createdAt: "2026-07-15T15:00:00.000Z",
        createdBy: "user_1",
        changeSummary: input.changeSummary,
        graph: {
          nodes: input.graph.nodes.map((n, i) => ({
            id: String(n.id ?? `node_${i}`),
            nodeKind: n.nodeKind !== undefined ? String(n.nodeKind) : undefined,
            kind: n.kind !== undefined ? String(n.kind) : undefined,
            label: n.label !== undefined ? String(n.label) : undefined,
            config:
              n.config && typeof n.config === "object"
                ? (n.config as Record<string, unknown>)
                : undefined,
          })),
          connections: input.graph.connections.map((c, i) => ({
            id: String(c.id ?? `conn_${i}`),
            sourceNodeId: String(c.sourceNodeId ?? ""),
            targetNodeId: String(c.targetNodeId ?? ""),
            label: c.label !== undefined ? String(c.label) : undefined,
          })),
        },
        variables: input.variables,
        parameters: input.parameters,
        triggers: input.triggers,
        actions: input.actions,
        conditions: input.conditions,
        connections: input.connections?.map((c, i) => ({
          id: String(c.id ?? `conn_${i}`),
          sourceNodeId: String(c.sourceNodeId ?? ""),
          targetNodeId: String(c.targetNodeId ?? ""),
          label: c.label !== undefined ? String(c.label) : undefined,
        })),
      };
      const list = versions.get(workflowId) ?? [];
      versions.set(workflowId, [...list, created]);
      return created;
    },
    async getVersion(workflowId, versionId) {
      const found = (versions.get(workflowId) ?? []).find((v) => v.id === versionId);
      if (!found) throw new Error(`Version not found: ${versionId}`);
      return { ...found };
    },
    async listAudit(workflowId) {
      return {
        items: [
          {
            id: "wfa_mock_1",
            workflowId,
            action: "workflow.created",
            actorUserId: "user_1",
            createdAt: "2026-07-15T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async listTemplates() {
      const items = [...templates.values()];
      return { items, page: { limit: items.length, hasMore: false } };
    },
    async getTemplate(templateId) {
      const found = templates.get(templateId);
      if (!found) throw new Error(`Template not found: ${templateId}`);
      return { ...found };
    },
    async createTemplate(input) {
      void input.graph;
      const id = `wft_mock_${++seq}`;
      const created: WorkflowTemplateViewModel = {
        id,
        key: input.key,
        name: input.name,
        description: input.description,
        lifecycle: "draft",
        categoryId: input.categoryId,
        createdAt: "2026-07-15T16:00:00.000Z",
        updatedAt: "2026-07-15T16:00:00.000Z",
      };
      templates.set(id, created);
      return created;
    },
    async updateTemplate(templateId, input) {
      const existing = await this.getTemplate(templateId);
      const updated: WorkflowTemplateViewModel = {
        ...existing,
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        categoryId:
          input.categoryId === undefined
            ? existing.categoryId
            : (input.categoryId ?? undefined),
        graph: input.graph
          ? {
              nodes: input.graph.nodes.map((node, index) => ({
                id: String(node.id ?? `node_${index}`),
                nodeKind: String(node.nodeKind ?? "action"),
                kind: String(node.kind ?? "unknown"),
                label: node.label !== undefined ? String(node.label) : undefined,
              })),
              connections: input.graph.connections.map((conn, index) => ({
                id: String(conn.id ?? `conn_${index}`),
                sourceNodeId: String(conn.sourceNodeId ?? conn.fromNodeId ?? ""),
                targetNodeId: String(conn.targetNodeId ?? conn.toNodeId ?? ""),
                label: conn.label !== undefined ? String(conn.label) : undefined,
              })),
            }
          : existing.graph,
        variables: input.variables ?? existing.variables,
        parameters: input.parameters ?? existing.parameters,
        updatedAt: "2026-07-15T17:00:00.000Z",
      };
      templates.set(templateId, updated);
      return updated;
    },
    async deleteTemplate(templateId) {
      templates.delete(templateId);
      return { deleted: true, templateId };
    },
    async listCategories() {
      return {
        items: [
          {
            id: "wfc_mock_1",
            name: "General",
            createdAt: "2026-07-15T10:00:00.000Z",
            updatedAt: "2026-07-15T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getCategory(categoryId) {
      return {
        id: categoryId,
        name: "General",
        createdAt: "2026-07-15T10:00:00.000Z",
        updatedAt: "2026-07-15T10:00:00.000Z",
      };
    },
    async createCategory(input) {
      return {
        id: `wfc_mock_${++seq}`,
        name: input.name,
        description: input.description,
        parentCategoryId: input.parentCategoryId,
        createdAt: "2026-07-15T18:00:00.000Z",
        updatedAt: "2026-07-15T18:00:00.000Z",
      };
    },
    async listFolders() {
      return {
        items: [
          {
            id: "wff_mock_1",
            name: "Root",
            path: "/",
            createdAt: "2026-07-15T10:00:00.000Z",
            updatedAt: "2026-07-15T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getFolder(folderId) {
      return {
        id: folderId,
        name: "Root",
        path: "/",
        createdAt: "2026-07-15T10:00:00.000Z",
        updatedAt: "2026-07-15T10:00:00.000Z",
      };
    },
    async createFolder(input) {
      return {
        id: `wff_mock_${++seq}`,
        name: input.name,
        path: input.path,
        parentFolderId: input.parentFolderId,
        createdAt: "2026-07-15T19:00:00.000Z",
        updatedAt: "2026-07-15T19:00:00.000Z",
      };
    },
    async validate() {
      void EMPTY_GRAPH;
      return {
        valid: false,
        issues: [
          {
            code: "STRUCTURE_EMPTY_CONDITION",
            message: "Condition branch has no outbound connection.",
            path: "graph.conditions",
            severity: "warning",
          },
          {
            code: "REFERENCES_MISSING_TEMPLATE",
            message: "Referenced template is missing from catalogue.",
            path: "templateId",
            severity: "error",
          },
          {
            code: "VARIABLES_UNUSED",
            message: "Variable assignee is declared but unused.",
            path: "variables.assignee",
            severity: "warning",
          },
          {
            code: "PARAMETERS_TYPE",
            message: "Parameter priority expects string.",
            path: "parameters.priority",
            severity: "info",
          },
          {
            code: "LIFECYCLE_DRAFT_PUBLISH",
            message: "Draft workflow cannot be published without validation.",
            path: "lifecycle",
            severity: "error",
          },
          {
            code: "SECURITY_SECRET_PARAM",
            message: "Parameter name suggests a secret; store refs only.",
            path: "parameters",
            severity: "warning",
          },
          {
            code: "COMPATIBILITY_ENGINE_NEUTRAL",
            message: "Definition remains engine-neutral.",
            path: "graph",
            severity: "info",
          },
        ],
      };
    },
    async getCapabilities() {
      return { ...MOCK_MANAGEMENT };
    },
    async getHealth() {
      return { ...MOCK_MANAGEMENT, status: "ok", healthy: true };
    },
    async getReadiness() {
      return { ...MOCK_MANAGEMENT, ready: true, status: "ready" };
    },
    async getDiagnostics() {
      return {
        ...MOCK_MANAGEMENT,
        platformServicesVersion: "test",
      };
    },
  };
}

/**
 * In-memory Workflow Engine client for tests (APZWORKFLOW-008).
 * Metadata only — never includes secrets or execution payloads.
 */

import type { WorkflowEngineClient } from "./engine-client";
import type {
  WorkflowEngineCapabilitiesViewModel,
  WorkflowEngineCompatibilityViewModel,
  WorkflowEngineDiagnosticsViewModel,
  WorkflowEngineHealthViewModel,
  WorkflowEngineProjectViewModel,
  WorkflowEngineTagViewModel,
  WorkflowEngineTemplateViewModel,
  WorkflowEngineUserViewModel,
  WorkflowEngineWorkflowViewModel,
} from "./engine-types";

export const MOCK_ENGINE_WORKFLOW: WorkflowEngineWorkflowViewModel = {
  id: "1",
  name: "Onboarding Notify",
  active: false,
  createdAt: "2026-07-15T10:00:00.000Z",
  updatedAt: "2026-07-15T11:00:00.000Z",
  tagNames: ["ops"],
  nodeCount: 2,
  connectionCount: 1,
  versionHint: "v1",
  engine: "workflow_engine",
};

export const MOCK_ENGINE_TEMPLATE: WorkflowEngineTemplateViewModel = {
  id: "1",
  name: "Onboarding Notify",
  tagNames: ["ops"],
  engine: "workflow_engine",
  support: "partial",
};

export const MOCK_ENGINE_TAG: WorkflowEngineTagViewModel = {
  id: "t1",
  name: "ops",
  createdAt: "2026-07-15T09:00:00.000Z",
  updatedAt: "2026-07-15T09:00:00.000Z",
  engine: "workflow_engine",
};

export const MOCK_ENGINE_USER: WorkflowEngineUserViewModel = {
  id: "u1",
  email: "ops@example.test",
  displayName: "Ops User",
  role: "owner",
  engine: "workflow_engine",
};

export const MOCK_ENGINE_PROJECT: WorkflowEngineProjectViewModel = {
  id: "p1",
  name: "Default",
  type: "personal",
  engine: "workflow_engine",
  support: "partial",
};

export const MOCK_ENGINE_CAPABILITIES: WorkflowEngineCapabilitiesViewModel = {
  services: [
    {
      serviceId: "workflows",
      support: "supported",
      implemented: true,
      operations: ["list", "get", "validate", "metadata"],
    },
  ],
  unsupportedOperations: ["create", "update", "delete", "execute", "schedule"],
};

export const MOCK_ENGINE_HEALTH: WorkflowEngineHealthViewModel = {
  level: "healthy",
  reasons: [],
  sdkStatus: "healthy",
};

export const MOCK_ENGINE_DIAGNOSTICS: WorkflowEngineDiagnosticsViewModel = {
  adapterVersion: "0.1.0",
  healthLevel: "healthy",
  reasons: [],
  apiStatus: "reachable",
  authenticationStatus: "valid",
  authMode: "api_key",
  lastLatencyMs: 12,
  coreServiceCount: 10,
  compatibilityStatus: "compatible",
};

export const MOCK_ENGINE_COMPATIBILITY: WorkflowEngineCompatibilityViewModel = {
  compatibilityStatus: "compatible",
  supportedApi: "v1",
  adapterVersion: "0.1.0",
  unsupportedOperations: [...MOCK_ENGINE_CAPABILITIES.unsupportedOperations],
  notes: ["Read-only metadata adapter"],
};

export function createMockWorkflowEngineClient(
  overrides?: Partial<WorkflowEngineClient>,
): WorkflowEngineClient {
  const base: WorkflowEngineClient = {
    async listWorkflows() {
      return { items: [MOCK_ENGINE_WORKFLOW], page: { limit: 1, hasMore: false } };
    },
    async getWorkflow(workflowId) {
      if (workflowId !== MOCK_ENGINE_WORKFLOW.id) {
        throw Object.assign(new Error("not found"), { status: 404 });
      }
      return MOCK_ENGINE_WORKFLOW;
    },
    async listTemplates() {
      return { items: [MOCK_ENGINE_TEMPLATE], page: { limit: 1, hasMore: false } };
    },
    async getTemplate(templateId) {
      if (templateId !== MOCK_ENGINE_TEMPLATE.id) {
        throw Object.assign(new Error("not found"), { status: 404 });
      }
      return MOCK_ENGINE_TEMPLATE;
    },
    async listTags() {
      return { items: [MOCK_ENGINE_TAG], page: { limit: 1, hasMore: false } };
    },
    async listUsers() {
      return { items: [MOCK_ENGINE_USER], page: { limit: 1, hasMore: false } };
    },
    async listProjects() {
      return { items: [MOCK_ENGINE_PROJECT], page: { limit: 1, hasMore: false } };
    },
    async capabilities() {
      return MOCK_ENGINE_CAPABILITIES;
    },
    async health() {
      return MOCK_ENGINE_HEALTH;
    },
    async diagnostics() {
      return MOCK_ENGINE_DIAGNOSTICS;
    },
    async compatibility() {
      return MOCK_ENGINE_COMPATIBILITY;
    },
    async validate() {
      return { ok: true, message: "Connection validated" };
    },
  };
  return { ...base, ...overrides };
}

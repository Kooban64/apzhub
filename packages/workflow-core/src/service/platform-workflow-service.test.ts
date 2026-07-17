import { describe, expect, it } from "vitest";

import {
  asWorkflowConnectionId,
  type Workflow,
  type WorkflowAuditEntry,
  type WorkflowGraphSnapshot,
  type WorkflowRequestContext,
  type WorkflowVersion,
} from "@apzhub/workflow-contracts";

import { createPlatformWorkflowService } from "./create-platform-workflow-service";
import {
  WorkflowDomainError,
  type WorkflowFoundationRepos,
} from "../ports/repository-ports";

function ctx(
  overrides?: Partial<WorkflowRequestContext>,
): WorkflowRequestContext {
  return {
    tenantId: "tenant_core",
    userId: "user_core",
    organisationId: "org_core",
    correlationId: "corr_core",
    ...overrides,
  };
}

function graph(): WorkflowGraphSnapshot {
  return {
    nodes: [
      {
        id: "t1",
        nodeKind: "trigger",
        kind: "manual",
        config: { enabled: true },
      },
      {
        id: "a1",
        nodeKind: "action",
        kind: "task",
        config: { retries: 0 },
      },
    ],
    connections: [
      {
        id: asWorkflowConnectionId("conn_1"),
        sourceNodeId: "t1",
        targetNodeId: "a1",
      },
    ],
  };
}

function memoryRepos(): WorkflowFoundationRepos {
  const workflows = new Map<string, Workflow>();
  const versions = new Map<string, WorkflowVersion>();
  const audits: WorkflowAuditEntry[] = [];
  return {
    workflows: {
      create: async (_ctx, row) => {
        workflows.set(row.id, row);
        return row;
      },
      get: async (c, id) => {
        const row = workflows.get(id) ?? null;
        return row && row.tenantId === c.tenantId ? row : null;
      },
      update: async (_ctx, row) => {
        workflows.set(row.id, row);
        return row;
      },
      delete: async (c, id) => {
        const row = workflows.get(id);
        if (row?.tenantId === c.tenantId) workflows.delete(id);
      },
      list: async (c) =>
        [...workflows.values()].filter((row) => row.tenantId === c.tenantId),
    },
    versions: {
      create: async (_ctx, row) => {
        versions.set(row.id, row);
        return row;
      },
      get: async (c, id) => {
        const row = versions.get(id) ?? null;
        return row && row.tenantId === c.tenantId ? row : null;
      },
      listByWorkflow: async (c, workflowId) =>
        [...versions.values()].filter(
          (row) => row.tenantId === c.tenantId && row.workflowId === workflowId,
        ),
    },
    templates: {
      create: async (_ctx, row) => row,
      get: async () => null,
      update: async (_ctx, row) => row,
      delete: async () => undefined,
      list: async () => [],
    },
    categories: {
      create: async (_ctx, row) => row,
      get: async () => null,
      list: async () => [],
    },
    folders: {
      create: async (_ctx, row) => row,
      get: async () => null,
      list: async () => [],
    },
    audits: {
      append: async (_ctx, row) => {
        audits.push(row);
        return row;
      },
      listByWorkflow: async (c, workflowId) =>
        audits.filter(
          (row) => row.tenantId === c.tenantId && row.workflowId === workflowId,
        ),
    },
  };
}

describe("createPlatformWorkflowService", () => {
  it("requires explicit repos", () => {
    expect(() =>
      createPlatformWorkflowService({
        repos: undefined as never,
        now: () => "t",
        id: () => "x",
      }),
    ).toThrow(WorkflowDomainError);
  });

  it("creates, versions, publishes, and audits workflows", async () => {
    let seq = 0;
    const service = createPlatformWorkflowService({
      repos: memoryRepos(),
      now: () => "2026-07-15T12:00:00.000Z",
      id: () => `core_${++seq}`,
    });
    const request = ctx();

    const created = await service.createWorkflow(request, {
      key: "core-flow",
      name: "Core Flow",
    });
    expect(created.lifecycle).toBe("draft");

    await expect(
      service.createWorkflow(request, { key: "core-flow", name: "Dup" }),
    ).rejects.toThrow(/already exists/);

    const version = await service.createVersion(request, {
      workflowId: created.id,
      graph: graph(),
    });
    expect(version.versionNumber).toBe(1);

    const published = await service.publishWorkflow(request, created.id);
    expect(published.lifecycle).toBe("active");

    const audits = await service.listAudit(request, created.id);
    expect(audits.some((row) => row.action === "workflow.created")).toBe(true);
    expect(audits.some((row) => row.action === "workflow.active")).toBe(true);

    const found = await service.findWorkflows(request, { query: "Core" });
    expect(found).toHaveLength(1);

    await service.deleteWorkflow(request, created.id);
    await expect(service.getWorkflow(request, created.id)).rejects.toThrow(
      /not found/,
    );
  });
});

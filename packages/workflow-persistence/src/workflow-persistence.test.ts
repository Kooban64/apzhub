import { describe, expect, it } from "vitest";

import {
  asWorkflowAuditId,
  asWorkflowCategoryId,
  asWorkflowConnectionId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowTemplateId,
  asWorkflowVersionId,
  type Workflow,
  type WorkflowAuditEntry,
  type WorkflowCategory,
  type WorkflowFolder,
  type WorkflowRequestContext,
  type WorkflowTemplate,
  type WorkflowVersion,
} from "@apzhub/workflow-contracts";
import { createWorkflowFoundation } from "@apzhub/workflow-core";

import {
  createEmptyWorkflowInMemoryStores,
  createInMemoryWorkflowRepositories,
  createProductionWorkflowPersistence,
  createWorkflowPersistence,
  WORKFLOW_PERSISTENCE_VERSION,
} from "./index";

const ctx: WorkflowRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_1",
};

const otherCtx: WorkflowRequestContext = {
  tenantId: "tenant_b",
  userId: "user_2",
};

function sampleWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  const now = "2026-07-15T10:00:00.000Z";
  return {
    id: asWorkflowId("wf_1"),
    tenantId: "tenant_a",
    key: "onboard",
    name: "Onboard",
    description: "demo",
    lifecycle: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: "user_1",
    updatedBy: "user_1",
    ...overrides,
  };
}

describe("workflow-persistence", () => {
  it("exports version 0.1.1", () => {
    expect(WORKFLOW_PERSISTENCE_VERSION).toBe("0.1.1");
  });

  it("requires explicit postgres for production helper", () => {
    expect(() =>
      createProductionWorkflowPersistence({} as never),
    ).toThrow(/explicit postgres/);
    expect(() =>
      createWorkflowPersistence({ mode: "postgres" }),
    ).toThrow(/requires db/);
    expect(() =>
      createWorkflowPersistence({ mode: "nope" as never }),
    ).toThrow(/Unsupported/);
  });

  it("persists workflow metadata in memory with tenant isolation", async () => {
    const stores = createEmptyWorkflowInMemoryStores();
    const repos = createWorkflowPersistence({ mode: "memory", stores });
    const foundation = createWorkflowFoundation({ repos });

    const workflow = sampleWorkflow();
    await repos.workflows.create(ctx, workflow);
    expect(await repos.workflows.get(ctx, workflow.id)).toEqual(workflow);
    expect(await repos.workflows.get(otherCtx, workflow.id)).toBeNull();

    const updated = {
      ...workflow,
      name: "Updated",
      lifecycle: "active" as const,
      updatedAt: "2026-07-15T11:00:00.000Z",
    };
    await repos.workflows.update(ctx, updated);
    expect((await repos.workflows.get(ctx, workflow.id))?.name).toBe("Updated");
    expect(foundation.canTransition("draft", "active")).toBe(true);

    const version: WorkflowVersion = {
      id: asWorkflowVersionId("ver_1"),
      workflowId: workflow.id,
      tenantId: "tenant_a",
      versionNumber: 1,
      status: "draft",
      lifecycle: "draft",
      graph: {
        nodes: [
          {
            id: "n1",
            nodeKind: "trigger",
            kind: "manual",
            config: {},
          },
        ],
        connections: [],
      },
      variables: [],
      parameters: [],
      triggers: [],
      actions: [],
      conditions: [],
      connections: [
        {
          id: asWorkflowConnectionId("conn_unused"),
          sourceNodeId: "n1",
          targetNodeId: "n1",
        },
      ],
      createdAt: workflow.createdAt,
      createdBy: "user_1",
    };
    await repos.versions.create(ctx, version);
    expect(await repos.versions.get(ctx, version.id)).toEqual(version);
    expect(await repos.versions.listByWorkflow(ctx, workflow.id)).toHaveLength(
      1,
    );

    const category: WorkflowCategory = {
      id: asWorkflowCategoryId("cat_1"),
      tenantId: "tenant_a",
      name: "General",
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
    await repos.categories.create(ctx, category);
    expect(await repos.categories.get(ctx, category.id)).toEqual(category);
    expect(await repos.categories.list(ctx)).toHaveLength(1);

    const folder: WorkflowFolder = {
      id: asWorkflowFolderId("fold_1"),
      tenantId: "tenant_a",
      name: "Root",
      path: "/",
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
    await repos.folders.create(ctx, folder);
    expect(await repos.folders.get(ctx, folder.id)).toEqual(folder);

    const template: WorkflowTemplate = {
      id: asWorkflowTemplateId("tpl_1"),
      tenantId: "tenant_a",
      key: "tpl",
      name: "Template",
      lifecycle: "draft",
      graph: { nodes: [], connections: [] },
      parameters: [],
      variables: [],
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      createdBy: "user_1",
      updatedBy: "user_1",
    };
    await repos.templates.create(ctx, template);
    expect(await repos.templates.get(ctx, template.id)).toEqual(template);
    const tplUpdated = { ...template, name: "Template 2" };
    await repos.templates.update(ctx, tplUpdated);
    expect((await repos.templates.get(ctx, template.id))?.name).toBe(
      "Template 2",
    );
    expect(await repos.templates.list(ctx)).toHaveLength(1);

    const audit: WorkflowAuditEntry = {
      id: asWorkflowAuditId("aud_1"),
      tenantId: "tenant_a",
      workflowId: workflow.id,
      action: "created",
      actorUserId: "user_1",
      createdAt: workflow.createdAt,
    };
    await repos.audits.append(ctx, audit);
    expect(await repos.audits.listByWorkflow(ctx, workflow.id)).toHaveLength(1);

    await repos.templates.delete(ctx, template.id);
    expect(await repos.templates.get(ctx, template.id)).toBeNull();

    await repos.workflows.delete(ctx, workflow.id);
    expect(await repos.workflows.get(ctx, workflow.id)).toBeNull();
    expect(await repos.workflows.list(ctx)).toHaveLength(0);

    await expect(
      repos.workflows.create(ctx, sampleWorkflow({ tenantId: "other" })),
    ).rejects.toThrow(/tenant_mismatch/);
  });

  it("createInMemoryWorkflowRepositories mirrors factory memory mode", async () => {
    const stores = createEmptyWorkflowInMemoryStores();
    const repos = createInMemoryWorkflowRepositories(stores);
    expect(await repos.workflows.list(ctx)).toEqual([]);
  });

  it("creates postgres mode via createWorkflowPersistence when db provided", async () => {
    const insert = { values: async () => undefined };
    const db = {
      insert: () => insert,
      update: () => ({ set: () => ({ where: async () => undefined }) }),
      delete: () => ({ where: async () => undefined }),
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
            then: (r: (v: unknown) => unknown) => Promise.resolve([]).then(r),
          }),
          orderBy: async () => [],
        }),
      }),
    };
    const repos = createWorkflowPersistence({
      mode: "postgres",
      db: db as never,
    });
    expect(await repos.workflows.get(ctx, asWorkflowId("missing_x"))).toBeNull();
  });

  it("covers tenant isolation on delete and cross-tenant template/folder", async () => {
    const stores = createEmptyWorkflowInMemoryStores();
    const repos = createWorkflowPersistence({ mode: "memory", stores });
    const workflow = sampleWorkflow();
    await repos.workflows.create(ctx, workflow);
    await repos.workflows.delete(otherCtx, workflow.id);
    expect(await repos.workflows.get(ctx, workflow.id)).toEqual(workflow);

    const template: WorkflowTemplate = {
      id: asWorkflowTemplateId("tpl_iso"),
      tenantId: "tenant_a",
      key: "iso",
      name: "Iso",
      lifecycle: "draft",
      graph: { nodes: [], connections: [] },
      parameters: [],
      variables: [],
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      createdBy: "user_1",
      updatedBy: "user_1",
    };
    await repos.templates.create(ctx, template);
    expect(await repos.templates.get(otherCtx, template.id)).toBeNull();
    await repos.templates.delete(otherCtx, template.id);
    expect(await repos.templates.get(ctx, template.id)).toEqual(template);

    await expect(
      repos.versions.create(ctx, {
        id: asWorkflowVersionId("ver_bad"),
        workflowId: workflow.id,
        tenantId: "other",
        versionNumber: 9,
        status: "draft",
        lifecycle: "draft",
        graph: { nodes: [], connections: [] },
        variables: [],
        parameters: [],
        triggers: [],
        actions: [],
        conditions: [],
        connections: [],
        createdAt: workflow.createdAt,
        createdBy: "user_1",
      }),
    ).rejects.toThrow(/tenant_mismatch/);
  });
});

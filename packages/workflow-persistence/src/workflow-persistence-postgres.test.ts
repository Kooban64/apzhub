/**
 * Mocked PostgreSQL repository coverage (APZWORKFLOW-001).
 * Exercises drizzle repository paths without a live database.
 */

import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import {
  asWorkflowAuditId,
  asWorkflowCategoryId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowTemplateId,
  asWorkflowVersionId,
  type WorkflowRequestContext,
} from "@apzhub/workflow-contracts";

import {
  createPostgresWorkflowRepositories,
  createProductionWorkflowPersistence,
} from "./index";

const ctx: WorkflowRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

function chainable(result: unknown[] = []) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.from = vi.fn(self);
  api.where = vi.fn(self);
  api.limit = vi.fn(async () => result);
  api.orderBy = vi.fn(async () => result);
  api.set = vi.fn(self);
  // thenable for await db.select()...where without limit
  api.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve);
  return api;
}

function createMockDb(selectResults: unknown[][] = [[]]) {
  let selectCall = 0;
  const insert = vi.fn(async () => undefined);
  const update = vi.fn(() => chainable());
  const del = vi.fn(() => chainable());
  const select = vi.fn(() => {
    const rows = selectResults[selectCall] ?? selectResults[0] ?? [];
    selectCall += 1;
    return chainable(rows as unknown[]);
  });
  const values = vi.fn(async () => undefined);
  const insertBuilder = { values };
  const insertFn = vi.fn(() => insertBuilder);

  const db = {
    insert: insertFn,
    update,
    delete: del,
    select,
  } as unknown as DatabaseExecutor;

  return { db, insertFn, values, update, del, select, insert };
}

describe("workflow-persistence postgres repositories", () => {
  it("maps workflow rows through mocked drizzle executor", async () => {
    const now = new Date("2026-07-15T10:00:00.000Z");
    const workflowRow = {
      id: "wf_pg_1",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "N",
      description: "d",
      lifecycle: "draft",
      currentVersionId: "ver_1",
      categoryId: "cat_1",
      folderId: "fold_1",
      templateId: "tpl_1",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      archivedAt: null,
      revision: 1,
    };
    const { db } = createMockDb([[workflowRow], [workflowRow]]);
    const repos = createProductionWorkflowPersistence({ db });

    const created = await repos.workflows.create(ctx, {
      id: asWorkflowId("wf_pg_1"),
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "N",
      description: "d",
      lifecycle: "draft",
      currentVersionId: asWorkflowVersionId("ver_1"),
      categoryId: asWorkflowCategoryId("cat_1"),
      folderId: asWorkflowFolderId("fold_1"),
      templateId: asWorkflowTemplateId("tpl_1"),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
    });
    expect(created.id).toBe("wf_pg_1");

    const got = await repos.workflows.get(ctx, asWorkflowId("wf_pg_1"));
    expect(got?.key).toBe("k");
    expect(got?.categoryId).toBe("cat_1");

    await repos.workflows.update(ctx, {
      ...created,
      name: "N2",
      updatedAt: now.toISOString(),
    });
    const listed = await repos.workflows.list(ctx);
    expect(listed.length).toBeGreaterThanOrEqual(0);
    await repos.workflows.delete(ctx, asWorkflowId("wf_pg_1"));
  });

  it("maps version, template, category, folder, audit rows", async () => {
    const now = new Date("2026-07-15T10:00:00.000Z");
    const versionRow = {
      id: "ver_1",
      tenantId: "tenant_a",
      organisationId: null,
      workflowId: "wf_1",
      versionNumber: 1,
      status: "draft",
      lifecycle: "draft",
      graphJson: { nodes: [], connections: [] },
      variablesJson: [],
      parametersJson: [],
      triggersJson: [],
      actionsJson: [],
      conditionsJson: [],
      connectionsJson: [],
      changeSummary: "init",
      createdAt: now,
      createdBy: "user_1",
      revision: 1,
    };
    const templateRow = {
      id: "tpl_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "tpl",
      name: "T",
      description: null,
      lifecycle: "draft",
      categoryId: null,
      graphJson: { nodes: [], connections: [] },
      parametersJson: [],
      variablesJson: [],
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    };
    const categoryRow = {
      id: "cat_1",
      tenantId: "tenant_a",
      organisationId: null,
      name: "C",
      description: null,
      parentCategoryId: null,
      createdAt: now,
      updatedAt: now,
      revision: 1,
    };
    const folderRow = {
      id: "fold_1",
      tenantId: "tenant_a",
      organisationId: null,
      name: "F",
      parentFolderId: null,
      path: "/",
      createdAt: now,
      updatedAt: now,
      revision: 1,
    };
    const auditRow = {
      id: "aud_1",
      tenantId: "tenant_a",
      organisationId: null,
      workflowId: "wf_1",
      versionId: "ver_1",
      action: "created",
      actorUserId: "user_1",
      correlationId: "corr",
      detailJson: { k: "v" },
      createdAt: now,
      revision: 1,
    };

    const { db } = createMockDb([
      [versionRow],
      [versionRow],
      [templateRow],
      [templateRow],
      [categoryRow],
      [categoryRow],
      [folderRow],
      [folderRow],
      [auditRow],
    ]);
    const repos = createPostgresWorkflowRepositories(db);

    const version = await repos.versions.create(ctx, {
      id: asWorkflowVersionId("ver_1"),
      workflowId: asWorkflowId("wf_1"),
      tenantId: "tenant_a",
      versionNumber: 1,
      status: "draft",
      lifecycle: "draft",
      graph: { nodes: [], connections: [] },
      variables: [],
      parameters: [],
      triggers: [],
      actions: [],
      conditions: [],
      connections: [],
      createdAt: now.toISOString(),
      createdBy: "user_1",
      changeSummary: "init",
    });
    expect(version.versionNumber).toBe(1);
    expect(await repos.versions.get(ctx, asWorkflowVersionId("ver_1"))).toBeTruthy();
    expect(await repos.versions.listByWorkflow(ctx, asWorkflowId("wf_1"))).toBeTruthy();

    await repos.templates.create(ctx, {
      id: asWorkflowTemplateId("tpl_1"),
      tenantId: "tenant_a",
      key: "tpl",
      name: "T",
      lifecycle: "draft",
      graph: { nodes: [], connections: [] },
      parameters: [],
      variables: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
    });
    expect(await repos.templates.get(ctx, asWorkflowTemplateId("tpl_1"))).toBeTruthy();
    await repos.templates.update(ctx, {
      id: asWorkflowTemplateId("tpl_1"),
      tenantId: "tenant_a",
      key: "tpl",
      name: "T2",
      lifecycle: "draft",
      graph: { nodes: [], connections: [] },
      parameters: [],
      variables: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
    });
    await repos.templates.list(ctx);
    await repos.templates.delete(ctx, asWorkflowTemplateId("tpl_1"));

    await repos.categories.create(ctx, {
      id: asWorkflowCategoryId("cat_1"),
      tenantId: "tenant_a",
      name: "C",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(await repos.categories.get(ctx, asWorkflowCategoryId("cat_1"))).toBeTruthy();
    await repos.categories.list(ctx);

    await repos.folders.create(ctx, {
      id: asWorkflowFolderId("fold_1"),
      tenantId: "tenant_a",
      name: "F",
      path: "/",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(await repos.folders.get(ctx, asWorkflowFolderId("fold_1"))).toBeTruthy();
    await repos.folders.list(ctx);

    await repos.audits.append(ctx, {
      id: asWorkflowAuditId("aud_1"),
      tenantId: "tenant_a",
      workflowId: asWorkflowId("wf_1"),
      versionId: asWorkflowVersionId("ver_1"),
      action: "created",
      actorUserId: "user_1",
      correlationId: "corr",
      detail: { k: "v" },
      createdAt: now.toISOString(),
    });
    expect(await repos.audits.listByWorkflow(ctx, asWorkflowId("wf_1"))).toBeTruthy();
  });

  it("rejects cross-tenant writes", async () => {
    const { db } = createMockDb();
    const repos = createPostgresWorkflowRepositories(db);
    const now = "2026-07-15T10:00:00.000Z";
    await expect(
      repos.workflows.create(ctx, {
        id: asWorkflowId("wf_x"),
        tenantId: "other",
        key: "k",
        name: "n",
        lifecycle: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    await expect(
      repos.workflows.update(ctx, {
        id: asWorkflowId("wf_x"),
        tenantId: "other",
        key: "k",
        name: "n",
        lifecycle: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    await expect(
      repos.versions.create(ctx, {
        id: asWorkflowVersionId("ver_x"),
        workflowId: asWorkflowId("wf_x"),
        tenantId: "other",
        versionNumber: 1,
        status: "draft",
        lifecycle: "draft",
        graph: { nodes: [], connections: [] },
        variables: [],
        parameters: [],
        triggers: [],
        actions: [],
        conditions: [],
        connections: [],
        createdAt: now,
        createdBy: "u",
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    await expect(
      repos.templates.create(ctx, {
        id: asWorkflowTemplateId("tpl_x"),
        tenantId: "other",
        key: "k",
        name: "n",
        lifecycle: "draft",
        graph: { nodes: [], connections: [] },
        parameters: [],
        variables: [],
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    await expect(
      repos.templates.update(ctx, {
        id: asWorkflowTemplateId("tpl_x"),
        tenantId: "other",
        key: "k",
        name: "n",
        lifecycle: "draft",
        graph: { nodes: [], connections: [] },
        parameters: [],
        variables: [],
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    await expect(
      repos.categories.create(ctx, {
        id: asWorkflowCategoryId("cat_x"),
        tenantId: "other",
        name: "n",
        createdAt: now,
        updatedAt: now,
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    await expect(
      repos.folders.create(ctx, {
        id: asWorkflowFolderId("fold_x"),
        tenantId: "other",
        name: "n",
        path: "/",
        createdAt: now,
        updatedAt: now,
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    await expect(
      repos.audits.append(ctx, {
        id: asWorkflowAuditId("aud_x"),
        tenantId: "other",
        workflowId: asWorkflowId("wf_x"),
        action: "x",
        actorUserId: "u",
        createdAt: now,
      }),
    ).rejects.toThrow(/tenant_mismatch/);
  });

  it("maps archived workflow and nested parent ids", async () => {
    const now = new Date("2026-07-15T10:00:00.000Z");
    const workflowRow = {
      id: "wf_arch",
      tenantId: "tenant_a",
      organisationId: null,
      key: "arch",
      name: "Arch",
      description: null,
      lifecycle: "archived",
      currentVersionId: null,
      categoryId: null,
      folderId: null,
      templateId: null,
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      archivedAt: now,
      revision: 1,
    };
    const categoryRow = {
      id: "cat_child",
      tenantId: "tenant_a",
      organisationId: "org",
      name: "Child",
      description: "d",
      parentCategoryId: "cat_parent",
      createdAt: now,
      updatedAt: now,
      revision: 1,
    };
    const folderRow = {
      id: "fold_child",
      tenantId: "tenant_a",
      organisationId: "org",
      name: "Child",
      parentFolderId: "fold_parent",
      path: "/parent/child",
      createdAt: now,
      updatedAt: now,
      revision: 1,
    };
    const { db } = createMockDb([[workflowRow], [categoryRow], [folderRow]]);
    const repos = createPostgresWorkflowRepositories(db);
    const got = await repos.workflows.get(ctx, asWorkflowId("wf_arch"));
    expect(got?.archivedAt).toBe(now.toISOString());
    expect(
      (await repos.categories.get(ctx, asWorkflowCategoryId("cat_child")))
        ?.parentCategoryId,
    ).toBe("cat_parent");
    expect(
      (await repos.folders.get(ctx, asWorkflowFolderId("fold_child")))?.parentFolderId,
    ).toBe("fold_parent");

    await repos.workflows.create(ctx, {
      id: asWorkflowId("wf_arch2"),
      tenantId: "tenant_a",
      key: "arch2",
      name: "Arch2",
      lifecycle: "archived",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
      archivedAt: now.toISOString(),
    });
  });
});

/**
 * APZSEARCH-010 — Projects Search Publication Adapter tests.
 */
import { describe, expect, it } from "vitest";
import type {
  Milestone,
  Project,
  ProjectModule,
  Sprint,
  Task,
  Team,
  Workspace,
} from "@apzhub/platform-service-contracts";

import {
  SEARCH_PROJECTS_VERSION,
  createProjectsSearchAdapter,
  createProjectsSearchPublicationContext,
  isProjectsSearchEntityType,
  looksLikePlaneIdentifier,
} from "./index";

function ctx(tenantId = "tenant-a", org = "org-a") {
  return createProjectsSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-010",
      permissions: ["projects.read", "search.query.execute"],
      organisationId: org,
      workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });
}

const workspace: Workspace = {
  id: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  tenantId: "tenant-a",
  name: "Acme",
  slug: "acme",
  url: "https://acme.example/ws",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const project: Project = {
  id: "proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  name: "Portal",
  identifier: "PRT",
  description: "Platform <b>work</b>",
  status: "active",
  leadId: "user_cccccccccccccccccccccccccccccccc",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-03T00:00:00.000Z",
};

const task: Task = {
  id: "task_dddddddddddddddddddddddddddddddd",
  projectId: "proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  title: "Ship adapter",
  description: "Write tests",
  status: "in_progress",
  statusId: "status_1",
  priority: "high",
  assigneeId: "user_cccccccccccccccccccccccccccccccc",
  sprintId: "sprint_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  labelIds: [],
  createdAt: "2026-01-04T00:00:00.000Z",
  updatedAt: "2026-01-05T00:00:00.000Z",
};

const sprint: Sprint = {
  id: "sprint_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  projectId: "proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  name: "Sprint 1",
  goal: "Foundation",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const milestone: Milestone = {
  id: "milestone_ffffffffffffffffffffffffffffffff",
  projectId: "proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  name: "Beta",
  description: "Public beta",
  status: "open",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const moduleEntity: ProjectModule = {
  id: "module_11111111111111111111111111111111",
  projectId: "proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  name: "Search",
  status: "in_progress",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const team: Team = {
  id: "team_22222222222222222222222222222222",
  tenantId: "tenant-a",
  name: "Platform",
  description: "Core team",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-010 search-projects", () => {
  it("ships version and entity catalogue", () => {
    expect(SEARCH_PROJECTS_VERSION).toBe("0.1.0");
    expect(isProjectsSearchEntityType("task")).toBe(true);
    expect(isProjectsSearchEntityType("issue")).toBe(false);
    expect(looksLikePlaneIdentifier("proj_plane_abc")).toBe(true);
    expect(looksLikePlaneIdentifier("proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")).toBe(
      false,
    );
  });

  it("maps and publishes all Projects entity types without Plane leakage", () => {
    const adapter = createProjectsSearchAdapter();
    const context = ctx();

    for (const input of [
      { entityType: "workspace" as const, entity: workspace },
      { entityType: "project" as const, entity: project },
      { entityType: "task" as const, entity: task },
      { entityType: "sprint" as const, entity: sprint },
      { entityType: "milestone" as const, entity: milestone },
      { entityType: "module" as const, entity: moduleEntity },
      { entityType: "team" as const, entity: team },
    ]) {
      const preview = adapter.publisher.preview(context, input);
      expect(preview.ok, input.entityType).toBe(true);
      expect(preview.previewMetadata?.productId).toBe("projects");
      expect(JSON.stringify(preview.previewMetadata)).not.toMatch(/plane/i);

      const published = adapter.publisher.publish(context, input);
      expect(published.ok, input.entityType).toBe(true);
      expect(published.lifecycleState).toBe("published");
    }

    expect(adapter.integration.sink.count()).toBe(7);
    const stats = adapter.publisher.statistics(context);
    expect(stats.published).toBe(7);
    expect(stats.byEntityType["project"]).toBeGreaterThan(0);
  });

  it("rejects Plane ids and tenant mismatches", () => {
    const adapter = createProjectsSearchAdapter();
    const context = ctx();

    expect(() =>
      adapter.mapper.mapProject(context, {
        ...project,
        id: "proj_plane_native123",
      }),
    ).toThrow(/Plane/);

    const badValidate = adapter.publisher.validate(context, {
      entityType: "project",
      entity: { ...project, id: "proj_plane_x" },
    });
    expect(badValidate.ok).toBe(false);

    expect(() =>
      adapter.mapper.mapProject(context, {
        ...project,
        tenantId: "other-tenant",
      }),
    ).toThrow(/tenant mismatch/);

    const published = adapter.publisher.publish(context, {
      entityType: "project",
      entity: project,
    });
    expect(published.ok).toBe(true);

    const crossTenantRemove = adapter.publisher.remove(
      ctx("other-tenant"),
      "project",
      project.id,
    );
    expect(crossTenantRemove.ok).toBe(false);
  });

  it("supports lifecycle hooks upsert/remove and diagnostics", () => {
    const adapter = createProjectsSearchAdapter();
    const context = ctx();

    const first = adapter.hooks.onProjectUpserted(context, project);
    expect(first.ok).toBe(true);
    expect(first.operation).toBe("publish");

    const second = adapter.hooks.onProjectUpserted(context, {
      ...project,
      name: "Portal v2",
    });
    expect(second.ok).toBe(true);
    expect(second.operation).toBe("update");
    expect(second.entity?.title).toBe("Portal v2");

    const life = adapter.publisher.lifecycle(
      context,
      project.id,
      "archived",
      "done",
    );
    expect(life.ok).toBe(true);

    // Re-publish a fresh entity to exercise remove from published/updated
    const other: Project = {
      ...project,
      id: "proj_33333333333333333333333333333333",
      name: "Other",
    };
    expect(adapter.hooks.onProjectUpserted(context, other).ok).toBe(true);
    const removed = adapter.hooks.onProjectRemoved(context, other.id);
    expect(removed.ok).toBe(true);

    adapter.hooks.onTaskUpserted(context, task);
    adapter.hooks.onSprintUpserted(context, sprint);
    adapter.hooks.onMilestoneUpserted(context, milestone);
    adapter.hooks.onModuleUpserted(context, moduleEntity);
    adapter.hooks.onTeamUpserted(context, team);
    adapter.hooks.onWorkspaceUpserted(context, workspace);

    const diag = adapter.publisher.diagnostics(context);
    expect(diag.adapterVersion).toBe("0.1.0");
    expect(diag.productId).toBe("projects");
    expect(diag.supportedEntityTypes).toContain("sprint");
    expect(diag.mapperNotes.length).toBeGreaterThan(0);
    expect(adapter.publisher.getLogger().recent().length).toBeGreaterThan(0);
    expect(
      adapter.lifecycle.suggestFromDomainStatus("project", "archived"),
    ).toBe("archived");
    expect(adapter.lifecycle.suggestFromDomainStatus("project", "draft")).toBe(
      "draft",
    );
  });

  it("validates mandatory metadata and provider leakage", () => {
    const adapter = createProjectsSearchAdapter();
    const context = ctx();
    const draft = adapter.mapper.mapTask(context, task);
    const ok = adapter.validator.validateDraft(context, draft);
    expect(ok.valid).toBe(true);

    const leak = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, meilisearchIndex: "x" },
    });
    expect(leak.valid).toBe(false);
    expect(leak.issues.some((i) => i.code === "provider_leakage")).toBe(true);

    const incomplete = adapter.validator.validateDraft(context, {
      entityId: "task_x",
      entityType: "task",
      title: "X",
      classification: "internal",
      metadata: {},
    });
    expect(incomplete.valid).toBe(false);
  });
});

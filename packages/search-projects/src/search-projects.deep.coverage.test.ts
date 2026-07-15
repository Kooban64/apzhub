/**
 * APZSEARCH-010 deep coverage — validator / publisher / hooks branches.
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
  ProjectsSearchPublisher,
  createProjectsSearchAdapter,
  createProjectsSearchPublicationContext,
} from "./index";

function ctx(overrides?: { permissions?: readonly string[] }) {
  return createProjectsSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-deep",
      permissions: overrides?.permissions ?? ["projects.read"],
      organisationId: "org-a",
    },
  });
}

const project: Project = {
  id: "proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  name: "Portal",
  identifier: "PRT",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-010 deep coverage", () => {
  it("exercises validator edge codes", () => {
    const adapter = createProjectsSearchAdapter();
    const context = ctx();

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "",
        entityType: "project",
        title: "",
        classification: undefined,
        metadata: {
          status: "active",
          identifier: "X",
          workspaceId: "ws_plane_bad",
          meiliUid: "x",
        },
      }).issues.map((i) => i.code),
    ).toEqual(
      expect.arrayContaining([
        "required",
        "plane_id_forbidden",
        "provider_leakage",
      ]),
    );

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "task_plane_x",
        entityType: "unknown",
        title: "T",
        classification: "internal",
        metadata: {},
      }).issues.some((i) => i.code === "unsupported"),
    ).toBe(true);

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "ok",
        entityType: "project",
        title: "T",
        classification: "internal",
        metadata: { status: "", identifier: "I", workspaceId: "ws_ok" },
      }).valid,
    ).toBe(false);
  });

  it("covers remaining hooks removes and publisher catch paths", () => {
    const adapter = createProjectsSearchAdapter();
    const context = ctx();

    // Force validator codes for empty tenant / null permissions
    expect(
      adapter.validator.validateDraft(
        {
          ...context,
          tenantId: "",
          permissions: null as unknown as readonly string[],
        },
        {
          entityId: "x",
          entityType: "team",
          title: "T",
          classification: "internal",
          metadata: {},
        },
      ).issues.map((i) => i.field),
    ).toEqual(expect.arrayContaining(["tenantId", "permissions"]));

    const ws: Workspace = {
      id: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      tenantId: "tenant-a",
      name: "Acme",
      slug: "acme",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const task: Task = {
      id: "task_dddddddddddddddddddddddddddddddd",
      projectId: project.id,
      title: "T",
      status: "open",
      statusId: "s",
      priority: "medium",
      labelIds: [],
      milestoneId: "milestone_ffffffffffffffffffffffffffffffff",
      projectModuleId: "module_11111111111111111111111111111111",
      dueDate: "2026-03-01",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const sprint: Sprint = {
      id: "sprint_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      projectId: project.id,
      name: "S1",
      status: "planned",
      startDate: "2026-01-01",
      endDate: "2026-01-14",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const milestone: Milestone = {
      id: "milestone_ffffffffffffffffffffffffffffffff",
      projectId: project.id,
      name: "M1",
      status: "open",
      targetDate: "2026-04-01",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const moduleEntity: ProjectModule = {
      id: "module_11111111111111111111111111111111",
      projectId: project.id,
      name: "Mod",
      status: "planned",
      startDate: "2026-01-01",
      targetDate: "2026-02-01",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const team: Team = {
      id: "team_22222222222222222222222222222222",
      tenantId: "tenant-a",
      name: "Team",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    expect(adapter.hooks.onWorkspaceUpserted(context, ws).ok).toBe(true);
    expect(adapter.hooks.onTaskUpserted(context, task).ok).toBe(true);
    expect(adapter.hooks.onSprintUpserted(context, sprint).ok).toBe(true);
    expect(adapter.hooks.onMilestoneUpserted(context, milestone).ok).toBe(true);
    expect(adapter.hooks.onModuleUpserted(context, moduleEntity).ok).toBe(true);
    expect(adapter.hooks.onTeamUpserted(context, team).ok).toBe(true);
    expect(adapter.hooks.onProjectUpserted(context, project).ok).toBe(true);

    expect(adapter.hooks.onWorkspaceRemoved(context, ws.id).ok).toBe(true);
    expect(adapter.hooks.onTaskRemoved(context, task.id).ok).toBe(true);
    expect(adapter.hooks.onSprintRemoved(context, sprint.id).ok).toBe(true);
    expect(adapter.hooks.onMilestoneRemoved(context, milestone.id).ok).toBe(
      true,
    );
    expect(adapter.hooks.onModuleRemoved(context, moduleEntity.id).ok).toBe(
      true,
    );
    expect(adapter.hooks.onTeamRemoved(context, team.id).ok).toBe(true);
    expect(adapter.hooks.onProjectRemoved(context, project.id).ok).toBe(true);

    // publish after remove should succeed again
    expect(adapter.hooks.onProjectUpserted(context, project).ok).toBe(true);

    // update failure path — missing entity
    const missingUpdate = adapter.publisher.update(context, {
      entityType: "project",
      entity: { ...project, id: "proj_99999999999999999999999999999999" },
    });
    expect(missingUpdate.ok).toBe(false);

    // remove missing
    expect(
      adapter.publisher.remove(
        context,
        "project",
        "proj_00000000000000000000000000000000",
      ).ok,
    ).toBe(false);

    // validate with tenant mismatch via mapper catch
    const mismatch = adapter.publisher.validate(context, {
      entityType: "project",
      entity: { ...project, tenantId: "other" },
    });
    expect(mismatch.ok).toBe(false);

    // preview reject
    expect(
      adapter.publisher.preview(context, {
        entityType: "task",
        entity: { ...task, id: "task_plane_x" },
      }).ok,
    ).toBe(false);

    // lifecycle missing
    expect(
      adapter.publisher.lifecycle(
        context,
        "proj_00000000000000000000000000000000",
        "archived",
      ).ok,
    ).toBe(false);

    expect(adapter.publisher.getIntegrationPublisher()).toBeDefined();
    expect(adapter.metrics.snapshot().removed).toBeGreaterThan(0);

    // Catch paths when integration publisher throws
    const throwing = {
      publish: () => {
        throw new Error("boom publish");
      },
      update: () => {
        throw new Error("boom update");
      },
      preview: () => {
        throw new Error("boom preview");
      },
      remove: () => {
        throw new Error("boom remove");
      },
      lifecycle: () => {
        throw new Error("boom lifecycle");
      },
      validate: () => {
        throw new Error("boom validate");
      },
      getSink: () => adapter.integration.sink,
    } as never;

    const broken = createProjectsSearchAdapter({
      integrationPublisher: throwing,
      integration: adapter.integration,
    });
    const publisherThrow = new ProjectsSearchPublisher({
      integrationPublisher: throwing,
      mapper: adapter.mapper,
      validator: {
        validateDraft: () => ({
          valid: false,
          issues: [
            { field: "title", code: "required", message: "forced" },
          ],
        }),
      } as never,
    });
    expect(
      publisherThrow.publish(context, { entityType: "project", entity: project })
        .ok,
    ).toBe(false);

    const publisherOkMap = new ProjectsSearchPublisher({
      integrationPublisher: throwing,
    });
    expect(
      publisherOkMap.publish(context, { entityType: "project", entity: project })
        .ok,
    ).toBe(false);
    expect(
      publisherOkMap.remove(context, "project", project.id).ok,
    ).toBe(false);
    expect(
      publisherOkMap.lifecycle(context, project.id, "archived").ok,
    ).toBe(false);

    void broken;
    expect(adapter.lifecycle.suggestFromDomainStatus("project", "active")).toBe(
      "validated",
    );
  });
});

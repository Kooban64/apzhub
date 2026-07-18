/**
 * APZSEARCH-010 residual coverage.
 */
import { describe, expect, it } from "vitest";
import type { Project, Task } from "@apzhub/platform-service-contracts";

import {
  ProjectsSearchErrorTranslator,
  ProjectsSearchLifecycle,
  assertPlatformEntityId,
  createProjectsSearchAdapter,
  createProjectsSearchPublicationContext,
  toSearchIntegrationContext,
} from "./index";

function ctx() {
  return createProjectsSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-cov",
      permissions: ["projects.read"],
      organisationId: "org-a",
      requestId: "req-1",
      locale: "en",
    },
  });
}

describe("APZSEARCH-010 residual coverage", () => {
  it("covers context helpers, assert ids, lifecycle suggest, errors", () => {
    const context = ctx();
    expect(toSearchIntegrationContext(context).productId).toBe("projects");
    expect(() => assertPlatformEntityId("")).toThrow(/required/);
    expect(() => assertPlatformEntityId("a::b")).toThrow(/Plane/);

    const life = new ProjectsSearchLifecycle();
    expect(life.suggestFromDomainStatus("task", "cancelled")).toBe("archived");
    expect(life.suggestFromDomainStatus("sprint", "planned")).toBe("draft");
    expect(life.suggestFromDomainStatus("project", "completed")).toBe("archived");
    expect(life.suggestFromDomainStatus("module", undefined)).toBe("validated");
    expect(life.canTransition("published", "removed")).toBe(true);
    expect(() => life.assertTransition("archived", "published")).toThrow();

    const errors = new ProjectsSearchErrorTranslator();
    expect(
      errors.translate(new Error("Plane identifiers forbidden")).classification,
    ).toBe("validation_failed");
    expect(errors.translate(new Error("tenant mismatch")).classification).toBe(
      "tenant_mismatch",
    );
    expect(errors.translate(new Error("boom")).message).toContain("boom");
  });

  it("covers archived classification, invalid url host, and validate path", () => {
    const adapter = createProjectsSearchAdapter();
    const context = ctx();
    const archived: Project = {
      id: "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      tenantId: "tenant-a",
      workspaceId: "ws_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      name: "Old",
      identifier: "OLD",
      status: "archived",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    const draft = adapter.mapper.mapProject(context, archived);
    expect(draft.classification).toBe("restricted");

    const wsDraft = adapter.mapper.mapWorkspace(context, {
      id: "ws_cccccccccccccccccccccccccccccccc",
      tenantId: "tenant-a",
      name: "W",
      slug: "w",
      url: "not-a-url",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(wsDraft.metadata?.["urlHost"]).toBe("invalid-url");

    const archivedTask: Task = {
      id: "task_dddddddddddddddddddddddddddddddd",
      projectId: "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      title: "Old task",
      status: "done",
      statusId: "s1",
      priority: "low",
      labelIds: [],
      archivedAt: "2026-02-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    };
    expect(adapter.mapper.mapTask(context, archivedTask).classification).toBe(
      "restricted",
    );

    const ok = adapter.publisher.validate(context, {
      entityType: "project",
      entity: {
        ...archived,
        status: "active",
      },
    });
    expect(ok.ok).toBe(true);

    const rejected = adapter.publisher.publish(context, {
      entityType: "task",
      entity: {
        ...archivedTask,
        id: "task_plane_leak",
      },
    });
    expect(rejected.ok).toBe(false);

    expect(adapter.publisher.getMapper()).toBe(adapter.mapper);
    expect(adapter.publisher.getValidator()).toBe(adapter.validator);
    expect(adapter.publisher.getLifecycle()).toBe(adapter.lifecycle);
    expect(
      adapter.publisher.getMetrics().snapshot().publicationFailures,
    ).toBeGreaterThan(0);
  });
});

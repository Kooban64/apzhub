import { describe, expect, it } from "vitest";

import type { FetchFn } from "./internal/plane-fetch-client";
import { createPlaneAdapter } from "./plane-factory";
import { MOCK_PROJECT } from "./testing/mock-plane-core-data";
import { createMockPlaneCoreFetch, pathnameOf } from "./testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-plane-api";
import { discoverPlaneCoreServiceCapabilities } from "./capabilities/service-capabilities";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

async function createAdapter() {
  return createPlaneAdapter({
    plane: DEFAULT_TEST_PLANE_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "plane-test-token",
    adapterOptions: { fetchFn: createMockPlaneCoreFetch() },
  });
}

describe("Plane core service capabilities", () => {
  it("discovers all supported services and operations", () => {
    const capabilities = discoverPlaneCoreServiceCapabilities();
    expect(capabilities.map((entry) => entry.serviceId)).toEqual([
      "workspaces",
      "projects",
      "project_states",
      "labels",
      "cycles",
      "modules",
      "members",
      "tasks",
      "comments",
      "activity",
      "watchers",
      "analytics",
      "webhooks",
      "events",
      "synchronisation",
    ]);
    expect(
      capabilities.every(
        (entry) =>
          entry.supportsPaging ||
          entry.serviceId === "analytics" ||
          entry.serviceId === "events" ||
          entry.serviceId === "synchronisation",
      ),
    ).toBe(true);
    expect(
      capabilities.find((entry) => entry.serviceId === "projects")?.operations,
    ).toContain("create");
    expect(
      capabilities.find((entry) => entry.serviceId === "tasks")?.operations,
    ).toContain("transition");
  });

  it("exposes capabilities via PlaneAdapter.core", async () => {
    const { adapter } = await createAdapter();
    expect(adapter.core.discoverCapabilities().length).toBe(15);
    expect(adapter.core.tasks).toBeDefined();
    expect(adapter.core.webhooks).toBeDefined();
    expect(adapter.core.events).toBeDefined();
    expect(adapter.core.synchronisation).toBeDefined();
  });
});

describe("Plane workspace service", () => {
  it("lists and gets workspaces", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const list = await adapter.core.workspaces.list(ctx);
    expect(list.items.length).toBeGreaterThan(0);
    expect(list.items[0]?.slug).toBe("apzhub");

    const workspace = await adapter.core.workspaces.get(ctx);
    expect(workspace.id).toBe("ws_plane_ws-001");
  });
});

describe("Plane project service", () => {
  it("lists, gets, creates, updates, and archives projects", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const list = await adapter.core.projects.list(ctx, { status: "active" });
    expect(list.items[0]?.identifier).toBe("CORE");

    const project = await adapter.core.projects.get(
      ctx,
      `proj_plane_${MOCK_PROJECT.id}`,
    );
    expect(project.name).toBe("Platform Core");

    const created = await adapter.core.projects.create(ctx, {
      name: "New Initiative",
      identifier: "NEW",
    });
    expect(created.name).toBe("New Initiative");

    const updated = await adapter.core.projects.update(ctx, created.id, {
      description: "Updated description",
    });
    expect(updated.description).toBe("Updated description");

    const archived = await adapter.core.projects.archive(ctx, created.id);
    expect(archived.status).toBe("archived");
  });

  it("validates create project input", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    await expect(
      adapter.core.projects.create(ctx, { name: "", identifier: "X" }),
    ).rejects.toThrow(/name is required/i);
  });
});

describe("Plane project state service", () => {
  const projectId = `proj_plane_${MOCK_PROJECT.id}`;

  it("supports state lifecycle", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const list = await adapter.core.projectStates.list(ctx, projectId);
    expect(list.items[0]?.name).toBe("Backlog");

    const created = await adapter.core.projectStates.create(ctx, projectId, {
      name: "Review",
      group: "started",
    });
    expect(created.name).toBe("Review");

    const updated = await adapter.core.projectStates.update(
      ctx,
      projectId,
      created.id,
      {
        name: "In Review",
      },
    );
    expect(updated.name).toBe("In Review");

    await adapter.core.projectStates.delete(ctx, projectId, created.id);
    const afterDelete = await adapter.core.projectStates.list(ctx, projectId);
    expect(afterDelete.items.some((item) => item.id === created.id)).toBe(false);
  });
});

describe("Plane label service", () => {
  const projectId = `proj_plane_${MOCK_PROJECT.id}`;

  it("supports label lifecycle", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const created = await adapter.core.labels.create(ctx, projectId, {
      name: "Feature",
      color: "#00ff00",
    });
    expect(created.name).toBe("Feature");

    const fetched = await adapter.core.labels.get(ctx, projectId, created.id);
    expect(fetched.color).toBe("#00ff00");

    const updated = await adapter.core.labels.update(ctx, projectId, created.id, {
      name: "Enhancement",
    });
    expect(updated.name).toBe("Enhancement");

    await adapter.core.labels.delete(ctx, projectId, created.id);
  });
});

describe("Plane cycle service", () => {
  const projectId = `proj_plane_${MOCK_PROJECT.id}`;

  it("supports cycle lifecycle", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const list = await adapter.core.cycles.list(ctx, projectId);
    expect(list.items[0]?.name).toBe("Sprint 1");

    const created = await adapter.core.cycles.create(ctx, projectId, {
      name: "Sprint 2",
      goal: "Ship core services",
    });
    expect(created.name).toBe("Sprint 2");

    const archived = await adapter.core.cycles.archive(ctx, projectId, created.id);
    expect(archived.id).toBe(created.id);
  });
});

describe("Plane module service", () => {
  const projectId = `proj_plane_${MOCK_PROJECT.id}`;

  it("supports module lifecycle", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const created = await adapter.core.modules.create(ctx, projectId, {
      name: "Search Module",
      description: "Unified search",
    });
    expect(created.name).toBe("Search Module");

    const updated = await adapter.core.modules.update(ctx, projectId, created.id, {
      status: "in_progress",
    });
    expect(updated.status).toBe("in_progress");
  });
});

describe("Plane member service", () => {
  const projectId = `proj_plane_${MOCK_PROJECT.id}`;

  it("supports member lifecycle", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const added = await adapter.core.members.add(ctx, projectId, {
      userId: "user_plane_user-002",
      role: "member",
    });
    expect(added.role).toBe("member");

    const updated = await adapter.core.members.update(ctx, projectId, added.id, {
      role: "admin",
    });
    expect(updated.role).toBe("admin");

    await adapter.core.members.remove(ctx, projectId, added.id);
  });
});

describe("Plane core service error handling", () => {
  it("translates Plane API failures through operation runner", async () => {
    const base = createMockPlaneCoreFetch();
    const failingFetch: FetchFn = async (input, init) => {
      if (
        pathnameOf(input).endsWith("/projects/") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(
          JSON.stringify({ error_code: "VENDOR_UNAVAILABLE", message: "Unavailable" }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }
      return base(input, init);
    };

    const { adapter } = await createPlaneAdapter({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "plane-test-token",
      adapterOptions: { fetchFn: failingFetch },
    });
    await adapter.initialise();

    await expect(adapter.core.projects.list(ctx)).rejects.toMatchObject({
      category: "vendor_unavailable",
    });
  });
});

describe("Plane core service paging and sorting", () => {
  it("applies paging metadata and sorting", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const page = await adapter.core.projects.list(ctx, {}, { page: 1, perPage: 10 }, [
      { field: "name", direction: "asc" },
    ]);

    expect(page.perPage).toBe(10);
    expect(page.page).toBe(1);
    expect(page.totalCount).toBeGreaterThan(0);
  });

  it("rejects invalid paging parameters", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    await expect(adapter.core.projects.list(ctx, {}, { page: 0 })).rejects.toThrow(
      /page must be at least 1/i,
    );
  });
});

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { FetchFn } from "./internal/plane-fetch-client";
import { createPlaneAdapter, disposePlaneAdapter } from "./plane-factory";
import { MOCK_ISSUE, MOCK_PROJECT, MOCK_STATE } from "./testing/mock-plane-core-data";
import { createMockPlaneCoreFetch, pathnameOf } from "./testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-plane-api";
import { discoverPlaneCoreServiceCapabilities } from "./capabilities/service-capabilities";
import { PLANE_ADAPTER_VERSION } from "./index";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };
const projectId = `proj_plane_${MOCK_PROJECT.id}`;
const taskId = `task_plane_${MOCK_ISSUE.id}`;

async function createAdapter(fetchFn: FetchFn = createMockPlaneCoreFetch()) {
  return createPlaneAdapter({
    plane: DEFAULT_TEST_PLANE_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "plane-test-token",
    adapterOptions: { fetchFn },
  });
}

describe("Plane task capability registration", () => {
  it("registers tasks in core service capabilities", () => {
    const capabilities = discoverPlaneCoreServiceCapabilities();
    const tasks = capabilities.find((entry) => entry.serviceId === "tasks");
    expect(tasks).toBeDefined();
    expect(tasks?.operations).toEqual(
      expect.arrayContaining([
        "list",
        "get",
        "create",
        "update",
        "archive",
        "transition",
        "assign",
      ]),
    );
    expect(capabilities).toHaveLength(15);
  });

  it("exposes tasks via factory-created adapter.core", async () => {
    const { adapter } = await createAdapter();
    expect(adapter.core.tasks).toBeDefined();
    expect(adapter.core.discoverCapabilities()).toHaveLength(15);
    expect(PLANE_ADAPTER_VERSION).toBe("0.6.0");
  });
});

describe("PlaneTaskService core operations", () => {
  it("lists, gets, creates, updates, and archives tasks", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const list = await adapter.core.tasks.list(ctx, projectId);
    expect(list.items.length).toBeGreaterThan(0);
    expect(list.items[0]?.id).toBe(taskId);
    expect(list.items[0]?.title).toBe("Implement auth");
    expect(list.page).toBe(1);
    expect(list.perPage).toBe(25);

    const fetched = await adapter.core.tasks.get(ctx, projectId, taskId);
    expect(fetched.title).toBe("Implement auth");
    expect(fetched.priority).toBe("high");
    expect(fetched.assigneeId).toBe("user_plane_user-001");

    const created = await adapter.core.tasks.create(ctx, projectId, {
      title: "Ship task capability",
      description: "OSS-101-06",
      priority: "medium",
      statusId: `status_plane_${MOCK_STATE.id}`,
      assigneeId: "user_plane_user-001",
      labelIds: ["label_plane_label-001"],
      sprintId: "sprint_plane_cycle-001",
      projectModuleId: "module_plane_module-001",
      startDate: "2026-07-11",
      dueDate: "2026-07-20",
      estimate: { points: 2 },
    });
    expect(created.title).toBe("Ship task capability");
    expect(created.id.startsWith("task_plane_")).toBe(true);
    expect(created.priority).toBe("medium");

    const updated = await adapter.core.tasks.update(ctx, projectId, created.id, {
      title: "Ship task capability (updated)",
      priority: "high",
    });
    expect(updated.title).toBe("Ship task capability (updated)");
    expect(updated.priority).toBe("high");

    const archived = await adapter.core.tasks.archive(ctx, projectId, created.id);
    expect(archived.archivedAt).toBeTruthy();
  });

  it("rejects empty create title and empty update payloads", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    await expect(
      adapter.core.tasks.create(ctx, projectId, { title: "" }),
    ).rejects.toThrow(/title is required/i);
    await expect(adapter.core.tasks.update(ctx, projectId, taskId, {})).rejects.toThrow(
      /at least one update field/i,
    );
  });
});

describe("PlaneTaskService query behaviour", () => {
  it("supports pagination, sorting, and documented filters", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    await adapter.core.tasks.create(ctx, projectId, {
      title: "Alpha task",
      priority: "low",
    });
    await adapter.core.tasks.create(ctx, projectId, {
      title: "Zulu task",
      priority: "urgent",
    });

    const page = await adapter.core.tasks.list(
      ctx,
      projectId,
      { priority: "high" },
      { page: 1, perPage: 10 },
      [{ field: "title", direction: "asc" }],
    );
    expect(page.perPage).toBe(10);
    expect(page.items.every((item) => item.priority === "high")).toBe(true);

    const byAssignee = await adapter.core.tasks.list(ctx, projectId, {
      assigneeId: "user_plane_user-001",
    });
    expect(byAssignee.items.length).toBeGreaterThan(0);

    const byLabel = await adapter.core.tasks.list(ctx, projectId, {
      labelId: "label_plane_label-001",
    });
    expect(byLabel.items.length).toBeGreaterThan(0);

    const bySprint = await adapter.core.tasks.list(ctx, projectId, {
      sprintId: "sprint_plane_cycle-001",
    });
    expect(bySprint.items.length).toBeGreaterThan(0);

    const byModule = await adapter.core.tasks.list(ctx, projectId, {
      projectModuleId: "module_plane_module-001",
    });
    expect(byModule.items.length).toBeGreaterThan(0);

    const byStatus = await adapter.core.tasks.list(ctx, projectId, {
      statusId: `status_plane_${MOCK_STATE.id}`,
    });
    expect(byStatus.items.length).toBeGreaterThan(0);

    const bySearch = await adapter.core.tasks.list(ctx, projectId, {
      search: "Implement",
    });
    expect(bySearch.items.some((item) => item.title.includes("Implement"))).toBe(true);

    const byDates = await adapter.core.tasks.list(ctx, projectId, {
      createdAfter: "2026-01-01T00:00:00.000Z",
      createdBefore: "2027-01-01T00:00:00.000Z",
    });
    expect(byDates.items.length).toBeGreaterThan(0);

    const empty = await adapter.core.tasks.list(ctx, projectId, {
      search: "no-such-task-xyz",
    });
    expect(empty.items).toEqual([]);

    const archivedOnly = await adapter.core.tasks.list(ctx, projectId, {
      archived: true,
    });
    expect(archivedOnly.items.every((item) => Boolean(item.archivedAt))).toBe(true);

    const activeOnly = await adapter.core.tasks.list(ctx, projectId, {
      archived: false,
    });
    expect(activeOnly.items.every((item) => !item.archivedAt)).toBe(true);

    const withParent = await adapter.core.tasks.create(ctx, projectId, {
      title: "Child task",
      parentTaskId: taskId,
    });
    const byParent = await adapter.core.tasks.list(ctx, projectId, {
      parentTaskId: taskId,
    });
    expect(byParent.items.some((item) => item.id === withParent.id)).toBe(true);

    const roots = await adapter.core.tasks.list(ctx, projectId, { parentTaskId: null });
    expect(roots.items.every((item) => !item.parentTaskId)).toBe(true);
  });

  it("rejects malformed query parameters", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    await expect(
      adapter.core.tasks.list(ctx, projectId, { priority: "critical" as "high" }),
    ).rejects.toThrow(/unsupported priority/i);

    await expect(
      adapter.core.tasks.list(ctx, projectId, {}, { page: 0 }),
    ).rejects.toThrow(/page must be at least 1/i);

    await expect(
      adapter.core.tasks.list(ctx, projectId, {}, {}, [
        { field: "notAField" as "title", direction: "asc" },
      ]),
    ).rejects.toThrow(/sort field/i);
  });
});

describe("PlaneTaskService state transitions", () => {
  it("transitions to a valid project state and rejects foreign states", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const started = await adapter.core.projectStates.create(ctx, projectId, {
      name: "In Progress",
      group: "started",
    });

    const transitioned = await adapter.core.tasks.transition(
      ctx,
      projectId,
      taskId,
      started.id,
    );
    expect(transitioned.statusId).toBe(started.id);
    expect(transitioned.status).toBe("in_progress");

    await expect(
      adapter.core.tasks.transition(
        ctx,
        projectId,
        taskId,
        "status_plane_foreign-state",
      ),
    ).rejects.toThrow(/does not belong to the project/i);
  });
});

describe("PlaneTaskService relationships", () => {
  it("manages assignees, labels, cycle, module, and parent", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();

    const created = await adapter.core.tasks.create(ctx, projectId, {
      title: "Relationship task",
    });

    const assigned = await adapter.core.tasks.assign(
      ctx,
      projectId,
      created.id,
      "user_plane_user-002",
    );
    expect(assigned.assigneeId).toBe("user_plane_user-002");

    const replaced = await adapter.core.tasks.setAssignees(
      ctx,
      projectId,
      created.id,
      ["user_plane_user-001", "user_plane_user-003"],
      "replace",
    );
    expect(replaced.assigneeId).toBe("user_plane_user-001");
    expect(replaced.assigneeIds).toEqual(["user_plane_user-003"]);

    const unassigned = await adapter.core.tasks.unassign(
      ctx,
      projectId,
      created.id,
      "user_plane_user-001",
    );
    expect(unassigned.assigneeId).toBe("user_plane_user-003");

    const cleared = await adapter.core.tasks.unassign(ctx, projectId, created.id);
    expect(cleared.assigneeId).toBeUndefined();

    const withLabels = await adapter.core.tasks.addLabels(ctx, projectId, created.id, [
      "label_plane_label-001",
    ]);
    expect(withLabels.labelIds).toContain("label_plane_label-001");

    const replacedLabels = await adapter.core.tasks.setLabels(
      ctx,
      projectId,
      created.id,
      ["label_plane_label-001"],
    );
    expect(replacedLabels.labelIds).toEqual(["label_plane_label-001"]);

    const withoutLabel = await adapter.core.tasks.removeLabels(
      ctx,
      projectId,
      created.id,
      ["label_plane_label-001"],
    );
    expect(withoutLabel.labelIds).not.toContain("label_plane_label-001");

    const withCycle = await adapter.core.tasks.addToCycle(
      ctx,
      projectId,
      created.id,
      "sprint_plane_cycle-001",
    );
    expect(withCycle.sprintId).toBe("sprint_plane_cycle-001");

    const withoutCycle = await adapter.core.tasks.removeFromCycle(
      ctx,
      projectId,
      created.id,
    );
    expect(withoutCycle.sprintId).toBeUndefined();

    const withModule = await adapter.core.tasks.addToModule(
      ctx,
      projectId,
      created.id,
      "module_plane_module-001",
    );
    expect(withModule.projectModuleId).toBe("module_plane_module-001");

    const withoutModule = await adapter.core.tasks.removeFromModule(
      ctx,
      projectId,
      created.id,
    );
    expect(withoutModule.projectModuleId).toBeUndefined();

    const withParent = await adapter.core.tasks.update(ctx, projectId, created.id, {
      parentTaskId: taskId,
    });
    expect(withParent.parentTaskId).toBe(taskId);

    const withoutParent = await adapter.core.tasks.update(ctx, projectId, created.id, {
      parentTaskId: null,
    });
    expect(withoutParent.parentTaskId).toBeUndefined();
  });
});

describe("PlaneTaskService error handling", () => {
  it("translates not found, auth, permission, conflict, rate limit, and unavailable", async () => {
    const base = createMockPlaneCoreFetch();

    const scenarios: Array<{
      status: number;
      code: string;
      category: string;
    }> = [
      { status: 404, code: "ISSUE_NOT_FOUND", category: "not_found" },
      { status: 401, code: "INVALID_TOKEN", category: "authentication" },
      { status: 403, code: "PERMISSION_DENIED", category: "authorization" },
      { status: 409, code: "DUPLICATE_ENTITY", category: "conflict" },
      { status: 429, code: "RATE_LIMITED", category: "rate_limited" },
      { status: 503, code: "VENDOR_UNAVAILABLE", category: "vendor_unavailable" },
    ];

    for (const scenario of scenarios) {
      const fetchFn: FetchFn = async (input, init) => {
        if (
          pathnameOf(input).includes("/issues/") &&
          (init?.method ?? "GET") === "GET"
        ) {
          return new Response(
            JSON.stringify({
              error_code: scenario.code,
              message: scenario.code,
              api_key: "secret-should-not-leak",
            }),
            {
              status: scenario.status,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        return base(input, init);
      };

      const { adapter } = await createAdapter(fetchFn);
      await adapter.initialise();

      await expect(
        adapter.core.tasks.get(ctx, projectId, taskId),
      ).rejects.toMatchObject({
        category: scenario.category,
      });
    }
  });

  it("rejects malformed vendor responses and preserves safe diagnostics", async () => {
    const base = createMockPlaneCoreFetch();
    const fetchFn: FetchFn = async (input, init) => {
      if (
        pathnameOf(input).match(/\/issues\/[^/]+\/$/) &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(JSON.stringify({ id: "x" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return base(input, init);
    };

    const { adapter } = await createAdapter(fetchFn);
    await adapter.initialise();

    await expect(adapter.core.tasks.get(ctx, projectId, taskId)).rejects.toThrow(
      /issue\./i,
    );
  });

  it("does not leak secrets through public adapter errors", async () => {
    const base = createMockPlaneCoreFetch();
    const fetchFn: FetchFn = async (input, init) => {
      if (pathnameOf(input).includes("/issues/") && (init?.method ?? "GET") === "GET") {
        return new Response(
          JSON.stringify({
            error_code: "INVALID_TOKEN",
            message: "bad key plane-test-token",
            headers: { "X-Api-Key": "plane-test-token" },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }
      return base(input, init);
    };

    const { adapter } = await createAdapter(fetchFn);
    await adapter.initialise();

    try {
      await adapter.core.tasks.get(ctx, projectId, taskId);
      expect.unreachable("expected authentication failure");
    } catch (error) {
      const serialised = JSON.stringify(error);
      expect(serialised).not.toMatch(/plane-test-token/);
      expect(serialised).not.toMatch(/X-Api-Key/i);
      expect(error).toMatchObject({ category: "authentication" });
    }
  });
});

describe("PlaneTaskService SDK integration", () => {
  it("keeps lifecycle valid after task operations and safe disposal", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    await adapter.core.tasks.list(ctx, projectId);
    expect(adapter.planeDiagnosticsExtension.extendedCapabilities).toEqual(
      expect.arrayContaining(["tasks", "issues"]),
    );
    expect(adapter.planeDiagnosticsExtension.taskCapability).toMatchObject({
      registered: true,
      serviceAvailable: true,
      apiAssumption: expect.stringContaining("issues API"),
    });
    expect(
      adapter.planeDiagnosticsExtension.taskCapability.supportedOperations,
    ).toContain("transition");

    await disposePlaneAdapter(adapter, factory);
  });
});

describe("Plane task architecture boundaries", () => {
  it("forbids platform-services, gateway, and mapping-store imports in the Plane package", () => {
    const root = dirname(fileURLToPath(import.meta.url));
    const forbidden = [
      "@apzhub/platform-services",
      "PlatformServiceGateway",
      "EntityMappingStore",
      "createPlatformServices",
    ];

    const offenders: string[] = [];

    function walk(dir: string): void {
      for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry.endsWith(".test.ts")) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.endsWith(".ts")) continue;
        const source = readFileSync(full, "utf8");
        for (const needle of forbidden) {
          if (source.includes(needle)) {
            offenders.push(`${relative(root, full)}:${needle}`);
          }
        }
      }
    }

    walk(root);
    expect(offenders).toEqual([]);
  });

  it("does not export Plane API types from the public package root", async () => {
    const publicApi = await import("./index");
    expect("PlaneIssueRecord" in publicApi).toBe(false);
    expect("PlaneListQuery" in publicApi).toBe(false);
    expect("PlaneRestClient" in publicApi).toBe(false);
  });
});

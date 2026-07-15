/**
 * OSS-101-07 — Plane collaboration & project intelligence contract tests.
 */
import { describe, expect, it } from "vitest";

import type { FetchFn } from "./internal/plane-fetch-client";
import { createPlaneAdapter, disposePlaneAdapter } from "./plane-factory";
import {
  MOCK_COMMENT,
  MOCK_CYCLE,
  MOCK_ISSUE,
  MOCK_PROJECT,
  MOCK_SUBSCRIBER,
} from "./testing/mock-plane-core-data";
import { createMockPlaneCoreFetch, pathnameOf } from "./testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-plane-api";
import { discoverPlaneCoreServiceCapabilities } from "./capabilities/service-capabilities";
import { createPlaneVendorErrorMapper } from "./plane-error-mapper";
import { PLANE_ADAPTER_VERSION } from "./index";
import {
  mapPlaneActivity,
  mapPlaneComment,
  mapPlaneSubscriber,
} from "./mappers/collaboration-mapper";
import {
  mapBurndownSnapshot,
  mapCycleProgress,
  mapProjectStatisticsFromTasks,
  mapVelocitySnapshot,
} from "./mappers/analytics-mapper";
import { mapPlaneIssue } from "./mappers/task-mapper";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };
const projectId = `proj_plane_${MOCK_PROJECT.id}`;
const taskId = `task_plane_${MOCK_ISSUE.id}`;
const sprintId = `sprint_plane_${MOCK_CYCLE.id}`;

async function createAdapter(fetchFn: FetchFn = createMockPlaneCoreFetch()) {
  return createPlaneAdapter({
    plane: DEFAULT_TEST_PLANE_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "plane-test-token",
    adapterOptions: { fetchFn },
  });
}

const errorContext = {
  correlationId: TEST_CORRELATION_ID,
  integrationId: "plane",
  adapterId: "plane-adapter",
  operation: "test",
  tenantId: TEST_TENANT_ID,
};

describe("OSS-101-07 capability registration", () => {
  it("registers comments, activity, watchers, and analytics", () => {
    const capabilities = discoverPlaneCoreServiceCapabilities();
    expect(capabilities.map((entry) => entry.serviceId)).toEqual(
      expect.arrayContaining(["comments", "activity", "watchers", "analytics"]),
    );
    expect(capabilities).toHaveLength(15);
    expect(PLANE_ADAPTER_VERSION).toBe("0.6.0");
  });

  it("exposes collaboration services on adapter.core", async () => {
    const { adapter, factory } = await createAdapter();
    expect(adapter.core.comments).toBeDefined();
    expect(adapter.core.activity).toBeDefined();
    expect(adapter.core.watchers).toBeDefined();
    expect(adapter.core.analytics).toBeDefined();
    const diagnostics = adapter.planeDiagnosticsExtension;
    expect(diagnostics.collaborationCapability.commentsRegistered).toBe(true);
    expect(diagnostics.collaborationCapability.analyticsRegistered).toBe(true);
    await disposePlaneAdapter(adapter, factory);
  });
});

describe("PlaneCommentService", () => {
  it("lists, gets, creates, updates, and deletes comments", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    const listed = await adapter.core.comments.list(ctx, projectId, taskId);
    expect(listed.items[0]?.id).toBe(`comment_plane_${MOCK_COMMENT.id}`);
    expect(listed.items[0]?.body).toBe("Looks good");

    const fetched = await adapter.core.comments.get(
      ctx,
      projectId,
      taskId,
      `comment_plane_${MOCK_COMMENT.id}`,
    );
    expect(fetched.authorId).toBe("user_plane_user-001");

    const created = await adapter.core.comments.create(ctx, projectId, taskId, {
      body: "Ship it",
    });
    expect(created.body).toBe("Ship it");
    expect(created.id.startsWith("comment_plane_")).toBe(true);

    const updated = await adapter.core.comments.update(
      ctx,
      projectId,
      taskId,
      created.id,
      { body: "Ship it now" },
    );
    expect(updated.body).toBe("Ship it now");

    await adapter.core.comments.delete(ctx, projectId, taskId, created.id);
    await disposePlaneAdapter(adapter, factory);
  });

  it("filters comments by author and search", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();
    const filtered = await adapter.core.comments.list(
      ctx,
      projectId,
      taskId,
      { authorId: "user_plane_user-001", search: "good" },
    );
    expect(filtered.items.length).toBe(1);
    const empty = await adapter.core.comments.list(ctx, projectId, taskId, {
      search: "missing-term",
    });
    expect(empty.items).toHaveLength(0);
    await disposePlaneAdapter(adapter, factory);
  });

  it("maps 404 for missing comments", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();
    await expect(
      adapter.core.comments.get(ctx, projectId, taskId, "comment_plane_missing"),
    ).rejects.toMatchObject({ category: "not_found" });
    await disposePlaneAdapter(adapter, factory);
  });
});

describe("PlaneActivityService", () => {
  it("lists task and project activity with filtering and pagination", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    const taskActivity = await adapter.core.activity.listTaskActivity(
      ctx,
      projectId,
      taskId,
    );
    expect(taskActivity.items.length).toBeGreaterThan(0);
    expect(taskActivity.items[0]?.id.startsWith("activity_plane_")).toBe(true);
    expect(taskActivity.items[0]?.action).toBe("updated");

    const filtered = await adapter.core.activity.listTaskActivity(
      ctx,
      projectId,
      taskId,
      { action: "updated", actorId: "user_plane_user-001" },
    );
    expect(filtered.items.length).toBeGreaterThan(0);

    const projectActivity = await adapter.core.activity.listProjectActivity(
      ctx,
      projectId,
      {},
      { perPage: 10 },
    );
    expect(projectActivity.items.length).toBeGreaterThan(0);

    const paged = await adapter.core.activity.list(ctx, projectId, {}, { perPage: 1 });
    expect(paged.items).toHaveLength(1);
    expect(typeof paged.hasNextPage).toBe("boolean");
    await disposePlaneAdapter(adapter, factory);
  });
});

describe("PlaneWatcherService", () => {
  it("lists, adds, and removes watchers", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    const listed = await adapter.core.watchers.list(ctx, projectId, taskId);
    expect(listed.items[0]?.id).toBe(`watcher_plane_${MOCK_SUBSCRIBER.id}`);
    expect(listed.items[0]?.userId).toBe("user_plane_user-001");

    const added = await adapter.core.watchers.add(ctx, projectId, taskId, {
      userId: "user_plane_user-002",
    });
    expect(added.userId).toBe("user_plane_user-002");

    await adapter.core.watchers.remove(ctx, projectId, taskId, added.id);
    await disposePlaneAdapter(adapter, factory);
  });
});

describe("PlaneAnalyticsService", () => {
  it("returns project statistics with distributions and workloads", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();
    const stats = await adapter.core.analytics.getProjectStatistics(ctx, projectId);
    expect(stats.projectId).toBe(projectId);
    expect(stats.totalTasks).toBeGreaterThan(0);
    expect(stats.stateDistribution.length).toBeGreaterThan(0);
    expect(stats.priorityDistribution.length).toBeGreaterThan(0);
    expect(stats.memberWorkloads[0]?.userId).toBe("user_plane_user-001");
    expect(stats.completionPercent).toBeGreaterThanOrEqual(0);
    await disposePlaneAdapter(adapter, factory);
  });

  it("returns task statistics, cycle progress, velocity, and burndown", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    const taskStats = await adapter.core.analytics.getTaskStatistics(
      ctx,
      projectId,
      taskId,
    );
    expect(taskStats.taskId).toBe(taskId);
    expect(taskStats.commentCount).toBeGreaterThanOrEqual(1);
    expect(taskStats.watcherCount).toBeGreaterThanOrEqual(1);

    const progress = await adapter.core.analytics.getCycleProgress(
      ctx,
      projectId,
      sprintId,
    );
    expect(progress.completionPercent).toBeGreaterThan(0);

    const velocity = await adapter.core.analytics.getVelocitySnapshot(
      ctx,
      projectId,
      sprintId,
    );
    expect(velocity.committedPoints).toBe(10);
    expect(velocity.completedPoints).toBe(3);

    const burndown = await adapter.core.analytics.getBurndownSnapshot(
      ctx,
      projectId,
      sprintId,
    );
    expect(burndown.points.length).toBeGreaterThan(0);
    expect(burndown.remainingPoints).toBeGreaterThanOrEqual(0);
    await disposePlaneAdapter(adapter, factory);
  });
});

describe("mapping and error translation", () => {
  it("maps comments, activity, and watchers to canonical IDs", () => {
    const comment = mapPlaneComment(MOCK_COMMENT, taskId);
    expect(comment.id).toBe("comment_plane_comment-001");
    expect(comment.taskId).toBe(taskId);

    const activity = mapPlaneActivity(
      {
        id: "activity-001",
        verb: "created",
        actor: "user-001",
        issue: "issue-001",
        project: "proj-001",
        created_at: "2026-07-02T00:00:00.000Z",
      },
      projectId,
      taskId,
    );
    expect(activity.id).toBe("activity_plane_activity-001");
    expect(activity.actorId).toBe("user_plane_user-001");

    const watcher = mapPlaneSubscriber(MOCK_SUBSCRIBER, taskId);
    expect(watcher.id).toBe("watcher_plane_sub-001");
  });

  it("maps analytics snapshots without Plane-native IDs in public fields", () => {
    const task = mapPlaneIssue(MOCK_ISSUE, projectId);
    const projectStats = mapProjectStatisticsFromTasks(
      projectId,
      [task],
      { id: MOCK_PROJECT.id, total_issues: 1, completed_issues: 0 },
      "2026-07-10T00:00:00.000Z",
    );
    expect(JSON.stringify(projectStats)).not.toMatch(/issue-001/);

    const progress = mapCycleProgress(
      projectId,
      sprintId,
      { total_issues: 4, completed_issues: 1 },
      "2026-07-10T00:00:00.000Z",
    );
    expect(progress.sprintId).toBe(sprintId);

    const velocity = mapVelocitySnapshot(
      projectId,
      sprintId,
      { total_estimate_points: 8, completed_estimate_points: 2 },
      "2026-07-10T00:00:00.000Z",
    );
    expect(velocity.velocity).toBe(2);

    const burndown = mapBurndownSnapshot(
      projectId,
      sprintId,
      {
        total_issues: 4,
        completed_issues: 1,
        completion_chart: [{ date: "2026-04-01", completed: 0, total: 4, ideal: 4 }],
      },
      { total_estimate_points: 8, completed_estimate_points: 2 },
      "2026-07-10T00:00:00.000Z",
    );
    expect(burndown.points[0]?.idealRemainingPoints).toBe(4);
  });

  it("translates permission and provider failures", () => {
    const mapper = createPlaneVendorErrorMapper();
    const denied = mapper.map({
      statusCode: 403,
      vendorCode: "PERMISSION_DENIED",
      body: { error_code: "PERMISSION_DENIED", message: "Forbidden" },
      context: errorContext,
    });
    expect(denied?.error.category).toBe("authorization");

    const unavailable = mapper.map({
      statusCode: 503,
      vendorCode: "VENDOR_UNAVAILABLE",
      body: { error_code: "VENDOR_UNAVAILABLE" },
      context: errorContext,
    });
    expect(unavailable?.error.category).toBe("vendor_unavailable");

    const commentMissing = mapper.map({
      statusCode: 404,
      vendorCode: "COMMENT_NOT_FOUND",
      body: { error_code: "COMMENT_NOT_FOUND" },
      context: errorContext,
    });
    expect(commentMissing?.error.category).toBe("not_found");
  });

  it("surfaces provider failures from collaboration calls", async () => {
    const failingFetch: FetchFn = async (input, init) => {
      const path = pathnameOf(input);
      if (path.includes("/comments/")) {
        return new Response(
          JSON.stringify({ error_code: "VENDOR_UNAVAILABLE", message: "down" }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }
      return createMockPlaneCoreFetch()(input, init);
    };

    const { adapter, factory } = await createAdapter(failingFetch);
    await adapter.initialise();
    await expect(adapter.core.comments.list(ctx, projectId, taskId)).rejects.toMatchObject({
      category: "vendor_unavailable",
    });
    await disposePlaneAdapter(adapter, factory);
  });

  it("surfaces authorization failures from watcher calls", async () => {
    const failingFetch: FetchFn = async (input, init) => {
      const path = pathnameOf(input);
      if (path.includes("/issue-subscribers/")) {
        return new Response(
          JSON.stringify({ error_code: "PERMISSION_DENIED", message: "nope" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      return createMockPlaneCoreFetch()(input, init);
    };

    const { adapter, factory } = await createAdapter(failingFetch);
    await adapter.initialise();
    await expect(adapter.core.watchers.list(ctx, projectId, taskId)).rejects.toMatchObject({
      category: "authorization",
    });
    await disposePlaneAdapter(adapter, factory);
  });
});

describe("architecture boundaries", () => {
  it("does not import platform-services or gateway", async () => {
    const { readdirSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = join(process.cwd(), "integrations/plane/src");
    const collect = (dir: string): string[] => {
      const out: string[] = [];
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...collect(full));
        else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
          out.push(full);
        }
      }
      return out;
    };
    for (const file of collect(root)) {
      const source = readFileSync(file, "utf8");
      expect(source.includes("@apzhub/platform-services")).toBe(false);
      expect(source.includes("PlatformServiceGateway")).toBe(false);
      expect(source.includes("EntityMappingStore")).toBe(false);
    }
  });
});

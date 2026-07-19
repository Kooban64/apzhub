import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assignTask,
  clearTaskAssignee,
  getTask,
  transitionTask,
  updateTask,
} from "./projects-api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockFetch(data: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({
        data,
        meta: { requestId: "req_test", correlationId: "corr_test" },
      }),
    })),
  );
}

describe("projects-api task mutations (PRJ-1.1-07)", () => {
  it("gets a task", async () => {
    mockFetch({
      id: "task_1",
      projectId: "proj_1",
      title: "A",
      status: "open",
      statusId: "status_1",
      priority: "low",
      labelIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const task = await getTask("task_1");
    expect(task.id).toBe("task_1");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks/task_1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("updates a task", async () => {
    mockFetch({
      id: "task_1",
      projectId: "proj_1",
      title: "A",
      status: "open",
      statusId: "status_1",
      priority: "high",
      labelIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await updateTask("task_1", { priority: "high" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks/task_1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ priority: "high" }),
      }),
    );
  });

  it("transitions a task", async () => {
    mockFetch({
      id: "task_1",
      projectId: "proj_1",
      title: "A",
      status: "in_progress",
      statusId: "status_2",
      priority: "low",
      labelIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await transitionTask("task_1", { statusId: "status_2" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks/task_1/transition",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ statusId: "status_2" }),
      }),
    );
  });

  it("assigns and clears assignee", async () => {
    mockFetch({
      id: "task_1",
      projectId: "proj_1",
      title: "A",
      status: "open",
      statusId: "status_1",
      priority: "low",
      assigneeId: "user_1",
      assigneeIds: ["user_1"],
      labelIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await assignTask("task_1", { assigneeId: "user_1" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks/task_1/assignees",
      expect.objectContaining({ method: "POST" }),
    );

    await clearTaskAssignee("task_1", "user_1");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks/task_1/assignees/user_1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

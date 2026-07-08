import { beforeEach, describe, expect, it } from "vitest";

import {
  SEED_TASKS,
  getSharedTaskRepository,
  resetSharedTaskRepository,
} from "./index";

describe("InMemoryTaskRepository", () => {
  beforeEach(() => {
    resetSharedTaskRepository();
  });

  it("seeds at least 30 tasks linked to matters", () => {
    const repository = getSharedTaskRepository();
    expect(repository.count()).toBeGreaterThanOrEqual(30);
    expect(SEED_TASKS.every((task) => task.matterId)).toBe(true);
  });

  it("filters by status, priority, assignee, matter, and due date", () => {
    const repository = getSharedTaskRepository();
    const sample = SEED_TASKS[0]!;

    expect(repository.list({ taskStatus: sample.taskStatus }).length).toBeGreaterThan(
      0,
    );
    expect(
      repository.list({ taskPriority: sample.taskPriority }).length,
    ).toBeGreaterThan(0);
    expect(
      repository.list({ assigneeUserId: sample.assigneeUserId }).length,
    ).toBeGreaterThan(0);
    expect(repository.list({ matterId: sample.matterId }).length).toBeGreaterThan(0);
    expect(
      repository.list({ dueDateFilter: "no_due_date" }).length,
    ).toBeGreaterThanOrEqual(0);
  });

  it("soft archives tasks", () => {
    const repository = getSharedTaskRepository();
    const task = SEED_TASKS[0]!;

    const archived = repository.softArchive(task.taskId);
    expect(archived?.taskStatus).toBe("cancelled");
    expect(repository.getById(task.taskId)).toBeUndefined();
    expect(repository.isSoftArchived(task.taskId)).toBe(true);
  });
});

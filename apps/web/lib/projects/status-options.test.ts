import { describe, expect, it } from "vitest";

import { statusOptionsFromTasks } from "./status-options";
import type { Task } from "./types";

function sampleTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    projectId: "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    title: "Sample",
    status: "open",
    statusId: "status_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    priority: "medium",
    labelIds: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("statusOptionsFromTasks", () => {
  it("deduplicates statusIds and labels by semantic status", () => {
    const options = statusOptionsFromTasks([
      sampleTask(),
      sampleTask({
        id: "task_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        status: "in_progress",
        statusId: "status_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      }),
      sampleTask({
        id: "task_cccccccccccccccccccccccccccccccc",
        status: "open",
        statusId: "status_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      }),
    ]);

    expect(options).toHaveLength(2);
    expect(options.map((option) => option.label)).toEqual(["In progress", "Open"]);
  });
});

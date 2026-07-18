import { describe, expect, it } from "vitest";

import type { PlaneIssueRecord } from "../internal/plane-api-types";
import { MOCK_ISSUE } from "../testing/mock-plane-core-data";
import {
  mapPlaneIssue,
  mapPlanePriorityToCanonical,
  mapPriorityToPlane,
  mapStateGroupToTaskStatus,
  mapTaskToPlaneCreateBody,
  mapTaskToPlaneUpdateBody,
  resolveProjectPlaneId,
  resolveTaskPlaneId,
} from "./task-mapper";

describe("mapPlaneIssue", () => {
  it("maps a full Plane issue to a canonical Task", () => {
    const task = mapPlaneIssue(MOCK_ISSUE, "proj_plane_proj-001", {
      stateGroup: "started",
    });

    expect(task.id).toBe("task_plane_issue-001");
    expect(task.projectId).toBe("proj_plane_proj-001");
    expect(task.title).toBe("Implement auth");
    expect(task.description).toBe("Wire Better Auth");
    expect(task.status).toBe("in_progress");
    expect(task.statusId).toBe("status_plane_state-001");
    expect(task.priority).toBe("high");
    expect(task.assigneeId).toBe("user_plane_user-001");
    expect(task.labelIds).toEqual(["label_plane_label-001"]);
    expect(task.sprintId).toBe("sprint_plane_cycle-001");
    expect(task.projectModuleId).toBe("module_plane_module-001");
    expect(task.estimate).toEqual({ points: 3 });
    expect(task.startDate).toBe("2026-07-01");
    expect(task.dueDate).toBe("2026-07-15");
    expect(task.rank).toBe(1000);
    expect(task.archivedAt).toBeUndefined();
  });

  it("maps state object relationships and multi-assignees", () => {
    const record: PlaneIssueRecord = {
      ...MOCK_ISSUE,
      state: { id: "state-002", name: "Done", group: "completed" },
      assignees: ["user-001", "user-002"],
      labels: [{ id: "label-002" }],
      parent: "issue-000",
      archived_at: "2026-07-09T00:00:00.000Z",
      estimate_point: null,
      cycle: null,
      module: null,
      description_stripped: undefined,
      description_html: undefined,
      description: "Plain text",
    };

    const task = mapPlaneIssue(record, "proj-001");

    expect(task.projectId).toBe("proj_plane_proj-001");
    expect(task.status).toBe("done");
    expect(task.statusId).toBe("status_plane_state-002");
    expect(task.assigneeId).toBe("user_plane_user-001");
    expect(task.assigneeIds).toEqual(["user_plane_user-002"]);
    expect(task.labelIds).toEqual(["label_plane_label-002"]);
    expect(task.parentTaskId).toBe("task_plane_issue-000");
    expect(task.sprintId).toBeUndefined();
    expect(task.projectModuleId).toBeUndefined();
    expect(task.estimate).toBeUndefined();
    expect(task.archivedAt).toBe("2026-07-09T00:00:00.000Z");
    expect(task.description).toBe("Plain text");
  });

  it("handles missing relationships and unknown enums safely", () => {
    const record: PlaneIssueRecord = {
      id: "issue-x",
      name: "Sparse",
      project: "proj-001",
      state: null,
      priority: "mystery",
      assignees: undefined,
      labels: undefined,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    };

    const task = mapPlaneIssue(record, "proj_plane_proj-001");

    expect(task.status).toBe("open");
    expect(task.statusId).toBe("status_plane_unknown");
    expect(task.priority).toBe("none");
    expect(task.assigneeId).toBeUndefined();
    expect(task.labelIds).toEqual([]);
    expect(task.parentTaskId).toBeUndefined();
  });

  it("strips HTML description when stripped text is absent", () => {
    const task = mapPlaneIssue(
      {
        ...MOCK_ISSUE,
        description_stripped: undefined,
        description: undefined,
        description_html: "<p>From <b>HTML</b></p>",
      },
      "proj_plane_proj-001",
    );

    expect(task.description).toBe("From HTML");
  });
});

describe("mapTaskToPlaneCreateBody / mapTaskToPlaneUpdateBody", () => {
  it("maps create input without Plane-native field names at the public boundary", () => {
    const body = mapTaskToPlaneCreateBody({
      title: "New task",
      description: "<p>Desc</p>",
      statusId: "status_plane_state-001",
      priority: "urgent",
      assigneeIds: ["user_plane_user-001", "user_plane_user-002"],
      labelIds: ["label_plane_label-001"],
      sprintId: "sprint_plane_cycle-001",
      projectModuleId: "module_plane_module-001",
      parentTaskId: "task_plane_issue-000",
      startDate: "2026-08-01",
      dueDate: "2026-08-10",
      estimate: { points: 5 },
    });

    expect(body).toEqual({
      name: "New task",
      description_html: "<p>Desc</p>",
      state: "state-001",
      priority: "urgent",
      assignees: ["user-001", "user-002"],
      labels: ["label-001"],
      cycle: "cycle-001",
      module: "module-001",
      parent: "issue-000",
      start_date: "2026-08-01",
      target_date: "2026-08-10",
      estimate_point: 5,
    });
  });

  it("maps partial updates and null clears without inventing defaults", () => {
    expect(mapTaskToPlaneUpdateBody({ title: "Renamed" })).toEqual({ name: "Renamed" });

    expect(
      mapTaskToPlaneUpdateBody({
        assigneeId: null,
        sprintId: null,
        projectModuleId: null,
        parentTaskId: null,
        estimate: null,
        dueDate: null,
      }),
    ).toEqual({
      assignees: [],
      cycle: null,
      module: null,
      parent: null,
      estimate_point: null,
      target_date: null,
    });

    expect(
      mapTaskToPlaneUpdateBody({
        assigneeId: "user_plane_user-001",
        labelIds: ["label_plane_label-001"],
        sprintId: "sprint_plane_cycle-001",
        projectModuleId: "module_plane_module-001",
        parentTaskId: "task_plane_issue-000",
        startDate: "2026-08-01",
        dueDate: "2026-08-10",
        estimate: { points: 8 },
      }),
    ).toEqual({
      assignees: ["user-001"],
      labels: ["label-001"],
      cycle: "cycle-001",
      module: "module-001",
      parent: "issue-000",
      start_date: "2026-08-01",
      target_date: "2026-08-10",
      estimate_point: 8,
    });

    expect(mapTaskToPlaneUpdateBody({ assigneeIds: null })).toEqual({ assignees: [] });
    expect(mapTaskToPlaneUpdateBody({ assigneeIds: ["user_plane_user-002"] })).toEqual({
      assignees: ["user-002"],
    });

    expect(mapTaskToPlaneUpdateBody({ description: "Updated" })).toEqual({
      description_html: "Updated",
    });
    expect(mapTaskToPlaneUpdateBody({ estimate: {} })).toEqual({
      estimate_point: null,
    });
  });

  it("prefers assigneeIds over assigneeId on create", () => {
    const body = mapTaskToPlaneCreateBody({
      title: "A",
      assigneeId: "user_plane_ignored",
      assigneeIds: ["user_plane_user-009"],
    });
    expect(body.assignees).toEqual(["user-009"]);
  });
});

describe("priority and state helpers", () => {
  it("round-trips known priorities and maps unknown to none", () => {
    expect(mapPriorityToPlane("high")).toBe("high");
    expect(mapPlanePriorityToCanonical("HIGH")).toBe("high");
    expect(mapPlanePriorityToCanonical("nope")).toBe("none");
    expect(mapPlanePriorityToCanonical(null)).toBe("none");
  });

  it("maps Plane state groups to canonical TaskStatus", () => {
    expect(mapStateGroupToTaskStatus("backlog")).toBe("open");
    expect(mapStateGroupToTaskStatus("started")).toBe("in_progress");
    expect(mapStateGroupToTaskStatus("completed")).toBe("done");
    expect(mapStateGroupToTaskStatus("cancelled")).toBe("cancelled");
    expect(mapStateGroupToTaskStatus("blocked")).toBe("blocked");
    expect(mapStateGroupToTaskStatus("unknown-group")).toBe("open");
    expect(mapStateGroupToTaskStatus(undefined)).toBe("open");
  });
});

describe("ID resolution", () => {
  it("extracts provider-native IDs from provisional prefixes", () => {
    expect(resolveProjectPlaneId("proj_plane_proj-001")).toBe("proj-001");
    expect(resolveProjectPlaneId("proj-001")).toBe("proj-001");
    expect(resolveTaskPlaneId("task_plane_issue-001")).toBe("issue-001");
    expect(resolveTaskPlaneId("issue-001")).toBe("issue-001");
  });
});

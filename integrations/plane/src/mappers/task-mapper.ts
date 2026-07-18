import type {
  CreateTaskInput,
  Estimate,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from "@apzhub/platform-service-contracts";
import {
  createBidirectionalEnumMapper,
  createEnumMapper,
} from "@apzhub/integration-sdk/mapping";

import type { PlaneIssueRecord } from "../internal/plane-api-types";
import {
  extractPlaneId,
  extractProjectPlaneId,
  extractTaskPlaneId,
  toLabelId,
  toModuleId,
  toProjectId,
  toSprintId,
  toStatusId,
  toTaskId,
  toUserId,
} from "./mapper-context";

const priorityEnums = createBidirectionalEnumMapper<TaskPriority>({
  toCanonical: {
    none: "none",
    low: "low",
    medium: "medium",
    high: "high",
    urgent: "urgent",
  },
  toProvider: {
    none: "none",
    low: "low",
    medium: "medium",
    high: "high",
    urgent: "urgent",
  },
  unknownPolicy: "fallback",
  fallback: "none",
});

const stateGroupMapper = createEnumMapper<TaskStatus>({
  map: {
    backlog: "open",
    unstarted: "open",
    started: "in_progress",
    completed: "done",
    cancelled: "cancelled",
    todo: "open",
    in_progress: "in_progress",
    done: "done",
    blocked: "blocked",
  },
  unknownPolicy: "fallback",
  fallback: "open",
});

function asIdList(
  value: readonly string[] | readonly { readonly id: string }[] | undefined | null,
): string[] {
  if (!value) {
    return [];
  }
  return value
    .map((entry) => (typeof entry === "string" ? entry : entry?.id))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

function resolveStateId(state: PlaneIssueRecord["state"]): {
  readonly statusId: string;
  readonly group?: string;
} {
  if (!state) {
    return { statusId: "unknown" };
  }
  if (typeof state === "string") {
    return { statusId: state };
  }
  return { statusId: state.id, group: state.group };
}

function mapPriority(value: string | null | undefined): TaskPriority {
  if (!value) {
    return "none";
  }
  return priorityEnums.toCanonical.map(value);
}

function mapStatusFromGroup(group: string | undefined): TaskStatus {
  if (!group) {
    return "open";
  }
  return stateGroupMapper.map(group);
}

function mapEstimate(points: number | null | undefined): Estimate | undefined {
  if (points === null || points === undefined || Number.isNaN(points)) {
    return undefined;
  }
  return { points };
}

function descriptionFromRecord(record: PlaneIssueRecord): string | undefined {
  const value =
    record.description_stripped ??
    record.description ??
    (typeof record.description_html === "string"
      ? record.description_html.replace(/<[^>]+>/g, "").trim()
      : undefined);
  return value && value.length > 0 ? value : undefined;
}

/**
 * Map Plane issue → canonical Task.
 * Uses provisional `task_plane_*` IDs at the adapter boundary (not APZHUB global IDs).
 */
export function mapPlaneIssue(
  record: PlaneIssueRecord,
  projectId: string,
  options: { readonly stateGroup?: string } = {},
): Task {
  const { statusId, group } = resolveStateId(record.state);
  const assigneePlaneIds = asIdList(record.assignees);
  const labelPlaneIds = asIdList(record.labels);
  const primaryAssignee = assigneePlaneIds[0];
  const additionalAssignees = assigneePlaneIds.slice(1).map(toUserId);

  return {
    id: toTaskId(record.id),
    projectId: projectId.startsWith("proj_") ? projectId : toProjectId(projectId),
    title: record.name,
    description: descriptionFromRecord(record),
    statusId: toStatusId(statusId),
    status: mapStatusFromGroup(options.stateGroup ?? group),
    priority: mapPriority(record.priority),
    assigneeId: primaryAssignee ? toUserId(primaryAssignee) : undefined,
    assigneeIds: additionalAssignees.length > 0 ? additionalAssignees : undefined,
    labelIds: labelPlaneIds.map(toLabelId),
    sprintId: typeof record.cycle === "string" ? toSprintId(record.cycle) : undefined,
    projectModuleId:
      typeof record.module === "string" ? toModuleId(record.module) : undefined,
    parentTaskId:
      typeof record.parent === "string" ? toTaskId(record.parent) : undefined,
    startDate: record.start_date ?? undefined,
    dueDate: record.target_date ?? undefined,
    estimate: mapEstimate(record.estimate_point),
    rank: record.sort_order ?? undefined,
    archivedAt: record.archived_at ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapTaskToPlaneCreateBody(
  input: CreateTaskInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.title,
  };

  if (input.description !== undefined) {
    body.description_html = input.description;
  }
  if (input.statusId !== undefined) {
    body.state = extractPlaneId(input.statusId, "status");
  }
  if (input.priority !== undefined) {
    body.priority = priorityEnums.toProvider(input.priority);
  }

  const assignees = resolveAssigneePlaneIds(input.assigneeId, input.assigneeIds);
  if (assignees.length > 0) {
    body.assignees = assignees;
  }

  if (input.labelIds !== undefined) {
    body.labels = input.labelIds.map((id) => extractPlaneId(id, "label"));
  }
  if (input.sprintId !== undefined) {
    body.cycle = extractPlaneId(input.sprintId, "sprint");
  }
  if (input.projectModuleId !== undefined) {
    body.module = extractPlaneId(input.projectModuleId, "module");
  }
  if (input.parentTaskId !== undefined) {
    body.parent = extractTaskPlaneId(input.parentTaskId);
  }
  if (input.startDate !== undefined) {
    body.start_date = input.startDate;
  }
  if (input.dueDate !== undefined) {
    body.target_date = input.dueDate;
  }
  if (input.estimate?.points !== undefined) {
    body.estimate_point = input.estimate.points;
  }

  return body;
}

/** Partial update — only explicitly supplied fields. */
export function mapTaskToPlaneUpdateBody(
  input: UpdateTaskInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.title !== undefined) body.name = input.title;
  if (input.description !== undefined) body.description_html = input.description;
  if (input.statusId !== undefined)
    body.state = extractPlaneId(input.statusId, "status");
  if (input.priority !== undefined)
    body.priority = priorityEnums.toProvider(input.priority);

  if (input.assigneeIds !== undefined) {
    body.assignees =
      input.assigneeIds === null
        ? []
        : input.assigneeIds.map((id) => extractPlaneId(id, "user"));
  } else if (input.assigneeId !== undefined) {
    body.assignees =
      input.assigneeId === null ? [] : [extractPlaneId(input.assigneeId, "user")];
  }

  if (input.labelIds !== undefined) {
    body.labels = input.labelIds.map((id) => extractPlaneId(id, "label"));
  }
  if (input.sprintId !== undefined) {
    body.cycle =
      input.sprintId === null ? null : extractPlaneId(input.sprintId, "sprint");
  }
  if (input.projectModuleId !== undefined) {
    body.module =
      input.projectModuleId === null
        ? null
        : extractPlaneId(input.projectModuleId, "module");
  }
  if (input.parentTaskId !== undefined) {
    body.parent =
      input.parentTaskId === null ? null : extractTaskPlaneId(input.parentTaskId);
  }
  if (input.startDate !== undefined) {
    body.start_date = input.startDate;
  }
  if (input.dueDate !== undefined) {
    body.target_date = input.dueDate;
  }
  if (input.estimate !== undefined) {
    body.estimate_point =
      input.estimate === null ? null : (input.estimate.points ?? null);
  }

  return body;
}

function resolveAssigneePlaneIds(
  assigneeId: string | undefined,
  assigneeIds: readonly string[] | undefined,
): string[] {
  if (assigneeIds && assigneeIds.length > 0) {
    return assigneeIds.map((id) => extractPlaneId(id, "user"));
  }
  if (assigneeId) {
    return [extractPlaneId(assigneeId, "user")];
  }
  return [];
}

export function resolveProjectPlaneId(projectId: string): string {
  return extractProjectPlaneId(projectId);
}

export function resolveTaskPlaneId(taskId: string): string {
  return extractTaskPlaneId(taskId);
}

export function mapPriorityToPlane(priority: TaskPriority): string {
  return priorityEnums.toProvider(priority);
}

export function mapPlanePriorityToCanonical(
  value: string | null | undefined,
): TaskPriority {
  return mapPriority(value);
}

export function mapStateGroupToTaskStatus(group: string | undefined): TaskStatus {
  return mapStatusFromGroup(group);
}

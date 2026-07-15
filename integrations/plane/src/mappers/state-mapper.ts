import type { ProjectStatusEntity, StatusGroup } from "../models/canonical";
import type { PlaneStateRecord } from "../internal/plane-api-types";
import { extractProjectPlaneId, toProjectId, toStatusId } from "./mapper-context";

const PLANE_GROUP_MAP: Readonly<Record<string, StatusGroup>> = {
  backlog: "todo",
  unstarted: "todo",
  started: "in_progress",
  completed: "done",
  cancelled: "cancelled",
};

export function mapPlaneState(record: PlaneStateRecord, projectId: string): ProjectStatusEntity {
  return {
    id: toStatusId(record.id),
    projectId: projectId.startsWith("proj_") ? projectId : toProjectId(projectId),
    name: record.name,
    group: PLANE_GROUP_MAP[record.group] ?? "todo",
    order: record.sequence ?? 0,
    color: record.color,
  };
}

export function mapStateToPlaneBody(input: {
  readonly name?: string;
  readonly group?: string;
  readonly color?: string;
  readonly order?: number;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.group !== undefined) body.group = input.group;
  if (input.color !== undefined) body.color = input.color;
  if (input.order !== undefined) body.sequence = input.order;
  return body;
}

export function resolveProjectPlaneId(projectId: string): string {
  return extractProjectPlaneId(projectId);
}

import type { Label } from "../models/canonical";
import type { PlaneLabelRecord } from "../internal/plane-api-types";
import { toLabelId, toProjectId, extractProjectPlaneId } from "./mapper-context";

export function mapPlaneLabel(record: PlaneLabelRecord, projectId: string): Label {
  return {
    id: toLabelId(record.id),
    projectId: projectId.startsWith("proj_") ? projectId : toProjectId(projectId),
    name: record.name,
    color: record.color,
  };
}

export function mapLabelToPlaneBody(input: {
  readonly name?: string;
  readonly color?: string;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.color !== undefined) body.color = input.color;
  return body;
}

export function resolveProjectPlaneId(projectId: string): string {
  return extractProjectPlaneId(projectId);
}

import type { ProjectModule } from "../models/canonical";
import type { PlaneModuleRecord } from "../internal/plane-api-types";
import { toModuleId, toProjectId, extractProjectPlaneId } from "./mapper-context";

function mapModuleStatus(status?: string): ProjectModule["status"] {
  switch (status) {
    case "in-progress":
    case "in_progress":
      return "in_progress";
    case "paused":
      return "paused";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "planned";
  }
}

export function mapPlaneModule(
  record: PlaneModuleRecord,
  projectId: string,
): ProjectModule {
  const now = new Date().toISOString();
  return {
    id: toModuleId(record.id),
    projectId: projectId.startsWith("proj_") ? projectId : toProjectId(projectId),
    name: record.name,
    description: record.description,
    status: mapModuleStatus(record.status),
    startDate: record.start_date ?? undefined,
    targetDate: record.target_date ?? undefined,
    createdAt: record.created_at ?? now,
    updatedAt: record.updated_at ?? now,
  };
}

export function mapModuleToPlaneBody(input: {
  readonly name?: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly targetDate?: string;
  readonly status?: ProjectModule["status"];
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.description !== undefined) body.description = input.description;
  if (input.startDate !== undefined) body.start_date = input.startDate;
  if (input.targetDate !== undefined) body.target_date = input.targetDate;
  if (input.status !== undefined) {
    body.status = input.status === "in_progress" ? "in-progress" : input.status;
  }
  return body;
}

export function resolveProjectPlaneId(projectId: string): string {
  return extractProjectPlaneId(projectId);
}

import type { Sprint, SprintStatus } from "../models/canonical";
import type { PlaneCycleRecord } from "../internal/plane-api-types";
import { toProjectId, toSprintId, extractProjectPlaneId } from "./mapper-context";

function mapCycleStatus(record: PlaneCycleRecord): SprintStatus {
  if (record.status === "completed") return "completed";
  if (record.status === "current" || record.status === "active") return "active";
  if (record.status === "cancelled") return "cancelled";
  return "planned";
}

export function mapPlaneCycle(record: PlaneCycleRecord, projectId: string): Sprint {
  const now = new Date().toISOString();
  return {
    id: toSprintId(record.id),
    projectId: projectId.startsWith("proj_") ? projectId : toProjectId(projectId),
    name: record.name,
    goal: record.description,
    status: mapCycleStatus(record),
    startDate: record.start_date ?? undefined,
    endDate: record.end_date ?? undefined,
    createdAt: record.created_at ?? now,
    updatedAt: record.updated_at ?? now,
  };
}

export function mapCycleToPlaneBody(input: {
  readonly name?: string;
  readonly goal?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly status?: SprintStatus;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.goal !== undefined) body.description = input.goal;
  if (input.startDate !== undefined) body.start_date = input.startDate;
  if (input.endDate !== undefined) body.end_date = input.endDate;
  if (input.status !== undefined) {
    body.status =
      input.status === "active"
        ? "current"
        : input.status === "completed"
          ? "completed"
          : input.status === "cancelled"
            ? "cancelled"
            : "upcoming";
  }
  return body;
}

export function resolveProjectPlaneId(projectId: string): string {
  return extractProjectPlaneId(projectId);
}

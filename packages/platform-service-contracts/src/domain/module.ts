import type { ProjectId, ProjectModuleId } from "./identifiers";

export type ProjectModuleStatus =
  "planned" | "in_progress" | "paused" | "completed" | "cancelled";

export interface ProjectModule {
  readonly id: ProjectModuleId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly status: ProjectModuleStatus;
  readonly startDate?: string;
  readonly targetDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

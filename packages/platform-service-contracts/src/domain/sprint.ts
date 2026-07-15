import type { ProjectId, SprintId } from "./identifiers";

export type SprintStatus = "planned" | "active" | "completed" | "cancelled";

export interface Sprint {
  readonly id: SprintId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly goal?: string;
  readonly status: SprintStatus;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

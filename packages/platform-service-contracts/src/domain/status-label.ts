import type { LabelId, ProjectId, StatusId } from "./identifiers";

export type StatusGroup = "todo" | "in_progress" | "done" | "cancelled";

export interface ProjectStatusEntity {
  readonly id: StatusId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly group: StatusGroup;
  readonly order: number;
  readonly color?: string;
}

/** Alias for workflow status in task operations. */
export type Status = ProjectStatusEntity;

export interface Label {
  readonly id: LabelId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly color?: string;
}

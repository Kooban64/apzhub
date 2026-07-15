import type {
  LabelId,
  MilestoneId,
  ProjectId,
  ProjectModuleId,
  SprintId,
  StatusId,
  TaskId,
  UserId,
} from "./identifiers";

export type TaskStatus = "open" | "in_progress" | "blocked" | "done" | "cancelled";
export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface Estimate {
  readonly points?: number;
  readonly minutes?: number;
}

export interface Task {
  readonly id: TaskId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly statusId: StatusId;
  readonly priority: TaskPriority;
  readonly assigneeId?: UserId;
  /** Additional assignees when the engine supports multi-assignee (beyond primary). */
  readonly assigneeIds?: readonly UserId[];
  readonly sprintId?: SprintId;
  readonly milestoneId?: MilestoneId;
  readonly projectModuleId?: ProjectModuleId;
  readonly parentTaskId?: TaskId;
  readonly estimate?: Estimate;
  readonly rank?: number;
  readonly labelIds: readonly LabelId[];
  readonly startDate?: string;
  readonly dueDate?: string;
  readonly archivedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TaskSummary {
  readonly id: TaskId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly status: TaskStatus;
  readonly assigneeId?: UserId;
}

export interface Backlog {
  readonly projectId: ProjectId;
  readonly tasks: readonly Task[];
}

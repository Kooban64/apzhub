import type {
  ActivityId,
  AttachmentId,
  CommentId,
  ProjectId,
  SprintId,
  StatusId,
  TaskId,
  UserId,
  WatcherId,
} from "./identifiers";
import type { TaskPriority, TaskStatus } from "./task";

export interface Comment {
  readonly id: CommentId;
  readonly taskId: TaskId;
  readonly authorId: UserId;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Attachment {
  readonly id: AttachmentId;
  readonly taskId: TaskId;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly url?: string;
  readonly createdAt: string;
}

export interface ActivityEntry {
  readonly id: ActivityId;
  readonly projectId: ProjectId;
  readonly taskId?: TaskId;
  readonly actorId: UserId;
  readonly action: string;
  readonly summary: string;
  readonly occurredAt: string;
}

export interface ActivityPage {
  readonly items: readonly ActivityEntry[];
  readonly nextCursor?: string;
  readonly hasNextPage: boolean;
}

/** User watching a task for collaboration updates (Plane: issue subscriber). */
export interface Watcher {
  readonly id: WatcherId;
  readonly taskId: TaskId;
  readonly userId: UserId;
  readonly createdAt: string;
}

export interface DistributionBucket {
  readonly key: string;
  readonly label?: string;
  readonly count: number;
}

export interface MemberWorkloadSummary {
  readonly userId: UserId;
  readonly openTaskCount: number;
  readonly completedTaskCount: number;
  readonly overdueTaskCount: number;
  readonly blockedTaskCount: number;
}

/** Project-level progress and distribution intelligence (read-only). */
export interface ProjectStatistics {
  readonly projectId: ProjectId;
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly openTasks: number;
  readonly overdueTasks: number;
  readonly blockedTasks: number;
  readonly completionPercent: number;
  readonly stateDistribution: readonly DistributionBucket[];
  readonly priorityDistribution: readonly DistributionBucket[];
  readonly memberWorkloads: readonly MemberWorkloadSummary[];
  readonly capturedAt: string;
}

/** Task-level rollup metrics (read-only). */
export interface TaskStatistics {
  readonly taskId: TaskId;
  readonly projectId: ProjectId;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly isOverdue: boolean;
  readonly isBlocked: boolean;
  readonly commentCount?: number;
  readonly watcherCount?: number;
  readonly capturedAt: string;
}

/** Sprint/cycle velocity snapshot (read-only). */
export interface VelocitySnapshot {
  readonly projectId: ProjectId;
  readonly sprintId: SprintId;
  readonly completedPoints: number;
  readonly committedPoints: number;
  readonly completedTaskCount: number;
  readonly committedTaskCount: number;
  readonly velocity: number;
  readonly capturedAt: string;
}

export interface BurndownPoint {
  readonly date: string;
  readonly remainingPoints: number;
  readonly remainingTasks: number;
  readonly idealRemainingPoints?: number;
}

/** Sprint/cycle burn-down snapshot (read-only). */
export interface BurndownSnapshot {
  readonly projectId: ProjectId;
  readonly sprintId: SprintId;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly totalPoints: number;
  readonly remainingPoints: number;
  readonly completionPercent: number;
  readonly points: readonly BurndownPoint[];
  readonly capturedAt: string;
}

/** Cycle/sprint progress summary (read-only). */
export interface CycleProgressSnapshot {
  readonly projectId: ProjectId;
  readonly sprintId: SprintId;
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly completionPercent: number;
  readonly statusDistribution: readonly DistributionBucket[];
  readonly capturedAt: string;
}

export type { StatusId };

/** Projects Workbench view models — Platform API shapes only. */

export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "archived";

export type TaskStatus = "open" | "in_progress" | "blocked" | "done" | "cancelled";

export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface Project {
  readonly id: string;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly status: ProjectStatus;
  readonly leadId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Task {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly statusId: string;
  readonly priority: TaskPriority;
  readonly assigneeId?: string;
  readonly assigneeIds?: readonly string[];
  readonly sprintId?: string;
  readonly labelIds: readonly string[];
  readonly startDate?: string;
  readonly dueDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkspaceSummary {
  readonly id: string;
  readonly name: string;
}

export interface ProjectsPaginationParams {
  readonly page?: number;
  readonly perPage?: number;
  readonly limit?: number;
  readonly cursor?: string;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
}

export interface ProjectListParams extends ProjectsPaginationParams {
  readonly status?: "active" | "archived" | "all";
  readonly workspaceId?: string;
}

export interface TaskListParams extends ProjectsPaginationParams {
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly assigneeId?: string;
  readonly sprintId?: string;
  readonly priority?: TaskPriority;
  readonly search?: string;
}

export interface CreateProjectInput {
  readonly workspaceId: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly leadId?: string;
}

export interface CreateTaskInput {
  readonly projectId: string;
  readonly title: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly assigneeId?: string;
}

export interface UpdateTaskInput {
  readonly title?: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly statusId?: string;
  readonly assigneeId?: string | null;
  readonly sprintId?: string | null;
  readonly startDate?: string | null;
  readonly dueDate?: string | null;
}

export interface TransitionTaskInput {
  readonly statusId: string;
}

export interface AssignTaskInput {
  readonly assigneeId: string;
  readonly assigneeIds?: readonly string[];
}

export interface UpdateProjectInput {
  readonly name?: string;
  readonly identifier?: string;
  readonly description?: string;
  readonly status?: ProjectStatus;
  readonly leadId?: string;
}

export interface ProjectsCollectionResult<T> {
  readonly items: readonly T[];
  readonly page?: {
    readonly page?: number;
    readonly perPage?: number;
    readonly limit?: number;
    readonly hasMore?: boolean;
    readonly cursor?: string | null;
    readonly nextCursor?: string | null;
  };
}

export interface ProjectsHealthSnapshot {
  readonly status: string;
  readonly version?: string;
  readonly checks?: Record<string, string>;
  readonly details?: Record<string, string>;
}

export interface ProjectsApiRequestOptions {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
}

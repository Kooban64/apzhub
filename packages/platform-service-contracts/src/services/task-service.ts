import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { Attachment, Backlog, Comment, Task } from "../domain";
import type {
  AddCommentInput,
  AssignTaskInput,
  AssignTasksToSprintInput,
  CreateTaskInput,
  ReorderBacklogInput,
  TransitionTaskStatusInput,
  UpdateTaskInput,
} from "../inputs";
import type { TaskListFilter, TaskSortField } from "../queries";
import type { ProjectId, SprintId, TaskId } from "../domain/identifiers";

/** Vendor-neutral task and backlog operations. */
export interface TaskService {
  listTasks(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<TaskListFilter, TaskSortField>,
  ): Promise<PageResult<Task>>;

  getTask(ctx: ServiceRequestContext, taskId: TaskId): Promise<Task>;

  createTask(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateTaskInput,
  ): Promise<Task>;

  updateTask(
    ctx: ServiceRequestContext,
    taskId: TaskId,
    input: UpdateTaskInput,
  ): Promise<Task>;

  /** Soft-archive where the provider supports archival semantics. */
  archiveTask(ctx: ServiceRequestContext, taskId: TaskId): Promise<Task>;

  transitionTaskStatus(
    ctx: ServiceRequestContext,
    taskId: TaskId,
    input: TransitionTaskStatusInput,
  ): Promise<Task>;

  assignTask(
    ctx: ServiceRequestContext,
    taskId: TaskId,
    input: AssignTaskInput,
  ): Promise<Task>;

  getBacklog(ctx: ServiceRequestContext, projectId: ProjectId): Promise<Backlog>;

  reorderBacklog(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: ReorderBacklogInput,
  ): Promise<Backlog>;

  assignTasksToSprint(
    ctx: ServiceRequestContext,
    sprintId: SprintId,
    input: AssignTasksToSprintInput,
  ): Promise<void>;

  listMyTasks(
    ctx: ServiceRequestContext,
    query?: ListQuery<TaskListFilter, TaskSortField>,
  ): Promise<PageResult<Task>>;

  listComments(ctx: ServiceRequestContext, taskId: TaskId): Promise<readonly Comment[]>;

  addComment(
    ctx: ServiceRequestContext,
    taskId: TaskId,
    input: AddCommentInput,
  ): Promise<Comment>;

  listAttachments(
    ctx: ServiceRequestContext,
    taskId: TaskId,
  ): Promise<readonly Attachment[]>;
}

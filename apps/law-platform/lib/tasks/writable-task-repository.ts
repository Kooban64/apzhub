import type { ManagedTask, TaskListCriteria } from "./task-types";

/** Writable in-memory task repository — session scoped, no persistence (LAW-005-01). */
export interface WritableTaskRepository {
  list(criteria?: TaskListCriteria): readonly ManagedTask[];
  getById(taskId: string): ManagedTask | undefined;
  create(task: ManagedTask): ManagedTask;
  update(taskId: string, task: ManagedTask): ManagedTask | undefined;
  softArchive(taskId: string): ManagedTask | undefined;
  count(includeArchived?: boolean): number;
  isSoftArchived(taskId: string): boolean;
}

import type { ManagedTask, TaskListCriteria } from "./task-types";
import { matchesTaskCriteria, sortTasksByTitle } from "./task-repository-filters";
import type { WritableTaskRepository } from "./writable-task-repository";
import { SEED_TASKS } from "./seed-tasks";

/** In-memory writable task repository with soft archive (LAW-005-01). */
export class InMemoryTaskRepository implements WritableTaskRepository {
  private readonly tasks: Map<string, ManagedTask>;
  private readonly softArchivedIds = new Set<string>();

  constructor(seed: readonly ManagedTask[] = SEED_TASKS) {
    this.tasks = new Map(seed.map((task) => [task.taskId, task]));
  }

  list(criteria?: TaskListCriteria): readonly ManagedTask[] {
    return sortTasksByTitle(
      [...this.tasks.values()]
        .filter((task) => !this.softArchivedIds.has(task.taskId))
        .filter((task) => matchesTaskCriteria(task, criteria)),
    );
  }

  getById(taskId: string): ManagedTask | undefined {
    if (this.softArchivedIds.has(taskId)) {
      return undefined;
    }

    return this.tasks.get(taskId);
  }

  create(task: ManagedTask): ManagedTask {
    this.tasks.set(task.taskId, task);
    this.softArchivedIds.delete(task.taskId);
    return task;
  }

  update(taskId: string, task: ManagedTask): ManagedTask | undefined {
    if (!this.tasks.has(taskId) || this.softArchivedIds.has(taskId)) {
      return undefined;
    }

    this.tasks.set(taskId, task);
    return task;
  }

  softArchive(taskId: string): ManagedTask | undefined {
    const existing = this.tasks.get(taskId);
    if (!existing || this.softArchivedIds.has(taskId)) {
      return undefined;
    }

    const archived: ManagedTask = {
      ...existing,
      taskStatus: "cancelled",
    };

    this.tasks.set(taskId, archived);
    this.softArchivedIds.add(taskId);
    return archived;
  }

  count(includeArchived = false): number {
    if (includeArchived) {
      return this.tasks.size;
    }

    return [...this.tasks.keys()].filter((taskId) => !this.softArchivedIds.has(taskId))
      .length;
  }

  isSoftArchived(taskId: string): boolean {
    return this.softArchivedIds.has(taskId);
  }
}

/** Client-safe memory singleton — must not import repository-factory (pulls pg). */
let sharedTaskRepository: InMemoryTaskRepository | undefined;

export function getSharedTaskRepository(): InMemoryTaskRepository {
  sharedTaskRepository ??= new InMemoryTaskRepository();
  return sharedTaskRepository;
}

export function resetSharedTaskRepository(): void {
  sharedTaskRepository = undefined;
}

import { describe, expect, it } from "vitest";
import { TaskFactory } from "@apzhub/legal-business-core";

import type { WritableTaskRepository } from "./writable-task-repository";
import type { ManagedTask } from "./task-types";
import { InMemoryTaskRepository } from "./in-memory-task-repository";
import { SEED_TASKS } from "./seed-tasks";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_DOCUMENTS } from "../documents/seed-documents";
import { SEED_TASK_ASSIGNEES } from "./seed-assignees";

export function registerWritableTaskRepositoryContract(
  label: string,
  createRepository: () => WritableTaskRepository,
  options?: { readonly seedCount?: number },
): void {
  describe(`${label} — writable task repository contract`, () => {
    it("lists and retrieves seeded tasks", () => {
      const repository = createRepository();
      const expectedCount = options?.seedCount ?? 32;

      expect(repository.count()).toBe(expectedCount);
      expect(repository.list()).toHaveLength(expectedCount);
      expect(repository.getById(SEED_TASKS[0]!.taskId)).toEqual(SEED_TASKS[0]);
    });

    it("filters tasks by query, status, and matter", () => {
      const repository = createRepository();

      expect(repository.list({ query: "Draft statement" })).toHaveLength(1);
      expect(repository.list({ taskStatus: "in_progress" }).length).toBeGreaterThan(0);
      expect(
        repository.list({ matterId: SEED_MATTERS[0]!.matterId }).length,
      ).toBeGreaterThan(0);
      expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
    });

    it("creates, updates, and soft archives tasks", () => {
      const repository = createRepository();
      const matter = SEED_MATTERS[0]!;
      const createdBase = TaskFactory.create({
        title: "Contract Test Task",
        assigneeUserId: SEED_TASK_ASSIGNEES[0]!.assigneeUserId,
        matterId: matter.matterId,
        clientId: matter.clientId,
      });

      const created: ManagedTask = {
        ...createdBase,
        createdAt: new Date().toISOString(),
      };

      repository.create(created);
      expect(repository.getById(created.taskId)?.title).toBe("Contract Test Task");

      const updated = repository.update(created.taskId, {
        ...created,
        title: "Updated Contract Task",
      });
      expect(updated?.title).toBe("Updated Contract Task");

      const archived = repository.softArchive(created.taskId);
      expect(archived?.taskStatus).toBe("cancelled");
      expect(repository.getById(created.taskId)).toBeUndefined();
      expect(repository.isSoftArchived(created.taskId)).toBe(true);
    });
  });
}

registerWritableTaskRepositoryContract(
  "InMemoryTaskRepository",
  () => new InMemoryTaskRepository(),
);

describe("InMemoryTaskRepository — document relationship", () => {
  it("stores optional document link on tasks", () => {
    const repository = new InMemoryTaskRepository();
    const matter = SEED_MATTERS[0]!;
    const document = SEED_DOCUMENTS[0]!;
    const createdBase = TaskFactory.create({
      title: "Linked Task",
      assigneeUserId: SEED_TASK_ASSIGNEES[0]!.assigneeUserId,
      matterId: matter.matterId,
    });

    const task: ManagedTask = {
      ...createdBase,
      documentId: document.documentId,
      createdAt: new Date().toISOString(),
    };

    repository.create(task);
    expect(repository.getById(task.taskId)?.documentId).toBe(document.documentId);
  });
});

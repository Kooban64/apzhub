import type { Task } from "../domain";
import { ReferenceNumberGenerator } from "../reference";
import { createEntityId } from "./id";

export interface TaskFactoryInput {
  readonly title: string;
  readonly assigneeUserId: string;
  readonly taskReference?: string;
  readonly matterId?: string;
  readonly clientId?: string;
}

const defaultReferenceGenerator = new ReferenceNumberGenerator();

export const TaskFactory = {
  create(input: TaskFactoryInput): Task {
    return {
      taskId: createEntityId("t"),
      taskReference:
        input.taskReference ?? defaultReferenceGenerator.nextTaskReference(),
      title: input.title.trim(),
      taskStatus: "not_started",
      taskPriority: "normal",
      assigneeUserId: input.assigneeUserId,
      matterId: input.matterId,
      clientId: input.clientId,
      tags: [],
    };
  },
};

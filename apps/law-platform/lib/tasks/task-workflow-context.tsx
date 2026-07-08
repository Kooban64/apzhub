"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedTaskRepository } from "./in-memory-task-repository";
import { TaskWorkflowService } from "./task-workflow-service";

const TaskWorkflowContext = createContext<TaskWorkflowService | null>(null);

export interface TaskWorkflowProviderProps {
  readonly service?: TaskWorkflowService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

export function TaskWorkflowProvider({
  service,
  eventBus,
  actorId,
  children,
}: TaskWorkflowProviderProps) {
  const resolved = useMemo(
    () =>
      service ??
      new TaskWorkflowService({
        repository: getSharedTaskRepository(),
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [service, eventBus, actorId],
  );

  return (
    <TaskWorkflowContext.Provider value={resolved}>
      {children}
    </TaskWorkflowContext.Provider>
  );
}

export function useTaskWorkflow(): TaskWorkflowService {
  const service = useContext(TaskWorkflowContext);
  if (!service) {
    throw new Error("useTaskWorkflow must be used within TaskWorkflowProvider");
  }

  return service;
}

export function useOptionalTaskWorkflow(): TaskWorkflowService | null {
  return useContext(TaskWorkflowContext);
}

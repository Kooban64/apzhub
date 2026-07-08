"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedTimeEntryRepository } from "./in-memory-time-entry-repository";
import { TimeEntryWorkflowService } from "./time-entry-workflow-service";

const TimeEntryWorkflowContext = createContext<TimeEntryWorkflowService | null>(null);

export interface TimeEntryWorkflowProviderProps {
  readonly service?: TimeEntryWorkflowService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

export function TimeEntryWorkflowProvider({
  service,
  eventBus,
  actorId,
  children,
}: TimeEntryWorkflowProviderProps) {
  const resolved = useMemo(
    () =>
      service ??
      new TimeEntryWorkflowService({
        repository: getSharedTimeEntryRepository(),
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [service, eventBus, actorId],
  );

  return (
    <TimeEntryWorkflowContext.Provider value={resolved}>
      {children}
    </TimeEntryWorkflowContext.Provider>
  );
}

export function useTimeEntryWorkflow(): TimeEntryWorkflowService {
  const service = useContext(TimeEntryWorkflowContext);
  if (!service) {
    throw new Error(
      "useTimeEntryWorkflow must be used within TimeEntryWorkflowProvider",
    );
  }

  return service;
}

export function useOptionalTimeEntryWorkflow(): TimeEntryWorkflowService | null {
  return useContext(TimeEntryWorkflowContext);
}

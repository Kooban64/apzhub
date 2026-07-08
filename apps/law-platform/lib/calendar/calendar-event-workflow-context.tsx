"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedCalendarEventRepository } from "./in-memory-calendar-event-repository";
import { CalendarEventWorkflowService } from "./calendar-event-workflow-service";

const CalendarEventWorkflowContext = createContext<CalendarEventWorkflowService | null>(
  null,
);

export interface CalendarEventWorkflowProviderProps {
  readonly service?: CalendarEventWorkflowService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

export function CalendarEventWorkflowProvider({
  service,
  eventBus,
  actorId,
  children,
}: CalendarEventWorkflowProviderProps) {
  const resolved = useMemo(
    () =>
      service ??
      new CalendarEventWorkflowService({
        repository: getSharedCalendarEventRepository(),
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [service, eventBus, actorId],
  );

  return (
    <CalendarEventWorkflowContext.Provider value={resolved}>
      {children}
    </CalendarEventWorkflowContext.Provider>
  );
}

export function useCalendarEventWorkflow(): CalendarEventWorkflowService {
  const service = useContext(CalendarEventWorkflowContext);
  if (!service) {
    throw new Error(
      "useCalendarEventWorkflow must be used within CalendarEventWorkflowProvider",
    );
  }

  return service;
}

export function useOptionalCalendarEventWorkflow(): CalendarEventWorkflowService | null {
  return useContext(CalendarEventWorkflowContext);
}

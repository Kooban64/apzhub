"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedMatterRepository } from "./in-memory-matter-repository";
import { MatterWorkflowService } from "./matter-workflow-service";

const MatterWorkflowContext = createContext<MatterWorkflowService | null>(null);

export interface MatterWorkflowProviderProps {
  readonly service?: MatterWorkflowService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

export function MatterWorkflowProvider({
  service,
  eventBus,
  actorId,
  children,
}: MatterWorkflowProviderProps) {
  const resolved = useMemo(
    () =>
      service ??
      new MatterWorkflowService({
        repository: getSharedMatterRepository(),
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [service, eventBus, actorId],
  );

  return (
    <MatterWorkflowContext.Provider value={resolved}>
      {children}
    </MatterWorkflowContext.Provider>
  );
}

export function useMatterWorkflow(): MatterWorkflowService {
  const service = useContext(MatterWorkflowContext);
  if (!service) {
    throw new Error("useMatterWorkflow must be used within MatterWorkflowProvider");
  }

  return service;
}

export function useOptionalMatterWorkflow(): MatterWorkflowService | null {
  return useContext(MatterWorkflowContext);
}

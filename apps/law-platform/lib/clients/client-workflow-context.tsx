"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedClientRepository } from "./in-memory-client-repository";
import { ClientWorkflowService } from "./client-workflow-service";

const ClientWorkflowContext = createContext<ClientWorkflowService | null>(null);

export interface ClientWorkflowProviderProps {
  readonly service?: ClientWorkflowService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

export function ClientWorkflowProvider({
  service,
  eventBus,
  actorId,
  children,
}: ClientWorkflowProviderProps) {
  const resolved = useMemo(
    () =>
      service ??
      new ClientWorkflowService({
        repository: getSharedClientRepository(),
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [service, eventBus, actorId],
  );

  return (
    <ClientWorkflowContext.Provider value={resolved}>
      {children}
    </ClientWorkflowContext.Provider>
  );
}

export function useClientWorkflow(): ClientWorkflowService {
  const service = useContext(ClientWorkflowContext);
  if (!service) {
    throw new Error("useClientWorkflow must be used within ClientWorkflowProvider");
  }

  return service;
}

export function useOptionalClientWorkflow(): ClientWorkflowService | null {
  return useContext(ClientWorkflowContext);
}

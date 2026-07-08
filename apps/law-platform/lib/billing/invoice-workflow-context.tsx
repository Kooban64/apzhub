"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedInvoiceRepository } from "./in-memory-invoice-repository";
import { InvoiceWorkflowService } from "./invoice-workflow-service";

const InvoiceWorkflowContext = createContext<InvoiceWorkflowService | null>(null);

export interface InvoiceWorkflowProviderProps {
  readonly service?: InvoiceWorkflowService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

export function InvoiceWorkflowProvider({
  service,
  eventBus,
  actorId,
  children,
}: InvoiceWorkflowProviderProps) {
  const resolved = useMemo(
    () =>
      service ??
      new InvoiceWorkflowService({
        repository: getSharedInvoiceRepository(),
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [service, eventBus, actorId],
  );

  return (
    <InvoiceWorkflowContext.Provider value={resolved}>
      {children}
    </InvoiceWorkflowContext.Provider>
  );
}

export function useInvoiceWorkflow(): InvoiceWorkflowService {
  const service = useContext(InvoiceWorkflowContext);
  if (!service) {
    throw new Error("useInvoiceWorkflow must be used within InvoiceWorkflowProvider");
  }

  return service;
}

"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getSharedDocumentRepository } from "./in-memory-document-repository";
import { DocumentWorkflowService } from "./document-workflow-service";

const DocumentWorkflowContext = createContext<DocumentWorkflowService | null>(null);

export interface DocumentWorkflowProviderProps {
  readonly service?: DocumentWorkflowService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

export function DocumentWorkflowProvider({
  service,
  eventBus,
  actorId,
  children,
}: DocumentWorkflowProviderProps) {
  const resolved = useMemo(
    () =>
      service ??
      new DocumentWorkflowService({
        repository: getSharedDocumentRepository(),
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [service, eventBus, actorId],
  );

  return (
    <DocumentWorkflowContext.Provider value={resolved}>
      {children}
    </DocumentWorkflowContext.Provider>
  );
}

export function useDocumentWorkflow(): DocumentWorkflowService {
  const service = useContext(DocumentWorkflowContext);
  if (!service) {
    throw new Error("useDocumentWorkflow must be used within DocumentWorkflowProvider");
  }

  return service;
}

export function useOptionalDocumentWorkflow(): DocumentWorkflowService | null {
  return useContext(DocumentWorkflowContext);
}

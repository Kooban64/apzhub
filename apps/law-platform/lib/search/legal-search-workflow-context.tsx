"use client";

import type { EventBus } from "@apzhub/event-notification-framework";
import { createPlaceholderEventBus } from "@apzhub/event-notification-framework";
import type { KnowledgeService } from "@apzhub/knowledge-discovery-framework";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { LegalSearchWorkflowService } from "./legal-search-workflow-service";

const LegalSearchWorkflowContext = createContext<LegalSearchWorkflowService | null>(
  null,
);

export interface LegalSearchWorkflowBridgeProps {
  readonly knowledgeService: KnowledgeService;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
  readonly children: ReactNode;
}

/** Bridges Knowledge Service into Legal Search workflow context (LAW-007-01). */
export function LegalSearchWorkflowBridge({
  knowledgeService,
  eventBus,
  actorId,
  children,
}: LegalSearchWorkflowBridgeProps) {
  const service = useMemo(
    () =>
      new LegalSearchWorkflowService({
        knowledgeService,
        eventBus: eventBus ?? createPlaceholderEventBus(),
        actorId,
      }),
    [knowledgeService, eventBus, actorId],
  );

  return (
    <LegalSearchWorkflowContext.Provider value={service}>
      {children}
    </LegalSearchWorkflowContext.Provider>
  );
}

export function useLegalSearchWorkflow(): LegalSearchWorkflowService {
  const service = useContext(LegalSearchWorkflowContext);
  if (!service) {
    throw new Error(
      "useLegalSearchWorkflow must be used within LegalSearchWorkflowBridge",
    );
  }

  return service;
}

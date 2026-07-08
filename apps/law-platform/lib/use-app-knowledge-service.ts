"use client";

import { useMemo } from "react";

import type { EventBus } from "@apzhub/event-notification-framework";
import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import { createAppKnowledgeService } from "./create-app-knowledge-service";
import type { KnowledgeSourceRegistryDto } from "@apzhub/knowledge-discovery-framework/react";
import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

export interface CreateAppKnowledgeServiceOptions {
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly actionDto: ActionRegistryDto;
  readonly workbenchDto: WorkbenchRegistryDto;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
}

export function useAppKnowledgeService(options: CreateAppKnowledgeServiceOptions) {
  return useMemo(
    () =>
      createAppKnowledgeService({
        knowledgeDto: options.knowledgeDto,
        actionDto: options.actionDto,
        workbenchDto: options.workbenchDto,
        eventBus: options.eventBus,
        actorId: options.actorId,
      }),
    [
      options.knowledgeDto,
      options.actionDto,
      options.workbenchDto,
      options.eventBus,
      options.actorId,
    ],
  );
}

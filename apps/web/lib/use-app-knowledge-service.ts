"use client";

import { useMemo } from "react";

import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import { createKnowledgeServiceFromHydration } from "@apzhub/knowledge-discovery-framework/react";
import type { KnowledgeSourceRegistryDto } from "@apzhub/knowledge-discovery-framework/react";
import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

export interface CreateAppKnowledgeServiceOptions {
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly actionDto: ActionRegistryDto;
  readonly workbenchDto: WorkbenchRegistryDto;
}

export function useAppKnowledgeService(options: CreateAppKnowledgeServiceOptions) {
  return useMemo(
    () =>
      createKnowledgeServiceFromHydration({
        knowledgeDto: options.knowledgeDto,
        actionDto: options.actionDto,
        workbenchDto: options.workbenchDto,
      }),
    [options.knowledgeDto, options.actionDto, options.workbenchDto],
  );
}

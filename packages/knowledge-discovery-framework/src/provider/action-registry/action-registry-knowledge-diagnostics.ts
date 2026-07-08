import type { ActionRegistryDto } from "@apzhub/command-framework/server";

import type { KnowledgeResult } from "../../types/knowledge-result";
import type { KnowledgeSource } from "../../types/knowledge-source";
import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "../../catalogue/platform-knowledge-source-catalogue";

export interface ActionRegistryKnowledgeProviderDiagnostics {
  readonly sourceId: string;
  readonly actionCount: number;
  readonly platformActionCount: number;
  readonly manifestActionCount: number;
  readonly paletteActionCount: number;
  readonly documentCount: number;
  readonly durationMs: number;
}

export function buildActionRegistryKnowledgeProviderDiagnostics(
  actionDto: ActionRegistryDto,
  result: KnowledgeResult,
): ActionRegistryKnowledgeProviderDiagnostics {
  const platformActionCount = actionDto.actions.filter(
    (action) => action.source === "builtin",
  ).length;
  const manifestActionCount = actionDto.actions.filter(
    (action) => action.source === "manifest",
  ).length;
  const paletteActionCount = actionDto.actions.filter(
    (action) => action.palette === true,
  ).length;

  return {
    sourceId: result.sourceId,
    actionCount: actionDto.actions.length,
    platformActionCount,
    manifestActionCount,
    paletteActionCount,
    documentCount: result.documents.length,
    durationMs: result.durationMs ?? 0,
  };
}

export function resolvePlatformActionsKnowledgeSource(
  source?: KnowledgeSource,
): KnowledgeSource {
  if (source) {
    return source;
  }

  const platformActions = PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.find(
    (entry) => entry.id === "platform.actions",
  );

  if (!platformActions) {
    throw new Error("Platform actions knowledge source is not defined in catalogue");
  }

  return platformActions;
}

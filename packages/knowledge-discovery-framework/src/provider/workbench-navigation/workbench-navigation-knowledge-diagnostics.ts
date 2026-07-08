import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

import type { KnowledgeResult } from "../../types/knowledge-result";
import type { KnowledgeSource } from "../../types/knowledge-source";
import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "../../catalogue/platform-knowledge-source-catalogue";

export interface WorkbenchNavigationKnowledgeProviderDiagnostics {
  readonly sourceId: string;
  readonly navItemCount: number;
  readonly viewCount: number;
  readonly activityBarCount: number;
  readonly sidebarCount: number;
  readonly workspaceCount: number;
  readonly parentLinkedCount: number;
  readonly skippedHiddenCount: number;
  readonly documentCount: number;
  readonly durationMs: number;
}

export function buildWorkbenchNavigationKnowledgeProviderDiagnostics(
  registryDto: WorkbenchRegistryDto,
  result: KnowledgeResult,
): WorkbenchNavigationKnowledgeProviderDiagnostics {
  const visibleNavItems = registryDto.navItems.filter((item) => item.hidden !== true);

  return {
    sourceId: result.sourceId,
    navItemCount: visibleNavItems.length,
    viewCount: registryDto.views.length,
    activityBarCount: visibleNavItems.filter((item) => item.level === "activity-bar")
      .length,
    sidebarCount: visibleNavItems.filter((item) => item.level === "sidebar").length,
    workspaceCount: new Set([
      ...visibleNavItems.map((item) => item.workspace),
      ...registryDto.views.map((view) => view.workspace),
    ]).size,
    parentLinkedCount: visibleNavItems.filter((item) => item.parent !== undefined)
      .length,
    skippedHiddenCount: registryDto.navItems.length - visibleNavItems.length,
    documentCount: result.documents.length,
    durationMs: result.durationMs ?? 0,
  };
}

export function resolvePlatformNavigationKnowledgeSource(
  source?: KnowledgeSource,
): KnowledgeSource {
  if (source) {
    return source;
  }

  const platformNavigation = PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.find(
    (entry) => entry.id === "platform.navigation",
  );

  if (!platformNavigation) {
    throw new Error("Platform navigation knowledge source is not defined in catalogue");
  }

  return platformNavigation;
}

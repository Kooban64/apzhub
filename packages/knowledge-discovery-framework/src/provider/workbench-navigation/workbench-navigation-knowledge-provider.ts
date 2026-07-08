import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

import type { KnowledgeProvider } from "../knowledge-provider";
import type { KnowledgeContext } from "../../types/knowledge-context";
import type { KnowledgeQuery } from "../../types/knowledge-query";
import type { KnowledgeResult } from "../../types/knowledge-result";
import type { KnowledgeSource } from "../../types/knowledge-source";
import { mapWorkbenchRegistryDtoToKnowledgeDocuments } from "./map-navigation-to-knowledge-document";
import { resolvePlatformNavigationKnowledgeSource } from "./workbench-navigation-knowledge-diagnostics";

export interface WorkbenchNavigationKnowledgeProviderOptions {
  readonly registryDto: WorkbenchRegistryDto;
  readonly source?: KnowledgeSource;
}

/**
 * Projects Workbench registry DTO navigation contributions as KnowledgeDocuments.
 * Does not execute navigation — returns navigation references only.
 */
export class WorkbenchNavigationKnowledgeProvider implements KnowledgeProvider {
  readonly source: KnowledgeSource;
  private readonly registryDto: WorkbenchRegistryDto;

  constructor(options: WorkbenchNavigationKnowledgeProviderOptions) {
    this.source = resolvePlatformNavigationKnowledgeSource(options.source);
    this.registryDto = options.registryDto;
  }

  async query(
    _query: KnowledgeQuery,
    _context: KnowledgeContext,
  ): Promise<KnowledgeResult> {
    const startedAt = performance.now();
    const projection = mapWorkbenchRegistryDtoToKnowledgeDocuments(this.registryDto, {
      sourceId: this.source.id,
    });
    const durationMs = performance.now() - startedAt;

    if (projection.documents.length === 0) {
      return {
        status: "empty",
        sourceId: this.source.id,
        documents: [],
        message: "No navigation items available in Workbench Registry DTO",
        durationMs,
      };
    }

    return {
      status: "ok",
      sourceId: this.source.id,
      documents: projection.documents,
      durationMs,
    };
  }
}

export function createWorkbenchNavigationKnowledgeProvider(
  registryDto: WorkbenchRegistryDto,
  options: { readonly source?: KnowledgeSource } = {},
): WorkbenchNavigationKnowledgeProvider {
  return new WorkbenchNavigationKnowledgeProvider({
    registryDto,
    source: options.source,
  });
}

export function getWorkbenchNavigationProjectionSkippedHiddenCount(
  registryDto: WorkbenchRegistryDto,
): number {
  return registryDto.navItems.filter((item) => item.hidden === true).length;
}

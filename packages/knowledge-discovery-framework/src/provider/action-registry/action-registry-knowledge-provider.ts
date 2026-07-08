import type { ActionRegistryDto } from "@apzhub/command-framework/server";

import type { KnowledgeProvider } from "../knowledge-provider";
import type { KnowledgeContext } from "../../types/knowledge-context";
import type { KnowledgeQuery } from "../../types/knowledge-query";
import type { KnowledgeResult } from "../../types/knowledge-result";
import type { KnowledgeSource } from "../../types/knowledge-source";
import { mapActionRegistryDtoToKnowledgeDocuments } from "./map-action-to-knowledge-document";
import { resolvePlatformActionsKnowledgeSource } from "./action-registry-knowledge-diagnostics";

export interface ActionRegistryKnowledgeProviderOptions {
  readonly actionDto: ActionRegistryDto;
  readonly source?: KnowledgeSource;
}

/**
 * Projects Action Registry DTO entries as KnowledgeDocuments.
 * Does not execute actions — returns actionRef references only.
 */
export class ActionRegistryKnowledgeProvider implements KnowledgeProvider {
  readonly source: KnowledgeSource;
  private readonly actionDto: ActionRegistryDto;

  constructor(options: ActionRegistryKnowledgeProviderOptions) {
    this.source = resolvePlatformActionsKnowledgeSource(options.source);
    this.actionDto = options.actionDto;
  }

  async query(
    _query: KnowledgeQuery,
    _context: KnowledgeContext,
  ): Promise<KnowledgeResult> {
    const startedAt = performance.now();
    const documents = mapActionRegistryDtoToKnowledgeDocuments(this.actionDto.actions, {
      sourceId: this.source.id,
    });
    const durationMs = performance.now() - startedAt;

    if (documents.length === 0) {
      return {
        status: "empty",
        sourceId: this.source.id,
        documents: [],
        message: "No actions available in Action Registry DTO",
        durationMs,
      };
    }

    return {
      status: "ok",
      sourceId: this.source.id,
      documents,
      durationMs,
    };
  }
}

export function createActionRegistryKnowledgeProvider(
  actionDto: ActionRegistryDto,
  options: { readonly source?: KnowledgeSource } = {},
): ActionRegistryKnowledgeProvider {
  return new ActionRegistryKnowledgeProvider({
    actionDto,
    source: options.source,
  });
}

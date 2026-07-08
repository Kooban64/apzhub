import type { KnowledgeProvider } from "../provider/knowledge-provider";
import type { RankingEngine } from "../ranking";
import { createDefaultRankingEngine } from "../ranking";
import type { KnowledgeRegistry } from "../registry/knowledge-registry";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import type { KnowledgeSourceDescriptorDto } from "../server/map-knowledge-source-registry-dto";
import type { KnowledgeContext } from "../types/knowledge-context";
import type { KnowledgeDocument } from "../types/knowledge-document";
import type { KnowledgeQuery } from "../types/knowledge-query";
import type { KnowledgeResult } from "../types/knowledge-result";
import {
  createEmptyKnowledgeQueryDiagnostics,
  type KnowledgeQueryDiagnostics,
} from "./knowledge-query-diagnostics";

export interface KnowledgeDiscoveryOrchestratorOptions {
  readonly registry: KnowledgeRegistry;
  readonly sourcesDto: KnowledgeSourceRegistryDto;
  readonly rankingEngine?: RankingEngine;
}

export interface KnowledgeDiscoveryOrchestratorQueryInput {
  readonly text: string;
  readonly context?: KnowledgeContext;
  readonly limit?: number;
}

export interface KnowledgeDiscoveryOrchestratorQueryResult {
  readonly documents: readonly KnowledgeDocument[];
  readonly diagnostics: KnowledgeQueryDiagnostics;
  readonly providerResults: readonly KnowledgeResult[];
}

const DEFAULT_QUERY_LIMIT = 50;

/**
 * Query orchestrator — dispatches to registered providers for DTO-visible sources.
 * Returns KnowledgeDocument references only; does not execute actions or navigation.
 */
export class KnowledgeDiscoveryOrchestrator {
  private readonly registry: KnowledgeRegistry;
  private readonly sourcesDto: KnowledgeSourceRegistryDto;
  private readonly rankingEngine: RankingEngine;

  constructor(options: KnowledgeDiscoveryOrchestratorOptions) {
    this.registry = options.registry;
    this.sourcesDto = options.sourcesDto;
    this.rankingEngine = options.rankingEngine ?? createDefaultRankingEngine();
  }

  async query(
    input: KnowledgeDiscoveryOrchestratorQueryInput,
  ): Promise<KnowledgeDiscoveryOrchestratorQueryResult> {
    const startedAt = performance.now();
    const queryText = input.text ?? "";
    const limit = input.limit ?? DEFAULT_QUERY_LIMIT;
    const activeSources = this.listActiveSources(this.sourcesDto.sources);

    if (activeSources.length === 0) {
      return {
        documents: [],
        providerResults: [],
        diagnostics: {
          ...createEmptyKnowledgeQueryDiagnostics(queryText),
          durationMs: performance.now() - startedAt,
        },
      };
    }

    const providerResults: KnowledgeResult[] = [];
    const mergedDocuments: KnowledgeDocument[] = [];
    const skippedSourceIds: string[] = [];
    let providerSuccessCount = 0;
    let providerErrorCount = 0;
    let providerEmptyCount = 0;
    let providerNotImplementedCount = 0;
    let queriedSourceCount = 0;

    const knowledgeQuery: KnowledgeQuery = {
      text: queryText,
      limit,
      workspaceId: input.context?.activeWorkspaceId,
    };

    for (const source of activeSources) {
      const provider = this.registry.getProvider(source.id);
      if (!provider) {
        skippedSourceIds.push(source.id);
        continue;
      }

      queriedSourceCount += 1;
      const result = await this.invokeProvider(provider, knowledgeQuery, input.context);
      providerResults.push(result);

      switch (result.status) {
        case "ok":
          providerSuccessCount += 1;
          mergedDocuments.push(...result.documents);
          break;
        case "empty":
          providerEmptyCount += 1;
          break;
        case "not_implemented":
          providerNotImplementedCount += 1;
          break;
        case "error":
          providerErrorCount += 1;
          break;
        default:
          providerErrorCount += 1;
          break;
      }
    }

    const deduplicated = deduplicateDocuments(mergedDocuments);
    const ranking = this.rankingEngine.rank({
      documents: deduplicated,
      queryText,
    });
    const documents = Object.freeze(ranking.documents.slice(0, limit));

    return {
      documents,
      providerResults: Object.freeze([...providerResults]),
      diagnostics: {
        queryText,
        durationMs: performance.now() - startedAt,
        sourceCount: activeSources.length,
        queriedSourceCount,
        skippedSourceCount: skippedSourceIds.length,
        skippedSourceIds: Object.freeze([...skippedSourceIds].sort()),
        providerSuccessCount,
        providerErrorCount,
        providerEmptyCount,
        providerNotImplementedCount,
        mergedDocumentCount: mergedDocuments.length,
        deduplicatedDocumentCount: deduplicated.length,
        returnedDocumentCount: documents.length,
        rankingStrategyId: ranking.diagnostics.strategyId,
        rankingDurationMs: ranking.diagnostics.durationMs,
        rankingInputCount: ranking.diagnostics.inputCount,
        rankingOutputCount: ranking.diagnostics.outputCount,
        rankingFilteredCount: ranking.diagnostics.filteredCount,
      },
    };
  }

  private listActiveSources(
    sources: readonly KnowledgeSourceDescriptorDto[],
  ): readonly KnowledgeSourceDescriptorDto[] {
    return Object.freeze(
      [...sources]
        .filter((source) => source.status === "active")
        .sort(
          (left, right) =>
            left.priority - right.priority || left.id.localeCompare(right.id),
        ),
    );
  }

  private async invokeProvider(
    provider: KnowledgeProvider,
    query: KnowledgeQuery,
    context: KnowledgeContext | undefined,
  ): Promise<KnowledgeResult> {
    const startedAt = performance.now();

    try {
      const result = await provider.query(query, context ?? {});
      return {
        ...result,
        durationMs: result.durationMs ?? performance.now() - startedAt,
      };
    } catch (error) {
      return {
        status: "error",
        sourceId: provider.source.id,
        documents: [],
        message: error instanceof Error ? error.message : "Provider query failed",
        durationMs: performance.now() - startedAt,
      };
    }
  }
}

export function createKnowledgeDiscoveryOrchestrator(
  options: KnowledgeDiscoveryOrchestratorOptions,
): KnowledgeDiscoveryOrchestrator {
  return new KnowledgeDiscoveryOrchestrator(options);
}

function deduplicateDocuments(
  documents: readonly KnowledgeDocument[],
): readonly KnowledgeDocument[] {
  const seen = new Set<string>();
  const unique: KnowledgeDocument[] = [];

  for (const document of documents) {
    if (seen.has(document.documentId)) {
      continue;
    }
    seen.add(document.documentId);
    unique.push(document);
  }

  return Object.freeze(unique);
}

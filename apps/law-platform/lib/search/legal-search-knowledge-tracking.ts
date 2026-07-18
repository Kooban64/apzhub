import type { EventBus } from "@apzhub/event-notification-framework";
import type {
  KnowledgeService,
  KnowledgeQueryInput,
} from "@apzhub/knowledge-discovery-framework";

import { mapKnowledgeDocumentToSearchResult } from "../knowledge/map-legal-search-document";
import { LEGAL_ENTITY_SEARCH_SOURCE_IDS } from "../knowledge/legal-search-source-ids";
import { publishLegalSearchEvent } from "../publish-legal-search-event";
import {
  normalizeLegalSearchFilters,
  type LegalSearchFilters,
} from "./legal-search-filters";
import { getLegalSearchRecentSearches } from "./legal-search-recent-searches";
import { getLegalSearchWorkflowDiagnostics } from "./legal-search-workflow-diagnostics";
import { getActiveLegalSearchQueryFilters } from "./legal-search-query-context";
import { runWithLegalSearchPersistenceScope } from "./legal-search-persistence-scope";

let workflowQueryDepth = 0;

/** Marks knowledge queries issued by LegalSearchWorkflowService to avoid duplicate palette tracking. */
export async function runAsLegalSearchWorkflowQuery<T>(
  operation: () => Promise<T>,
): Promise<T> {
  workflowQueryDepth += 1;
  try {
    return await operation();
  } finally {
    workflowQueryDepth -= 1;
  }
}

export function resetLegalSearchWorkflowQueryDepth(): void {
  workflowQueryDepth = 0;
}

export interface WrapKnowledgeServiceForLegalSearchTrackingOptions {
  readonly eventBus?: EventBus;
  readonly actorId?: string;
}

function countLegalEntityDocuments(
  documents: readonly { readonly sourceId: string }[],
): number {
  return documents.filter((document) =>
    LEGAL_ENTITY_SEARCH_SOURCE_IDS.includes(
      document.sourceId as (typeof LEGAL_ENTITY_SEARCH_SOURCE_IDS)[number],
    ),
  ).length;
}

function readFilters(): LegalSearchFilters {
  return normalizeLegalSearchFilters(getActiveLegalSearchQueryFilters());
}

/** Wraps KnowledgeService to track palette knowledge queries in session memory (LAW-007-02). */
export function wrapKnowledgeServiceForLegalSearchTracking(
  service: KnowledgeService,
  options: WrapKnowledgeServiceForLegalSearchTrackingOptions = {},
): KnowledgeService {
  return {
    ...service,
    async query(input: KnowledgeQueryInput) {
      const result = await runWithLegalSearchPersistenceScope(() =>
        service.query(input),
      );
      const queryText = input.text?.trim() ?? "";
      const legalDocumentCount = countLegalEntityDocuments(result.documents);
      const filters = readFilters();

      if (queryText && legalDocumentCount > 0 && workflowQueryDepth === 0) {
        getLegalSearchRecentSearches().record({
          query: queryText,
          filters,
          resultCount: legalDocumentCount,
          surface: "palette",
        });
        getLegalSearchWorkflowDiagnostics().setLastQuery(queryText);
        getLegalSearchWorkflowDiagnostics().setLastFilters(filters);
        getLegalSearchWorkflowDiagnostics().setLastSurface("palette");
        getLegalSearchWorkflowDiagnostics().incrementPaletteQueryCount();

        if (options.eventBus) {
          publishLegalSearchEvent(
            options.eventBus,
            "executed",
            {
              query: queryText,
              resultCount: legalDocumentCount,
              entityTypeFilter: filters.entityType ?? "all",
              commandId: "legal.search.execute",
            },
            { actorId: options.actorId },
          );
        }
      }

      return result;
    },
    getDiagnostics() {
      return service.getDiagnostics();
    },
  };
}

export function isLegalSearchKnowledgeDocument(
  document: Parameters<typeof mapKnowledgeDocumentToSearchResult>[0],
): boolean {
  return LEGAL_ENTITY_SEARCH_SOURCE_IDS.includes(
    document.sourceId as (typeof LEGAL_ENTITY_SEARCH_SOURCE_IDS)[number],
  );
}

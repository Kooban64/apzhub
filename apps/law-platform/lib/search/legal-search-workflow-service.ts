import type { EventBus } from "@apzhub/event-notification-framework";
import type { KnowledgeService } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeQueryDiagnostics } from "@apzhub/knowledge-discovery-framework";

import {
  groupSearchResultsByEntityType,
  mapKnowledgeDocumentToSearchResult,
  type LegalSearchResultView,
} from "../knowledge/map-legal-search-document";
import {
  LEGAL_CLIENT_SEARCH_SOURCE_ID,
  LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
  LEGAL_MATTER_SEARCH_SOURCE_ID,
  LEGAL_TASK_SEARCH_SOURCE_ID,
  LEGAL_TIME_SEARCH_SOURCE_ID,
  LEGAL_CALENDAR_SEARCH_SOURCE_ID,
} from "../knowledge/legal-search-source-ids";
import { publishLegalSearchEvent } from "../publish-legal-search-event";
import { runAsLegalSearchWorkflowQuery } from "./legal-search-knowledge-tracking";
import { runWithLegalSearchPersistenceScope } from "./legal-search-persistence-scope";
import { runWithLegalSearchFilters } from "./legal-search-query-context";
import {
  EMPTY_LEGAL_SEARCH_FILTERS,
  hasActiveLegalSearchFilters,
  normalizeLegalSearchFilters,
  type LegalSearchFilters,
} from "./legal-search-filters";
import { sortSearchResultsByLegalRelevance } from "./legal-search-ranking";
import {
  getLegalSearchRecentSearches,
  type LegalSearchSurface,
} from "./legal-search-recent-searches";
import {
  getLegalSearchWorkflowDiagnostics,
  type LegalSearchWorkflowOperation,
  type LegalSearchWorkflowRunRecord,
  type LegalSearchWorkflowStageRecord,
} from "./legal-search-workflow-diagnostics";

export type { LegalSearchFilters } from "./legal-search-filters";
export type LegalSearchEntityFilter = LegalSearchFilters["entityType"];

export interface LegalSearchWorkflowServiceOptions {
  readonly knowledgeService: KnowledgeService;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface LegalSearchExecuteOptions {
  readonly filters?: LegalSearchFilters;
  readonly commandId?: string;
  readonly surface?: LegalSearchSurface;
}

export interface LegalSearchExecuteResult {
  readonly ok: boolean;
  readonly results: readonly LegalSearchResultView[];
  readonly grouped: ReturnType<typeof groupSearchResultsByEntityType>;
  readonly filters: LegalSearchFilters;
  readonly diagnostics?: KnowledgeQueryDiagnostics;
  readonly eventId?: string;
  readonly filteredEventId?: string;
  readonly run: LegalSearchWorkflowRunRecord;
}

const ENTITY_SOURCE_IDS = {
  client: LEGAL_CLIENT_SEARCH_SOURCE_ID,
  matter: LEGAL_MATTER_SEARCH_SOURCE_ID,
  document: LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
  task: LEGAL_TASK_SEARCH_SOURCE_ID,
  time_entry: LEGAL_TIME_SEARCH_SOURCE_ID,
  calendar_event: LEGAL_CALENDAR_SEARCH_SOURCE_ID,
} as const;

function recordStage(
  stages: LegalSearchWorkflowStageRecord[],
  operation: LegalSearchWorkflowOperation,
  stage: LegalSearchWorkflowStageRecord["stage"],
  startedAt: number,
  ok: boolean,
  detail?: string,
): void {
  stages.push({
    operation,
    stage,
    ok,
    durationMs: performance.now() - startedAt,
    detail,
  });
}

function applyWorkflowPostFilters(
  results: readonly LegalSearchResultView[],
  filters: LegalSearchFilters,
): readonly LegalSearchResultView[] {
  const normalized = normalizeLegalSearchFilters(filters);

  return results.filter((result) => {
    const metadata = result.document.metadata ?? {};

    if (
      normalized.entityType &&
      normalized.entityType !== "all" &&
      result.entityType !== normalized.entityType
    ) {
      return false;
    }

    if (normalized.scopeMatterId || normalized.matterId) {
      const matterId = normalized.matterId ?? normalized.scopeMatterId;
      if (result.entityType === "matter" && metadata.matterId !== matterId) {
        return false;
      }
      if (
        (result.entityType === "document" ||
          result.entityType === "task" ||
          result.entityType === "time_entry" ||
          result.entityType === "calendar_event") &&
        metadata.matterId !== matterId
      ) {
        return false;
      }
    }

    if (normalized.scopeClientId || normalized.clientId) {
      const clientId = normalized.clientId ?? normalized.scopeClientId;
      if (result.entityType === "client" && metadata.clientId !== clientId) {
        return false;
      }
      if (result.entityType === "matter" && metadata.clientId !== clientId) {
        return false;
      }
    }

    if (normalized.status) {
      const statusValue = String(
        metadata.status ?? metadata.taskStatus ?? metadata.documentStatus ?? "",
      );
      if (statusValue && statusValue !== normalized.status) {
        return false;
      }
    }

    if (normalized.dateFrom || normalized.dateTo) {
      const dateValue = String(
        metadata.entryDate ?? metadata.dueAt ?? metadata.createdAt ?? "",
      ).slice(0, 10);
      if (dateValue) {
        if (normalized.dateFrom && dateValue < normalized.dateFrom) {
          return false;
        }
        if (normalized.dateTo && dateValue > normalized.dateTo) {
          return false;
        }
      }
    }

    return true;
  });
}

/** Unified legal search workflow — Knowledge Service query, filter, events (LAW-007-01 / LAW-007-02). */
export class LegalSearchWorkflowService {
  constructor(private readonly options: LegalSearchWorkflowServiceOptions) {}

  async executeSearch(
    query: string,
    filtersOrEntityType:
      LegalSearchFilters | LegalSearchEntityFilter = EMPTY_LEGAL_SEARCH_FILTERS,
    commandIdOrOptions: string | LegalSearchExecuteOptions = "legal.search.execute",
  ): Promise<LegalSearchExecuteResult> {
    const options =
      typeof commandIdOrOptions === "string"
        ? { commandId: commandIdOrOptions }
        : commandIdOrOptions;
    const filters =
      typeof filtersOrEntityType === "string"
        ? normalizeLegalSearchFilters({ entityType: filtersOrEntityType })
        : normalizeLegalSearchFilters(filtersOrEntityType);
    const commandId = options.commandId ?? "legal.search.execute";
    const surface = options.surface ?? "page";

    const startedAt = performance.now();
    const stages: LegalSearchWorkflowStageRecord[] = [];
    const operation: LegalSearchWorkflowOperation = "execute";

    const knowledgeStart = performance.now();
    const knowledgeResult = await runWithLegalSearchPersistenceScope(() =>
      runWithLegalSearchFilters(filters, () =>
        runAsLegalSearchWorkflowQuery(() =>
          this.options.knowledgeService.query({
            text: query,
            limit: 100,
          }),
        ),
      ),
    );
    recordStage(
      stages,
      operation,
      "knowledge",
      knowledgeStart,
      true,
      `${knowledgeResult.documents.length} documents`,
    );
    getLegalSearchWorkflowDiagnostics().setLastProviderCount(
      knowledgeResult.providerResults.length,
    );
    getLegalSearchWorkflowDiagnostics().setLastFilters(filters);
    getLegalSearchWorkflowDiagnostics().setLastSurface(surface);

    const filterStart = performance.now();
    const mapped = knowledgeResult.documents
      .map((document) => mapKnowledgeDocumentToSearchResult(document))
      .filter((result): result is LegalSearchResultView => Boolean(result));
    const postFiltered = applyWorkflowPostFilters(mapped, filters);
    const results = sortSearchResultsByLegalRelevance(postFiltered, query, filters);
    const grouped = groupSearchResultsByEntityType(results);
    recordStage(
      stages,
      operation,
      "filter",
      filterStart,
      true,
      `${results.length} results`,
    );

    const eventStart = performance.now();
    const published = publishLegalSearchEvent(
      this.options.eventBus,
      "executed",
      {
        query,
        resultCount: results.length,
        entityTypeFilter: filters.entityType ?? "all",
        commandId,
      },
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );

    let filteredEventId: string | undefined;
    if (hasActiveLegalSearchFilters(filters)) {
      const filteredPublished = publishLegalSearchEvent(
        this.options.eventBus,
        "filtered",
        {
          query,
          resultCount: results.length,
          entityTypeFilter: filters.entityType ?? "all",
          matterId: filters.matterId ?? filters.scopeMatterId,
          clientId: filters.clientId ?? filters.scopeClientId,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          commandId,
        },
        { actorId: this.options.actorId },
      );
      filteredEventId = filteredPublished.eventId;
      getLegalSearchWorkflowDiagnostics().incrementFilteredEventCount();
      recordStage(
        stages,
        operation,
        "event",
        eventStart,
        filteredPublished.ok,
        filteredEventId,
      );
    }

    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    getLegalSearchRecentSearches().record({
      query,
      filters,
      resultCount: results.length,
      surface,
    });

    const run: LegalSearchWorkflowRunRecord = {
      operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - startedAt,
      ok: published.ok,
      commandId,
      eventId: published.eventId,
      query,
      resultCount: results.length,
      filters,
      surface,
      stages,
    };
    getLegalSearchWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      results,
      grouped,
      filters,
      diagnostics: knowledgeResult.diagnostics,
      eventId: published.eventId,
      filteredEventId,
      run,
    };
  }

  openResult(
    result: LegalSearchResultView,
    commandId = "legal.search.open",
  ): {
    readonly ok: boolean;
    readonly eventId?: string;
    readonly run: LegalSearchWorkflowRunRecord;
  } {
    const startedAt = performance.now();
    const stages: LegalSearchWorkflowStageRecord[] = [];
    const operation: LegalSearchWorkflowOperation = "open";

    const eventStart = performance.now();
    const published = publishLegalSearchEvent(
      this.options.eventBus,
      "result.opened",
      {
        query: "",
        entityType: result.entityType,
        documentId: result.document.documentId,
        title: result.title,
        reference: result.reference,
        route: result.route,
        commandId,
      },
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run: LegalSearchWorkflowRunRecord = {
      operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - startedAt,
      ok: published.ok,
      commandId,
      eventId: published.eventId,
      stages,
    };
    getLegalSearchWorkflowDiagnostics().record(run);

    return { ok: published.ok, eventId: published.eventId, run };
  }

  openResultFromDocument(
    document: LegalSearchResultView["document"],
    commandId = "legal.search.open",
  ): ReturnType<LegalSearchWorkflowService["openResult"]> | { readonly ok: false } {
    const result = mapKnowledgeDocumentToSearchResult(document);
    if (!result) {
      return { ok: false };
    }

    return this.openResult(result, commandId);
  }

  getEntitySourceIds(): readonly string[] {
    return Object.values(ENTITY_SOURCE_IDS);
  }
}

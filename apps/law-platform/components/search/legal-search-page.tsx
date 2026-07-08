"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  LawEmptyState,
  LawFilterBar,
  LawListPageLayout,
  LawPageHeader,
  LawSearchBar,
  LawTableLoadingSkeleton,
} from "../ux";
import { LegalSearchContextPanel } from "./legal-search-context-panel";
import { LegalSearchResults } from "./legal-search-results";
import { CLIENT_STATUSES, getSharedClientRepository } from "../../lib/clients";
import { getSharedMatterRepository, MATTER_STATUSES } from "../../lib/matters";
import type { LegalSearchResultView } from "../../lib/knowledge/map-legal-search-document";
import {
  EMPTY_LEGAL_SEARCH_FILTERS,
  mergeLegalSearchScope,
  normalizeLegalSearchFilters,
  type LegalSearchFilters,
} from "../../lib/search/legal-search-filters";
import {
  useLegalSearchWorkflow,
  legalSearchListRoute,
  type LegalSearchExecuteResult,
  type LegalSearchScope,
} from "../../lib/search";

export interface LegalSearchPageProps {
  readonly initialQuery?: string;
  readonly initialFilters?: LegalSearchFilters;
  readonly initialScope?: LegalSearchScope;
}

const ENTITY_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "client", label: "Clients" },
  { value: "matter", label: "Matters" },
  { value: "document", label: "Documents" },
  { value: "task", label: "Tasks" },
  { value: "time_entry", label: "Time entries" },
  { value: "calendar_event", label: "Calendar events" },
] as const;

/** Unified Legal Search page — filters, scope, recent searches (LAW-007-01 / LAW-007-02). */
export function LegalSearchPage({
  initialQuery = "",
  initialFilters = EMPTY_LEGAL_SEARCH_FILTERS,
  initialScope,
}: LegalSearchPageProps) {
  const router = useRouter();
  const workflow = useLegalSearchWorkflow();
  const matters = useMemo(() => getSharedMatterRepository().list(), []);
  const clients = useMemo(() => getSharedClientRepository().list(), []);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<LegalSearchFilters>(() =>
    normalizeLegalSearchFilters(
      initialScope
        ? mergeLegalSearchScope(initialFilters, initialScope)
        : initialFilters,
    ),
  );
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery.trim()));
  const [lastResult, setLastResult] = useState<LegalSearchExecuteResult | undefined>();
  const [selectedResult, setSelectedResult] = useState<
    LegalSearchResultView | undefined
  >();

  const runSearch = useCallback(
    async (searchQuery: string, nextFilters: LegalSearchFilters) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setLastResult(undefined);
        setHasSearched(false);
        setSelectedResult(undefined);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const result = await workflow.executeSearch(trimmed, nextFilters, {
          commandId: "legal.search.execute",
          surface: "page",
        });
        setLastResult(result);
        setSelectedResult(undefined);
        router.replace(legalSearchListRoute(trimmed, nextFilters));
      } finally {
        setLoading(false);
      }
    },
    [router, workflow],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLastResult(undefined);
      setHasSearched(false);
      setSelectedResult(undefined);
      return;
    }

    const timer = window.setTimeout(() => {
      void runSearch(trimmed, filters);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, filters, runSearch]);

  function updateFilters(patch: Partial<LegalSearchFilters>) {
    setFilters((current) => normalizeLegalSearchFilters({ ...current, ...patch }));
  }

  function handleOpenResult(result: LegalSearchResultView) {
    workflow.openResult(result);
    router.push(result.route);
  }

  function applyRecentSearch(entry: {
    readonly query: string;
    readonly filters: LegalSearchFilters;
  }) {
    setQuery(entry.query);
    setFilters(entry.filters);
    setHasSearched(true);
    void runSearch(entry.query, entry.filters);
  }

  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  const results = lastResult?.results ?? [];
  const showEmpty = hasSearched && !loading && results.length === 0;
  const showInitialEmpty = !hasSearched && !loading;
  const scopeLabel =
    initialScope?.label ??
    (filters.scopeMatterId ? `Matter scope: ${filters.scopeMatterId}` : undefined) ??
    (filters.scopeClientId ? `Client scope: ${filters.scopeClientId}` : undefined);

  return (
    <div data-testid="legal-search-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Legal Search"
            title="Unified Search"
            subtitle="Search clients, matters, documents, tasks, and time entries via the Knowledge & Discovery Framework."
          />
        }
        toolbar={
          <div className="flex flex-wrap gap-2">
            {scopeLabel ? (
              <span
                className="self-center text-sm text-[var(--color-muted-foreground)]"
                data-testid="legal-search-scope-label"
              >
                Scoped to {scopeLabel}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setFilters(EMPTY_LEGAL_SEARCH_FILTERS);
                setHasSearched(false);
                setLastResult(undefined);
                setSelectedResult(undefined);
                router.replace(legalSearchListRoute());
              }}
              data-testid="legal-search-clear"
            >
              Clear search
            </Button>
          </div>
        }
        searchArea={
          <LawSearchBar
            placeholder="Search across clients, matters, documents, tasks, and time entries…"
            value={query}
            onChange={setQuery}
            data-testid="legal-search-bar"
          />
        }
        filtersArea={
          <LawFilterBar label="Advanced search filters">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Entity type</span>
              <select
                className={selectClassName}
                value={filters.entityType ?? "all"}
                onChange={(event) =>
                  updateFilters({
                    entityType: event.target.value as LegalSearchFilters["entityType"],
                  })
                }
                data-testid="legal-search-filter-entity"
              >
                {ENTITY_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Client</span>
              <select
                className={selectClassName}
                value={filters.clientId ?? "all"}
                onChange={(event) =>
                  updateFilters({
                    clientId:
                      event.target.value === "all" ? undefined : event.target.value,
                  })
                }
                data-testid="legal-search-filter-client"
              >
                <option value="all">All clients</option>
                {clients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Matter</span>
              <select
                className={selectClassName}
                value={filters.matterId ?? "all"}
                onChange={(event) =>
                  updateFilters({
                    matterId:
                      event.target.value === "all" ? undefined : event.target.value,
                  })
                }
                data-testid="legal-search-filter-matter"
              >
                <option value="all">All matters</option>
                {matters.map((matter) => (
                  <option key={matter.matterId} value={matter.matterId}>
                    {matter.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Status</span>
              <select
                className={selectClassName}
                value={filters.status ?? "all"}
                onChange={(event) =>
                  updateFilters({
                    status:
                      event.target.value === "all" ? undefined : event.target.value,
                  })
                }
                data-testid="legal-search-filter-status"
              >
                <option value="all">Any status</option>
                {CLIENT_STATUSES.map((status) => (
                  <option key={`client-${status}`} value={status}>
                    Client: {status}
                  </option>
                ))}
                {MATTER_STATUSES.map((status) => (
                  <option key={`matter-${status}`} value={status}>
                    Matter: {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">From</span>
              <input
                type="date"
                className={selectClassName}
                value={filters.dateFrom ?? ""}
                onChange={(event) =>
                  updateFilters({ dateFrom: event.target.value || undefined })
                }
                data-testid="legal-search-filter-date-from"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">To</span>
              <input
                type="date"
                className={selectClassName}
                value={filters.dateTo ?? ""}
                onChange={(event) =>
                  updateFilters({ dateTo: event.target.value || undefined })
                }
                data-testid="legal-search-filter-date-to"
              />
            </label>
          </LawFilterBar>
        }
        table={
          loading ? (
            <LawTableLoadingSkeleton />
          ) : showInitialEmpty ? (
            <LawEmptyState
              variant="no-results"
              title="Search the Law Platform"
              description="Enter a query to search across clients, matters, documents, tasks, and time entries."
            />
          ) : showEmpty ? (
            <LawEmptyState variant="no-results" />
          ) : (
            <LegalSearchResults
              results={results}
              selectedDocumentId={selectedResult?.document.documentId}
              highlightQuery={query}
              onSelect={setSelectedResult}
              onOpen={handleOpenResult}
            />
          )
        }
        contextPanel={
          <LegalSearchContextPanel
            query={query}
            filters={filters}
            lastResult={lastResult}
            loading={loading}
            selectedResult={selectedResult}
            onApplyRecentSearch={applyRecentSearch}
          />
        }
      />
    </div>
  );
}

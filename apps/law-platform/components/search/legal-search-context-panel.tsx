"use client";

import { Button } from "@apzhub/ui";

import { LawInformationCard, LawStatisticsCard } from "../ux";
import { formatLegalSearchEntityTypeLabel } from "../../lib/knowledge/map-legal-search-document";
import {
  getLegalSearchRecentSearches,
  getLegalSearchWorkflowDiagnostics,
  hasActiveLegalSearchFilters,
  type LegalSearchExecuteResult,
  type LegalSearchFilters,
  type LegalSearchRecentEntry,
} from "../../lib/search";
import type { LegalSearchResultView } from "../../lib/knowledge/map-legal-search-document";

export interface LegalSearchContextPanelProps {
  readonly query: string;
  readonly filters: LegalSearchFilters;
  readonly lastResult?: LegalSearchExecuteResult;
  readonly loading: boolean;
  readonly selectedResult?: LegalSearchResultView;
  readonly onApplyRecentSearch?: (entry: LegalSearchRecentEntry) => void;
}

function summarizeFilters(filters: LegalSearchFilters): string {
  const parts: string[] = [];
  if (filters.entityType && filters.entityType !== "all") {
    parts.push(formatLegalSearchEntityTypeLabel(filters.entityType));
  }
  if (filters.clientId) {
    parts.push(`client=${filters.clientId}`);
  }
  if (filters.matterId) {
    parts.push(`matter=${filters.matterId}`);
  }
  if (filters.status) {
    parts.push(`status=${filters.status}`);
  }
  if (filters.dateFrom || filters.dateTo) {
    parts.push(`${filters.dateFrom ?? "…"} → ${filters.dateTo ?? "…"}`);
  }
  if (filters.scopeMatterId) {
    parts.push(`scope matter=${filters.scopeMatterId}`);
  }
  if (filters.scopeClientId) {
    parts.push(`scope client=${filters.scopeClientId}`);
  }
  return parts.length > 0 ? parts.join(", ") : "None";
}

/** Context panel — search diagnostics, recent searches, and summary (LAW-007-02). */
export function LegalSearchContextPanel({
  query,
  filters,
  lastResult,
  loading,
  selectedResult,
  onApplyRecentSearch,
}: LegalSearchContextPanelProps) {
  const diagnostics = getLegalSearchWorkflowDiagnostics().getSummary();
  const recentSearches = getLegalSearchRecentSearches().list();

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="legal-search-context-panel"
    >
      <LawStatisticsCard label="Last query" value={query.trim() || "—"} />
      <LawStatisticsCard
        label="Active filters"
        value={
          hasActiveLegalSearchFilters(filters) ? summarizeFilters(filters) : "None"
        }
      />
      <LawStatisticsCard
        label="Result count"
        value={
          loading
            ? "Searching…"
            : String(lastResult?.results.length ?? diagnostics.lastResultCount)
        }
      />
      <LawStatisticsCard label="Last surface" value={diagnostics.lastSurface} />
      {selectedResult ? (
        <LawInformationCard title="Selected result">
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Title</dt>
              <dd className="font-medium">{selectedResult.title}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Reference</dt>
              <dd>{selectedResult.reference}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Score</dt>
              <dd>{selectedResult.score?.toFixed(2) ?? "—"}</dd>
            </div>
          </dl>
        </LawInformationCard>
      ) : null}
      <LawInformationCard title="Search diagnostics">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Workflow runs</dt>
            <dd>{diagnostics.totalRuns}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Providers queried</dt>
            <dd>{diagnostics.lastProviderCount}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Palette queries</dt>
            <dd>{diagnostics.paletteQueryCount}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Filtered events</dt>
            <dd>{diagnostics.filteredEventCount}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Events raised</dt>
            <dd>{diagnostics.eventsRaised}</dd>
          </div>
          {lastResult?.diagnostics ? (
            <div>
              <dt className="text-[var(--color-muted-foreground)]">
                Knowledge duration
              </dt>
              <dd>{lastResult.diagnostics.durationMs.toFixed(1)} ms</dd>
            </div>
          ) : null}
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Recent searches (session)">
        {recentSearches.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No recent searches in this session.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="legal-search-recent-list">
            {recentSearches.map((entry) => (
              <li key={`${entry.searchedAt}-${entry.query}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => onApplyRecentSearch?.(entry)}
                  data-testid="legal-search-recent-item"
                >
                  <span className="truncate">{entry.query}</span>
                  <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
                    {entry.resultCount} · {entry.surface}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </LawInformationCard>
    </aside>
  );
}

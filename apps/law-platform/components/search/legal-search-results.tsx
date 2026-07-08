"use client";

import {
  formatLegalSearchEntityTypeLabel,
  groupSearchResultsByEntityType,
  type LegalSearchEntityType,
  type LegalSearchResultView,
} from "../../lib/knowledge/map-legal-search-document";
import { highlightSearchTerm } from "../../lib/ux/highlight-search-term";

export interface LegalSearchResultsProps {
  readonly results: readonly LegalSearchResultView[];
  readonly selectedDocumentId?: string;
  readonly highlightQuery?: string;
  readonly onSelect: (result: LegalSearchResultView) => void;
  readonly onOpen: (result: LegalSearchResultView) => void;
}

const GROUP_ORDER: readonly LegalSearchEntityType[] = [
  "client",
  "matter",
  "document",
  "task",
  "time_entry",
  "calendar_event",
];

/** Grouped unified search results with entity type labels (LAW-007-01). */
export function LegalSearchResults({
  results,
  selectedDocumentId,
  highlightQuery = "",
  onSelect,
  onOpen,
}: LegalSearchResultsProps) {
  const grouped = groupSearchResultsByEntityType(results);

  return (
    <div className="flex flex-col gap-6" data-testid="legal-search-results">
      {GROUP_ORDER.map((entityType) => {
        const groupResults = grouped[entityType];
        if (groupResults.length === 0) {
          return null;
        }

        return (
          <section key={entityType} data-testid={`legal-search-group-${entityType}`}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              {formatLegalSearchEntityTypeLabel(entityType)} ({groupResults.length})
            </h3>
            <ul className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
              {groupResults.map((result) => {
                const selected = selectedDocumentId === result.document.documentId;

                return (
                  <li key={result.document.documentId}>
                    <button
                      type="button"
                      className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-[var(--color-muted)] ${
                        selected ? "bg-[var(--color-muted)]" : ""
                      }`}
                      data-testid={`legal-search-result-${result.document.documentId}`}
                      onClick={() => onSelect(result)}
                      onDoubleClick={() => onOpen(result)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[var(--color-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted-foreground)]">
                          {formatLegalSearchEntityTypeLabel(result.entityType)}
                        </span>
                        <span className="font-medium text-[var(--color-foreground)]">
                          {highlightSearchTerm(result.title, highlightQuery)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {highlightSearchTerm(result.subtitle, highlightQuery)}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-[var(--color-muted-foreground)]">
                        <span data-testid="legal-search-result-reference">
                          Ref: {result.reference}
                        </span>
                        {result.relatedLabel ? (
                          <span data-testid="legal-search-result-related">
                            {result.relatedLabel}
                          </span>
                        ) : null}
                        {typeof result.score === "number" ? (
                          <span>Score: {result.score.toFixed(2)}</span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

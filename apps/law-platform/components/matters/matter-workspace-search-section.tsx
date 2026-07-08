"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { LawInformationCard, LawSearchBar } from "../ux";
import {
  EMPTY_LEGAL_SEARCH_FILTERS,
  legalSearchListRoute,
  mergeLegalSearchScope,
  useLegalSearchWorkflow,
  type LegalSearchResultView,
} from "../../lib/search";

export interface MatterWorkspaceSearchSectionProps {
  readonly matterId: string;
  readonly matterTitle: string;
}

/** Matter-scoped unified search section — reuses LegalSearchWorkflow (LAW-009-01). */
export function MatterWorkspaceSearchSection({
  matterId,
  matterTitle,
}: MatterWorkspaceSearchSectionProps) {
  const router = useRouter();
  const workflow = useLegalSearchWorkflow();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly LegalSearchResultView[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const scopedFilters = mergeLegalSearchScope(EMPTY_LEGAL_SEARCH_FILTERS, {
          matterId,
        });
        const result = await workflow.executeSearch(trimmed, scopedFilters, {
          commandId: "legal.search.execute",
          surface: "page",
        });
        setResults(result.results.slice(0, 8));
      } finally {
        setLoading(false);
      }
    },
    [matterId, workflow],
  );

  return (
    <LawInformationCard title="Matter search">
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        Context-scoped unified search for {matterTitle}. Results are filtered to this
        matter via the existing Knowledge & Discovery Framework.
      </p>
      <LawSearchBar
        placeholder="Search within this matter…"
        value={query}
        onChange={(value) => {
          setQuery(value);
          void runSearch(value);
        }}
        data-testid="matter-workspace-search-bar"
      />
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(
              legalSearchListRoute(
                query,
                mergeLegalSearchScope(EMPTY_LEGAL_SEARCH_FILTERS, { matterId }),
              ),
            )
          }
        >
          Open full search
        </Button>
      </div>
      {loading ? (
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">Searching…</p>
      ) : results.length > 0 ? (
        <ul className="mt-3 divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
          {results.map((result) => (
            <li key={result.document.documentId}>
              <button
                type="button"
                className="flex w-full flex-col gap-1 px-3 py-2 text-left hover:bg-[var(--color-muted)]"
                onClick={() => {
                  workflow.openResult(result);
                  router.push(result.route);
                }}
              >
                <span className="text-sm font-medium">{result.title}</span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {result.reference} · {result.entityType}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : query.trim() ? (
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          No results in this matter.
        </p>
      ) : null}
    </LawInformationCard>
  );
}

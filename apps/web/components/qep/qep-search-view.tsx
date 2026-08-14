"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { QEP_SEARCH_BASE_PATH } from "@/lib/qep/routes";
import { createHttpSearchClient } from "@/lib/search/search-client";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

const searchClient = createHttpSearchClient();
const ENTITY_TYPES = ["all", "requirement", "evidence", "defect"] as const;

export function QepSearchRouterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [queryText, setQueryText] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery.trim());
  const [entityType, setEntityType] = useState<(typeof ENTITY_TYPES)[number]>(
    ENTITY_TYPES.includes(searchParams.get("type") as (typeof ENTITY_TYPES)[number])
      ? (searchParams.get("type") as (typeof ENTITY_TYPES)[number])
      : "all",
  );

  const query = useQuery({
    queryKey: ["qep-search", submitted, entityType],
    queryFn: ({ signal }) =>
      searchClient.executeQuery(
        {
          query: {
            keywords: submitted,
            products: ["qep"],
            page: 1,
            pageSize: 30,
            includeHighlights: true,
          },
        },
        { signal },
      ),
    enabled: submitted.length > 0,
  });

  const hits = useMemo(() => {
    const visible = query.data?.hits.filter(
      (hit) =>
        hit.productId === "qep" &&
        ["requirement", "evidence", "defect"].includes(hit.entityType),
    );
    return entityType === "all"
      ? (visible ?? [])
      : (visible ?? []).filter((hit) => hit.entityType === entityType);
  }, [entityType, query.data?.hits]);

  return (
    <QepPageShell
      title="QEP Search"
      description="Find permission-visible requirements, evidence, and defects through Platform Search."
      breadcrumbs={["QEP", "Search"]}
    >
      <QepPanel title="Search quality records">
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const next = queryText.trim();
            setSubmitted(next);
            const params = new URLSearchParams();
            if (next) params.set("q", next);
            if (entityType !== "all") params.set("type", entityType);
            router.replace(`${QEP_SEARCH_BASE_PATH}?${params.toString()}`);
          }}
        >
          <Input
            label="Search QEP"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder="Requirement, evidence, or defect"
          />
          <div className="flex flex-wrap gap-2">
            {ENTITY_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                size="sm"
                variant={entityType === type ? "default" : "outline"}
                onClick={() => setEntityType(type)}
              >
                {type === "all" ? "All" : `${type[0]!.toUpperCase()}${type.slice(1)}`}
              </Button>
            ))}
            <Button type="submit" size="sm">
              Search
            </Button>
          </div>
        </form>
      </QepPanel>

      {!submitted ? <QepEmptyState title="Enter a search term." /> : null}
      {query.isLoading ? <QepLoadingState label="Searching QEP…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={
            query.error instanceof Error ? query.error.message : "Search failed."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && submitted && hits.length === 0 ? (
        <QepEmptyState title="No permission-visible QEP results matched." />
      ) : null}
      {hits.length > 0 ? (
        <ul className="space-y-2" data-testid="qep-search-results">
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] p-3 text-left hover:bg-[var(--color-muted)]/20"
                onClick={() => {
                  if (hit.navigationTarget?.startsWith("/workspace/qep/")) {
                    router.push(hit.navigationTarget);
                  }
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{hit.title || hit.entityId}</span>
                  <QepStatusBadge status={hit.entityType} />
                </div>
                {hit.highlightSnippets[0] ? (
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {hit.highlightSnippets[0]}
                  </p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </QepPageShell>
  );
}

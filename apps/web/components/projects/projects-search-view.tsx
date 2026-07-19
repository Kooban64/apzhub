"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { projectDetailPath, PROJECTS_BASE } from "@/lib/projects/routes";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { createHttpSearchClient } from "@/lib/search/search-client";
import { SearchClientError } from "@/lib/search/search-errors";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

const searchClient = createHttpSearchClient();

export function ProjectsSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);

  const params = useMemo(() => submitted.trim(), [submitted]);

  const query = useQuery({
    queryKey: projectsQueryKeys.search(params),
    queryFn: ({ signal }) =>
      searchClient.executeQuery(
        {
          query: {
            keywords: params,
            products: ["projects"],
            page: 1,
            pageSize: 30,
            includeHighlights: true,
          },
        },
        { signal },
      ),
    enabled: params.length > 0,
  });

  return (
    <PageShell
      title="Search"
      description="Unified Platform Search scoped to the Projects product."
    >
      <form
        className="flex flex-col gap-3"
        data-testid="projects-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          const next = q.trim();
          setSubmitted(next);
          router.replace(`${PROJECTS_BASE}/search?q=${encodeURIComponent(next)}`);
        }}
      >
        <Input
          label="Query"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          data-testid="projects-search-q"
        />
        <Button type="submit" size="sm" data-testid="projects-search-submit">
          Search
        </Button>
      </form>

      {!params ? (
        <EmptyState
          title="Enter a query"
          description="Search uses Platform Search scoped to the Projects product. Results depend on search index population."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(`${PROJECTS_BASE}/health`)}
              data-testid="projects-search-health-link"
            >
              Open Projects health
            </Button>
          }
        />
      ) : null}
      {params && query.isLoading ? <LoadingState label="Searching…" /> : null}
      {params && query.isError ? (
        <ErrorState
          message={
            query.error instanceof SearchClientError
              ? query.error.message
              : "Search is temporarily unavailable."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {params && query.isSuccess && query.data.hits.length === 0 ? (
        <EmptyState
          title="No results"
          description="No indexed Projects hits matched this query. If you expected results, confirm the Search index is populated via Projects health."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(`${PROJECTS_BASE}/health`)}
              data-testid="projects-search-empty-health-link"
            >
              Open Projects health
            </Button>
          }
        />
      ) : null}
      {params && query.isSuccess && query.data.hits.length > 0 ? (
        <ul className="flex flex-col gap-2" data-testid="projects-search-results">
          {query.data.hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/20"
                onClick={() => {
                  if (hit.entityType === "project" && hit.entityId) {
                    router.push(projectDetailPath(hit.entityId));
                    return;
                  }
                  if (hit.navigationTarget?.startsWith("/workspace/projects")) {
                    router.push(hit.navigationTarget);
                  }
                }}
              >
                <p className="font-medium">{hit.title || hit.entityId}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {hit.entityType} · {hit.productId}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}

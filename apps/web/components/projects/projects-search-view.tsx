"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  projectDetailPath,
  PROJECTS_BASE,
  projectsHelpPath,
} from "@/lib/projects/routes";
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
      description="Find projects and related work inside APZ Projects."
      breadcrumbs={["APZ Projects", "Search"]}
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
          description="Search across APZ Projects for projects and related work."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(projectsHelpPath())}
              data-testid="projects-search-help-link"
            >
              Open help
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
          description="No APZ Projects results matched this query."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(projectsHelpPath())}
              data-testid="projects-search-empty-help-link"
            >
              Open help
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
                <p className="font-medium">{hit.title || "Untitled result"}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {hit.entityType === "project" ? "Project" : "Result"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}

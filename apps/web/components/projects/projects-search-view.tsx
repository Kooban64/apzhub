"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { createSavedSearch, listSavedSearches } from "@/lib/projects/projects-api";
import {
  projectDetailPath,
  PROJECTS_BASE,
  projectsHelpPath,
  projectsProductivityPath,
} from "@/lib/projects/routes";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { createHttpSearchClient } from "@/lib/search/search-client";
import { SearchClientError } from "@/lib/search/search-errors";
import type { SearchHitViewModel } from "@/lib/search/search-types";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

const searchClient = createHttpSearchClient();

const FACET_TYPES = [
  { id: "all", label: "All types" },
  { id: "project", label: "Project" },
  { id: "commitment", label: "Commitment" },
  { id: "exception", label: "Exception" },
  { id: "decision", label: "Decision" },
  { id: "review", label: "Review" },
] as const;

function explainHit(hit: SearchHitViewModel): {
  owningObject: string;
  operationalRelationship: string;
  matchReason: string;
  scopeBreadcrumb: string;
  product: string;
} {
  const product =
    hit.productId === "projects" || !hit.productId
      ? "APZ Projects"
      : hit.productId.startsWith("APZ")
        ? hit.productId
        : `APZ ${hit.productId.charAt(0).toUpperCase()}${hit.productId.slice(1)}`;
  const objectType = hit.entityType || "object";
  const title = hit.title || "Untitled";
  return {
    owningObject:
      objectType === "project"
        ? `Project · ${title}`
        : `Owning project context · ${objectType}`,
    operationalRelationship:
      objectType === "project"
        ? "Primary operational scope"
        : `Linked operational object (${objectType})`,
    matchReason: hit.highlightSnippets[0]
      ? `Keyword match · ${hit.highlightSnippets[0]}`
      : hit.entityId
        ? `Identifier / title match · ${hit.entityId}`
        : "Title or keyword match",
    scopeBreadcrumb: `APZ Projects / ${objectType}`,
    product,
  };
}

export function ProjectsSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialQ = searchParams.get("q") ?? "";
  const initialType = searchParams.get("type") ?? "all";
  const scopeMode = searchParams.get("scope") === "apzhub" ? "apzhub" : "projects";
  const [q, setQ] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);
  const [typeFacet, setTypeFacet] = useState(initialType);
  const [saveName, setSaveName] = useState("");

  const params = useMemo(() => submitted.trim(), [submitted]);

  const query = useQuery({
    queryKey: projectsQueryKeys.search(`${params}|${typeFacet}|${scopeMode}`),
    queryFn: ({ signal }) =>
      searchClient.executeQuery(
        {
          query: {
            keywords: params,
            products: scopeMode === "projects" ? ["projects"] : undefined,
            page: 1,
            pageSize: 30,
            includeHighlights: true,
            includeFacets: true,
          },
        },
        { signal },
      ),
    enabled: params.length > 0,
  });

  const saved = useQuery({
    queryKey: [...projectsQueryKeys.all, "saved-searches"],
    queryFn: () => listSavedSearches(),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      createSavedSearch({
        name: saveName.trim() || `Search: ${params}`,
        query: params,
        facets: typeFacet !== "all" ? { type: typeFacet } : {},
        scopeMode: "global",
      }),
    onSuccess: async () => {
      setSaveName("");
      await queryClient.invalidateQueries({
        queryKey: [...projectsQueryKeys.all, "saved-searches"],
      });
    },
  });

  const hits = useMemo(() => {
    const all = query.data?.hits ?? [];
    if (typeFacet === "all") return all;
    return all.filter((hit) => hit.entityType === typeFacet);
  }, [query.data?.hits, typeFacet]);

  return (
    <PageShell
      title="Search"
      description="Find operational objects with owning context — permission-filtered at query time."
      breadcrumbs={["APZ Projects", "Search"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(projectsProductivityPath())}
          data-testid="projects-search-productivity-link"
        >
          Productivity
        </Button>
      }
    >
      <form
        className="flex flex-col gap-3"
        data-testid="projects-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          const next = q.trim();
          setSubmitted(next);
          const qs = new URLSearchParams();
          if (next) qs.set("q", next);
          if (typeFacet !== "all") qs.set("type", typeFacet);
          if (scopeMode === "apzhub") qs.set("scope", "apzhub");
          router.replace(`${PROJECTS_BASE}/search?${qs.toString()}`);
        }}
      >
        <Input
          label="Query"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          data-testid="projects-search-q"
          placeholder={
            scopeMode === "projects" ? "Search in APZ Projects" : "Search across APZHUB"
          }
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={scopeMode === "projects" ? "default" : "outline"}
            data-testid="projects-search-scope-projects"
            onClick={() => {
              const qs = new URLSearchParams(searchParams.toString());
              qs.delete("scope");
              router.replace(`${PROJECTS_BASE}/search?${qs.toString()}`);
            }}
          >
            APZ Projects
          </Button>
          <Button
            type="button"
            size="sm"
            variant={scopeMode === "apzhub" ? "default" : "outline"}
            data-testid="projects-search-scope-apzhub"
            onClick={() => {
              const qs = new URLSearchParams(searchParams.toString());
              qs.set("scope", "apzhub");
              router.replace(`${PROJECTS_BASE}/search?${qs.toString()}`);
            }}
          >
            APZHUB
          </Button>
          <Button type="submit" size="sm" data-testid="projects-search-submit">
            Search
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2" data-testid="projects-search-facets">
        {FACET_TYPES.map((facet) => (
          <Button
            key={facet.id}
            type="button"
            size="sm"
            variant={typeFacet === facet.id ? "default" : "outline"}
            onClick={() => setTypeFacet(facet.id)}
          >
            {facet.label}
          </Button>
        ))}
      </div>

      {params ? (
        <div
          className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--color-border)] p-3"
          data-testid="projects-search-save"
        >
          <div className="min-w-[12rem] flex-1">
            <Input
              label="Save search name"
              value={saveName}
              onChange={(event) => setSaveName(event.target.value)}
              placeholder="Personal saved search"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Save search
          </Button>
        </div>
      ) : null}

      {(saved.data?.length ?? 0) > 0 ? (
        <div data-testid="projects-saved-searches-inline">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Saved searches
          </p>
          <ul className="flex flex-wrap gap-2">
            {(saved.data ?? []).map((item) => (
              <li key={String(item.id)}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const queryText = String(item.query ?? "");
                    setQ(queryText);
                    setSubmitted(queryText);
                    router.replace(
                      `${PROJECTS_BASE}/search?q=${encodeURIComponent(queryText)}`,
                    );
                  }}
                >
                  {String(item.name ?? "Saved search")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!params ? (
        <EmptyState
          title="Enter a query"
          description="Results always show owning object, relationship, and match reason."
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
      {params && query.isSuccess && hits.length === 0 ? (
        <EmptyState
          title="No results"
          description="No permission-visible results matched this query and facets."
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
      {params && query.isSuccess && hits.length > 0 ? (
        <ul className="flex flex-col gap-2" data-testid="projects-search-results">
          {hits.map((hit) => {
            const explain = explainHit(hit);
            return (
              <li key={hit.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/20"
                  onClick={() => {
                    if (hit.entityType === "project" && hit.entityId) {
                      router.push(projectDetailPath(hit.entityId));
                      return;
                    }
                    if (hit.navigationTarget?.startsWith("/workspace/")) {
                      router.push(hit.navigationTarget);
                    }
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{hit.title || "Untitled result"}</p>
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      {explain.product}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                    {explain.scopeBreadcrumb}
                  </p>
                  <p className="mt-1 text-xs">
                    <span className="text-[var(--color-muted-foreground)]">
                      Owning object:{" "}
                    </span>
                    {explain.owningObject}
                  </p>
                  <p className="text-xs">
                    <span className="text-[var(--color-muted-foreground)]">
                      Relationship:{" "}
                    </span>
                    {explain.operationalRelationship}
                  </p>
                  <p className="text-xs">
                    <span className="text-[var(--color-muted-foreground)]">
                      Match reason:{" "}
                    </span>
                    {explain.matchReason}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </PageShell>
  );
}

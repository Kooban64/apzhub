"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowDefinitions,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowDefinitionDetailPath } from "@/lib/workflow/routes";
import { listWorkflowDefinitions } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./workflow-ui";

export function WorkflowSearchView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowDefinitions(permissions);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  const query = useQuery({
    queryKey: workflowQueryKeys.search(submitted),
    queryFn: ({ signal }) =>
      listWorkflowDefinitions({ limit: 50, query: submitted || undefined }, { signal }),
    enabled: canView && submitted.length > 0,
  });

  return (
    <PageShell
      title="Search Results"
      description="Search the workflow definition catalogue."
    >
      {!canView ? <EmptyState title="No access" /> : null}
      {canView ? (
        <form
          className="flex flex-wrap gap-2"
          data-testid="workflow-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(q.trim());
          }}
        >
          <input
            className="min-w-[16rem] flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search definitions…"
            data-testid="workflow-search-q"
            aria-label="Search workflow definitions"
          />
          <Button type="submit" size="sm" data-testid="workflow-search-submit">
            Search
          </Button>
        </form>
      ) : null}
      {canView && submitted && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error) ? query.error.message : "Search failed."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && submitted && query.data ? (
        <section data-testid="workflow-search-results">
          {query.data.items.length === 0 ? (
            <EmptyState
              title="No matches"
              description={`No definitions matched “${submitted}”.`}
            />
          ) : (
            <ul className="mt-4 space-y-2">
              {query.data.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                    data-testid={`workflow-search-row-${item.id}`}
                    onClick={() => router.push(workflowDefinitionDetailPath(item.id))}
                  >
                    <span className="font-medium">{item.name}</span>
                    <StatusBadge status={String(item.lifecycle)} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </PageShell>
  );
}

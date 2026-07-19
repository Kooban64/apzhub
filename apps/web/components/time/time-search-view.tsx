"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { timeQueryKeys } from "@/lib/time/query-keys";
import {
  activitiesPath,
  customersPath,
  tagsPath,
  TIME_BASE,
  timesheetDetailPath,
  timeHealthPath,
} from "@/lib/time/routes";
import { searchTime } from "@/lib/time/time-api";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./time-ui";

export function TimeSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);

  const params = useMemo(() => submitted.trim(), [submitted]);

  const query = useQuery({
    queryKey: timeQueryKeys.search(params),
    queryFn: ({ signal }) => searchTime(params, { signal, limit: 30 }),
    enabled: params.length > 0,
  });

  function navigateHit(type: string, id: string) {
    switch (type) {
      case "timesheet":
        router.push(timesheetDetailPath(id));
        break;
      case "activity":
        router.push(activitiesPath());
        break;
      case "customer":
        router.push(customersPath());
        break;
      case "tag":
        router.push(tagsPath());
        break;
      default:
        router.push(TIME_BASE);
    }
  }

  return (
    <PageShell
      title="Search"
      description="Foundation Time search across timesheets, activities, customers, projects, and tags."
    >
      <form
        className="flex flex-col gap-3"
        data-testid="time-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          const next = q.trim();
          setSubmitted(next);
          router.replace(`${TIME_BASE}/search?q=${encodeURIComponent(next)}`);
        }}
      >
        <Input
          label="Query"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          data-testid="time-search-q"
        />
        <Button type="submit" size="sm" data-testid="time-search-submit">
          Search
        </Button>
      </form>

      {!params ? (
        <EmptyState
          title="Enter a query"
          description="Search uses the Platform Time search composition endpoint."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(timeHealthPath())}
              data-testid="time-search-health-link"
            >
              Open Time health
            </Button>
          }
        />
      ) : null}
      {params && query.isLoading ? <LoadingState label="Searching…" /> : null}
      {params && query.isError ? (
        <ErrorState
          message={
            isTimeApiError(query.error)
              ? query.error.message
              : "Search is temporarily unavailable."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {params && query.isSuccess && query.data.items.length === 0 ? (
        <EmptyState
          title="No results"
          description="No Time hits matched this query."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(timeHealthPath())}
              data-testid="time-search-empty-health-link"
            >
              Open Time health
            </Button>
          }
        />
      ) : null}
      {params && query.isSuccess && query.data.items.length > 0 ? (
        <ul className="flex flex-col gap-2" data-testid="time-search-results">
          {query.data.items.map((hit) => (
            <li key={`${hit.type}-${hit.id}`}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/20"
                onClick={() => navigateHit(hit.type, hit.id)}
                data-testid={`time-search-hit-${hit.id}`}
              >
                <p className="font-medium">{hit.label || hit.id}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {hit.type}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}

"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { formatSearchHitKind, formatSupportDate } from "@/lib/support/format";
import { supportQueryKeys } from "@/lib/support/query-keys";
import { SUPPORT_BASE, supportRequestDetailPath } from "@/lib/support/routes";
import { searchSupport } from "@/lib/support/support-api";
import type { SupportSearchHitKind } from "@/lib/support/types";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./support-ui";

const KIND_OPTIONS: readonly SupportSearchHitKind[] = [
  "support_request",
  "organization",
  "group",
  "user",
  "article",
];

export function SupportSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);
  const [kinds, setKinds] = useState<SupportSearchHitKind[]>([]);

  const params = useMemo(
    () => ({
      q: submitted,
      kinds: kinds.length > 0 ? kinds : undefined,
      limit: 30,
    }),
    [submitted, kinds],
  );

  const query = useQuery({
    queryKey: supportQueryKeys.search(params),
    queryFn: ({ signal }) => searchSupport(params, { signal }),
    enabled: submitted.trim().length > 0,
  });

  function toggleKind(kind: SupportSearchHitKind) {
    setKinds((current) =>
      current.includes(kind)
        ? current.filter((item) => item !== kind)
        : [...current, kind],
    );
  }

  function navigateHit(
    kind: SupportSearchHitKind,
    id: string,
    supportRequestId?: string,
  ) {
    if (kind === "support_request") {
      router.push(supportRequestDetailPath(id));
      return;
    }
    if (kind === "article" && supportRequestId) {
      router.push(supportRequestDetailPath(supportRequestId));
      return;
    }
    if (kind === "organization") {
      router.push(`${SUPPORT_BASE}/organizations/${id}`);
      return;
    }
    if (kind === "group") {
      router.push(`${SUPPORT_BASE}/groups/${id}`);
      return;
    }
    if (kind === "user") {
      router.push(`${SUPPORT_BASE}/users/${id}`);
    }
  }

  return (
    <PageShell
      title="Search"
      description="Search across Support requests, orgs, groups, users, and articles."
    >
      <form
        className="flex flex-col gap-3"
        data-testid="support-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(q.trim());
          router.replace(`${SUPPORT_BASE}/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <Input
          label="Query"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          data-testid="support-search-q"
        />
        <fieldset className="flex flex-wrap gap-3">
          <legend className="text-sm font-medium">Kinds</legend>
          {KIND_OPTIONS.map((kind) => (
            <label key={kind} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={kinds.includes(kind)}
                onChange={() => toggleKind(kind)}
                data-testid={`support-search-kind-${kind}`}
              />
              {formatSearchHitKind(kind)}
            </label>
          ))}
        </fieldset>
        <div>
          <Button type="submit" size="sm" data-testid="support-search-submit">
            Search
          </Button>
        </div>
      </form>

      {!submitted ? (
        <EmptyState
          title="Enter a query"
          description="Search Support resources by keyword."
        />
      ) : null}
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isSupportApiError(query.error) ? query.error.message : "Search failed."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && query.data.data.hits.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try a different query or kind filter."
        />
      ) : null}
      {query.isSuccess && query.data.data.hits.length > 0 ? (
        <ul className="space-y-2" data-testid="support-search-results">
          {query.data.data.hits.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                onClick={() => navigateHit(hit.kind, hit.id, hit.supportTicketId)}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                  <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5 font-medium text-[var(--color-foreground)]">
                    {formatSearchHitKind(hit.kind)}
                  </span>
                  {hit.updatedAt ? (
                    <span>{formatSupportDate(hit.updatedAt)}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-medium">{hit.title}</p>
                {hit.snippet ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {hit.snippet}
                  </p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}

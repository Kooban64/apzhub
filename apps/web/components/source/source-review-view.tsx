"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { SOURCE_ROUTES } from "@/lib/source/routes";

type PullRequestRow = {
  number: number;
  title: string;
  state: string;
  sourceBranch?: string;
  targetBranch?: string;
  updatedAt?: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

/**
 * Phase F — Review centre: list change requests and merge when entitled.
 */
export function SourceReviewView({
  repositoryId,
  canWrite,
}: {
  readonly repositoryId: string;
  readonly canWrite: boolean;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["source-workspace", "pull-requests", repositoryId],
    queryFn: () =>
      fetchJson<{ pullRequests: PullRequestRow[] }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/pull-requests?state=all`,
      ),
  });

  const pullRequests = listQuery.data?.pullRequests ?? [];
  const active = pullRequests.find((row) => row.number === selected) ?? null;

  const mergeMutation = useMutation({
    mutationFn: async (number: number) =>
      fetchJson<{ pullRequest: PullRequestRow }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/pull-requests/${number}/merge`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ method: "merge" }),
        },
      ),
    onSuccess: async (data) => {
      setStatus(`Merged #${data.pullRequest.number}`);
      await queryClient.invalidateQueries({
        queryKey: ["source-workspace", "pull-requests", repositoryId],
      });
    },
    onError: (error) => setStatus((error as Error).message),
  });

  return (
    <div className="space-y-4" data-testid="source-review-view">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Review</h2>
        <Link
          href={SOURCE_ROUTES.repository(repositoryId)}
          className="text-xs underline"
        >
          ← Files
        </Link>
      </div>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Change requests for this APZ repository. Merge requires source.write.
      </p>
      {status ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">{status}</p>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--color-border)] p-3">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Change requests
          </h3>
          {listQuery.isLoading ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
          ) : null}
          {pullRequests.length === 0 && !listQuery.isLoading ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No change requests yet. Create one from the Files workspace.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {pullRequests.map((row) => (
                <li key={row.number}>
                  <button
                    type="button"
                    className={`w-full rounded border px-3 py-2 text-left ${
                      selected === row.number
                        ? "border-[var(--color-primary)]"
                        : "border-[var(--color-border)]"
                    }`}
                    onClick={() => setSelected(row.number)}
                    data-testid={`source-pr-${row.number}`}
                  >
                    <span className="font-medium">
                      #{row.number} {row.title}
                    </span>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">
                      {row.state}
                      {row.sourceBranch ? ` · ${row.sourceBranch}` : ""}
                      {row.targetBranch ? ` → ${row.targetBranch}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Detail
          </h3>
          {!active ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Select a change request.
            </p>
          ) : (
            <div className="space-y-3">
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Title</dt>
                  <dd>{active.title}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">State</dt>
                  <dd>{active.state}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Source</dt>
                  <dd>{active.sourceBranch ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Target</dt>
                  <dd>{active.targetBranch ?? "—"}</dd>
                </div>
              </dl>
              {canWrite && active.state === "open" ? (
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-muted)]"
                  disabled={mergeMutation.isPending}
                  onClick={() => mergeMutation.mutate(active.number)}
                  data-testid="source-merge-pr"
                >
                  Merge
                </button>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

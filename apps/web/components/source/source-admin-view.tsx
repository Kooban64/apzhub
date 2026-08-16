"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { SOURCE_ROUTES } from "@/lib/source/routes";
import { QEP_SCM_ROUTES } from "@/lib/qep/routes";

type RepositoryRow = {
  repositoryId: string;
  fullName: string;
  providerId: string;
  state: string;
  defaultBranch: string;
  health?: { ok: boolean; detail?: string };
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
 * Phase F — Repo Admin: registration posture, sync, enable/disable.
 */
export function SourceAdminView({
  repositoryId,
  canWrite,
}: {
  readonly repositoryId: string;
  readonly canWrite: boolean;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["source-workspace", "repository", repositoryId],
    queryFn: () =>
      fetchJson<{ repository: RepositoryRow }>(
        `/api/v1/qep/scm/repositories/${encodeURIComponent(repositoryId)}`,
      ),
  });

  const repository = detailQuery.data?.repository;

  const syncMutation = useMutation({
    mutationFn: async () =>
      fetchJson<{ repository: RepositoryRow }>(
        `/api/v1/qep/scm/repositories/${encodeURIComponent(repositoryId)}/sync`,
        { method: "POST" },
      ),
    onSuccess: async () => {
      setStatus("Sync completed");
      await queryClient.invalidateQueries({ queryKey: ["source-workspace"] });
    },
    onError: (error) => setStatus((error as Error).message),
  });

  const stateMutation = useMutation({
    mutationFn: async (state: "enabled" | "disabled") =>
      fetchJson<{ repository: RepositoryRow }>(
        `/api/v1/qep/scm/repositories/${encodeURIComponent(repositoryId)}/state`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ state }),
        },
      ),
    onSuccess: async (data) => {
      setStatus(`State → ${data.repository.state}`);
      await queryClient.invalidateQueries({ queryKey: ["source-workspace"] });
    },
    onError: (error) => setStatus((error as Error).message),
  });

  return (
    <div className="space-y-4" data-testid="source-admin-view">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Repository admin</h2>
        <div className="flex gap-3 text-xs">
          <Link href={SOURCE_ROUTES.repository(repositoryId)} className="underline">
            ← Files
          </Link>
          <Link href={QEP_SCM_ROUTES.home} className="underline">
            Quality overlays
          </Link>
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Registration health and sync. Provider credentials stay server-side.
      </p>
      {status ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">{status}</p>
      ) : null}
      {detailQuery.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {repository ? (
        <dl className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Repository</dt>
            <dd>{repository.fullName}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Default branch</dt>
            <dd>{repository.defaultBranch}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">State</dt>
            <dd>{repository.state}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Adapter</dt>
            <dd className="font-mono text-xs">{repository.providerId}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Health</dt>
            <dd>
              {repository.health?.ok === false
                ? (repository.health.detail ?? "unhealthy")
                : "ok"}
            </dd>
          </div>
        </dl>
      ) : null}
      {canWrite ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-muted)]"
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
            data-testid="source-admin-sync"
          >
            Sync now
          </button>
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-muted)]"
            disabled={stateMutation.isPending}
            onClick={() =>
              stateMutation.mutate(
                repository?.state === "disabled" ? "enabled" : "disabled",
              )
            }
            data-testid="source-admin-toggle-state"
          >
            {repository?.state === "disabled" ? "Enable" : "Disable"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Read only — sync/state changes require write entitlement.
        </p>
      )}
    </div>
  );
}

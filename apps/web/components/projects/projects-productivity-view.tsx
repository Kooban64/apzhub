"use client";

/**
 * W009 / PX-06 — Productivity workspace: favourites, recents, saved searches,
 * sessions, bulk ops, cross-product navigation. No consumer personalisation.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  fetchPersonalisationFavorites,
  fetchPersonalisationRecent,
} from "@/lib/platform-operations/ops-api";
import {
  confirmBulkOperation,
  createBulkOperation,
  createProductivitySession,
  createSavedSearch,
  deleteSavedSearch,
  listCrossProductTargets,
  listProductivitySessions,
  listSavedSearches,
  resumeProductivitySession,
} from "@/lib/projects/projects-api";
import { PROJECTS_BASE, projectsSearchPath } from "@/lib/projects/routes";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

export function ProjectsProductivityView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [bulkIds, setBulkIds] = useState("");
  const [bulkToken, setBulkToken] = useState("");
  const [pendingBulkId, setPendingBulkId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState("Weekly Review");
  const [saveName, setSaveName] = useState("");
  const [saveQuery, setSaveQuery] = useState("");

  const favourites = useQuery({
    queryKey: [...projectsQueryKeys.all, "favourites"],
    queryFn: () => fetchPersonalisationFavorites(),
  });
  const recent = useQuery({
    queryKey: [...projectsQueryKeys.all, "recent"],
    queryFn: () => fetchPersonalisationRecent(),
  });
  const saved = useQuery({
    queryKey: [...projectsQueryKeys.all, "saved-searches"],
    queryFn: () => listSavedSearches(),
  });
  const sessions = useQuery({
    queryKey: [...projectsQueryKeys.all, "productivity-sessions"],
    queryFn: () => listProductivitySessions(),
  });
  const crossProduct = useQuery({
    queryKey: [...projectsQueryKeys.all, "cross-product"],
    queryFn: () => listCrossProductTargets(),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      createSavedSearch({
        name: saveName.trim(),
        query: saveQuery.trim(),
        scopeMode: "global",
      }),
    onSuccess: async () => {
      setSaveName("");
      setSaveQuery("");
      await queryClient.invalidateQueries({
        queryKey: [...projectsQueryKeys.all, "saved-searches"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedSearch(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...projectsQueryKeys.all, "saved-searches"],
      });
    },
  });

  const bulkPrepare = useMutation({
    mutationFn: () =>
      createBulkOperation({
        kind: "ack_announcements",
        objectIds: bulkIds
          .split(/[\s,]+/)
          .map((v) => v.trim())
          .filter(Boolean),
      }),
    onSuccess: (op) => {
      setPendingBulkId(String(op.id));
      setBulkToken(String(op.confirmationToken ?? ""));
    },
  });

  const bulkConfirm = useMutation({
    mutationFn: () =>
      confirmBulkOperation(pendingBulkId ?? "", {
        confirmationToken: bulkToken,
        auditNote: "Confirmed via Productivity workspace",
      }),
    onSuccess: () => {
      setPendingBulkId(null);
      setBulkToken("");
      setBulkIds("");
    },
  });

  const sessionCreate = useMutation({
    mutationFn: () =>
      createProductivitySession({
        type: sessionType,
        scopeSnapshot: { route: PROJECTS_BASE },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...projectsQueryKeys.all, "productivity-sessions"],
      });
    },
  });

  const sessionResume = useMutation({
    mutationFn: (id: string) => resumeProductivitySession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...projectsQueryKeys.all, "productivity-sessions"],
      });
      router.push(PROJECTS_BASE);
    },
  });

  return (
    <PageShell
      title="Productivity"
      description="Personal efficiency aids — Favourites, Recents, Saved searches, Sessions, Bulk operations, and Cross-product navigation. Not a personalised feed."
      breadcrumbs={["APZ Projects", "Productivity"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(projectsSearchPath())}
        >
          Open Search
        </Button>
      }
    >
      <div className="space-y-8" data-testid="projects-productivity">
        <section data-testid="projects-favourites">
          <h2 className="text-sm font-semibold">Favourites</h2>
          <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Private pins only — never grant permissions.
          </p>
          {favourites.isLoading ? <LoadingState label="Loading favourites…" /> : null}
          {favourites.isError ? (
            <ErrorState
              message="Favourites unavailable."
              onRetry={() => void favourites.refetch()}
            />
          ) : null}
          {!favourites.isLoading && (favourites.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No favourites"
              description="Pin projects, programmes, reports, or saved searches from their surfaces."
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {(favourites.data as Array<Record<string, unknown>> | undefined)?.map(
                (item, index) => (
                  <li
                    key={`${String(item.itemKey ?? item.id ?? index)}`}
                    className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                  >
                    {String(item.label ?? item.itemKey ?? "Favourite")}
                  </li>
                ),
              )}
            </ul>
          )}
        </section>

        <section data-testid="projects-recents">
          <h2 className="text-sm font-semibold">Recent items</h2>
          <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Most recently opened operational objects (bounded, permissioned).
          </p>
          {recent.isLoading ? <LoadingState label="Loading recent items…" /> : null}
          {!recent.isLoading && (recent.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No recent items"
              description="Open projects and operational objects to populate this list."
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {(recent.data as Array<Record<string, unknown>> | undefined)?.map(
                (item, index) => (
                  <li
                    key={`${String(item.itemKey ?? item.id ?? index)}`}
                    className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                  >
                    {String(item.label ?? item.itemKey ?? "Recent item")}
                  </li>
                ),
              )}
            </ul>
          )}
        </section>

        <section data-testid="projects-saved-searches">
          <h2 className="text-sm font-semibold">Saved searches</h2>
          <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Personal only — permissions re-evaluated at run time.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <Input
              label="Name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <Input
              label="Query"
              value={saveQuery}
              onChange={(e) => setSaveQuery(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={!saveName.trim() || !saveQuery.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Save
            </Button>
          </div>
          <ul className="flex flex-col gap-1">
            {(saved.data ?? []).map((item) => (
              <li
                key={String(item.id)}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  className="text-left font-medium hover:underline"
                  onClick={() =>
                    router.push(
                      `${projectsSearchPath()}?q=${encodeURIComponent(String(item.query ?? ""))}`,
                    )
                  }
                >
                  {String(item.name)}
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(String(item.id))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section data-testid="projects-productivity-sessions">
          <h2 className="text-sm font-semibold">Productivity sessions</h2>
          <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Private working continuity — not Operational Reviews.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <Input
              label="Session type"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={!sessionType.trim() || sessionCreate.isPending}
              onClick={() => sessionCreate.mutate()}
            >
              Start session
            </Button>
          </div>
          <ul className="flex flex-col gap-1">
            {(sessions.data ?? []).map((item) => (
              <li
                key={String(item.id)}
                className="flex items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <span>
                  {String(item.name ?? item.type)} · last resumed{" "}
                  {String(item.lastResumedAt ?? "")}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => sessionResume.mutate(String(item.id))}
                >
                  Resume
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section data-testid="projects-bulk-operations">
          <h2 className="text-sm font-semibold">Bulk operations</h2>
          <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Explicit multi-select · confirm · audit. No silent lifecycle skips.
          </p>
          <Input
            label="Object IDs (comma-separated)"
            value={bulkIds}
            onChange={(e) => setBulkIds(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!bulkIds.trim() || bulkPrepare.isPending}
              onClick={() => bulkPrepare.mutate()}
            >
              Prepare ack announcements
            </Button>
            {pendingBulkId ? (
              <Button
                type="button"
                size="sm"
                disabled={bulkConfirm.isPending}
                onClick={() => bulkConfirm.mutate()}
                data-testid="projects-bulk-confirm"
              >
                Confirm with audit
              </Button>
            ) : null}
          </div>
          {pendingBulkId ? (
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Pending confirmation for {pendingBulkId}. Token retained for audit
              handshake.
            </p>
          ) : null}
        </section>

        <section data-testid="projects-cross-product">
          <h2 className="text-sm font-semibold">Cross-product navigation</h2>
          <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Jump via APZHUB shell routes — APZHUB product names only.
          </p>
          <ul className="flex flex-col gap-2">
            {(crossProduct.data ?? []).map((target) => (
              <li key={String(target.product)}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/20"
                  onClick={() => router.push(String(target.href))}
                >
                  <p className="font-medium">{String(target.label)}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {String(target.description)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}

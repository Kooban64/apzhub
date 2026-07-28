"use client";

import type {
  QepVerificationDto,
  QepVerificationHistorySummaryDto,
} from "@apzhub/qep-contracts";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import {
  assignVerification,
  cancelVerification,
  completeVerification,
  createVerification,
  expireVerification,
  getVerification,
  getVerificationHistory,
  listVerifications,
  rejectVerification,
  requestVerification,
  retireVerification,
  startVerification,
  supersedeVerification,
  updateVerificationPriority,
  updateVerificationRationale,
  withdrawVerification,
  type QepVerificationListParams,
} from "@/lib/qep/qep-verification-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_REQUIREMENTS_ROUTES,
  QEP_TRACEABILITY_ROUTES,
  QEP_VERIFICATION_ROUTES,
  isQepVerificationDashboardRoute,
  isQepVerificationHistoryRoute,
  isQepVerificationNewRoute,
  isQepVerificationQueueRoute,
  isQepVerificationSearchRoute,
  isQepVerificationSupersedeRoute,
  isQepVerificationTeamRoute,
  parseQepVerificationRouteId,
} from "@/lib/qep/routes";
import { emitQepWorkbenchTelemetry } from "@/lib/qep/telemetry";
import { executeSearchQuery } from "@/lib/search/search-api";

import {
  QepEmptyState,
  QepErrorState,
  QepFilterBar,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

const PAGE_SIZE = 50;
const DEFAULT_ACTOR_ID = "workbench-user";
const SUBJECT_KIND_OPTIONS = [
  "requirement",
  "requirement_content_version",
  "requirement_baseline",
  "trace_link",
  "test_specification",
  "test_case",
  "test_execution",
  "evidence",
] as const;
const STATUS_OPTIONS = [
  "draft",
  "requested",
  "assigned",
  "in_progress",
  "verified",
  "rejected",
  "expired",
  "withdrawn",
  "superseded",
  "cancelled",
  "retired",
] as const;
const OUTCOME_OPTIONS = [
  "verified",
  "failed",
  "partially_verified",
  "not_verified",
  "inconclusive",
  "blocked",
  "deferred",
  "waived",
] as const;
const PRIORITY_OPTIONS = ["critical", "high", "medium", "low"] as const;

export type VerificationQueueId =
  | "my_work"
  | "assigned"
  | "requested"
  | "awaiting_review"
  | "rejected"
  | "expired"
  | "completed"
  | "overdue"
  | "recently_updated";

const QUEUE_DEFS: readonly {
  readonly id: VerificationQueueId;
  readonly label: string;
  readonly status?: string;
}[] = [
  { id: "my_work", label: "My Work", status: "assigned" },
  { id: "assigned", label: "Assigned", status: "assigned" },
  { id: "requested", label: "Requested", status: "requested" },
  { id: "awaiting_review", label: "Awaiting Review", status: "in_progress" },
  { id: "rejected", label: "Rejected", status: "rejected" },
  { id: "expired", label: "Expired", status: "expired" },
  { id: "completed", label: "Completed", status: "verified" },
  { id: "overdue", label: "Overdue", status: "assigned" },
  { id: "recently_updated", label: "Recently Updated" },
];

function formatDate(value?: string): string {
  return value ? value : "—";
}

function subjectLabel(v: QepVerificationDto): string {
  return `${v.subject.kind}:${v.subject.artefactId}`;
}

function isTerminalStatus(status: string): boolean {
  return [
    "verified",
    "rejected",
    "expired",
    "withdrawn",
    "superseded",
    "cancelled",
    "retired",
  ].includes(status);
}

function GovernedUnavailable({ capability }: { readonly capability: string }) {
  return (
    <p
      className="rounded-md border border-dashed border-[var(--color-border)] p-3 text-sm text-[var(--color-muted-foreground)]"
      role="status"
      data-testid="qep-verification-unavailable"
    >
      {capability} is not available in this platform baseline.
    </p>
  );
}

function SubjectNavigation({
  verification,
}: {
  readonly verification: QepVerificationDto;
}) {
  const kind = verification.subject.kind;
  const id = verification.subject.artefactId;

  if (
    kind === "requirement" ||
    kind === "requirement_content_version" ||
    kind === "requirement_baseline"
  ) {
    const href =
      kind === "requirement"
        ? QEP_REQUIREMENTS_ROUTES.detail(id)
        : QEP_REQUIREMENTS_ROUTES.list;
    return (
      <Link
        href={href}
        className="underline"
        data-testid="qep-verification-nav-requirement"
      >
        Open Requirement context
      </Link>
    );
  }
  if (kind === "trace_link") {
    return (
      <Link
        href={QEP_TRACEABILITY_ROUTES.detail(id)}
        className="underline"
        data-testid="qep-verification-nav-trace"
      >
        Open Trace Link
      </Link>
    );
  }
  if (kind === "test_specification") {
    return <GovernedUnavailable capability="Test Specification navigation" />;
  }
  if (kind === "test_case") {
    return <GovernedUnavailable capability="Test Case navigation" />;
  }
  if (kind === "test_execution") {
    return <GovernedUnavailable capability="Execution navigation" />;
  }
  if (kind === "evidence") {
    return <GovernedUnavailable capability="Evidence navigation" />;
  }
  return <GovernedUnavailable capability="Subject navigation" />;
}

function applyPresentationQueueFilter(
  items: readonly QepVerificationDto[],
  queue: VerificationQueueId,
  actorId: string,
): readonly QepVerificationDto[] {
  if (queue === "my_work") {
    return items.filter(
      (item) =>
        item.assignedTo === actorId ||
        (item.status === "assigned" && item.authority.actorId === actorId),
    );
  }
  if (queue === "overdue") {
    return items.filter((item) => {
      const due = item.metadata.dueAt ?? item.metadata.due_at;
      if (!due || isTerminalStatus(item.status)) return false;
      return Date.parse(due) < Date.now();
    });
  }
  return items;
}

function queueListParams(
  queue: VerificationQueueId,
  offset: number,
): QepVerificationListParams {
  const def = QUEUE_DEFS.find((entry) => entry.id === queue);
  return {
    ...(def?.status ? { status: def.status } : {}),
    limit: PAGE_SIZE,
    offset,
  };
}

/* ─── Explorer ─────────────────────────────────────────────────────────── */

export function QepVerificationExplorerView({
  title = "Verification Explorer",
  description = "Browse, filter, and open Verification records.",
  queue,
  teamMode = false,
}: {
  readonly title?: string;
  readonly description?: string;
  readonly queue?: VerificationQueueId;
  readonly teamMode?: boolean;
}) {
  const searchParams = useSearchParams();
  const initialQueue =
    queue ?? ((searchParams.get("view") as VerificationQueueId | null) || undefined);
  const [status, setStatus] = useState(
    initialQueue ? (queueListParams(initialQueue, 0).status ?? "") : "",
  );
  const [outcome, setOutcome] = useState("");
  const [subjectKind, setSubjectKind] = useState("");
  const [groupBy, setGroupBy] = useState<"none" | "status" | "priority" | "assignee">(
    "none",
  );
  const [sortKey, setSortKey] = useState<
    "updatedAt" | "createdAt" | "priority" | "status"
  >("updatedAt");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [savedViewName, setSavedViewName] = useState("");
  const [savedViews, setSavedViews] = useState<
    readonly { name: string; status: string; outcome: string }[]
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("qep.verification.savedViews");
      if (raw) {
        setSavedViews(
          JSON.parse(raw) as { name: string; status: string; outcome: string }[],
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  const params: QepVerificationListParams = useMemo(() => {
    if (initialQueue) return queueListParams(initialQueue, offset);
    return {
      ...(status ? { status } : {}),
      ...(outcome ? { outcome } : {}),
      ...(subjectKind ? { subjectKind } : {}),
      limit: PAGE_SIZE,
      offset,
    };
  }, [initialQueue, status, outcome, subjectKind, offset]);

  const query = useQuery({
    queryKey: qepQueryKeys.verification.list({
      ...params,
      queue: initialQueue,
      teamMode,
    }),
    queryFn: ({ signal }) => listVerifications(params, { signal }),
  });

  const items = useMemo(() => {
    const base = query.data?.items ?? [];
    const filtered = initialQueue
      ? applyPresentationQueueFilter(base, initialQueue, DEFAULT_ACTOR_ID)
      : base;
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "priority") return a.priority.localeCompare(b.priority);
      if (sortKey === "status") return a.status.localeCompare(b.status);
      if (sortKey === "createdAt") return b.createdAt.localeCompare(a.createdAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
    return sorted;
  }, [query.data?.items, initialQueue, sortKey]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return { All: items };
    const map: Record<string, QepVerificationDto[]> = {};
    for (const item of items) {
      const key =
        groupBy === "status"
          ? item.status
          : groupBy === "priority"
            ? item.priority
            : (item.assignedTo ?? "unassigned");
      map[key] = map[key] ?? [];
      map[key].push(item);
    }
    return map;
  }, [items, groupBy]);

  const total = query.data?.total ?? items.length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function saveView() {
    if (!savedViewName.trim()) return;
    const next = [
      ...savedViews.filter((view) => view.name !== savedViewName.trim()),
      { name: savedViewName.trim(), status, outcome },
    ];
    setSavedViews(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("qep.verification.savedViews", JSON.stringify(next));
    }
    setSavedViewName("");
  }

  return (
    <QepPageShell
      title={title}
      description={description}
      breadcrumbs={["Verification", title]}
      actions={
        <Link
          href={QEP_VERIFICATION_ROUTES.new}
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm text-[var(--color-primary-foreground)]"
          data-testid="qep-verification-create"
        >
          New Verification
        </Link>
      }
    >
      {teamMode ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
          Team queue — presentation filter over server list (no client-owned business
          rules).
        </p>
      ) : null}

      <QepFilterBar>
        {!initialQueue ? (
          <>
            <label className="text-xs">
              Status
              <select
                className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setOffset(0);
                }}
                data-testid="qep-verification-status-filter"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              Outcome
              <select
                className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                value={outcome}
                onChange={(event) => {
                  setOutcome(event.target.value);
                  setOffset(0);
                }}
                data-testid="qep-verification-outcome-filter"
              >
                <option value="">All</option>
                {OUTCOME_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              Subject kind
              <select
                className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                value={subjectKind}
                onChange={(event) => {
                  setSubjectKind(event.target.value);
                  setOffset(0);
                }}
                data-testid="qep-verification-subject-filter"
              >
                <option value="">All</option>
                {SUBJECT_KIND_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <div
            className="flex flex-wrap gap-2"
            data-testid="qep-verification-queue-tabs"
          >
            {QUEUE_DEFS.map((def) => (
              <Link
                key={def.id}
                href={`${QEP_VERIFICATION_ROUTES.queue}?view=${def.id}`}
                className={`rounded-md border px-2 py-1 text-xs ${
                  initialQueue === def.id
                    ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
                }`}
              >
                {def.label}
              </Link>
            ))}
          </div>
        )}
        <label className="text-xs">
          Sort
          <select
            className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            data-testid="qep-verification-sort"
          >
            <option value="updatedAt">Updated</option>
            <option value="createdAt">Created</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </label>
        <label className="text-xs">
          Group
          <select
            className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value as typeof groupBy)}
            data-testid="qep-verification-group"
          >
            <option value="none">None</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="assignee">Assignee</option>
          </select>
        </label>
        <label className="text-xs">
          Save view
          <div className="mt-1 flex gap-1">
            <Input
              value={savedViewName}
              onChange={(event) => setSavedViewName(event.target.value)}
              placeholder="View name"
              data-testid="qep-verification-saved-view-name"
            />
            <Button type="button" size="sm" variant="outline" onClick={saveView}>
              Save
            </Button>
          </div>
        </label>
        {savedViews.length > 0 ? (
          <label className="text-xs">
            Saved
            <select
              className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              defaultValue=""
              onChange={(event) => {
                const view = savedViews.find(
                  (entry) => entry.name === event.target.value,
                );
                if (!view) return;
                setStatus(view.status);
                setOutcome(view.outcome);
                setOffset(0);
              }}
              data-testid="qep-verification-saved-views"
            >
              <option value="">Select…</option>
              {savedViews.map((view) => (
                <option key={view.name} value={view.name}>
                  {view.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </QepFilterBar>

      {query.isLoading ? <QepLoadingState label="Loading verifications…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={
            query.error instanceof Error ? query.error.message : "Failed to load"
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <QepEmptyState title="No verifications match this view." />
      ) : null}

      {query.isSuccess && items.length > 0 ? (
        <div
          className="max-h-[70vh] overflow-auto"
          data-testid="qep-verification-virtual-list"
          role="region"
          aria-label="Verification list"
        >
          {Object.entries(grouped).map(([group, rows]) => (
            <div key={group} className="mb-4">
              {groupBy !== "none" ? (
                <h2 className="mb-2 text-sm font-medium text-[var(--color-muted-foreground)]">
                  {group} ({rows.length})
                </h2>
              ) : null}
              <QepTable
                caption="Verifications"
                columns={[
                  "Select",
                  "ID",
                  "Subject",
                  "Status",
                  "Outcome",
                  "Priority",
                  "Owner",
                  "Version",
                  "Updated",
                ]}
                rows={rows.map((item) => ({
                  id: item.id,
                  href: QEP_VERIFICATION_ROUTES.detail(item.id),
                  cells: [
                    <input
                      key={`sel-${item.id}`}
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      aria-label={`Select ${item.id}`}
                      data-testid={`qep-verification-select-${item.id}`}
                    />,
                    <Link
                      key={`id-${item.id}`}
                      href={QEP_VERIFICATION_ROUTES.detail(item.id)}
                      className="underline"
                    >
                      {item.id}
                    </Link>,
                    subjectLabel(item),
                    <span
                      key={`st-${item.id}`}
                      className="inline-flex items-center gap-1"
                    >
                      <QepStatusBadge status={item.status} />
                      <span>{item.status}</span>
                    </span>,
                    item.outcome ?? "—",
                    item.priority,
                    item.assignedTo ?? item.authority.actorId,
                    String(item.revision),
                    formatDate(item.updatedAt),
                  ],
                }))}
              />
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <span data-testid="qep-verification-page-summary">
              Showing {items.length} of {total}
              {selected.size > 0 ? ` · ${selected.size} selected` : ""}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                data-testid="qep-verification-next-page"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </QepPageShell>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────────────── */

export function QepVerificationDashboardView() {
  const myQueue = useQuery({
    queryKey: qepQueryKeys.verification.list({ queue: "my_work" }),
    queryFn: ({ signal }) =>
      listVerifications({ status: "assigned", limit: 20 }, { signal }),
  });
  const pending = useQuery({
    queryKey: qepQueryKeys.verification.list({ queue: "awaiting_review" }),
    queryFn: ({ signal }) =>
      listVerifications({ status: "in_progress", limit: 20 }, { signal }),
  });
  const rejected = useQuery({
    queryKey: qepQueryKeys.verification.list({ queue: "rejected" }),
    queryFn: ({ signal }) =>
      listVerifications({ status: "rejected", limit: 20 }, { signal }),
  });
  const completed = useQuery({
    queryKey: qepQueryKeys.verification.list({ queue: "completed" }),
    queryFn: ({ signal }) =>
      listVerifications({ status: "verified", limit: 20 }, { signal }),
  });
  const recent = useQuery({
    queryKey: qepQueryKeys.verification.list({ queue: "recently_updated" }),
    queryFn: ({ signal }) => listVerifications({ limit: 10 }, { signal }),
  });

  const widgets: readonly {
    readonly id: string;
    readonly title: string;
    readonly href: string;
    readonly count?: number;
    readonly loading: boolean;
  }[] = [
    {
      id: "my",
      title: "My Queue",
      href: QEP_VERIFICATION_ROUTES.queue,
      count: myQueue.data?.total,
      loading: myQueue.isLoading,
    },
    {
      id: "pending",
      title: "Pending",
      href: `${QEP_VERIFICATION_ROUTES.queue}?view=awaiting_review`,
      count: pending.data?.total,
      loading: pending.isLoading,
    },
    {
      id: "rejected",
      title: "Rejected",
      href: `${QEP_VERIFICATION_ROUTES.queue}?view=rejected`,
      count: rejected.data?.total,
      loading: rejected.isLoading,
    },
    {
      id: "expiring",
      title: "Expiring Soon",
      href: `${QEP_VERIFICATION_ROUTES.queue}?view=overdue`,
      count: applyPresentationQueueFilter(
        myQueue.data?.items ?? [],
        "overdue",
        DEFAULT_ACTOR_ID,
      ).length,
      loading: myQueue.isLoading,
    },
    {
      id: "completed",
      title: "Completed Today",
      href: `${QEP_VERIFICATION_ROUTES.queue}?view=completed`,
      count: (completed.data?.items ?? []).filter((item) => {
        if (!item.completedAt) return false;
        return item.completedAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
      }).length,
      loading: completed.isLoading,
    },
    {
      id: "team",
      title: "Team Queue",
      href: QEP_VERIFICATION_ROUTES.team,
      count: pending.data?.total,
      loading: pending.isLoading,
    },
  ];

  return (
    <QepPageShell
      title="Verification Dashboard"
      description="Operational indicators from Verification list queries — no analytics engine."
      breadcrumbs={["Verification", "Dashboard"]}
    >
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="qep-verification-dashboard"
      >
        {widgets.map((widget) => (
          <Link
            key={widget.id}
            href={widget.href}
            className="rounded-lg border border-[var(--color-border)] p-4 hover:bg-[var(--color-muted)]/20"
            data-testid={`qep-verification-widget-${widget.id}`}
          >
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {widget.title}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {widget.loading ? "…" : (widget.count ?? 0)}
            </p>
          </Link>
        ))}
      </div>
      <QepPanel title="Recent Activity">
        {recent.isLoading ? <QepLoadingState label="Loading activity…" /> : null}
        {recent.isSuccess && recent.data.items.length === 0 ? (
          <QepEmptyState title="No recent verification activity." />
        ) : null}
        {recent.isSuccess && recent.data.items.length > 0 ? (
          <ul
            className="space-y-2 text-sm"
            data-testid="qep-verification-recent-activity"
          >
            {recent.data.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={QEP_VERIFICATION_ROUTES.detail(item.id)}
                  className="underline"
                >
                  {item.id}
                </Link>{" "}
                · {item.status}
                {item.outcome ? ` / ${item.outcome}` : ""} ·{" "}
                {formatDate(item.updatedAt)}
              </li>
            ))}
          </ul>
        ) : null}
      </QepPanel>
    </QepPageShell>
  );
}

/* ─── Search ───────────────────────────────────────────────────────────── */

export function QepVerificationSearchView() {
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState("");
  const [outcome, setOutcome] = useState("");
  const [subjectKind, setSubjectKind] = useState("");
  const [priority, setPriority] = useState("");
  const [authority, setAuthority] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedSearches, setSavedSearches] = useState<readonly string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("qep.verification.savedSearches");
      if (raw) setSavedSearches(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const listFallback = useQuery({
    queryKey: qepQueryKeys.verification.search({
      q: submitted,
      status,
      outcome,
      subjectKind,
      priority,
      authority,
    }),
    enabled: submitted.length > 0,
    queryFn: async ({ signal }) => {
      try {
        const result = await executeSearchQuery(
          {
            query: {
              keywords: submitted,
              products: ["qep"],
              pageSize: 50,
              filters: [
                { field: "entityType", op: "eq", value: "verification_record" },
                ...(status
                  ? [{ field: "status", op: "eq" as const, value: status }]
                  : []),
                ...(outcome
                  ? [{ field: "outcome", op: "eq" as const, value: outcome }]
                  : []),
                ...(subjectKind
                  ? [{ field: "subjectKind", op: "eq" as const, value: subjectKind }]
                  : []),
              ],
            },
          },
          { signal },
        );
        if (result.hits.length > 0) {
          return {
            mode: "platform" as const,
            hits: result.hits,
            items: [] as QepVerificationDto[],
          };
        }
      } catch {
        /* fall through to REST advanced filters */
      }
      const collection = await listVerifications(
        {
          ...(status ? { status } : {}),
          ...(outcome ? { outcome } : {}),
          ...(subjectKind ? { subjectKind } : {}),
          ...(authority ? { authorityActorId: authority } : {}),
          limit: PAGE_SIZE,
        },
        { signal },
      );
      const items = collection.items.filter((item) => {
        const hay =
          `${item.id} ${subjectLabel(item)} ${item.rationale ?? ""} ${item.priority}`.toLowerCase();
        const matchQ = !submitted || hay.includes(submitted.toLowerCase());
        const matchPriority = !priority || item.priority === priority;
        return matchQ && matchPriority;
      });
      return { mode: "rest" as const, hits: [], items };
    },
  });

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setSubmitted(keywords.trim());
  }

  function saveSearch() {
    if (!savedName.trim() || !submitted) return;
    const next = [...new Set([...savedSearches, `${savedName.trim()}::${submitted}`])];
    setSavedSearches(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "qep.verification.savedSearches",
        JSON.stringify(next),
      );
    }
    setSavedName("");
  }

  return (
    <QepPageShell
      title="Verification Search"
      description="Platform Search for verification_record with advanced REST filters as fallback."
      breadcrumbs={["Verification", "Search"]}
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={onSearch}
        data-testid="qep-verification-search-form"
      >
        <QepFilterBar>
          <label className="text-xs grow">
            Keywords
            <Input
              className="mt-1"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Search verifications…"
              data-testid="qep-verification-search-input"
            />
          </label>
          <label className="text-xs">
            Status
            <select
              className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Outcome
            <select
              className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option value="">All</option>
              {OUTCOME_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Subject
            <select
              className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={subjectKind}
              onChange={(event) => setSubjectKind(event.target.value)}
            >
              <option value="">All</option>
              {SUBJECT_KIND_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Priority
            <select
              className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">All</option>
              {PRIORITY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Authority
            <Input
              className="mt-1"
              value={authority}
              onChange={(event) => setAuthority(event.target.value)}
              placeholder="actor id"
            />
          </label>
          <Button type="submit" size="sm" data-testid="qep-verification-search-submit">
            Search
          </Button>
        </QepFilterBar>
      </form>

      <div className="flex flex-wrap items-end gap-2">
        <Input
          value={savedName}
          onChange={(event) => setSavedName(event.target.value)}
          placeholder="Save search as…"
          data-testid="qep-verification-save-search-name"
        />
        <Button type="button" size="sm" variant="outline" onClick={saveSearch}>
          Save search
        </Button>
        {savedSearches.length > 0 ? (
          <select
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            defaultValue=""
            onChange={(event) => {
              const [, q] = event.target.value.split("::");
              if (!q) return;
              setKeywords(q);
              setSubmitted(q);
            }}
            data-testid="qep-verification-saved-searches"
          >
            <option value="">Saved searches…</option>
            {savedSearches.map((entry) => {
              const [name] = entry.split("::");
              return (
                <option key={entry} value={entry}>
                  {name}
                </option>
              );
            })}
          </select>
        ) : null}
      </div>

      {!submitted ? (
        <QepEmptyState title="Enter keywords or filters to search." />
      ) : listFallback.isLoading ? (
        <QepLoadingState label="Searching…" />
      ) : listFallback.isError ? (
        <QepErrorState
          message={
            listFallback.error instanceof Error
              ? listFallback.error.message
              : "Search failed"
          }
        />
      ) : listFallback.data?.mode === "platform" &&
        listFallback.data.hits.length > 0 ? (
        <ul className="space-y-2" data-testid="qep-verification-search-results">
          {listFallback.data.hits.map((hit) => (
            <li
              key={hit.id}
              className="rounded-md border border-[var(--color-border)] p-3 text-sm"
            >
              <Link
                href={
                  hit.navigationTarget ?? QEP_VERIFICATION_ROUTES.detail(hit.entityId)
                }
                className="font-medium underline"
              >
                {hit.title || hit.entityId}
              </Link>
              <p className="text-[var(--color-muted-foreground)]">{hit.entityType}</p>
            </li>
          ))}
        </ul>
      ) : listFallback.data?.items.length ? (
        <ul className="space-y-2" data-testid="qep-verification-search-results">
          {listFallback.data.items.map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-[var(--color-border)] p-3 text-sm"
            >
              <Link
                href={QEP_VERIFICATION_ROUTES.detail(item.id)}
                className="font-medium underline"
              >
                {item.id}
              </Link>
              <p className="text-[var(--color-muted-foreground)]">
                {subjectLabel(item)} · {item.status}
                {item.outcome ? ` / ${item.outcome}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <QepEmptyState title="No matches." />
      )}
    </QepPageShell>
  );
}

/* ─── Create / Supersede ───────────────────────────────────────────────── */

export function QepVerificationCreateView() {
  const router = useRouter();
  const [subjectKind, setSubjectKind] = useState("requirement");
  const [artefactId, setArtefactId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createVerification({
        subject: {
          kind: subjectKind,
          artefactId: artefactId.trim(),
        },
        authority: { kind: "user", actorId: DEFAULT_ACTOR_ID },
        priority,
        rationale: rationale.trim() || undefined,
        origin: "user",
      }),
    onSuccess: (created) => {
      emitQepWorkbenchTelemetry({ event: "verification.create", outcome: "success" });
      router.push(QEP_VERIFICATION_ROUTES.detail(created.id));
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Create failed");
      emitQepWorkbenchTelemetry({ event: "verification.create", outcome: "error" });
    },
  });

  return (
    <QepPageShell
      title="New Verification"
      description="Create a Verification record. Lifecycle transitions remain server-authoritative."
      breadcrumbs={["Verification", "New"]}
    >
      <form
        className="flex max-w-xl flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
        data-testid="qep-verification-create-form"
      >
        <label className="text-sm">
          Subject kind
          <select
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-2"
            value={subjectKind}
            onChange={(event) => setSubjectKind(event.target.value)}
          >
            {SUBJECT_KIND_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Subject artefact id
          <Input
            className="mt-1"
            value={artefactId}
            onChange={(event) => setArtefactId(event.target.value)}
            required
            data-testid="qep-verification-create-artefact"
          />
        </label>
        <label className="text-sm">
          Priority
          <select
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-2"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            {PRIORITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Rationale
          <Input
            className="mt-1"
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
          />
        </label>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={mutation.isPending}
          data-testid="qep-verification-create-submit"
        >
          Create
        </Button>
      </form>
    </QepPageShell>
  );
}

export function QepVerificationSupersedeView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const predecessor = searchParams.get("predecessor") ?? "";
  const [successorId, setSuccessorId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      supersedeVerification(predecessor, {
        successorVerificationId: successorId.trim(),
      }),
    onSuccess: () => {
      emitQepWorkbenchTelemetry({
        event: "verification.supersede",
        outcome: "success",
      });
      router.push(QEP_VERIFICATION_ROUTES.detail(predecessor));
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Supersede failed");
      emitQepWorkbenchTelemetry({ event: "verification.supersede", outcome: "error" });
    },
  });

  return (
    <QepPageShell
      title="Supersede Verification"
      description="Replace a Verification with a successor. Server validates eligibility."
      breadcrumbs={["Verification", "Supersede"]}
    >
      {!predecessor ? (
        <QepEmptyState title="Open supersede from a Verification that exposes the supersede action." />
      ) : (
        <form
          className="flex max-w-xl flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          data-testid="qep-verification-supersede-form"
        >
          <p className="text-sm">
            Predecessor: <strong>{predecessor}</strong>
          </p>
          <label className="text-sm">
            Successor Verification id
            <Input
              className="mt-1"
              value={successorId}
              onChange={(event) => setSuccessorId(event.target.value)}
              required
              data-testid="qep-verification-supersede-successor"
            />
          </label>
          {error ? (
            <p className="text-sm text-[var(--color-destructive)]" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={mutation.isPending}>
            Confirm supersede
          </Button>
        </form>
      )}
    </QepPageShell>
  );
}

/* ─── History ──────────────────────────────────────────────────────────── */

export function QepVerificationHistoryView({
  verificationId: forcedId,
}: {
  readonly verificationId?: string;
}) {
  const searchParams = useSearchParams();
  const id = forcedId ?? searchParams.get("id") ?? "";
  const [kindFilter, setKindFilter] = useState("");
  const [groupByKind, setGroupByKind] = useState(false);

  const query = useQuery({
    queryKey: qepQueryKeys.verification.history(id),
    enabled: Boolean(id),
    queryFn: ({ signal }) => getVerificationHistory(id, { signal }),
  });

  const entries = useMemo(() => {
    const rows = query.data ?? [];
    const filtered = kindFilter
      ? rows.filter((entry) => entry.kind === kindFilter)
      : rows;
    return [...filtered].sort((a, b) => b.at.localeCompare(a.at));
  }, [query.data, kindFilter]);

  const grouped = useMemo(() => {
    if (!groupByKind) return { All: entries };
    const map: Record<string, QepVerificationHistorySummaryDto[]> = {};
    for (const entry of entries) {
      const bucket = map[entry.kind] ?? [];
      bucket.push(entry);
      map[entry.kind] = bucket;
    }
    return map;
  }, [entries, groupByKind]);

  return (
    <QepPageShell
      title="Verification History"
      description="Append-only domain history. Read-only."
      breadcrumbs={["Verification", "History"]}
    >
      {!id ? (
        <QepEmptyState title="Select a Verification to view history (open from Inspector or pass ?id=)." />
      ) : null}
      {id ? (
        <>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Verification{" "}
            <Link href={QEP_VERIFICATION_ROUTES.detail(id)} className="underline">
              {id}
            </Link>
          </p>
          <QepFilterBar>
            <label className="text-xs">
              Kind
              <Input
                className="mt-1"
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value)}
                placeholder="Filter kind"
                data-testid="qep-verification-history-filter"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={groupByKind}
                onChange={(event) => setGroupByKind(event.target.checked)}
              />
              Group by kind
            </label>
          </QepFilterBar>
          {query.isLoading ? <QepLoadingState label="Loading history…" /> : null}
          {query.isError ? (
            <QepErrorState
              message={
                query.error instanceof Error ? query.error.message : "History failed"
              }
            />
          ) : null}
          {query.isSuccess && entries.length === 0 ? (
            <QepEmptyState title="No history entries." />
          ) : null}
          {query.isSuccess && entries.length > 0 ? (
            <div data-testid="qep-verification-history">
              {Object.entries(grouped).map(([group, rows]) => (
                <div key={group} className="mb-4">
                  {groupByKind ? (
                    <h2 className="mb-2 text-sm font-medium">{group}</h2>
                  ) : null}
                  <ol className="space-y-2">
                    {rows.map((entry, index) => (
                      <li
                        key={`${entry.at}-${index}`}
                        className="rounded-md border border-[var(--color-border)] p-3 text-sm"
                      >
                        <p className="font-medium">
                          {entry.kind} — {entry.summary}
                        </p>
                        <p className="text-[var(--color-muted-foreground)]">
                          {entry.by} · {formatDate(entry.at)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </QepPageShell>
  );
}

/* ─── Detail / Inspector / Decision / Timeline ─────────────────────────── */

type PendingAction =
  | "request"
  | "assign"
  | "start"
  | "complete"
  | "reject"
  | "expire"
  | "withdraw"
  | "cancel"
  | "retire"
  | null;

export function QepVerificationDetailView({
  verificationId,
}: {
  readonly verificationId: string;
}) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingAction>(null);
  const [assigneeId, setAssigneeId] = useState(DEFAULT_ACTOR_ID);
  const [outcome, setOutcome] = useState("verified");
  const [rationale, setRationale] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [editing, setEditing] = useState<"priority" | "rationale" | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: qepQueryKeys.verification.detail(verificationId),
    queryFn: ({ signal }) => getVerification(verificationId, { signal }),
  });

  const historyQuery = useQuery({
    queryKey: qepQueryKeys.verification.history(verificationId),
    queryFn: ({ signal }) => getVerificationHistory(verificationId, { signal }),
  });

  function invalidate() {
    void queryClient.invalidateQueries({
      queryKey: qepQueryKeys.verification.detail(verificationId),
    });
    void queryClient.invalidateQueries({ queryKey: qepQueryKeys.verification.all() });
  }

  const lifecycleMutation = useMutation({
    mutationFn: async () => {
      if (!pending) throw new Error("No action");
      if (pending === "request") return requestVerification(verificationId);
      if (pending === "assign")
        return assignVerification(verificationId, { assigneeId: assigneeId.trim() });
      if (pending === "start") return startVerification(verificationId);
      if (pending === "complete")
        return completeVerification(verificationId, {
          outcome,
          rationale: rationale.trim() || undefined,
        });
      if (pending === "reject")
        return rejectVerification(verificationId, {
          outcome: outcome || "failed",
          rationale: rationale.trim() || undefined,
        });
      if (pending === "expire") return expireVerification(verificationId);
      if (pending === "withdraw") return withdrawVerification(verificationId);
      if (pending === "cancel") return cancelVerification(verificationId);
      return retireVerification(verificationId);
    },
    onSuccess: () => {
      setPending(null);
      setConfirmError(null);
      setRationale("");
      invalidate();
      emitQepWorkbenchTelemetry({
        event: "verification.lifecycle",
        outcome: "success",
      });
    },
    onError: (err) => {
      setConfirmError(err instanceof Error ? err.message : "Action failed");
      emitQepWorkbenchTelemetry({ event: "verification.lifecycle", outcome: "error" });
    },
  });

  const priorityMutation = useMutation({
    mutationFn: () => updateVerificationPriority(verificationId, editPriority),
    onSuccess: () => {
      setEditing(null);
      invalidate();
    },
  });

  const rationaleMutation = useMutation({
    mutationFn: () => updateVerificationRationale(verificationId, editRationale.trim()),
    onSuccess: () => {
      setEditing(null);
      invalidate();
    },
  });

  if (query.isLoading) return <QepLoadingState label="Loading verification…" />;
  if (query.isError || !query.data) {
    return (
      <QepErrorState
        message={
          query.error instanceof Error ? query.error.message : "Verification not found"
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const verification = query.data;
  const actions = new Set(verification.availableActions ?? []);
  const timeline = (historyQuery.data ?? verification.historySummaries)
    .slice()
    .sort((a, b) => a.at.localeCompare(b.at));

  return (
    <QepPageShell
      title={`Verification — ${verification.status}`}
      description={subjectLabel(verification)}
      breadcrumbs={["Verification", verification.id]}
    >
      {isTerminalStatus(verification.status) ? (
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm"
          role="status"
          data-testid="qep-verification-terminal-banner"
        >
          This Verification is <strong>{verification.status}</strong>
          {verification.outcome ? (
            <>
              {" "}
              with outcome <strong>{verification.outcome}</strong>
            </>
          ) : null}
          .
        </p>
      ) : null}

      <div
        className="grid gap-4 lg:grid-cols-[minmax(200px,1fr)_minmax(0,2fr)_minmax(240px,1fr)]"
        data-testid="qep-verification-detail-grid"
      >
        <aside aria-label="Verification context">
          <QepPanel title="Summary">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Status
                </dt>
                <dd data-testid="qep-verification-status">
                  <QepStatusBadge status={verification.status} /> {verification.status}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Outcome
                </dt>
                <dd data-testid="qep-verification-outcome">
                  {verification.outcome ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Priority
                </dt>
                <dd>{verification.priority}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Version
                </dt>
                <dd>{verification.revision}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Assigned
                </dt>
                <dd>{verification.assignedTo ?? "—"}</dd>
              </div>
            </dl>
          </QepPanel>
          <QepPanel title="Related artefacts">
            <div className="space-y-2 text-sm">
              <SubjectNavigation verification={verification} />
              <GovernedUnavailable capability="Future Certification view" />
            </div>
          </QepPanel>
        </aside>

        <main aria-label="Verification body">
          <QepPanel title="Details">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Subject
                </dt>
                <dd>{subjectLabel(verification)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Authority
                </dt>
                <dd>
                  {verification.authority.kind}:{verification.authority.actorId}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Scope
                </dt>
                <dd>
                  {verification.scope.kind}
                  {verification.scope.referenceId
                    ? ` · ${verification.scope.referenceId}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Origin
                </dt>
                <dd>{verification.origin}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Rationale
                </dt>
                <dd>{verification.rationale ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Metadata
                </dt>
                <dd>
                  {Object.keys(verification.metadata).length === 0
                    ? "—"
                    : Object.entries(verification.metadata)
                        .map(([key, value]) => `${key}=${value}`)
                        .join(", ")}
                </dd>
              </div>
            </dl>
          </QepPanel>

          <QepPanel title="Timeline">
            {timeline.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No timeline events yet.
              </p>
            ) : (
              <ol className="space-y-2 text-sm" data-testid="qep-verification-timeline">
                {timeline.map((entry, index) => (
                  <li
                    key={`${entry.at}-${index}`}
                    className="rounded-md border border-[var(--color-border)] p-2"
                  >
                    <span className="font-medium">{entry.kind}</span> — {entry.summary}
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {entry.by} · {formatDate(entry.at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <Link
              href={QEP_VERIFICATION_ROUTES.detailHistory(verification.id)}
              className="mt-3 inline-block text-sm underline"
            >
              Open full history
            </Link>
          </QepPanel>
        </main>

        <aside aria-label="Verification inspector">
          <QepPanel title="Inspector">
            <div className="flex flex-col gap-2" data-testid="qep-verification-actions">
              {(
                [
                  ["request", "Request"],
                  ["assign", "Assign"],
                  ["start", "Start"],
                  ["complete", "Complete / Verify"],
                  ["reject", "Reject"],
                  ["expire", "Expire"],
                  ["withdraw", "Withdraw"],
                  ["cancel", "Cancel"],
                  ["retire", "Retire"],
                ] as const
              ).map(([action, label]) =>
                actions.has(action) ? (
                  <Button
                    key={action}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPending(action);
                      setConfirmError(null);
                    }}
                    data-testid={`qep-verification-${action}-open`}
                  >
                    {label}
                  </Button>
                ) : null,
              )}
              {actions.has("supersede") ? (
                <Link
                  href={`${QEP_VERIFICATION_ROUTES.supersede}?predecessor=${encodeURIComponent(verification.id)}`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--color-border)] px-3 text-sm"
                  data-testid="qep-verification-supersede-open"
                >
                  Supersede
                </Link>
              ) : null}
              {actions.has("updatePriority") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditPriority(verification.priority);
                    setEditing("priority");
                  }}
                  data-testid="qep-verification-edit-priority"
                >
                  Edit priority
                </Button>
              ) : null}
              {actions.has("updateRationale") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditRationale(verification.rationale ?? "");
                    setEditing("rationale");
                  }}
                  data-testid="qep-verification-edit-rationale"
                >
                  Edit rationale
                </Button>
              ) : null}
              {actions.size === 0 ? (
                <p
                  className="text-sm text-[var(--color-muted-foreground)]"
                  role="status"
                >
                  Read-only — no actions available.
                </p>
              ) : null}
            </div>

            {verification.historySummaries.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-sm font-medium">History summary</h3>
                <ol
                  className="mt-2 space-y-2 text-xs"
                  data-testid="qep-verification-history-preview"
                >
                  {verification.historySummaries.slice(0, 5).map((entry, index) => (
                    <li
                      key={`${entry.at}-${index}`}
                      className="rounded-md border border-[var(--color-border)] p-2"
                    >
                      <span className="font-medium">{entry.kind}</span> —{" "}
                      {entry.summary}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {verification.context.immutable ? (
              <p
                className="mt-3 text-xs text-[var(--color-muted-foreground)]"
                role="status"
              >
                Immutable context warning — mutating actions remain server-gated.
              </p>
            ) : null}
          </QepPanel>
        </aside>
      </div>

      {pending ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qep-verification-decision-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          data-testid="qep-verification-decision-dialog"
        >
          <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-lg">
            <h2 id="qep-verification-decision-title" className="text-lg font-semibold">
              Confirm {pending}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              This action is executed via the server API. The client does not decide
              eligibility.
            </p>
            {pending === "assign" ? (
              <label className="mt-3 block text-sm">
                Assignee
                <Input
                  className="mt-1"
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                  data-testid="qep-verification-assign-input"
                />
              </label>
            ) : null}
            {pending === "complete" || pending === "reject" ? (
              <>
                <label className="mt-3 block text-sm">
                  Outcome
                  <select
                    className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-2"
                    value={outcome}
                    onChange={(event) => setOutcome(event.target.value)}
                    data-testid="qep-verification-outcome-input"
                  >
                    {OUTCOME_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-3 block text-sm">
                  Rationale
                  <Input
                    className="mt-1"
                    value={rationale}
                    onChange={(event) => setRationale(event.target.value)}
                    data-testid="qep-verification-rationale-input"
                  />
                </label>
              </>
            ) : null}
            {confirmError ? (
              <p className="mt-2 text-sm text-[var(--color-destructive)]" role="alert">
                {confirmError}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPending(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={lifecycleMutation.isPending}
                onClick={() => lifecycleMutation.mutate()}
                data-testid="qep-verification-decision-confirm"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editing === "priority" ? (
        <DialogShell title="Edit priority" onClose={() => setEditing(null)}>
          <select
            className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-2"
            value={editPriority}
            onChange={(event) => setEditPriority(event.target.value)}
          >
            {PRIORITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Button
            type="button"
            className="mt-3"
            size="sm"
            onClick={() => priorityMutation.mutate()}
          >
            Save
          </Button>
        </DialogShell>
      ) : null}

      {editing === "rationale" ? (
        <DialogShell title="Edit rationale" onClose={() => setEditing(null)}>
          <Input
            className="mt-2"
            value={editRationale}
            onChange={(event) => setEditRationale(event.target.value)}
          />
          <Button
            type="button"
            className="mt-3"
            size="sm"
            onClick={() => rationaleMutation.mutate()}
          >
            Save
          </Button>
        </DialogShell>
      ) : null}
    </QepPageShell>
  );
}

function DialogShell({
  title,
  onClose,
  children,
}: {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Router ───────────────────────────────────────────────────────────── */

export function QepVerificationRouterView({ pathname }: { readonly pathname: string }) {
  if (isQepVerificationDashboardRoute(pathname)) {
    return <QepVerificationDashboardView />;
  }
  if (isQepVerificationQueueRoute(pathname)) {
    return (
      <QepVerificationExplorerView
        title="My Verification Queue"
        description="Operational queue — presentation filters over Verification list APIs."
        queue="my_work"
      />
    );
  }
  if (isQepVerificationTeamRoute(pathname)) {
    return (
      <QepVerificationExplorerView
        title="Team Verification Queue"
        description="Team operational queue."
        queue="awaiting_review"
        teamMode
      />
    );
  }
  if (isQepVerificationSearchRoute(pathname)) {
    return <QepVerificationSearchView />;
  }
  if (isQepVerificationHistoryRoute(pathname)) {
    return <QepVerificationHistoryView />;
  }
  if (isQepVerificationNewRoute(pathname)) {
    return <QepVerificationCreateView />;
  }
  if (isQepVerificationSupersedeRoute(pathname)) {
    return <QepVerificationSupersedeView />;
  }
  const id = parseQepVerificationRouteId(pathname);
  if (id) {
    return <QepVerificationDetailView verificationId={id} />;
  }
  return <QepVerificationExplorerView />;
}

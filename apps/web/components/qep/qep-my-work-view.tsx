"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "@apzhub/auth";
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  RotateCcw,
  X,
} from "lucide-react";

import { QEP_DEFECT_ROUTES } from "@apzhub/qep-defects/presentation";
import { QEP_TEST_EXECUTION_ROUTES } from "@apzhub/qep-test-execution/presentation";
import { listDefects } from "@/lib/qep/qep-defects-api";
import { listAssignedExecutions } from "@/lib/qep/qep-test-execution-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";
import { QepErrorState, QepLoadingState } from "./qep-ui";

type WorkTab = "all" | "retest" | "executions" | "defects";
type InspectorPane = "details" | "context" | "related" | "activity";

type WorkItem = {
  readonly id: string;
  readonly identity: string;
  readonly summary: string;
  readonly title: string;
  readonly type: "execution" | "defect";
  readonly context: string;
  readonly state: string;
  readonly priority: string;
  readonly updated: string;
  readonly created: string;
  readonly description?: string;
  readonly environment?: string;
  readonly version?: string;
  readonly href: string;
  readonly relatedTest?: string;
  readonly evidenceCount?: number;
};

const TABS: readonly { readonly id: WorkTab; readonly label: string }[] = [
  { id: "all", label: "Assigned to me" },
  { id: "retest", label: "Retest" },
  { id: "executions", label: "Executions" },
  { id: "defects", label: "Defects" },
];

function formatState(value: string): string {
  return value.replaceAll("_", " ");
}

function workTypeLabel(item: WorkItem): string {
  if (item.type === "defect" && item.state === "ready_for_retest") return "Retest";
  if (item.type === "execution") return "Execution";
  return "Defect";
}

function TypeIcon({ item }: { readonly item: WorkItem }) {
  const label = workTypeLabel(item);
  if (label === "Retest") {
    return (
      <RotateCcw
        className="h-3.5 w-3.5 shrink-0 text-[var(--color-warning)]"
        aria-hidden
      />
    );
  }
  if (label === "Execution") {
    return (
      <Play className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
    );
  }
  return (
    <Bug className="h-3.5 w-3.5 shrink-0 text-[var(--color-destructive)]" aria-hidden />
  );
}

function applicationLabel(
  projectId: string | undefined,
  displayContext: (projectRef: string | undefined) => string,
): string {
  return displayContext(projectId);
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const delta = Date.now() - date.getTime();
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return iso.slice(0, 10);
}

function badgeClass(kind: "state" | "priority", value: string): string {
  const key = value.toLowerCase();
  const base =
    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize";
  if (kind === "priority") {
    if (key === "critical" || key === "p0") {
      return `${base} bg-[var(--color-destructive)]/15 text-[var(--color-destructive)]`;
    }
    if (key === "major" || key === "high" || key === "p1") {
      return `${base} bg-[var(--color-warning)]/15 text-[var(--color-warning)]`;
    }
    return `${base} bg-[var(--color-muted)] text-[var(--color-muted-foreground)]`;
  }
  if (key === "ready_for_retest" || key === "required") {
    return `${base} bg-[var(--color-warning)]/15 text-[var(--color-warning)]`;
  }
  if (key === "assigned") {
    return `${base} bg-[var(--color-primary)]/15 text-[var(--color-primary)]`;
  }
  if (key === "in_progress") {
    return `${base} bg-[var(--color-warning)]/15 text-[var(--color-warning)]`;
  }
  if (key === "triaged") {
    return `${base} bg-[var(--color-accent)] text-[var(--color-accent-foreground)]`;
  }
  return `${base} bg-[var(--color-muted)] text-[var(--color-muted-foreground)]`;
}

function priorityLabel(value: string): string {
  if (value === "—") return "—";
  if (value === "p0") return "Critical";
  if (value === "p1") return "High";
  if (value === "p2") return "Medium";
  if (value === "p3" || value === "p4") return "Low";
  return formatState(value);
}

function QepMyWorkInspector({
  item,
  assignedTo,
  onClose,
  onPrev,
  onNext,
  testId = "qep-my-work-inspector",
}: {
  readonly item: WorkItem;
  readonly assignedTo?: string;
  readonly onClose: () => void;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
  readonly testId?: string;
}) {
  const [pane, setPane] = useState<InspectorPane>("details");
  const openLabel = item.type === "defect" ? "Open Defect" : "Open Execution";

  return (
    <div className="flex h-full min-h-0 flex-col text-xs" data-testid={testId}>
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-1 pb-3">
        <p className="font-semibold tracking-wide">{item.identity}</p>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            className="rounded p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] disabled:opacity-30"
            aria-label="Previous work item"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext}
            className="rounded p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] disabled:opacity-30"
            aria-label="Next work item"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
            aria-label="Close inspector"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <TypeIcon item={item} />
          {item.priority !== "—" ? (
            <span className={badgeClass("priority", item.priority)}>
              {priorityLabel(item.priority)}
            </span>
          ) : null}
        </div>
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          {item.summary}
        </h2>
        <span className={badgeClass("state", item.state)}>
          {formatState(item.state)}
        </span>
      </div>

      <div
        className="mt-4 flex gap-3 border-b border-[var(--color-border)]"
        role="tablist"
      >
        {(
          [
            ["details", "Details"],
            ["context", "Context"],
            ["related", "Related"],
            ["activity", "Activity"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pane === id}
            className={`-mb-px border-b-2 pb-1.5 text-[11px] ${
              pane === id
                ? "border-[var(--color-primary)] font-medium text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setPane(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-auto">
        {pane === "details" ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Application</dt>
                <dd className="mt-0.5 font-medium">{item.context}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Version</dt>
                <dd className="mt-0.5">{item.version ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">State</dt>
                <dd className="mt-0.5 capitalize">{formatState(item.state)}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
                <dd className="mt-0.5">{priorityLabel(item.priority)}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Assigned to</dt>
                <dd className="mt-0.5">{assignedTo ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Created</dt>
                <dd className="mt-0.5">{formatRelativeTime(item.created)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[var(--color-muted-foreground)]">Updated</dt>
                <dd className="mt-0.5">{formatRelativeTime(item.updated)}</dd>
              </div>
            </dl>
            {item.description ? (
              <div>
                <p className="text-[var(--color-muted-foreground)]">Description</p>
                <p className="mt-1 text-[var(--color-foreground)]">
                  {item.description}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
        {pane === "context" ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Application</dt>
              <dd className="mt-0.5">{item.context}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Environment</dt>
              <dd className="mt-0.5">{item.environment ?? "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--color-muted-foreground)]">Version</dt>
              <dd className="mt-0.5">{item.version ?? "—"}</dd>
            </div>
          </dl>
        ) : null}
        {pane === "related" ? (
          <div className="space-y-2">
            <p>Related test: {item.relatedTest ?? "None linked"}</p>
            <p>Evidence: {item.evidenceCount ?? 0}</p>
          </div>
        ) : null}
        {pane === "activity" ? (
          <p className="text-[var(--color-muted-foreground)]">
            Item activity is unavailable.
          </p>
        ) : null}
      </div>

      <Link
        href={item.href}
        className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[var(--color-primary)] text-xs font-medium text-[var(--color-primary-foreground)]"
      >
        {openLabel}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}

/**
 * Assigned QEP objects only (executor / assignee).
 * Does not infer ownership from createdBy.
 */
export function QepMyWorkView() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const assignedTo = session?.user.name ?? session?.user.email;
  const { applications, displayContext } = useQepApplicationContext();
  const inspector = useWorkbenchInspector();
  const clearInspector = inspector.clearSelection;
  const [tab, setTab] = useState<WorkTab>("all");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "execution" | "defect">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [selected, setSelected] = useState<WorkItem | null>(null);

  useEffect(() => () => clearInspector(), [clearInspector]);

  const workQ = useQuery({
    queryKey: ["qep-my-work", userId, applications],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [executions, defects] = await Promise.all([
        listAssignedExecutions({ limit: 100 }),
        listDefects({
          assigneeId: userId,
          sortBy: "updatedAt",
          sortDirection: "desc",
        }),
      ]);
      const execItems: WorkItem[] = executions.items.map((row) => ({
        id: `execution:${row.id}`,
        identity: row.executionNumber,
        summary: row.executionNumber,
        title: row.executionNumber,
        type: "execution",
        context: applicationLabel(row.projectId, displayContext),
        state: row.status,
        priority: "—",
        updated: row.updatedAt,
        created: row.createdAt,
        href: QEP_TEST_EXECUTION_ROUTES.detail(row.id),
      }));
      const defectItems: WorkItem[] = defects.items.map((row) => ({
        id: `defect:${row.defectId}`,
        identity: row.defectId,
        summary: row.title,
        title: `${row.defectId} ${row.title}`,
        type: "defect",
        context: applicationLabel(row.projectId, displayContext),
        state: row.status,
        priority: row.priority,
        updated: row.updatedAt,
        created: row.createdAt,
        description: row.description || undefined,
        environment: row.environment,
        version: row.applicationVersion,
        href: QEP_DEFECT_ROUTES.detail(row.defectId),
        relatedTest: row.executionOrigin?.sessionId,
        evidenceCount:
          row.evidenceRefs.length > 0 ? row.evidenceRefs.length : undefined,
      }));
      return [...execItems, ...defectItems].sort((a, b) =>
        b.updated.localeCompare(a.updated),
      );
    },
  });

  const filtered = useMemo(() => {
    const items = workQ.data ?? [];
    return items.filter((item) => {
      if (tab === "executions" && item.type !== "execution") return false;
      if (tab === "defects" && item.type !== "defect") return false;
      if (
        tab === "retest" &&
        !(item.type === "defect" && item.state === "ready_for_retest")
      ) {
        return false;
      }
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (stateFilter !== "all" && item.state !== stateFilter) return false;
      if (applicationFilter !== "all" && item.context !== applicationFilter)
        return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.id.toLowerCase().includes(q) &&
          !item.state.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [applicationFilter, query, stateFilter, tab, typeFilter, workQ.data]);

  const stateOptions = useMemo(() => {
    const values = new Set((workQ.data ?? []).map((item) => item.state));
    return [...values].sort();
  }, [workQ.data]);

  const applicationOptions = useMemo(() => {
    const values = new Set(
      (workQ.data ?? [])
        .map((item) => item.context)
        .filter((value) => value && value !== "—"),
    );
    return [...values].sort();
  }, [workQ.data]);

  function closeInspector() {
    setSelected(null);
    clearInspector();
  }

  function selectRow(item: WorkItem) {
    const index = filtered.findIndex((row) => row.id === item.id);
    const prev = index > 0 ? filtered[index - 1] : undefined;
    const next =
      index >= 0 && index < filtered.length - 1 ? filtered[index + 1] : undefined;
    setSelected(item);
    inspector.setSelection({
      id: item.id,
      title: item.identity,
      content: (
        <QepMyWorkInspector
          item={item}
          assignedTo={assignedTo}
          onClose={closeInspector}
          onPrev={prev ? () => selectRow(prev) : undefined}
          onNext={next ? () => selectRow(next) : undefined}
        />
      ),
    });
  }

  if (!userId) {
    return <QepLoadingState label="Resolving session…" />;
  }
  if (workQ.isLoading) {
    return <QepLoadingState label="Loading assigned quality work…" />;
  }
  if (workQ.isError) {
    return <QepErrorState message={(workQ.error as Error).message} />;
  }

  const empty = (
    <>
      <p>No quality work is currently assigned to you.</p>
      <p className="mt-1 text-[var(--color-muted-foreground)]">
        When executions, defects or retests are assigned to you, they will appear here.
      </p>
    </>
  );

  const selectedIndex = selected
    ? filtered.findIndex((row) => row.id === selected.id)
    : -1;
  const selectedPrev = selectedIndex > 0 ? filtered[selectedIndex - 1] : undefined;
  const selectedNext =
    selectedIndex >= 0 && selectedIndex < filtered.length - 1
      ? filtered[selectedIndex + 1]
      : undefined;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-my-work"
    >
      <header>
        <h1 className="text-xl font-semibold tracking-tight">My Work</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Quality work currently assigned to you.
        </p>
      </header>

      <div
        className="flex flex-wrap gap-4"
        role="tablist"
        aria-label="My Work filters"
        data-testid="qep-my-work-tabs"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`border-b-2 px-0.5 pb-1.5 text-sm ${
              tab === item.id
                ? "border-[var(--color-primary)] font-medium text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" data-testid="qep-my-work-filters">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search work..."
          className="h-9 min-w-[10rem] flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
          aria-label="Search my work"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Type"
        >
          <option value="all">Type</option>
          <option value="execution">Executions</option>
          <option value="defect">Defects</option>
        </select>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="State"
        >
          <option value="all">State</option>
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {formatState(state)}
            </option>
          ))}
        </select>
        <select
          value={applicationFilter}
          onChange={(e) => setApplicationFilter(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Application"
        >
          <option value="all">Application</option>
          {applicationOptions.map((app) => (
            <option key={app} value={app}>
              {app}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        <table className="min-w-full text-xs" data-testid="qep-my-work-table">
          <caption className="sr-only">Assigned quality work</caption>
          <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <tr className="border-b border-[var(--color-border)]">
              <th scope="col" className="px-3 py-2 font-medium">
                Type
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Item
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Context
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                State
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Priority
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8">
                  {empty}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40 ${
                    selected?.id === item.id ? "bg-[var(--color-accent)]/60" : ""
                  }`}
                  onClick={() => selectRow(item)}
                  data-testid={`qep-my-work-row-${item.id}`}
                >
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <TypeIcon item={item} />
                      {workTypeLabel(item)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{item.identity}</p>
                    <p className="text-[var(--color-muted-foreground)]">
                      {item.summary}
                    </p>
                  </td>
                  <td className="max-w-[10rem] truncate px-3 py-2.5">{item.context}</td>
                  <td className="px-3 py-2.5">
                    <span className={badgeClass("state", item.state)}>
                      {formatState(item.state)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {item.priority === "—" ? (
                      "—"
                    ) : (
                      <span className={badgeClass("priority", item.priority)}>
                        {priorityLabel(item.priority)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--color-muted-foreground)]">
                    {formatRelativeTime(item.updated)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-2 lg:hidden" data-testid="qep-my-work-cards">
        {filtered.length === 0 ? (
          <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs">
            {empty}
          </li>
        ) : (
          filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left"
                onClick={() => selectRow(item)}
                data-testid={`qep-my-work-card-${item.id}`}
              >
                <p className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                  <TypeIcon item={item} />
                  {workTypeLabel(item)}
                </p>
                <p className="mt-1 text-sm font-medium">{item.identity}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {item.summary}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={badgeClass("state", item.state)}>
                      {formatState(item.state)}
                    </span>
                    {item.priority !== "—" ? (
                      <span className={badgeClass("priority", item.priority)}>
                        {priorityLabel(item.priority)}
                      </span>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right text-[10px] text-[var(--color-muted-foreground)]">
                    <p className="max-w-[9rem] truncate">{item.context}</p>
                    <p>{formatRelativeTime(item.updated)}</p>
                  </div>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>

      {selected
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex flex-col bg-[var(--color-surface)] p-4 lg:hidden"
              data-testid="qep-my-work-mobile-inspector"
            >
              <QepMyWorkInspector
                item={selected}
                assignedTo={assignedTo}
                onClose={closeInspector}
                testId="qep-my-work-mobile-inspector-body"
                onPrev={selectedPrev ? () => selectRow(selectedPrev) : undefined}
                onNext={selectedNext ? () => selectRow(selectedNext) : undefined}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

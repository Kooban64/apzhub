"use client";

import type {
  DefectLifecycleState,
  DefectNode,
  DefectSeverity,
} from "@apzhub/qep-defects";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  assignDefect,
  attachDefectEvidence,
  createDefect,
  createDefectFromExecution,
  getDefect,
  listDefects,
  transitionDefect,
  type CreateQepDefectInput,
  type QepDefectListParams,
} from "@/lib/qep/qep-defects-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_DEFECT_ROUTES,
  QEP_EXECUTION_WORKSPACE_ROUTES,
  isQepDefectsNewRoute,
  parseQepDefectRouteId,
} from "@/lib/qep/routes";

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

type ViewMode = "list" | "board" | "cards";

const STATUS_OPTIONS: readonly DefectLifecycleState[] = [
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "fixed",
  "ready_for_retest",
  "verified",
  "rejected",
  "duplicate",
  "wont_fix",
  "closed",
  "archived",
];

const BOARD_COLUMNS: readonly DefectLifecycleState[] = [
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "fixed",
  "ready_for_retest",
  "verified",
  "closed",
];

const LIFECYCLE_ACTIONS: Readonly<
  Record<
    DefectLifecycleState,
    readonly { status: DefectLifecycleState; label: string }[]
  >
> = {
  new: [
    { status: "triaged", label: "Triage" },
    { status: "rejected", label: "Reject" },
  ],
  triaged: [
    { status: "assigned", label: "Mark assigned" },
    { status: "rejected", label: "Reject" },
  ],
  assigned: [
    { status: "in_progress", label: "Start work" },
    { status: "triaged", label: "Return to triage" },
  ],
  in_progress: [
    { status: "fixed", label: "Mark fixed" },
    { status: "ready_for_retest", label: "Ready for retest" },
  ],
  fixed: [{ status: "ready_for_retest", label: "Ready for retest" }],
  ready_for_retest: [
    { status: "verified", label: "Verify" },
    { status: "in_progress", label: "Reopen work" },
  ],
  verified: [{ status: "closed", label: "Close" }],
  rejected: [
    { status: "closed", label: "Close" },
    { status: "new", label: "Reopen" },
  ],
  duplicate: [{ status: "closed", label: "Close" }],
  wont_fix: [{ status: "closed", label: "Close" }],
  closed: [
    { status: "archived", label: "Archive" },
    { status: "new", label: "Reopen" },
  ],
  archived: [],
};

function formatDate(value?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function QepDefectsRouterView({ pathname }: { readonly pathname: string }) {
  if (isQepDefectsNewRoute(pathname)) {
    return <DefectCreateView />;
  }
  const defectId = parseQepDefectRouteId(pathname);
  if (defectId) {
    return <DefectDetailView defectId={defectId} />;
  }
  return <DefectListView />;
}

function DefectListView() {
  const [view, setView] = useState<ViewMode>("list");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [query, setQuery] = useState("");

  const params = useMemo<QepDefectListParams>(
    () => ({
      ...(status ? { status } : {}),
      ...(severity ? { severity } : {}),
      ...(query.trim() ? { query: query.trim() } : {}),
      sortBy: "updatedAt",
      sortDirection: "desc",
    }),
    [status, severity, query],
  );

  const listQuery = useQuery({
    queryKey: qepQueryKeys.defects.list(params),
    queryFn: ({ signal }) => listDefects(params, { signal }),
  });

  const items = listQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Defect Management"
      description="Investigation records referencing immutable execution and evidence."
      breadcrumbs={["QEP", "Defects"]}
      actions={
        <>
          <div className="flex gap-1" role="group" aria-label="View mode">
            {(["list", "board", "cards"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={view === mode ? "default" : "outline"}
                onClick={() => setView(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
          <Link
            href={QEP_DEFECT_ROUTES.new}
            className="inline-flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm text-[var(--color-primary-foreground)]"
          >
            New defect
          </Link>
        </>
      }
    >
      <QepFilterBar>
        <Input
          aria-label="Search defects"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter by status"
          className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by severity"
          className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">All severities</option>
          {(["critical", "major", "minor", "trivial"] as const).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </QepFilterBar>

      {listQuery.isLoading ? (
        <QepLoadingState label="Loading defects…" />
      ) : listQuery.isError ? (
        <QepErrorState
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "Failed to load defects"
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <QepEmptyState title="No defects yet. Create manually or raise from a failed execution step." />
      ) : view === "board" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {BOARD_COLUMNS.map((column) => {
            const columnItems = items.filter((d) => d.status === column);
            return (
              <QepPanel
                key={column}
                title={`${column.replace(/_/g, " ")} (${columnItems.length})`}
              >
                <ul className="space-y-2">
                  {columnItems.map((d) => (
                    <li key={d.defectId}>
                      <Link
                        href={QEP_DEFECT_ROUTES.detail(d.defectId)}
                        className="block rounded-md border border-[var(--color-border)] p-2 text-sm hover:bg-[var(--color-muted)]"
                      >
                        <div className="font-medium">{d.title}</div>
                        <div className="mt-1 flex gap-2 text-xs text-[var(--color-muted-foreground)]">
                          <span>{d.severity}</span>
                          <span>{d.priority}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </QepPanel>
            );
          })}
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <DefectCard key={d.defectId} defect={d} />
          ))}
        </div>
      ) : (
        <QepTable
          caption="Defects"
          columns={["Title", "Status", "Severity", "Priority", "Assignee", "Updated"]}
          rows={items.map((d) => ({
            id: d.defectId,
            cells: [
              <Link
                key="t"
                href={QEP_DEFECT_ROUTES.detail(d.defectId)}
                className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                {d.title}
              </Link>,
              <QepStatusBadge key="s" status={d.status} />,
              d.severity,
              d.priority,
              d.assigneeId ?? "—",
              formatDate(d.updatedAt),
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function DefectCard({ defect }: { readonly defect: DefectNode }) {
  return (
    <Link
      href={QEP_DEFECT_ROUTES.detail(defect.defectId)}
      className="block rounded-md border border-[var(--color-border)] p-4 hover:bg-[var(--color-muted)]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-medium">{defect.title}</h3>
        <QepStatusBadge status={defect.status} />
      </div>
      <p className="line-clamp-2 text-sm text-[var(--color-muted-foreground)]">
        {defect.description || "No description"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-muted-foreground)]">
        <span>{defect.severity}</span>
        <span>{defect.priority}</span>
        {defect.executionOrigin?.sessionId ? (
          <span>exec {defect.executionOrigin.sessionId.slice(0, 8)}…</span>
        ) : null}
      </div>
    </Link>
  );
}

function DefectCreateView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<DefectSeverity>("major");
  const [sessionId, setSessionId] = useState(() => searchParams.get("sessionId") ?? "");
  const [stepId, setStepId] = useState(() => searchParams.get("stepId") ?? "");

  const createMutation = useMutation({
    mutationFn: (input: CreateQepDefectInput) => createDefect(input),
    onSuccess: (defect) => {
      router.push(QEP_DEFECT_ROUTES.detail(defect.defectId));
    },
  });

  const fromExecMutation = useMutation({
    mutationFn: () =>
      createDefectFromExecution({
        sessionId,
        ...(stepId ? { stepId } : {}),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        severity,
      }),
    onSuccess: (defect) => {
      router.push(QEP_DEFECT_ROUTES.detail(defect.defectId));
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (sessionId.trim()) {
      fromExecMutation.mutate();
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      severity,
    });
  };

  const pending = createMutation.isPending || fromExecMutation.isPending;
  const error = createMutation.error ?? fromExecMutation.error;

  return (
    <QepPageShell
      title="New defect"
      description="Investigation record — not evidence, not an execution result."
      breadcrumbs={["QEP", "Defects", "New"]}
      actions={
        <Link
          href={QEP_DEFECT_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Cancel
        </Link>
      }
    >
      <form className="mx-auto flex max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          Title
          <Input
            required={!sessionId.trim()}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short investigation title"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            className="min-h-24 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Severity
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as DefectSeverity)}
          >
            {(["critical", "major", "minor", "trivial"] as const).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <QepPanel title="Raise from execution (optional)">
          <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Links Cap C session/step immutably. Does not modify execution results.
          </p>
          <div className="flex flex-col gap-2">
            <Input
              aria-label="Execution session ID"
              placeholder="Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
            <Input
              aria-label="Step ID"
              placeholder="Step ID (optional)"
              value={stepId}
              onChange={(e) => setStepId(e.target.value)}
            />
          </div>
        </QepPanel>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error instanceof Error ? error.message : "Create failed"}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create defect"}
        </Button>
      </form>
    </QepPageShell>
  );
}

function DefectDetailView({ defectId }: { readonly defectId: string }) {
  const queryClient = useQueryClient();
  const [assigneeId, setAssigneeId] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [almMessage, setAlmMessage] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: qepQueryKeys.defects.detail(defectId),
    queryFn: ({ signal }) => getDefect(defectId, { signal }),
  });

  const almListQuery = useQuery({
    queryKey: ["qep-alm-produce", "by-defect", defectId],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/v1/qep/defects/${encodeURIComponent(defectId)}/alm-produce`,
        { signal },
      );
      const body = (await response.json()) as {
        data?: {
          records: Array<{
            produceId: string;
            channel: string;
            status: string;
            detail?: string;
            externalRef?: string;
            createdAt: string;
          }>;
          config?: { mode: string };
        };
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(body.error?.message ?? `Request failed (${response.status})`);
      }
      return body.data!;
    },
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.defects.all(),
    });
  };

  const lifecycleMutation = useMutation({
    mutationFn: (status: DefectLifecycleState) => transitionDefect(defectId, status),
    onSuccess: invalidate,
  });

  const assignMutation = useMutation({
    mutationFn: () => assignDefect(defectId, assigneeId.trim()),
    onSuccess: async () => {
      setAssigneeId("");
      await invalidate();
    },
  });

  const evidenceMutation = useMutation({
    mutationFn: () => attachDefectEvidence(defectId, evidenceId.trim()),
    onSuccess: async () => {
      setEvidenceId("");
      await invalidate();
    },
  });

  const almProduceMutation = useMutation({
    mutationFn: async () => {
      const changeEventId =
        typeof detailQuery.data?.defect.customMetadata?.changeEventId === "string"
          ? detailQuery.data.defect.customMetadata.changeEventId
          : undefined;
      const response = await fetch(
        `/api/v1/qep/defects/${encodeURIComponent(defectId)}/alm-produce`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            channels: ["projects", "support"],
            changeEventId,
          }),
        },
      );
      const body = (await response.json()) as {
        data?: {
          records: Array<{ channel: string; status: string; detail?: string }>;
          note?: string;
          config?: { mode: string };
        };
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(body.error?.message ?? `Request failed (${response.status})`);
      }
      return body.data!;
    },
    onSuccess: (data) => {
      const summary = data.records.map((r) => `${r.channel}=${r.status}`).join(", ");
      setAlmMessage(
        `ALM produce (${data.config?.mode ?? "record_only"}): ${summary || "none"}. ${data.note ?? ""}`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["qep-alm-produce", "by-defect", defectId],
      });
      void invalidate();
    },
    onError: (error) => setAlmMessage((error as Error).message),
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading defect…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : "Defect not found"
        }
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const { defect, history } = detailQuery.data;
  const actions = LIFECYCLE_ACTIONS[defect.status];

  return (
    <QepPageShell
      title={defect.title}
      description={`Investigation · ${defect.severity} · ${defect.priority}`}
      breadcrumbs={["QEP", "Defects", defect.title]}
      actions={
        <>
          <Link
            href={QEP_DEFECT_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Back
          </Link>
          {actions.map((action) => (
            <Button
              key={action.status}
              type="button"
              size="sm"
              variant="outline"
              disabled={lifecycleMutation.isPending}
              onClick={() => lifecycleMutation.mutate(action.status)}
            >
              {action.label}
            </Button>
          ))}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <QepPanel title="Summary">
            <p className="mb-2">
              <QepStatusBadge status={defect.status} />
            </p>
            <p className="whitespace-pre-wrap text-sm">
              {defect.description || "No description"}
            </p>
            {defect.resolution ? (
              <p className="mt-3 text-sm">
                <span className="font-medium">Resolution:</span> {defect.resolution}
              </p>
            ) : null}
            {defect.rootCause ? (
              <p className="mt-1 text-sm">
                <span className="font-medium">Root cause:</span> {defect.rootCause}
              </p>
            ) : null}
          </QepPanel>

          <QepPanel title="Execution origin">
            {defect.executionOrigin ? (
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Session</dt>
                  <dd>
                    <Link
                      href={QEP_EXECUTION_WORKSPACE_ROUTES.detail(
                        defect.executionOrigin.sessionId,
                      )}
                      className="font-mono text-xs text-[var(--color-primary)] underline"
                    >
                      {defect.executionOrigin.sessionId}
                    </Link>
                  </dd>
                </div>
                {defect.executionOrigin.stepId ? (
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Step</dt>
                    <dd>
                      {defect.executionOrigin.stepTitle ??
                        defect.executionOrigin.stepId}{" "}
                      ({defect.executionOrigin.stepOutcome})
                    </dd>
                  </div>
                ) : null}
                {defect.executionOrigin.failureNotes ? (
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Failure notes (copied)
                    </dt>
                    <dd>{defect.executionOrigin.failureNotes}</dd>
                  </div>
                ) : null}
                {defect.executionOrigin.suiteName ? (
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Suite</dt>
                    <dd>{defect.executionOrigin.suiteName}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Manual defect — no execution origin.
              </p>
            )}
          </QepPanel>

          <QepPanel title="ALM produce (F16)">
            <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
              Creates Projects / Support work-item intents via Platform Services.
              Default mode is record_only — not certification.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="qep-defect-alm-produce"
              disabled={almProduceMutation.isPending}
              onClick={() => {
                setAlmMessage(null);
                almProduceMutation.mutate();
              }}
            >
              {almProduceMutation.isPending ? "Producing…" : "Produce fix work items"}
            </Button>
            {almMessage ? (
              <p
                className="mt-2 text-sm text-[var(--color-muted-foreground)]"
                data-testid="qep-defect-alm-message"
              >
                {almMessage}
              </p>
            ) : null}
            {almListQuery.data?.records?.length ? (
              <ul className="mt-3 space-y-1 text-xs">
                {almListQuery.data.records.map((row) => (
                  <li key={row.produceId} className="font-mono">
                    {row.channel}:{row.status}
                    {row.externalRef ? ` · ${row.externalRef}` : ""}
                    {row.detail ? ` · ${row.detail}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </QepPanel>

          <QepPanel title="Relationships">
            <ul className="space-y-1 text-sm">
              {defect.relationships.map((r) => (
                <li key={r.relationshipId}>
                  <span className="text-[var(--color-muted-foreground)]">{r.kind}</span>{" "}
                  <span className="font-mono text-xs">{r.targetId}</span>
                  {r.label ? ` · ${r.label}` : ""}
                </li>
              ))}
              {defect.relationships.length === 0 ? (
                <li className="text-[var(--color-muted-foreground)]">
                  No relationships
                </li>
              ) : null}
            </ul>
          </QepPanel>

          <QepPanel title="Timeline / history">
            <ol className="space-y-2 text-sm">
              {[...history].reverse().map((entry, index) => (
                <li
                  key={`${entry.at}-${entry.action}-${index}`}
                  className="border-l-2 border-[var(--color-border)] pl-3"
                >
                  <div className="font-medium capitalize">
                    {entry.action.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {formatDate(entry.at)} · {entry.actorId}
                    {entry.fromStatus && entry.toStatus
                      ? ` · ${entry.fromStatus} → ${entry.toStatus}`
                      : ""}
                    {entry.detail ? ` · ${entry.detail}` : ""}
                  </div>
                </li>
              ))}
            </ol>
          </QepPanel>
        </div>

        <div className="flex flex-col gap-4">
          <QepPanel title="Assignment">
            <p className="mb-2 text-sm">
              Assignee: {defect.assigneeId ?? "Unassigned"}
            </p>
            <div className="flex flex-col gap-2">
              <Input
                aria-label="Assignee ID"
                placeholder="User ID"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                disabled={!assigneeId.trim() || assignMutation.isPending}
                onClick={() => assignMutation.mutate()}
              >
                Assign
              </Button>
            </div>
          </QepPanel>

          <QepPanel title="Evidence references">
            <ul className="mb-3 space-y-1 text-sm">
              {defect.evidenceRefs.map((ref) => (
                <li key={`${ref.evidenceId}-${ref.attachedAt}`}>
                  <span className="font-mono text-xs">{ref.evidenceId}</span>
                </li>
              ))}
              {defect.evidenceRefs.length === 0 ? (
                <li className="text-[var(--color-muted-foreground)]">
                  No evidence refs — Evidence Platform IDs only.
                </li>
              ) : null}
            </ul>
            <div className="flex flex-col gap-2">
              <Input
                aria-label="Evidence ID"
                placeholder="Evidence ID"
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!evidenceId.trim() || evidenceMutation.isPending}
                onClick={() => evidenceMutation.mutate()}
              >
                Attach reference
              </Button>
            </div>
          </QepPanel>

          <QepPanel title="Metadata">
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Reporter</dt>
                <dd>{defect.reporterId}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Created</dt>
                <dd>{formatDate(defect.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Revision</dt>
                <dd>{defect.revision}</dd>
              </div>
            </dl>
          </QepPanel>
        </div>
      </div>
    </QepPageShell>
  );
}

"use client";

import type {
  ExecutionSessionNode,
  StepOutcome,
} from "@apzhub/qep-execution-workspace";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  attachExecutionEvidence,
  createExecutionSessionFromHandoff,
  getExecutionSession,
  lifecycleExecutionSession,
  listExecutionSessions,
  recordExecutionStepResult,
  type QepExecutionSessionListParams,
} from "@/lib/qep/qep-execution-workspace-api";
import { listExecutionPlans } from "@/lib/qep/qep-execution-plans-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_DEFECT_ROUTES,
  QEP_EXECUTION_WORKSPACE_ROUTES,
  parseQepExecutionSessionRouteId,
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

const OUTCOMES: readonly StepOutcome[] = [
  "pass",
  "fail",
  "block",
  "skip",
  "not_applicable",
  "deferred",
];

function formatDate(value?: string): string {
  return value ? value.slice(0, 19).replace("T", " ") : "—";
}

function DashboardView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [handoffId, setHandoffId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const params: QepExecutionSessionListParams = {
    ...(status ? { status } : {}),
    ...(query.trim() ? { query: query.trim() } : {}),
    sortBy: "updatedAt",
    sortDirection: "desc",
  };

  const listQuery = useQuery({
    queryKey: qepQueryKeys.executionWorkspace.list(params),
    queryFn: ({ signal }) => listExecutionSessions(params, { signal }),
  });

  const handedOffPlans = useQuery({
    queryKey: qepQueryKeys.executionPlans.list({ status: "handed_off" }),
    queryFn: ({ signal }) => listExecutionPlans({ status: "handed_off" }, { signal }),
  });

  const createMutation = useMutation({
    mutationFn: (id: string) => createExecutionSessionFromHandoff(id),
    onSuccess: async (session) => {
      await queryClient.invalidateQueries({
        queryKey: qepQueryKeys.executionWorkspace.all(),
      });
      router.push(QEP_EXECUTION_WORKSPACE_ROUTES.detail(session.sessionId));
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Create failed");
    },
  });

  const items = listQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Execution Workspace"
      description="Perform manual test execution from Cap B handoffs. Completed sessions are immutable historical records."
      breadcrumbs={["QEP", "Execution Workspace"]}
    >
      <QepPanel title="Start from plan handoff">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-xs">
            Handed-off plan
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              value={handoffId}
              onChange={(e) => setHandoffId(e.target.value)}
              aria-label="Select handed-off plan"
            >
              <option value="">Select plan…</option>
              {(handedOffPlans.data?.items ?? []).map((plan) => (
                <option
                  key={plan.planId}
                  value={plan.handoff?.handoffId ?? ""}
                  disabled={!plan.handoff}
                >
                  {plan.name} · {plan.handoff?.handoffId ?? "no handoff"}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            disabled={!handoffId || createMutation.isPending}
            onClick={() => {
              setError(null);
              createMutation.mutate(handoffId);
            }}
          >
            Create session
          </Button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
      </QepPanel>

      <QepFilterBar>
        <label className="flex flex-col gap-1 text-xs">
          Search
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search sessions"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Status
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All</option>
            {[
              "not_started",
              "in_progress",
              "paused",
              "blocked",
              "completed",
              "cancelled",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </QepFilterBar>

      {listQuery.isLoading ? (
        <QepLoadingState label="Loading sessions…" />
      ) : listQuery.isError ? (
        <QepErrorState
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "Failed to load"
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <QepEmptyState title="No execution sessions yet. Create one from a Cap B handoff." />
      ) : (
        <QepTable
          caption="Execution sessions"
          columns={["Name", "Status", "Progress", "Suite", "Plan", "Updated"]}
          rows={items.map((session) => ({
            id: session.sessionId,
            cells: [
              <Link
                key="n"
                href={QEP_EXECUTION_WORKSPACE_ROUTES.detail(session.sessionId)}
                className="underline-offset-2 hover:underline"
              >
                {session.name}
              </Link>,
              <QepStatusBadge key="s" status={session.status} />,
              `${session.progress.percentComplete}%`,
              session.planning.suiteName,
              session.planning.planName,
              formatDate(session.updatedAt),
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function SessionDetailView({ sessionId }: { readonly sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [evidenceId, setEvidenceId] = useState("");
  const [evidenceStepId, setEvidenceStepId] = useState("");
  const [focusedStepId, setFocusedStepId] = useState<string | null>(null);
  const [failureNotes, setFailureNotes] = useState("");

  const detailQuery = useQuery({
    queryKey: qepQueryKeys.executionWorkspace.detail(sessionId),
    queryFn: ({ signal }) => getExecutionSession(sessionId, { signal }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.executionWorkspace.all(),
    });
  };

  const lifecycleMutation = useMutation({
    mutationFn: (action: Parameters<typeof lifecycleExecutionSession>[1]) =>
      lifecycleExecutionSession(sessionId, action),
    onSuccess: invalidate,
  });

  const resultMutation = useMutation({
    mutationFn: (input: {
      stepId: string;
      outcome: StepOutcome;
      failureNotes?: string;
    }) => recordExecutionStepResult(sessionId, input),
    onSuccess: async (session, variables) => {
      await invalidate();
      if (variables.outcome === "fail" || variables.outcome === "block") {
        router.push(
          `${QEP_DEFECT_ROUTES.new}?sessionId=${encodeURIComponent(session.sessionId)}&stepId=${encodeURIComponent(variables.stepId)}`,
        );
      }
    },
  });

  const evidenceMutation = useMutation({
    mutationFn: () =>
      attachExecutionEvidence(sessionId, {
        evidenceId,
        ...(evidenceStepId ? { stepId: evidenceStepId } : {}),
      }),
    onSuccess: async () => {
      setEvidenceId("");
      await invalidate();
    },
  });

  const session = detailQuery.data?.session;
  const steps = session?.steps ?? [];

  // Default focus to first incomplete step.
  const resolvedFocus =
    focusedStepId && steps.some((s) => s.stepId === focusedStepId)
      ? focusedStepId
      : (steps.find((s) => s.outcome === "not_executed")?.stepId ??
        steps[0]?.stepId ??
        null);

  const active = session?.status === "in_progress" || session?.status === "blocked";

  useEffect(() => {
    if (!active || !resolvedFocus) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const index = steps.findIndex((s) => s.stepId === resolvedFocus);
      if (index < 0) return;
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = steps[Math.min(index + 1, steps.length - 1)];
        if (next) setFocusedStepId(next.stepId);
        return;
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        const prev = steps[Math.max(index - 1, 0)];
        if (prev) setFocusedStepId(prev.stepId);
        return;
      }
      const step = steps[index];
      if (!step || resultMutation.isPending) return;
      const map: Record<string, StepOutcome> = {
        "1": "pass",
        p: "pass",
        P: "pass",
        "2": "fail",
        f: "fail",
        F: "fail",
        "3": "block",
        b: "block",
        B: "block",
        "4": "skip",
        s: "skip",
        S: "skip",
      };
      const outcome = map[event.key];
      if (!outcome) return;
      event.preventDefault();
      resultMutation.mutate({
        stepId: step.stepId,
        outcome,
        failureNotes:
          outcome === "fail" || outcome === "block"
            ? failureNotes.trim() || undefined
            : undefined,
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, resolvedFocus, steps, resultMutation, failureNotes]);

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading execution session…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : "Session not found"
        }
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const { history } = detailQuery.data;

  return (
    <QepPageShell
      title={session!.name}
      description={`${session!.planning.suiteName} v${session!.planning.suiteVersion} · handoff ${session!.planning.handoffId}`}
      breadcrumbs={["QEP", "Execution Workspace", session!.name]}
      actions={
        <>
          <Link
            href={QEP_EXECUTION_WORKSPACE_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Dashboard
          </Link>
          {session!.status === "not_started" ||
          session!.status === "paused" ||
          session!.status === "blocked" ? (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                lifecycleMutation.mutate(
                  session!.status === "not_started" ? "open" : "resume",
                )
              }
            >
              {session!.status === "not_started" ? "Start" : "Resume"}
            </Button>
          ) : null}
          {session!.status === "in_progress" ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => lifecycleMutation.mutate("pause")}
              >
                Pause
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => lifecycleMutation.mutate("complete")}
              >
                Complete
              </Button>
            </>
          ) : null}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <QepPanel title="Progress">
            <p className="text-sm">
              <QepStatusBadge status={session!.status} />{" "}
              {session!.progress.percentComplete}% · {session!.progress.executedSteps}/
              {session!.progress.totalSteps} steps · pass {session!.progress.passed} ·
              fail {session!.progress.failed} · block {session!.progress.blocked}
            </p>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-muted)]"
              role="progressbar"
              aria-valuenow={session!.progress.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-[var(--color-primary)]"
                style={{ width: `${session!.progress.percentComplete}%` }}
              />
            </div>
          </QepPanel>

          <QepPanel title="Step checklist">
            {active ? (
              <p
                className="mb-3 text-xs text-[var(--color-muted-foreground)]"
                data-testid="qep-execution-shortcuts-help"
              >
                Focus a step, then press <kbd className="rounded border px-1">1</kbd>/
                <kbd className="rounded border px-1">p</kbd> pass ·{" "}
                <kbd className="rounded border px-1">2</kbd>/
                <kbd className="rounded border px-1">f</kbd> fail ·{" "}
                <kbd className="rounded border px-1">3</kbd>/
                <kbd className="rounded border px-1">b</kbd> block ·{" "}
                <kbd className="rounded border px-1">4</kbd>/
                <kbd className="rounded border px-1">s</kbd> skip ·{" "}
                <kbd className="rounded border px-1">j</kbd>/
                <kbd className="rounded border px-1">k</kbd> move. Fail/block opens
                defect create.
              </p>
            ) : null}
            {active ? (
              <label className="mb-3 flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
                Failure / block notes (optional)
                <Input
                  value={failureNotes}
                  onChange={(event) => setFailureNotes(event.target.value)}
                  placeholder="Why this step failed or blocked"
                  data-testid="qep-execution-failure-notes"
                />
              </label>
            ) : null}
            <ol className="space-y-3" data-testid="qep-execution-step-list">
              {steps.map((step) => {
                const focused = step.stepId === resolvedFocus;
                return (
                  <li
                    key={step.stepId}
                    className={`rounded-md border p-3 ${
                      focused
                        ? "border-[var(--color-primary)] ring-2 ring-[var(--color-ring)]"
                        : "border-[var(--color-border)]"
                    }`}
                    aria-current={focused ? "step" : undefined}
                    data-testid={`qep-execution-step-${step.stepId}`}
                    onClick={() => setFocusedStepId(step.stepId)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          #{step.order}
                        </span>{" "}
                        <span className="font-medium">{step.title}</span>
                      </div>
                      <QepStatusBadge status={step.outcome} />
                    </div>
                    {active ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {OUTCOMES.map((outcome) => (
                          <Button
                            key={outcome}
                            type="button"
                            size="sm"
                            variant={step.outcome === outcome ? "default" : "outline"}
                            disabled={resultMutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation();
                              setFocusedStepId(step.stepId);
                              resultMutation.mutate({
                                stepId: step.stepId,
                                outcome,
                                failureNotes:
                                  outcome === "fail" || outcome === "block"
                                    ? failureNotes.trim() || undefined
                                    : undefined,
                              });
                            }}
                          >
                            {outcome.replace(/_/g, " ")}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                    {step.comment ? (
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        {step.comment}
                      </p>
                    ) : null}
                    {step.failureNotes ? (
                      <p className="mt-1 text-xs text-[var(--color-destructive)]">
                        {step.failureNotes}
                      </p>
                    ) : null}
                    {step.outcome === "fail" || step.outcome === "block" ? (
                      <div className="mt-2">
                        <Link
                          href={`${QEP_DEFECT_ROUTES.new}?sessionId=${encodeURIComponent(session!.sessionId)}&stepId=${encodeURIComponent(step.stepId)}`}
                          className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Raise defect
                        </Link>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {session!.status === "completed" ? (
              <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
                Completed sessions are immutable. Corrections require a governed
                amendment workflow (API: /amend).
              </p>
            ) : null}
          </QepPanel>

          <QepPanel title="Activity timeline">
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
                    {entry.detail ? ` · ${entry.detail}` : ""}
                  </div>
                </li>
              ))}
            </ol>
          </QepPanel>
        </div>

        <div className="flex flex-col gap-4">
          <QepPanel title="Planning snapshot">
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Plan</dt>
                <dd>{session!.planning.planName}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Handoff</dt>
                <dd className="font-mono text-xs">{session!.planning.handoffId}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Environment</dt>
                <dd>{session!.planning.environmentLabels.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Window</dt>
                <dd>
                  {formatDate(session!.planning.plannedStartAt)} →{" "}
                  {formatDate(session!.planning.plannedEndAt)}
                </dd>
              </div>
            </dl>
          </QepPanel>

          <QepPanel title="Evidence references">
            <ul className="mb-3 space-y-1 text-sm">
              {session!.evidenceRefs.map((ref) => (
                <li key={`${ref.evidenceId}-${ref.attachedAt}`}>
                  <span className="font-mono text-xs">{ref.evidenceId}</span>
                  {ref.stepId ? ` · ${ref.stepId}` : ""}
                </li>
              ))}
              {session!.evidenceRefs.length === 0 ? (
                <li className="text-[var(--color-muted-foreground)]">
                  No evidence attached — references Evidence Platform IDs only.
                </li>
              ) : null}
            </ul>
            {session!.status !== "archived" && session!.status !== "cancelled" ? (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Evidence ID"
                  value={evidenceId}
                  onChange={(e) => setEvidenceId(e.target.value)}
                  aria-label="Evidence ID"
                />
                <Input
                  placeholder="Step ID (optional)"
                  value={evidenceStepId}
                  onChange={(e) => setEvidenceStepId(e.target.value)}
                  aria-label="Step ID"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!evidenceId || evidenceMutation.isPending}
                  onClick={() => evidenceMutation.mutate()}
                >
                  Attach evidence reference
                </Button>
              </div>
            ) : null}
          </QepPanel>

          <QepPanel title="Amendments">
            {session!.amendments.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">None</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {session!.amendments.map((a) => (
                  <li key={a.amendmentId}>
                    {a.stepId}: {a.previousOutcome} → {a.newOutcome} ({a.reason})
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>
        </div>
      </div>
    </QepPageShell>
  );
}

export function QepExecutionWorkspaceRouterView({
  pathname,
}: {
  readonly pathname: string;
}) {
  const sessionId = parseQepExecutionSessionRouteId(pathname);
  if (sessionId) {
    return <SessionDetailView sessionId={sessionId} />;
  }
  return <DashboardView />;
}

// silence unused type import when tree-shaken in tests
export type { ExecutionSessionNode };

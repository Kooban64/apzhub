"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { PresentedExecution } from "@apzhub/qep-test-management/domain";
import {
  QEP_TEST_EXECUTION_ROUTES,
  isQepTestExecutionHomeRoute,
  parseQepTestExecutionRouteId,
} from "@apzhub/qep-test-execution/presentation";

import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { useSessionOpenedId } from "@/lib/qep/use-session-opened-id";
import {
  createExecutionDefect,
  createRerun,
  createRetest,
  getExecutionInvestigation,
  listPresentedExecutions,
  startPlanExecution,
  type ExecutionInvestigation,
} from "@/lib/qep/qep-phase4-executions-api";
import { listTestPlans } from "@/lib/qep/qep-test-management-api";
import {
  associateExecutionEvidence,
  performExecutionAction,
  recordExecutionStepResult,
} from "@/lib/qep/qep-test-execution-api";
import { QepErrorState, QepLoadingState } from "./qep-ui";

function titleCase(value: string | undefined): string {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function productResultFromOutcome(
  value: string | null | undefined,
): PresentedExecution["result"] {
  if (value === "failed") return "fail";
  if (value === "passed") return "pass";
  if (value === "blocked") return "blocked";
  return "not_run";
}

function formatWhen(value: string | undefined): string {
  if (!value) return "—";
  return value.slice(0, 16).replace("T", " ");
}

function openHref(row: PresentedExecution): string {
  if (row.engine === "workspace_session") {
    return `/workspace/qep/execution-workspace/${encodeURIComponent(row.id)}`;
  }
  return QEP_TEST_EXECUTION_ROUTES.detail(row.id);
}

export function QepPhase4ExecutionsView({ pathname }: { readonly pathname: string }) {
  const livePath = usePathname() ?? pathname;
  const routeId = parseQepTestExecutionRouteId(livePath);
  const { openedId, setOpenedId } = useSessionOpenedId("apzqep.openedExecutionId");
  const executionId =
    routeId ?? (isQepTestExecutionHomeRoute(livePath) ? null : openedId);
  if (executionId) {
    return (
      <Phase4ExecutionDetail
        executionId={executionId}
        onBack={() => setOpenedId(null)}
      />
    );
  }
  return <Phase4ExecutionList onOpen={(id) => setOpenedId(id)} />;
}

function Phase4ExecutionList({ onOpen }: { readonly onOpen: (id: string) => void }) {
  const { selectedId } = useQepApplicationContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [planId, setPlanId] = useState("");

  const listQ = useQuery({
    queryKey: ["qep-presented-executions", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listPresentedExecutions(selectedId!),
  });
  const plansQ = useQuery({
    queryKey: ["qep-test-plans", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listTestPlans(selectedId!),
  });

  const start = useMutation({
    mutationFn: () => startPlanExecution(planId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-presented-executions"] });
    },
  });

  const rows = listQ.data ?? [];
  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter && row.status !== statusFilter) return false;
        if (resultFilter && row.result !== resultFilter) return false;
        if (typeFilter && row.type !== typeFilter) return false;
        return true;
      }),
    [rows, statusFilter, resultFilter, typeFilter],
  );
  const counts = useMemo(() => {
    return {
      total: filtered.length,
      running: filtered.filter((row) => row.status === "in_progress").length,
      completed: filtered.filter((row) => row.status === "completed").length,
      failed: filtered.filter((row) => row.result === "fail").length,
      passed: filtered.filter((row) => row.result === "pass").length,
    };
  }, [filtered]);

  if (!selectedId) {
    return (
      <div className="p-5 text-sm" data-testid="qep-executions">
        Select an application to list executions.
      </div>
    );
  }
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;
  if (listQ.isLoading) return <QepLoadingState label="Loading executions…" />;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-executions"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Quality
          </p>
          <h1 className="text-xl font-semibold">Executions</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Runs from Test Plans. Status is operational lifecycle. Result is quality
            outcome.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
            data-testid="qep-execution-plan-select"
          >
            <option value="">Start from Test Plan</option>
            {(plansQ.data ?? []).map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.number} · {plan.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
            disabled={!planId || start.isPending}
            onClick={() => start.mutate()}
            data-testid="qep-execution-start"
          >
            Start execution
          </button>
        </div>
      </div>
      {start.isError ? (
        <p className="text-xs text-red-600" data-testid="qep-execution-start-error">
          {(start.error as Error).message}
        </p>
      ) : null}

      <div
        className="grid grid-cols-2 gap-2 md:grid-cols-5"
        data-testid="qep-execution-summary"
      >
        <SummaryCard label="Total" value={counts.total} />
        <SummaryCard label="Running" value={counts.running} />
        <SummaryCard label="Completed" value={counts.completed} />
        <SummaryCard label="Passed" value={counts.passed} />
        <SummaryCard label="Failed" value={counts.failed} />
      </div>

      <div className="flex flex-wrap gap-2" data-testid="qep-execution-filters">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["in_progress", "paused", "completed", "blocked", "cancelled"]}
        />
        <FilterSelect
          label="Result"
          value={resultFilter}
          onChange={setResultFilter}
          options={["pass", "fail", "blocked", "not_run"]}
        />
        <FilterSelect
          label="Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={["manual", "automated", "mixed"]}
        />
      </div>

      <div className="hidden overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] md:block">
        <table className="min-w-full text-xs" data-testid="qep-execution-table">
          <thead className="text-left text-[10px] uppercase text-[var(--color-muted-foreground)]">
            <tr>
              <th className="px-3 py-2">Execution</th>
              <th>Name</th>
              <th>Plan</th>
              <th>Type</th>
              <th>Environment</th>
              <th>Method</th>
              <th>Status</th>
              <th>Result</th>
              <th>Progress</th>
              <th>Owner</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-t border-[var(--color-border)]"
                data-testid={`qep-execution-row-${row.id}`}
                onClick={() => {
                  onOpen(row.id);
                  router.push(openHref(row));
                }}
              >
                <td className="px-3 py-2 font-medium">{row.name ?? row.id}</td>
                <td>{row.name ?? "—"}</td>
                <td>
                  {plansQ.data?.find((plan) => plan.id === row.planId)?.title ??
                    row.planId ??
                    "—"}
                </td>
                <td>{titleCase(row.type)}</td>
                <td>{row.environmentName ?? row.environmentId ?? "—"}</td>
                <td>{titleCase(row.method)}</td>
                <td data-testid="qep-execution-status">{titleCase(row.status)}</td>
                <td data-testid="qep-execution-result">{titleCase(row.result)}</td>
                <td>
                  {row.progressPercent !== undefined ? `${row.progressPercent}%` : "—"}
                </td>
                <td>{row.ownerId ?? "—"}</td>
                <td>{formatWhen(row.updatedAt ?? row.executedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="flex flex-col gap-2 md:hidden"
        data-testid="qep-execution-mobile-list"
      >
        {filtered.map((row) => (
          <button
            key={row.id}
            type="button"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-left"
            onClick={() => {
              onOpen(row.id);
              router.push(openHref(row));
            }}
          >
            <p className="text-sm font-medium">{row.name ?? row.id}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {titleCase(row.type)} · {titleCase(row.status)} · {titleCase(row.result)}
            </p>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No executions for this application.
        </p>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
      <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-[var(--color-muted-foreground)]">{label}</span>
      <select
        className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {titleCase(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Phase4ExecutionDetail({
  executionId,
  onBack,
}: {
  readonly executionId: string;
  readonly onBack: () => void;
}) {
  const investigationQ = useQuery({
    queryKey: ["qep-execution-investigation", executionId],
    queryFn: () => getExecutionInvestigation(executionId),
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
  });
  if (investigationQ.isError)
    return <QepErrorState message={(investigationQ.error as Error).message} />;
  if (!investigationQ.data) return <QepLoadingState label="Loading execution…" />;
  const data = investigationQ.data;
  const type =
    data.presented?.type ??
    (data.testExecution?.mode === "automated" ? "automated" : "manual");
  const status = data.testExecution?.status ?? data.presented?.status ?? "draft";
  const completed =
    status === "completed" ||
    status === "submitted_for_review" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "cancelled" ||
    status === "superseded";
  if (type === "automated" && !completed)
    return <AutomatedDetail data={data} onBack={onBack} />;
  if (completed) return <ResultDetail data={data} onBack={onBack} />;
  return <ManualWorkspace data={data} executionId={executionId} onBack={onBack} />;
}

function BackLink({ onBack }: { readonly onBack: () => void }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-xs text-[var(--color-muted-foreground)]"
      data-testid="qep-execution-back"
      onClick={() => {
        onBack();
        router.push(QEP_TEST_EXECUTION_ROUTES.home);
      }}
    >
      Executions
    </button>
  );
}

function ManualWorkspace({
  data,
  executionId,
  onBack,
}: {
  readonly data: ExecutionInvestigation;
  readonly executionId: string;
  readonly onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const execution = data.testExecution;
  const definitionSteps = data.definition?.steps ?? [];
  const [stepOrder, setStepOrder] = useState(definitionSteps[0]?.order ?? 1);
  const [actual, setActual] = useState("");
  const [result, setResult] = useState("passed");
  const [evidenceUri, setEvidenceUri] = useState("");
  const [defectTitle, setDefectTitle] = useState("");
  const [confirmDefect, setConfirmDefect] = useState(false);

  const selectedDef = definitionSteps.find((step) => step.order === stepOrder);
  const selectedExec = execution?.steps.find((step) => step.order === stepOrder);
  const stepEvidence = (execution?.evidenceReferences ?? []).filter(
    (ref) => ref.stepOrder === stepOrder,
  );
  const revisionRef = useRef(execution?.revision ?? 0);
  revisionRef.current = Math.max(revisionRef.current, execution?.revision ?? 0);

  function selectStep(order: number) {
    const current = execution?.steps.find((step) => step.order === order);
    setStepOrder(order);
    setActual(current?.actualResult ?? "");
    setResult(current?.outcome ?? "passed");
  }

  async function refreshInvestigation() {
    await queryClient.invalidateQueries({
      queryKey: ["qep-execution-investigation", executionId],
    });
  }

  const save = useMutation({
    mutationFn: async (advance: boolean) => {
      if (!execution) throw new Error("execution.required");
      const updated = await recordExecutionStepResult(execution.id, stepOrder, {
        expectedRevision: revisionRef.current,
        outcome: result,
        actualResult: actual,
      });
      revisionRef.current = updated.revision;
      if (advance) {
        const next = definitionSteps.find((step) => step.order > stepOrder);
        if (next) selectStep(next.order);
      }
      return updated;
    },
    onSuccess: async () => {
      await refreshInvestigation();
    },
  });
  const pause = useMutation({
    mutationFn: async () => {
      if (!execution) throw new Error("execution.required");
      const updated = await performExecutionAction(execution.id, "pause", {
        expectedRevision: revisionRef.current,
      });
      revisionRef.current = updated.revision;
      return updated;
    },
    onSuccess: async () => {
      await refreshInvestigation();
    },
  });
  const resume = useMutation({
    mutationFn: async () => {
      if (!execution) throw new Error("execution.required");
      const updated = await performExecutionAction(execution.id, "resume", {
        expectedRevision: revisionRef.current,
      });
      revisionRef.current = updated.revision;
      return updated;
    },
    onSuccess: async () => {
      await refreshInvestigation();
    },
  });
  const complete = useMutation({
    mutationFn: async () => {
      if (!execution) throw new Error("execution.required");
      const updated = await performExecutionAction(execution.id, "complete", {
        expectedRevision: revisionRef.current,
      });
      revisionRef.current = updated.revision;
      return updated;
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["qep-execution-investigation", executionId],
        (current: ExecutionInvestigation | undefined) => {
          if (!current) return current;
          return {
            ...current,
            testExecution: updated,
            presented: current.presented
              ? {
                  ...current.presented,
                  status: "completed",
                  result: productResultFromOutcome(updated.outcome),
                }
              : current.presented,
          };
        },
      );
      await refreshInvestigation();
    },
  });
  const attach = useMutation({
    mutationFn: async () => {
      if (!execution || !evidenceUri.trim()) throw new Error("evidence.uri_required");
      const updated = await associateExecutionEvidence(execution.id, {
        expectedRevision: revisionRef.current,
        uri: evidenceUri.trim(),
        stepOrder,
      });
      revisionRef.current = updated.revision;
      return updated;
    },
    onSuccess: async () => {
      setEvidenceUri("");
      await refreshInvestigation();
    },
  });
  const defect = useMutation({
    mutationFn: async () => {
      if (!execution || !confirmDefect) throw new Error("defect.confirm_required");
      return createExecutionDefect({
        testExecutionId: execution.id,
        title: defectTitle || `${data.testCase?.number ?? "Test"} failed`,
        description: `Expected: ${selectedDef?.expectedResult ?? ""}\nActual: ${actual || selectedExec?.actualResult || ""}`,
      });
    },
    onSuccess: async () => {
      setConfirmDefect(false);
      setDefectTitle("");
      await refreshInvestigation();
    },
  });

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid={execution ? "qep-manual-execution" : "qep-manual-execution"}
    >
      <span
        className="sr-only"
        data-testid={execution ? "qep-engine-present" : "qep-engine-missing"}
      >
        {execution ? "Engine loaded" : "Engine missing"}
      </span>
      <BackLink onBack={onBack} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            {data.testCase?.title ?? data.presented?.name}
          </h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {data.testCase?.number} · {titleCase(data.presented?.status)} · Result{" "}
            {titleCase(data.presented?.result)}
          </p>
        </div>
        <div className="flex gap-2">
          {execution?.availableActions.some(
            (action) => action.action === "pauseExecution" || action.action === "pause",
          ) ? (
            <button
              type="button"
              className="h-9 rounded-md border border-[var(--color-border)] px-3 text-xs"
              onClick={() => pause.mutate()}
              data-testid="qep-execution-pause"
            >
              Pause
            </button>
          ) : null}
          {execution?.availableActions.some(
            (action) =>
              action.action === "resumeExecution" || action.action === "resume",
          ) ? (
            <button
              type="button"
              className="h-9 rounded-md border border-[var(--color-border)] px-3 text-xs"
              onClick={() => resume.mutate()}
              data-testid="qep-execution-resume"
            >
              Resume
            </button>
          ) : null}
          {execution?.availableActions.some(
            (action) =>
              action.action === "completeExecution" || action.action === "complete",
          ) ? (
            <button
              type="button"
              className="h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
              onClick={() => complete.mutate()}
              data-testid="qep-execution-complete"
            >
              Complete
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3"
          data-testid="qep-manual-steps"
        >
          <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
            Steps
          </p>
          <span className="sr-only" data-testid="qep-manual-current-step">
            {stepOrder}
          </span>
          <ol className="mt-2 space-y-1">
            {definitionSteps.map((step) => {
              const recorded = execution?.steps.find(
                (item) => item.order === step.order,
              );
              return (
                <li key={step.order}>
                  <button
                    type="button"
                    className={`w-full rounded px-2 py-1 text-left text-xs ${step.order === stepOrder ? "bg-[var(--color-muted)] font-medium" : ""}`}
                    onClick={() => selectStep(step.order)}
                    data-testid={`qep-manual-step-${step.order}`}
                    aria-current={step.order === stepOrder ? "step" : undefined}
                  >
                    {step.order}. {step.action}
                    <span
                      className="mt-0.5 block text-[10px] text-[var(--color-muted-foreground)]"
                      data-testid={`qep-manual-step-${step.order}-outcome`}
                    >
                      {titleCase(recorded?.outcome)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
        <section
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
          data-testid="qep-manual-definition"
        >
          <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
            Definition snapshot
          </p>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                Action
              </dt>
              <dd data-testid="qep-step-action">{selectedDef?.action ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                Test data
              </dt>
              <dd data-testid="qep-step-testdata">{selectedDef?.testDataRef ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                Expected result
              </dt>
              <dd data-testid="qep-step-expected">
                {selectedDef?.expectedResult ?? "—"}
              </dd>
            </div>
          </dl>
        </section>
        <section
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
          data-testid="qep-manual-result"
        >
          <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
            Execution result
          </p>
          <label className="mt-3 block text-xs">
            Actual result
            <textarea
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
              value={actual}
              onChange={(event) => setActual(event.target.value)}
              data-testid="qep-step-actual"
            />
          </label>
          <p
            className="mt-1 text-[10px] text-[var(--color-muted-foreground)]"
            data-testid="qep-step-actual-persisted"
          >
            {selectedExec?.actualResult ?? ""}
          </p>
          <label className="mt-3 block text-xs">
            Result
            <select
              className="mt-1 h-9 w-full rounded-md border border-[var(--color-border)] px-2"
              value={result}
              onChange={(event) => setResult(event.target.value)}
              data-testid="qep-step-outcome"
            >
              <option value="passed">Pass</option>
              <option value="failed">Fail</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="h-9 rounded-md border border-[var(--color-border)] px-3 text-xs"
              disabled={save.isPending}
              onClick={() => save.mutate(false)}
              data-testid="qep-step-save"
            >
              Save Step Result
            </button>
            <button
              type="button"
              className="h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
              disabled={save.isPending}
              onClick={() => save.mutate(true)}
              data-testid="qep-step-save-next"
            >
              Save & Next
            </button>
          </div>
          {save.error || attach.error || defect.error || complete.error ? (
            <p className="mt-2 text-xs text-red-600" data-testid="qep-step-error">
              {(save.error as Error | undefined)?.message ??
                (attach.error as Error | undefined)?.message ??
                (defect.error as Error | undefined)?.message ??
                (complete.error as Error | undefined)?.message}
            </p>
          ) : null}
          <div
            className="mt-4 border-t border-[var(--color-border)] pt-3"
            data-testid="qep-step-evidence"
          >
            <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
              Evidence
            </p>
            <input
              className="mt-2 h-9 w-full rounded-md border border-[var(--color-border)] px-2 text-xs"
              placeholder="Evidence URI / reference"
              value={evidenceUri}
              onChange={(event) => setEvidenceUri(event.target.value)}
              data-testid="qep-evidence-uri"
            />
            <button
              type="button"
              className="mt-2 h-8 rounded-md border border-[var(--color-border)] px-3 text-xs"
              onClick={() => attach.mutate()}
              data-testid="qep-evidence-attach"
            >
              Attach evidence
            </button>
            <div className="mt-2 text-xs" data-testid="qep-step-evidence-list">
              {stepEvidence.map((ref) => (
                <p key={ref.id}>{ref.uri}</p>
              ))}
            </div>
          </div>
          <div
            className="mt-4 border-t border-[var(--color-border)] pt-3"
            data-testid="qep-step-defect"
          >
            <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
              Defect
            </p>
            <input
              className="mt-2 h-9 w-full rounded-md border border-[var(--color-border)] px-2 text-xs"
              placeholder="Defect title"
              value={defectTitle}
              onChange={(event) => setDefectTitle(event.target.value)}
              data-testid="qep-defect-title"
            />
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={confirmDefect}
                onChange={(event) => setConfirmDefect(event.target.checked)}
                data-testid="qep-defect-confirm"
              />
              I confirm creating this defect
            </label>
            <button
              type="button"
              className="mt-2 h-8 rounded-md border border-[var(--color-border)] px-3 text-xs"
              disabled={!confirmDefect}
              onClick={() => defect.mutate()}
              data-testid="qep-defect-create"
            >
              Create defect
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function AutomatedDetail({
  data,
  onBack,
}: {
  readonly data: ExecutionInvestigation;
  readonly onBack: () => void;
}) {
  const [tab, setTab] = useState<
    "overview" | "results" | "logs" | "artifacts" | "defects"
  >("overview");
  const provider = data.providerExecutions[0];
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-automated-execution"
    >
      <BackLink onBack={onBack} />
      <h1 className="text-xl font-semibold">
        {data.presented?.name ?? data.testExecution?.executionNumber}
      </h1>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {titleCase(data.presented?.status)} · Result {titleCase(data.presented?.result)}{" "}
        · Provider is secondary
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        {(["overview", "results", "logs", "artifacts", "defects"] as const).map(
          (id) => (
            <button
              key={id}
              type="button"
              className={`h-8 rounded-md border px-3 ${tab === id ? "border-[var(--color-foreground)]" : "border-[var(--color-border)]"}`}
              onClick={() => setTab(id)}
              data-testid={`qep-automated-tab-${id}`}
            >
              {titleCase(id)}
            </button>
          ),
        )}
      </div>
      {tab === "overview" ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm">
          <p data-testid="qep-automated-plan">
            Plan: {data.scope?.planId ?? data.presented?.planId ?? "—"}
          </p>
          <p data-testid="qep-automated-capability">
            Capability:{" "}
            {titleCase(data.strategy?.verificationCapability ?? data.presented?.method)}
          </p>
          <p data-testid="qep-automated-surface">
            Surface: {titleCase(data.strategy?.executionSurface)}
          </p>
          <p data-testid="qep-automated-environment">
            Environment:{" "}
            {data.strategy?.environmentName ?? data.presented?.environmentName ?? "—"}
          </p>
          <p data-testid="qep-automated-target">
            Target: {data.strategy?.infrastructureTargetType ?? "—"}
            {data.strategy?.infrastructureTargetName
              ? ` · ${data.strategy.infrastructureTargetName}`
              : ""}
          </p>
          <p data-testid="qep-automated-mapping">
            Provider mapping: {data.strategy?.automationMappingId ?? "—"}
          </p>
          <p data-testid="qep-provider-secondary">
            Provider execution:{" "}
            {provider ? `${provider.providerId} (${provider.state})` : "Not correlated"}
          </p>
        </div>
      ) : null}
      {tab === "results" ? (
        <ol
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
          data-testid="qep-automated-results"
        >
          {(data.testExecution?.steps ?? []).map((step) => (
            <li key={step.order} className="border-b border-[var(--color-border)] py-2">
              {step.order}. {step.instruction} — {titleCase(step.outcome)}
            </li>
          ))}
        </ol>
      ) : null}
      {tab === "logs" ? (
        <div
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
          data-testid="qep-automated-logs"
        >
          {provider?.logRefs.length ? (
            provider.logRefs.map((log) => (
              <p key={log.name}>
                {log.name}
                {log.uri ? (
                  <a className="ml-2 underline" href={log.uri}>
                    Fetch
                  </a>
                ) : null}
              </p>
            ))
          ) : (
            <p data-testid="qep-automated-logs-unavailable">Not available</p>
          )}
        </div>
      ) : null}
      {tab === "artifacts" ? (
        <div
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
          data-testid="qep-automated-artifacts"
        >
          {(provider?.artifacts.length ? provider.artifacts : []).map((artifact) => (
            <p key={artifact.artifactId}>
              {artifact.kind}: {artifact.name}
              {artifact.uri ? ` · ${artifact.uri}` : " · reference only"}
            </p>
          ))}
          {(data.testExecution?.evidenceReferences ?? []).map((ref) => (
            <p key={ref.id}>Evidence {ref.id}</p>
          ))}
        </div>
      ) : null}
      {tab === "defects" ? <DefectPanel data={data} /> : null}
    </div>
  );
}

function ResultDetail({
  data,
  onBack,
}: {
  readonly data: ExecutionInvestigation;
  readonly onBack: () => void;
}) {
  const [tab, setTab] = useState<
    "summary" | "steps" | "evidence" | "defect" | "history" | "linked"
  >("summary");
  const failed = (data.testExecution?.steps ?? []).find(
    (step) => step.outcome === "failed",
  );
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-execution-result"
    >
      <BackLink onBack={onBack} />
      <h1 className="text-xl font-semibold">
        {data.testCase?.title ?? data.presented?.name}
      </h1>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Historical snapshot · {data.testCase?.number} · Result{" "}
        {titleCase(data.presented?.result)}
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        {(["summary", "steps", "evidence", "defect", "history", "linked"] as const).map(
          (id) => (
            <button
              key={id}
              type="button"
              className={`h-8 rounded-md border px-3 ${tab === id ? "border-[var(--color-foreground)]" : "border-[var(--color-border)]"}`}
              onClick={() => setTab(id)}
              data-testid={`qep-result-tab-${id}`}
            >
              {titleCase(id)}
            </button>
          ),
        )}
      </div>
      {tab === "summary" ? (
        <div
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
          data-testid="qep-result-summary"
        >
          <p>Status: {titleCase(data.presented?.status)}</p>
          <p>Result: {titleCase(data.presented?.result)}</p>
          <p>Environment: {data.strategy?.environmentName ?? "—"}</p>
          <p>Method: {titleCase(data.strategy?.verificationCapability)}</p>
          <p>AC: {(data.testCase?.criterionIds ?? []).join(", ") || "—"}</p>
          {data.relation ? (
            <p data-testid="qep-result-relation">
              {titleCase(data.relation.relationKind)} of{" "}
              {data.relation.previousExecutionId}
              {data.relation.triggeringDefectId
                ? ` · defect ${data.relation.triggeringDefectId}`
                : ""}
            </p>
          ) : null}
        </div>
      ) : null}
      {tab === "steps" ? (
        <div data-testid="qep-result-steps">
          <ol className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm">
            {(data.definition?.steps ?? []).map((step) => {
              const recorded = data.testExecution?.steps.find(
                (item) => item.order === step.order,
              );
              return (
                <li
                  key={step.order}
                  className="border-b border-[var(--color-border)] py-2"
                  data-testid={`qep-result-step-${step.order}`}
                >
                  <p className="font-medium">
                    {step.order}. {step.action}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Expected: {step.expectedResult}
                  </p>
                  <p className="text-xs">Actual: {recorded?.actualResult ?? "—"}</p>
                  <p className="text-xs">Result: {titleCase(recorded?.outcome)}</p>
                </li>
              );
            })}
          </ol>
          {failed ? (
            <div
              className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
              data-testid="qep-result-failed-step"
            >
              Failed step {failed.order}: {failed.instruction}
            </div>
          ) : null}
        </div>
      ) : null}
      {tab === "evidence" ? (
        <div
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
          data-testid="qep-result-evidence"
        >
          {(data.testExecution?.evidenceReferences ?? []).map((ref) => (
            <p key={ref.id}>
              {ref.id} {ref.stepOrder ? `· step ${ref.stepOrder}` : ""} · {ref.uri}
            </p>
          ))}
        </div>
      ) : null}
      {tab === "defect" ? <DefectPanel data={data} allowRetest /> : null}
      {tab === "history" ? (
        <ol
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
          data-testid="qep-result-history"
        >
          {(data.history.entries ?? []).map((entry, index) => (
            <li key={`${entry.at}-${index}`}>
              {entry.at} · {entry.action ?? entry.summary} · {entry.actorId}
            </li>
          ))}
        </ol>
      ) : null}
      {tab === "linked" ? (
        <div
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
          data-testid="qep-result-linked"
        >
          {Object.entries(data.linkedRecords).map(([kind, ids]) =>
            ids.length > 0 ? (
              <p key={kind}>
                {titleCase(kind)}: {ids.join(", ")}
              </p>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}

function DefectPanel({
  data,
  allowRetest = false,
}: {
  readonly data: ExecutionInvestigation;
  readonly allowRetest?: boolean;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [confirm, setConfirm] = useState(false);
  const create = useMutation({
    mutationFn: async () => {
      if (!data.testExecution || !confirm) throw new Error("defect.confirm_required");
      return createExecutionDefect({
        testExecutionId: data.testExecution.id,
        title: title || "Execution failure",
      });
    },
    onSuccess: async () => {
      setConfirm(false);
      await queryClient.invalidateQueries({
        queryKey: ["qep-execution-investigation"],
      });
    },
  });
  const retest = useMutation({
    mutationFn: async (defectId: string) =>
      createRetest(data.testExecution!.id, defectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-presented-executions"] });
      await queryClient.invalidateQueries({
        queryKey: ["qep-execution-investigation"],
      });
    },
  });
  const rerun = useMutation({
    mutationFn: async () => createRerun(data.testExecution!.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-presented-executions"] });
      await queryClient.invalidateQueries({
        queryKey: ["qep-execution-investigation"],
      });
    },
  });
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm"
      data-testid="qep-result-defects"
    >
      {(data.defects ?? []).map((item) => (
        <div
          key={item.defect.defectId}
          className="mb-2 border-b border-[var(--color-border)] pb-2"
        >
          <p>
            {item.defect.title} · {titleCase(item.defect.status)}
          </p>
          {allowRetest ? (
            <button
              type="button"
              className="mt-1 h-8 rounded-md border border-[var(--color-border)] px-3 text-xs"
              onClick={() => retest.mutate(item.defect.defectId)}
              data-testid="qep-retest-create"
            >
              Create retest
            </button>
          ) : null}
        </div>
      ))}
      <input
        className="mt-2 h-9 w-full rounded-md border border-[var(--color-border)] px-2 text-xs"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        data-testid="qep-auto-defect-title"
      />
      <label className="mt-2 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(event) => setConfirm(event.target.checked)}
          data-testid="qep-auto-defect-confirm"
        />
        Confirm defect creation
      </label>
      <button
        type="button"
        className="mt-2 h-8 rounded-md border border-[var(--color-border)] px-3 text-xs"
        disabled={!confirm}
        onClick={() => create.mutate()}
        data-testid="qep-auto-defect-create"
      >
        Create / link defect
      </button>
      {allowRetest ? (
        <button
          type="button"
          className="ml-2 mt-2 h-8 rounded-md border border-[var(--color-border)] px-3 text-xs"
          onClick={() => rerun.mutate()}
          data-testid="qep-rerun-create"
        >
          Rerun
        </button>
      ) : null}
    </div>
  );
}

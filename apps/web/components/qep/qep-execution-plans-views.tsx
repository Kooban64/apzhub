"use client";

import type {
  ExecutionPlanLifecycleState,
  ExecutionPlanNode,
} from "@apzhub/qep-execution-plans";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  cloneExecutionPlan,
  createExecutionPlan,
  evaluateExecutionPlanReadiness,
  getExecutionPlan,
  handoffExecutionPlan,
  listExecutionPlans,
  scheduleExecutionPlan,
  transitionExecutionPlan,
  type CreateQepExecutionPlanInput,
  type QepExecutionPlanListParams,
} from "@/lib/qep/qep-execution-plans-api";
import { listSuites } from "@/lib/qep/qep-suites-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_EXECUTION_PLAN_ROUTES,
  isQepExecutionPlansNewRoute,
  parseQepExecutionPlanRouteId,
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

type ViewMode = "list" | "board";

const STATUS_OPTIONS: readonly ExecutionPlanLifecycleState[] = [
  "draft",
  "in_review",
  "approved",
  "ready",
  "scheduled",
  "handed_off",
  "cancelled",
  "archived",
];

const LIFECYCLE_ACTIONS: Readonly<
  Record<
    ExecutionPlanLifecycleState,
    readonly { status: ExecutionPlanLifecycleState; label: string }[]
  >
> = {
  draft: [
    { status: "in_review", label: "Submit for review" },
    { status: "cancelled", label: "Cancel" },
  ],
  in_review: [
    { status: "approved", label: "Approve" },
    { status: "draft", label: "Return to draft" },
    { status: "cancelled", label: "Cancel" },
  ],
  approved: [
    { status: "ready", label: "Mark ready" },
    { status: "in_review", label: "Return to review" },
    { status: "cancelled", label: "Cancel" },
    { status: "archived", label: "Archive" },
  ],
  ready: [
    { status: "scheduled", label: "Mark scheduled" },
    { status: "cancelled", label: "Cancel" },
    { status: "archived", label: "Archive" },
  ],
  scheduled: [
    { status: "ready", label: "Unschedule" },
    { status: "cancelled", label: "Cancel" },
    { status: "archived", label: "Archive" },
  ],
  handed_off: [
    { status: "archived", label: "Archive" },
    { status: "retired", label: "Retire" },
  ],
  cancelled: [
    { status: "archived", label: "Archive" },
    { status: "draft", label: "Restore to draft" },
  ],
  archived: [
    { status: "retired", label: "Retire" },
    { status: "draft", label: "Restore" },
  ],
  retired: [],
};

function formatDate(value?: string): string {
  return value ? value.slice(0, 19).replace("T", " ") : "—";
}

function PlanListView({ items }: { readonly items: readonly ExecutionPlanNode[] }) {
  if (items.length === 0) {
    return <QepEmptyState title="No execution plans match the current filters." />;
  }
  return (
    <QepTable
      caption="Execution plans"
      columns={["Name", "Status", "Readiness", "Suite", "Priority", "Start", "Owner"]}
      rows={items.map((plan) => ({
        id: plan.planId,
        cells: [
          <Link
            key="n"
            href={QEP_EXECUTION_PLAN_ROUTES.detail(plan.planId)}
            className="underline-offset-2 hover:underline"
          >
            {plan.name}
          </Link>,
          <QepStatusBadge key="s" status={plan.status} />,
          <QepStatusBadge key="r" status={plan.readiness.readinessState} />,
          plan.suiteRef.suiteName,
          plan.priority,
          formatDate(plan.schedule.plannedStartAt),
          plan.ownerId,
        ],
      }))}
    />
  );
}

function PlanBoardView({ items }: { readonly items: readonly ExecutionPlanNode[] }) {
  const columns = useMemo(() => {
    const map = new Map<string, ExecutionPlanNode[]>();
    for (const status of STATUS_OPTIONS) map.set(status, []);
    for (const plan of items) {
      const list = map.get(plan.status) ?? [];
      list.push(plan);
      map.set(plan.status, list);
    }
    return map;
  }, [items]);

  return (
    <div
      className="grid gap-3 overflow-x-auto md:grid-cols-3 xl:grid-cols-4"
      data-testid="qep-execution-plan-board"
    >
      {STATUS_OPTIONS.filter((s) => s !== "retired").map((status) => {
        const plans = columns.get(status) ?? [];
        return (
          <section
            key={status}
            className="min-w-[200px] rounded-lg border border-[var(--color-border)] p-3"
          >
            <h3 className="mb-2 flex items-center justify-between text-sm font-semibold capitalize">
              {status.replace(/_/g, " ")}
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {plans.length}
              </span>
            </h3>
            <ul className="space-y-2">
              {plans.map((plan) => (
                <li key={plan.planId}>
                  <Link
                    href={QEP_EXECUTION_PLAN_ROUTES.detail(plan.planId)}
                    className="block rounded-md border border-[var(--color-border)] p-2 text-sm hover:bg-[var(--color-muted)]/30"
                  >
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      {plan.suiteRef.suiteName}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function PlanHomeView() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const params: QepExecutionPlanListParams = {
    ...(status ? { status } : {}),
    ...(query.trim() ? { query: query.trim() } : {}),
    sortBy: "updatedAt",
    sortDirection: "desc",
  };

  const listQuery = useQuery({
    queryKey: qepQueryKeys.executionPlans.list(params),
    queryFn: ({ signal }) => listExecutionPlans(params, { signal }),
  });

  const items = listQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Execution Planning"
      description="Plan when, where, how, and by whom approved suites will be executed. Execution itself is a separate capability."
      breadcrumbs={["QEP", "Execution Planning"]}
      actions={
        <Link
          href={QEP_EXECUTION_PLAN_ROUTES.new}
          className="inline-flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)]"
        >
          New plan
        </Link>
      }
    >
      <QepFilterBar>
        <label className="flex flex-col gap-1 text-xs">
          Search
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, suite, tags…"
            aria-label="Search execution plans"
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
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-1 text-xs">
          View
          <div className="flex gap-1" role="group" aria-label="View mode">
            {(["list", "board"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </QepFilterBar>

      {listQuery.isLoading ? (
        <QepLoadingState label="Loading execution plans…" />
      ) : listQuery.isError ? (
        <QepErrorState
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "Failed to load plans"
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : viewMode === "list" ? (
        <PlanListView items={items} />
      ) : (
        <PlanBoardView items={items} />
      )}
    </QepPageShell>
  );
}

function PlanNewView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [suiteId, setSuiteId] = useState("");
  const [testerIds, setTesterIds] = useState("");
  const [envLabel, setEnvLabel] = useState("QA");
  const [error, setError] = useState<string | null>(null);

  const suitesQuery = useQuery({
    queryKey: qepQueryKeys.suites.list({}),
    queryFn: ({ signal }) => listSuites({}, { signal }),
  });

  const mutation = useMutation({
    mutationFn: (input: CreateQepExecutionPlanInput) => createExecutionPlan(input),
    onSuccess: async (plan) => {
      await queryClient.invalidateQueries({
        queryKey: qepQueryKeys.executionPlans.all(),
      });
      router.push(QEP_EXECUTION_PLAN_ROUTES.detail(plan.planId));
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Create failed");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate({
      name,
      suiteId,
      assignments: {
        testerIds: testerIds
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      environmentReferences: envLabel
        ? [{ referenceId: "env-1", label: envLabel, kind: "environment" }]
        : [],
    });
  }

  return (
    <QepPageShell
      title="Create execution plan"
      description="Bind an approved suite version. This does not start execution."
      breadcrumbs={["QEP", "Execution Planning", "New"]}
      actions={
        <Link
          href={QEP_EXECUTION_PLAN_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Cancel
        </Link>
      }
    >
      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-xl flex-col gap-4"
        data-testid="qep-execution-plan-create-form"
      >
        <label className="flex flex-col gap-1 text-sm">
          Name
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Suite
          <select
            required
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2"
            value={suiteId}
            onChange={(e) => setSuiteId(e.target.value)}
            aria-label="Select suite"
          >
            <option value="">Select suite…</option>
            {(suitesQuery.data?.items ?? []).map((suite) => (
              <option key={suite.suiteId} value={suite.suiteId}>
                {suite.name} (v{suite.version} · {suite.status})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tester IDs (comma-separated)
          <Input
            value={testerIds}
            onChange={(e) => setTesterIds(e.target.value)}
            placeholder="user-a, user-b"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Environment label
          <Input value={envLabel} onChange={(e) => setEnvLabel(e.target.value)} />
        </label>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending || !name || !suiteId}>
          {mutation.isPending ? "Creating…" : "Create plan"}
        </Button>
      </form>
    </QepPageShell>
  );
}

function PlanDetailView({ planId }: { readonly planId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const detailQuery = useQuery({
    queryKey: qepQueryKeys.executionPlans.detail(planId),
    queryFn: ({ signal }) => getExecutionPlan(planId, { signal }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.executionPlans.all(),
    });
  };

  const lifecycleMutation = useMutation({
    mutationFn: (status: ExecutionPlanLifecycleState) =>
      transitionExecutionPlan(planId, status),
    onSuccess: invalidate,
  });

  const readinessMutation = useMutation({
    mutationFn: () => evaluateExecutionPlanReadiness(planId),
    onSuccess: invalidate,
  });

  const scheduleMutation = useMutation({
    mutationFn: () =>
      scheduleExecutionPlan(planId, {
        plannedStartAt: startAt || undefined,
        plannedEndAt: endAt || undefined,
        timezone: "UTC",
        scheduleStatus: "confirmed",
      }),
    onSuccess: invalidate,
  });

  const cloneMutation = useMutation({
    mutationFn: () => cloneExecutionPlan(planId),
    onSuccess: async (plan) => {
      await invalidate();
      router.push(QEP_EXECUTION_PLAN_ROUTES.detail(plan.planId));
    },
  });

  const handoffMutation = useMutation({
    mutationFn: () => handoffExecutionPlan(planId),
    onSuccess: invalidate,
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading execution plan…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : "Plan not found"
        }
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const { plan, history } = detailQuery.data;
  const actions = LIFECYCLE_ACTIONS[plan.status] ?? [];

  return (
    <QepPageShell
      title={plan.name}
      description={`Suite ${plan.suiteRef.suiteName} v${plan.suiteRef.suiteVersion} — planning only`}
      breadcrumbs={["QEP", "Execution Planning", plan.name]}
      actions={
        <>
          <Link
            href={QEP_EXECUTION_PLAN_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Back
          </Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => cloneMutation.mutate()}
            disabled={cloneMutation.isPending}
          >
            Clone
          </Button>
          {plan.status === "scheduled" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => handoffMutation.mutate()}
              disabled={handoffMutation.isPending}
            >
              Handoff to Execution
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <QepPanel title="Plan details">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                <dd>
                  <QepStatusBadge status={plan.status} />
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Readiness</dt>
                <dd>
                  <QepStatusBadge status={plan.readiness.readinessState} />
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Suite</dt>
                <dd>
                  {plan.suiteRef.suiteName} (v{plan.suiteRef.suiteVersion})
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Scope</dt>
                <dd>{plan.scope.mode.replace(/_/g, " ")}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
                <dd>{plan.ownerId}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
                <dd>{plan.priority}</dd>
              </div>
              {plan.handoff ? (
                <div className="sm:col-span-2">
                  <dt className="text-[var(--color-muted-foreground)]">
                    Handoff reference
                  </dt>
                  <dd className="font-mono text-xs">{plan.handoff.handoffId}</dd>
                </div>
              ) : null}
            </dl>
          </QepPanel>

          <QepPanel title="Lifecycle">
            <div className="flex flex-wrap gap-2">
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
            </div>
            {lifecycleMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--color-destructive)]">
                {lifecycleMutation.error instanceof Error
                  ? lifecycleMutation.error.message
                  : "Lifecycle failed"}
              </p>
            ) : null}
          </QepPanel>

          <QepPanel title="Schedule">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-1 text-xs">
                Planned start (ISO)
                <Input
                  value={startAt || plan.schedule.plannedStartAt || ""}
                  onChange={(e) => setStartAt(e.target.value)}
                  placeholder="2026-08-10T09:00:00.000Z"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Planned end (ISO)
                <Input
                  value={endAt || plan.schedule.plannedEndAt || ""}
                  onChange={(e) => setEndAt(e.target.value)}
                  placeholder="2026-08-10T17:00:00.000Z"
                />
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => scheduleMutation.mutate()}
                disabled={scheduleMutation.isPending}
              >
                Save schedule
              </Button>
            </div>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Scheduling is planning metadata — it does not start execution.
            </p>
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
                    {entry.fromStatus && entry.toStatus
                      ? ` (${entry.fromStatus} → ${entry.toStatus})`
                      : null}
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {formatDate(entry.at)} · {entry.actorId}
                  </div>
                </li>
              ))}
            </ol>
          </QepPanel>
        </div>

        <div className="flex flex-col gap-4">
          <QepPanel title="Readiness">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mb-3"
              onClick={() => readinessMutation.mutate()}
              disabled={readinessMutation.isPending}
            >
              Evaluate readiness
            </Button>
            <p className="mb-2 text-sm">
              State: <QepStatusBadge status={plan.readiness.readinessState} />
            </p>
            <ul className="space-y-1 text-xs">
              {plan.readiness.findings.map((f) => (
                <li key={f.code}>
                  <span className="font-medium uppercase">{f.severity}</span>:{" "}
                  {f.message}
                </li>
              ))}
              {plan.readiness.findings.length === 0 ? (
                <li className="text-[var(--color-muted-foreground)]">
                  No findings yet — evaluate to refresh.
                </li>
              ) : null}
            </ul>
          </QepPanel>

          <QepPanel title="Assignments">
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Lead</dt>
                <dd>{plan.assignments.testLeadId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Testers</dt>
                <dd>
                  {plan.assignments.testerIds.length
                    ? plan.assignments.testerIds.join(", ")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Reviewers</dt>
                <dd>
                  {plan.assignments.reviewerIds.length
                    ? plan.assignments.reviewerIds.join(", ")
                    : "—"}
                </dd>
              </div>
            </dl>
          </QepPanel>

          <QepPanel title="Environment / configuration">
            <ul className="space-y-1 text-sm">
              {plan.environmentReferences.map((env) => (
                <li key={env.referenceId}>
                  {env.label}
                  {env.kind ? ` (${env.kind})` : ""}
                </li>
              ))}
              {plan.configurationReferences.map((cfg) => (
                <li key={cfg.referenceId}>
                  {cfg.label}
                  {cfg.value ? `: ${cfg.value}` : ""}
                </li>
              ))}
              {!plan.environmentReferences.length &&
              !plan.configurationReferences.length ? (
                <li className="text-[var(--color-muted-foreground)]">No references</li>
              ) : null}
            </ul>
          </QepPanel>
        </div>
      </div>
    </QepPageShell>
  );
}

export function QepExecutionPlansRouterView({
  pathname,
}: {
  readonly pathname: string;
}) {
  if (isQepExecutionPlansNewRoute(pathname)) {
    return <PlanNewView />;
  }
  const planId = parseQepExecutionPlanRouteId(pathname);
  if (planId) {
    return <PlanDetailView planId={planId} />;
  }
  return <PlanHomeView />;
}

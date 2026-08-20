"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useSessionOpenedId } from "@/lib/qep/use-session-opened-id";
import { parseQepTestPlanRouteId } from "@apzhub/qep-test-plans/presentation";
import {
  listApplicationEnvironments,
  listApplicationExecutionTargets,
} from "@/lib/qep/qep-applications-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { startPlanExecution } from "@/lib/qep/qep-phase4-executions-api";
import {
  addPlanMember,
  addPlanStrategy,
  createTestPlan,
  getTestPlan,
  listPlanExecutions,
  listTestCases,
  listTestPlans,
  listTestSuites,
} from "@/lib/qep/qep-test-management-api";
import { QepErrorState, QepLoadingState } from "./qep-ui";

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function QepPhase3TestPlansView({ pathname }: { readonly pathname: string }) {
  const { selectedId } = useQepApplicationContext();
  const queryClient = useQueryClient();
  const livePath = usePathname() ?? pathname;
  const routePlanId = parseQepTestPlanRouteId(livePath);
  const { openedId: openedPlanId, setOpenedId: setOpenedPlanId } = useSessionOpenedId(
    "apzqep.openedTestPlanId",
  );
  const planId = routePlanId ?? openedPlanId;
  const [tab, setTab] = useState<"overview" | "strategy" | "executions">("overview");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [suiteId, setSuiteId] = useState("");
  const [testCaseId, setTestCaseId] = useState("");
  const [strategyName, setStrategyName] = useState("QA browsers");
  const [capability, setCapability] = useState("browser_automation");
  const [surface, setSurface] = useState("web");
  const [environmentId, setEnvironmentId] = useState("");
  const [targetId, setTargetId] = useState("");

  const listQ = useQuery({
    queryKey: ["qep-test-plans", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listTestPlans(selectedId!),
  });
  const suitesQ = useQuery({
    queryKey: ["qep-test-suites", selectedId],
    enabled: Boolean(selectedId) && Boolean(planId),
    queryFn: () => listTestSuites(selectedId!),
  });
  const casesQ = useQuery({
    queryKey: ["qep-test-cases", selectedId],
    enabled: Boolean(selectedId) && Boolean(planId),
    queryFn: () => listTestCases(selectedId!),
  });
  const detailQ = useQuery({
    queryKey: ["qep-test-plan", planId],
    enabled: Boolean(planId),
    queryFn: () => getTestPlan(planId!),
  });
  const executionsQ = useQuery({
    queryKey: ["qep-test-plan-executions", planId],
    enabled: Boolean(planId) && tab === "executions",
    queryFn: () => listPlanExecutions(planId!),
  });
  const envQ = useQuery({
    queryKey: ["qep-application-environments", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listApplicationEnvironments(selectedId!),
  });
  const targetQ = useQuery({
    queryKey: ["qep-application-targets", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listApplicationExecutionTargets(selectedId!),
  });

  const create = useMutation({
    mutationFn: () =>
      createTestPlan({
        applicationId: selectedId!,
        title,
        objective: objective || title,
      }),
    onSuccess: async () => {
      setTitle("");
      setObjective("");
      await queryClient.invalidateQueries({ queryKey: ["qep-test-plans"] });
    },
  });
  const addMember = useMutation({
    mutationFn: () =>
      addPlanMember(planId!, suiteId ? { suiteId } : { specificationId: testCaseId }),
    onSuccess: async () => {
      setSuiteId("");
      setTestCaseId("");
      await queryClient.invalidateQueries({ queryKey: ["qep-test-plan", planId] });
    },
  });
  const addStrategy = useMutation({
    mutationFn: () =>
      addPlanStrategy(planId!, {
        name: strategyName,
        verificationCapability: capability,
        executionSurface: surface,
        ...(environmentId ? { environmentId } : {}),
        ...(targetId
          ? {
              infrastructureTargetId: targetId,
              infrastructureTargetType: (targetQ.data?.items ?? []).find(
                (item) => item.id === targetId,
              )?.targetType,
            }
          : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-test-plan", planId] });
    },
  });

  const startExecution = useMutation({
    mutationFn: () => startPlanExecution(planId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["qep-test-plan-executions", planId],
      });
      await queryClient.invalidateQueries({ queryKey: ["qep-presented-executions"] });
    },
  });

  const rows = listQ.data ?? [];
  const filtered = useMemo(() => rows, [rows]);

  if (planId) {
    const plan = detailQ.data ?? rows.find((row) => row.id === planId);
    if (!plan) {
      if (detailQ.isError)
        return <QepErrorState message={(detailQ.error as Error).message} />;
      return <QepLoadingState label="Loading plan…" />;
    }
    return (
      <div
        className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
        data-testid="qep-test-plan-detail"
      >
        <div className="text-xs text-[var(--color-muted-foreground)]">
          <button
            type="button"
            data-testid="qep-plan-back"
            onClick={() => setOpenedPlanId(null)}
          >
            Test Plans
          </button>{" "}
          / {plan.number}
        </div>
        <h1 className="text-xl font-semibold">{plan.title}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">{plan.objective}</p>
        <p className="text-xs">
          Progress: {plan.progress.executed}/{plan.progress.planned} executed
          {plan.progress.percent !== undefined ? ` (${plan.progress.percent}%)` : ""} ·
          remaining {plan.progress.remaining}
        </p>
        <div className="flex gap-4" role="tablist">
          {(
            [
              ["overview", "Overview"],
              ["strategy", "Execution Strategy"],
              ["executions", "Executions"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`border-b-2 px-0.5 pb-1.5 text-sm ${
                tab === id
                  ? "border-[var(--color-foreground)] font-medium"
                  : "border-transparent text-[var(--color-muted-foreground)]"
              }`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
          {tab === "overview" ? (
            <div>
              <h2 className="font-medium">Scope</h2>
              <p className="mt-2 text-xs">Suites</p>
              <ul className="text-xs">
                {plan.suiteIds.length === 0 ? (
                  <li>None</li>
                ) : (
                  plan.suiteIds.map((id) => {
                    const suite = (suitesQ.data ?? []).find((item) => item.id === id);
                    return (
                      <li key={id}>{suite ? `${suite.suiteKey} ${suite.name}` : id}</li>
                    );
                  })
                )}
              </ul>
              <p className="mt-2 text-xs">Individual Test Cases</p>
              <ul className="text-xs">
                {plan.specificationIds.length === 0 ? (
                  <li>None</li>
                ) : (
                  plan.specificationIds.map((id) => {
                    const testCase = (casesQ.data ?? []).find((item) => item.id === id);
                    return (
                      <li key={id}>
                        {testCase ? `${testCase.number} ${testCase.title}` : id}
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={suiteId}
                  onChange={(event) => setSuiteId(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                >
                  <option value="">Add suite</option>
                  {(suitesQ.data ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.suiteKey} {item.name}
                    </option>
                  ))}
                </select>
                <select
                  value={testCaseId}
                  onChange={(event) => setTestCaseId(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                >
                  <option value="">Add test case</option>
                  {(casesQ.data ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.number} {item.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-md border border-[var(--color-border)] px-3 text-xs"
                  disabled={(!suiteId && !testCaseId) || addMember.isPending}
                  onClick={() => addMember.mutate()}
                >
                  Add to plan
                </button>
              </div>
            </div>
          ) : null}
          {tab === "strategy" ? (
            <div data-testid="qep-test-plan-strategy">
              {plan.strategy.length === 0 ? (
                <p className="text-xs">No strategy groups yet.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {plan.strategy.map((group) => {
                    const environmentName =
                      group.environmentName ??
                      (envQ.data?.items ?? []).find(
                        (item) => item.id === group.environmentId,
                      )?.name;
                    return (
                      <li
                        key={group.id}
                        className="rounded-md border border-[var(--color-border)] p-3"
                      >
                        <p className="font-medium">{group.name}</p>
                        <p>
                          {titleCase(group.verificationCapability)}
                          {group.executionSurface
                            ? ` → ${titleCase(group.executionSurface)}`
                            : ""}
                          {environmentName ? ` → ${environmentName}` : ""}
                          {group.infrastructureTargetType
                            ? ` → ${titleCase(group.infrastructureTargetType)}`
                            : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-4 grid gap-2 lg:grid-cols-2">
                <input
                  value={strategyName}
                  onChange={(event) => setStrategyName(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                  placeholder="Strategy name"
                />
                <select
                  value={capability}
                  onChange={(event) => setCapability(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                >
                  <option value="browser_automation">Browser Automation</option>
                  <option value="api_verification">API Verification</option>
                  <option value="sast">SAST</option>
                  <option value="dast">DAST</option>
                  <option value="manual_verification">Manual Verification</option>
                </select>
                <select
                  value={surface}
                  onChange={(event) => setSurface(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                >
                  <option value="web">Web</option>
                  <option value="api">API</option>
                  <option value="repository">Repository</option>
                  <option value="manual">Manual</option>
                </select>
                <select
                  value={environmentId}
                  onChange={(event) => setEnvironmentId(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                >
                  <option value="">Environment</option>
                  {(envQ.data?.items ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  value={targetId}
                  onChange={(event) => setTargetId(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                >
                  <option value="">Infrastructure target</option>
                  {(targetQ.data?.items ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.targetType})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="h-9 rounded-md border border-[var(--color-border)] px-3 text-xs"
                  onClick={() => addStrategy.mutate()}
                  disabled={addStrategy.isPending}
                >
                  Add strategy group
                </button>
              </div>
              {addStrategy.isError ? (
                <p className="mt-2 text-xs text-red-600">
                  {(addStrategy.error as Error).message}
                </p>
              ) : null}
            </div>
          ) : null}
          {tab === "executions" ? (
            <div data-testid="qep-test-plan-executions">
              <button
                type="button"
                className="mb-3 h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
                onClick={() => startExecution.mutate()}
                disabled={startExecution.isPending}
                data-testid="qep-plan-start-execution"
              >
                Start execution
              </button>
              {startExecution.isError ? (
                <p className="mb-2 text-xs text-red-600">
                  {(startExecution.error as Error).message}
                </p>
              ) : null}
              {(executionsQ.data ?? []).length === 0 ? (
                <p className="text-xs">No executions yet.</p>
              ) : (
                <table className="min-w-full text-xs">
                  <thead className="text-left text-[10px] uppercase text-[var(--color-muted-foreground)]">
                    <tr>
                      <th className="py-2">When</th>
                      <th>Mode</th>
                      <th>Result</th>
                      <th>Who</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(executionsQ.data ?? []).map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-[var(--color-border)]"
                      >
                        <td className="py-2">{item.executedAt.slice(0, 16)}</td>
                        <td className="capitalize">{titleCase(item.mode)}</td>
                        <td className="capitalize">{titleCase(item.result)}</td>
                        <td>{item.executedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!selectedId) {
    return (
      <div className="p-5 text-sm" data-testid="qep-test-plans">
        Select an application to list test plans.
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-test-plans"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Test Plans</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Plan, organise and execute defined testing activities.
          </p>
        </div>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim()) create.mutate();
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Plan title"
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
          />
          <input
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            placeholder="Objective"
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
          >
            + Add Plan
          </button>
        </form>
      </header>
      <div className="hidden min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        {listQ.isLoading ? (
          <QepLoadingState label="Loading plans…" />
        ) : listQ.isError ? (
          <QepErrorState message={(listQ.error as Error).message} />
        ) : (
          <table className="min-w-full text-xs" data-testid="qep-test-plan-table">
            <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Progress</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8">
                    No test plans in this application.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)]">
                    <td className="px-3 py-2.5 font-medium">
                      <button
                        type="button"
                        className="font-medium"
                        data-testid={`qep-test-plan-open-${row.id}`}
                        onClick={() => setOpenedPlanId(row.id)}
                      >
                        {row.number}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => setOpenedPlanId(row.id)}>
                        {row.title}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 capitalize">{titleCase(row.status)}</td>
                    <td className="px-3 py-2.5">
                      {row.progress.executed}/{row.progress.planned}
                      {row.progress.percent !== undefined
                        ? ` (${row.progress.percent}%)`
                        : ""}
                    </td>
                    <td className="px-3 py-2.5">{row.updatedAt.slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="grid gap-2 lg:hidden">
        {filtered.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setOpenedPlanId(row.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left text-xs"
          >
            <p className="font-medium">
              {row.number} {row.title}
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              {row.progress.executed}/{row.progress.planned} executed
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

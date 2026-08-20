"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { GateConditionKind, GateType } from "@apzhub/qep-assurance/domain";
import { listApplicationEnvironments } from "@/lib/qep/qep-applications-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  createQualityGate,
  evaluateQualityGate,
  listGateEvaluations,
  listQualityGates,
} from "@/lib/qep/qep-assurance-api";
import { QepErrorState, QepLoadingState, QepStatusBadge } from "./qep-ui";

const TABS = ["All Gates", "Active Gates", "Evaluations", "History"] as const;

export function QepPhase6QualityGatesView() {
  const { selectedId, selected } = useQepApplicationContext();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active Gates");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gateType, setGateType] = useState<GateType>("blocking");
  const [conditionKind, setConditionKind] = useState<GateConditionKind>(
    "unresolved_blocking_risks",
  );
  const [environmentId, setEnvironmentId] = useState("");
  const [changeEventId, setChangeEventId] = useState("scm-decision-subject");
  const [mobileView, setMobileView] = useState<"list" | "summary" | "detail">("list");

  const listQ = useQuery({
    queryKey: ["qep-quality-gates", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listQualityGates(selectedId!),
  });
  const evalQ = useQuery({
    queryKey: ["qep-quality-gate-evaluations", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listGateEvaluations(selectedId!),
  });
  const envQ = useQuery({
    queryKey: ["qep-application-environments", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listApplicationEnvironments(selectedId!),
  });

  const create = useMutation({
    mutationFn: () =>
      createQualityGate({
        applicationId: selectedId,
        name,
        description: description || name,
        gateType,
        conditionKind,
        conditionValue: 0,
      }),
    onSuccess: async () => {
      setName("");
      setDescription("");
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ["qep-quality-gates"] });
    },
  });
  const evaluate = useMutation({
    mutationFn: (gateId: string) =>
      evaluateQualityGate(gateId, {
        applicationId: selectedId,
        environmentId,
        changeEventId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["qep-quality-gate-evaluations"],
      });
    },
  });

  const rows = listQ.data ?? [];
  const evaluations = evalQ.data ?? [];
  const latest = useMemo(() => {
    const map = new Map<string, (typeof evaluations)[number]>();
    for (const row of evaluations) {
      const current = map.get(row.gateDefinitionId);
      if (!current || row.evaluatedAt > current.evaluatedAt)
        map.set(row.gateDefinitionId, row);
    }
    return map;
  }, [evaluations]);
  const passed = [...latest.values()].filter((row) => row.result === "passed").length;
  const failed = [...latest.values()].filter((row) => row.result === "failed").length;
  const notEvaluated =
    rows.filter((row) => row.lifecycle === "active").length -
    latest.size +
    [...latest.values()].filter((row) => row.result === "not_evaluated").length;

  if (!selectedId) {
    return <QepLoadingState label="Select an application to view Quality Gates." />;
  }
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 p-5"
      data-testid="qep-quality-gates"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {selected?.name ?? "Application"} / Quality Gates
          </p>
          <h1 className="text-xl font-semibold">Quality Gates</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Explicit inspectable conditions over quality facts. Definition is not
            evaluation. F4 advisory gates are not listed here.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
          data-testid="qep-gate-create"
          onClick={() => setShowCreate((value) => !value)}
        >
          + Create Gate
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-md px-2 py-1 text-xs ${tab === item ? "bg-[var(--color-muted)] font-medium" : "text-[var(--color-muted-foreground)]"}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
        <span className="rounded-md px-2 py-1 text-xs text-[var(--color-muted-foreground)]">
          Gate Sets / Templates not in Phase 6
        </span>
      </div>

      <div className="flex flex-wrap gap-2 md:hidden">
        {(["list", "summary", "detail"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-md border border-[var(--color-border)] px-2 py-1 text-xs ${mobileView === item ? "bg-[var(--color-muted)]" : ""}`}
            onClick={() => setMobileView(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {showCreate ? (
        <form
          className="grid gap-2 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2"
          data-testid="qep-gate-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            data-testid="qep-gate-name"
            placeholder="Gate name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <select
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={gateType}
            onChange={(event) => setGateType(event.target.value as GateType)}
          >
            <option value="blocking">Blocking</option>
            <option value="non_blocking">Non-Blocking</option>
          </select>
          <textarea
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm md:col-span-2"
            placeholder="Inspectable condition description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <select
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={conditionKind}
            onChange={(event) =>
              setConditionKind(event.target.value as GateConditionKind)
            }
          >
            <option value="unresolved_blocking_risks">
              Unresolved blocking risks = 0
            </option>
            <option value="open_critical_defects">Open critical defects = 0</option>
            <option value="open_quality_issues">Open quality issues = 0</option>
            <option value="failed_customer_executions">
              Failed customer executions = 0
            </option>
            <option value="required_evidence_missing">
              Required evidence missing = 0
            </option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
          >
            Save definition
          </button>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          data-testid="qep-gate-environment"
          value={environmentId}
          onChange={(event) => setEnvironmentId(event.target.value)}
        >
          <option value="">Environment</option>
          {(envQ.data?.items ?? []).map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          data-testid="qep-gate-change-event"
          placeholder="SCM change identity"
          value={changeEventId}
          onChange={(event) => setChangeEventId(event.target.value)}
        />
      </div>

      <div
        className={`grid gap-3 md:grid-cols-4 ${mobileView === "summary" ? "" : "hidden md:grid"}`}
        data-testid="qep-gate-summary"
      >
        <Summary
          label="Active Gates"
          value={rows.filter((row) => row.lifecycle === "active").length}
        />
        <Summary label="Passed" value={passed} />
        <Summary label="Failed" value={failed} />
        <Summary label="Not Evaluated" value={Math.max(0, notEvaluated)} />
      </div>

      <div
        className={`overflow-x-auto ${mobileView === "list" || mobileView === "detail" ? "" : "hidden md:block"}`}
      >
        <table className="min-w-full text-left text-sm" data-testid="qep-gate-table">
          <thead>
            <tr className="text-xs uppercase text-[var(--color-muted-foreground)]">
              <th className="py-2 pr-3">Gate ID</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Condition</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Result</th>
              <th className="py-2 pr-3">Last evaluation</th>
              <th className="py-2 pr-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const evaluation = latest.get(row.id);
              return (
                <tr
                  key={row.id}
                  className="border-t border-[var(--color-border)]"
                  data-testid={`qep-gate-row-${row.number}`}
                >
                  <td className="py-2 pr-3 font-medium text-[var(--color-primary)]">
                    {row.number}
                  </td>
                  <td className="py-2 pr-3 font-medium">{row.name}</td>
                  <td className="py-2 pr-3 text-[var(--color-muted-foreground)]">
                    {row.condition.kind} {row.condition.operator} {row.condition.value}
                  </td>
                  <td className="py-2 pr-3">
                    {row.gateType === "blocking" ? "Blocking" : "Non-Blocking"}
                  </td>
                  <td className="py-2 pr-3">
                    <QepStatusBadge status={evaluation?.result ?? "not_evaluated"} />
                  </td>
                  <td className="py-2 pr-3">
                    {evaluation
                      ? new Date(evaluation.evaluatedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs"
                      data-testid={`qep-gate-evaluate-${row.number}`}
                      onClick={() => evaluate.mutate(row.id)}
                    >
                      Evaluate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tab === "Evaluations" || tab === "History" ? (
        <ol className="space-y-2 text-sm" data-testid="qep-gate-history">
          {evaluations.slice(0, 20).map((row) => (
            <li
              key={row.id}
              className="rounded-md border border-[var(--color-border)] p-3"
            >
              <p className="font-medium">
                {row.definitionSnapshot.number} {row.definitionSnapshot.name} ·{" "}
                {row.result}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                v{row.definitionVersion} · {row.environmentSnapshot.name} ·{" "}
                {row.changeEventId} · {row.reason}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

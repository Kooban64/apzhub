"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { parseQepQualityRiskRouteId } from "@apzhub/qep-assurance/presentation";
import type {
  PresentedQualityRisk,
  RiskSeverity,
  RiskStatus,
} from "@apzhub/qep-assurance/domain";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  createQualityRisk,
  listQualityRisks,
  mutateQualityRisk,
} from "@/lib/qep/qep-assurance-api";
import { useSessionOpenedId } from "@/lib/qep/use-session-opened-id";
import { QepErrorState, QepLoadingState, QepStatusBadge } from "./qep-ui";

const TABS = [
  "All Risks",
  "My Risks",
  "By Application",
  "By Status",
  "By Risk Level",
  "By Domain",
  "By Owner",
  "Recent",
] as const;

function levelClass(level: string): string {
  if (level === "critical" || level === "high") return "text-red-600";
  if (level === "medium") return "text-amber-600";
  return "text-emerald-600";
}

export function QepPhase6QualityRiskView({ pathname }: { readonly pathname: string }) {
  const { selectedId, selected } = useQepApplicationContext();
  const queryClient = useQueryClient();
  const routeId = parseQepQualityRiskRouteId(pathname);
  const { openedId, setOpenedId } = useSessionOpenedId("apzqep.openedQualityRiskId");
  const riskId = routeId ?? openedId;
  const [tab, setTab] = useState<(typeof TABS)[number]>("All Risks");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [level, setLevel] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<RiskSeverity>("high");
  const [owner, setOwner] = useState("");
  const [mobileView, setMobileView] = useState<
    "list" | "filters" | "summary" | "detail"
  >("list");

  const listQ = useQuery({
    queryKey: ["qep-quality-risks", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listQualityRisks(selectedId!),
  });

  const create = useMutation({
    mutationFn: () =>
      createQualityRisk({
        applicationId: selectedId,
        title,
        description: description || title,
        severity,
        ...(owner.trim() ? { owner: owner.trim() } : {}),
      }),
    onSuccess: async (row) => {
      setTitle("");
      setDescription("");
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ["qep-quality-risks"] });
      setOpenedId(row.id);
    },
  });
  const mutate = useMutation({
    mutationFn: (action: string) => mutateQualityRisk({ action, riskId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-quality-risks"] });
    },
  });

  const rows = listQ.data ?? [];
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (status && row.status !== status) return false;
      if (level && row.severity !== level) return false;
      if (search) {
        const hay =
          `${row.number} ${row.title} ${row.description} ${row.owner ?? ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, search, status, level]);

  const selectedRisk = rows.find((row) => row.id === riskId);
  const openCount = rows.filter((row) => row.status === "open").length;
  const highCount = rows.filter(
    (row) => row.severity === "high" || row.severity === "critical",
  ).length;
  const mitigated = rows.filter((row) => row.status === "mitigated").length;
  const accepted = rows.filter((row) => row.status === "accepted").length;
  const waived = rows.filter((row) => row.status === "waived").length;

  if (!selectedId) {
    return <QepLoadingState label="Select an application to view Quality Risks." />;
  }
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 p-5"
      data-testid="qep-quality-risk"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {selected?.name ?? "Application"} / Quality Risk
          </p>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            Quality Risk
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Working register of human-created quality risks. Signals are not
            automatically risks.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
          data-testid="qep-risk-create"
          onClick={() => setShowCreate((value) => !value)}
        >
          + Create Risk
        </button>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="qep-risk-tabs">
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
      </div>

      <div className="flex flex-wrap gap-2 md:hidden" data-testid="qep-risk-mobile-nav">
        {(["list", "filters", "summary", "detail"] as const).map((item) => (
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
          data-testid="qep-risk-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            data-testid="qep-risk-title"
            placeholder="Risk title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <select
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as RiskSeverity)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <textarea
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm md:col-span-2"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            placeholder="Owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
          >
            Save risk
          </button>
        </form>
      ) : null}

      <div
        className={`flex flex-wrap gap-2 ${mobileView === "filters" || mobileView === "list" ? "" : "hidden md:flex"}`}
      >
        <input
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          data-testid="qep-risk-search"
          placeholder="Search risks..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Status</option>
          {(["open", "mitigated", "accepted", "waived"] as RiskStatus[]).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option value="">Risk level</option>
          {(["low", "medium", "high", "critical"] as RiskSeverity[]).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`overflow-x-auto ${mobileView === "list" || mobileView === "detail" ? "" : "hidden md:block"}`}
      >
        <table className="min-w-full text-left text-sm" data-testid="qep-risk-table">
          <thead>
            <tr className="text-xs uppercase text-[var(--color-muted-foreground)]">
              <th className="py-2 pr-3">Risk ID</th>
              <th className="py-2 pr-3">Title</th>
              <th className="py-2 pr-3">Description</th>
              <th className="py-2 pr-3">Level</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Owner</th>
              <th className="py-2 pr-3">Trend</th>
              <th className="py-2 pr-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-t border-[var(--color-border)]"
                data-testid={`qep-risk-row-${row.number}`}
                onClick={() => setOpenedId(row.id)}
              >
                <td className="py-2 pr-3 font-medium text-[var(--color-primary)]">
                  {row.number}
                </td>
                <td className="py-2 pr-3 font-medium">{row.title}</td>
                <td className="py-2 pr-3 text-[var(--color-muted-foreground)]">
                  {row.description}
                </td>
                <td className={`py-2 pr-3 ${levelClass(row.severity)}`}>
                  {row.severity}
                </td>
                <td className="py-2 pr-3">
                  <QepStatusBadge status={row.status} />
                </td>
                <td className="py-2 pr-3">{row.owner ?? "—"}</td>
                <td className="py-2 pr-3">{row.trend.replaceAll("_", " ")}</td>
                <td className="py-2 pr-3">
                  {new Date(row.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="py-6 text-sm text-[var(--color-muted-foreground)]">
            No quality risks for this application.
          </p>
        ) : null}
      </div>

      {selectedRisk ? (
        <RiskDetail risk={selectedRisk} onAction={(action) => mutate.mutate(action)} />
      ) : null}

      <div
        className={`grid gap-3 md:grid-cols-6 ${mobileView === "summary" ? "" : "hidden md:grid"}`}
        data-testid="qep-risk-summary"
      >
        <SummaryCard label="Total Risks" value={rows.length} />
        <SummaryCard label="Open" value={openCount} />
        <SummaryCard label="Mitigated" value={mitigated} />
        <SummaryCard label="Accepted" value={accepted} />
        <SummaryCard label="Waived" value={waived} />
        <SummaryCard label="High / Critical" value={highCount} />
      </div>
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
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function RiskDetail({
  risk,
  onAction,
}: {
  readonly risk: PresentedQualityRisk;
  readonly onAction: (action: string) => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] p-4"
      data-testid="qep-risk-detail"
    >
      <h2 className="text-lg font-semibold">
        {risk.number} {risk.title}
      </h2>
      <p className="text-sm text-[var(--color-muted-foreground)]">{risk.description}</p>
      <p className="mt-2 text-sm">
        Level {risk.severity} · Status {risk.status} · Trend{" "}
        {risk.trend.replaceAll("_", " ")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
          data-testid="qep-risk-mitigate"
          onClick={() => onAction("mitigate")}
        >
          Mitigate
        </button>
        <button
          type="button"
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
          data-testid="qep-risk-accept"
          onClick={() => onAction("accept")}
        >
          Accept
        </button>
        <button
          type="button"
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
          data-testid="qep-risk-waive"
          onClick={() => onAction("waive")}
        >
          Waive
        </button>
      </div>
      <ol
        className="mt-3 space-y-1 text-xs text-[var(--color-muted-foreground)]"
        data-testid="qep-risk-history"
      >
        {risk.history.map((entry) => (
          <li key={entry.id}>
            {new Date(entry.createdAt).toLocaleString()} · {entry.action} ·{" "}
            {entry.actorId}
          </li>
        ))}
      </ol>
    </div>
  );
}

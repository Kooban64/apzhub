"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { OperatorGate } from "@/components/operator/operator-gate";
import {
  OperatorMetricStrip,
  OperatorPage,
  OperatorPanel,
} from "@/components/operator/operator-shell";
import { DataTable, DenseLinkList } from "@/components/operator/operator-ui";
import { OPS_NAV } from "@/lib/operator/shell-landing";

async function fetchOps() {
  const res = await fetch("/api/v1/ops/platform");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Ops load failed");
  return body.data as {
    health: Record<string, string>;
    performance: Record<string, string>;
    workers: readonly { id: string; name: string; status: string }[];
    sessions: { note: string; environment: string };
    diagnostics: { correlationReady: boolean; observePath: string };
    tuning: Record<string, string>;
  };
}

function OpsFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <OperatorGate shell="ops">
      <OperatorPage title={title} subtitle={subtitle}>
        {children}
      </OperatorPage>
    </OperatorGate>
  );
}

export function OpsOverviewPage() {
  const q = useQuery({ queryKey: ["ops", "platform"], queryFn: fetchOps });
  return (
    <OpsFrame
      title="Platform Ops"
      subtitle="Monitoring, health, performance — non-breaking day-2 operations."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "Platform", value: q.data?.health.platform ?? "—" },
          { label: "Database", value: q.data?.health.database ?? "—" },
          { label: "Workers", value: String(q.data?.workers.length ?? "—") },
          { label: "Env", value: q.data?.sessions.environment ?? "—" },
        ]}
      />
      <OperatorPanel title="Sections">
        <DenseLinkList
          items={OPS_NAV.filter((n) => n.id !== "overview").map((n) => ({
            href: n.href,
            label: n.label,
          }))}
        />
      </OperatorPanel>
    </OpsFrame>
  );
}

export function OpsHealthPage() {
  const q = useQuery({ queryKey: ["ops", "platform"], queryFn: fetchOps });
  const entries = Object.entries(q.data?.health ?? {});
  return (
    <OpsFrame title="Health" subtitle="Platform → infrastructure health hierarchy.">
      <DataTable
        columns={["Component", "Status"]}
        rows={entries.map(([k, v]) => [k, v])}
      />
      <DenseLinkList
        items={[
          {
            href: "/workspace/observability",
            label: "Deep observability workbench",
            hint: "observe",
          },
        ]}
      />
    </OpsFrame>
  );
}

export function OpsMonitoringPage() {
  return (
    <OpsFrame title="Monitoring" subtitle="Metrics and alert posture.">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Metrics stream through the Observe plane. Use this ops console for at-a-glance
        status; detailed charts remain under Observability.
      </p>
      <DenseLinkList
        items={[
          {
            href: "/workspace/observability",
            label: "Open Observability",
            hint: "metrics",
          },
        ]}
      />
    </OpsFrame>
  );
}

export function OpsPerformancePage() {
  const q = useQuery({ queryKey: ["ops", "platform"], queryFn: fetchOps });
  return (
    <OpsFrame title="Performance" subtitle="Latency and error posture.">
      <OperatorMetricStrip
        metrics={[
          { label: "p95", value: String(q.data?.performance.p95LatencyMs ?? "—") },
          { label: "Errors", value: String(q.data?.performance.errorRate ?? "—") },
          {
            label: "Sessions",
            value: String(q.data?.performance.activeSessions ?? "—"),
          },
          { label: "Workers", value: String(q.data?.workers.length ?? "—") },
        ]}
      />
    </OpsFrame>
  );
}

export function OpsSessionsPage() {
  const q = useQuery({ queryKey: ["ops", "platform"], queryFn: fetchOps });
  return (
    <OpsFrame title="Sessions" subtitle="Login and session diagnostics.">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {q.data?.sessions.note}
      </p>
      <p className="mt-2 font-mono text-xs">env={q.data?.sessions.environment}</p>
    </OpsFrame>
  );
}

export function OpsWorkersPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["ops", "platform"], queryFn: fetchOps });
  const mut = useMutation({
    mutationFn: (input: { workerId: string; status: "running" | "stopped" }) =>
      fetch("/api/v1/ops/platform", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "worker.set", ...input }),
      }).then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
        return body.data;
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ops", "platform"] }),
  });
  return (
    <OpsFrame title="Workers" subtitle="Start / stop background activities safely.">
      <DataTable
        columns={["Worker", "Status", ""]}
        rows={(q.data?.workers ?? []).map((w) => [
          w.name,
          w.status,
          <div key="a" className="flex gap-2">
            <button
              type="button"
              className="text-[11px]"
              onClick={() => mut.mutate({ workerId: w.id, status: "running" })}
            >
              Start
            </button>
            <button
              type="button"
              className="text-[11px] text-[var(--color-destructive)]"
              onClick={() => mut.mutate({ workerId: w.id, status: "stopped" })}
            >
              Stop
            </button>
          </div>,
        ])}
      />
    </OpsFrame>
  );
}

export function OpsDiagnosticsPage() {
  const q = useQuery({ queryKey: ["ops", "platform"], queryFn: fetchOps });
  return (
    <OpsFrame title="Diagnostics" subtitle="Special queries and correlation readiness.">
      <DataTable
        columns={["Check", "Value"]}
        rows={[
          [
            "Correlation IDs",
            q.data?.diagnostics.correlationReady ? "ready" : "missing",
          ],
          ["Observe path", q.data?.diagnostics.observePath ?? "—"],
        ]}
      />
    </OpsFrame>
  );
}

export function OpsTuningPage() {
  const q = useQuery({ queryKey: ["ops", "platform"], queryFn: fetchOps });
  return (
    <OpsFrame
      title="Tuning"
      subtitle="Safe tuning — flags and rate limits, not break-glass."
    >
      <DataTable
        columns={["Area", "Source"]}
        rows={Object.entries(q.data?.tuning ?? {}).map(([k, v]) => [k, v])}
      />
    </OpsFrame>
  );
}

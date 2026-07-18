"use client";

import { useEffect, useState } from "react";

import {
  fetchOperationsSummary,
  fetchSystemHealth,
  fetchSystemLiveness,
  fetchSystemReadiness,
} from "@/lib/platform-operations/ops-api";

import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsStatusBadge,
  OpsTable,
} from "./ops-ui";

export function ResilienceSection() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [readiness, setReadiness] = useState<Record<string, unknown> | null>(null);
  const [liveness, setLiveness] = useState<Record<string, unknown> | null>(null);
  const [consolidated, setConsolidated] = useState<Record<string, unknown> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchSystemHealth(),
      fetchSystemReadiness(),
      fetchSystemLiveness(),
      fetchOperationsSummary(),
    ])
      .then(([healthResult, readinessResult, livenessResult, summary]) => {
        if (!active) return;
        setHealth(healthResult);
        setReadiness(
          (readinessResult as { data?: Record<string, unknown> }).data ??
            readinessResult,
        );
        setLiveness(
          (livenessResult as { data?: Record<string, unknown> }).data ?? livenessResult,
        );
        setConsolidated(summary.consolidatedDiagnostics ?? null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error ? cause.message : "Failed to load resilience data.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <OpsLoadingState />;
  if (error || !health)
    return <OpsErrorState message={error ?? "Resilience data unavailable."} />;

  const dependencies = (health.dependencies ?? []) as Array<{
    name: string;
    status: string;
    latencyMs?: number;
    message?: string;
  }>;
  const securitySummary = consolidated
    ? ((consolidated as Record<string, unknown>).resilience as
        Record<string, unknown> | undefined)
    : undefined;
  const recoveryGuidance = (securitySummary?.recoveryGuidance ?? []) as Array<{
    id: string;
    title: string;
    severity: string;
    description: string;
  }>;

  return (
    <OpsPageShell
      title="Operational Resilience"
      description="System status, dependency health, probes, and recovery guidance."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-sm font-medium">System health</span>
          <OpsStatusBadge status={String(health.status ?? "unknown")} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-sm font-medium">Readiness</span>
          <OpsStatusBadge status={String(readiness?.status ?? "unknown")} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-sm font-medium">Liveness</span>
          <OpsStatusBadge status={String(liveness?.status ?? "unknown")} />
        </div>
      </div>
      <OpsTable
        columns={["Dependency", "Status", "Latency (ms)", "Message"]}
        rows={dependencies.map((dep) => [
          dep.name,
          dep.status,
          dep.latencyMs !== undefined ? String(dep.latencyMs) : "—",
          dep.message ?? "—",
        ])}
      />
      <OpsTable
        columns={["Guidance", "Severity", "Description"]}
        rows={recoveryGuidance.map((item) => [
          item.title,
          item.severity,
          item.description,
        ])}
      />
      <OpsJsonPanel value={{ health, readiness, liveness, consolidated }} />
    </OpsPageShell>
  );
}

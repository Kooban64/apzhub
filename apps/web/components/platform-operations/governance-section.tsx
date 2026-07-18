"use client";

import { useEffect, useState } from "react";

import {
  fetchGovernance,
  fetchGovernanceDiagnostics,
} from "@/lib/platform-operations/ops-api";

import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsTable,
} from "./ops-ui";

export function GovernanceSection() {
  const [governance, setGovernance] = useState<Record<string, unknown> | null>(null);
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchGovernance(), fetchGovernanceDiagnostics()])
      .then(([gov, diag]) => {
        if (!active) return;
        setGovernance(gov);
        setDiagnostics(diag);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Failed to load governance.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <OpsLoadingState />;
  if (error || !governance)
    return <OpsErrorState message={error ?? "Governance unavailable."} />;

  const enablements = (governance.enablements ?? []) as Array<{
    scopeType: string;
    scopeKey: string;
    targetType: string;
    targetKey: string;
    enabled: boolean;
  }>;

  return (
    <OpsPageShell
      title="Governance"
      description="Platform capability enablement — tenants, products, modules, and services."
    >
      <OpsTable
        columns={["Scope", "Key", "Target", "Target Key", "Enabled"]}
        rows={enablements.map((item) => [
          item.scopeType,
          item.scopeKey || "—",
          item.targetType,
          item.targetKey,
          item.enabled ? "yes" : "no",
        ])}
      />
      <OpsJsonPanel value={{ governance, diagnostics }} />
    </OpsPageShell>
  );
}

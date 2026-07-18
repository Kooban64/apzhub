"use client";

import { useEffect, useState } from "react";

import {
  fetchGovernanceDiagnostics,
  fetchProvisioningStatus,
} from "@/lib/platform-operations/ops-api";

import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsStatCard,
  OpsTable,
} from "./ops-ui";

export function ProvisioningSection() {
  const [provisioning, setProvisioning] = useState<Record<string, unknown> | null>(
    null,
  );
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchProvisioningStatus(), fetchGovernanceDiagnostics()])
      .then(([prov, diag]) => {
        if (!active) return;
        setProvisioning(prov);
        setDiagnostics(diag);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error ? cause.message : "Failed to load provisioning.",
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
  if (error || !provisioning) {
    return <OpsErrorState message={error ?? "Provisioning unavailable."} />;
  }

  const history = (provisioning.history ?? []) as Array<{
    provisioningId: string;
    scopeType: string;
    scopeKey: string;
    targetType: string;
    targetKey: string;
    status: string;
    message?: string;
    startedAt: string;
  }>;

  return (
    <OpsPageShell
      title="Provisioning"
      description="Tenant, product, module, and service provisioning status and history."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <OpsStatCard label="Status" value={String(provisioning.status ?? "unknown")} />
        <OpsStatCard label="History entries" value={history.length} />
        <OpsStatCard
          label="Provisioning records"
          value={String(
            (provisioning.diagnostics as { provisioningCount?: number } | undefined)
              ?.provisioningCount ?? 0,
          )}
        />
      </div>
      <OpsTable
        columns={["Scope", "Key", "Target", "Status", "Started"]}
        rows={history.map((item) => [
          `${item.scopeType}:${item.scopeKey}`,
          item.targetKey,
          item.targetType,
          item.status,
          item.startedAt,
        ])}
      />
      <OpsJsonPanel value={{ provisioning, diagnostics }} />
    </OpsPageShell>
  );
}

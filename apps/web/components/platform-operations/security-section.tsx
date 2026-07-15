"use client";

import { useEffect, useState } from "react";

import {
  fetchPlatformSecurity,
  fetchSecurityDiagnostics,
} from "@/lib/platform-operations/ops-api";

import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsStatusBadge,
  OpsTable,
} from "./ops-ui";

export function SecuritySection() {
  const [security, setSecurity] = useState<Record<string, unknown> | null>(null);
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPlatformSecurity(), fetchSecurityDiagnostics()])
      .then(([summary, diag]) => {
        if (!active) return;
        setSecurity(summary);
        setDiagnostics(diag);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Failed to load security.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <OpsLoadingState />;
  if (error || !security) return <OpsErrorState message={error ?? "Security unavailable."} />;

  const securityDiag = (security.security ?? {}) as Record<string, unknown>;
  const environment = (securityDiag.environment ?? {}) as {
    valid?: boolean;
    checks?: Array<{ key: string; status: string; message: string }>;
  };
  const headers = (securityDiag.headers ?? {}) as Record<string, boolean | string>;

  return (
    <OpsPageShell
      title="Security"
      description="Platform security posture — authentication, headers, environment validation, and API guard."
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Overall status</span>
        <OpsStatusBadge status={String(security.status ?? "unknown")} />
      </div>
      <OpsTable
        columns={["Header control", "Enabled"]}
        rows={Object.entries(headers).map(([key, value]) => [key, String(value)])}
      />
      <OpsTable
        columns={["Environment check", "Status", "Message"]}
        rows={(environment.checks ?? []).map((check) => [
          check.key,
          check.status,
          check.message,
        ])}
      />
      <OpsJsonPanel value={{ summary: security, diagnostics }} />
    </OpsPageShell>
  );
}

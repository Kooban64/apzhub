"use client";

import { useEffect, useState } from "react";

import { fetchFeatureFlags } from "@/lib/platform-operations/ops-api";

import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsTable,
} from "./ops-ui";

export function FeatureFlagsSection() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchFeatureFlags()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Failed to load feature flags.",
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
  if (error || !data)
    return <OpsErrorState message={error ?? "Feature flags unavailable."} />;

  const flags = (data.flags ?? []) as Array<{
    flagKey: string;
    name: string;
    defaultEnabled: boolean;
  }>;
  const evaluated = (data.evaluated ?? {}) as Record<string, boolean>;

  return (
    <OpsPageShell
      title="Feature Flags"
      description="Foundation feature flag evaluation — global, tenant, product, module, and user scopes."
    >
      <OpsTable
        columns={["Flag", "Name", "Default", "Evaluated"]}
        rows={flags.map((flag) => [
          flag.flagKey,
          flag.name,
          flag.defaultEnabled ? "on" : "off",
          evaluated[flag.flagKey] ? "on" : "off",
        ])}
      />
      <OpsJsonPanel value={data} />
    </OpsPageShell>
  );
}

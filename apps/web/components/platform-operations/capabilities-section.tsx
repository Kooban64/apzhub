"use client";

import { useEffect, useState } from "react";

import { fetchCapabilities } from "@/lib/platform-operations/ops-api";

import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsTable,
} from "./ops-ui";

export function CapabilitiesSection() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCapabilities()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Failed to load capabilities.",
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
    return <OpsErrorState message={error ?? "Capabilities unavailable."} />;

  const capabilities = (data.capabilities ?? []) as Array<{
    capabilityKey: string;
    capabilityType: string;
    name: string;
    status: string;
    version?: string;
  }>;
  const dependencies = (data.dependencies ?? []) as Array<{
    capabilityId: string;
    dependsOnCapabilityKey: string;
    dependencyType: string;
  }>;

  return (
    <OpsPageShell
      title="Capabilities"
      description="Platform capability registry — metadata, dependencies, and consumed capabilities."
    >
      <OpsTable
        columns={["Key", "Type", "Name", "Version", "Status"]}
        rows={capabilities.map((item) => [
          item.capabilityKey,
          item.capabilityType,
          item.name,
          item.version ?? "—",
          item.status,
        ])}
      />
      <OpsTable
        columns={["Capability", "Depends On", "Type"]}
        rows={dependencies.map((item) => [
          item.capabilityId,
          item.dependsOnCapabilityKey,
          item.dependencyType,
        ])}
      />
      <OpsJsonPanel value={data} />
    </OpsPageShell>
  );
}

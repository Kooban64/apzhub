/**
 * Greenbone VA freshness for BRIDGE assurance summaries.
 * Uses APZPEN provider health only — QEP must not import integration-greenbone.
 */

import { probeApzpenProviderHealth } from "./provider-health";

export type GreenboneFreshness = {
  readonly toolId: "greenbone";
  readonly probedAt: string;
  readonly status: string;
  readonly detail: string;
};

export async function getGreenboneFreshness(input?: {
  readonly greenboneUrl?: string;
}): Promise<GreenboneFreshness> {
  const rows = await probeApzpenProviderHealth({
    greenboneUrl: input?.greenboneUrl,
  });
  const row = rows.find((r) => r.id === "greenbone");
  const probedAt = row?.checkedAt ?? new Date().toISOString();
  return {
    toolId: "greenbone",
    probedAt,
    status: row?.status ?? "unknown",
    detail: row?.detail ?? "Greenbone health probe unavailable",
  };
}

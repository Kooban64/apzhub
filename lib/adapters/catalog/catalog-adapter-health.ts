import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { getCatalogSource } from "@/lib/adapters/env";

export function getCatalogAdapterHealth(): AdapterHealthResult {
  const src = getCatalogSource();
  if (src === "mock") {
    return { domain: "catalog", signal: "healthy", detail: "service-catalog.json overrides (defaults merged)." };
  }
  return { domain: "catalog", signal: "degraded", detail: "Non-mock catalog source not implemented." };
}

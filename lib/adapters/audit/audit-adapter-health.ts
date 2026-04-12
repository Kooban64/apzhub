import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { getAuditSource } from "@/lib/adapters/env";

export function getAuditAdapterHealth(): AdapterHealthResult {
  const src = getAuditSource();
  if (src === "mock") {
    return { domain: "audit", signal: "healthy", detail: "In-memory audit + control-plane cache." };
  }
  return { domain: "audit", signal: "degraded", detail: "Persistent audit store not wired." };
}

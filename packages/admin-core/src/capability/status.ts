/**
 * Capability status helpers (APZADMIN-001).
 * Metadata interpretation only — no live health probes.
 */

import type { AdministrationCapability } from "@apzhub/admin-contracts";

export function isCapabilityProductionReady(
  capability: AdministrationCapability,
): boolean {
  return (
    capability.productionReady === true &&
    capability.enabled &&
    capability.available &&
    capability.healthy &&
    capability.certified
  );
}

export type CapabilityStatusSummary = {
  readonly key: string;
  readonly enabled: boolean;
  readonly available: boolean;
  readonly healthy: boolean;
  readonly certified: boolean;
  readonly productionReady: boolean;
  readonly ready: boolean;
  readonly limitationCount: number;
};

export function summarizeCapabilityStatus(
  capability: AdministrationCapability,
): CapabilityStatusSummary {
  return {
    key: capability.key,
    enabled: capability.enabled,
    available: capability.available,
    healthy: capability.healthy,
    certified: capability.certified,
    productionReady: capability.productionReady,
    ready: isCapabilityProductionReady(capability),
    limitationCount: capability.limitations?.length ?? 0,
  };
}

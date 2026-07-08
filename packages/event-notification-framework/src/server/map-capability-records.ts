import type { EventCapabilityRecord } from "../extraction/types";

/** Minimal capability snapshot for Runtime manifest discovery mapping. */
export interface EventCapabilitySnapshot {
  readonly id: string;
  readonly kind: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
  readonly version?: string;
}

export function mapPlatformCapabilitiesToEventRecords(
  capabilities: readonly EventCapabilitySnapshot[],
): EventCapabilityRecord[] {
  return capabilities.map((capability) => ({
    id: capability.id,
    kind: capability.kind,
    lifecycleState: capability.lifecycleState,
    manifest: capability.manifest,
    version: capability.version,
  }));
}

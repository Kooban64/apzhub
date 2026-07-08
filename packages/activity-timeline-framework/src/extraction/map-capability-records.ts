import type { ActivityCapabilityRecord } from "./types";

/** Minimal capability snapshot for Runtime manifest discovery mapping. */
export interface ActivityCapabilitySnapshot {
  readonly id: string;
  readonly kind: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
  readonly version?: string;
}

export function mapPlatformCapabilitiesToActivityRecords(
  capabilities: readonly ActivityCapabilitySnapshot[],
): ActivityCapabilityRecord[] {
  return capabilities.map((capability) => ({
    id: capability.id,
    kind: capability.kind,
    lifecycleState: capability.lifecycleState,
    manifest: capability.manifest,
    version: capability.version,
  }));
}

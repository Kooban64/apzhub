import type { ActionCapabilityRecord } from "../extraction/types";

/** Minimal platform capability snapshot for action extraction input. */
export interface PlatformCapabilitySnapshot {
  readonly id: string;
  readonly kind: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
  readonly version?: string;
}

export function mapPlatformCapabilitiesToActionRecords(
  capabilities: readonly PlatformCapabilitySnapshot[],
): ActionCapabilityRecord[] {
  return capabilities.map((capability) => ({
    id: capability.id,
    kind: capability.kind,
    lifecycleState: capability.lifecycleState,
    manifest: capability.manifest,
    version: capability.version,
  }));
}

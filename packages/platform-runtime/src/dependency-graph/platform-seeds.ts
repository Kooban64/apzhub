/**
 * Built-in platform capability ids satisfied without filesystem discovery.
 * Expand in Phase 7 scaffold work.
 */
export const PLATFORM_SEED_CAPABILITIES = ["identity", "config", "theme"] as const;

export type PlatformSeedCapabilityId = (typeof PLATFORM_SEED_CAPABILITIES)[number];

const platformSeedSet = new Set<string>(PLATFORM_SEED_CAPABILITIES);

export function isPlatformSeedCapability(id: string): boolean {
  return platformSeedSet.has(id);
}

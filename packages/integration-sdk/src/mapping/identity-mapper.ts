/**
 * Provisional ID helpers — wire format `{prefix}_{integrationSlug}_{native}`.
 * Used by adapters until durable EntityMappingStore bindings are applied.
 */

export function toProvisionalId(
  prefix: string,
  integrationSlug: string,
  nativeId: string | number,
): string {
  return `${prefix}_${integrationSlug}_${nativeId}`;
}

export function extractNativeId(
  canonicalId: string,
  prefix: string,
  integrationSlug: string,
): string {
  const marker = `${prefix}_${integrationSlug}_`;
  if (canonicalId.startsWith(marker)) {
    return canonicalId.slice(marker.length);
  }
  return canonicalId;
}

export function hasProvisionalIdFormat(
  canonicalId: string,
  prefix: string,
  integrationSlug: string,
): boolean {
  return canonicalId.startsWith(`${prefix}_${integrationSlug}_`);
}

export interface IdentityMapper {
  toProvisionalId(prefix: string, nativeId: string | number): string;
  extractNativeId(canonicalId: string, prefix: string): string;
  hasProvisionalFormat(canonicalId: string, prefix: string): boolean;
  readonly integrationSlug: string;
}

export function createIdentityMapper(integrationSlug: string): IdentityMapper {
  return {
    integrationSlug,
    toProvisionalId(prefix, nativeId) {
      return toProvisionalId(prefix, integrationSlug, nativeId);
    },
    extractNativeId(canonicalId, prefix) {
      return extractNativeId(canonicalId, prefix, integrationSlug);
    },
    hasProvisionalFormat(canonicalId, prefix) {
      return hasProvisionalIdFormat(canonicalId, prefix, integrationSlug);
    },
  };
}

/** Singleton-style helpers for well-known integration slugs. */
export const PlaneIdentityMapper = createIdentityMapper("plane");
export const ZammadIdentityMapper = createIdentityMapper("zammad");

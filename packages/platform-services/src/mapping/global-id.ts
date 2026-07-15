import { randomUUID } from "node:crypto";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  ENTITY_TYPE_TO_PREFIX,
  PREFIX_TO_ENTITY_TYPE,
  type CanonicalEntityType,
  type GlobalIdPrefix,
} from "./types";

/**
 * APZHUB global ID format (ADR-0048):
 *   `{prefix}_{32-hex}`
 *
 * Examples: `proj_a1b2c3d4e5f64789a0b1c2d3e4f56789`, `ws_…`
 *
 * Properties:
 * - Stable and opaque to consumers
 * - Encodes canonical entity type via prefix
 * - Independent of all vendor engines (no `*_plane_*`)
 * - Collision-resistant (UUID v4 entropy)
 */
const GLOBAL_ID_PATTERN = /^([a-z]+)_([0-9a-f]{32})$/i;

export interface ParsedGlobalId {
  readonly platformId: string;
  readonly prefix: GlobalIdPrefix;
  readonly entityType: CanonicalEntityType;
  readonly entropy: string;
}

/** Generates a new APZHUB global ID for the given canonical entity type. */
export function generateGlobalId(entityType: CanonicalEntityType): string {
  const prefix = ENTITY_TYPE_TO_PREFIX[entityType];
  const entropy = randomUUID().replace(/-/g, "").toLowerCase();
  return `${prefix}_${entropy}`;
}

/** Returns true when the value matches the APZHUB global ID format and known prefix. */
export function isValidGlobalId(value: string): boolean {
  return parseGlobalId(value) !== null;
}

/**
 * Parses and validates an APZHUB global ID.
 * Returns null when the format or prefix is invalid.
 */
export function parseGlobalId(value: string): ParsedGlobalId | null {
  const match = GLOBAL_ID_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const prefix = match[1]!.toLowerCase() as GlobalIdPrefix;
  const entityType = PREFIX_TO_ENTITY_TYPE[prefix];
  if (!entityType) {
    return null;
  }

  return {
    platformId: `${prefix}_${match[2]!.toLowerCase()}`,
    prefix,
    entityType,
    entropy: match[2]!.toLowerCase(),
  };
}

/**
 * Validates a global ID and optionally asserts the expected entity type.
 * Throws PlatformServiceError with INVALID_GLOBAL_ID on failure.
 */
export function assertGlobalId(
  value: string,
  correlationId: string,
  expectedType?: CanonicalEntityType,
): ParsedGlobalId {
  const parsed = parseGlobalId(value);
  if (!parsed) {
    throw new PlatformServiceError({
      category: "validation",
      code: "INVALID_GLOBAL_ID",
      message: "Invalid APZHUB global entity ID",
      correlationId,
      retryable: false,
      details: { value },
    });
  }

  if (expectedType && parsed.entityType !== expectedType) {
    throw new PlatformServiceError({
      category: "validation",
      code: "MAPPING_TYPE_MISMATCH",
      message: `Expected entity type ${expectedType}, received ${parsed.entityType}`,
      correlationId,
      retryable: false,
      details: { value, expectedType, actualType: parsed.entityType },
    });
  }

  return parsed;
}

/**
 * Extracts a provider-native ID from a provisional adapter ID such as `proj_plane_{native}`.
 * Returns the input unchanged when no provisional marker is present.
 *
 * Migration note: provisional `*_plane_*` IDs are adapter-boundary artefacts only.
 * Platform consumers must never see them after mapping-aware normalisation.
 */
export function extractProvisionalProviderNativeId(
  provisionalOrNativeId: string,
  entityType: CanonicalEntityType,
): string {
  const prefix = ENTITY_TYPE_TO_PREFIX[entityType];
  for (const integration of ["plane", "zammad"] as const) {
    const marker = `${prefix}_${integration}_`;
    if (provisionalOrNativeId.startsWith(marker)) {
      return provisionalOrNativeId.slice(marker.length);
    }
  }
  return provisionalOrNativeId;
}

/** Detects provisional adapter IDs that must not escape the mapping layer. */
export function isProvisionalProviderId(value: string): boolean {
  return /_(?:plane|zammad)_/.test(value);
}

import { createHash, randomUUID } from "node:crypto";

import type { EventIdentitySource } from "./types";

/**
 * Event identity derivation precedence (documented):
 * 1. trusted provider event ID
 * 2. resourceId + action + providerTimestamp
 * 3. deterministic payload fingerprint
 * 4. SDK-generated UUID (NOT suitable for deduplication)
 */

export interface DeriveSourceEventIdInput {
  readonly providerEventId?: string;
  readonly resourceId?: string;
  readonly action?: string;
  readonly providerTimestamp?: string;
  readonly payload?: unknown;
  readonly providerId?: string;
  readonly integrationId?: string;
}

export interface DerivedEventIdentity {
  readonly sourceEventId: string;
  readonly source: EventIdentitySource;
  /** True when identity is stable enough for deduplication (not SDK UUID). */
  readonly deduplicatable: boolean;
}

function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableSerialize(record[k])}`).join(",")}}`;
}

export function fingerprintPayload(payload: unknown): string {
  return createHash("sha256")
    .update(stableSerialize(payload))
    .digest("hex")
    .slice(0, 32);
}

/**
 * Derive a stable sourceEventId using documented precedence.
 * Precedence 4 (SDK UUID) is returned only when nothing else is available —
 * callers must not use it as a deduplication key.
 */
export function deriveSourceEventId(
  input: DeriveSourceEventIdInput,
): DerivedEventIdentity {
  const trusted = input.providerEventId?.trim();
  if (trusted) {
    return {
      sourceEventId: trusted,
      source: "provider_event_id",
      deduplicatable: true,
    };
  }

  const resourceId = input.resourceId?.trim();
  const action = input.action?.trim();
  const timestamp = input.providerTimestamp?.trim();
  if (resourceId && action && timestamp) {
    return {
      sourceEventId: `${resourceId}:${action}:${timestamp}`,
      source: "resource_action_timestamp",
      deduplicatable: true,
    };
  }

  if (input.payload !== undefined) {
    const prefix = [input.providerId, input.integrationId].filter(Boolean).join(":");
    const fp = fingerprintPayload(input.payload);
    return {
      sourceEventId: prefix ? `${prefix}:${fp}` : fp,
      source: "payload_fingerprint",
      deduplicatable: true,
    };
  }

  return {
    sourceEventId: createSdkEventId(),
    source: "sdk_generated",
    deduplicatable: false,
  };
}

/**
 * Deduplication key for an event. Never uses SDK-generated UUIDs alone.
 * Returns undefined when no stable identity is available.
 */
export function deriveDeduplicationKey(
  input: DeriveSourceEventIdInput,
): string | undefined {
  const identity = deriveSourceEventId(input);
  if (!identity.deduplicatable) {
    return undefined;
  }
  const scope = [input.providerId, input.integrationId].filter(Boolean).join(":");
  return scope ? `${scope}:${identity.sourceEventId}` : identity.sourceEventId;
}

/** SDK-owned event id — unique per processing attempt, not for dedup. */
export function createSdkEventId(prefix = "ievt"): string {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

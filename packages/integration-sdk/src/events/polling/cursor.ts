/**
 * Opaque polling cursor kinds — adapters encode provider-specific state.
 */

export const POLLING_CURSOR_KINDS = [
  "opaque",
  "timestamp",
  "offset",
  "page",
  "composite",
  "provider",
] as const;

export type PollingCursorKind = (typeof POLLING_CURSOR_KINDS)[number];

export interface PollingCursor {
  readonly kind: PollingCursorKind;
  readonly value: string;
  readonly resourceCursors?: Readonly<Record<string, string>>;
  readonly resumeToken?: string;
  readonly lastSyncAt?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Legacy SyncCursor shape from platform-service-contracts. */
export interface LegacySyncCursor {
  readonly lastSyncAt?: string;
  readonly resumeToken?: string;
  readonly resourceCursors?: Readonly<Record<string, string>>;
}

export function createOpaqueCursor(value: string): PollingCursor {
  return { kind: "opaque", value };
}

export function createTimestampCursor(isoTimestamp: string): PollingCursor {
  return { kind: "timestamp", value: isoTimestamp, lastSyncAt: isoTimestamp };
}

export function createOffsetCursor(offset: number): PollingCursor {
  return { kind: "offset", value: String(offset) };
}

export function createPageCursor(page: number): PollingCursor {
  return { kind: "page", value: String(page) };
}

export function createCompositeCursor(
  parts: Readonly<Record<string, string>>,
): PollingCursor {
  return {
    kind: "composite",
    value: Buffer.from(JSON.stringify(parts), "utf8").toString("base64url"),
    resourceCursors: parts,
  };
}

export function createProviderCursor(value: string): PollingCursor {
  return { kind: "provider", value };
}

/** Wrap legacy SyncCursor as PollingCursor. */
export function fromSyncCursor(cursor: LegacySyncCursor): PollingCursor {
  if (cursor.resumeToken) {
    return {
      kind: "opaque",
      value: cursor.resumeToken,
      resumeToken: cursor.resumeToken,
      lastSyncAt: cursor.lastSyncAt,
      resourceCursors: cursor.resourceCursors,
    };
  }
  if (cursor.lastSyncAt) {
    return {
      kind: "timestamp",
      value: cursor.lastSyncAt,
      lastSyncAt: cursor.lastSyncAt,
      resourceCursors: cursor.resourceCursors,
    };
  }
  if (cursor.resourceCursors && Object.keys(cursor.resourceCursors).length > 0) {
    return createCompositeCursor(cursor.resourceCursors);
  }
  return { kind: "opaque", value: "", lastSyncAt: cursor.lastSyncAt };
}

/** Convert PollingCursor back to legacy SyncCursor. */
export function toSyncCursor(cursor: PollingCursor): LegacySyncCursor {
  return {
    lastSyncAt:
      cursor.lastSyncAt ?? (cursor.kind === "timestamp" ? cursor.value : undefined),
    resumeToken:
      cursor.resumeToken ??
      (cursor.kind === "opaque" && cursor.value ? cursor.value : undefined),
    resourceCursors: cursor.resourceCursors,
  };
}

export function cursorsEqual(
  a: PollingCursor | undefined,
  b: PollingCursor | undefined,
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.kind === b.kind && a.value === b.value;
}

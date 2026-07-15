import type { IntegrationRequestContext } from "../../types/context";
import {
  fromSyncCursor,
  toSyncCursor,
  type LegacySyncCursor,
  type PollingCursor,
} from "./cursor";
import type {
  PollingMode,
  PollingPageRequest,
  PollingPageResult,
  PollingSource,
  PollingSourceDefinition,
} from "./types";

export type {
  PollingMode,
  PollingPageRequest,
  PollingPageResult,
  PollingSource,
  PollingSourceDefinition,
  PollingExecutionLimits,
  PollingExecutionPolicy,
  PollingRunOptions,
  PollingRunDiagnostics,
} from "./types";

export { POLLING_MODES, isPollingMode } from "./types";

/** Minimal sync service surface used by adapter polling wrappers. */
export interface LegacySyncServiceLike {
  getSyncState(): { readonly cursor: LegacySyncCursor };
  runFullSync(
    context: IntegrationRequestContext,
    options?: {
      readonly since?: string;
      readonly resumeToken?: string;
      readonly maxRecords?: number;
    },
  ): Promise<{
    readonly recordsProcessed: number;
    readonly status: { readonly cursor: LegacySyncCursor };
  }>;
  runIncrementalSync(
    context: IntegrationRequestContext,
    options?: {
      readonly since?: string;
      readonly resumeToken?: string;
      readonly maxRecords?: number;
    },
  ): Promise<{
    readonly recordsProcessed: number;
    readonly status: { readonly cursor: LegacySyncCursor };
  }>;
}

export interface CreatePollingSourceFromSyncOptions {
  readonly definition: PollingSourceDefinition;
  readonly syncService: LegacySyncServiceLike;
}

/**
 * Build a PollingSource that delegates to an existing adapter sync service.
 * One sync run maps to a single exhausted page (adapter sync is batch-oriented).
 */
export function createPollingSourceFromSync(
  options: CreatePollingSourceFromSyncOptions,
): PollingSource {
  const { definition, syncService } = options;

  return {
    definition,
    async poll(
      context: IntegrationRequestContext,
      request: PollingPageRequest,
    ): Promise<PollingPageResult> {
      const mode = normalizeMode(request.mode, definition.supportedModes);
      const syncOptions = {
        since: request.since ?? request.cursor?.lastSyncAt,
        resumeToken: request.cursor?.resumeToken ?? request.cursor?.value,
        maxRecords: request.pageSize,
      };

      const result =
        mode === "incremental"
          ? await syncService.runIncrementalSync(context, syncOptions)
          : await syncService.runFullSync(context, syncOptions);

      const nextCursor = fromSyncCursor(result.status.cursor);

      return {
        records: Array.from({ length: result.recordsProcessed }, (_, i) => ({
          index: i,
        })),
        nextCursor,
        exhausted: true,
        pageToken: nextCursor.value || "complete",
        recordsProcessed: result.recordsProcessed,
        diagnostics: {
          mode,
          delegated: "sync_service",
        },
      };
    },
  };
}

function normalizeMode(
  mode: PollingMode,
  supported: readonly PollingMode[],
): "full" | "incremental" {
  if (mode === "incremental" && supported.includes("incremental")) {
    return "incremental";
  }
  if (mode === "resume" && supported.includes("resume")) {
    return "incremental";
  }
  return "full";
}

export function wrapSyncCursorAsPollingCursor(cursor: LegacySyncCursor): PollingCursor {
  return fromSyncCursor(cursor);
}

export function unwrapPollingCursorAsSyncCursor(
  cursor: PollingCursor,
): LegacySyncCursor {
  return toSyncCursor(cursor);
}

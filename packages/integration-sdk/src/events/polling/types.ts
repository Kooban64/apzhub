import type { IntegrationRequestContext } from "../../types/context";
import type { EventError } from "../errors";
import type { IntegrationSourceEvent } from "../source-event";
import type { PollingCursor } from "./cursor";

export const POLLING_MODES = ["full", "incremental", "resume", "validation"] as const;

export type PollingMode = (typeof POLLING_MODES)[number];

export function isPollingMode(value: string): value is PollingMode {
  return (POLLING_MODES as readonly string[]).includes(value);
}

export interface PollingSourceDefinition {
  readonly id: string;
  readonly integrationId: string;
  readonly providerId: string;
  readonly resourceTypes: readonly string[];
  readonly supportedModes: readonly PollingMode[];
  readonly defaultPageSize?: number;
  readonly maxPageSize?: number;
  readonly description?: string;
}

export interface PollingPageRequest {
  readonly mode: PollingMode;
  readonly cursor?: PollingCursor;
  readonly pageSize?: number;
  readonly since?: string;
  readonly signal?: AbortSignal;
}

export interface PollingPageResult {
  readonly records: readonly unknown[];
  readonly events?: readonly IntegrationSourceEvent[];
  readonly nextCursor?: PollingCursor;
  readonly exhausted: boolean;
  readonly pageToken?: string;
  readonly recordsProcessed: number;
  readonly diagnostics?: Readonly<Record<string, string>>;
}

/**
 * Vendor-neutral polling source contract.
 * Adapters implement this or wrap existing sync services.
 */
export interface PollingSource {
  readonly definition: PollingSourceDefinition;
  poll(
    context: IntegrationRequestContext,
    request: PollingPageRequest,
  ): Promise<PollingPageResult>;
}

export interface PollingExecutionLimits {
  readonly maxPages?: number;
  readonly maxRecords?: number;
  readonly maxDurationMs?: number;
  /** Reject when consecutive identical page tokens exceed this count. Default 2. */
  readonly maxDuplicatePages?: number;
}

export interface PollingExecutionPolicy {
  readonly limits: PollingExecutionLimits;
  /** When true, propose checkpoints but do not auto-commit before ack. Default true. */
  readonly requireCheckpointAck?: boolean;
}

export interface PollingRunOptions {
  readonly mode: PollingMode;
  readonly cursor?: PollingCursor;
  readonly since?: string;
  readonly pageSize?: number;
  readonly signal?: AbortSignal;
  readonly policy?: PollingExecutionPolicy;
  readonly correlationId?: string;
}

export interface PollingRunDiagnostics {
  readonly pagesProcessed: number;
  readonly recordsProcessed: number;
  readonly durationMs: number;
  readonly stalled: boolean;
  readonly cancelled: boolean;
  readonly duplicatePagesDetected: number;
  readonly limitHit?: string;
  readonly error?: EventError;
}

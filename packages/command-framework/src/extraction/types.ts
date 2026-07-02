import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import type { ActionDescriptor } from "../types";

/** Minimal capability record for manifest extraction — avoids Workbench/Runtime coupling. */
export interface ActionCapabilityRecord {
  readonly id: string;
  readonly kind: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
  /** Capability manifest version — stamped on extracted actions (AF-009). */
  readonly version?: string;
}

export interface ActionExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly extractedCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutActions: number;
  readonly capabilityIds: readonly string[];
}

export interface ActionExtractionResult {
  readonly ok: boolean;
  readonly descriptors: readonly ActionDescriptor[];
  readonly diagnostics: ActionExtractionDiagnostics;
  readonly errors: readonly ActionRegistrationIssue[];
}

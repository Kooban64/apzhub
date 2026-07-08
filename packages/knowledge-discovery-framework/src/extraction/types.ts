import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import type { KnowledgeSource } from "../types/knowledge-source";

/** Minimal capability record for manifest extraction — avoids Runtime orchestrator coupling. */
export interface KnowledgeCapabilityRecord {
  readonly id: string;
  readonly kind: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
  readonly version?: string;
}

export interface KnowledgeSourceExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly extractedCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutKnowledge: number;
  readonly capabilityIds: readonly string[];
}

export interface KnowledgeSourceExtractionResult {
  readonly ok: boolean;
  readonly sources: readonly KnowledgeSource[];
  readonly diagnostics: KnowledgeSourceExtractionDiagnostics;
  readonly errors: readonly KnowledgeRegistrationIssue[];
}

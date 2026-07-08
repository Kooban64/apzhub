import type { KnowledgeDocumentKind } from "./knowledge-source";

/** Per-source health classification — registration observability only. */
export type KnowledgeSourceHealthStatus =
  "healthy" | "degraded" | "planned" | "disabled" | "unknown";

export interface KnowledgeSourceEntryDiagnostics {
  readonly message?: string;
  readonly providerRegistered: boolean;
  readonly validationIssueCount: number;
}

/**
 * Registry metadata for a registered knowledge source.
 * The registry records metadata — it does not invoke providers.
 */
export interface KnowledgeSourceMetadata {
  readonly sourceId: string;
  readonly providerRegistered: boolean;
  readonly providerId?: string;
  readonly version?: string;
  readonly declaredCapabilities: readonly KnowledgeDocumentKind[];
  readonly healthStatus: KnowledgeSourceHealthStatus;
  readonly diagnostics: KnowledgeSourceEntryDiagnostics;
}

export interface KnowledgeRegistryMetadata {
  readonly frameworkVersion?: string;
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities?: readonly string[];
  readonly sourceMetadata: readonly KnowledgeSourceMetadata[];
}

/**
 * Adapter-local canonical Workflow Engine metadata.
 * Maps to APZHUB Workflow management concepts without exposing raw n8n internals.
 * Secrets, tokens, and execution payloads are never present.
 */

export type CanonicalSupport =
  | "supported"
  | "partial"
  | "not_supported";

export interface CanonicalWorkflowMetadata {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly tagNames: readonly string[];
  readonly nodeCount: number;
  readonly connectionCount: number;
  readonly versionHint?: string;
  readonly engine: "n8n";
}

export interface CanonicalWorkflowTemplateMetadata {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly tagNames: readonly string[];
  readonly engine: "n8n";
  readonly support: CanonicalSupport;
}

export interface CanonicalCredentialMetadata {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly engine: "n8n";
  /** Metadata only — never includes secrets. */
  readonly secretsIncluded: false;
}

export interface CanonicalVariableMetadata {
  readonly id: string;
  readonly key: string;
  readonly type?: string;
  readonly engine: "n8n";
  readonly valueIncluded: false;
}

export interface CanonicalExecutionMetadata {
  readonly id: string;
  readonly workflowId?: string;
  readonly status?: string;
  readonly mode?: string;
  readonly startedAt?: string;
  readonly stoppedAt?: string;
  readonly finished?: boolean;
  readonly engine: "n8n";
  /** Metadata only — never includes run payloads. */
  readonly payloadIncluded: false;
}

export interface CanonicalTagMetadata {
  readonly id: string;
  readonly name: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly engine: "n8n";
}

export interface CanonicalUserMetadata {
  readonly id: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly role?: string;
  readonly engine: "n8n";
}

export interface CanonicalProjectMetadata {
  readonly id: string;
  readonly name: string;
  readonly type?: string;
  readonly engine: "n8n";
  readonly support: CanonicalSupport;
}

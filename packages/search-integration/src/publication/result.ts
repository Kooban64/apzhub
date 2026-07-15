/**
 * Publication result / preview types (APZSEARCH-009).
 */

import type { SearchMetadata } from "@apzhub/search-contracts";

import type { CanonicalSearchEntity } from "../entity/canonical-search-entity";
import type { SearchEntityLifecycleState } from "../entity/lifecycle";
import type { SearchEntityValidationIssue } from "../validator/search-entity-validator";

export type SearchPublicationOperation =
  | "publish"
  | "update"
  | "remove"
  | "validate"
  | "preview"
  | "diagnostics"
  | "lifecycle"
  | "statistics";

export type SearchPublicationResult = {
  readonly operation: SearchPublicationOperation;
  readonly ok: boolean;
  readonly correlationId: string;
  readonly entityId?: string;
  readonly productId?: string;
  readonly lifecycleState?: SearchEntityLifecycleState;
  readonly entity?: CanonicalSearchEntity;
  readonly previewMetadata?: SearchMetadata;
  readonly issues?: readonly SearchEntityValidationIssue[];
  readonly message?: string;
  readonly durationMs: number;
  readonly acceptedAt: string;
};

export type SearchPublicationPreview = {
  readonly entity: CanonicalSearchEntity;
  readonly metadata: SearchMetadata;
  readonly issues: readonly SearchEntityValidationIssue[];
};

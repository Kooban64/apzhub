import type { SearchDocumentId } from "./identifiers";

export type SearchDocumentKind =
  | "project"
  | "task"
  | "document"
  | "ticket"
  | "user"
  | "workspace"
  | "matter"
  | "other";

export interface SearchDocument {
  readonly id: SearchDocumentId;
  readonly kind: SearchDocumentKind;
  readonly title: string;
  readonly summary?: string;
  readonly url?: string;
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly score?: number;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface SearchSuggestion {
  readonly text: string;
  readonly kind?: SearchDocumentKind;
  readonly documentId?: SearchDocumentId;
}

export type SearchResultStatus = "ok" | "empty" | "partial" | "error";

export interface SearchResult {
  readonly status: SearchResultStatus;
  readonly documents: readonly SearchDocument[];
  readonly suggestions?: readonly SearchSuggestion[];
  readonly message?: string;
  readonly durationMs?: number;
}

import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeDocumentKind } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeNavigationTarget } from "@apzhub/knowledge-discovery-framework";

/** Minimal knowledge result row for presentational overlay rendering. */
export interface KnowledgeOverlayItem {
  readonly documentId: string;
  readonly title: string;
  readonly description?: string;
  readonly icon?: string;
  readonly providerLabel: string;
  readonly kind: KnowledgeDocumentKind;
  readonly document: KnowledgeDocument;
}

/** Grouped overlay section keyed by knowledge source / provider. */
export interface KnowledgeOverlayGroup {
  readonly groupId: string;
  readonly heading: string;
  readonly providerLabel: string;
  readonly kind: KnowledgeDocumentKind;
  readonly items: readonly KnowledgeOverlayItem[];
}

export interface KnowledgeOverlayEmptyState {
  readonly title: string;
  readonly description?: string;
}

export interface KnowledgeOverlayLoadingState {
  readonly message: string;
  readonly description?: string;
}

export interface KnowledgeOverlayErrorState {
  readonly title: string;
  readonly description?: string;
}

export interface KnowledgeOverlayDiagnostics {
  readonly open: boolean;
  readonly queryText: string;
  readonly queryStatus: "idle" | "loading" | "success" | "error";
  readonly groupCount: number;
  readonly visibleDocumentCount: number;
  readonly registryReady: boolean;
  readonly lastSelectedDocumentId?: string;
}

export type KnowledgeSelectionKind = "action" | "navigation" | "unsupported";

export interface KnowledgeNavigationSelection {
  readonly kind: "navigation";
  readonly target: KnowledgeNavigationTarget;
  readonly document: KnowledgeDocument;
}

export interface KnowledgeActionSelection {
  readonly kind: "action";
  readonly actionId: string;
  readonly document: KnowledgeDocument;
}

export type KnowledgeOverlaySelection =
  | KnowledgeActionSelection
  | KnowledgeNavigationSelection
  | { readonly kind: "unsupported"; readonly document: KnowledgeDocument };

import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";

import type {
  KnowledgeActionSelection,
  KnowledgeNavigationSelection,
  KnowledgeOverlaySelection,
  KnowledgeSelectionKind,
} from "./types";

/** Classify a document selection without executing — overlay delegates via DI. */
export function resolveKnowledgeSelectionKind(
  document: KnowledgeDocument,
): KnowledgeSelectionKind {
  if (document.actionRef?.actionId) {
    return "action";
  }

  if (document.navigation?.target) {
    return "navigation";
  }

  return "unsupported";
}

export function resolveKnowledgeOverlaySelection(
  document: KnowledgeDocument,
): KnowledgeOverlaySelection {
  if (document.actionRef?.actionId) {
    return {
      kind: "action",
      actionId: document.actionRef.actionId,
      document,
    } satisfies KnowledgeActionSelection;
  }

  if (document.navigation?.target) {
    return {
      kind: "navigation",
      target: document.navigation,
      document,
    } satisfies KnowledgeNavigationSelection;
  }

  return { kind: "unsupported", document };
}

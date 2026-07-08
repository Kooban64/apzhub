import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeNavigationTarget } from "@apzhub/knowledge-discovery-framework";

import { resolveKnowledgeOverlaySelection } from "./resolve-knowledge-selection";

export interface WorkbenchKnowledgeSelectionHandlers {
  readonly onSelectAction: (
    actionId: string,
    document: KnowledgeDocument,
  ) => void | Promise<void>;
  readonly onSelectNavigation: (
    target: KnowledgeNavigationTarget,
    document: KnowledgeDocument,
  ) => void | Promise<void>;
}

/** Delegate overlay selection to injected handlers — overlay performs no execution. */
export async function delegateKnowledgeOverlaySelection(
  document: KnowledgeDocument,
  handlers: WorkbenchKnowledgeSelectionHandlers,
): Promise<void> {
  const selection = resolveKnowledgeOverlaySelection(document);

  if (selection.kind === "action") {
    await handlers.onSelectAction(selection.actionId, selection.document);
    return;
  }

  if (selection.kind === "navigation") {
    await handlers.onSelectNavigation(selection.target, selection.document);
  }
}

export function createWorkbenchKnowledgeSelectionHandlers(handlers: {
  readonly executeAction: (actionId: string) => void | Promise<void>;
  readonly navigate: (target: KnowledgeNavigationTarget) => void | Promise<void>;
}): WorkbenchKnowledgeSelectionHandlers {
  return {
    onSelectAction: (actionId) => handlers.executeAction(actionId),
    onSelectNavigation: (target) => handlers.navigate(target),
  };
}

export { KnowledgeOverlay } from "./knowledge-overlay";
export type { KnowledgeOverlayProps } from "./knowledge-overlay";

export { KnowledgeOverlayExperience } from "./knowledge-overlay-experience";
export type { KnowledgeOverlayExperienceProps } from "./knowledge-overlay-experience";

export {
  WorkbenchKnowledgeOverlay,
  useWorkbenchKnowledgeSelectionHandlers,
} from "./workbench-knowledge-overlay";
export type { WorkbenchKnowledgeOverlayProps } from "./workbench-knowledge-overlay";

export {
  groupKnowledgeDocuments,
  buildSourceLabelLookup,
  countOverlayDocuments,
  type GroupKnowledgeDocumentsOptions,
} from "./group-knowledge-documents";

export {
  resolveKnowledgeSelectionKind,
  resolveKnowledgeOverlaySelection,
} from "./resolve-knowledge-selection";

export {
  delegateKnowledgeOverlaySelection,
  createWorkbenchKnowledgeSelectionHandlers,
  type WorkbenchKnowledgeSelectionHandlers,
} from "./knowledge-overlay-selection";

export {
  buildKnowledgeOverlayDiagnostics,
  type KnowledgeOverlaySurfaceDiagnostics,
} from "./knowledge-overlay-diagnostics";

export {
  useKnowledgeOverlayState,
  type KnowledgeOverlayState,
  type UseKnowledgeOverlayStateOptions,
  type UseKnowledgeOverlayStateResult,
} from "./use-knowledge-overlay-state";

export { KNOWLEDGE_OVERLAY_SURFACE } from "./workbench-surfaces";

export type {
  KnowledgeOverlayDiagnostics,
  KnowledgeOverlayEmptyState,
  KnowledgeOverlayErrorState,
  KnowledgeOverlayGroup,
  KnowledgeOverlayItem,
  KnowledgeOverlayLoadingState,
  KnowledgeOverlaySelection,
  KnowledgeSelectionKind,
} from "./types";

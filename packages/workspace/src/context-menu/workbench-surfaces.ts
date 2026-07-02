import type { WorkbenchSurfaceDefinition } from "../command-palette/workbench-surfaces";

/** Context Menu — implemented Workbench Surface (AF-016). */
export const CONTEXT_MENU_SURFACE: WorkbenchSurfaceDefinition = Object.freeze({
  id: "context-menu",
  label: "Context Menu",
  status: "implemented",
  consumes: "read-only-action-registry",
  description:
    "Context-sensitive action menu filtered by registry contextWhen predicates. Presentation only.",
});

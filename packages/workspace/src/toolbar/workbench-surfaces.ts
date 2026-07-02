import type { WorkbenchSurfaceDefinition } from "../command-palette/workbench-surfaces";

/** Toolbar — Workbench Surface (AF-017). */
export const TOOLBAR_SURFACE: WorkbenchSurfaceDefinition = Object.freeze({
  id: "toolbar",
  label: "Toolbar",
  status: "implemented",
  consumes: "read-only-action-registry",
  description:
    "Persistent toolbar buttons in shell regions, hydrated from ActionRegistryDto.toolbar.",
});

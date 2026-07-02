/**
 * Workbench Surface — future abstraction for UI regions that present platform capabilities.
 *
 * Phase 4 documents the concept without a large refactor. Presentation Adapters target
 * specific surfaces today; a unified Surface registry may consolidate them in later phases.
 */
export type WorkbenchSurfaceId =
  | "activity-bar"
  | "sidebar"
  | "view"
  | "panel"
  | "dock"
  | "status-bar"
  | "inspector"
  | "breadcrumb"
  | "context-menu";

export interface WorkbenchSurface<
  TSurface extends WorkbenchSurfaceId = WorkbenchSurfaceId,
> {
  readonly surfaceId: TSurface;
}

export const WORKBENCH_SURFACE_IDS = [
  "activity-bar",
  "sidebar",
  "view",
  "panel",
  "dock",
  "status-bar",
  "inspector",
  "breadcrumb",
  "context-menu",
] as const satisfies readonly WorkbenchSurfaceId[];

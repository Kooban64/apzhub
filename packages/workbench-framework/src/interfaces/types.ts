/** Permanent shell regions per Document 016. */
export const SHELL_REGIONS = [
  "header",
  "activityBar",
  "sidebar",
  "workspace",
  "context",
  "statusBar",
] as const;

export type ShellRegionId = (typeof SHELL_REGIONS)[number];

export interface ShellRegionState {
  visible: boolean;
  order: number;
}

export interface LayoutState {
  regions: Record<ShellRegionId, ShellRegionState>;
}

export interface PanelGeometry {
  collapsed: boolean;
  width: number;
}

export interface ContextPanelState extends PanelGeometry {
  activeTabKey?: string;
}

export interface PanelState {
  sidebar: PanelGeometry;
  context: ContextPanelState;
}

/** Navigation levels per Document 017 / ADR-0022. */
export type WorkbenchNavigationLevel =
  "activity-bar" | "sidebar" | "workspace" | "context";

export const NAVIGATION_LEVELS = [
  "activity-bar",
  "sidebar",
  "workspace",
  "context",
] as const satisfies readonly WorkbenchNavigationLevel[];

/** Manifest-derived navigation contribution. */
export interface NavigationContribution {
  readonly id: string;
  readonly capabilityId: string;
  readonly capabilityKind: string;
  readonly level: WorkbenchNavigationLevel;
  readonly workspace: string;
  readonly label: string;
  readonly icon?: string;
  readonly route?: string;
  readonly order: number;
  readonly parent?: string;
  readonly permission?: string;
  readonly hidden: boolean;
  readonly badge?: string;
}

export interface NavigationItem extends NavigationContribution {
  readonly visible: boolean;
  readonly revealed: boolean;
  readonly children: readonly NavigationItem[];
}

export interface NavigationGroup {
  readonly id: string;
  readonly level: WorkbenchNavigationLevel;
  readonly workspace: string;
  readonly order: number;
  readonly items: readonly NavigationItem[];
}

export interface NavigationDiagnostics {
  readonly contributionCount: number;
  readonly visibleCount: number;
  readonly hiddenCount: number;
  readonly permissionFilteredCount: number;
  readonly duplicateIds: readonly string[];
  readonly orphanParents: readonly string[];
  readonly activeWorkspaceId: string;
  readonly groupCount: number;
}

/** Navigation engine state — manifest-driven model. */
export interface NavigationState {
  activeWorkspaceId: string;
  items: readonly NavigationItem[];
  groups: readonly NavigationGroup[];
  tree: readonly NavigationItem[];
}

/** View engine state — manifest-driven view registration and activation. */
export interface ViewDescriptor {
  readonly viewId: string;
  readonly capabilityId: string;
  readonly capabilityKind: string;
  readonly title: string;
  readonly workspace: string;
  readonly route?: string;
  readonly permission?: string;
  readonly default?: boolean;
  readonly icon?: string;
}

export type ViewLifecycleState = "registered" | "active" | "placeholder";

export interface OpenView {
  readonly viewId: string;
  readonly workspace: string;
  readonly title: string;
  readonly route?: string;
  readonly params?: Record<string, unknown>;
  readonly lifecycle: ViewLifecycleState;
}

export interface ViewDiagnostics {
  readonly descriptorCount: number;
  readonly visibleDescriptorCount: number;
  readonly permissionFilteredCount: number;
  readonly duplicateViewIds: readonly string[];
  readonly openViewCount: number;
  readonly focusedViewId?: string;
}

export interface ViewState {
  readonly descriptors: readonly ViewDescriptor[];
  readonly openViews: readonly OpenView[];
  readonly focusedViewId?: string;
}

/** Session engine state and diagnostics. */
export interface SessionDiagnostics {
  readonly schemaVersion: "1.0";
  readonly hydrated: boolean;
  readonly persistenceEnabled: boolean;
  readonly userId?: string;
  readonly lastCapturedAt?: string;
  readonly lastRestoredAt?: string;
  readonly lastPersistedAt?: string;
  readonly restoreStatus:
    "none" | "success" | "partial" | "invalid" | "version_mismatch";
  readonly droppedViewCount: number;
  readonly droppedPermissionCount: number;
  readonly invalidFieldCount: number;
  readonly errors: readonly string[];
  readonly storageBackend: "memory" | "localStorage" | "none";
}

export type SessionEngineState = SessionDiagnostics;

/** Dock engine state — behaviour deferred to Phase 5+. */
export interface DockState {
  splitRatios: Readonly<Record<string, number>>;
}

/** Context engine state — active workbench context (Phase 6). */
export interface ContextEngineState {
  readonly activeWorkspaceId?: string;
  readonly activeViewId?: string;
  readonly activeRoute?: string;
  readonly selectedNavItemId?: string;
  readonly selectedItemId?: string;
  readonly activeKey?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export interface ContextDiagnostics {
  readonly activeWorkspaceId?: string;
  readonly activeViewId?: string;
  readonly activeRoute?: string;
  readonly selectedNavItemId?: string;
  readonly selectedItemId?: string;
  readonly activeKey?: string;
  readonly hasPayload: boolean;
  readonly lastUpdatedAt?: string;
}

export type SelectionMode = "none" | "single" | "multi";

/** Selection engine state — per-view selection with active view slice (Phase 6). */
export interface SelectionState {
  readonly activeViewId?: string;
  readonly mode: SelectionMode;
  readonly items: readonly WorkbenchSelectionItem[];
  readonly byView: Readonly<Record<string, readonly WorkbenchSelectionItem[]>>;
}

export interface WorkbenchSelectionItem {
  readonly id: string;
  readonly kind: string;
  readonly scope?: string;
  readonly permission?: string;
}

export interface SelectionDiagnostics {
  readonly activeViewId?: string;
  readonly mode: SelectionMode;
  readonly itemCount: number;
  readonly viewCount: number;
  readonly droppedInvalidCount: number;
  readonly lastUpdatedAt?: string;
}

export type WorkbenchPermissionAdapterKind =
  "allow-all" | "auth" | "scaffold-deny-by-default" | "unknown";

export interface PermissionDiagnostics {
  readonly adapterKind: WorkbenchPermissionAdapterKind;
  readonly hasContext: boolean;
  readonly userId?: string;
  readonly roleCount: number;
  readonly permissionCount: number;
  readonly deniedRequestCount: number;
  readonly filteredItemCount: number;
}

/** Aggregated workbench state rendered by React shell components. */
export interface WorkbenchState {
  layout: LayoutState;
  panels: PanelState;
  navigation: NavigationState;
  views: ViewState;
  session: SessionEngineState;
  dock: DockState;
  context: ContextEngineState;
  selection: SelectionState;
}

export type WorkbenchStateListener = (state: WorkbenchState) => void;

export type Unsubscribe = () => void;

export type WorkbenchEngineId =
  | "layout"
  | "panel"
  | "view"
  | "navigation"
  | "session"
  | "dock"
  | "context"
  | "selection";

export const WORKBENCH_ENGINE_IDS = [
  "layout",
  "panel",
  "view",
  "navigation",
  "session",
  "dock",
  "context",
  "selection",
] as const satisfies readonly WorkbenchEngineId[];

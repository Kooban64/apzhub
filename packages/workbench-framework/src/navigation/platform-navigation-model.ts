import type {
  NavigationDiagnostics,
  NavigationGroup,
  NavigationItem,
  NavigationState,
} from "../interfaces/types";

export const NAVIGATION_MODEL_SCHEMA_VERSION = "1.0" as const;

/** Stable platform navigation item — UI and adapters consume this, not manifests. */
export interface NavigationModelItem {
  readonly id: string;
  readonly capabilityId: string;
  readonly capabilityKind: string;
  readonly level: NavigationItem["level"];
  readonly workspace: string;
  readonly label: string;
  readonly icon?: string;
  readonly route?: string;
  readonly order: number;
  readonly parent?: string;
  readonly badge?: string;
}

/** Platform Navigation Model produced by the Navigation Engine. */
export interface NavigationModel {
  readonly schemaVersion: typeof NAVIGATION_MODEL_SCHEMA_VERSION;
  readonly activeWorkspaceId: string;
  readonly items: readonly NavigationModelItem[];
  readonly groups: readonly NavigationGroup[];
  readonly tree: readonly NavigationModelItem[];
  readonly activityBar: readonly NavigationModelItem[];
  readonly sidebar: readonly NavigationModelItem[];
  readonly diagnostics: NavigationDiagnostics;
}

export function toNavigationModelItem(item: NavigationItem): NavigationModelItem {
  return {
    id: item.id,
    capabilityId: item.capabilityId,
    capabilityKind: item.capabilityKind,
    level: item.level,
    workspace: item.workspace,
    label: item.label,
    icon: item.icon,
    route: item.route,
    order: item.order,
    parent: item.parent,
    badge: item.badge,
  };
}

export function buildNavigationModel(
  state: NavigationState,
  diagnostics: NavigationDiagnostics,
): NavigationModel {
  const items = state.items.map(toNavigationModelItem);
  const tree = state.tree.map(toNavigationModelItem);
  const activityBar = items.filter((item) => item.level === "activity-bar");
  const sidebar = items.filter(
    (item) => item.level === "sidebar" && item.workspace === state.activeWorkspaceId,
  );

  return {
    schemaVersion: NAVIGATION_MODEL_SCHEMA_VERSION,
    activeWorkspaceId: state.activeWorkspaceId,
    items,
    groups: state.groups,
    tree,
    activityBar,
    sidebar,
    diagnostics,
  };
}

export function assertStableNavigationIds(model: NavigationModel): string[] {
  const ids = model.items.map((item) => item.id);
  return [...new Set(ids)];
}

import type { WidgetInstance } from "./widget";

export type DashboardAudience =
  | "executive"
  | "engineering"
  | "qa"
  | "project"
  | "portfolio"
  | "operations"
  | "release"
  | "compliance"
  | "automation"
  | "repository"
  | "evidence"
  | "quality_intelligence"
  | "personal"
  | "custom";

export type DashboardLifecycleState = "draft" | "published" | "archived";

/**
 * Product-agnostic dashboard definition.
 * Domain content is supplied by the consuming product via widgets + projections.
 */
export interface DashboardDefinition {
  readonly dashboardId: string;
  readonly productId: string;
  readonly name: string;
  readonly description: string;
  readonly audience: DashboardAudience;
  readonly requiredPermissions: readonly string[];
  readonly widgets: readonly WidgetInstance[];
  readonly lifecycle: DashboardLifecycleState;
  readonly defaultForRoles?: readonly string[];
  readonly tags?: readonly string[];
}

export interface DashboardLayout {
  readonly layoutId: string;
  readonly dashboardId: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly name: string;
  readonly columns: 1 | 2 | 3 | 4;
  readonly widgetOrder: readonly string[];
  readonly filters?: Readonly<Record<string, string>>;
  readonly timeRange?: string;
  readonly updatedAt: string;
}

export interface SavedDashboardView {
  readonly viewId: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly dashboardId: string;
  readonly name: string;
  readonly pinned: boolean;
  readonly favourite: boolean;
  readonly layoutId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

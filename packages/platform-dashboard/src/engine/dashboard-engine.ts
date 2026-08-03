import { randomUUID } from "node:crypto";

import type {
  DashboardDefinition,
  DashboardLayout,
  SavedDashboardView,
} from "../contracts/dashboard";
import {
  DASHBOARD_EVENT_TYPES,
  type DashboardEventPublisher,
} from "../contracts/events";
import type { WidgetDescriptor } from "../contracts/widget";
import type { DashboardRegistry } from "../registry/dashboard-registry";
import type { WidgetRegistry } from "../registry/widget-registry";
import { InMemoryLayoutStore } from "../store/layout-store";
import {
  filterWidgetsByPermissions,
  orderWidgets,
  resolveColumns,
  type ResponsiveBreakpoint,
} from "./layout-engine";

export interface DashboardEngineOptions {
  readonly dashboards: DashboardRegistry;
  readonly widgets: WidgetRegistry;
  readonly store?: InMemoryLayoutStore;
  readonly publishEvent?: DashboardEventPublisher;
}

export interface ResolvedDashboard {
  readonly dashboard: DashboardDefinition;
  readonly widgets: readonly {
    readonly instance: DashboardDefinition["widgets"][number];
    readonly descriptor: WidgetDescriptor;
  }[];
  readonly columns: 1 | 2 | 3 | 4;
}

export class DashboardEngine {
  private readonly dashboards: DashboardRegistry;
  private readonly widgets: WidgetRegistry;
  private readonly store: InMemoryLayoutStore;
  private readonly publishEvent: DashboardEventPublisher;

  constructor(options: DashboardEngineOptions) {
    this.dashboards = options.dashboards;
    this.widgets = options.widgets;
    this.store = options.store ?? new InMemoryLayoutStore();
    this.publishEvent = options.publishEvent ?? (async () => undefined);
  }

  listDashboards(productId?: string) {
    return this.dashboards.list(productId);
  }

  listWidgets() {
    return this.widgets.list();
  }

  getDashboard(dashboardId: string) {
    return this.dashboards.get(dashboardId);
  }

  selectForRoles(roles: readonly string[]) {
    return this.dashboards.selectForRoles(roles);
  }

  resolveDashboard(input: {
    readonly dashboardId: string;
    readonly userPermissions: readonly string[];
    readonly breakpoint?: ResponsiveBreakpoint;
    readonly widgetOrder?: readonly string[];
  }): ResolvedDashboard {
    const dashboard = this.dashboards.require(input.dashboardId);
    const allowed = new Set(
      this.widgets
        .list()
        .filter((w) =>
          w.requiredPermissions.every((p) => input.userPermissions.includes(p)),
        )
        .map((w) => w.widgetId),
    );
    const ordered = orderWidgets(dashboard, input.widgetOrder);
    const visible = filterWidgetsByPermissions(ordered, allowed);
    const columns = resolveColumns(input.breakpoint ?? "desktop", 3);

    return {
      dashboard,
      columns,
      widgets: visible.map((instance) => ({
        instance,
        descriptor: this.widgets.require(instance.widgetId),
      })),
    };
  }

  async saveLayout(input: {
    readonly tenantId: string;
    readonly userId: string;
    readonly dashboardId: string;
    readonly name: string;
    readonly columns: 1 | 2 | 3 | 4;
    readonly widgetOrder: readonly string[];
    readonly filters?: Readonly<Record<string, string>>;
    readonly timeRange?: string;
    readonly correlationId: string;
  }): Promise<DashboardLayout> {
    this.dashboards.require(input.dashboardId);
    const now = new Date().toISOString();
    const layout: DashboardLayout = {
      layoutId: randomUUID(),
      dashboardId: input.dashboardId,
      tenantId: input.tenantId,
      userId: input.userId,
      name: input.name,
      columns: input.columns,
      widgetOrder: [...input.widgetOrder],
      filters: input.filters,
      timeRange: input.timeRange,
      updatedAt: now,
    };
    this.store.saveLayout(layout);
    await this.publishEvent({
      type: DASHBOARD_EVENT_TYPES.layoutSaved,
      occurredAt: now,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
      dashboardId: input.dashboardId,
      payload: { layoutId: layout.layoutId, name: layout.name },
    });
    return layout;
  }

  listLayouts(tenantId: string, userId?: string) {
    return this.store.listLayouts(tenantId, userId);
  }

  async saveView(input: {
    readonly tenantId: string;
    readonly userId: string;
    readonly dashboardId: string;
    readonly name: string;
    readonly pinned?: boolean;
    readonly favourite?: boolean;
    readonly layoutId?: string;
    readonly correlationId: string;
  }): Promise<SavedDashboardView> {
    this.dashboards.require(input.dashboardId);
    const now = new Date().toISOString();
    const view: SavedDashboardView = {
      viewId: randomUUID(),
      tenantId: input.tenantId,
      userId: input.userId,
      dashboardId: input.dashboardId,
      name: input.name,
      pinned: input.pinned ?? false,
      favourite: input.favourite ?? false,
      layoutId: input.layoutId,
      createdAt: now,
      updatedAt: now,
    };
    this.store.saveView(view);
    if (view.pinned) {
      await this.publishEvent({
        type: DASHBOARD_EVENT_TYPES.viewPinned,
        occurredAt: now,
        tenantId: input.tenantId,
        correlationId: input.correlationId,
        dashboardId: input.dashboardId,
        payload: { viewId: view.viewId },
      });
    }
    if (view.favourite) {
      await this.publishEvent({
        type: DASHBOARD_EVENT_TYPES.viewFavourited,
        occurredAt: now,
        tenantId: input.tenantId,
        correlationId: input.correlationId,
        dashboardId: input.dashboardId,
        payload: { viewId: view.viewId },
      });
    }
    return view;
  }

  listViews(tenantId: string, userId?: string) {
    return this.store.listViews(tenantId, userId);
  }

  listPinned(tenantId: string, userId: string) {
    return this.store.listPinned(tenantId, userId);
  }

  listFavourites(tenantId: string, userId: string) {
    return this.store.listFavourites(tenantId, userId);
  }

  async updateViewFlags(input: {
    readonly viewId: string;
    readonly pinned?: boolean;
    readonly favourite?: boolean;
    readonly correlationId: string;
  }): Promise<SavedDashboardView> {
    const current = this.store.getView(input.viewId);
    if (!current) {
      throw new Error(`View not found: ${input.viewId}`);
    }
    const now = new Date().toISOString();
    const updated: SavedDashboardView = {
      ...current,
      pinned: input.pinned ?? current.pinned,
      favourite: input.favourite ?? current.favourite,
      updatedAt: now,
    };
    this.store.saveView(updated);
    return updated;
  }
}

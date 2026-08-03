import {
  createPlatformDashboard,
  type DashboardDefinition,
  type PlatformDashboard,
  type ResolvedDashboard,
  type SavedDashboardView,
  type WidgetDescriptor,
} from "@apzhub/platform-dashboard";
import {
  createPlatformVisualization,
  type PlatformVisualization,
} from "@apzhub/platform-visualization";

import {
  createQepDashboardDefinitions,
  createQepWidgetDescriptors,
} from "./catalogue/persona-dashboards";
import {
  resolveProjection,
  type ProjectionPayload,
} from "./projections/projection-store";

export interface QepDashboardsPorts {
  readonly resolveProjection?: (queryId: string) => ProjectionPayload;
}

export interface QepDashboardsFacade {
  readonly platform: PlatformDashboard;
  readonly visualization: PlatformVisualization;
  listDashboards(): readonly DashboardDefinition[];
  listWidgets(): readonly WidgetDescriptor[];
  listVisualizationKinds(): ReturnType<PlatformVisualization["registry"]["list"]>;
  getDashboard(dashboardId: string): DashboardDefinition | undefined;
  selectForRoles(roles: readonly string[]): readonly DashboardDefinition[];
  resolveDashboard(input: {
    readonly dashboardId: string;
    readonly userPermissions: readonly string[];
    readonly breakpoint?: "mobile" | "tablet" | "desktop";
  }): ResolvedDashboard;
  getProjection(queryId: string): ProjectionPayload;
  resolveWidgetProjections(
    dashboardId: string,
    userPermissions: readonly string[],
  ): {
    readonly dashboard: ResolvedDashboard;
    readonly projections: Readonly<Record<string, ProjectionPayload>>;
  };
  saveLayout(
    input: Parameters<PlatformDashboard["engine"]["saveLayout"]>[0],
  ): ReturnType<PlatformDashboard["engine"]["saveLayout"]>;
  saveView(
    input: Parameters<PlatformDashboard["engine"]["saveView"]>[0],
  ): ReturnType<PlatformDashboard["engine"]["saveView"]>;
  listViews(tenantId: string, userId?: string): readonly SavedDashboardView[];
  listPinned(tenantId: string, userId: string): readonly SavedDashboardView[];
}

export function createQepDashboards(
  ports: QepDashboardsPorts = {},
): QepDashboardsFacade {
  const platform = createPlatformDashboard();
  const visualization = createPlatformVisualization();

  for (const descriptor of createQepWidgetDescriptors()) {
    platform.widgets.register(descriptor);
  }
  for (const definition of createQepDashboardDefinitions()) {
    platform.dashboards.register(definition);
  }

  const projectionFn = ports.resolveProjection ?? resolveProjection;

  return {
    platform,
    visualization,
    listDashboards: () => platform.engine.listDashboards("apzqep"),
    listWidgets: () => platform.engine.listWidgets(),
    listVisualizationKinds: () => visualization.registry.list(),
    getDashboard: (id) => platform.engine.getDashboard(id),
    selectForRoles: (roles) => platform.engine.selectForRoles(roles),
    resolveDashboard: (input) => platform.engine.resolveDashboard(input),
    getProjection: (queryId) => projectionFn(queryId),
    resolveWidgetProjections: (dashboardId, userPermissions) => {
      const dashboard = platform.engine.resolveDashboard({
        dashboardId,
        userPermissions,
      });
      const projections: Record<string, ProjectionPayload> = {};
      for (const { descriptor } of dashboard.widgets) {
        if (descriptor.projectionQueryId) {
          projections[descriptor.projectionQueryId] = projectionFn(
            descriptor.projectionQueryId,
          );
        }
      }
      return { dashboard, projections };
    },
    saveLayout: (input) => platform.engine.saveLayout(input),
    saveView: (input) => platform.engine.saveView(input),
    listViews: (tenantId, userId) => platform.engine.listViews(tenantId, userId),
    listPinned: (tenantId, userId) => platform.engine.listPinned(tenantId, userId),
  };
}

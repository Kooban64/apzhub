export { PLATFORM_DASHBOARD_VERSION, PLATFORM_DASHBOARD_PROGRAMME } from "./version";
export * from "./contracts/index";
export { WidgetRegistry } from "./registry/widget-registry";
export { DashboardRegistry } from "./registry/dashboard-registry";
export { InMemoryLayoutStore, type LayoutStore } from "./store/layout-store";
export {
  resolveColumns,
  orderWidgets,
  filterWidgetsByPermissions,
} from "./engine/layout-engine";
export {
  DashboardEngine,
  type DashboardEngineOptions,
  type ResolvedDashboard,
} from "./engine/dashboard-engine";
export { createBuiltinWidgetDescriptors } from "./widgets/builtin-widgets";
export {
  createPlatformDashboard,
  type CreatePlatformDashboardOptions,
  type PlatformDashboard,
} from "./sdk/create-dashboard";

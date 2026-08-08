export { QEP_DASHBOARDS_VERSION, QEP_DASHBOARDS_PROGRAMME } from "./version";
export {
  createQepDashboards,
  type QepDashboardsFacade,
  type QepDashboardsPorts,
} from "./compose";
export {
  createDashboardPersistence,
  type DashboardPersistenceMode,
} from "./infrastructure/persistence";
export {
  createPostgresLayoutStore,
  deleteDashboardDataForTenant,
} from "./infrastructure/postgres-layout-store";
export {
  createQepDashboardDefinitions,
  createQepWidgetDescriptors,
} from "./catalogue/persona-dashboards";
export {
  resolveProjection,
  type ProjectionPayload,
} from "./projections/projection-store";

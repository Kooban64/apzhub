export { QEP_DASHBOARDS_VERSION, QEP_DASHBOARDS_PROGRAMME } from "./version";
export {
  createQepDashboards,
  type QepDashboardsFacade,
  type QepDashboardsPorts,
} from "./compose";
export {
  createQepDashboardDefinitions,
  createQepWidgetDescriptors,
} from "./catalogue/persona-dashboards";
export {
  resolveProjection,
  type ProjectionPayload,
} from "./projections/projection-store";

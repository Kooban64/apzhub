export { QEP_SUITES_VERSION, QEP_SUITE_EVENT_VERSION } from "./version";

export * from "./domain/index";
export * from "./application/index";
export {
  createEnterpriseTestSuiteManagement,
  type EnterpriseTestSuiteManagement,
} from "./compose";
export {
  SUITE_PROJECTION_EVENT_TYPES,
  SUITE_NOTIFICATION_TEMPLATES,
  SUITE_COMMAND_DEFINITIONS,
  createSuiteCommandHandlers,
  createSuiteKnowledgeProcessors,
  createSuiteNotificationProcessors,
  registerSuiteProcessorsOnto,
} from "./application/platform-integration";
export {
  QEP_SUITES_BASE_PATH,
  QEP_SUITE_ROUTES,
  isQepSuitesRoute,
  isQepSuitesNewRoute,
  parseQepSuiteRouteId,
} from "./presentation/index";

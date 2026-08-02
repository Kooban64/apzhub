export { QEP_REPORTING_VERSION, QEP_REPORTING_EVENT_VERSION } from "./version";

export * from "./domain/index";
export * from "./application/index";
export {
  createEnterpriseReportingAnalytics,
  type EnterpriseReportingAnalytics,
} from "./compose";
export {
  REPORTING_PROJECTION_EVENT_TYPES,
  REPORTING_NOTIFICATION_TEMPLATES,
  REPORTING_COMMAND_DEFINITIONS,
  createReportingCommandHandlers,
  createReportingKnowledgeProcessors,
  createReportingNotificationProcessors,
  registerReportingProcessorsOnto,
} from "./application/platform-integration";
export {
  QEP_ENTERPRISE_REPORTING_BASE_PATH,
  QEP_ENTERPRISE_REPORTING_ROUTES,
  isQepEnterpriseReportingRoute,
  parseQepReportingDashboardId,
  parseQepReportingReportId,
  parseQepReportingTemplateId,
  isQepEnterpriseReportingMetricsRoute,
} from "./presentation/index";

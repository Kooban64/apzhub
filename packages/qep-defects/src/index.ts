export { QEP_DEFECTS_VERSION, QEP_DEFECT_EVENT_VERSION } from "./version";

export * from "./domain/index";
export * from "./application/index";
export {
  createEnterpriseDefectManagement,
  type EnterpriseDefectManagement,
} from "./compose";
export {
  DEFECT_PROJECTION_EVENT_TYPES,
  DEFECT_NOTIFICATION_TEMPLATES,
  DEFECT_COMMAND_DEFINITIONS,
  createDefectCommandHandlers,
  createDefectKnowledgeProcessors,
  createDefectNotificationProcessors,
  registerDefectProcessorsOnto,
} from "./application/platform-integration";
export {
  QEP_DEFECTS_BASE_PATH,
  QEP_DEFECT_ROUTES,
  isQepDefectsRoute,
  isQepDefectsNewRoute,
  parseQepDefectRouteId,
} from "./presentation/index";

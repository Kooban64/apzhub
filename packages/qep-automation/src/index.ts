export { QEP_AUTOMATION_VERSION, QEP_AUTOMATION_PROGRAMME } from "./version";
export {
  createQepAutomation,
  type QepAutomationFacade,
  type QepAutomationPorts,
} from "./compose";
export {
  createAutomationPersistence,
  type AutomationPersistenceMode,
} from "./infrastructure/persistence";
export {
  createPostgresExecutionStore,
  deleteAutomationExecutionsForTenant,
} from "./infrastructure/postgres-execution-store";
export * from "./presentation/index";

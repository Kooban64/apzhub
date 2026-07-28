export {
  createAutomationFoundation,
  type AutomationFoundation,
  type CreateAutomationFoundationOptions,
} from "./automation-foundation";
export { wireEventAutomation } from "./wire-event-automation";
export {
  registerDefaultSupportAutomationRegistrations,
  registerWorkflowTriggerAsAutomation,
} from "./default-registrations";
export {
  AUTOMATION_JOURNAL_HANDLER_ID,
  createAutomationHandlerRegistry,
  createAutomationJournalHandler,
  type AutomationHandlerRegistry,
} from "./automation-handler-registry";
export {
  createInMemoryAutomationRegistrationStore,
  resetAutomationRegistrationSeq,
  type AutomationRegistrationStore,
} from "./automation-registration-store";
export {
  createInMemoryAutomationExecutionJournal,
  nextAutomationExecutionId,
  resetAutomationExecutionSeq,
  type AutomationExecutionJournal,
} from "./automation-execution-journal";
export {
  createPostgresAutomationExecutionJournal,
  createProductionAutomationExecutionJournal,
} from "./automation-execution-journal-postgres";
export { matchesEventPattern } from "./match-event-pattern";
export type {
  AutomationActionKind,
  AutomationEventBus,
  AutomationExecutionRecord,
  AutomationExecutionStatus,
  AutomationHandler,
  AutomationHandlerContext,
  AutomationHandlerResult,
  AutomationRegistration,
  RegisterAutomationInput,
  WorkflowEventTriggerBindingView,
  WorkflowEventTriggerSource,
} from "./types";

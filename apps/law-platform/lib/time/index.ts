export type { BillingStatus, TimeEntry, TimeSearchCriteria } from "./time-entry-types";
export {
  BILLING_STATUSES,
  formatDurationMinutes,
  formatDecimalHours,
  timeEntryToFormValues,
  createEmptyTimeEntryFormValues,
  parseDurationMinutesInput,
  computeDurationFromTimes,
  resolveFormDurationMinutes,
  type ManagedTimeEntry,
  type TimeEntryFormValues,
  type TimeEntryListCriteria,
  type TimeEntryDateFilter,
  type TimeEntryBillableFilter,
} from "./time-entry-types";
export type { TimeRepository } from "./time-entry-repository";
export type { WritableTimeEntryRepository } from "./writable-time-entry-repository";
export {
  InMemoryTimeEntryRepository,
  getSharedTimeEntryRepository,
  resetSharedTimeEntryRepository,
} from "./in-memory-time-entry-repository";
export { SEED_TIME_ENTRIES } from "./seed-time-entries";
export {
  SEED_TIME_ATTORNEYS,
  getAttorneyDisplayName,
  getAttorneyDefaultRate,
} from "./seed-attorneys";
export {
  validateTimeEntryForm,
  parseBillableInput,
  type TimeEntryValidationResult,
} from "./time-entry-validation";
export {
  TIME_ENTRY_MODULE_BASE_ROUTE,
  timeEntryCreateRoute,
  timeEntryDetailRoute,
  timeEntryEditRoute,
  timeEntryListRoute,
  isTimeEntryModuleRoute,
  parseTimeEntryRoute,
  type TimeEntryRoute,
} from "./time-entry-routes";
export {
  registerTimeEntryNavigationHandler,
  unregisterTimeEntryNavigationHandler,
  navigateToTimeEntryRoute,
} from "./time-entry-navigation";
export {
  TimeEntryWorkflowService,
  type TimeEntryWorkflowResult,
} from "./time-entry-workflow-service";
export {
  TimeEntryWorkflowProvider,
  useTimeEntryWorkflow,
  useOptionalTimeEntryWorkflow,
} from "./time-entry-workflow-context";
export {
  TimeEntryWorkflowDiagnostics,
  getTimeEntryWorkflowDiagnostics,
  resetTimeEntryWorkflowDiagnostics,
  type TimeEntryWorkflowRunRecord,
} from "./time-entry-workflow-diagnostics";
export {
  getMatterTitleForTimeEntry,
  getTaskTitleForTimeEntry,
  getDocumentTitleForTimeEntry,
  getAttorneyLabel,
  formatTimeEntryDate,
  formatTimeEntryDateTime,
  formatTimeEntryDuration,
  formatTimeEntryRate,
  formatTimeEntryAmount,
  resolveAttorneyRate,
} from "./time-entry-lookups";

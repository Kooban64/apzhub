/** Server-safe Law Platform exports for apps/web API routes (LAW-014-04+). */

export {
  ClientWorkflowService,
  type ClientWorkflowResult,
} from "../clients/client-workflow-service";
export {
  clientToFormValues,
  createEmptyClientFormValues,
  type ClientFormValues,
} from "../clients/client-types";
export {
  MatterWorkflowService,
  type MatterWorkflowResult,
} from "../matters/matter-workflow-service";
export {
  matterToFormValues,
  createEmptyMatterFormValues,
  type MatterFormValues,
  type MatterListCriteria,
} from "../matters/matter-types";
export {
  DocumentWorkflowService,
  type DocumentWorkflowResult,
} from "../documents/document-workflow-service";
export {
  documentToFormValues,
  createEmptyDocumentFormValues,
  type DocumentFormValues,
  type DocumentListCriteria,
} from "../documents/document-types";
export {
  TaskWorkflowService,
  type TaskWorkflowResult,
} from "../tasks/task-workflow-service";
export {
  taskToFormValues,
  createEmptyTaskFormValues,
  type TaskFormValues,
  type TaskListCriteria,
  type ManagedTask,
} from "../tasks/task-types";
export {
  CalendarEventWorkflowService,
  type CalendarEventWorkflowResult,
} from "../calendar/calendar-event-workflow-service";
export {
  calendarEventToFormValues,
  createEmptyCalendarEventFormValues,
  type CalendarEventFormValues,
  type CalendarEventListCriteria,
  type ManagedCalendarEvent,
} from "../calendar/calendar-event-types";
export {
  TimeEntryWorkflowService,
  type TimeEntryWorkflowResult,
} from "../time/time-entry-workflow-service";
export {
  timeEntryToFormValues,
  createEmptyTimeEntryFormValues,
  type TimeEntryFormValues,
  type TimeEntryListCriteria,
  type ManagedTimeEntry,
} from "../time/time-entry-types";
export {
  InvoiceWorkflowService,
  type InvoiceWorkflowResult,
} from "../billing/invoice-workflow-service";
export {
  invoiceToFormValues,
  createEmptyInvoiceFormValues,
  parseTimeEntryIdsInput,
  type InvoiceFormValues,
  type InvoiceListCriteria,
  type ManagedInvoice,
} from "../billing/invoice-types";

export {
  createIsolatedClientRepository,
  createClientRepositoryForContext,
  getSharedClientRepository,
  resetSharedClientRepository,
  createIsolatedMatterRepository,
  createMatterRepositoryForContext,
  getSharedMatterRepository,
  resetSharedMatterRepository,
  createIsolatedDocumentRepository,
  createDocumentRepositoryForContext,
  getSharedDocumentRepository,
  resetSharedDocumentRepository,
  createIsolatedTaskRepository,
  createTaskRepositoryForContext,
  getSharedTaskRepository,
  resetSharedTaskRepository,
  createIsolatedCalendarEventRepository,
  createCalendarEventRepositoryForContext,
  getSharedCalendarEventRepository,
  resetSharedCalendarEventRepository,
  createIsolatedTimeEntryRepository,
  createTimeEntryRepositoryForContext,
  getSharedTimeEntryRepository,
  resetSharedTimeEntryRepository,
  createIsolatedInvoiceRepository,
  createInvoiceRepositoryForContext,
  getSharedInvoiceRepository,
  resetSharedInvoiceRepository,
  resetSharedLawRepositories,
} from "../persistence/repository-factory";

export {
  createLawPersistenceContext,
  type LawPersistenceContext,
} from "../persistence/law-persistence-context";
export {
  runWithLawPersistenceContext,
  runWithLawPersistenceContextAsync,
  resetLawPersistenceScope,
} from "../persistence/law-persistence-scope";
export { getLawRepositoryMode } from "../persistence/repository-mode";

export {
  sortClientsByDisplayName,
  matchesClientCriteria,
} from "../clients/client-repository-filters";
export {
  sortMattersByTitle,
  matchesMatterCriteria,
} from "../matters/matter-repository-filters";
export {
  sortDocumentsByTitle,
  matchesDocumentCriteria,
} from "../documents/document-repository-filters";
export {
  sortTasksByTitle,
  matchesTaskCriteria,
} from "../tasks/task-repository-filters";
export {
  sortCalendarEventsByStartsAt,
  matchesCalendarEventCriteria,
} from "../calendar/calendar-event-repository-filters";
export { matchesTimeEntryCriteria } from "../time/time-entry-repository-filters";
export {
  sortInvoicesByIssueDate,
  matchesInvoiceCriteria,
} from "../billing/invoice-repository-filters";

export {
  createTrustServiceBundle,
  getSharedTrustServiceBundle,
  resetSharedTrustServiceBundle,
  type TrustServiceBundle,
  type TrustRepositoryBundle,
} from "../persistence/trust-repository-factory";

export type {
  TrustAccount,
  TrustBalance,
  TrustTransaction,
} from "../trust/trust-ledger-types";

export type { TrustTransfer } from "../trust/trust-transfer-types";
export type { TrustReport, TrustReportType } from "../trust/trust-reporting-types";
export {
  exportTrustReport,
  exportTrustReportToCsv,
  exportTrustReportToHtml,
  isTrustReportExportPlaceholderFormat,
  normalizeTrustReportExportFormat,
  type TrustReportExportFormat,
  type TrustReportExportRequestFormat,
} from "../trust/trust-report-export";

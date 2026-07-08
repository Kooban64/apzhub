export {
  checkDatabaseHealth,
  createDb,
  getDb,
  getPool,
  type Database,
  type DatabaseExecutor,
  type DatabaseTransaction,
} from "./client";
export * from "./schema";
export {
  legalSchema,
  lawClient,
  lawMatter,
  lawDocument,
  lawTask,
  lawCalendarEvent,
  lawTimeEntry,
  lawInvoice,
  lawInvoiceLineItem,
  lawOutboxEvent,
  lawTrustAccount,
  lawTrustJournalEntry,
  lawTrustTransaction,
  lawTrustBalance,
  lawTrustTransactionDraft,
  lawTrustTransactionAudit,
  lawTrustAllocation,
  lawTrustReconciliationRun,
  lawTrustInterestRule,
  lawTrustInterestPosting,
  lawTrustTransfer,
  lawTrustApprovalRule,
  lawTrustApprovalRequest,
  lawTrustApprovalHistory,
  lawTrustReport,
} from "./legal-schema";
export { applyPostgresTenantSession } from "./postgres-tenant-session";
export {
  createClientOutboxDraft,
  createMatterOutboxDraft,
  createDocumentOutboxDraft,
  createTaskOutboxDraft,
  createCalendarOutboxDraft,
  createTimeOutboxDraft,
  createInvoiceOutboxDraft,
  createTrustOutboxDraft,
  type PostgresOutboxEventDraft,
} from "./law-mappers/outbox-drafts";
export { clientToRow, rowToClient } from "./law-mappers/client-row-mapper";
export { matterToRow, rowToMatter } from "./law-mappers/matter-row-mapper";
export { documentToRow, rowToDocument } from "./law-mappers/document-row-mapper";
export {
  taskToRow,
  rowToTask,
  type LawTaskPersistenceModel,
} from "./law-mappers/task-row-mapper";
export {
  calendarEventToRow,
  rowToCalendarEvent,
  type LawCalendarEventPersistenceModel,
} from "./law-mappers/calendar-event-row-mapper";
export {
  timeEntryToRow,
  rowToTimeEntry,
  type LawTimeEntryPersistenceModel,
} from "./law-mappers/time-entry-row-mapper";
export {
  invoiceToRow,
  lineItemToRow,
  rowToInvoice,
  rowToLineItem,
  type LawInvoicePersistenceModel,
} from "./law-mappers/invoice-row-mapper";
export {
  PostgresClientRepository,
  type PostgresClientRepositoryContract,
} from "./adapters/postgres-client-repository";
export {
  PostgresMatterRepository,
  type PostgresMatterRepositoryContract,
  type PostgresMatterListCriteria,
} from "./adapters/postgres-matter-repository";
export {
  PostgresDocumentRepository,
  type PostgresDocumentRepositoryContract,
  type PostgresDocumentListCriteria,
} from "./adapters/postgres-document-repository";
export {
  PostgresTaskRepository,
  type PostgresTaskRepositoryContract,
  type PostgresTaskListCriteria,
} from "./adapters/postgres-task-repository";
export {
  PostgresCalendarEventRepository,
  type PostgresCalendarEventRepositoryContract,
  type PostgresCalendarEventListCriteria,
} from "./adapters/postgres-calendar-event-repository";
export {
  PostgresTimeEntryRepository,
  type PostgresTimeEntryRepositoryContract,
  type PostgresTimeEntryListCriteria,
} from "./adapters/postgres-time-entry-repository";
export {
  PostgresInvoiceRepository,
  type PostgresInvoiceRepositoryContract,
  type PostgresInvoiceListCriteria,
} from "./adapters/postgres-invoice-repository";
export {
  PostgresTrustStore,
  type PostgresTrustStoreOptions,
} from "./adapters/postgres-trust-store";
export {
  trustAccountToRow,
  rowToTrustAccount,
  trustTransactionToRow,
  rowToTrustTransaction,
  trustJournalEntryToRow,
  rowToTrustJournalEntry,
  trustBalanceToRow,
  rowToTrustBalance,
  type LawTrustAccountPersistenceModel,
  type LawTrustTransactionPersistenceModel,
  type LawTrustJournalEntryPersistenceModel,
  type LawTrustBalancePersistenceModel,
} from "./law-mappers/trust-row-mapper";
export { runMigrations } from "./migrate";
export {
  verifyLawMigrations,
  type LawMigrationVerification,
} from "./migration-verification";
export { seedDatabase } from "./seed";

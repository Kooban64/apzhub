export {
  DEFAULT_LAW_TENANT_ID,
  SECONDARY_LAW_TENANT_ID,
  resolveLawTenantId,
} from "./default-tenant";
export {
  createLawPersistenceContext,
  getDefaultLawPersistenceContext,
  resetDefaultLawPersistenceContext,
  type LawPersistenceContext,
} from "./law-persistence-context";
export {
  runWithLawPersistenceContext,
  runWithLawPersistenceContextAsync,
  setSessionLawPersistenceContext,
  getSessionLawPersistenceContext,
  getExplicitLawPersistenceContext,
  getActiveLawPersistenceContext,
  resetLawPersistenceScope,
} from "./law-persistence-scope";
export {
  resolveLawTenantBinding,
  createLawPersistenceContextFromSession,
  type LawTenantBinding,
  type LawTenantSource,
} from "./tenant-resolver";
export {
  getLawRepositoryMode,
  isPostgresRepositoryMode,
  type LawRepositoryMode,
} from "./repository-mode";
export { isOutboxEnabled } from "./outbox-config";
export {
  ClientUnitOfWork,
  MatterUnitOfWork,
  DocumentUnitOfWork,
  TaskUnitOfWork,
  CalendarEventUnitOfWork,
  TimeEntryUnitOfWork,
  InvoiceUnitOfWork,
  runInClientUnitOfWork,
  runInMatterUnitOfWork,
  runInDocumentUnitOfWork,
  runInTaskUnitOfWork,
  runInCalendarEventUnitOfWork,
  runInTimeEntryUnitOfWork,
  runInInvoiceUnitOfWork,
  type LawUnitOfWork,
} from "./unit-of-work";
export {
  recordOutboxEvent,
  type OutboxAggregateType,
  type OutboxEventDraft,
} from "./outbox-skeleton";
export { runSync } from "./run-sync";
export {
  createClientRepository,
  createMatterRepository,
  createDocumentRepository,
  createTaskRepository,
  createCalendarEventRepository,
  createTimeEntryRepository,
  createInvoiceRepository,
  createIsolatedClientRepository,
  createIsolatedMatterRepository,
  createIsolatedDocumentRepository,
  createIsolatedTaskRepository,
  createIsolatedCalendarEventRepository,
  createIsolatedTimeEntryRepository,
  createIsolatedInvoiceRepository,
  createClientRepositoryForContext,
  createMatterRepositoryForContext,
  createDocumentRepositoryForContext,
  createTaskRepositoryForContext,
  createCalendarEventRepositoryForContext,
  createTimeEntryRepositoryForContext,
  createInvoiceRepositoryForContext,
  getSharedClientRepository,
  getSharedMatterRepository,
  getSharedDocumentRepository,
  getSharedTaskRepository,
  getSharedCalendarEventRepository,
  getSharedTimeEntryRepository,
  getSharedInvoiceRepository,
  resetSharedClientRepository,
  resetSharedMatterRepository,
  resetSharedDocumentRepository,
  resetSharedTaskRepository,
  resetSharedCalendarEventRepository,
  resetSharedTimeEntryRepository,
  resetSharedInvoiceRepository,
  resetSharedLawRepositories,
} from "./repository-factory";
export {
  createTrustServiceBundle,
  getSharedTrustServiceBundle,
  resetSharedTrustServiceBundle,
  type TrustServiceBundle,
  type TrustRepositoryBundle,
} from "./trust-repository-factory";
export {
  ensureLawMigrations,
  truncateLawTables,
  seedPostgresLawDataAsync,
  isPostgresIntegrationAvailable,
} from "./postgres-test-utils";
export { verifyLawMigrations, type LawMigrationVerification } from "@apzhub/config";
export {
  loadLawPersistenceDiagnostics,
  loadLawPersistenceDiagnosticsSync,
  type LawPersistenceDiagnosticsSummary,
} from "./persistence-diagnostics";

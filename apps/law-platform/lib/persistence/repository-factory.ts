import type { WritableDocumentRepository } from "../documents/writable-document-repository";
import { InMemoryDocumentRepository } from "../documents/in-memory-document-repository";
import { PostgresDocumentRepository } from "../documents/postgres-document-repository";
import type { WritableTaskRepository } from "../tasks/writable-task-repository";
import { InMemoryTaskRepository } from "../tasks/in-memory-task-repository";
import { PostgresTaskRepository } from "../tasks/postgres-task-repository";
import type { WritableCalendarEventRepository } from "../calendar/writable-calendar-event-repository";
import { InMemoryCalendarEventRepository } from "../calendar/in-memory-calendar-event-repository";
import { PostgresCalendarEventRepository } from "../calendar/postgres-calendar-event-repository";
import type { WritableTimeEntryRepository } from "../time/writable-time-entry-repository";
import { InMemoryTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import { PostgresTimeEntryRepository } from "../time/postgres-time-entry-repository";
import type { WritableInvoiceRepository } from "../billing/writable-invoice-repository";
import { InMemoryInvoiceRepository } from "../billing/in-memory-invoice-repository";
import { PostgresInvoiceRepository } from "../billing/postgres-invoice-repository";
import type { WritableClientRepository } from "../clients/writable-client-repository";
import { InMemoryClientRepository } from "../clients/in-memory-client-repository";
import { PostgresClientRepository } from "../clients/postgres-client-repository";
import type { WritableMatterRepository } from "../matters/writable-matter-repository";
import { InMemoryMatterRepository } from "../matters/in-memory-matter-repository";
import { PostgresMatterRepository } from "../matters/postgres-matter-repository";
import { SEED_CLIENTS } from "../clients/seed-clients";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_DOCUMENTS } from "../documents/seed-documents";
import { SEED_TASKS } from "../tasks/seed-tasks";
import { SEED_CALENDAR_EVENTS } from "../calendar/seed-calendar-events";
import { SEED_TIME_ENTRIES } from "../time/seed-time-entries";
import { SEED_INVOICES } from "../billing/seed-invoices";

import { resetSharedTrustServiceBundle } from "./trust-repository-factory";
import {
  createLawPersistenceContext,
  type LawPersistenceContext,
} from "./law-persistence-context";
import { getActiveLawPersistenceContext } from "./law-persistence-scope";
import { getLawRepositoryMode } from "./repository-mode";
import { runSync } from "./run-sync";
import { seedPostgresLawDataAsync } from "./postgres-test-utils";

let sharedMemoryClientRepository: InMemoryClientRepository | undefined;
let sharedMemoryMatterRepository: InMemoryMatterRepository | undefined;
let sharedMemoryDocumentRepository: InMemoryDocumentRepository | undefined;
let sharedMemoryTaskRepository: InMemoryTaskRepository | undefined;
let sharedMemoryCalendarEventRepository: InMemoryCalendarEventRepository | undefined;
let sharedMemoryTimeEntryRepository: InMemoryTimeEntryRepository | undefined;
let sharedMemoryInvoiceRepository: InMemoryInvoiceRepository | undefined;
const postgresClientRepositories = new Map<string, WritableClientRepository>();
const postgresMatterRepositories = new Map<string, WritableMatterRepository>();
const postgresDocumentRepositories = new Map<string, WritableDocumentRepository>();
const postgresTaskRepositories = new Map<string, WritableTaskRepository>();
const postgresCalendarEventRepositories = new Map<
  string,
  WritableCalendarEventRepository
>();
const postgresTimeEntryRepositories = new Map<string, WritableTimeEntryRepository>();
const postgresInvoiceRepositories = new Map<string, WritableInvoiceRepository>();

function repositoryCacheKey(context: LawPersistenceContext): string {
  return context.tenantId;
}

function seedPostgresTenant(
  context: LawPersistenceContext,
  input: {
    readonly clients?: boolean;
    readonly matters?: boolean;
    readonly documents?: boolean;
    readonly tasks?: boolean;
    readonly timeEntries?: boolean;
    readonly calendarEvents?: boolean;
    readonly invoices?: boolean;
  },
): void {
  if (getLawRepositoryMode() !== "postgres") {
    return;
  }

  runSync(
    seedPostgresLawDataAsync(context, {
      clients: input.clients ? SEED_CLIENTS : [],
      matters: input.matters ? SEED_MATTERS : [],
      documents: input.documents ? SEED_DOCUMENTS : [],
      tasks: input.tasks ? SEED_TASKS : [],
      timeEntries: input.timeEntries ? SEED_TIME_ENTRIES : [],
      calendarEvents: input.calendarEvents ? SEED_CALENDAR_EVENTS : [],
      invoices: input.invoices ? SEED_INVOICES : [],
    }),
  );
}

export function createClientRepository(
  context: LawPersistenceContext = getActiveLawPersistenceContext(),
): WritableClientRepository {
  if (getLawRepositoryMode() === "postgres") {
    return new PostgresClientRepository(context);
  }

  return new InMemoryClientRepository();
}

export function createMatterRepository(
  context: LawPersistenceContext = getActiveLawPersistenceContext(),
): WritableMatterRepository {
  if (getLawRepositoryMode() === "postgres") {
    return new PostgresMatterRepository(context);
  }

  return new InMemoryMatterRepository();
}

export function createDocumentRepository(
  context: LawPersistenceContext = getActiveLawPersistenceContext(),
): WritableDocumentRepository {
  if (getLawRepositoryMode() === "postgres") {
    return new PostgresDocumentRepository(context);
  }

  return new InMemoryDocumentRepository();
}

export function createTaskRepository(
  context: LawPersistenceContext = getActiveLawPersistenceContext(),
): WritableTaskRepository {
  if (getLawRepositoryMode() === "postgres") {
    return new PostgresTaskRepository(context);
  }

  return new InMemoryTaskRepository();
}

export function createCalendarEventRepository(
  context: LawPersistenceContext = getActiveLawPersistenceContext(),
): WritableCalendarEventRepository {
  if (getLawRepositoryMode() === "postgres") {
    return new PostgresCalendarEventRepository(context);
  }

  return new InMemoryCalendarEventRepository();
}

export function createTimeEntryRepository(
  context: LawPersistenceContext = getActiveLawPersistenceContext(),
): WritableTimeEntryRepository {
  if (getLawRepositoryMode() === "postgres") {
    return new PostgresTimeEntryRepository(context);
  }

  return new InMemoryTimeEntryRepository();
}

export function createInvoiceRepository(
  context: LawPersistenceContext = getActiveLawPersistenceContext(),
): WritableInvoiceRepository {
  if (getLawRepositoryMode() === "postgres") {
    return new PostgresInvoiceRepository(context);
  }

  return new InMemoryInvoiceRepository();
}

export function getSharedClientRepository(): WritableClientRepository {
  const context = getActiveLawPersistenceContext();

  if (getLawRepositoryMode() === "memory") {
    sharedMemoryClientRepository ??= new InMemoryClientRepository();
    return sharedMemoryClientRepository;
  }

  const cacheKey = repositoryCacheKey(context);
  let repository = postgresClientRepositories.get(cacheKey);
  if (!repository) {
    repository = createClientRepository(context);
    postgresClientRepositories.set(cacheKey, repository);
    seedPostgresTenant(context, { clients: true });
  }

  return repository;
}

export function getSharedMatterRepository(): WritableMatterRepository {
  const context = getActiveLawPersistenceContext();

  if (getLawRepositoryMode() === "memory") {
    sharedMemoryMatterRepository ??= new InMemoryMatterRepository();
    return sharedMemoryMatterRepository;
  }

  const cacheKey = repositoryCacheKey(context);
  let repository = postgresMatterRepositories.get(cacheKey);
  if (!repository) {
    getSharedClientRepository();
    repository = createMatterRepository(context);
    postgresMatterRepositories.set(cacheKey, repository);
    seedPostgresTenant(context, { matters: true });
  }

  return repository;
}

export function getSharedDocumentRepository(): WritableDocumentRepository {
  const context = getActiveLawPersistenceContext();

  if (getLawRepositoryMode() === "memory") {
    sharedMemoryDocumentRepository ??= new InMemoryDocumentRepository();
    return sharedMemoryDocumentRepository;
  }

  const cacheKey = repositoryCacheKey(context);
  let repository = postgresDocumentRepositories.get(cacheKey);
  if (!repository) {
    getSharedClientRepository();
    getSharedMatterRepository();
    repository = createDocumentRepository(context);
    postgresDocumentRepositories.set(cacheKey, repository);
    seedPostgresTenant(context, { documents: true });
  }

  return repository;
}

export function getSharedTaskRepository(): WritableTaskRepository {
  const context = getActiveLawPersistenceContext();

  if (getLawRepositoryMode() === "memory") {
    sharedMemoryTaskRepository ??= new InMemoryTaskRepository();
    return sharedMemoryTaskRepository;
  }

  const cacheKey = repositoryCacheKey(context);
  let repository = postgresTaskRepositories.get(cacheKey);
  if (!repository) {
    getSharedClientRepository();
    getSharedMatterRepository();
    getSharedDocumentRepository();
    repository = createTaskRepository(context);
    postgresTaskRepositories.set(cacheKey, repository);
    seedPostgresTenant(context, { tasks: true });
  }

  return repository;
}

export function getSharedTimeEntryRepository(): WritableTimeEntryRepository {
  const context = getActiveLawPersistenceContext();

  if (getLawRepositoryMode() === "memory") {
    sharedMemoryTimeEntryRepository ??= new InMemoryTimeEntryRepository();
    return sharedMemoryTimeEntryRepository;
  }

  const cacheKey = repositoryCacheKey(context);
  let repository = postgresTimeEntryRepositories.get(cacheKey);
  if (!repository) {
    getSharedClientRepository();
    getSharedMatterRepository();
    getSharedDocumentRepository();
    getSharedTaskRepository();
    repository = createTimeEntryRepository(context);
    postgresTimeEntryRepositories.set(cacheKey, repository);
    seedPostgresTenant(context, { timeEntries: true });
  }

  return repository;
}

export function getSharedCalendarEventRepository(): WritableCalendarEventRepository {
  const context = getActiveLawPersistenceContext();

  if (getLawRepositoryMode() === "memory") {
    sharedMemoryCalendarEventRepository ??= new InMemoryCalendarEventRepository();
    return sharedMemoryCalendarEventRepository;
  }

  const cacheKey = repositoryCacheKey(context);
  let repository = postgresCalendarEventRepositories.get(cacheKey);
  if (!repository) {
    getSharedTimeEntryRepository();
    repository = createCalendarEventRepository(context);
    postgresCalendarEventRepositories.set(cacheKey, repository);
    seedPostgresTenant(context, { calendarEvents: true });
  }

  return repository;
}

export function getSharedInvoiceRepository(): WritableInvoiceRepository {
  const context = getActiveLawPersistenceContext();

  if (getLawRepositoryMode() === "memory") {
    sharedMemoryInvoiceRepository ??= new InMemoryInvoiceRepository();
    return sharedMemoryInvoiceRepository;
  }

  const cacheKey = repositoryCacheKey(context);
  let repository = postgresInvoiceRepositories.get(cacheKey);
  if (!repository) {
    getSharedClientRepository();
    getSharedMatterRepository();
    getSharedTimeEntryRepository();
    repository = createInvoiceRepository(context);
    postgresInvoiceRepositories.set(cacheKey, repository);
    seedPostgresTenant(context, { invoices: true });
  }

  return repository;
}

export function resetSharedClientRepository(): void {
  sharedMemoryClientRepository = undefined;
  postgresClientRepositories.clear();
}

export function resetSharedMatterRepository(): void {
  sharedMemoryMatterRepository = undefined;
  postgresMatterRepositories.clear();
}

export function resetSharedDocumentRepository(): void {
  sharedMemoryDocumentRepository = undefined;
  postgresDocumentRepositories.clear();
}

export function resetSharedTaskRepository(): void {
  sharedMemoryTaskRepository = undefined;
  postgresTaskRepositories.clear();
}

export function resetSharedCalendarEventRepository(): void {
  sharedMemoryCalendarEventRepository = undefined;
  postgresCalendarEventRepositories.clear();
}

export function resetSharedTimeEntryRepository(): void {
  sharedMemoryTimeEntryRepository = undefined;
  postgresTimeEntryRepositories.clear();
}

export function resetSharedInvoiceRepository(): void {
  sharedMemoryInvoiceRepository = undefined;
  postgresInvoiceRepositories.clear();
}

export function resetSharedLawRepositories(): void {
  resetSharedClientRepository();
  resetSharedMatterRepository();
  resetSharedDocumentRepository();
  resetSharedTaskRepository();
  resetSharedCalendarEventRepository();
  resetSharedTimeEntryRepository();
  resetSharedInvoiceRepository();
  resetSharedTrustServiceBundle();
}

export function createIsolatedClientRepository(
  context?: Partial<LawPersistenceContext>,
): WritableClientRepository {
  return createClientRepository(createLawPersistenceContext(context));
}

export function createIsolatedMatterRepository(
  context?: Partial<LawPersistenceContext>,
): WritableMatterRepository {
  return createMatterRepository(createLawPersistenceContext(context));
}

export function createIsolatedDocumentRepository(
  context?: Partial<LawPersistenceContext>,
): WritableDocumentRepository {
  return createDocumentRepository(createLawPersistenceContext(context));
}

export function createIsolatedTaskRepository(
  context?: Partial<LawPersistenceContext>,
): WritableTaskRepository {
  return createTaskRepository(createLawPersistenceContext(context));
}

export function createIsolatedCalendarEventRepository(
  context?: Partial<LawPersistenceContext>,
): WritableCalendarEventRepository {
  return createCalendarEventRepository(createLawPersistenceContext(context));
}

export function createIsolatedTimeEntryRepository(
  context?: Partial<LawPersistenceContext>,
): WritableTimeEntryRepository {
  return createTimeEntryRepository(createLawPersistenceContext(context));
}

export function createIsolatedInvoiceRepository(
  context?: Partial<LawPersistenceContext>,
): WritableInvoiceRepository {
  return createInvoiceRepository(createLawPersistenceContext(context));
}

export function createClientRepositoryForContext(
  context: LawPersistenceContext,
): WritableClientRepository {
  return createClientRepository(context);
}

export function createMatterRepositoryForContext(
  context: LawPersistenceContext,
): WritableMatterRepository {
  return createMatterRepository(context);
}

export function createDocumentRepositoryForContext(
  context: LawPersistenceContext,
): WritableDocumentRepository {
  return createDocumentRepository(context);
}

export function createTaskRepositoryForContext(
  context: LawPersistenceContext,
): WritableTaskRepository {
  return createTaskRepository(context);
}

export function createCalendarEventRepositoryForContext(
  context: LawPersistenceContext,
): WritableCalendarEventRepository {
  return createCalendarEventRepository(context);
}

export function createTimeEntryRepositoryForContext(
  context: LawPersistenceContext,
): WritableTimeEntryRepository {
  return createTimeEntryRepository(context);
}

export function createInvoiceRepositoryForContext(
  context: LawPersistenceContext,
): WritableInvoiceRepository {
  return createInvoiceRepository(context);
}

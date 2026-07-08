import { describe, expect, it } from "vitest";
import type { Database } from "@apzhub/config";

import { getLawRepositoryMode } from "./repository-mode";
import {
  createCalendarEventRepository,
  createClientRepository,
  createDocumentRepository,
  createLawPersistenceContext,
  createMatterRepository,
  createTaskRepository,
  createTimeEntryRepository,
  createInvoiceRepository,
} from "./index";
import { InMemoryCalendarEventRepository } from "../calendar/in-memory-calendar-event-repository";
import { InMemoryClientRepository } from "../clients/in-memory-client-repository";
import { InMemoryDocumentRepository } from "../documents/in-memory-document-repository";
import { InMemoryMatterRepository } from "../matters/in-memory-matter-repository";
import { InMemoryTaskRepository } from "../tasks/in-memory-task-repository";
import { InMemoryTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import { InMemoryInvoiceRepository } from "../billing/in-memory-invoice-repository";
import { PostgresCalendarEventRepository } from "../calendar/postgres-calendar-event-repository";
import { PostgresClientRepository } from "../clients/postgres-client-repository";
import { PostgresDocumentRepository } from "../documents/postgres-document-repository";
import { PostgresMatterRepository } from "../matters/postgres-matter-repository";
import { PostgresTaskRepository } from "../tasks/postgres-task-repository";
import { PostgresTimeEntryRepository } from "../time/postgres-time-entry-repository";
import { PostgresInvoiceRepository } from "../billing/postgres-invoice-repository";

describe("repository factory", () => {
  it("defaults to memory mode", () => {
    const previous = process.env.LAW_REPOSITORY_MODE;
    delete process.env.LAW_REPOSITORY_MODE;

    expect(getLawRepositoryMode()).toBe("memory");
    expect(createClientRepository()).toBeInstanceOf(InMemoryClientRepository);
    expect(createMatterRepository()).toBeInstanceOf(InMemoryMatterRepository);
    expect(createDocumentRepository()).toBeInstanceOf(InMemoryDocumentRepository);
    expect(createTaskRepository()).toBeInstanceOf(InMemoryTaskRepository);
    expect(createCalendarEventRepository()).toBeInstanceOf(
      InMemoryCalendarEventRepository,
    );
    expect(createTimeEntryRepository()).toBeInstanceOf(InMemoryTimeEntryRepository);
    expect(createInvoiceRepository()).toBeInstanceOf(InMemoryInvoiceRepository);

    process.env.LAW_REPOSITORY_MODE = previous;
  });

  it("selects postgres adapters when LAW_REPOSITORY_MODE=postgres", () => {
    const previous = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";

    const context = createLawPersistenceContext({ db: {} as Database });
    expect(createClientRepository(context)).toBeInstanceOf(PostgresClientRepository);
    expect(createMatterRepository(context)).toBeInstanceOf(PostgresMatterRepository);
    expect(createDocumentRepository(context)).toBeInstanceOf(
      PostgresDocumentRepository,
    );
    expect(createTaskRepository(context)).toBeInstanceOf(PostgresTaskRepository);
    expect(createCalendarEventRepository(context)).toBeInstanceOf(
      PostgresCalendarEventRepository,
    );
    expect(createTimeEntryRepository(context)).toBeInstanceOf(
      PostgresTimeEntryRepository,
    );
    expect(createInvoiceRepository(context)).toBeInstanceOf(PostgresInvoiceRepository);

    process.env.LAW_REPOSITORY_MODE = previous;
  });

  it("rejects invalid repository modes", () => {
    const previous = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "invalid";

    expect(() => getLawRepositoryMode()).toThrow(/Invalid LAW_REPOSITORY_MODE/);

    process.env.LAW_REPOSITORY_MODE = previous;
  });
});

describe("LawPersistenceContext", () => {
  it("resolves tenantId from LAW_TENANT_ID when provided", () => {
    const previous = process.env.LAW_TENANT_ID;
    process.env.LAW_TENANT_ID = "t0000999-0000-4000-8000-000000000099";

    const context = createLawPersistenceContext();
    expect(context.tenantId).toBe("t0000999-0000-4000-8000-000000000099");

    process.env.LAW_TENANT_ID = previous;
  });
});

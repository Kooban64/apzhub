import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CalendarEventFactory, TimeEntryFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl } from "@apzhub/config";

import { PostgresCalendarEventRepository } from "../calendar/postgres-calendar-event-repository";
import { PostgresTimeEntryRepository } from "./postgres-time-entry-repository";
import { registerWritableTimeEntryRepositoryContract } from "./writable-time-entry-repository.contract.test";
import type { ManagedCalendarEvent } from "../calendar/calendar-event-types";
import type { ManagedTimeEntry } from "./time-entry-types";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  ensureLawMigrations,
  isPostgresIntegrationAvailable,
  seedPostgresLawDataAsync,
  truncateLawTables,
} from "../persistence";
import { SEED_CLIENTS } from "../clients/seed-clients";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_DOCUMENTS } from "../documents/seed-documents";
import { SEED_TASKS } from "../tasks/seed-tasks";
import { SEED_TIME_ENTRIES } from "./seed-time-entries";
import { getAttorneyDefaultRate, SEED_TIME_ATTORNEYS } from "./seed-attorneys";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("PostgresTimeEntryRepository integration", () => {
  let connectionString: string;
  let db: ReturnType<typeof createDb>;
  const context = () =>
    createLawPersistenceContext({ tenantId: DEFAULT_LAW_TENANT_ID, db });

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
    db = createDb(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
    await seedPostgresLawDataAsync(
      context(),
      {
        clients: SEED_CLIENTS,
        matters: SEED_MATTERS,
        documents: SEED_DOCUMENTS,
        tasks: SEED_TASKS,
        timeEntries: SEED_TIME_ENTRIES,
      },
      connectionString,
    );
  });

  registerWritableTimeEntryRepositoryContract(
    "PostgresTimeEntryRepository",
    () => new PostgresTimeEntryRepository(context()),
    { seedCount: 42 },
  );
});

describe.runIf(postgresAvailable)(
  "PostgresTimeEntryRepository tenant isolation",
  () => {
    let connectionString: string;

    beforeAll(async () => {
      connectionString = getDatabaseUrl();
      await ensureLawMigrations(connectionString);
    });

    beforeEach(async () => {
      await truncateLawTables(connectionString);
    });

    it("scopes reads and writes to tenantId", async () => {
      const db = createDb(connectionString);
      const tenantA = createLawPersistenceContext({
        tenantId: DEFAULT_LAW_TENANT_ID,
        db,
      });
      const tenantB = createLawPersistenceContext({
        tenantId: "t0000002-0000-4000-8000-000000000002",
        db,
      });

      await seedPostgresLawDataAsync(tenantA, {
        clients: SEED_CLIENTS,
        matters: SEED_MATTERS,
      });

      const repoA = new PostgresTimeEntryRepository(tenantA);
      const repoB = new PostgresTimeEntryRepository(tenantB);
      const entry = SEED_TIME_ENTRIES[0]!;

      repoA.create(entry);

      expect(repoA.getById(entry.timeEntryId)?.narrative).toBe(entry.narrative);
      expect(repoB.getById(entry.timeEntryId)).toBeUndefined();
      expect(repoB.list()).toHaveLength(0);
    });
  },
);

describe.runIf(postgresAvailable)("Calendar/Time relationship validation", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
  });

  it("rejects calendar events with missing matter", async () => {
    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    const repository = new PostgresCalendarEventRepository(context);
    const attorney = SEED_TIME_ATTORNEYS[0]!;

    const base = CalendarEventFactory.create({
      title: "Orphan Event",
      eventType: "appointment",
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString(),
      ownerUserId: attorney.userId,
      matterId: "m9999999-0000-4000-8000-000000000099",
    });

    const event: ManagedCalendarEvent = {
      ...base,
      calendarEventReference: CalendarEventFactory.nextReference(),
      createdAt: new Date().toISOString(),
    };

    expect(() => repository.create(event)).toThrow(/Matter not found/);
  });

  it("rejects calendar events with invalid client link", async () => {
    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    await seedPostgresLawDataAsync(context, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
    });

    const repository = new PostgresCalendarEventRepository(context);
    const matter = SEED_MATTERS[0]!;
    const attorney = SEED_TIME_ATTORNEYS[0]!;

    const base = CalendarEventFactory.create({
      title: "Bad Client Event",
      eventType: "appointment",
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString(),
      ownerUserId: attorney.userId,
      matterId: matter.matterId,
    });

    const event: ManagedCalendarEvent = {
      ...base,
      calendarEventReference: CalendarEventFactory.nextReference(),
      clientId: "c9999999-0000-4000-8000-000000000099",
      createdAt: new Date().toISOString(),
    };

    expect(() => repository.create(event)).toThrow(/Client not found/);
  });

  it("rejects calendar events with task from another matter", async () => {
    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    await seedPostgresLawDataAsync(context, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
      documents: SEED_DOCUMENTS,
      tasks: SEED_TASKS,
    });

    const repository = new PostgresCalendarEventRepository(context);
    const matter = SEED_MATTERS[1]!;
    const attorney = SEED_TIME_ATTORNEYS[0]!;
    const taskFromOtherMatter = SEED_TASKS[0]!;

    const base = CalendarEventFactory.create({
      title: "Mismatched Task Event",
      eventType: "appointment",
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString(),
      ownerUserId: attorney.userId,
      matterId: matter.matterId,
    });

    const event: ManagedCalendarEvent = {
      ...base,
      calendarEventReference: CalendarEventFactory.nextReference(),
      taskId: taskFromOtherMatter.taskId,
      createdAt: new Date().toISOString(),
    };

    expect(() => repository.create(event)).toThrow(/does not belong to matter/);
  });

  it("rejects time entries with document from another matter", async () => {
    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    await seedPostgresLawDataAsync(context, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
      documents: SEED_DOCUMENTS,
      tasks: SEED_TASKS,
    });

    const repository = new PostgresTimeEntryRepository(context);
    const matter = SEED_MATTERS[1]!;
    const attorney = SEED_TIME_ATTORNEYS[0]!;
    const documentFromOtherMatter = SEED_DOCUMENTS[0]!;

    const entry: ManagedTimeEntry = {
      ...TimeEntryFactory.create({
        matterId: matter.matterId,
        userId: attorney.userId,
        entryDate: new Date().toISOString().slice(0, 10),
        durationMinutes: 30,
        narrative: "Mismatched document entry",
        rate: getAttorneyDefaultRate(attorney.userId),
      }),
      documentId: documentFromOtherMatter.documentId,
      createdAt: new Date().toISOString(),
    };

    expect(() => repository.create(entry)).toThrow(/does not belong to matter/);
  });
});

describe.runIf(!postgresAvailable)(
  "PostgresTimeEntryRepository integration availability",
  () => {
    it("skips postgres contract tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, getDatabaseUrl } from "@apzhub/config";

import { PostgresCalendarEventRepository } from "./postgres-calendar-event-repository";
import { registerWritableCalendarEventRepositoryContract } from "./writable-calendar-event-repository.contract.test";
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
import { SEED_TIME_ENTRIES } from "../time/seed-time-entries";
import { SEED_CALENDAR_EVENTS } from "./seed-calendar-events";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("PostgresCalendarEventRepository integration", () => {
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
        calendarEvents: SEED_CALENDAR_EVENTS,
      },
      connectionString,
    );
  });

  registerWritableCalendarEventRepositoryContract(
    "PostgresCalendarEventRepository",
    () => new PostgresCalendarEventRepository(context()),
    { seedCount: 37 },
  );
});

describe.runIf(postgresAvailable)(
  "PostgresCalendarEventRepository tenant isolation",
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

      const repoA = new PostgresCalendarEventRepository(tenantA);
      const repoB = new PostgresCalendarEventRepository(tenantB);
      const event = SEED_CALENDAR_EVENTS[0]!;

      repoA.create(event);

      expect(repoA.getById(event.calendarEventId)?.title).toBe(event.title);
      expect(repoB.getById(event.calendarEventId)).toBeUndefined();
      expect(repoB.list()).toHaveLength(0);
    });
  },
);

describe.runIf(!postgresAvailable)(
  "PostgresCalendarEventRepository integration availability",
  () => {
    it("skips postgres contract tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);

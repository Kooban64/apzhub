import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CalendarEventFactory, TimeEntryFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl, lawOutboxEvent } from "@apzhub/config";

import { PostgresCalendarEventRepository } from "../calendar/postgres-calendar-event-repository";
import { PostgresTimeEntryRepository } from "../time/postgres-time-entry-repository";
import type { ManagedCalendarEvent } from "../calendar/calendar-event-types";
import type { ManagedTimeEntry } from "../time/time-entry-types";
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
import { getAttorneyDefaultRate, SEED_TIME_ATTORNEYS } from "../time/seed-attorneys";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("Calendar/Time outbox wiring", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
  });

  it("records outbox events transactionally on calendar create", async () => {
    const previousOutbox = process.env.LAW_OUTBOX_ENABLED;
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    process.env.LAW_OUTBOX_ENABLED = "true";

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
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + 3_600_000);

    const base = CalendarEventFactory.create({
      title: "Outbox Wiring Event",
      eventType: "appointment",
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ownerUserId: attorney.userId,
      matterId: matter.matterId,
    });

    const event: ManagedCalendarEvent = {
      ...base,
      calendarEventReference: CalendarEventFactory.nextReference(),
      clientId: matter.clientId,
      createdAt: new Date().toISOString(),
    };

    repository.create(event);

    const rows = await db.select().from(lawOutboxEvent);
    const matching = rows.filter((row) => row.aggregateId === event.calendarEventId);

    expect(matching).toHaveLength(1);
    expect(matching[0]?.eventType).toBe("legal.calendar.created");
    expect(matching[0]?.aggregateType).toBe("calendar");

    process.env.LAW_OUTBOX_ENABLED = previousOutbox;
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });

  it("records update, cancel, and delete time outbox events", async () => {
    const previousOutbox = process.env.LAW_OUTBOX_ENABLED;
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    process.env.LAW_OUTBOX_ENABLED = "true";

    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    await seedPostgresLawDataAsync(context, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
    });

    const timeRepository = new PostgresTimeEntryRepository(context);
    const calendarRepository = new PostgresCalendarEventRepository(context);
    const matter = SEED_MATTERS[0]!;
    const attorney = SEED_TIME_ATTORNEYS[0]!;

    const entry: ManagedTimeEntry = {
      ...TimeEntryFactory.create({
        matterId: matter.matterId,
        userId: attorney.userId,
        entryDate: new Date().toISOString().slice(0, 10),
        durationMinutes: 45,
        narrative: "Outbox wiring time entry",
        rate: getAttorneyDefaultRate(attorney.userId),
      }),
      createdAt: new Date().toISOString(),
    };

    timeRepository.create(entry);
    timeRepository.update(entry.timeEntryId, {
      ...entry,
      narrative: "Updated outbox wiring time entry",
    });
    timeRepository.softDelete(entry.timeEntryId);

    const timeRows = await db.select().from(lawOutboxEvent);
    const timeEvents = timeRows
      .filter((row) => row.aggregateId === entry.timeEntryId)
      .map((row) => row.eventType)
      .sort();

    expect(timeEvents).toEqual([
      "legal.time.created",
      "legal.time.deleted",
      "legal.time.updated",
    ]);

    const base = CalendarEventFactory.create({
      title: "Outbox Cancel Event",
      eventType: "appointment",
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 3_600_000).toISOString(),
      ownerUserId: attorney.userId,
      matterId: matter.matterId,
    });

    const calendarEvent: ManagedCalendarEvent = {
      ...base,
      calendarEventReference: CalendarEventFactory.nextReference(),
      createdAt: new Date().toISOString(),
    };

    calendarRepository.create(calendarEvent);
    calendarRepository.cancel(calendarEvent.calendarEventId);

    const allRows = await db.select().from(lawOutboxEvent);
    const calendarEvents = allRows
      .filter((row) => row.aggregateId === calendarEvent.calendarEventId)
      .map((row) => row.eventType)
      .sort();

    expect(calendarEvents).toEqual([
      "legal.calendar.cancelled",
      "legal.calendar.created",
    ]);

    process.env.LAW_OUTBOX_ENABLED = previousOutbox;
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });
});

describe.runIf(!postgresAvailable)("Calendar/Time outbox wiring", () => {
  it("skips postgres outbox tests when database is unavailable", () => {
    expect(postgresAvailable).toBe(false);
  });
});

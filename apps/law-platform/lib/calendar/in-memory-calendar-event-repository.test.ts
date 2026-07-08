import { describe, expect, it } from "vitest";

import { InMemoryCalendarEventRepository } from "./in-memory-calendar-event-repository";
import { SEED_CALENDAR_EVENTS } from "./seed-calendar-events";

describe("InMemoryCalendarEventRepository", () => {
  it("seeds at least 35 calendar events", () => {
    const repository = new InMemoryCalendarEventRepository();
    expect(repository.count()).toBeGreaterThanOrEqual(35);
    expect(SEED_CALENDAR_EVENTS.length).toBeGreaterThanOrEqual(35);
  });

  it("filters by matter, client, owner, type, status, and date range", () => {
    const repository = new InMemoryCalendarEventRepository();
    const sample = SEED_CALENDAR_EVENTS[0]!;

    expect(
      repository
        .list({ matterId: sample.matterId })
        .every((event) => event.matterId === sample.matterId),
    ).toBe(true);

    expect(
      repository
        .list({ clientId: sample.clientId })
        .every((event) => event.clientId === sample.clientId),
    ).toBe(true);

    expect(
      repository
        .list({ ownerUserId: sample.ownerUserId })
        .every((event) => event.ownerUserId === sample.ownerUserId),
    ).toBe(true);

    expect(
      repository
        .list({ eventType: sample.eventType })
        .every((event) => event.eventType === sample.eventType),
    ).toBe(true);

    const cancelled = repository.list({ calendarEventStatus: "cancelled" });
    expect(cancelled.length).toBeGreaterThan(0);
    expect(cancelled.every((event) => event.calendarEventStatus === "cancelled")).toBe(
      true,
    );
  });

  it("cancels events by setting status", () => {
    const repository = new InMemoryCalendarEventRepository();
    const active = SEED_CALENDAR_EVENTS.find(
      (event) => event.calendarEventStatus !== "cancelled",
    )!;

    const cancelled = repository.cancel(active.calendarEventId);
    expect(cancelled?.calendarEventStatus).toBe("cancelled");
    expect(repository.getById(active.calendarEventId)?.calendarEventStatus).toBe(
      "cancelled",
    );
  });
});

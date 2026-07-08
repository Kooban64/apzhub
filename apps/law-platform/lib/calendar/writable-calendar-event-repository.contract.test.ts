import { describe, expect, it } from "vitest";
import { CalendarEventFactory } from "@apzhub/legal-business-core";

import type { WritableCalendarEventRepository } from "./writable-calendar-event-repository";
import type { ManagedCalendarEvent } from "./calendar-event-types";
import { InMemoryCalendarEventRepository } from "./in-memory-calendar-event-repository";
import { SEED_CALENDAR_EVENTS } from "./seed-calendar-events";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_TIME_ATTORNEYS } from "../time/seed-attorneys";

export function registerWritableCalendarEventRepositoryContract(
  label: string,
  createRepository: () => WritableCalendarEventRepository,
  options?: { readonly seedCount?: number },
): void {
  describe(`${label} — writable calendar event repository contract`, () => {
    it("lists and retrieves seeded calendar events", () => {
      const repository = createRepository();
      const expectedCount = options?.seedCount ?? 37;

      expect(repository.count()).toBe(expectedCount);
      expect(repository.list()).toHaveLength(expectedCount);
      expect(repository.getById(SEED_CALENDAR_EVENTS[0]!.calendarEventId)).toEqual(
        SEED_CALENDAR_EVENTS[0],
      );
    });

    it("filters calendar events by query, matter, and status", () => {
      const repository = createRepository();

      expect(repository.list({ query: "Harbourview" }).length).toBeGreaterThan(0);
      expect(
        repository.list({ matterId: SEED_MATTERS[0]!.matterId }).length,
      ).toBeGreaterThan(0);
      expect(
        repository.list({ calendarEventStatus: "confirmed" }).length,
      ).toBeGreaterThan(0);
      expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
    });

    it("creates, updates, and cancels calendar events", () => {
      const repository = createRepository();
      const matter = SEED_MATTERS[0]!;
      const attorney = SEED_TIME_ATTORNEYS[0]!;
      const startsAt = new Date();
      startsAt.setHours(10, 0, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setHours(11, 0, 0, 0);

      const createdBase = CalendarEventFactory.create({
        title: "Contract Test Event",
        eventType: "appointment",
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        ownerUserId: attorney.userId,
        matterId: matter.matterId,
      });

      const created: ManagedCalendarEvent = {
        ...createdBase,
        calendarEventReference: CalendarEventFactory.nextReference(),
        clientId: matter.clientId,
        createdAt: new Date().toISOString(),
      };

      repository.create(created);
      expect(repository.getById(created.calendarEventId)?.title).toBe(
        "Contract Test Event",
      );

      const updated = repository.update(created.calendarEventId, {
        ...created,
        title: "Updated Contract Event",
      });
      expect(updated?.title).toBe("Updated Contract Event");

      const cancelled = repository.cancel(created.calendarEventId);
      expect(cancelled?.calendarEventStatus).toBe("cancelled");
      expect(repository.getById(created.calendarEventId)?.calendarEventStatus).toBe(
        "cancelled",
      );
    });
  });
}

registerWritableCalendarEventRepositoryContract(
  "InMemoryCalendarEventRepository",
  () => new InMemoryCalendarEventRepository(),
);

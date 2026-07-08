import { describe, expect, it } from "vitest";

import {
  calendarEventCreateRoute,
  calendarEventDetailRoute,
  calendarEventEditRoute,
  calendarEventListRoute,
  isCalendarModuleRoute,
  parseCalendarEventRoute,
} from "./calendar-event-routes";

describe("calendar event routes", () => {
  it("parses list, detail, create, and edit routes", () => {
    expect(isCalendarModuleRoute(calendarEventListRoute())).toBe(true);
    expect(parseCalendarEventRoute(calendarEventListRoute())).toEqual({ kind: "list" });
    expect(parseCalendarEventRoute(calendarEventCreateRoute())).toEqual({
      kind: "create",
    });
    expect(parseCalendarEventRoute(calendarEventDetailRoute("ce-1"))).toEqual({
      kind: "detail",
      calendarEventId: "ce-1",
    });
    expect(parseCalendarEventRoute(calendarEventEditRoute("ce-1"))).toEqual({
      kind: "edit",
      calendarEventId: "ce-1",
    });
  });
});

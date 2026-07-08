import { describe, expect, it } from "vitest";

import {
  timeEntryCreateRoute,
  timeEntryDetailRoute,
  timeEntryEditRoute,
  timeEntryListRoute,
  parseTimeEntryRoute,
} from "./time-entry-routes";

describe("time entry routes", () => {
  it("parses list, detail, create, and edit routes", () => {
    expect(parseTimeEntryRoute(timeEntryListRoute())).toEqual({ kind: "list" });
    expect(parseTimeEntryRoute(timeEntryCreateRoute())).toEqual({ kind: "create" });
    expect(parseTimeEntryRoute(timeEntryDetailRoute("te1"))).toEqual({
      kind: "detail",
      timeEntryId: "te1",
    });
    expect(parseTimeEntryRoute(timeEntryEditRoute("te1"))).toEqual({
      kind: "edit",
      timeEntryId: "te1",
    });
  });
});

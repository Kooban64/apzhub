import { describe, expect, it } from "vitest";

import {
  isTimeRoute,
  resolveTimeRoute,
  timesheetCreatePath,
  timesheetDetailPath,
  timesheetsPath,
} from "./routes";

describe("time routes", () => {
  it("detects time workspace paths", () => {
    expect(isTimeRoute("/workspace/time")).toBe(true);
    expect(isTimeRoute("/workspace/time/timesheets")).toBe(true);
    expect(isTimeRoute("/workspace/projects")).toBe(false);
  });

  it("resolves dashboard, list, create, detail, and ops routes", () => {
    expect(resolveTimeRoute("/workspace/time")).toEqual({ kind: "dashboard" });
    expect(resolveTimeRoute("/workspace/time/timesheets")).toEqual({
      kind: "timesheets",
    });
    expect(resolveTimeRoute("/workspace/time/timesheets/new")).toEqual({
      kind: "timesheet-create",
    });
    expect(resolveTimeRoute("/workspace/time/new")).toEqual({
      kind: "timesheet-create",
    });
    expect(
      resolveTimeRoute(
        "/workspace/time/timesheets/tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      ),
    ).toEqual({
      kind: "timesheet-detail",
      timesheetId: "tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(resolveTimeRoute("/workspace/time/activities")).toEqual({
      kind: "activities",
    });
    expect(resolveTimeRoute("/workspace/time/activities/new")).toEqual({
      kind: "activity-create",
    });
    expect(resolveTimeRoute("/workspace/time/customers/new")).toEqual({
      kind: "customer-create",
    });
    expect(resolveTimeRoute("/workspace/time/tags/new")).toEqual({
      kind: "tag-create",
    });
    expect(resolveTimeRoute("/workspace/time/search")).toEqual({ kind: "search" });
    expect(resolveTimeRoute("/workspace/time/health")).toEqual({ kind: "health" });
    expect(resolveTimeRoute("/workspace/time/diagnostics")).toEqual({
      kind: "diagnostics",
    });
    expect(resolveTimeRoute("/workspace/time/unknown-section")).toEqual({
      kind: "unknown",
    });
  });

  it("builds path helpers", () => {
    expect(timesheetsPath()).toBe("/workspace/time/timesheets");
    expect(timesheetCreatePath()).toBe("/workspace/time/timesheets/new");
    expect(timesheetDetailPath("tts_1")).toBe("/workspace/time/timesheets/tts_1");
  });
});

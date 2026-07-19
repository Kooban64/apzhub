import { describe, expect, it } from "vitest";

import {
  canCreateTimesheets,
  canListTimesheets,
  canManageTime,
  canViewTime,
} from "./permissions";

describe("time permissions", () => {
  it("supports time.* wildcard", () => {
    expect(canViewTime(["time.*"])).toBe(true);
    expect(canManageTime(["time.*"])).toBe(true);
    expect(canListTimesheets(["time.*"])).toBe(true);
    expect(canCreateTimesheets(["time.*"])).toBe(true);
  });

  it("matches specific permissions", () => {
    expect(canListTimesheets(["time.timesheet.list"])).toBe(true);
    expect(canCreateTimesheets(["time.timesheet.create"])).toBe(true);
    expect(canCreateTimesheets(["time.view"])).toBe(false);
  });
});

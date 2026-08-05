import { describe, expect, it } from "vitest";

import {
  canAdminTime,
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
    expect(canAdminTime(["time.*"])).toBe(true);
  });

  it("matches specific permissions", () => {
    expect(canListTimesheets(["time.timesheet.list"])).toBe(true);
    expect(canCreateTimesheets(["time.timesheet.create"])).toBe(true);
    expect(canCreateTimesheets(["time.view"])).toBe(false);
    expect(canAdminTime(["time.view"])).toBe(false);
    expect(canAdminTime(["time.admin"])).toBe(true);
  });

  it("denies when permission source is empty (no time.* default)", () => {
    expect(canViewTime([])).toBe(false);
    expect(canCreateTimesheets([])).toBe(false);
    expect(canListTimesheets(undefined)).toBe(false);
    expect(canAdminTime(undefined)).toBe(false);
  });
});

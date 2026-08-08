/**
 * TIME-P1-03 / APZTIM-103 — APZ Time daily path (repository smoke).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  timeDashboardPath,
  timesheetCreatePath,
  timesheetsPath,
  resolveTimeRoute,
} from "@/lib/time/routes";

const root = join(process.cwd());

describe("time daily path (TIME-P1-03)", () => {
  it("routes Overview → Timesheets → create", () => {
    expect(resolveTimeRoute(timeDashboardPath())).toEqual({ kind: "dashboard" });
    expect(resolveTimeRoute(timesheetsPath())).toEqual({ kind: "timesheets" });
    expect(resolveTimeRoute(timesheetCreatePath())).toEqual({
      kind: "timesheet-create",
    });
  });

  it("admin-gates health/diagnostics and mounts help honesty", () => {
    const router = readFileSync(
      join(root, "apps/web/components/time/time-workspace-router.tsx"),
      "utf8",
    );
    expect(router).toContain("canAdminTime");
    expect(router).toContain('case "health"');
    expect(router).toContain('case "diagnostics"');
    const help = readFileSync(
      join(root, "apps/web/components/time/time-help-view.tsx"),
      "utf8",
    );
    expect(help).toContain("time-help-limitations");
  });
});

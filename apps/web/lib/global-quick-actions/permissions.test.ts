import { describe, expect, it } from "vitest";

import { listGlobalQuickActions } from "./list-quick-actions";
import { filterQuickActionsByPermissions } from "./permissions";
import { listGlobalQuickActionDescriptors } from "./registry";

describe("Global Quick Actions permissions", () => {
  it("exposes the frozen v1 catalogue", () => {
    expect(listGlobalQuickActionDescriptors()).toHaveLength(7);
    expect(listGlobalQuickActionDescriptors().map((a) => a.label)).toEqual([
      "New Project",
      "New Ticket",
      "Log Time",
      "Start Workflow",
      "Upload Document",
      "Create Knowledge Article",
      "Run Test",
    ]);
  });

  it("filters by exact and wildcard grants", () => {
    const filtered = filterQuickActionsByPermissions(
      listGlobalQuickActionDescriptors(),
      ["projects.manage", "support.*", "time.timesheet.create"],
    );
    expect(filtered.map((a) => a.id)).toEqual([
      "qa-new-project",
      "qa-new-ticket",
      "qa-log-time",
    ]);
  });

  it("ranks recent actions first", () => {
    const result = listGlobalQuickActions({
      userPermissions: ["*"],
      recentActionIds: ["qa-log-time", "qa-new-ticket"],
    });
    expect(result.capability).toBe("global-quick-actions-v1");
    expect(result.actions[0]?.id).toBe("qa-log-time");
    expect(result.actions[1]?.id).toBe("qa-new-ticket");
    expect(result.recentActionIds).toEqual(["qa-log-time", "qa-new-ticket"]);
  });

  it("fails closed with empty permissions", () => {
    const result = listGlobalQuickActions({ userPermissions: [] });
    expect(result.actions).toHaveLength(0);
  });
});

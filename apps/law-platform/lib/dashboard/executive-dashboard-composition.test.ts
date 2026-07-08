import { describe, expect, it } from "vitest";

import { composeExecutiveDashboardSnapshot } from "./executive-dashboard-composition";

describe("composeExecutiveDashboardSnapshot", () => {
  it("composes firm-wide metrics from seed repositories", () => {
    const snapshot = composeExecutiveDashboardSnapshot("Alex Morgan");

    expect(snapshot.welcomeMessage).toContain("Alex Morgan");
    expect(snapshot.metrics.openMatters).toBeGreaterThan(0);
    expect(snapshot.metrics.activeClients).toBeGreaterThan(0);
    expect(snapshot.quickActions.length).toBeGreaterThanOrEqual(5);
    expect(snapshot.globalSearchRoute).toContain("/search");
    expect(snapshot.openMatters.length).toBeGreaterThan(0);
    expect(snapshot.recentClients.length).toBeGreaterThan(0);
  });
});

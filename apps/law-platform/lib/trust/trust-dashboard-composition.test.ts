import { describe, expect, it, beforeEach } from "vitest";

import {
  composeTrustDashboardSnapshot,
  composeTrustDiagnosticsSnapshot,
} from "./trust-dashboard-composition";
import {
  getSharedTrustWorkbench,
  resetSharedTrustWorkbench,
} from "./shared-trust-workbench";

describe("composeTrustDashboardSnapshot", () => {
  beforeEach(() => {
    resetSharedTrustWorkbench();
  });

  it("composes dashboard metrics from seeded trust workbench data", () => {
    const bundle = getSharedTrustWorkbench();
    const snapshot = composeTrustDashboardSnapshot(bundle);

    expect(snapshot.totalTrustBalance).toBeGreaterThan(0);
    expect(snapshot.matterBalances.length).toBeGreaterThan(0);
    expect(snapshot.clientBalances.length).toBeGreaterThan(0);
    expect(snapshot.recentTransactions.length).toBeGreaterThan(0);
    expect(snapshot.transferCount).toBeGreaterThan(0);
    expect(snapshot.reportShortcuts.length).toBeGreaterThan(0);
    expect(snapshot.complianceAlertPlaceholder).toContain("ZA-LPC");
  });

  it("composes diagnostics snapshot", () => {
    getSharedTrustWorkbench();
    const diagnostics = composeTrustDiagnosticsSnapshot();

    expect(diagnostics.ledgerRuns).toBeGreaterThanOrEqual(0);
    expect(diagnostics.reportingRuns).toBeGreaterThanOrEqual(0);
  });
});

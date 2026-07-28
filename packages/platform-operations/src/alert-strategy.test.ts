import { describe, expect, it } from "vitest";

import {
  PLATFORM_ALERT_POLICIES,
  auditAlertStrategy,
  listAlertPoliciesByPriority,
  validateAlertPolicy,
  validateAlertStrategyAuditEvidence,
} from "./alert-strategy";

describe("alert strategy (R12-OPS-02)", () => {
  it("defines the minimum Production policy set including Observe", () => {
    const ids = PLATFORM_ALERT_POLICIES.map((policy) => policy.id);
    expect(ids).toContain("alert.observe.unavailable");
    expect(ids).toContain("alert.identity.unavailable");
    expect(PLATFORM_ALERT_POLICIES.length).toBeGreaterThanOrEqual(9);
  });

  it("validates every built-in policy", () => {
    for (const policy of PLATFORM_ALERT_POLICIES) {
      expect(validateAlertPolicy(policy)).toEqual([]);
      expect(policy.observeMetadataOnly).toBe(true);
      expect(policy.deliveryPosture).toBe("manual-triage");
    }
  });

  it("passes audit when runbooks and artefacts exist", () => {
    const existing = new Set(PLATFORM_ALERT_POLICIES.map((p) => p.runbookPath));
    const evidence = auditAlertStrategy({
      existingRunbookPaths: existing,
      artefactsPresent: {
        monitoringDoc: true,
        runbookStandards: true,
        runbooksIndex: true,
        evidenceDirectory: true,
      },
      environment: "test",
      executedAt: "2026-07-20T09:00:00.000Z",
    });

    expect(evidence.verdict).toBe("PASS");
    expect(evidence.backlogItemId).toBe("R12-OPS-02");
    expect(validateAlertStrategyAuditEvidence(evidence).ok).toBe(true);
  });

  it("fails audit when a runbook is missing", () => {
    const existing = new Set(
      PLATFORM_ALERT_POLICIES.slice(1).map((policy) => policy.runbookPath),
    );
    const evidence = auditAlertStrategy({
      existingRunbookPaths: existing,
      artefactsPresent: {
        monitoringDoc: true,
        runbookStandards: true,
        runbooksIndex: true,
        evidenceDirectory: true,
      },
    });
    expect(evidence.verdict).toBe("FAIL");
  });

  it("lists policies by priority", () => {
    expect(listAlertPoliciesByPriority("P1").length).toBeGreaterThanOrEqual(3);
    expect(
      listAlertPoliciesByPriority("INFO").some((p) => p.id.includes("automation")),
    ).toBe(true);
  });

  it("rejects invalid evidence", () => {
    const result = validateAlertStrategyAuditEvidence({ schemaVersion: "9.9.9" });
    expect(result.ok).toBe(false);
  });
});

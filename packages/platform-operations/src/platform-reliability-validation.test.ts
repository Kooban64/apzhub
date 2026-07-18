import { describe, expect, it } from "vitest";

import { buildOperationsControlPlaneSnapshot } from "./operations-control-plane-service";
import { evaluateProductionVerification } from "./production-verification-service";
import { buildCapabilityHealthReports } from "./capability-health-builder";
import {
  createControlPlaneValidationInput,
  createHealthyConsolidatedFixture,
  withDatabaseUnavailable,
  withMissingConfiguration,
  withProductFailure,
  withRedisUnavailable,
  withTenantGuardFailure,
} from "@apzhub/platform-lifecycle";

const SECRET_VALUE_PATTERN = /postgresql:\/\/|sk_live|Bearer ey|supersecret/i;

describe("operations control plane reliability validation (PRH-010)", () => {
  it("returns NOT_READY when bootstrap fails", () => {
    const consolidated = createHealthyConsolidatedFixture();
    const capabilities = buildCapabilityHealthReports(consolidated, false);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: false,
      capabilities,
    });

    expect(verification.verdict).toBe("NOT_READY");
    expect(
      verification.findings.some((finding) => finding.id === "bootstrap.ready"),
    ).toBe(true);
  });

  it("returns NOT_READY when configuration validation fails", () => {
    const consolidated = withMissingConfiguration(createHealthyConsolidatedFixture());
    const capabilities = buildCapabilityHealthReports(consolidated, true);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: true,
      capabilities,
    });

    expect(verification.verdict).toBe("NOT_READY");
    expect(
      verification.findings.some((finding) => finding.id === "configuration.valid"),
    ).toBe(true);
  });

  it("returns NOT_READY when database dependency is unhealthy", () => {
    const consolidated = withDatabaseUnavailable(createHealthyConsolidatedFixture());
    const capabilities = buildCapabilityHealthReports(consolidated, true);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: true,
      capabilities,
    });

    expect(verification.verdict).toBe("NOT_READY");
    expect(
      verification.findings.some((finding) => finding.id === "dependency.database"),
    ).toBe(true);
  });

  it("returns NOT_READY or observations when redis is degraded", () => {
    const consolidated = withRedisUnavailable(createHealthyConsolidatedFixture());
    const capabilities = buildCapabilityHealthReports(consolidated, true);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: true,
      capabilities,
    });

    expect(["NOT_READY", "READY_WITH_OBSERVATIONS"]).toContain(verification.verdict);
    expect(
      verification.findings.some((finding) => finding.id === "dependency.redis"),
    ).toBe(true);
  });

  it("includes lifecycle state aligned with failure conditions", () => {
    const consolidated = withProductFailure(createHealthyConsolidatedFixture());
    const snapshot = buildOperationsControlPlaneSnapshot(
      createControlPlaneValidationInput(consolidated),
    );

    expect(snapshot.lifecycle?.currentState).not.toBe("operational");
    expect(snapshot.overview.productionReadiness).not.toBe("READY");
  });

  it("surfaces tenant guard warnings without blocking on foundation gaps only", () => {
    const consolidated = withTenantGuardFailure(createHealthyConsolidatedFixture());
    const capabilities = buildCapabilityHealthReports(consolidated, true);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: true,
      capabilities,
    });

    expect(
      verification.findings.some((finding) => finding.id === "tenant.api-guard"),
    ).toBe(true);
  });

  it("does not leak secrets in control plane snapshots under failure", () => {
    const consolidated = withMissingConfiguration(createHealthyConsolidatedFixture());
    const snapshot = buildOperationsControlPlaneSnapshot(
      createControlPlaneValidationInput(consolidated),
    );
    const serialized = JSON.stringify(snapshot);

    expect(serialized).not.toMatch(SECRET_VALUE_PATTERN);
  });

  it("provides operator guidance through degraded capability recommendations", () => {
    const consolidated = withDatabaseUnavailable(createHealthyConsolidatedFixture());
    const snapshot = buildOperationsControlPlaneSnapshot(
      createControlPlaneValidationInput(consolidated),
    );
    const persistence = snapshot.capabilities.find(
      (entry) => entry.capabilityId === "platform.persistence",
    );

    expect(persistence?.readiness).toBe("unhealthy");
    expect(persistence?.recommendations.length).toBeGreaterThan(0);
    expect(snapshot.lifecycle?.recommendations.length).toBeGreaterThan(0);
  });

  it("produces deterministic verification scores for identical failure input", () => {
    const consolidated = withRedisUnavailable(createHealthyConsolidatedFixture());
    const capabilities = buildCapabilityHealthReports(consolidated, true);
    const input = { consolidated, bootstrapReady: true, capabilities };

    const first = evaluateProductionVerification(input);
    const second = evaluateProductionVerification(input);

    expect(first.verdict).toBe(second.verdict);
    expect(first.score).toBe(second.score);
    expect(first.summary).toEqual(second.summary);
  });

  it("lists affected products when product capabilities degrade", () => {
    const consolidated = withProductFailure(createHealthyConsolidatedFixture());
    const snapshot = buildOperationsControlPlaneSnapshot(
      createControlPlaneValidationInput(consolidated),
    );

    expect(snapshot.overview.affectedProducts.length).toBeGreaterThan(0);
  });
});

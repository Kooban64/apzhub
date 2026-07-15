import { describe, expect, it } from "vitest";

import { buildRecoveryGuidance } from "@apzhub/platform-security";

import {
  createHealthyConsolidatedFixture,
  createLifecycleValidationInput,
  withAuthorizationFailure,
  withDatabaseUnavailable,
  withMissingConfiguration,
  withProductFailure,
  withReadinessDegraded,
  withRedisUnavailable,
  withTenantGuardFailure,
  withTrafficGovernanceDisabled,
} from "./failure-fixtures";
import { evaluateVersionCompatibility } from "./participation-evaluator";
import {
  PlatformLifecycleManager,
  buildPlatformLifecycleSnapshot,
} from "./platform-lifecycle-manager";

const SECRET_VALUE_PATTERN = /postgresql:\/\/|sk_live|Bearer ey|supersecret/i;

describe("platform reliability validation (PRH-010)", () => {
  describe("startup failures", () => {
    it("predictably stops at bootstrapping when bootstrap fails", () => {
      const consolidated = createHealthyConsolidatedFixture({ runtime: undefined });
      const snapshot = buildPlatformLifecycleSnapshot(
        createLifecycleValidationInput(consolidated, false),
      );

      expect(snapshot.currentState).toBe("initializing");
      expect(snapshot.readinessGates.find((gate) => gate.gate === "bootstrapping")?.satisfied).toBe(
        false,
      );
    });

    it("predictably stops at configuration-ready when configuration is invalid", () => {
      const consolidated = withMissingConfiguration(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));

      expect(snapshot.currentState).toBe("bootstrapping");
      expect(
        snapshot.readinessGates.find((gate) => gate.gate === "configuration-ready")?.satisfied,
      ).toBe(false);
    });

    it("predictably stops at identity-ready when database is unavailable", () => {
      const consolidated = withDatabaseUnavailable(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));

      expect(snapshot.currentState).toBe("configuration-ready");
      expect(snapshot.readinessGates.find((gate) => gate.gate === "identity-ready")?.satisfied).toBe(
        false,
      );
    });

    it("predictably stops at authorization-ready when authorization fails", () => {
      const consolidated = withAuthorizationFailure(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));

      expect(snapshot.currentState).toBe("identity-ready");
      expect(
        snapshot.readinessGates.find((gate) => gate.gate === "authorization-ready")?.satisfied,
      ).toBe(false);
    });

    it("predictably stops before products-ready when products are unavailable", () => {
      const consolidated = withProductFailure(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));

      expect(snapshot.currentState).not.toBe("operational");
      expect(snapshot.readinessGates.find((gate) => gate.gate === "products-ready")?.satisfied).toBe(
        false,
      );
    });
  });

  describe("dependency failures", () => {
    it("marks persistence unhealthy when database fails", () => {
      const consolidated = withDatabaseUnavailable(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));
      const persistence = snapshot.capabilities.find(
        (entry) => entry.capabilityId === "platform.persistence",
      );

      expect(persistence?.readiness).toBe("unhealthy");
    });

    it("degrades platform core when redis fails", () => {
      const consolidated = withRedisUnavailable(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));

      expect(snapshot.readinessGates.find((gate) => gate.gate === "platform-ready")?.satisfied).toBe(
        false,
      );
    });

    it("provides recovery guidance for database failure without secrets", () => {
      const guidance = buildRecoveryGuidance({
        databaseOk: false,
        redisOk: true,
        runtimeReady: true,
        environmentValid: true,
      });

      expect(guidance.some((item) => item.id === "database-unreachable")).toBe(true);
      expect(JSON.stringify(guidance)).not.toMatch(SECRET_VALUE_PATTERN);
    });
  });

  describe("health and readiness degradation", () => {
    it("transitions lifecycle to degraded when health degrades after products ready", () => {
      const consolidated = withReadinessDegraded(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));

      expect(snapshot.currentState).toBe("degraded");
      expect(snapshot.warnings.some((warning) => warning.includes("degraded"))).toBe(true);
    });

    it("reports tenant isolation degradation when api guard fails", () => {
      const consolidated = withTenantGuardFailure(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));
      const tenant = snapshot.capabilities.find(
        (entry) => entry.capabilityId === "platform.tenant-isolation",
      );

      expect(tenant?.readiness).toBe("degraded");
      expect(snapshot.readinessGates.find((gate) => gate.gate === "platform-ready")?.satisfied).toBe(
        false,
      );
    });

    it("reports traffic governance degradation when disabled", () => {
      const consolidated = withTrafficGovernanceDisabled(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));
      const traffic = snapshot.capabilities.find(
        (entry) => entry.capabilityId === "platform.traffic-governance",
      );

      expect(traffic?.readiness).toBe("degraded");
    });
  });

  describe("recovery", () => {
    it("enters recovering state during recovery action", () => {
      const manager = new PlatformLifecycleManager({ now: () => "2026-07-09T08:00:00.000Z" });
      const degraded = withReadinessDegraded(createHealthyConsolidatedFixture());
      const input = createLifecycleValidationInput(degraded);

      const result = manager.applyAction("begin-recovery", input);
      expect(result.currentState).toBe("recovering");
      expect(manager.snapshot(input).recoveryStatus).toBe("in-progress");
    });

    it("deterministically completes recovery when health is restored", () => {
      const manager = new PlatformLifecycleManager({ now: () => "2026-07-09T08:00:00.000Z" });
      const degraded = withReadinessDegraded(createHealthyConsolidatedFixture());
      const healthy = createHealthyConsolidatedFixture();

      manager.applyAction("begin-recovery", createLifecycleValidationInput(degraded));
      const recovered = manager.snapshot(createLifecycleValidationInput(healthy));

      expect(recovered.currentState).toBe("operational");
      expect(recovered.recoveryStatus).toBe("complete");
    });

    it("surfaces degraded instead of recovering when health worsens during recovery", () => {
      const manager = new PlatformLifecycleManager({ now: () => "2026-07-09T08:00:00.000Z" });
      const degraded = withReadinessDegraded(createHealthyConsolidatedFixture());
      const worse = withDatabaseUnavailable(createHealthyConsolidatedFixture());

      manager.applyAction("begin-recovery", createLifecycleValidationInput(degraded));
      const snapshot = manager.snapshot(createLifecycleValidationInput(worse));

      expect(snapshot.currentState).toBe("degraded");
    });
  });

  describe("maintenance and graceful shutdown", () => {
    it("enters and exits maintenance mode deterministically", () => {
      const manager = new PlatformLifecycleManager({ now: () => "2026-07-09T08:00:00.000Z" });
      const input = createLifecycleValidationInput(createHealthyConsolidatedFixture());

      manager.applyAction("enter-maintenance", input);
      expect(manager.snapshot(input).currentState).toBe("maintenance");

      manager.applyAction("exit-maintenance", input);
      expect(manager.snapshot(input).currentState).toBe("operational");
    });

    it("supports graceful shutdown to stopped", () => {
      const manager = new PlatformLifecycleManager({ now: () => "2026-07-09T08:00:00.000Z" });
      const input = createLifecycleValidationInput(createHealthyConsolidatedFixture());

      manager.applyAction("begin-shutdown", input);
      expect(manager.snapshot(input).shutdownStatus).toBe("draining");

      manager.applyAction("complete-shutdown", input);
      expect(manager.snapshot(input).currentState).toBe("stopped");
      expect(manager.snapshot(input).shutdownStatus).toBe("complete");
    });

    it("provides operator guidance during shutdown without secrets", () => {
      const manager = new PlatformLifecycleManager({ now: () => "2026-07-09T08:00:00.000Z" });
      const input = createLifecycleValidationInput(createHealthyConsolidatedFixture());

      manager.applyAction("begin-shutdown", input);
      const snapshot = manager.snapshot(input);

      expect(snapshot.recommendations.length).toBeGreaterThan(0);
      expect(JSON.stringify(snapshot)).not.toMatch(SECRET_VALUE_PATTERN);
    });
  });

  describe("version incompatibility", () => {
    it("detects incompatible platform version for registered products", () => {
      const report = evaluateVersionCompatibility("0.0.1");

      expect(report.compatible).toBe(false);
      expect(report.checks.some((check) => check.id === "law-platform" && !check.compatible)).toBe(
        true,
      );
    });
  });

  describe("determinism", () => {
    it("produces identical snapshots for identical failure inputs", () => {
      const consolidated = withRedisUnavailable(createHealthyConsolidatedFixture());
      const input = createLifecycleValidationInput(consolidated);

      const first = buildPlatformLifecycleSnapshot(input);
      const second = buildPlatformLifecycleSnapshot(input);

      expect(first.currentState).toBe(second.currentState);
      expect(first.readinessGates).toEqual(second.readinessGates);
      expect(first.capabilities.length).toBe(second.capabilities.length);
    });

    it("keeps lifecycle state consistent with readiness gates under partial startup", () => {
      const consolidated = withAuthorizationFailure(createHealthyConsolidatedFixture());
      const snapshot = buildPlatformLifecycleSnapshot(createLifecycleValidationInput(consolidated));
      const highestUnsatisfied = snapshot.readinessGates.find((gate) => !gate.satisfied)?.gate;

      expect(snapshot.currentState).toBe("identity-ready");
      expect(highestUnsatisfied).toBe("authorization-ready");
    });
  });
});

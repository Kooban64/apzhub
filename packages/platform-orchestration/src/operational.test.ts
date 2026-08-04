import { describe, expect, it } from "vitest";

import {
  OPERATIONAL_CONTRACT_KINDS,
  OPERATIONAL_EVENT_TYPES,
  createPlatformOrchestration,
} from "./index";

describe("APZQEP-165 QO-016 Enterprise Operational Platform", () => {
  it("creates a descriptive Operational Readiness Package", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.operational.v1")?.kind).toBe(
      "operational",
    );
    expect(platform.container.has("orchestration.operational.engine")).toBe(true);

    const pkg = platform.operational.createOperationalReadinessPackage({
      executiveExperiencePackageRef: "eep_1",
      evidenceIntegrationPackageRef: "eip_1",
      decisionPackageRef: "dp_1",
      buildRef: "build:abc",
      deploymentRef: "deploy:ref:1",
      environmentRef: "env:prod",
      runtimeRef: "runtime:node",
      configurationRefs: ["cfg:orch:1"],
      auditRefs: ["audit:op:1"],
      tenantId: "tenant_a",
      projectId: "proj_a",
      actorId: "actor_ops",
    });

    expect(pkg.descriptive).toBe(true);
    expect(pkg.prescriptive).toBe(false);
    expect(pkg.performsDeployments).toBe(false);
    expect(pkg.mutatesConfiguration).toBe(false);
    expect(pkg.readinessStatus).toBe("ready");
    expect(pkg.decisionPackageRef).toBe("dp_1");
    expect(pkg.executiveExperiencePackageRef).toBe("eep_1");
    expect(pkg.evidenceIntegrationPackageRef).toBe("eip_1");
    expect(pkg.healthContract.descriptive).toBe(true);
    expect(pkg.healthContract.prescriptive).toBe(false);
    expect(pkg.readinessContract.state).toBe("ready");
    expect(pkg.livenessContract.state).toBe("live");
    expect(pkg.operationalEndpoints.length).toBeGreaterThan(0);
    expect(pkg.operationalMetadata.version.slice).toBe("QO-017");

    expect(
      platform.events.queryEvents({
        eventType: OPERATIONAL_EVENT_TYPES.readinessCreated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: OPERATIONAL_EVENT_TYPES.healthContractUpdated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: OPERATIONAL_EVENT_TYPES.readinessContractPublished,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: OPERATIONAL_EVENT_TYPES.packageCompleted,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("exposes health, readiness, liveness, diagnostics, and version reads", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.operational.createOperationalReadinessPackage({
      decisionPackageRef: "dp_r",
      tenantId: "t1",
    });

    expect(platform.operational.getHealth().kind).toBe("health");
    expect(platform.operational.getReadiness().kind).toBe("readiness");
    expect(platform.operational.getLiveness().kind).toBe("liveness");
    expect(
      platform.operational.getDiagnosticsSnapshot(pkg.operationalReadinessPackageId)
        .ready,
    ).toBe(true);
    expect(platform.operational.getVersionMetadata().version).toBe("0.1.16");
    expect(platform.operational.getOperationalMetadata().descriptive).toBe(true);

    for (const kind of OPERATIONAL_CONTRACT_KINDS) {
      expect(
        [
          pkg.healthContract,
          pkg.readinessContract,
          pkg.livenessContract,
          pkg.startupContract,
          pkg.shutdownContract,
          pkg.degradedOperationContract,
          pkg.maintenanceStateContract,
        ].some((c) => c.kind === kind),
      ).toBe(true);
    }
  });

  it("marks degraded and maintenance statuses descriptively", async () => {
    const platform = await createPlatformOrchestration();
    const degraded = platform.operational.createOperationalReadinessPackage({
      healthState: "degraded",
      readinessState: "degraded",
      tenantId: "t1",
    });
    expect(degraded.readinessStatus).toBe("degraded");
    expect(degraded.prescriptive).toBe(false);

    const maintenance = platform.operational.createOperationalReadinessPackage({
      maintenanceState: "maintenance",
      tenantId: "t1",
    });
    expect(maintenance.readinessStatus).toBe("maintenance");
    expect(maintenance.performsDeployments).toBe(false);
  });

  it("never exposes deployment, infrastructure, or mutation APIs", async () => {
    const platform = await createPlatformOrchestration();
    const eng = platform.operational as unknown as Record<string, unknown>;
    expect(typeof eng.deploy).toBe("undefined");
    expect(typeof eng.scale).toBe("undefined");
    expect(typeof eng.mutateConfiguration).toBe("undefined");
    expect(typeof eng.executeOrchestration).toBe("undefined");
    expect(typeof eng.evaluateGovernance).toBe("undefined");
    expect(typeof eng.renderExecutive).toBe("undefined");

    const pkg = platform.operational.createOperationalReadinessPackage({
      tenantId: "t1",
      configurationRefs: ["cfg:readonly"],
    });
    expect(pkg.mutatesConfiguration).toBe(false);
    expect(pkg.operationalMetadata.deployment.mutatesNothing).toBe(true);
    expect(platform.operational.diagnostics().ready).toBe(true);
  });

  it("supports superseding readiness packages without mutating history", async () => {
    const platform = await createPlatformOrchestration();
    const first = platform.operational.createOperationalReadinessPackage({
      decisionPackageRef: "dp_s",
      tenantId: "t1",
    });
    const second = platform.operational.createOperationalReadinessPackage({
      decisionPackageRef: "dp_s",
      supersedesPackageId: first.operationalReadinessPackageId,
      tenantId: "t1",
      buildRef: "build:2",
    });
    expect(second.supersedesPackageId).toBe(first.operationalReadinessPackageId);
    expect(first.operationalMetadata.buildRef).toBeUndefined();
    expect(second.operationalMetadata.buildRef).toBe("build:2");
    expect(
      platform.operational.getOperationalReadinessPackage(
        first.operationalReadinessPackageId,
      ).readinessStatus,
    ).toBe("ready");
  });
});

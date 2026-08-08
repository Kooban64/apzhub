import { describe, expect, it } from "vitest";

import {
  AUTOMATION_COORDINATION_EVENT_TYPES,
  createPlatformOrchestration,
} from "./index";

describe("APZQEP-165 QO-011 Enterprise Automation Coordination", () => {
  it("creates a Coordination Package from a GO Decision Package snapshot", async () => {
    const platform = await createPlatformOrchestration();

    platform.capabilities.register({
      capabilityId: "cap_functional_automation",
      name: "Functional Automation Capability",
      version: "1.0.0",
      provider: "platform-automation",
      supportedContractVersions: ["1.0.0"],
      supportedQualityFlowStages: ["capability_coordination"],
      lifecycle: "active",
      documentationRef: "docs://caps/functional",
      contractIds: ["automation.functional.v1"],
      labels: { automationIntent: "functional_automation" },
    });

    expect(
      platform.contracts.get("orchestration.automation_coordination.v1")?.kind,
    ).toBe("automation_coordination");
    expect(platform.container.has("orchestration.automation.coordination")).toBe(true);

    const pkg = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_go_1",
        qualityFlowRef: "qf_1",
        platformConclusion: "GO",
        decisionProfileId: "pull_request",
        outstandingItems: ["activity:api_verification", "activity:smoke_testing"],
        residualRiskLevel: "low",
        tenantId: "tenant_a",
        projectId: "proj_a",
      },
      actorId: "actor_coord",
    });

    expect(pkg.execution).toBe(false);
    expect(pkg.advisory).toBe(true);
    expect(pkg.coordinationStatus).toBe("coordinated");
    expect(pkg.decisionPackageRef).toBe("dp_go_1");
    expect(pkg.requiredActivities.map((a) => a.intentType).sort()).toEqual([
      "api_automation",
      "smoke_verification",
    ]);
    expect(
      pkg.providerEligibility.find((e) => e.intentType === "functional_automation"),
    ).toBeUndefined();

    const apiElig = pkg.providerEligibility.find(
      (e) => e.intentType === "api_automation",
    );
    expect(apiElig?.eligibleCapabilityIds).toEqual([]);

    expect(
      platform.automationCoordination.getCoordinationStatus(pkg.coordinationPackageId),
    ).toBe("coordinated");
    expect(
      platform.automationCoordination.queryAutomationIntent(pkg.coordinationPackageId)
        .length,
    ).toBe(2);

    const created = platform.events.queryEvents({
      eventType: AUTOMATION_COORDINATION_EVENT_TYPES.coordinationCreated,
    });
    expect(created.length).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: AUTOMATION_COORDINATION_EVENT_TYPES.intentIdentified,
      }).length,
    ).toBe(2);
    expect(
      platform.events.queryEvents({
        eventType: AUTOMATION_COORDINATION_EVENT_TYPES.coordinationCompleted,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("returns not_required for NO_GO and deferred for DEFERRED", async () => {
    const platform = await createPlatformOrchestration();

    const noGo = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_nogo",
        qualityFlowRef: "qf_n",
        platformConclusion: "NO_GO",
        tenantId: "t1",
      },
    });
    expect(noGo.coordinationStatus).toBe("not_required");
    expect(noGo.requiredActivities).toHaveLength(0);

    const deferred = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_def",
        qualityFlowRef: "qf_d",
        platformConclusion: "DEFERRED",
        tenantId: "t1",
      },
      additionalIntents: ["regression_verification"],
    });
    expect(deferred.coordinationStatus).toBe("deferred");
    expect(deferred.requiredActivities.map((a) => a.intentType)).toEqual([
      "regression_verification",
    ]);
  });

  it("defaults intents from profile when GO has no outstanding activities", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_default",
        qualityFlowRef: "qf_d",
        platformConclusion: "GO",
        decisionProfileId: "production_release",
        outstandingItems: [],
        tenantId: "t1",
      },
    });
    expect(pkg.requiredActivities.length).toBeGreaterThan(0);
    expect(
      pkg.requiredActivities.some((a) => a.intentType === "smoke_verification"),
    ).toBe(true);
  });

  it("resolves logical eligibility from the Capability Registry", async () => {
    const platform = await createPlatformOrchestration();
    platform.capabilities.register({
      capabilityId: "cap_api",
      name: "API Automation Capability",
      version: "1.0.0",
      provider: "platform-automation",
      supportedContractVersions: ["1.0.0"],
      supportedQualityFlowStages: ["capability_coordination"],
      lifecycle: "active",
      documentationRef: "docs://caps/api",
      contractIds: ["automation.api.v1"],
      labels: { automationIntent: "api_automation" },
    });

    const pkg = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_elig",
        qualityFlowRef: "qf_e",
        platformConclusion: "GO",
        outstandingItems: ["activity:api_verification"],
        tenantId: "t1",
      },
    });

    const elig = pkg.providerEligibility.find((e) => e.intentType === "api_automation");
    expect(elig?.eligibleCapabilityIds).toContain("cap_api");
    expect(elig?.note).toMatch(/not invoked/i);
  });

  it("supports superseding packages and publishes updated events", async () => {
    const platform = await createPlatformOrchestration();
    const first = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_s1",
        qualityFlowRef: "qf_s",
        platformConclusion: "GO",
        decisionProfileId: "developer_commit",
        tenantId: "t1",
      },
    });
    const second = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_s1",
        qualityFlowRef: "qf_s",
        platformConclusion: "CONDITIONAL_GO",
        decisionProfileId: "developer_commit",
        tenantId: "t1",
      },
      supersedesPackageId: first.coordinationPackageId,
      additionalIntents: ["security_automation"],
    });

    expect(second.supersedesPackageId).toBe(first.coordinationPackageId);
    expect(
      platform.events.queryEvents({
        eventType: AUTOMATION_COORDINATION_EVENT_TYPES.coordinationUpdated,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("never exposes execution or provider-specific APIs", async () => {
    const platform = await createPlatformOrchestration();
    const coord = platform.automationCoordination as unknown as Record<string, unknown>;
    expect(typeof coord.execute).toBe("undefined");
    expect(typeof coord.runPlaywright).toBe("undefined");
    expect(typeof coord.invokeProvider).toBe("undefined");
    expect(typeof coord.evaluatePolicy).toBe("undefined");
    expect(typeof coord.evaluateGovernance).toBe("undefined");

    const pkg = await platform.automationCoordination.createCoordinationPackage({
      decisionPackage: {
        decisionPackageId: "dp_arch",
        qualityFlowRef: "qf_a",
        platformConclusion: "GO",
        tenantId: "t1",
      },
    });
    expect(JSON.stringify(pkg).toLowerCase()).not.toMatch(
      /\b(playwright|selenium|cypress|appium|k6|percy|axe)\b/,
    );
    expect(platform.automationCoordination.diagnostics().packageCount).toBe(1);
    expect(platform.automationCoordination.diagnostics().ready).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { CapabilityRegistry } from "./registry/capability-registry";
import {
  ORCHESTRATION_KERNEL_EVENT_TYPES,
  createPlatformOrchestration,
  isOrchestrationError,
} from "./index";

function sampleCapability(
  overrides: Partial<{
    capabilityId: string;
    provider: string;
    triggerTypes: string[];
    stages: Array<
      | "impact_correlation"
      | "test_selection"
      | "capability_coordination"
      | "evidence_collection"
      | "quality_intelligence"
      | "quality_gates"
      | "human_approval"
      | "release_recommendation"
      | "release_decision"
    >;
    contractIds: string[];
  }> = {},
) {
  return {
    capabilityId: overrides.capabilityId ?? "platform.automation",
    name: "Automation",
    version: "0.1.0",
    provider: overrides.provider ?? "@apzhub/platform-automation",
    supportedContractVersions: ["orchestration.capability.v1"],
    triggerTypes: overrides.triggerTypes ?? ["scm.push", "manual.start"],
    supportedQualityFlowStages: overrides.stages ?? [
      "capability_coordination",
      "evidence_collection",
    ],
    healthStatus: "healthy" as const,
    requiredPermissions: ["automation.run"],
    dependencies: [],
    featureFlags: { enabled: true },
    lifecycle: "registered" as const,
    documentationRef: "docs/products/apzqep/v1.1/apzqep-161/README.md",
    contractIds: overrides.contractIds ?? ["automation.run.v1"],
  };
}

describe("APZQEP-165 QO-002 Capability Registry catalogue", () => {
  it("registers full catalogue metadata", async () => {
    const registry = new CapabilityRegistry();
    const record = registry.register(sampleCapability());
    expect(record.capabilityId).toBe("platform.automation");
    expect(record.provider).toBe("@apzhub/platform-automation");
    expect(record.supportedContractVersions).toEqual(["orchestration.capability.v1"]);
    expect(record.triggerTypes).toContain("scm.push");
    expect(record.supportedQualityFlowStages).toContain("evidence_collection");
    expect(record.healthStatus).toBe("healthy");
    expect(record.requiredPermissions).toEqual(["automation.run"]);
    expect(record.documentationRef).toContain("apzqep-161");
    expect(record.lifecycle).toBe("registered");
  });

  it("queries by provider, trigger, stage, contract, and lifecycle", async () => {
    const registry = new CapabilityRegistry();
    registry.register(sampleCapability());
    registry.register(
      sampleCapability({
        capabilityId: "platform.scm",
        provider: "@apzhub/platform-scm",
        triggerTypes: ["scm.pull_request.opened"],
        stages: ["impact_correlation"],
        contractIds: ["scm.context.v1"],
      }),
    );

    expect(registry.listByProvider("@apzhub/platform-scm")).toHaveLength(1);
    expect(registry.listByTriggerType("scm.push")).toHaveLength(1);
    expect(registry.listByQualityFlowStage("impact_correlation")).toHaveLength(1);
    expect(registry.listByContractId("automation.run.v1")).toHaveLength(1);
    expect(registry.listByLifecycle("registered")).toHaveLength(2);
    expect(
      registry.query({
        provider: "@apzhub/platform-automation",
        triggerType: "manual.start",
      }),
    ).toHaveLength(1);
  });

  it("updates stored health without probing or executing", async () => {
    const registry = new CapabilityRegistry();
    registry.register(sampleCapability());
    expect(registry.getHealthStatus("platform.automation")).toBe("healthy");
    registry.reportHealth("platform.automation", "degraded");
    expect(registry.getHealthStatus("platform.automation")).toBe("degraded");
  });

  it("transitions capability lifecycle states", async () => {
    const registry = new CapabilityRegistry();
    registry.register(sampleCapability({ capabilityId: "cap.a" }));
    expect(registry.transitionLifecycle("cap.a", "active").lifecycle).toBe("active");
    expect(registry.transitionLifecycle("cap.a", "deprecated").lifecycle).toBe(
      "deprecated",
    );
  });

  it("rejects incomplete catalogue metadata", async () => {
    const registry = new CapabilityRegistry();
    try {
      registry.register({
        capabilityId: "bad",
        name: "Bad",
        version: "1",
        provider: "p",
        supportedContractVersions: [],
        documentationRef: "docs/x",
      });
      expect.fail("expected validation failure");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }
  });

  it("is catalogue-only — no executor / service-locator API surface", async () => {
    const registry = new CapabilityRegistry();
    const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(registry));
    for (const forbidden of [
      "invoke",
      "execute",
      "resolve",
      "getInstance",
      "getService",
      "create",
      "run",
    ]) {
      expect(proto).not.toContain(forbidden);
    }
    expect(registry.catalogueMode).toBe("catalogue-only");
  });

  it("registers through kernel without owning orchestration decisions", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });
    const record = platform.kernel.registerCapability(sampleCapability());
    expect(record.provider).toBe("@apzhub/platform-automation");
    expect(platform.capabilities.count()).toBe(1);
    expect(events).toContain(ORCHESTRATION_KERNEL_EVENT_TYPES.capabilityRegistered);
    expect(
      platform.capabilities.listByQualityFlowStage("capability_coordination"),
    ).toHaveLength(1);
  });
});

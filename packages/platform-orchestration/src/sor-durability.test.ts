import { describe, expect, it } from "vitest";

import {
  DECISION_EVENT_TYPES,
  createPlatformOrchestration,
  InMemoryOrchestrationDocumentStore,
} from "./index";

describe("QX-PR-05 SoR durability (write-through + hydrate)", () => {
  it("persists and restores approval_bundle, governance_decision, impact_correlation, automation_coordination_package, and quality_event", async () => {
    const store = new InMemoryOrchestrationDocumentStore();

    const writePlatform = await createPlatformOrchestration({ documentStore: store });

    await writePlatform.governance.registerGate({
      gateId: "gate_durability",
      name: "Durability Gate",
      version: "1.0.0",
      category: { family: "mandatory", label: "coverage" },
      criteria: { type: "always_satisfied" },
      documentationRef: "docs://durability/gate",
    });
    await writePlatform.governance.registerTemplate({
      templateId: "custom",
      name: "Custom durability template",
      policyProfileId: "pull_request",
      composition: { mode: "all", gateIds: ["gate_durability"] },
      documentationRef: "docs://durability/template",
    });

    const impact = await writePlatform.impact.createCorrelation({
      change: {
        changeId: "chg_dur",
        changeKind: "commit",
        tenantId: "tenant_dur",
        correlationId: "corr_dur",
        occurredAt: new Date().toISOString(),
        seedAssetIds: ["asset_dur"],
      },
    });

    const governance = await writePlatform.governance.evaluateTemplate("custom", {
      tenantId: "tenant_dur",
      impact,
    });

    writePlatform.approvals.registerAuthority({
      authorityId: "release_manager",
      name: "Release Manager",
      scope: "enterprise",
    });
    await writePlatform.approvals.registerTemplate({
      templateId: "tpl_dur",
      name: "Durability Approval",
      version: "1.0.0",
      requiredAuthorities: ["release_manager"],
      documentationRef: "docs://durability/approval",
    });
    const approval = await writePlatform.approvals.createApprovalBundle({
      templateId: "tpl_dur",
      tenantId: "tenant_dur",
      subject: { governanceDecisionRef: governance.decisionId },
    });

    const coordination =
      await writePlatform.automationCoordination.createCoordinationPackage({
        decisionPackage: {
          decisionPackageId: "dp_dur",
          qualityFlowRef: "qf_dur",
          platformConclusion: "GO",
          decisionProfileId: "pull_request",
          outstandingItems: [],
          residualRiskLevel: "low",
          tenantId: "tenant_dur",
        },
      });

    const qualityEvent = await writePlatform.events.publish({
      eventType: DECISION_EVENT_TYPES.packageCreated,
      correlationId: "corr_dur_evt",
      tenantId: "tenant_dur",
      producer: "orchestration.test",
      subjectRef: "dp_dur",
      payload: { durable: true },
    });

    expect((await store.listByKind("impact_correlation", "tenant_dur")).length).toBe(1);
    expect((await store.listByKind("governance_decision", "tenant_dur")).length).toBe(
      1,
    );
    expect((await store.listByKind("approval_bundle", "tenant_dur")).length).toBe(1);
    expect(
      (await store.listByKind("automation_coordination_package", "tenant_dur")).length,
    ).toBe(1);
    expect(
      (await store.listByKind("quality_event", "tenant_dur")).length,
    ).toBeGreaterThan(0);

    const readPlatform = await createPlatformOrchestration({ documentStore: store });

    expect(readPlatform.impact.getCorrelation(impact.correlationId).changeId).toBe(
      "chg_dur",
    );
    expect(
      readPlatform.governance.getGovernanceDecision(governance.decisionId).tenantId,
    ).toBe("tenant_dur");
    expect(readPlatform.approvals.getBundle(approval.bundleId).finalStatus).toBe(
      "pending",
    );
    expect(
      readPlatform.automationCoordination.getCoordinationPackage(
        coordination.coordinationPackageId,
      ).decisionPackageRef,
    ).toBe("dp_dur");
    expect(readPlatform.events.getEvent(qualityEvent.eventId).payload.durable).toBe(
      true,
    );
  });
});

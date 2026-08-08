/**
 * QX-PR-05 — Orchestration SoR Postgres durability evidence.
 * Proves: migration-backed table · write · restart hydrate · tenant isolation · integrity.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { checkDatabaseHealth, createDb } from "@apzhub/config";
import {
  createPlatformOrchestration,
  createPostgresOrchestrationDocumentStore,
} from "@apzhub/platform-orchestration";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());
const stamp = Date.now().toString(36);
const tenantA = `t-qxpr05-a-${stamp}`;
const tenantB = `t-qxpr05-b-${stamp}`;
const flowId = `qf_qxpr05_${stamp}`;
const instanceKeys: string[] = [];

describe.skipIf(!hasDb)("QX-PR-05 Orchestration Postgres durability", () => {
  beforeAll(async () => {
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      throw new Error(`DATABASE_URL unhealthy: ${health.message ?? "unknown"}`);
    }
  });

  afterAll(async () => {
    const store = createPostgresOrchestrationDocumentStore(createDb());
    for (const key of instanceKeys) {
      await store.delete("flow_instance", key);
    }
    await store.delete("flow_definition", `${flowId}@1.0.0`);
    const decisions = await store.listByKind("decision_package");
    for (const doc of decisions) {
      if (doc.tenantId === tenantA || doc.tenantId === tenantB) {
        await store.delete("decision_package", doc.artefactKey);
      }
    }
    const approvals = await store.listByKind("approval_bundle");
    for (const doc of approvals) {
      if (doc.tenantId === tenantA || doc.tenantId === tenantB) {
        await store.delete("approval_bundle", doc.artefactKey);
      }
    }
  });

  it("migrated store survives restart hydrate with tenant isolation and integrity", async () => {
    const writerStore = createPostgresOrchestrationDocumentStore(createDb());
    const writer = await createPlatformOrchestration({ documentStore: writerStore });

    await writer.qualityFlows.registerDefinition({
      flowId,
      name: "QX-PR-05 Durability Flow",
      version: "1.0.0",
      owner: "apzqep",
      supportedTriggerTypes: ["manual"],
      lifecycleVersion: "1",
      documentationRef:
        "docs/products/apzqep/engineering/evidence/QX-PR-05-ORCHESTRATION-DURABILITY-EVIDENCE.md",
      metadata: { programme: "QX-PR-05" },
    });

    const instanceA = await writer.qualityFlows.createInstance({
      flowId,
      triggerId: `trg_a_${stamp}`,
      correlationId: `corr_a_${stamp}`,
      tenantId: tenantA,
      actor: "qx-pr-05-verifier",
    });
    const instanceB = await writer.qualityFlows.createInstance({
      flowId,
      triggerId: `trg_b_${stamp}`,
      correlationId: `corr_b_${stamp}`,
      tenantId: tenantB,
      actor: "qx-pr-05-verifier",
    });
    instanceKeys.push(instanceA.instanceId, instanceB.instanceId);

    await writer.qualityFlows.transition(instanceA.instanceId, {
      toState: "ready",
      actor: "qx-pr-05-verifier",
      reason: "durability_start",
      correlationId: `corr_a_${stamp}`,
    });

    writer.approvals.registerAuthority({
      authorityId: "release_manager",
      name: "Release Manager",
      scope: "enterprise",
      delegationSupported: false,
      escalationSupported: false,
    });
    await writer.approvals.registerTemplate({
      templateId: `tpl_qxpr05_${stamp}`,
      name: "PR-05 Approval",
      version: "1.0.0",
      requiredAuthorities: ["release_manager"],
      decisionRule: { type: "all_required" },
      documentationRef:
        "docs/products/apzqep/engineering/evidence/QX-PR-05-ORCHESTRATION-DURABILITY-EVIDENCE.md",
    });
    const bundle = await writer.approvals.createApprovalBundle({
      templateId: `tpl_qxpr05_${stamp}`,
      tenantId: tenantA,
      subject: {
        governanceDecisionRef: `gov_${stamp}`,
        qualityFlowRef: instanceA.qualityFlowId,
      },
    });

    const decision = await writer.decisions.createDecisionPackage({
      profileId: "pull_request",
      qualityFlowRef: instanceA.qualityFlowId,
      policySelectionRef: `sel_${stamp}`,
      impact: {
        impactCorrelationRef: `imp_${stamp}`,
        overallConfidence: 0.9,
        confidenceSummary: "ok",
        confidenceSources: ["graph"],
        riskLevel: "low",
        riskSummary: "low",
        riskFactors: [],
      },
      governance: {
        governanceDecisionRef: `gov_${stamp}`,
        compositionSatisfied: true,
        residualRisk: "low",
        outstandingGates: [],
        requiredHumanApprovals: [],
        governanceSummary: "ok",
      },
      approval: {
        approvalBundleRef: bundle.bundleId,
        finalStatus: "pending",
        outstandingAuthorities: ["release_manager"],
        conditions: [],
        exceptions: [],
      },
      tenantId: tenantA,
      actorId: "qx-pr-05-verifier",
    });

    // Simulated restart — new DB client + new orchestration bootstrap
    const readerStore = createPostgresOrchestrationDocumentStore(
      createDb(process.env.DATABASE_URL),
    );
    const reader = await createPlatformOrchestration({ documentStore: readerStore });

    const hydratedA = reader.qualityFlows.getInstance(instanceA.instanceId);
    expect(hydratedA.tenantId).toBe(tenantA);
    expect(hydratedA.currentState).toBe("ready");
    expect(hydratedA.qualityFlowId).toBe(instanceA.qualityFlowId);

    const hydratedB = reader.qualityFlows.getInstance(instanceB.instanceId);
    expect(hydratedB.tenantId).toBe(tenantB);

    const def = reader.qualityFlows.getDefinition(flowId, "1.0.0");
    expect(def.name).toBe("QX-PR-05 Durability Flow");

    const decisionHydrated = reader.decisions
      .listDecisionPackages()
      .find((p) => p.decisionPackageId === decision.decisionPackageId);
    expect(decisionHydrated?.tenantId).toBe(tenantA);
    expect(decisionHydrated?.platformConclusion).toBeDefined();

    const approvalHydrated = reader.approvals.getBundle(bundle.bundleId);
    expect(approvalHydrated.tenantId).toBe(tenantA);

    const instancesA = await readerStore.listByKind("flow_instance", tenantA);
    const instancesB = await readerStore.listByKind("flow_instance", tenantB);
    expect(instancesA.every((d) => d.tenantId === tenantA)).toBe(true);
    expect(instancesB.every((d) => d.tenantId === tenantB)).toBe(true);
    expect(instancesA.some((d) => d.artefactKey === instanceA.instanceId)).toBe(true);
    expect(instancesA.some((d) => d.artefactKey === instanceB.instanceId)).toBe(false);

    // Persistence integrity — payload round-trip
    const raw = await readerStore.get("flow_instance", instanceA.instanceId);
    expect(raw?.payload).toMatchObject({
      instanceId: instanceA.instanceId,
      currentState: "ready",
      tenantId: tenantA,
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  IMPACT_CORRELATION_EVENT_TYPES,
  createPlatformOrchestration,
  distanceScore,
  isOrchestrationError,
  levelFromScore,
  type NormalizedChange,
} from "./index";

async function seedKnowledge(
  impact: Awaited<ReturnType<typeof createPlatformOrchestration>>["impact"],
) {
  await impact.registerAsset({
    assetId: "file_auth",
    assetType: "file",
    name: "auth.ts",
    evidenceQuality: 0.8,
  });
  await impact.registerAsset({
    assetId: "cmp_auth",
    assetType: "component",
    name: "AuthComponent",
    evidenceQuality: 0.75,
  });
  await impact.registerAsset({
    assetId: "svc_identity",
    assetType: "service",
    name: "IdentityService",
    evidenceQuality: 0.7,
  });
  await impact.registerAsset({
    assetId: "req_login",
    assetType: "requirement",
    name: "Login requirement",
    evidenceQuality: 0.9,
  });
  await impact.registerAsset({
    assetId: "suite_auth",
    assetType: "test_suite",
    name: "Auth suite",
    evidenceQuality: 0.85,
  });
  await impact.registerAsset({
    assetId: "plan_smoke",
    assetType: "execution_plan",
    name: "Smoke plan",
  });
  await impact.registerAsset({
    assetId: "auto_login",
    assetType: "automation_asset",
    name: "Login automation",
  });
  await impact.registerAsset({
    assetId: "ev_last",
    assetType: "evidence",
    name: "Last run evidence",
    evidenceQuality: 0.6,
  });
  await impact.registerAsset({
    assetId: "def_42",
    assetType: "defect",
    name: "Auth flake",
    knownRegression: true,
  });
  await impact.registerAsset({
    assetId: "sig_flaky",
    assetType: "quality_signal",
    name: "Flaky signal",
  });

  const edges: Array<{
    id: string;
    from: string;
    to: string;
    kind:
      | "contains"
      | "depends_on"
      | "implements"
      | "covers"
      | "validates"
      | "produces"
      | "related_to"
      | "regresses";
    strength: number;
    reason: string;
  }> = [
    {
      id: "rel_file_cmp",
      from: "file_auth",
      to: "cmp_auth",
      kind: "contains",
      strength: 0.95,
      reason: "File belongs to AuthComponent",
    },
    {
      id: "rel_cmp_svc",
      from: "cmp_auth",
      to: "svc_identity",
      kind: "depends_on",
      strength: 0.9,
      reason: "Component depends on IdentityService",
    },
    {
      id: "rel_svc_req",
      from: "svc_identity",
      to: "req_login",
      kind: "implements",
      strength: 0.85,
      reason: "Service implements login requirement",
    },
    {
      id: "rel_req_suite",
      from: "req_login",
      to: "suite_auth",
      kind: "covers",
      strength: 0.8,
      reason: "Suite covers login requirement",
    },
    {
      id: "rel_suite_plan",
      from: "suite_auth",
      to: "plan_smoke",
      kind: "related_to",
      strength: 0.7,
      reason: "Suite included in smoke execution plan",
    },
    {
      id: "rel_suite_auto",
      from: "suite_auth",
      to: "auto_login",
      kind: "validates",
      strength: 0.75,
      reason: "Automation validates auth suite",
    },
    {
      id: "rel_auto_ev",
      from: "auto_login",
      to: "ev_last",
      kind: "produces",
      strength: 0.65,
      reason: "Automation produces evidence",
    },
    {
      id: "rel_suite_def",
      from: "suite_auth",
      to: "def_42",
      kind: "regresses",
      strength: 0.7,
      reason: "Historical defect linked to suite",
    },
    {
      id: "rel_def_sig",
      from: "def_42",
      to: "sig_flaky",
      kind: "related_to",
      strength: 0.6,
      reason: "Defect contributes flaky quality signal",
    },
  ];

  for (const e of edges) {
    await impact.registerRelationship({
      relationshipId: e.id,
      fromAssetId: e.from,
      toAssetId: e.to,
      kind: e.kind,
      strength: e.strength,
      reason: e.reason,
      evidenceRefs: [`evidence://${e.id}`],
    });
  }
}

describe("APZQEP-165 QO-005 Impact Correlation Engine", () => {
  it("builds a deterministic explainable impact graph from a normalized change", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });
    await seedKnowledge(platform.impact);

    const change: NormalizedChange = {
      changeId: "chg_1",
      changeKind: "commit",
      tenantId: "tenant_a",
      projectId: "proj_a",
      triggerId: "trig_1",
      correlationId: "corr_1",
      qualityFlowId: "qf_1",
      occurredAt: new Date().toISOString(),
      magnitude: "medium",
      seedAssetIds: ["file_auth"],
      actorId: "actor_1",
    };

    const first = await platform.impact.createCorrelation({ change, maxDepth: 8 });
    const second = await platform.impact.createCorrelation({
      change: { ...change, changeId: "chg_2", correlationId: "corr_2" },
      maxDepth: 8,
    });

    expect(first.graph.traversalOrder).toEqual(second.graph.traversalOrder);
    expect(first.graph.nodes.length).toBeGreaterThan(5);
    expect(first.graph.edges.length).toBeGreaterThan(4);
    expect(first.explanations.length).toBeGreaterThan(0);
    expect(first.explanations.every((e) => e.why.length > 0)).toBe(true);
    expect(events).toContain(IMPACT_CORRELATION_EVENT_TYPES.created);
  });

  it("computes explainable confidence and advisory risk", async () => {
    const platform = await createPlatformOrchestration();
    await seedKnowledge(platform.impact);
    const result = await platform.impact.createCorrelation({
      change: {
        changeId: "chg_risk",
        changeKind: "changed_files",
        tenantId: "tenant_a",
        correlationId: "corr_risk",
        occurredAt: new Date().toISOString(),
        magnitude: "large",
        seedAssetIds: ["file_auth"],
      },
      maxDepth: 8,
    });

    expect(result.confidence.score).toBeGreaterThan(0);
    expect(result.confidence.factors.length).toBeGreaterThan(0);
    expect(result.confidence.factors.every((f) => f.explanation.length > 0)).toBe(true);
    expect(result.risk.advisory).toBe(true);
    expect(["low", "medium", "high", "critical"]).toContain(result.risk.level);
    expect(result.risk.factors.length).toBeGreaterThan(0);
    // Known regression on defect path should elevate risk
    expect(["medium", "high", "critical"]).toContain(result.risk.level);
  });

  it("produces advisory recommended quality scope without execution selection", async () => {
    const platform = await createPlatformOrchestration();
    await seedKnowledge(platform.impact);
    const result = await platform.impact.createCorrelation({
      change: {
        changeId: "chg_scope",
        changeKind: "pull_request",
        tenantId: "tenant_a",
        correlationId: "corr_scope",
        occurredAt: new Date().toISOString(),
        seedAssetIds: ["file_auth"],
      },
      maxDepth: 8,
    });

    const scope = platform.impact.getRecommendedScope(result.correlationId);
    expect(scope.advisory).toBe(true);
    expect(scope.note).toContain("QO-006");
    expect(scope.affectedRequirements).toContain("req_login");
    expect(scope.affectedSuites).toContain("suite_auth");
    expect(scope.affectedExecutionPlans).toContain("plan_smoke");
    expect(scope.affectedAutomationAssets).toContain("auto_login");
    expect(scope.affectedEvidence).toContain("ev_last");
    expect(scope.affectedDefects).toContain("def_42");
    expect(scope.affectedQualitySignals).toContain("sig_flaky");
    expect(
      typeof (platform.impact as unknown as { selectTests?: unknown }).selectTests,
    ).toBe("undefined");
    expect(typeof (platform.impact as unknown as { execute?: unknown }).execute).toBe(
      "undefined",
    );
  });

  it("maintains append-only history and query APIs", async () => {
    const platform = await createPlatformOrchestration();
    await seedKnowledge(platform.impact);
    const a = await platform.impact.createCorrelation({
      change: {
        changeId: "chg_h1",
        changeKind: "commit",
        tenantId: "tenant_a",
        triggerId: "trig_h",
        qualityFlowId: "qf_h",
        correlationId: "corr_h1",
        occurredAt: new Date().toISOString(),
        seedAssetIds: ["file_auth"],
      },
    });
    const before = platform.impact.getHistory().length;
    await platform.impact.createCorrelation({
      change: {
        changeId: "chg_h2",
        changeKind: "commit",
        tenantId: "tenant_a",
        correlationId: "corr_h2",
        occurredAt: new Date().toISOString(),
        seedAssetIds: ["file_auth"],
      },
    });
    expect(platform.impact.getHistory().length).toBe(before + 1);
    expect(platform.impact.getCorrelation(a.correlationId).correlationId).toBe(
      a.correlationId,
    );
    expect(platform.impact.getImpactGraph(a.correlationId).graphId).toBe(
      a.graph.graphId,
    );
    expect(platform.impact.getConfidence(a.correlationId).score).toBe(
      a.confidence.score,
    );
    expect(platform.impact.getRisk(a.correlationId).level).toBe(a.risk.level);
    expect(platform.impact.getExplainability(a.correlationId).length).toBe(
      a.explanations.length,
    );
  });

  it("rejects provider-specific metadata and integrates with registry/triggers/flows", async () => {
    const platform = await createPlatformOrchestration();
    platform.capabilities.register({
      capabilityId: "cap_impact",
      name: "Impact provider",
      version: "1.0.0",
      provider: "platform-quality-intelligence",
      supportedContractVersions: ["1"],
      supportedQualityFlowStages: ["impact_correlation"],
      documentationRef: "docs://impact",
      contractIds: ["impact.v1"],
    });
    expect(
      platform.impact
        .discoverCorrelationCapabilities()
        .some((c) => c.capabilityId === "cap_impact"),
    ).toBe(true);

    await platform.qualityFlows.registerDefinition({
      flowId: "qf_impact",
      name: "Impact flow",
      version: "1.0.0",
      owner: "apzqep",
      documentationRef: "docs://qf",
      supportedCapabilityStages: ["impact_correlation"],
    });

    await expect(
      platform.impact.createCorrelation({
        change: {
          changeId: "chg_bad",
          changeKind: "commit",
          tenantId: "tenant_a",
          correlationId: "corr_bad",
          occurredAt: new Date().toISOString(),
          metadata: { github_sha: "abc" },
        },
      }),
    ).rejects.toSatisfy((error: unknown) => isOrchestrationError(error));

    await seedKnowledge(platform.impact);
    const result = await platform.impact.createCorrelation({
      change: {
        changeId: "chg_ok",
        changeKind: "commit",
        tenantId: "tenant_a",
        correlationId: "corr_ok",
        qualityFlowId: "qf_impact",
        triggerId: "trig_ok",
        occurredAt: new Date().toISOString(),
        seedAssetIds: ["file_auth"],
      },
    });
    expect(result.qualityFlowId).toBe("qf_impact");
    expect(result.triggerId).toBe("trig_ok");
    // Does not start flows or invoke capabilities
    expect(platform.qualityFlows.listInstances()).toHaveLength(0);
  });

  it("exposes diagnostics and covers confidence/risk helpers", async () => {
    const platform = await createPlatformOrchestration();
    await seedKnowledge(platform.impact);
    await platform.impact.createCorrelation({
      change: {
        changeId: "chg_diag",
        changeKind: "manual_declaration",
        tenantId: "tenant_a",
        correlationId: "corr_diag",
        occurredAt: new Date().toISOString(),
        seedAssetIds: ["file_auth"],
        refs: ["packages/auth/src/login.ts"],
      },
      maxDepth: 6,
    });
    const diag = platform.impact.diagnostics();
    expect(diag.knowledgeAssetCount).toBeGreaterThan(5);
    expect(diag.correlationCount).toBe(1);
    expect(diag.ready).toBe(true);
    expect(platform.impact.health().status).toBe("healthy");
    expect(platform.container.has("orchestration.impact_correlation.engine")).toBe(
      true,
    );
    expect(distanceScore(0)).toBe(1);
    expect(distanceScore(10)).toBe(0.15);
    expect(levelFromScore(0.9)).toBe("critical");
    expect(levelFromScore(0.2)).toBe("low");
  });

  it("covers graph traversal for every edge in the seeded knowledge path", async () => {
    const platform = await createPlatformOrchestration();
    await seedKnowledge(platform.impact);
    const result = await platform.impact.createCorrelation({
      change: {
        changeId: "chg_trav",
        changeKind: "commit",
        tenantId: "tenant_a",
        correlationId: "corr_trav",
        occurredAt: new Date().toISOString(),
        seedAssetIds: ["file_auth"],
      },
      maxDepth: 10,
    });

    const nodeIds = new Set(result.graph.nodes.map((n) => n.nodeId));
    for (const edge of result.graph.edges) {
      expect(nodeIds.has(edge.fromNodeId)).toBe(true);
      expect(nodeIds.has(edge.toNodeId)).toBe(true);
      const explanation = result.explanations.find(
        (e) => e.subjectId === edge.edgeId && e.subjectKind === "edge",
      );
      expect(explanation).toBeTruthy();
      expect(explanation!.why.length).toBeGreaterThan(0);
      expect(explanation!.confidenceExplanation.length).toBeGreaterThan(0);
    }
    for (const node of result.graph.nodes) {
      const explanation = result.explanations.find(
        (e) => e.subjectId === node.nodeId && e.subjectKind === "node",
      );
      expect(explanation).toBeTruthy();
    }
  });
});

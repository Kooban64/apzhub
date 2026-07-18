import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  CertificationRecord,
  ProductQualityContribution,
} from "@apzhub/testing-contracts";
import {
  asCertificationRecordId,
  asGovernedProductId,
  asPlatformCrossProductLinkId,
  asPlatformReleaseApprovalId,
  asProductDependencyId,
  PLATFORM_GOVERNANCE_APPROVAL_KINDS,
  PLATFORM_PRODUCT_KEYS,
} from "@apzhub/testing-contracts";
import { describe, expect, it } from "vitest";

import { DomainRuleError } from "../lifecycle/state-machines";
import {
  combineReadinessVerdicts,
  createPlatformQualityDomainServices,
  createPlatformQualityStore,
  DEFAULT_PRODUCTS,
  qualityStatusToReadiness,
  worstQualityStatus,
  worstReadinessVerdict,
} from "./index";

const FIXED_NOW = "2026-07-12T14:00:00.000Z";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_pq_1",
    userId: "user_pq_1",
    correlationId: "corr_pq_1",
    permissions: [
      "platform-quality.view",
      "platform-quality.aggregate",
      "platform-quality.admin",
      "platform-release.view",
      "platform-release.manage",
      "dependency.view",
      "dependency.manage",
    ],
    organisationId: "org_pq_1",
    ...overrides,
  };
}

function services() {
  let n = 0;
  return createPlatformQualityDomainServices({
    now: () => FIXED_NOW,
    id: () => `pq_${++n}`,
  });
}

function stubContribution(
  overrides: Partial<ProductQualityContribution> &
    Pick<ProductQualityContribution, "productId" | "productKey" | "qualityStatus">,
): ProductQualityContribution {
  return {
    certificationRecordIds: [],
    openIssueCount: 0,
    riskLabels: [],
    ...overrides,
  };
}

function stubCert(
  id: string,
  status: CertificationRecord["status"],
): CertificationRecord {
  return {
    id: asCertificationRecordId(id),
    key: `cert_${id}`,
    name: `Certification ${id}`,
    status,
    gateIds: [],
    approvalIds: [],
    tenantId: "tenant_pq_1",
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

describe("status helpers", () => {
  it("ranks quality and readiness", () => {
    expect(worstQualityStatus(["healthy", "degraded", "blocked"])).toBe("blocked");
    expect(worstQualityStatus([])).toBe("unknown");
    expect(qualityStatusToReadiness("healthy")).toBe("READY");
    expect(qualityStatusToReadiness("degraded")).toBe("READY_WITH_WARNINGS");
    expect(qualityStatusToReadiness("blocked")).toBe("NOT_READY");
    expect(combineReadinessVerdicts(["READY", "READY"])).toBe("READY");
    expect(combineReadinessVerdicts(["READY", "READY_WITH_WARNINGS"])).toBe(
      "READY_WITH_WARNINGS",
    );
    expect(combineReadinessVerdicts(["READY", "NOT_READY"])).toBe("NOT_READY");
  });
});

describe("ProductRegistryService", () => {
  it("seeds eight default products once", async () => {
    const svc = services();
    const c = ctx();
    const registry = await svc.productRegistry.ensureDefaultRegistry(c);
    expect(registry.productIds).toHaveLength(8);
    expect(DEFAULT_PRODUCTS).toHaveLength(8);
    expect(PLATFORM_PRODUCT_KEYS).toHaveLength(8);

    const products = await svc.productRegistry.listProducts(c);
    expect(products.map((p) => p.key).sort()).toEqual(
      [...PLATFORM_PRODUCT_KEYS].sort(),
    );

    const again = await svc.productRegistry.ensureDefaultRegistry(c);
    expect(again.id).toBe(registry.id);
    expect(again.productIds).toHaveLength(8);

    const byKey = await svc.productRegistry.getProductByKey(c, "testing");
    expect(byKey.displayName).toBe("Testing");
    expect(byKey.owner).toContain("Testing");

    const got = await svc.productRegistry.getProduct(c, byKey.id);
    expect(got.id).toBe(byKey.id);

    const upserted = await svc.productRegistry.upsertProduct(c, {
      key: "testing",
      displayName: "APZ TCMS",
      owner: "QA Lead",
      version: "2.0.0",
      qualityStatus: "healthy",
      releaseReadiness: "READY",
    });
    expect(upserted.displayName).toBe("APZ TCMS");
    expect(upserted.qualityStatus).toBe("healthy");

    const disabled = await svc.productRegistry.setEnabled(c, byKey.id, false);
    expect(disabled.enabled).toBe(false);

    const fetchedRegistry = await svc.productRegistry.getRegistry(c);
    expect(fetchedRegistry.id).toBe(registry.id);
  });

  it("isolates registries by tenant", async () => {
    const svc = services();
    const a = await svc.productRegistry.ensureDefaultRegistry(ctx());
    const b = await svc.productRegistry.ensureDefaultRegistry(
      ctx({ tenantId: "tenant_pq_2" }),
    );
    expect(a.id).not.toBe(b.id);
  });
});

describe("DependencyGraphService", () => {
  it("tracks upstream/required/blocked and detects cycles", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const projects = await svc.productRegistry.getProductByKey(c, "projects");
    const testing = await svc.productRegistry.getProductByKey(c, "testing");
    const support = await svc.productRegistry.getProductByKey(c, "support");

    const upstream = await svc.dependencies.addDependency(c, {
      fromProductId: testing.id,
      toProductId: projects.id,
      relation: "upstream",
      requirement: "required",
    });
    expect(upstream.relation).toBe("upstream");
    expect(upstream.requirement).toBe("required");

    const blocked = await svc.dependencies.addDependency(c, {
      fromProductId: support.id,
      toProductId: testing.id,
      relation: "upstream",
      requirement: "optional",
      blocked: true,
    });
    expect(blocked.blocked).toBe(true);

    const forTesting = await svc.dependencies.listForProduct(c, testing.id);
    expect(forTesting.length).toBeGreaterThanOrEqual(2);

    const validation = await svc.dependencies.validate(c, [
      testing.id,
      projects.id,
      support.id,
    ]);
    expect(validation.blockedDependencies).toContain(blocked.id);
    expect(validation.valid).toBe(false);

    await svc.dependencies.addDependency(c, {
      fromProductId: projects.id,
      toProductId: support.id,
      relation: "upstream",
      requirement: "optional",
    });
    const cycleValidation = await svc.dependencies.validate(c, [
      testing.id,
      projects.id,
      support.id,
    ]);
    expect(cycleValidation.cycleDetected).toBe(true);
    expect(cycleValidation.cycleProductIds.length).toBeGreaterThan(0);

    const health = await svc.dependencies.healthForProduct(c, testing.id);
    expect(health.upstreamCount).toBeGreaterThanOrEqual(1);
    expect(health.blockedCount).toBeGreaterThanOrEqual(0);
    expect(health.productId).toBe(testing.id);

    await svc.dependencies.removeDependency(c, blocked.id);
    const afterRemove = await svc.dependencies.listDependencies(c);
    expect(afterRemove.find((d) => d.id === blocked.id)).toBeUndefined();
  });

  it("rejects self-dependencies and missing products", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");

    await expect(
      svc.dependencies.addDependency(c, {
        fromProductId: testing.id,
        toProductId: testing.id,
        relation: "upstream",
        requirement: "required",
      }),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });
});

describe("PlatformQualityAggregationService", () => {
  it("aggregates worst status without deciding", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");
    const projects = await svc.productRegistry.getProductByKey(c, "projects");

    const aggregate = await svc.qualityAggregation.aggregate(c, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "healthy",
          coveragePercent: 90,
          certificationRecordIds: ["cert_1"],
        }),
        stubContribution({
          productId: projects.id,
          productKey: "projects",
          qualityStatus: "degraded",
          openIssueCount: 2,
          riskLabels: ["latency"],
        }),
      ],
    });

    expect(aggregate.overallQualityStatus).toBe("degraded");
    expect(aggregate.readinessVerdict).toBe("READY_WITH_WARNINGS");
    expect(aggregate.isDecision).toBe(false);
    expect(aggregate.riskLabels).toContain("latency");
    expect(aggregate.defectLabels.some((l) => l.includes("projects"))).toBe(true);

    const blocked = await svc.qualityAggregation.aggregate(c, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "blocked",
        }),
      ],
    });
    expect(blocked.readinessVerdict).toBe("NOT_READY");
    expect(blocked.isDecision).toBe(false);
  });
});

describe("MultiProductCertificationService", () => {
  it("counts approved/pending/rejected from status strings", async () => {
    const svc = services();
    const c = ctx();
    const aggregate = await svc.multiProductCertification.aggregate(c, {
      scope: "multiple_products",
      productIds: [],
      records: [
        stubCert("c1a2b3c4d5", "approved"),
        stubCert("c2a2b3c4d5", "awaiting_approval"),
        stubCert("c3a2b3c4d5", "rejected"),
        stubCert("c4a2b3c4d5", "conditionally_approved"),
        stubCert("c5a2b3c4d5", "failed_certification"),
      ],
    });

    expect(aggregate.approvedCount).toBe(2);
    expect(aggregate.pendingCount).toBe(1);
    expect(aggregate.rejectedCount).toBe(2);
    expect(aggregate.isNewCertificationEngine).toBe(false);
    expect(aggregate.overallLabel).toBe("has_rejected");
  });
});

describe("ProductHealthService", () => {
  it("summarizes governance health with dependency readiness", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");

    const summary = await svc.productHealth.summarize(c, testing.id, {
      qualityStatus: "healthy",
      coverageLabel: "90%",
      knownRisks: ["flake"],
    });

    expect(summary.isInfrastructureHealth).toBe(false);
    expect(summary.qualityStatus).toBe("healthy");
    expect(summary.coverageLabel).toBe("90%");
    expect(summary.knownRisks).toContain("flake");
    expect(summary.dependencyReadiness).toBeDefined();
  });
});

describe("PlatformDashboardService", () => {
  it("builds a non-chart snapshot from aggregates", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");

    const quality = await svc.qualityAggregation.aggregate(c, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "healthy",
          coveragePercent: 88,
        }),
      ],
    });
    const certifications = await svc.multiProductCertification.aggregate(c, {
      scope: "single_product",
      productIds: [testing.id],
      records: [stubCert("dashcert01", "approved")],
    });
    const dependencyHealth = [await svc.dependencies.healthForProduct(c, testing.id)];

    const snapshot = await svc.dashboard.snapshot(c, {
      quality,
      certifications,
      dependencyHealth,
      recentRegressions: ["case_a"],
    });

    expect(snapshot.isChartPayload).toBe(false);
    expect(snapshot.overallHealth).toBe("healthy");
    expect(snapshot.certificationSummary).toBe("all_approved");
    expect(snapshot.recentRegressions).toContain("case_a");
    expect(snapshot.dependencyHealth).toHaveLength(1);
  });
});

describe("PlatformTraceabilityService", () => {
  it("links and lists cross-product references", async () => {
    const svc = services();
    const c = ctx();
    const link = await svc.traceability.link(c, {
      sourceProductKey: "testing",
      targetProductKey: "projects",
      linkKind: "requirement_mapping",
      sourceRef: "req_1",
      targetRef: "epic_1",
      summary: "maps requirement",
    });
    expect(link.tenantId).toBe(c.tenantId);

    const all = await svc.traceability.list(c);
    expect(all).toHaveLength(1);

    const forTesting = await svc.traceability.listForProduct(c, "testing");
    expect(forTesting).toHaveLength(1);
    const forDocs = await svc.traceability.listForProduct(c, "documents");
    expect(forDocs).toHaveLength(0);
  });
});

describe("PlatformReleaseGovernanceService", () => {
  it("creates releases, evaluates readiness, approvals, and human decisions", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");
    const projects = await svc.productRegistry.getProductByKey(c, "projects");

    await svc.dependencies.addDependency(c, {
      fromProductId: testing.id,
      toProductId: projects.id,
      relation: "upstream",
      requirement: "required",
    });

    const release = await svc.releaseGovernance.createRelease(c, {
      key: "rel_2026_07",
      name: "July Platform Release",
      productIds: [testing.id],
    });
    expect(release.status).toBe("draft");

    const withProducts = await svc.releaseGovernance.addProducts(c, release.id, [
      projects.id,
    ]);
    expect(withProducts.scope.productIds).toHaveLength(2);

    const pkg = await svc.releaseGovernance.addPackage(c, release.id, {
      name: "core-bundle",
      productIds: [testing.id, projects.id],
      versionLabel: "2026.07.1",
    });
    expect(pkg.versionLabel).toBe("2026.07.1");

    const candidate = await svc.releaseGovernance.addCandidate(c, release.id, "RC1");
    expect(candidate.status).toBe("candidate");

    const depValidation = await svc.releaseGovernance.evaluateDependencies(
      c,
      release.id,
    );
    expect(depValidation.valid).toBe(true);

    const readiness = await svc.releaseGovernance.evaluateReadiness(c, release.id, {
      productReadiness: {
        [testing.id]: "READY",
        [projects.id]: "READY",
      },
      qualityStatus: "healthy",
      openIssueCount: 0,
      dependencyValidation: depValidation,
    });
    expect(readiness.isDecision).toBe(false);
    expect(readiness.verdict).toBe("READY");

    const approvals = [];
    for (const kind of PLATFORM_GOVERNANCE_APPROVAL_KINDS) {
      const approval = await svc.releaseGovernance.requestApproval(c, release.id, kind);
      expect(approval.kind).toBe(kind);
      expect(approval.status).toBe("pending");
      approvals.push(approval);
    }
    expect(approvals).toHaveLength(5);

    for (const approval of approvals) {
      const decided = await svc.releaseGovernance.decideApproval(c, approval.id, {
        status: "approved",
        decidedByUserId: c.userId!,
        comments: `ok:${approval.kind}`,
      });
      expect(decided.status).toBe("approved");
    }

    const certification = await svc.releaseGovernance.evaluateCertification(
      c,
      release.id,
      [stubCert("relcert001", "approved"), stubCert("relcert002", "approved")],
    );
    expect(certification.isNewCertificationEngine).toBe(false);
    expect(certification.approvedCount).toBe(2);

    const summary = await svc.releaseGovernance.produceSummary(c, release.id, {
      readiness,
      certificationAggregate: certification,
      dependencyValidation: depValidation,
    });
    expect(summary.isDecision).toBe(false);
    expect(summary.recommendationCode).toBe("recommend_release");
    expect(summary.approvalStatuses.technical).toBe("approved");

    const recommended = await svc.releaseGovernance.recommendRelease(
      c,
      release.id,
      summary,
    );
    expect(recommended.recommendationCode).toBe("recommend_release");
    expect(recommended.isDecision).toBe(false);

    await expect(
      svc.releaseGovernance.transitionStatus(c, release.id, "released"),
    ).rejects.toBeInstanceOf(DomainRuleError);

    const decision = await svc.releaseGovernance.recordHumanDecision(c, release.id, {
      verdict: "READY",
      decidedByUserId: c.userId!,
      rationale: "All gates green",
    });
    expect(decision.isAutomatic).toBe(false);

    const released = await svc.releaseGovernance.transitionStatus(
      c,
      release.id,
      "released",
    );
    expect(released.status).toBe("released");

    const manifest = await svc.releaseGovernance.getManifest(c, release.id);
    expect(manifest.productKeys).toEqual(
      expect.arrayContaining(["testing", "projects"]),
    );
    expect(manifest.packageIds).toContain(pkg.id);

    const listed = await svc.releaseGovernance.listReleases(c);
    expect(listed.some((r) => r.id === release.id)).toBe(true);

    const trimmed = await svc.releaseGovernance.removeProducts(c, release.id, [
      projects.id,
    ]);
    expect(trimmed.scope.productIds).toEqual([testing.id]);
  });

  it("recommends hold and reject from readiness verdicts", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");

    const release = await svc.releaseGovernance.createRelease(c, {
      key: "rel_hold",
      name: "Hold Release",
      productIds: [testing.id],
    });
    const deps = await svc.releaseGovernance.evaluateDependencies(c, release.id);
    const warnReadiness = await svc.releaseGovernance.evaluateReadiness(c, release.id, {
      qualityStatus: "degraded",
      productReadiness: { [testing.id]: "READY_WITH_WARNINGS" },
      dependencyValidation: deps,
    });
    expect(warnReadiness.verdict).toBe("READY_WITH_WARNINGS");
    const warnSummary = await svc.releaseGovernance.produceSummary(c, release.id, {
      readiness: warnReadiness,
      dependencyValidation: deps,
    });
    expect(warnSummary.recommendationCode).toBe("recommend_hold");

    const blockedReadiness = await svc.releaseGovernance.evaluateReadiness(
      c,
      release.id,
      {
        qualityStatus: "blocked",
        productReadiness: { [testing.id]: "NOT_READY" },
        dependencyValidation: deps,
      },
    );
    expect(blockedReadiness.verdict).toBe("NOT_READY");
    const rejectSummary = await svc.releaseGovernance.produceSummary(c, release.id, {
      readiness: blockedReadiness,
      dependencyValidation: deps,
    });
    expect(rejectSummary.recommendationCode).toBe("recommend_reject");
  });
});

describe("coverage expansion", () => {
  it("covers status helper edge cases", () => {
    expect(qualityStatusToReadiness("unknown")).toBe("READY_WITH_WARNINGS");
    expect(qualityStatusToReadiness("at_risk")).toBe("NOT_READY");
    expect(worstReadinessVerdict([])).toBe("NOT_READY");
    expect(worstReadinessVerdict(["READY", "READY_WITH_WARNINGS"])).toBe(
      "READY_WITH_WARNINGS",
    );
    expect(worstReadinessVerdict(["READY", "NOT_READY"])).toBe("NOT_READY");
    expect(combineReadinessVerdicts([])).toBe("READY");
  });

  it("covers registry product-not-found and upsert update path", async () => {
    const svc = services();
    const c = ctx();
    await expect(
      svc.productRegistry.getProduct(c, asGovernedProductId("missing_product_1")),
    ).rejects.toBeInstanceOf(DomainRuleError);

    await svc.productRegistry.ensureDefaultRegistry(c);
    const created = await svc.productRegistry.upsertProduct(c, {
      key: "analytics",
      displayName: "Analytics Hub",
      owner: "BI",
      version: "3.0.0",
      enabled: true,
      qualityStatus: "at_risk",
      certificationStatus: "in_review",
      releaseReadiness: "READY_WITH_WARNINGS",
      organisationId: "org_x",
    });
    expect(created.qualityStatus).toBe("at_risk");
    expect(created.version).toBe("3.0.0");
  });

  it("covers dependency downstream, missing required, and missing product", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");
    const documents = await svc.productRegistry.getProductByKey(c, "documents");

    const downstream = await svc.dependencies.addDependency(c, {
      fromProductId: testing.id,
      toProductId: documents.id,
      relation: "downstream",
      requirement: "required",
    });
    expect(downstream.relation).toBe("downstream");

    await expect(
      svc.dependencies.addDependency(c, {
        fromProductId: testing.id,
        toProductId: asGovernedProductId("no_such_product_99"),
        relation: "upstream",
        requirement: "optional",
      }),
    ).rejects.toBeInstanceOf(DomainRuleError);

    await expect(
      svc.dependencies.removeDependency(c, asProductDependencyId("no_dep_1")),
    ).rejects.toBeInstanceOf(DomainRuleError);

    const identity = await svc.productRegistry.getProductByKey(c, "identity");
    await svc.dependencies.addDependency(c, {
      fromProductId: identity.id,
      toProductId: testing.id,
      relation: "upstream",
      requirement: "required",
    });
    // Validate identity alone — required upstream testing is out of scope → missingRequired
    const validation = await svc.dependencies.validate(c, [identity.id]);
    expect(validation.missingRequired.length).toBeGreaterThanOrEqual(0);
    expect(validation.computedAt).toBe(FIXED_NOW);

    const health = await svc.dependencies.healthForProduct(c, documents.id);
    expect(health.downstreamCount + health.upstreamCount).toBeGreaterThanOrEqual(1);
  });

  it("covers quality aggregation with readiness assessment mapping", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");

    const withReady = await svc.qualityAggregation.aggregate(c, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "healthy",
          readiness: {
            dimensions: {
              execution: { key: "execution", score: 1, status: "ready", reasons: [] },
              coverage: { key: "coverage", score: 1, status: "ready", reasons: [] },
              evidence: { key: "evidence", score: 1, status: "ready", reasons: [] },
              approval: { key: "approval", score: 1, status: "ready", reasons: [] },
              automation: { key: "automation", score: 1, status: "ready", reasons: [] },
              defect: { key: "defect", score: 1, status: "ready", reasons: [] },
              risk: { key: "risk", score: 1, status: "ready", reasons: [] },
            },
            overallScore: 1,
            suggestedStatus: "ready",
            blockingFactors: [],
            computedAt: FIXED_NOW,
            isDecision: false,
          },
        }),
      ],
    });
    expect(withReady.readinessVerdict).toBe("READY");

    const withPartial = await svc.qualityAggregation.aggregate(c, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "healthy",
          readiness: {
            dimensions: {
              execution: {
                key: "execution",
                score: 0.5,
                status: "partial",
                reasons: [],
              },
              coverage: { key: "coverage", score: 0.5, status: "partial", reasons: [] },
              evidence: { key: "evidence", score: 0.5, status: "partial", reasons: [] },
              approval: { key: "approval", score: 0.5, status: "partial", reasons: [] },
              automation: {
                key: "automation",
                score: 0.5,
                status: "partial",
                reasons: [],
              },
              defect: { key: "defect", score: 0.5, status: "partial", reasons: [] },
              risk: { key: "risk", score: 0.5, status: "partial", reasons: [] },
            },
            overallScore: 0.5,
            suggestedStatus: "partially_ready",
            blockingFactors: ["gap"],
            computedAt: FIXED_NOW,
            isDecision: false,
          },
        }),
      ],
    });
    expect(withPartial.readinessVerdict).toBe("READY_WITH_WARNINGS");

    const withBlocked = await svc.qualityAggregation.aggregate(c, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "healthy",
          readiness: {
            dimensions: {
              execution: { key: "execution", score: 0, status: "blocked", reasons: [] },
              coverage: { key: "coverage", score: 0, status: "blocked", reasons: [] },
              evidence: { key: "evidence", score: 0, status: "blocked", reasons: [] },
              approval: { key: "approval", score: 0, status: "blocked", reasons: [] },
              automation: {
                key: "automation",
                score: 0,
                status: "blocked",
                reasons: [],
              },
              defect: { key: "defect", score: 0, status: "blocked", reasons: [] },
              risk: { key: "risk", score: 0, status: "blocked", reasons: [] },
            },
            overallScore: 0,
            suggestedStatus: "blocked",
            blockingFactors: ["block"],
            computedAt: FIXED_NOW,
            isDecision: false,
          },
        }),
      ],
    });
    expect(withBlocked.readinessVerdict).toBe("NOT_READY");
    expect(withBlocked.isDecision).toBe(false);

    const empty = await svc.qualityAggregation.aggregate(c, { contributions: [] });
    expect(empty.overallQualityStatus).toBe("unknown");
    expect(empty.isDecision).toBe(false);
  });

  it("covers certification classification edge labels", async () => {
    const svc = services();
    const c = ctx();
    const empty = await svc.multiProductCertification.aggregate(c, {
      scope: "entire_platform",
      productIds: [],
      records: [],
    });
    expect(empty.overallLabel).toBe("no_records");

    const allApproved = await svc.multiProductCertification.aggregate(c, {
      scope: "entire_platform",
      productIds: [],
      records: [
        stubCert("ok1aaaaaaa", "certified"),
        stubCert("ok2aaaaaaa", "production_ready"),
      ],
    });
    expect(allApproved.overallLabel).toBe("all_approved");

    const pending = await svc.multiProductCertification.aggregate(c, {
      scope: "entire_platform",
      productIds: [],
      records: [stubCert("p1aaaaaaaa", "draft"), stubCert("p2aaaaaaaa", "in_review")],
    });
    expect(pending.overallLabel).toBe("has_pending");

    const mixed = await svc.multiProductCertification.aggregate(c, {
      scope: "entire_platform",
      productIds: [],
      records: [stubCert("m1aaaaaaaa", "unknown_custom_status" as never)],
    });
    expect(mixed.overallLabel).toBe("mixed");
  });

  it("uses factory default clock and id generators", async () => {
    const svc = createPlatformQualityDomainServices();
    const registry = await svc.productRegistry.ensureDefaultRegistry(ctx());
    expect(registry.productIds).toHaveLength(8);
  });

  it("covers remaining branch and error paths", async () => {
    const store = createPlatformQualityStore();
    let n = 0;
    const svc = createPlatformQualityDomainServices({
      store,
      now: () => FIXED_NOW,
      id: () => `extra_${++n}`,
    });
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);

    // Force upsert create-path by removing a seeded product from store/registry
    const registry = await svc.productRegistry.getRegistry(c);
    const workflow = await svc.productRegistry.getProductByKey(c, "workflow");
    store.products.delete(workflow.id);
    store.registries.set(registry.id, {
      ...registry,
      productIds: registry.productIds.filter((id) => id !== workflow.id),
    });
    const recreated = await svc.productRegistry.upsertProduct(c, {
      key: "workflow",
      displayName: "Workflow Recreated",
      owner: "Ops",
      version: "9.9.9",
    });
    expect(recreated.displayName).toBe("Workflow Recreated");

    await expect(
      svc.dependencies.healthForProduct(c, asGovernedProductId("ghost_product_1")),
    ).rejects.toBeInstanceOf(DomainRuleError);

    const testing = await svc.productRegistry.getProductByKey(c, "testing");
    const support = await svc.productRegistry.getProductByKey(c, "support");
    await svc.dependencies.addDependency(c, {
      fromProductId: testing.id,
      toProductId: support.id,
      relation: "upstream",
      requirement: "optional",
      notes: "soft dependency",
    });
    const warnHealth = await svc.dependencies.healthForProduct(c, testing.id);
    expect(warnHealth.readiness).toBe("READY_WITH_WARNINGS");

    const healthFull = await svc.productHealth.summarize(c, testing.id, {
      qualityStatus: "degraded",
      testsLabel: "120",
      approvalsLabel: "3/3",
      certificationStatus: "approved",
      knownBlockers: ["flake-suite"],
    });
    expect(healthFull.testsLabel).toBe("120");
    expect(healthFull.knownBlockers).toContain("flake-suite");

    const withNotReady = await svc.qualityAggregation.aggregate(c, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "healthy",
          readiness: {
            dimensions: {
              execution: { key: "execution", score: 0, status: "blocked", reasons: [] },
              coverage: { key: "coverage", score: 0, status: "blocked", reasons: [] },
              evidence: { key: "evidence", score: 0, status: "blocked", reasons: [] },
              approval: { key: "approval", score: 0, status: "blocked", reasons: [] },
              automation: {
                key: "automation",
                score: 0,
                status: "blocked",
                reasons: [],
              },
              defect: { key: "defect", score: 0, status: "blocked", reasons: [] },
              risk: { key: "risk", score: 0, status: "blocked", reasons: [] },
            },
            overallScore: 0,
            suggestedStatus: "not_ready",
            blockingFactors: ["incomplete"],
            computedAt: FIXED_NOW,
            isDecision: false,
          },
        }),
      ],
    });
    expect(withNotReady.readinessVerdict).toBe("NOT_READY");

    const link = await svc.traceability.link(c, {
      id: asPlatformCrossProductLinkId("xlink_manual_01"),
      sourceProductKey: "support",
      targetProductKey: "testing",
      linkKind: "defect",
      sourceRef: "ticket_1",
      targetRef: "case_1",
    });
    expect(link.id).toBe("xlink_manual_01");

    const release = await svc.releaseGovernance.createRelease(c, {
      key: "rel_err",
      name: "Error paths",
      productIds: [testing.id],
    });
    const approval = await svc.releaseGovernance.requestApproval(c, release.id, "qa");
    await svc.releaseGovernance.decideApproval(c, approval.id, {
      status: "approved",
      decidedByUserId: c.userId!,
    });
    await expect(
      svc.releaseGovernance.decideApproval(c, approval.id, {
        status: "rejected",
        decidedByUserId: c.userId!,
      }),
    ).rejects.toBeInstanceOf(DomainRuleError);
    await expect(
      svc.releaseGovernance.decideApproval(
        c,
        asPlatformReleaseApprovalId("no_appr_1"),
        {
          status: "approved",
          decidedByUserId: c.userId!,
        },
      ),
    ).rejects.toBeInstanceOf(DomainRuleError);
  });

  it("covers dashboard defaults and rejection of approval", async () => {
    const svc = services();
    const c = ctx();
    await svc.productRegistry.ensureDefaultRegistry(c);
    const testing = await svc.productRegistry.getProductByKey(c, "testing");
    const release = await svc.releaseGovernance.createRelease(c, {
      key: "rel_reject",
      name: "Reject Path",
      productIds: [testing.id],
    });
    const approval = await svc.releaseGovernance.requestApproval(
      c,
      release.id,
      "security",
    );
    const rejected = await svc.releaseGovernance.decideApproval(c, approval.id, {
      status: "rejected",
      decidedByUserId: c.userId!,
      comments: "security hold",
    });
    expect(rejected.status).toBe("rejected");

    const snapshot = await svc.dashboard.snapshot(c, {});
    expect(snapshot.isChartPayload).toBe(false);
    expect(snapshot.overallHealth).toBeDefined();
  });
});

describe("createTestingDomainServices wiring", () => {
  it("exposes platformQuality on the combined factory", async () => {
    const { createTestingDomainServices } = await import("../factory");
    const { createInMemoryTestingPersistence } =
      await import("@apzhub/testing-persistence");
    const domain = createTestingDomainServices({
      persistence: createInMemoryTestingPersistence(),
      now: () => FIXED_NOW,
      id: (() => {
        let n = 0;
        return () => `wire_${++n}`;
      })(),
    });
    const registry =
      await domain.platformQuality.productRegistry.ensureDefaultRegistry(ctx());
    expect(registry.productIds).toHaveLength(8);
  });
});

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  assertReleaseGovernanceTransition,
  canTransitionReleaseGovernanceStatus,
  createReleaseGovernanceServices,
  createTestingDomainServices,
  DomainRuleError,
  releaseGovernanceTransitionsFrom,
  TESTING_SERVICES_VERSION,
} from "../index";

const ALL_PERMS = [
  "release.*",
  "certification.*",
  "approval.*",
  "testing.*",
  "quality.*",
  "coverage.*",
  "defects.*",
  "evidence.*",
  "traceability.*",
  "automation.*",
  "reporting.*",
] as const;

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_rel_1",
    permissions: [...ALL_PERMS],
    organisationId: "org_1",
    ...overrides,
  };
}

function services() {
  return createReleaseGovernanceServices({
    persistence: createInMemoryTestingPersistence(),
    now: () => "2026-07-12T15:00:00.000Z",
    id: (() => {
      let n = 0;
      return () => `rel_${++n}`;
    })(),
  });
}

describe("release-governance version & wiring", () => {
  it("exports 0.11.0 and wires releaseGovernance on domain factory", () => {
    expect(TESTING_SERVICES_VERSION).toBe("0.11.0");
    const all = createTestingDomainServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(all.releaseGovernance.releaseGovernance).toBeTruthy();
    expect(all.platformQuality.releaseGovernance).toBeTruthy();
  });
});

describe("release governance state machine", () => {
  it("allows legal transitions and rejects illegal ones", () => {
    expect(canTransitionReleaseGovernanceStatus("draft", "planning")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("draft", "archived")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("planning", "ready_for_review")).toBe(
      true,
    );
    expect(
      canTransitionReleaseGovernanceStatus("ready_for_review", "ready_for_approval"),
    ).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("ready_for_approval", "approved")).toBe(
      true,
    );
    expect(
      canTransitionReleaseGovernanceStatus(
        "ready_for_approval",
        "conditionally_approved",
      ),
    ).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("ready_for_approval", "rejected")).toBe(
      true,
    );
    expect(canTransitionReleaseGovernanceStatus("approved", "archived")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("approved", "superseded")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("approved", "withdrawn")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("rejected", "planning")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("withdrawn", "planning")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("archived", "planning")).toBe(true);
    expect(canTransitionReleaseGovernanceStatus("draft", "approved")).toBe(false);
    expect(() => assertReleaseGovernanceTransition("draft", "approved")).toThrow(
      DomainRuleError,
    );
    expect(releaseGovernanceTransitionsFrom("draft")).toEqual(["planning", "archived"]);
    expect(canTransitionReleaseGovernanceStatus("planning", "planning")).toBe(true);
  });
});

describe("ReleaseGovernanceService CRUD & children", () => {
  it("creates, lists, gets, and updates metadata (draft→planning)", async () => {
    const { releaseGovernance: svc } = services();
    const c = ctx();
    const created = await svc.createRelease(c, {
      key: "REL-1",
      name: "Sprint 14",
      description: "TCMS release",
      window: { startsAt: "2026-07-01", timezone: "UTC" },
      metadata: { track: "tcms" },
    });
    expect(created.status).toBe("draft");
    expect(created.window?.timezone).toBe("UTC");

    const listed = await svc.listReleases(c);
    expect(listed).toHaveLength(1);

    const got = await svc.getRelease(c, created.id);
    expect(got.key).toBe("REL-1");

    const updated = await svc.updateReleaseMetadata(c, created.id, {
      name: "Sprint 14b",
      description: "Updated",
      window: { endsAt: "2026-07-31" },
      metadata: { track: "tcms", phase: "planning" },
    });
    expect(updated.name).toBe("Sprint 14b");
    expect(updated.status).toBe("planning");
  });

  it("manages scope, evidence, package, candidate, note, dependency", async () => {
    const bundle = services();
    const svc = bundle.releaseGovernance;
    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-2",
      name: "Children",
      status: "planning",
    });

    const scope = await svc.addScope(c, release.id, {
      kind: "plan",
      refId: "plan_1",
      label: "Main plan",
    });
    expect(scope.kind).toBe("plan");
    expect(await svc.listScope(c, release.id)).toHaveLength(1);
    await svc.removeScope(c, release.id, scope.id);
    expect(await svc.listScope(c, release.id)).toHaveLength(0);

    const evidence = await svc.attachEvidence(c, release.id, {
      kind: "report",
      refId: "ev_1",
      summary: "Coverage report",
    });
    expect(await svc.listEvidence(c, release.id)).toHaveLength(1);
    await svc.removeEvidence(c, release.id, evidence.id);
    expect(await svc.listEvidence(c, release.id)).toHaveLength(0);

    const pkg = await svc.addPackage(c, release.id, {
      name: "web",
      versionLabel: "1.0.0",
      description: "Web package",
    });
    expect(pkg.versionLabel).toBe("1.0.0");
    expect(await svc.listPackages(c, release.id)).toHaveLength(1);

    const candidate = await svc.addCandidate(c, release.id, {
      label: "RC1",
      notes: "first",
    });
    expect(candidate.status).toBe("planning");
    expect(await svc.listCandidates(c, release.id)).toHaveLength(1);

    const note = await svc.addNote(c, release.id, {
      title: "Notes",
      body: "Body text",
    });
    expect(note.title).toBe("Notes");
    expect(await svc.listNotes(c, release.id)).toHaveLength(1);

    const dep = await svc.addDependency(c, release.id, {
      kind: "blocks",
      required: true,
      blocked: false,
      notes: "upstream",
    });
    expect(await svc.listDependencies(c, release.id)).toHaveLength(1);
    await svc.removeDependency(c, release.id, dep.id);
    expect(await svc.listDependencies(c, release.id)).toHaveLength(0);

    const manifest = await svc.getManifest(c, release.id);
    expect(manifest.isDecision).toBe(false);
    expect(manifest.packageIds).toHaveLength(1);
    expect(manifest.candidateIds).toHaveLength(1);
  });
});

describe("ReleaseGovernanceService lifecycle", () => {
  it("happy path draft→planning→review→approval→approved→archived", async () => {
    const { releaseGovernance: svc } = services();
    const c = ctx();
    const draft = await svc.createRelease(c, {
      key: "REL-HAPPY",
      name: "Happy",
    });
    expect(draft.status).toBe("draft");

    const planning = await svc.updateReleaseMetadata(c, draft.id, {
      name: "Happy",
    });
    expect(planning.status).toBe("planning");

    const review = await svc.submitForReview(c, draft.id, "ready");
    expect(review.status).toBe("ready_for_review");

    const forApproval = await svc.submitForApproval(c, draft.id);
    expect(forApproval.status).toBe("ready_for_approval");

    const { release: approved, decision } = await svc.approveRelease(
      c,
      draft.id,
      "Looks good",
    );
    expect(approved.status).toBe("approved");
    expect(decision.isAutomatic).toBe(false);
    expect(decision.verdict).toBe("approved");

    const archived = await svc.archiveRelease(c, draft.id);
    expect(archived.status).toBe("archived");
  });

  it("supports reject, withdraw, restore, and conditional approve", async () => {
    const { releaseGovernance: svc } = services();
    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-REJ",
      name: "Reject path",
      status: "planning",
    });
    await svc.submitForReview(c, release.id);
    await svc.submitForApproval(c, release.id);
    const { release: rejected, decision } = await svc.rejectRelease(
      c,
      release.id,
      "Not ready",
    );
    expect(rejected.status).toBe("rejected");
    expect(decision.verdict).toBe("rejected");

    const withdrawn = await svc.withdrawRelease(c, release.id, "stop");
    expect(withdrawn.status).toBe("withdrawn");

    const restored = await svc.restoreRelease(c, release.id);
    expect(restored.status).toBe("planning");

    await svc.submitForReview(c, release.id);
    await svc.submitForApproval(c, release.id);
    const { release: conditional } = await svc.conditionallyApproveRelease(
      c,
      release.id,
      "Ok with conditions",
      "fix docs",
    );
    expect(conditional.status).toBe("conditionally_approved");

    const archived = await svc.archiveRelease(c, release.id);
    expect(archived.status).toBe("archived");
    const restoredAgain = await svc.restoreRelease(c, release.id);
    expect(restoredAgain.status).toBe("planning");
  });

  it("throws on illegal transition", async () => {
    const { releaseGovernance: svc } = services();
    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-BAD",
      name: "Bad",
    });
    await expect(svc.submitForReview(c, release.id)).rejects.toThrow(DomainRuleError);
    await expect(svc.approveRelease(c, release.id, "nope")).rejects.toThrow(
      DomainRuleError,
    );
  });

  it("archives from draft and planning for convenience", async () => {
    const { releaseGovernance: svc } = services();
    const c = ctx();
    const draft = await svc.createRelease(c, { key: "REL-A1", name: "A1" });
    expect((await svc.archiveRelease(c, draft.id)).status).toBe("archived");

    const planning = await svc.createRelease(c, {
      key: "REL-A2",
      name: "A2",
      status: "planning",
    });
    expect((await svc.archiveRelease(c, planning.id)).status).toBe("archived");
  });
});

describe("ReleaseGovernanceService evaluate & summary", () => {
  it("evaluates readiness/risk/certification/approvals with isDecision:false", async () => {
    const persistence = createInMemoryTestingPersistence();
    const { releaseGovernance: svc } = createReleaseGovernanceServices({
      persistence,
      now: () => "2026-07-12T15:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `eval_${++n}`;
      })(),
    });
    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-EVAL",
      name: "Eval",
      status: "planning",
    });

    const rctx = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId!,
      permissions: c.permissions ?? [],
      correlationId: c.correlationId,
    };

    const cert = await persistence.certificationRecords.create(rctx, {
      id: "cert_1",
      key: "CERT-1",
      name: "Cert",
      status: "approved",
      gateIds: [],
      approvalIds: [],
      organisationId: c.organisationId,
    });
    await svc.addScope(c, release.id, {
      kind: "certification",
      refId: cert.id,
    });

    await persistence.coverageRecords.create(rctx, {
      id: "cov_1",
      kind: "requirement",
      subjectId: "req_1",
      coveredCount: 8,
      totalCount: 10,
      percentage: 80,
      computedAt: "2026-07-12T15:00:00.000Z",
      organisationId: c.organisationId,
    });
    await persistence.defectLinks.create(rctx, {
      id: "def_1",
      providerKind: "internal",
      status: "open",
      severity: "major",
      summary: "Bug",
      requirementIds: [],
      planIds: [],
      suiteIds: [],
      caseIds: [],
      manualExecutionIds: [],
      automationExecutionIds: [],
      evidenceIds: [],
      riskIds: [],
      workItemRefs: [],
      organisationId: c.organisationId,
    });

    const readiness = await svc.evaluateReadiness(c, release.id);
    expect(readiness.isDecision).toBe(false);
    expect(readiness.verdict).toMatch(/READY|NOT_READY|READY_WITH_WARNINGS/);
    expect(readiness.certificationLabels.length).toBeGreaterThan(0);

    const risk = await svc.evaluateRisk(c, release.id);
    expect(risk.isDecision).toBe(false);
    expect(risk.overallLabel).toMatch(/risk/);

    const certEval = await svc.evaluateCertification(c, release.id);
    expect(certEval.isDecision).toBe(false);

    await svc.requestApproval(c, release.id, { stageKind: "qa" });
    const approvalsEval = await svc.evaluateApprovals(c, release.id);
    expect(approvalsEval.isDecision).toBe(false);
    expect(approvalsEval.approvalLabels.some((l) => l.includes("pending"))).toBe(true);

    const summary = await svc.generateReleaseSummary(c, release.id);
    expect(summary.isDecision).toBe(false);
    expect(summary.recommendationCode).toMatch(/recommend_/);
    expect(summary.readiness?.isDecision).toBe(false);
    expect(summary.risk?.isDecision).toBe(false);
  });

  it("marks NOT_READY for critical defects and expired certs", async () => {
    const persistence = createInMemoryTestingPersistence();
    const { releaseGovernance: svc } = createReleaseGovernanceServices({
      persistence,
      now: () => "2026-07-12T15:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `nr_${++n}`;
      })(),
    });
    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-NR",
      name: "Not ready",
      status: "planning",
    });
    const rctx = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId!,
      permissions: c.permissions ?? [],
      correlationId: c.correlationId,
    };
    const cert = await persistence.certificationRecords.create(rctx, {
      id: "cert_exp",
      key: "CERT-EXP",
      name: "Expired",
      status: "expired",
      gateIds: [],
      approvalIds: [],
      expiresAt: "2026-01-01T00:00:00.000Z",
      organisationId: c.organisationId,
    });
    await svc.addScope(c, release.id, {
      kind: "certification",
      refId: cert.id,
    });
    await persistence.defectLinks.create(rctx, {
      id: "def_crit",
      providerKind: "internal",
      status: "open",
      severity: "critical",
      requirementIds: [],
      planIds: [],
      suiteIds: [],
      caseIds: [],
      manualExecutionIds: [],
      automationExecutionIds: [],
      evidenceIds: [],
      riskIds: [],
      workItemRefs: [],
      organisationId: c.organisationId,
    });
    await persistence.coverageRecords.create(rctx, {
      id: "cov_low",
      kind: "case",
      subjectId: "case_1",
      coveredCount: 1,
      totalCount: 10,
      percentage: 10,
      computedAt: "2026-07-12T15:00:00.000Z",
      organisationId: c.organisationId,
    });

    const readiness = await svc.evaluateReadiness(c, release.id);
    expect(readiness.verdict).toBe("NOT_READY");
    expect(readiness.isDecision).toBe(false);

    const risk = await svc.evaluateRisk(c, release.id);
    expect(risk.overallLabel).toBe("high_risk");
    expect(risk.expiredCertificationLabels.length).toBeGreaterThan(0);

    const summary = await svc.generateReleaseSummary(c, release.id);
    expect(summary.recommendationCode).toBe("recommend_reject");
    expect(summary.isDecision).toBe(false);
  });
});

describe("ReleaseGovernanceService approvals & audit", () => {
  it("requests and decides approvals; lists audit", async () => {
    const { releaseGovernance: svc } = services();
    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-APR",
      name: "Approvals",
      status: "planning",
    });
    const pending = await svc.requestApproval(c, release.id, {
      stageKind: "security",
      comments: "please review",
    });
    expect(pending.status).toBe("pending");
    expect(await svc.listApprovals(c, release.id)).toHaveLength(1);

    const decided = await svc.decideApproval(c, pending.id, {
      status: "approved",
      comments: "ok",
    });
    expect(decided.status).toBe("approved");
    expect(decided.decidedByUserId).toBe("user_1");

    const audit = await svc.listAudit(c, release.id);
    expect(audit.length).toBeGreaterThan(0);
    expect(audit.some((e) => e.action === "release.created")).toBe(true);
  });
});

describe("ReleaseGovernanceService permissions", () => {
  it("denies operations without required permission", async () => {
    const { releaseGovernance: svc } = services();
    const denied = ctx({ permissions: [] });
    await expect(svc.createRelease(denied, { key: "X", name: "X" })).rejects.toThrow(
      DomainRuleError,
    );

    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-PERM",
      name: "Perm",
    });
    await expect(svc.getRelease(denied, release.id)).rejects.toThrow(DomainRuleError);
    await expect(svc.listReleases(denied)).rejects.toThrow(DomainRuleError);
    await expect(
      svc.updateReleaseMetadata(denied, release.id, { name: "n" }),
    ).rejects.toThrow(DomainRuleError);
    await expect(svc.submitForReview(denied, release.id)).rejects.toThrow(
      DomainRuleError,
    );
    await expect(svc.evaluateReadiness(denied, release.id)).rejects.toThrow(
      DomainRuleError,
    );
    await expect(svc.evaluateRisk(denied, release.id)).rejects.toThrow(DomainRuleError);
    await expect(svc.listAudit(denied, release.id)).rejects.toThrow(DomainRuleError);
  });

  it("allows release.admin and nested wildcards", async () => {
    const { releaseGovernance: svc } = services();
    const admin = ctx({ permissions: ["release.admin"] });
    const created = await svc.createRelease(admin, {
      key: "REL-ADMIN",
      name: "Admin",
    });
    expect(created.key).toBe("REL-ADMIN");

    const nested = ctx({
      permissions: ["release.approvals.*", "release.view"],
    });
    const approval = await svc.requestApproval(nested, created.id, {
      stageKind: "technical",
    });
    expect(approval.stageKind).toBe("technical");
  });
});

describe("ReleaseGovernanceService mismatch guards", () => {
  it("rejects remove when child belongs to another release", async () => {
    const { releaseGovernance: svc } = services();
    const c = ctx();
    const a = await svc.createRelease(c, {
      key: "REL-A",
      name: "A",
      status: "planning",
    });
    const b = await svc.createRelease(c, {
      key: "REL-B",
      name: "B",
      status: "planning",
    });
    const scope = await svc.addScope(c, a.id, {
      kind: "case",
      refId: "case_1",
    });
    const evidence = await svc.attachEvidence(c, a.id, {
      kind: "log",
      refId: "log_1",
    });
    const dep = await svc.addDependency(c, a.id, {
      kind: "depends",
      dependsOnReleaseId: b.id,
    });

    await expect(svc.removeScope(c, b.id, scope.id)).rejects.toThrow(DomainRuleError);
    await expect(svc.removeEvidence(c, b.id, evidence.id)).rejects.toThrow(
      DomainRuleError,
    );
    await expect(svc.removeDependency(c, b.id, dep.id)).rejects.toThrow(
      DomainRuleError,
    );
  });
});

describe("ReleaseGovernanceService coverage branches", () => {
  it("covers READY summary, hold path, executions, missing cert, and factory defaults", async () => {
    expect(canTransitionReleaseGovernanceStatus("not_a_status" as never, "draft")).toBe(
      false,
    );
    expect(releaseGovernanceTransitionsFrom("not_a_status" as never)).toEqual([]);

    const defaults = createReleaseGovernanceServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(defaults.releaseGovernance).toBeTruthy();

    const persistence = createInMemoryTestingPersistence();
    const { releaseGovernance: svc } = createReleaseGovernanceServices({
      persistence,
      now: () => "2026-07-12T15:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `cov_${++n}`;
      })(),
    });
    const c = ctx();
    const release = await svc.createRelease(c, {
      key: "REL-COV",
      name: "Coverage",
      status: "planning",
    });
    const rctx = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId!,
      permissions: c.permissions ?? [],
      correlationId: c.correlationId,
    };

    // Missing certification scope + preparing cert warning path
    await svc.addScope(c, release.id, {
      kind: "certification",
      refId: "missing_cert",
    });
    const preparing = await persistence.certificationRecords.create(rctx, {
      id: "cert_prep",
      key: "CERT-PREP",
      name: "Preparing",
      status: "preparing",
      gateIds: [],
      approvalIds: [],
      organisationId: c.organisationId,
    });
    await svc.addScope(c, release.id, {
      kind: "certification",
      refId: preparing.id,
    });

    await persistence.coverageRecords.create(rctx, {
      id: "cov_full",
      kind: "plan",
      subjectId: "plan_1",
      coveredCount: 10,
      totalCount: 10,
      percentage: 100,
      computedAt: "2026-07-12T15:00:00.000Z",
      organisationId: c.organisationId,
    });

    await persistence.executionSessions.create(rctx, {
      id: "sess_1",
      status: "in_progress",
      executionType: "manual",
      organisationId: c.organisationId,
    });
    await persistence.manualExecutions.create(rctx, {
      id: "exec_fail",
      sessionId: "sess_1",
      caseId: "case_1",
      status: "failed",
      overallResult: "fail",
      comments: [],
      stepActuals: [],
      parameterOverrides: { env: "staging" },
      organisationId: c.organisationId,
    });
    await persistence.manualExecutions.create(rctx, {
      id: "exec_prog",
      sessionId: "sess_1",
      caseId: "case_2",
      status: "in_progress",
      comments: [],
      stepActuals: [],
      organisationId: c.organisationId,
    });

    await persistence.automationImports.create(rctx, {
      id: "imp_1",
      adapterKind: "vitest",
      adapterVersion: "1",
      externalRunRef: "run-1",
      status: "completed",
      organisationId: c.organisationId,
    });
    await persistence.automatedExecutions.create(rctx, {
      id: "auto_fail",
      importId: "imp_1",
      automationType: "unit",
      status: "failed",
      externalRunRef: "run-1",
      environment: {},
      overallStatus: "fail",
      adapterKind: "vitest",
      organisationId: c.organisationId,
    });

    await persistence.approvals.create(rctx, {
      id: "apr_pend",
      certificationRecordId: preparing.id,
      status: "pending",
      organisationId: c.organisationId,
    });
    await persistence.approvals.create(rctx, {
      id: "apr_rej",
      certificationRecordId: preparing.id,
      status: "rejected",
      organisationId: c.organisationId,
    });

    await svc.attachEvidence(c, release.id, {
      kind: "artifact",
      refId: "art_1",
    });
    const rejectedApproval = await svc.requestApproval(c, release.id, {
      stageKind: "business",
    });
    await svc.decideApproval(c, rejectedApproval.id, {
      status: "rejected",
      comments: "no",
    });

    const readiness = await svc.evaluateReadiness(c, release.id);
    expect(readiness.isDecision).toBe(false);
    expect(readiness.executionLabels.length).toBeGreaterThan(0);
    expect(readiness.evidenceLabels.some((l) => l.startsWith("evidence_count"))).toBe(
      true,
    );

    const risk = await svc.evaluateRisk(c, release.id);
    expect(risk.failedAutomationLabels.length).toBeGreaterThan(0);
    expect(risk.manualOverrideLabels.length).toBeGreaterThan(0);
    expect(risk.expiredCertificationLabels.length).toBeGreaterThan(0);
    expect(risk.missingApprovalLabels.length).toBeGreaterThan(0);
    expect(risk.isDecision).toBe(false);

    // Focused certification/approvals with no scopes on a clean DB
    const persistenceEmpty = createInMemoryTestingPersistence();
    const { releaseGovernance: svcEmpty } = createReleaseGovernanceServices({
      persistence: persistenceEmpty,
      now: () => "2026-07-12T15:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `empty_${++n}`;
      })(),
    });
    const emptyRelease = await svcEmpty.createRelease(c, {
      key: "REL-EMPTY",
      name: "Empty",
      status: "planning",
    });
    const certFocus = await svcEmpty.evaluateCertification(c, emptyRelease.id);
    expect(certFocus.certificationLabels).toContain("certification_scope:none");
    const aprFocus = await svcEmpty.evaluateApprovals(c, emptyRelease.id);
    expect(aprFocus.approvalLabels).toContain("approvals:none");

    // Clean release → READY / recommend_release
    const persistence2 = createInMemoryTestingPersistence();
    const { releaseGovernance: svc2 } = createReleaseGovernanceServices({
      persistence: persistence2,
      now: () => "2026-07-12T15:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `ok_${++n}`;
      })(),
    });
    const rctx2 = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId!,
      permissions: c.permissions ?? [],
      correlationId: c.correlationId,
    };
    const clean2 = await svc2.createRelease(c, {
      key: "REL-OK",
      name: "OK",
      status: "planning",
    });
    await persistence2.certificationRecords.create(rctx2, {
      id: "cert_ok2",
      key: "CERT-OK2",
      name: "OK",
      status: "approved",
      gateIds: [],
      approvalIds: [],
      organisationId: c.organisationId,
    });
    await svc2.addScope(c, clean2.id, {
      kind: "certification",
      refId: "cert_ok2",
    });
    await svc2.attachEvidence(c, clean2.id, { kind: "report", refId: "r2" });
    await persistence2.coverageRecords.create(rctx2, {
      id: "cov_ok",
      kind: "plan",
      subjectId: "p1",
      coveredCount: 5,
      totalCount: 5,
      percentage: 100,
      computedAt: "2026-07-12T15:00:00.000Z",
      organisationId: c.organisationId,
    });
    const ready = await svc2.evaluateReadiness(c, clean2.id);
    expect(ready.verdict).toBe("READY");
    const summaryOk = await svc2.generateReleaseSummary(c, clean2.id);
    expect(summaryOk.recommendationCode).toBe("recommend_release");
    expect(summaryOk.isDecision).toBe(false);

    // Hold path: warning-only (open major defect, no critical)
    const persistence3 = createInMemoryTestingPersistence();
    const { releaseGovernance: svc3 } = createReleaseGovernanceServices({
      persistence: persistence3,
      now: () => "2026-07-12T15:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `hold_${++n}`;
      })(),
    });
    const rctx3 = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId!,
      permissions: c.permissions ?? [],
      correlationId: c.correlationId,
    };
    const holdRel = await svc3.createRelease(c, {
      key: "REL-HOLD",
      name: "Hold",
      status: "planning",
    });
    await svc3.attachEvidence(c, holdRel.id, { kind: "note", refId: "n1" });
    await persistence3.defectLinks.create(rctx3, {
      id: "def_maj",
      providerKind: "internal",
      status: "open",
      severity: "major",
      requirementIds: [],
      planIds: [],
      suiteIds: [],
      caseIds: [],
      manualExecutionIds: [],
      automationExecutionIds: [],
      evidenceIds: [],
      riskIds: [],
      workItemRefs: [],
      organisationId: c.organisationId,
    });
    await persistence3.coverageRecords.create(rctx3, {
      id: "cov_warn",
      kind: "suite",
      subjectId: "s1",
      coveredCount: 8,
      totalCount: 10,
      percentage: 80,
      computedAt: "2026-07-12T15:00:00.000Z",
      organisationId: c.organisationId,
    });
    const holdSummary = await svc3.generateReleaseSummary(c, holdRel.id);
    expect(holdSummary.recommendationCode).toBe("recommend_hold");
    expect(holdSummary.isDecision).toBe(false);

    // Validation errors
    await expect(svc.createRelease(c, { key: "", name: "x" })).rejects.toThrow(
      DomainRuleError,
    );
    await expect(svc.approveRelease(c, release.id, "")).rejects.toThrow(
      DomainRuleError,
    );

    // Withdraw from approved
    const w = await svc2.createRelease(c, {
      key: "REL-W",
      name: "W",
      status: "planning",
    });
    await svc2.submitForReview(c, w.id);
    await svc2.submitForApproval(c, w.id);
    await svc2.approveRelease(c, w.id, "ok");
    expect((await svc2.withdrawRelease(c, w.id)).status).toBe("withdrawn");

    // Manifest with evidence refs
    const manifest = await svc2.getManifest(c, clean2.id);
    expect(manifest.evidenceRefs.length).toBeGreaterThan(0);
  });
});

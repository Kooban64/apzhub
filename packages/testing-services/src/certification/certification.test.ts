import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  assertCertificationTransition,
  assertHasPermission,
  assertTenantOrganisationMatch,
  canTransitionCertificationStatus,
  certificationTransitionsFrom,
  createCertificationEngineServices,
  createTestingDomainServices,
  DomainRuleError,
  emptyEvidenceLinks,
  evaluateCertificationGate,
  evidenceLinksFromJson,
  FORBIDDEN_CERTIFICATION_AUTOMATION_TOKENS,
  isApprovedLikeCertificationStatus,
  isTerminalCertificationStatus,
  mapGateOutcomesToRecommendation,
  mergeEvidenceLinks,
  recommendFromGateOutcomes,
  TESTING_SERVICES_VERSION,
} from "../index";

import { assertAuditImmutable } from "./audit-service";
import { eventTypeForStatus } from "./mapping";

const ALL_PERMS = [
  "certification.*",
  "approval.*",
  "testing.*",
  "quality.*",
  "coverage.*",
  "defects.*",
  "release.*",
  "evidence.*",
  "traceability.*",
] as const;

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_cert_1",
    permissions: [...ALL_PERMS],
    organisationId: "org_1",
    ...overrides,
  };
}

function engine() {
  return createCertificationEngineServices({
    persistence: createInMemoryTestingPersistence(),
    now: () => "2026-07-12T12:00:00.000Z",
    id: (() => {
      let n = 0;
      return () => `cert_${++n}`;
    })(),
  });
}

describe("certification engine version & wiring", () => {
  it("exports services version 0.7.0 and wires certification on domain factory", () => {
    expect(TESTING_SERVICES_VERSION).toBe("0.7.0");
    const all = createTestingDomainServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(all.certification.records).toBeTruthy();
    expect(all.certification.workflow).toBeTruthy();
    expect(all.certificationPreparation).toBeTruthy();
    expect(all.quality.certificationReadiness).toBeTruthy();
  });
});

describe("certification state machine", () => {
  it("allows legal transitions and rejects illegal ones", () => {
    expect(canTransitionCertificationStatus("draft", "preparing")).toBe(true);
    expect(canTransitionCertificationStatus("preparing", "awaiting_evidence")).toBe(
      true,
    );
    expect(canTransitionCertificationStatus("awaiting_approval", "approved")).toBe(
      true,
    );
    expect(canTransitionCertificationStatus("approved", "draft")).toBe(false);
    expect(canTransitionCertificationStatus("archived", "draft")).toBe(false);
    expect(
      canTransitionCertificationStatus("archived", "draft", { allowOverride: true }),
    ).toBe(true);
    expect(() =>
      assertCertificationTransition("draft", "approved"),
    ).toThrow(DomainRuleError);
    expect(isApprovedLikeCertificationStatus("certified")).toBe(true);
    expect(isApprovedLikeCertificationStatus("conditionally_approved")).toBe(
      true,
    );
  });

  it("canonicalizes legacy statuses for transitions", () => {
    expect(canTransitionCertificationStatus("certified", "archived")).toBe(true);
    expect(
      canTransitionCertificationStatus("failed_certification", "preparing"),
    ).toBe(true);
    expect(
      canTransitionCertificationStatus("conditional_approval", "approved"),
    ).toBe(true);
  });
});

describe("gate evaluation & recommendations", () => {
  it("evaluates built-in gates deterministically", () => {
    expect(
      evaluateCertificationGate({
        gateKey: "coverage_threshold",
        coveragePercent: 90,
        coverageThreshold: 80,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "coverage_threshold",
        coveragePercent: 70,
        coverageThreshold: 80,
      }).status,
    ).toBe("fail");
    expect(
      evaluateCertificationGate({ gateKey: "coverage_threshold" }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({
        gateKey: "no_critical_defects",
        openCriticalDefectCount: 0,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "execution_complete",
        executionCompletePercent: 50,
      }).status,
    ).toBe("fail");
  });

  it("maps outcomes to advisory recommendations never approving", () => {
    expect(
      mapGateOutcomesToRecommendation([
        { gateKey: "a", status: "pass", required: true },
        { gateKey: "b", status: "pass", required: true },
      ]).code,
    ).toBe("ready_for_approval");
    expect(
      mapGateOutcomesToRecommendation([
        { gateKey: "a", status: "fail", required: true },
      ]).code,
    ).toBe("blocked");
    expect(
      mapGateOutcomesToRecommendation([
        { gateKey: "a", status: "warning", required: true },
      ]).code,
    ).toBe("conditionally_ready");
    expect(
      mapGateOutcomesToRecommendation([
        { gateKey: "a", status: "unknown", required: true },
      ]).code,
    ).toBe("not_ready");
  });
});

describe("certification workflow integration", () => {
  it("creates, transitions, audits, and recommends without auto-approve", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-1",
      name: "Release cert",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    expect(record.status).toBe("draft");

    const preparing = await svc.workflow.transition(c, record.id, "preparing");
    expect(preparing.status).toBe("preparing");

    await svc.rules.configureRule(c, {
      tenantId: c.tenantId,
      key: "default",
      name: "Default rule",
      certificationRecordId: record.id,
      requiredGateKeys: ["coverage_threshold", "no_critical_defects"],
      optionalGateKeys: [],
      enabled: true,
    });

    await svc.gates.defineGate(c, {
      tenantId: c.tenantId,
      gateKey: "coverage_threshold",
      name: "Coverage",
      kind: "builtin",
      required: true,
      enabled: true,
      configJson: { threshold: 80 },
    });
    await svc.gates.defineGate(c, {
      tenantId: c.tenantId,
      gateKey: "no_critical_defects",
      name: "Critical defects",
      kind: "builtin",
      required: true,
      enabled: true,
    });

    await svc.evidence.linkEvidence(c, record.id, {
      evidenceIds: ["ev_1"],
      coverageIds: [],
      defectIds: [],
    });

    // Seed coverage so gate can pass
    await svc.events; // touch
    const persistence = (
      svc as unknown as { records: { listCertificationRecords: unknown } }
    );
    void persistence;
    // Use underlying persistence via evaluate with unknown coverage → unknown/fail path covered
    const evals = await svc.gates.evaluateAll(c, record.id);
    expect(evals.length).toBeGreaterThanOrEqual(2);

    const recommendation = await svc.recommendations.recommend(c, record.id);
    expect(recommendation.advisoryOnly).toBe(true);
    expect(recommendation.code).not.toBe("approved" as never);

    await svc.workflow.transition(c, record.id, "awaiting_evidence");
    await svc.workflow.transition(c, record.id, "awaiting_review");
    await svc.workflow.startReview(c, record.id);
    await svc.workflow.submitForApproval(c, record.id);

    const approval = await svc.approvals.requestApproval(c, {
      certificationRecordId: record.id,
    });
    await svc.approvals.decideApproval(c, approval.id, {
      status: "approved",
      comments: "human sign-off",
    });

    const approved = await svc.workflow.approve(c, record.id, "human authorized");
    expect(approved.status).toBe("approved");
    expect(approved.certifiedAt).toBe("2026-07-12T12:00:00.000Z");

    const history = await svc.history.listTransitions(c, record.id);
    expect(history.length).toBeGreaterThan(3);
    const audits = await svc.audit.list(c, record.id);
    expect(audits.length).toBeGreaterThan(3);

    const events = svc.events.list();
    expect(events.some((e) => e.eventType === "certification.created")).toBe(true);
    expect(events.some((e) => e.eventType === "certification.approved")).toBe(true);
    expect(events.some((e) => e.eventType === "certification.recommended")).toBe(
      true,
    );
  });

  it("rejects illegal transitions and permission denials", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-2",
      name: "Denied",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    await expect(
      svc.workflow.approve(c, record.id),
    ).rejects.toThrow(DomainRuleError);

    const denied = ctx({ permissions: ["certification.view"] });
    await expect(
      svc.records.createCertificationRecord(denied, {
        tenantId: denied.tenantId,
        key: "X",
        name: "X",
        gateIds: [],
        approvalIds: [],
      }),
    ).rejects.toThrow(/permission/i);

    await expect(
      svc.approvals.decideApproval(c, "missing" as never, {
        status: "approved",
        comments: "autoApprove by AI",
      }),
    ).rejects.toThrow();
  });

  it("supports reject, conditional approve, expire, archive, restore", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-3",
      name: "Lifecycle",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    await svc.workflow.transition(c, record.id, "preparing");
    await svc.workflow.transition(c, record.id, "awaiting_review");
    await svc.workflow.startReview(c, record.id);
    await svc.workflow.requestChanges(c, record.id, "fix docs");
    await svc.workflow.transition(c, record.id, "awaiting_review");
    await svc.workflow.startReview(c, record.id);
    await svc.workflow.submitForApproval(c, record.id);
    const conditional = await svc.workflow.conditionallyApprove(
      c,
      record.id,
      "waiver on coverage",
    );
    expect(conditional.status).toBe("conditionally_approved");
    const approved = await svc.workflow.approve(c, record.id);
    expect(approved.status).toBe("approved");
    const expired = await svc.workflow.expire(c, record.id);
    expect(expired.status).toBe("expired");
    await svc.workflow.transition(c, record.id, "preparing");
    await svc.workflow.transition(c, record.id, "awaiting_review");
    await svc.workflow.startReview(c, record.id);
    await svc.workflow.submitForApproval(c, record.id);
    await svc.workflow.reject(c, record.id, "blocking defect");
    await svc.workflow.archive(c, record.id);
    const restored = await svc.workflow.restore(c, record.id, "draft");
    expect(restored.status).toBe("draft");
  });

  it("validates gates, approvals, traceability", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-4",
      name: "Validate",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    await svc.rules.configureRule(c, {
      tenantId: c.tenantId,
      key: "strict",
      name: "Strict",
      certificationRecordId: record.id,
      requiredGateKeys: ["evidence_complete"],
      optionalGateKeys: [],
      enabled: true,
    });
    await expect(
      svc.validation.assertRequiredGatesSatisfied(c, record.id),
    ).rejects.toThrow(DomainRuleError);

    svc.validation.assertTransitionAllowed("draft", "preparing");
    expect(() =>
      svc.validation.assertTransitionAllowed("draft", "approved"),
    ).toThrow();

    const trace = await svc.validation.validateTraceability(c, record.id);
    expect(trace.ok).toBe(false);
    expect(trace.gaps.length).toBeGreaterThan(0);

    await svc.validation.assertApprovalOrder(c, record.id);
  });
});

describe("certification coverage expansion", () => {
  it("covers remaining gate evaluation branches", () => {
    expect(
      evaluateCertificationGate({
        gateKey: "evidence_complete",
        evidenceLinks: { ...emptyEvidenceLinks(), evidenceIds: ["e1"] },
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "evidence_complete",
        dataAvailable: false,
      }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({ gateKey: "evidence_complete" }).status,
    ).toBe("fail");
    expect(
      evaluateCertificationGate({
        gateKey: "manual_testing_complete",
        manualCompletePercent: 100,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "manual_testing_complete",
        manualCompletePercent: 40,
      }).status,
    ).toBe("fail");
    expect(
      evaluateCertificationGate({ gateKey: "manual_testing_complete" }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({
        gateKey: "automation_complete",
        automationCompletePercent: 100,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "automation_complete",
        automationCompletePercent: 50,
      }).status,
    ).toBe("warning");
    expect(
      evaluateCertificationGate({ gateKey: "automation_complete" }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({
        gateKey: "approvals_complete",
        pendingApprovalCount: 0,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "approvals_complete",
        pendingApprovalCount: 2,
      }).status,
    ).toBe("fail");
    expect(
      evaluateCertificationGate({ gateKey: "approvals_complete" }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({
        gateKey: "no_critical_defects",
        openCriticalDefectCount: 1,
      }).status,
    ).toBe("fail");
    expect(
      evaluateCertificationGate({ gateKey: "no_critical_defects" }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({
        gateKey: "risk_accepted",
        highRiskUnresolvedCount: 0,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "risk_accepted",
        highRiskUnresolvedCount: 2,
      }).status,
    ).toBe("warning");
    expect(evaluateCertificationGate({ gateKey: "risk_accepted" }).status).toBe(
      "unknown",
    );
    expect(
      evaluateCertificationGate({
        gateKey: "compliance_complete",
        complianceComplete: true,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "compliance_complete",
        complianceComplete: false,
      }).status,
    ).toBe("fail");
    expect(
      evaluateCertificationGate({ gateKey: "compliance_complete" }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({
        gateKey: "documentation_complete",
        documentationComplete: true,
      }).status,
    ).toBe("pass");
    expect(
      evaluateCertificationGate({
        gateKey: "documentation_complete",
        documentationComplete: false,
      }).status,
    ).toBe("fail");
    expect(
      evaluateCertificationGate({ gateKey: "documentation_complete" }).status,
    ).toBe("unknown");
    expect(
      evaluateCertificationGate({
        gateKey: "custom_gate",
        evidenceLinks: { ...emptyEvidenceLinks(), requirementIds: ["r1"] },
      }).status,
    ).toBe("pass");
    expect(evaluateCertificationGate({ gateKey: "custom_gate" }).status).toBe(
      "unknown",
    );
    expect(
      evaluateCertificationGate({
        gateKey: "coverage_threshold",
        coveragePercent: 75,
        coverageThreshold: 80,
      }).status,
    ).toBe("warning");
    expect(recommendFromGateOutcomes([]).code).toBe("not_ready");
    expect(
      mapGateOutcomesToRecommendation([
        { gateKey: "o", status: "fail", required: false },
      ]).code,
    ).toBe("conditionally_ready");
  });

  it("covers helpers, mapping events, and validation utilities", () => {
    expect(isTerminalCertificationStatus("archived")).toBe(true);
    expect(isTerminalCertificationStatus("draft")).toBe(false);
    expect(certificationTransitionsFrom("draft")).toContain("preparing");
    expect(eventTypeForStatus("rejected")).toBe("certification.rejected");
    expect(eventTypeForStatus("expired")).toBe("certification.expired");
    expect(eventTypeForStatus("archived")).toBe("certification.archived");
    expect(eventTypeForStatus("in_review")).toBe("certification.review_started");
    expect(eventTypeForStatus("changes_required")).toBe(
      "certification.changes_requested",
    );
    expect(eventTypeForStatus("awaiting_approval")).toBe(
      "certification.submitted_for_approval",
    );
    expect(eventTypeForStatus("conditionally_approved")).toBe(
      "certification.conditionally_approved",
    );
    expect(eventTypeForStatus("preparing")).toBe("certification.transitioned");
    expect(eventTypeForStatus("certified")).toBe("certification.approved");
    expect(eventTypeForStatus("failed_certification")).toBe(
      "certification.rejected",
    );
    expect(eventTypeForStatus("conditional_approval")).toBe(
      "certification.conditionally_approved",
    );
    expect(eventTypeForStatus("production_ready")).toBe(
      "certification.submitted_for_approval",
    );

    const merged = mergeEvidenceLinks(undefined, { evidenceIds: ["a", "b"] }, "link");
    expect(merged.evidenceIds).toEqual(["a", "b"]);
    const unlinked = mergeEvidenceLinks(merged, { evidenceIds: ["a"] }, "unlink");
    expect(unlinked.evidenceIds).toEqual(["b"]);
    expect(evidenceLinksFromJson(undefined).planIds).toEqual([]);
    expect(evidenceLinksFromJson({ planIds: ["p1"], extra: 1 }).planIds).toEqual([
      "p1",
    ]);

    const c = ctx();
    expect(() => assertHasPermission(c, "certification.view")).not.toThrow();
    expect(() =>
      assertHasPermission(ctx({ permissions: [] }), "certification.view"),
    ).toThrow(DomainRuleError);
    expect(() =>
      assertTenantOrganisationMatch(c, { tenantId: "other" }),
    ).toThrow(DomainRuleError);
    expect(() =>
      assertTenantOrganisationMatch(c, {
        tenantId: c.tenantId,
        organisationId: "other_org",
      }),
    ).toThrow(DomainRuleError);
    expect(() => assertAuditImmutable()).toThrow(/append-only/i);
  });

  it("covers records update/transition, evidence get/unlink, rules CRUD", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-5",
      name: "Expand",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    const updated = await svc.records.updateCertificationRecord(c, record.id, {
      name: "Expand Updated",
      productLabel: "Product",
      releaseLabel: "R1",
      conditions: "none",
    });
    expect(updated.name).toBe("Expand Updated");

    const transitioned = await svc.records.transitionCertificationState(
      c,
      record.id,
      "preparing",
      "start",
    );
    expect(transitioned.status).toBe("preparing");

    const listed = await svc.records.listCertificationRecords(c);
    expect(listed.some((r) => r.id === record.id)).toBe(true);
    const got = await svc.records.getCertificationRecord(c, record.id);
    expect(got.key).toBe("CERT-5");

    await svc.evidence.linkEvidence(c, record.id, {
      evidenceIds: ["ev_a", "ev_b"],
      executionIds: ["ex_1"],
      requirementIds: ["req_1"],
    });
    const links = await svc.evidence.getLinks(c, record.id);
    expect(links.evidenceIds).toContain("ev_a");
    const afterUnlink = await svc.evidence.unlinkEvidence(c, record.id, {
      evidenceIds: ["ev_a"],
    });
    expect(afterUnlink.evidenceIds).toEqual(["ev_b"]);

    const rule = await svc.rules.configureRule(c, {
      tenantId: c.tenantId,
      key: "rule-x",
      name: "Rule X",
      requiredGateKeys: ["evidence_complete"],
      optionalGateKeys: ["automation_complete"],
      enabled: true,
    });
    const rules = await svc.rules.listRules(c);
    expect(rules.length).toBeGreaterThan(0);
    expect((await svc.rules.getRule(c, rule.id)).key).toBe("rule-x");
    const updatedRule = await svc.rules.updateRule(c, rule.id, {
      name: "Rule X2",
      enabled: false,
    });
    expect(updatedRule.name).toBe("Rule X2");
    const forCert = await svc.rules.listRulesForCertification(c, record.id);
    expect(forCert.length).toBeGreaterThan(0);
  });

  it("covers gate define/update/list/evaluate paths and recommendations latest", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-6",
      name: "Gates",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    const def = await svc.gates.defineGate(c, {
      tenantId: c.tenantId,
      gateKey: "evidence_complete",
      name: "Evidence",
      kind: "builtin",
      required: true,
      enabled: true,
    });
    const updatedDef = await svc.gates.updateGateDefinition(c, def.id, {
      description: "desc",
      ordinal: 2,
    });
    expect(updatedDef.description).toBe("desc");
    expect((await svc.gates.listGateDefinitions(c)).length).toBeGreaterThan(0);

    await svc.evidence.linkEvidence(c, record.id, { evidenceIds: ["e1"] });
    const evaluation = await svc.gates.evaluateGate(
      c,
      record.id,
      "evidence_complete",
    );
    expect(evaluation.status).toBe("pass");
    const listed = await svc.gates.listEvaluations(c, record.id);
    expect(listed.length).toBeGreaterThan(0);

    const mapped = svc.recommendations.mapFromGateOutcomes([
      { gateKey: "evidence_complete", status: "pass", required: true },
    ]);
    expect(mapped.code).toBe("ready_for_approval");

    const rec = await svc.recommendations.recommend(c, record.id);
    expect(rec.advisoryOnly).toBe(true);
    const latest = await svc.recommendations.getLatest(c, record.id);
    expect(latest?.code).toBe(rec.code);
  });

  it("covers approval delegate/rework/sign/witness/list and audit get", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-7",
      name: "Approvals",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    const approval = await svc.approvals.requestApproval(c, {
      certificationRecordId: record.id,
      comments: "please review",
    });
    await svc.approvals.delegateApproval(c, approval.id, "user_2", "reviewer");
    await svc.approvals.requestRework(c, approval.id, "needs more evidence");
    const signed = await svc.approvals.attachSignaturePlaceholder(c, approval.id, {
      signerUserId: c.userId!,
      signedAt: "2026-07-12T12:00:00.000Z",
      method: "attested",
      statement: "I attest",
    });
    expect(signed.signature?.signaturePlaceholderRef).toBeTruthy();
    await svc.approvals.attachWitnessPlaceholder(c, approval.id, {
      witnessUserId: "witness_1",
      witnessedAt: "2026-07-12T12:00:00.000Z",
    });
    const listed = await svc.approvals.listApprovals(c, record.id);
    expect(listed.length).toBeGreaterThan(0);

    const approval2 = await svc.approvals.requestApproval(c, {
      certificationRecordId: record.id,
    });
    await svc.approvals.decideApproval(c, approval2.id, {
      status: "rejected",
      comments: "not ready",
    });

    const audits = await svc.audit.list(c, record.id);
    expect(audits.length).toBeGreaterThan(0);
    const one = await svc.audit.get(c, audits[0]!.id);
    expect(one.id).toBe(audits[0]!.id);
    const appended = await svc.audit.append(c, {
      certificationRecordId: record.id,
      action: "manual.note",
      summary: "note",
    });
    expect(appended.action).toBe("manual.note");

    await svc.history.appendTransition(c, {
      certificationRecordId: record.id,
      fromStatus: "draft",
      toStatus: "preparing",
      reason: "manual history",
    });
  });

  it("covers validation permission/tenant helpers and satisfied gates", async () => {
    const svc = engine();
    const c = ctx();
    svc.validation.assertPermission(c, "certification.view");
    svc.validation.assertTenantOrganisation(c, { tenantId: c.tenantId });
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-8",
      name: "Satisfied",
      status: "draft",
      gateIds: [],
      approvalIds: [],
      planId: "plan_1" as never,
    });
    await svc.evidence.linkEvidence(c, record.id, {
      evidenceIds: ["e1"],
      executionIds: ["x1"],
      requirementIds: ["r1"],
    });
    const trace = await svc.validation.validateTraceability(c, record.id);
    expect(trace.ok).toBe(true);

    await svc.rules.configureRule(c, {
      tenantId: c.tenantId,
      key: "ok-rule",
      name: "OK",
      certificationRecordId: record.id,
      requiredGateKeys: ["evidence_complete"],
      optionalGateKeys: [],
      enabled: true,
    });
    await svc.gates.defineGate(c, {
      tenantId: c.tenantId,
      gateKey: "evidence_complete",
      name: "Evidence",
      kind: "builtin",
      required: true,
      enabled: true,
    });
    await svc.gates.evaluateGate(c, record.id, "evidence_complete");
    await svc.validation.assertRequiredGatesSatisfied(c, record.id);

    await expect(
      svc.workflow.restore(c, record.id, "approved" as never),
    ).rejects.toThrow(/draft or preparing/i);
  });

  it("covers evaluateAll default keys and approval ai reject path", async () => {
    const svc = engine();
    const c = ctx();
    const record = await svc.records.createCertificationRecord(c, {
      tenantId: c.tenantId,
      key: "CERT-9",
      name: "Defaults",
      status: "draft",
      gateIds: [],
      approvalIds: [],
    });
    const all = await svc.gates.evaluateAll(c, record.id);
    expect(all.length).toBeGreaterThan(3);
    const approval = await svc.approvals.requestApproval(c, {
      certificationRecordId: record.id,
    });
    await expect(
      svc.approvals.decideApproval(c, approval.id, {
        status: "approved",
        comments: "aiApprove now",
      }),
    ).rejects.toThrow(/Automatic or AI/i);
  });
});

describe("certification boundary", () => {
  it("forbids AI auto-approve / http / ui tokens in certification sources", () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry.endsWith(".test.ts") || entry === "index.ts") continue;
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (full.endsWith(".ts")) files.push(full);
      }
    };
    walk(root);
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      expect(content).not.toMatch(/from\s+['"]next\/server['"]/);
      expect(content).not.toMatch(/from\s+['"]express['"]/);
      expect(content).not.toMatch(/from\s+['"]@apzhub\/ui['"]/);
      expect(content).not.toMatch(/EventBus|event-bus/);
      if (file.endsWith("approval-service.ts")) {
        expect(content).toMatch(/auto_approve_forbidden|autoApprove/);
      }
    }
    expect(FORBIDDEN_CERTIFICATION_AUTOMATION_TOKENS).toContain("autoApprove");
  });
});

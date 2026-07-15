import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  asCertificationRecordId,
  asExecutionSessionId,
  asTestCaseId,
  asTestStepId,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import { DomainEventCollector, createManualTestingServices } from "./index";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_1",
    permissions: ["*"],
    organisationId: "org_1",
    ...overrides,
  };
}

function build() {
  const persistence = createInMemoryTestingPersistence();
  let n = 0;
  const svc = createManualTestingServices({
    persistence,
    events: new DomainEventCollector(),
    now: () => "2026-07-12T12:00:00.000Z",
    id: () => `gen_${++n}`,
  });
  return { persistence, svc };
}

describe("expanded service coverage", () => {
  it("covers requirement link/unlink/archive and plan relationships", async () => {
    const { svc } = build();
    const rctx = ctx();
    const req = await svc.requirements.create(rctx, {
      tenantId: "tenant_1",
      key: "REQ-X",
      title: "Title",
      priority: "medium",
      workItemRefs: [],
      riskIds: [],
    });
    await svc.requirements.update(rctx, req.id, { title: "Updated" });
    const linked = await svc.requirements.linkWorkItem(rctx, req.id, {
      kind: "story",
      projectRefId: "proj_1",
      workItemId: "story_1" as never,
      label: "S1",
    });
    expect(linked.workItemRefs).toHaveLength(1);
    const unlinked = await svc.requirements.unlinkWorkItem(rctx, req.id, "story_1");
    expect(unlinked.workItemRefs).toHaveLength(0);
    await svc.requirements.archive(rctx, req.id);

    const plan = await svc.testPlans.create(rctx, {
      tenantId: "tenant_1",
      key: "PX",
      name: "Plan",
      status: "draft",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });
    const suite = await svc.testSuites.create(rctx, {
      tenantId: "tenant_1",
      key: "SX",
      name: "Suite",
      status: "draft",
      planIds: [],
      caseIds: [],
      isRegression: false,
    });
    await svc.testPlans.linkSuite(rctx, plan.id, suite.id);
    await svc.testPlans.linkSuite(rctx, plan.id, suite.id); // idempotent
    await svc.testPlans.unlinkSuite(rctx, plan.id, suite.id);
    await svc.testPlans.linkRequirement(rctx, plan.id, req.id);
    const risk = await svc.risks.create(rctx, {
      tenantId: "tenant_1",
      key: "RX",
      title: "Risk",
      level: "medium",
      requirementIds: [],
    });
    await svc.testPlans.linkRisk(rctx, plan.id, risk.id);
    await svc.testPlans.assignAssignee(rctx, plan.id, "a1");
    await svc.testPlans.archive(rctx, plan.id);
  });

  it("covers suite hierarchy helpers and case mutators", async () => {
    const { svc } = build();
    const rctx = ctx();
    const parent = await svc.testSuites.create(rctx, {
      tenantId: "tenant_1",
      key: "SP",
      name: "Parent",
      status: "draft",
      planIds: [],
      caseIds: [],
      isRegression: false,
    });
    const child = await svc.testSuites.create(rctx, {
      tenantId: "tenant_1",
      key: "SC",
      name: "Child",
      status: "draft",
      planIds: [],
      caseIds: [],
      isRegression: false,
    });
    await svc.testSuites.setParent(rctx, child.id, parent.id);
    await svc.testSuites.setGroup(rctx, child.id, "g1");
    await svc.testSuites.setGroup(rctx, child.id, null);
    await svc.testSuites.assignOwner(rctx, child.id, "owner");
    await svc.testSuites.version(rctx, child.id);
    await svc.testSuites.setStatus(rctx, child.id, "review");
    await svc.testSuites.linkPlan(rctx, child.id, "plan_x" as never);
    const tc = await svc.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "CX",
      title: "Case",
      status: "draft",
      priority: "low",
      suiteIds: [],
      requirementIds: [],
      steps: [],
    });
    await svc.testSuites.linkCase(rctx, child.id, tc.id);
    await svc.testSuites.linkCase(rctx, child.id, tc.id);
    await svc.testSuites.unlinkCase(rctx, child.id, tc.id);
    await svc.testSuites.archive(rctx, child.id);

    await svc.testCases.setParameters(rctx, tc.id, [{ key: "p1" }]);
    await svc.testCases.setPreconditions(rctx, tc.id, "pre");
    await svc.testCases.setPostconditions(rctx, tc.id, "post");
    await svc.testCases.setPriority(rctx, tc.id, "high");
    await svc.testCases.setRisk(rctx, tc.id, "major");
    await svc.testCases.setTags(rctx, tc.id, ["a"]);
    await svc.testCases.setComponents(rctx, tc.id, ["comp"]);
    await svc.testCases.assignOwner(rctx, tc.id, "o1");
    await svc.testCases.assignReviewer(rctx, tc.id, "r1");
    await svc.testCases.linkSuite(rctx, tc.id, parent.id);
    await svc.testCases.linkSuite(rctx, tc.id, parent.id);
    await svc.testCases.replaceSteps(rctx, tc.id, [
      {
        id: asTestStepId("step_n1"),
        caseId: asTestCaseId(tc.id),
        ordinal: 0,
        action: "A",
        expectedResult: "E",
      },
    ]);
    const versions = await svc.testCases.listVersions(rctx, tc.id);
    expect(versions.length).toBeGreaterThan(0);
    await svc.testCases.getVersion(rctx, versions[0]!.id);
    await svc.testCases.archive(rctx, tc.id);
  });

  it("covers execution assign/handover/review/approval and evidence archive", async () => {
    const { persistence, svc } = build();
    const rctx = ctx();
    const sess = await persistence.executionSessions.create(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
      },
      { executionType: "manual", status: "planned" },
    );
    const tc = await svc.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "CE",
      title: "Exec",
      status: "approved",
      priority: "medium",
      suiteIds: [],
      requirementIds: [],
      steps: [
        {
          id: asTestStepId("st1"),
          caseId: asTestCaseId("case_tmp"),
          ordinal: 0,
          action: "A",
          expectedResult: "E",
        },
      ],
    });
    const created = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: tc.id,
    });
    const exec = await svc.manualExecutions.start(rctx, created.id);
    await svc.manualExecutions.assign(rctx, exec.id, "u2");
    await svc.manualExecutions.handover(rctx, exec.id, "u3");
    await svc.manualExecutions.setReviewer(rctx, exec.id, "rev");
    await svc.manualExecutions.setApprovalState(rctx, exec.id, "pending_review");
    await svc.manualExecutions.setStepStatus(rctx, exec.id, tc.steps[0]!.id, "blocked");
    const ev = await svc.evidence.registerEvidence(rctx, {
      tenantId: "tenant_1",
      type: "note",
      title: "n",
      storageRef: "ref://n",
    });
    await svc.manualExecutions.attachStepEvidence(
      rctx,
      exec.id,
      tc.steps[0]!.id,
      ev.id,
    );
    expect(await svc.manualExecutions.getStatus(rctx, exec.id)).toBe("in_progress");
    await svc.manualExecutions.listComments(rctx, exec.id);
    await svc.evidence.updateEvidence(rctx, ev.id, { title: "n2" });
    await svc.evidence.unlinkEvidenceRelationship(rctx, ev.id, "missing");
    await svc.evidence.archiveEvidence(rctx, ev.id);
    await expect(svc.evidence.listAttachments(rctx)).resolves.toEqual([]);
    await expect(svc.evidence.registerAttachment(rctx, {} as never)).rejects.toThrow();
  });

  it("covers approvals sign/witness/withdraw and regression helpers", async () => {
    const { persistence, svc } = build();
    const rctx = ctx();
    const cert = await persistence.certificationRecords.create(
      { tenantId: "tenant_1", actorUserId: "user_1", permissions: ["*"] },
      {
        key: "C2",
        name: "Cert2",
        status: "qa_ready",
        gateIds: [],
        approvalIds: [],
      },
    );
    const approval = await svc.approvals.requestApproval(rctx, {
      tenantId: "tenant_1",
      certificationRecordId: asCertificationRecordId(cert.id),
      status: "pending",
    });
    await svc.approvals.approveApproval(rctx, approval.id, "ok");
    await svc.approvals.signApproval(rctx, approval.id, {
      signerUserId: "user_1",
      signedAt: "2026-07-12T12:00:00.000Z",
      method: "digital",
      signaturePlaceholderRef: "sig://1",
    });
    await svc.approvals.witnessApproval(rctx, approval.id, {
      witnessUserId: "w1",
      witnessedAt: "2026-07-12T12:00:00.000Z",
    });
    await svc.approvals.withdrawApproval(rctx, approval.id);

    const reg = await svc.regression.create(rctx, {
      tenantId: "tenant_1",
      key: "RG",
      name: "Reg",
      suiteIds: [],
    });
    await svc.regression.update(rctx, reg.id, { name: "Reg2" });
    await svc.regression.addSuite(rctx, reg.id, "suite_1" as never);
    await svc.regression.addSuite(rctx, reg.id, "suite_1" as never);
    await svc.regression.removeSuite(rctx, reg.id, "suite_1" as never);
    await svc.regression.assignPlan(rctx, reg.id, "plan_1" as never);
    await svc.regression.assignPlan(rctx, reg.id, null);
    await svc.regression.assignOwner(rctx, reg.id, "o");
    await svc.regression.archive(rctx, reg.id);
    expect((await svc.regression.list(rctx)).length).toBe(0);
  });

  it("covers risk setters and readiness for certification without plan", async () => {
    const { persistence, svc } = build();
    const rctx = ctx();
    const risk = await svc.risks.create(rctx, {
      tenantId: "tenant_1",
      key: "RK",
      title: "R",
      level: "low",
      requirementIds: [],
    });
    await svc.risks.setSeverity(rctx, risk.id, "major");
    await svc.risks.setLikelihood(rctx, risk.id, "likely");
    await svc.risks.setImpact(rctx, risk.id, "moderate");
    await svc.risks.setBusinessCriticality(rctx, risk.id, "high");
    await svc.risks.setRegressionImportance(rctx, risk.id, "high");
    await svc.risks.linkRequirement(rctx, risk.id, "req_1" as never);
    await svc.risks.linkRequirement(rctx, risk.id, "req_1" as never);
    await svc.risks.unlinkRequirement(rctx, risk.id, "req_1" as never);
    await svc.risks.archive(rctx, risk.id);

    const cert = await persistence.certificationRecords.create(
      { tenantId: "tenant_1", actorUserId: "user_1", permissions: ["*"] },
      {
        key: "C3",
        name: "No plan",
        status: "development_ready",
        gateIds: [],
        approvalIds: [],
      },
    );
    const prep = await svc.certificationPreparation.prepareForCertification(
      rctx,
      asCertificationRecordId(cert.id),
    );
    expect(prep.coverageGaps).toContain("missing_plan");
    const readiness = await svc.releaseReadiness.calculateForCertification(
      rctx,
      asCertificationRecordId(cert.id),
    );
    expect(readiness.isDecision).toBe(false);

    const plan = await svc.testPlans.create(rctx, {
      tenantId: "tenant_1",
      key: "PR",
      name: "Ready",
      status: "approved",
      suiteIds: [],
      requirementIds: ["req_missing" as never],
      riskIds: [risk.id],
    });
    const withPlan = await persistence.certificationRecords.create(
      { tenantId: "tenant_1", actorUserId: "user_1", permissions: ["*"] },
      {
        key: "C4",
        name: "With plan",
        status: "qa_ready",
        planId: plan.id,
        gateIds: [],
        approvalIds: [],
      },
    );
    await svc.certificationPreparation.prepareForCertification(
      rctx,
      asCertificationRecordId(withPlan.id),
    );
    await svc.releaseReadiness.calculateForCertification(
      rctx,
      asCertificationRecordId(withPlan.id),
    );

    const events = svc.events;
    expect(events.size).toBeGreaterThan(0);
    events.clear();
    expect(events.size).toBe(0);
    expect(events.list()).toEqual([]);
  });

  it("covers traceability remove and list matrix", async () => {
    const { svc } = build();
    const rctx = ctx();
    const req = await svc.requirements.create(rctx, {
      tenantId: "tenant_1",
      key: "RM",
      title: "M",
      priority: "low",
      workItemRefs: [],
      riskIds: [],
    });
    const link = await svc.traceability.createLink(rctx, {
      tenantId: "tenant_1",
      type: "related",
      sourceKind: "requirement",
      sourceId: req.id,
      targetKind: "defect",
      targetId: "def_1",
    });
    await svc.traceability.getLink(rctx, link.id);
    await svc.traceability.removeLink(rctx, link.id);
    const matrix = await svc.traceability.listMatrix(rctx);
    expect(matrix.length).toBeGreaterThan(0);
  });
});

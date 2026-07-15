import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  asCertificationRecordId,
  asExecutionSessionId,
  asTestPlanId,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  createInMemoryEvidenceStorageProvider,
  createManualTestingServices,
  DomainRuleError,
  isCompletedLikeExecutionStatus,
  nextStatusAfterCancel,
} from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_1",
    permissions: ["*"],
  };
}

describe("coverage boost APZTCMS-006", () => {
  it("covers completed-like helpers and cancel edge cases", () => {
    expect(isCompletedLikeExecutionStatus("completed")).toBe(true);
    expect(isCompletedLikeExecutionStatus("approved")).toBe(true);
    expect(isCompletedLikeExecutionStatus("in_progress")).toBe(false);
    expect(() => nextStatusAfterCancel("approved")).toThrow(DomainRuleError);
    expect(() => nextStatusAfterCancel("archived")).toThrow(DomainRuleError);
  });

  it("covers storage get/delete and evidence attachment stubs", async () => {
    const storage = createInMemoryEvidenceStorageProvider();
    const put = await storage.put({
      keyHint: "k",
      bytes: new Uint8Array([1]),
      contentType: "text/plain",
    });
    expect(await storage.get(put.storageRef)).toMatchObject({
      storageRef: put.storageRef,
    });
    expect(await storage.get("missing")).toBeUndefined();
    await storage.delete(put.storageRef);
    expect(await storage.exists(put.storageRef)).toBe(false);

    const svc = createManualTestingServices({
      persistence: createInMemoryTestingPersistence(),
      storage,
    });
    await expect(svc.evidence.listAttachments(ctx())).resolves.toEqual([]);
    await expect(svc.evidence.getAttachment(ctx(), "att_1" as never)).rejects.toThrow(
      DomainRuleError,
    );
    await expect(
      svc.evidence.registerAttachment(ctx(), {
        tenantId: "tenant_1",
        fileName: "a.txt",
        storageRef: "x",
        parentKind: "other",
        parentId: "p",
      }),
    ).rejects.toThrow(DomainRuleError);
  });

  it("covers release readiness for certification and list/get helpers", async () => {
    const persistence = createInMemoryTestingPersistence();
    const svc = createManualTestingServices({ persistence });
    const rctx = ctx();
    const plan = await svc.testPlans.create(rctx, {
      tenantId: "tenant_1",
      key: "P-COV",
      name: "Plan",
      status: "approved",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });
    const cert = await persistence.certificationRecords.create(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
      },
      {
        key: "CERT-COV",
        name: "Cert",
        status: "qa_ready",
        planId: plan.id,
        gateIds: [],
        approvalIds: [],
      },
    );
    const readiness = await svc.releaseReadiness.calculateForCertification(
      rctx,
      asCertificationRecordId(cert.id),
    );
    expect(readiness.isDecision).toBe(false);
    expect(readiness.completionPercent).toBeDefined();
    expect(readiness.missingApprovalCount).toBeDefined();

    const sess = await persistence.executionSessions.create(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
      },
      { executionType: "manual", status: "draft" },
    );
    const tc = await svc.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "TC-COV2",
      title: "C",
      status: "draft",
      priority: "low",
      suiteIds: [],
      requirementIds: [],
      steps: [],
    });
    const exec = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: tc.id,
    });
    expect((await svc.manualExecutions.list(rctx)).length).toBeGreaterThan(0);
    expect((await svc.manualExecutions.listComments(rctx, exec.id)).length).toBe(0);
    await svc.manualExecutions.addComment(rctx, exec.id, "hi");
    expect((await svc.manualExecutions.listComments(rctx, exec.id)).length).toBe(1);

    const approval = await svc.approvals.requestApproval(rctx, {
      tenantId: "tenant_1",
      certificationRecordId: asCertificationRecordId(cert.id),
      status: "pending",
    });
    await svc.approvals.signApproval(rctx, approval.id, {
      signerUserId: "user_1",
      signedAt: "2026-07-12T00:00:00.000Z",
      method: "attested",
    });
    await svc.approvals.witnessApproval(rctx, approval.id, {
      witnessUserId: "w1",
      witnessedAt: "2026-07-12T00:00:00.000Z",
    });
    await svc.approvals.withdrawApproval(rctx, approval.id);

    void asTestPlanId(plan.id);
  });

  it("covers evidence approve from submitted and update lifecycle", async () => {
    const svc = createManualTestingServices({
      persistence: createInMemoryTestingPersistence(),
    });
    const rctx = ctx();
    const captured = await svc.evidence.captureEvidence(rctx, {
      tenantId: "tenant_1",
      type: "report",
      title: "R",
      put: { bytes: new Uint8Array([2, 3]) },
    });
    await svc.evidence.submitEvidence(rctx, captured.id);
    const approved = await svc.evidence.approveEvidence(rctx, captured.id);
    expect(approved.lifecycleStatus).toBe("approved");

    const listed = await svc.evidence.listEvidence(rctx);
    expect(listed.length).toBeGreaterThan(0);
    await svc.evidence.updateEvidence(rctx, captured.id, { description: "d" });
    await svc.evidence.unlinkEvidenceRelationship(rctx, captured.id, "missing");
  });
});

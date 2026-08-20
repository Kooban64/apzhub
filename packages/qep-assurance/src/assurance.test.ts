import { describe, expect, it } from "vitest";

import { createQepAssuranceRegistry } from "./compose";
import { assertCertificationOutcomeAllowed } from "./domain/policy";
import type { DecisionContext, QualityGateEvaluationRecord } from "./domain/types";

function service() {
  return createQepAssuranceRegistry().service;
}

function context(applicationId = "qapp-1"): DecisionContext {
  return {
    applicationId,
    environmentId: "env-qa",
    environmentSnapshot: { id: "env-qa", name: "QA" },
    changeEventId: "scm-change-1",
    scmIdentity: {
      changeEventId: "scm-change-1",
      kind: "commit",
      externalKey: "abc123",
      sha: "abc123",
    },
  };
}

describe("APZQEP Phase 6 assurance domain", () => {
  it("creates an application-bound Quality Risk and rejects unbound rows", async () => {
    const created = await service().createRisk({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Checkout defect rate",
      description: "Human-created risk from observed defects",
      severity: "high",
    });
    expect(created.number).toMatch(/^QR-\d+$/);
    expect(created.applicationId).toBe("qapp-1");
    expect(created.status).toBe("open");
    expect(created.trend).toBe("insufficient_history");
    await expect(
      service().createRisk({
        tenantId: "tenant_a",
        applicationId: "",
        actorId: "user_1",
        title: "X",
        description: "Y",
        severity: "low",
      }),
    ).rejects.toThrow("quality_risk.application_required");
  });

  it("isolates Risks by tenant and application", async () => {
    const svc = service();
    await svc.createRisk({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "A1",
      description: "d",
      severity: "medium",
    });
    const other = await svc.createRisk({
      tenantId: "tenant_a",
      applicationId: "qapp-2",
      actorId: "user_1",
      title: "A2",
      description: "d",
      severity: "medium",
    });
    const listed = await svc.listRisks("tenant_a", "qapp-1");
    expect(listed).toHaveLength(1);
    expect(listed[0]?.title).toBe("A1");
    await expect(svc.getRisk("tenant_b", other.id)).rejects.toThrow(
      "quality_risk.not_found",
    );
  });

  it("records immutable Risk history for status and severity changes", async () => {
    const svc = service();
    const created = await svc.createRisk({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "History risk",
      description: "d",
      severity: "medium",
    });
    await svc.updateRiskSeverity({
      tenantId: "tenant_a",
      riskId: created.id,
      actorId: "user_1",
      severity: "high",
    });
    const mitigated = await svc.updateRiskStatus({
      tenantId: "tenant_a",
      riskId: created.id,
      actorId: "user_2",
      status: "mitigated",
    });
    expect(mitigated.history.map((row) => row.action)).toEqual([
      "created",
      "severity.changed",
      "status.mitigated",
    ]);
    expect(mitigated.trend).toBe("increasing");
    expect(mitigated.history[0]?.id).not.toBe(mitigated.history[1]?.id);
  });

  it("migrates JSON ledger rows only when bound to an application and does not guess", async () => {
    const svc = service();
    const result = await svc.migrateLegacyRisks({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      items: [
        {
          riskId: "risk_legacy1",
          title: "Legacy",
          severity: "high",
          status: "open",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          createdBy: "legacy",
        },
      ],
    });
    expect(result.imported).toBe(1);
    const listed = await svc.listRisks("tenant_a", "qapp-1");
    expect(listed[0]?.legacyRiskId).toBe("risk_legacy1");
    expect(listed[0]?.status).toBe("open");
  });

  it("stores Blocking vs Non-Blocking Gate definitions with inspectable conditions", async () => {
    const svc = service();
    const blocking = await svc.createGateDefinition({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "No unresolved blocking risks",
      description: "Open high or critical risks must be zero",
      gateType: "blocking",
      condition: { kind: "unresolved_blocking_risks", operator: "eq", value: 0 },
    });
    const advisory = await svc.createGateDefinition({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "No open issues",
      description: "Advisory",
      gateType: "non_blocking",
      condition: { kind: "open_quality_issues", operator: "eq", value: 0 },
    });
    expect(blocking.number).toMatch(/^QG-\d+$/);
    expect(blocking.gateType).toBe("blocking");
    expect(blocking.condition.kind).toBe("unresolved_blocking_risks");
    expect(advisory.gateType).toBe("non_blocking");
    expect(blocking.id).not.toContain("gate_f4_");
  });

  it("writes immutable explainable Gate evaluations and preserves them after definition change", async () => {
    const svc = service();
    const gate = await svc.createGateDefinition({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Blocking risks",
      description: "d",
      gateType: "blocking",
      condition: { kind: "unresolved_blocking_risks", operator: "eq", value: 0 },
    });
    const first = await svc.evaluateGate({
      tenantId: "tenant_a",
      gateId: gate.id,
      actorId: "user_1",
      context: context(),
    });
    expect(first.result).toBe("passed");
    expect(first.reason).toContain("Observed 0");
    expect(first.definitionVersion).toBe(1);
    expect(first.environmentSnapshot.name).toBe("QA");
    await svc.updateGateDefinition({
      tenantId: "tenant_a",
      gateId: gate.id,
      actorId: "user_1",
      conditionValue: 1,
    });
    const stored = await svc.getGateEvaluation("tenant_a", first.id);
    expect(stored.definitionVersion).toBe(1);
    expect(stored.definitionSnapshot.condition.value).toBe(0);
    expect(stored.result).toBe("passed");
  });

  it("derives Current Readiness Posture from Quality Facts → Risks → Gate evaluations", async () => {
    const svc = service();
    await svc.createGateDefinition({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Blocking risks",
      description: "d",
      gateType: "blocking",
      condition: { kind: "unresolved_blocking_risks", operator: "eq", value: 0 },
    });
    const ready = await svc.evaluateActiveGates({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      context: context(),
    });
    expect(ready[0]?.result).toBe("passed");
    const before = await svc.composeReadiness({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      changeEventId: "scm-change-1",
    });
    expect(before.posture).toBe("ready");
    await svc.createRisk({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Blocking risk",
      description: "open high",
      severity: "high",
    });
    await svc.evaluateActiveGates({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      context: context(),
    });
    const after = await svc.composeReadiness({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      changeEventId: "scm-change-1",
    });
    expect(after.posture).toBe("not_ready");
    expect(after.snapshot.blockingFailed).toHaveLength(1);
  });
});

describe("APZQEP Phase 6 certification policy — seven proofs", () => {
  async function setupFailedBlocking() {
    const svc = service();
    const gate = await svc.createGateDefinition({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "No unresolved blocking risks",
      description: "d",
      gateType: "blocking",
      condition: { kind: "unresolved_blocking_risks", operator: "eq", value: 0 },
    });
    await svc.createRisk({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Open high risk",
      description: "d",
      severity: "high",
    });
    const evaluations = await svc.evaluateActiveGates({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      context: context(),
    });
    return { svc, gate, evaluations };
  }

  it("1. ordinary GO is allowed when Blocking Gates are satisfied", async () => {
    const svc = service();
    await svc.createGateDefinition({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "No unresolved blocking risks",
      description: "d",
      gateType: "blocking",
      condition: { kind: "unresolved_blocking_risks", operator: "eq", value: 0 },
    });
    await svc.evaluateActiveGates({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      context: context(),
    });
    await expect(
      svc.assertOutcomeAllowed({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        changeEventId: "scm-change-1",
        environmentId: "env-qa",
        outcome: "GO",
      }),
    ).resolves.toMatchObject({ snapshot: { posture: "ready" } });
  });

  it("2. failed Blocking Gate rejects ordinary GO", async () => {
    const { svc } = await setupFailedBlocking();
    await expect(
      svc.assertOutcomeAllowed({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        changeEventId: "scm-change-1",
        environmentId: "env-qa",
        outcome: "GO",
      }),
    ).rejects.toThrow("certification.blocking_gate_go_prohibited");
  });

  it("3. failed Blocking Gate without exception rejects CONDITIONAL_GO", async () => {
    const { svc } = await setupFailedBlocking();
    await expect(
      svc.assertOutcomeAllowed({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        changeEventId: "scm-change-1",
        environmentId: "env-qa",
        outcome: "CONDITIONAL_GO",
      }),
    ).rejects.toThrow("certification.blocking_gate_conditional_go_prohibited");
  });

  it("4. authorised exception allows CONDITIONAL_GO but GO remains prohibited", async () => {
    const { svc, evaluations } = await setupFailedBlocking();
    const failed = evaluations.find((row) => row.result === "failed")!;
    await svc.authoriseException({
      tenantId: "tenant_a",
      actorId: "user_certifier",
      gateEvaluationId: failed.id,
      reason: "Customer accepted residual checkout risk for this change",
    });
    await expect(
      svc.assertOutcomeAllowed({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        changeEventId: "scm-change-1",
        environmentId: "env-qa",
        outcome: "GO",
      }),
    ).rejects.toThrow("certification.blocking_gate_go_prohibited");
    await expect(
      svc.assertOutcomeAllowed({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        changeEventId: "scm-change-1",
        environmentId: "env-qa",
        outcome: "CONDITIONAL_GO",
      }),
    ).resolves.toBeTruthy();
  });

  it("5–6. NO_GO and DEFER remain available with a failed Blocking Gate", async () => {
    const { svc } = await setupFailedBlocking();
    await expect(
      svc.assertOutcomeAllowed({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        changeEventId: "scm-change-1",
        environmentId: "env-qa",
        outcome: "NO_GO",
      }),
    ).resolves.toBeTruthy();
    await expect(
      svc.assertOutcomeAllowed({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        changeEventId: "scm-change-1",
        environmentId: "env-qa",
        outcome: "DEFER",
      }),
    ).resolves.toBeTruthy();
  });

  it("7. later quality-state change does not rewrite a prior evaluation snapshot", async () => {
    const { svc, evaluations } = await setupFailedBlocking();
    const frozen = evaluations[0]!;
    await svc.updateRiskStatus({
      tenantId: "tenant_a",
      riskId: (await svc.listRisks("tenant_a", "qapp-1"))[0]!.id,
      actorId: "user_1",
      status: "mitigated",
    });
    const stored = await svc.getGateEvaluation("tenant_a", frozen.id);
    expect(stored.result).toBe("failed");
    expect(stored.factsUsed.unresolvedBlockingRisks).toBe(1);
    expect(stored.environmentSnapshot.name).toBe("QA");
  });

  it("rejects system/QI actors from authorising exceptions", async () => {
    const { svc, evaluations } = await setupFailedBlocking();
    await expect(
      svc.authoriseException({
        tenantId: "tenant_a",
        actorId: "qi:agent",
        gateEvaluationId: evaluations[0]!.id,
        reason: "should never work",
      }),
    ).rejects.toThrow("certification.human_actor_required");
  });

  it("policy has no silent GO path around a failed Blocking Gate", () => {
    const failed: QualityGateEvaluationRecord = {
      id: "qge_1",
      tenantId: "t",
      applicationId: "a",
      gateDefinitionId: "g",
      definitionVersion: 1,
      definitionSnapshot: {
        id: "g",
        tenantId: "t",
        applicationId: "a",
        number: "QG-001",
        name: "x",
        description: "x",
        gateType: "blocking",
        lifecycle: "active",
        version: 1,
        condition: { kind: "unresolved_blocking_risks", operator: "eq", value: 0 },
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
      },
      environmentId: "e",
      environmentSnapshot: { id: "e", name: "QA" },
      changeEventId: "c",
      factsUsed: {
        unresolvedBlockingRisks: 1,
        openCriticalDefects: 0,
        openQualityIssues: 0,
        failedCustomerExecutions: 0,
        requiredEvidenceMissing: 0,
        risksAvailable: true,
        defectsAvailable: false,
        issuesAvailable: false,
        executionsAvailable: false,
        evidenceAvailable: false,
      },
      result: "failed",
      reason: "Observed 1",
      evaluatedAt: "",
      evaluatedBy: "u",
    };
    expect(() =>
      assertCertificationOutcomeAllowed({
        outcome: "GO",
        blockingEvaluations: [failed],
        exceptions: [],
      }),
    ).toThrow("certification.blocking_gate_go_prohibited");
  });
});

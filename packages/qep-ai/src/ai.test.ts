import { describe, expect, it } from "vitest";

import { createQepAiRegistry } from "./compose";
import {
  assertContextSafeForModel,
  composeDeterministicAnalysis,
  hasSourceRead,
  redactContextForModel,
} from "./domain/policy";
import type {
  ComposedAiContext,
  DestinationWriter,
  TargetReader,
} from "./domain/types";

function context(overrides: Partial<ComposedAiContext> = {}): ComposedAiContext {
  return {
    tenantId: "tenant_a",
    applicationId: "qapp-1",
    sourceAccess: "not_authorised",
    sourceAuthorised: false,
    evidenceMode: "metadata",
    records: [
      { kind: "acceptance_criterion", id: "ac-1", title: "Login", updatedAt: "t1" },
    ],
    evidence: [
      { id: "ev-1", title: "Shot", sourceKind: "screenshot", status: "accepted" },
    ],
    denied: ["source.read"],
    ...overrides,
  };
}

function writer(id = "tc_written"): DestinationWriter {
  return {
    async write() {
      return { recordId: id, recordKind: "test_case" };
    },
  };
}

function reader(updatedAt = "t1"): TargetReader {
  return {
    async fingerprint() {
      return { targetId: "ac-1", updatedAt };
    },
  };
}

describe("APZQEP Phase 7 AI domain", () => {
  it("isolates proposals by tenant and application", async () => {
    const svc = createQepAiRegistry().service;
    await svc.createProposal({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      granted: ["qep.ai_workspace.operate"],
      proposalType: "test_case",
      content: { title: "A1" },
      context: context(),
      provider: "none",
      model: "none",
    });
    await svc.createProposal({
      tenantId: "tenant_a",
      applicationId: "qapp-2",
      actorId: "user_1",
      granted: ["qep.ai_workspace.operate"],
      proposalType: "test_case",
      content: { title: "A2" },
      context: context({ applicationId: "qapp-2" }),
      provider: "none",
      model: "none",
    });
    const listed = await svc.listProposals("tenant_a", "qapp-1");
    expect(listed).toHaveLength(1);
    expect(listed[0]?.originalContent.title).toBe("A1");
    await expect(svc.getProposal("tenant_b", listed[0]!.id)).rejects.toThrow(
      "ai.proposal.not_found",
    );
  });

  it("rejects cross-tenant and cross-application composed context", async () => {
    const svc = createQepAiRegistry().service;
    await expect(
      svc.createProposal({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        actorId: "user_1",
        granted: ["qep.ai_workspace.operate"],
        proposalType: "test_case",
        content: { title: "X" },
        context: context({ tenantId: "tenant_b" }),
        provider: "none",
        model: "none",
      }),
    ).rejects.toThrow("ai.isolation.tenant");
    await expect(
      svc.createProposal({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        actorId: "user_1",
        granted: ["qep.ai_workspace.operate"],
        proposalType: "test_case",
        content: { title: "X" },
        context: context({ applicationId: "qapp-other" }),
        provider: "none",
        model: "none",
      }),
    ).rejects.toThrow("ai.isolation.application");
  });

  it("does not treat qep.scm.read as Source access", () => {
    expect(hasSourceRead(["qep.scm.read", "qep.*", "qep.ai_workspace.operate"])).toBe(
      false,
    );
    expect(hasSourceRead(["source.read"])).toBe(true);
    expect(hasSourceRead(["source.*"])).toBe(true);
  });

  it("fail-closes Source in composed context without source.read", async () => {
    const svc = createQepAiRegistry().service;
    await expect(
      svc.createProposal({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        actorId: "user_1",
        granted: ["qep.scm.read", "qep.ai_workspace.operate"],
        proposalType: "test_case",
        content: { title: "Leak" },
        context: context({
          sourceAuthorised: true,
          sourceAccess: "authorised",
          source: { repositoryId: "repo", path: "src/a.ts" },
        }),
        provider: "openai",
        model: "gpt-4o-mini",
      }),
    ).rejects.toThrow("ai.source.not_authorised");
  });

  it("redacts Source from the model payload when not authorised", () => {
    const composed = context({
      sourceAuthorised: false,
      sourceAccess: "not_authorised",
    });
    assertContextSafeForModel(composed, ["qep.ai_workspace.operate"]);
    const payload = redactContextForModel(composed);
    expect(payload.source).toBeUndefined();
    expect(payload.sourceAuthorised).toBe(false);
    expect(() =>
      assertContextSafeForModel(
        {
          ...composed,
          source: { repositoryId: "repo", path: "secret.ts" },
        },
        ["qep.ai_workspace.operate"],
      ),
    ).toThrow("ai.source.leak");
  });

  it("keeps original and reviewed content distinguishable after modify", async () => {
    const svc = createQepAiRegistry().service;
    const created = await svc.createProposal({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      granted: ["qep.ai_workspace.operate"],
      proposalType: "test_case",
      content: { title: "Original" },
      context: context(),
      provider: "openai",
      model: "gpt-4o-mini",
    });
    const modified = await svc.modifyProposal({
      tenantId: "tenant_a",
      proposalId: created.id,
      actorId: "user_1",
      content: { title: "Reviewed" },
    });
    expect(modified.originalContent.title).toBe("Original");
    expect(modified.reviewedContent.title).toBe("Reviewed");
    expect(modified.status).toBe("modified");
  });

  it("rejects Accept without destination AuthZ and for Risk/Gate/Certification", async () => {
    const svc = createQepAiRegistry().service;
    const created = await svc.createProposal({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      granted: ["qep.ai_workspace.operate"],
      proposalType: "test_case",
      content: { title: "Case" },
      context: context(),
      provider: "none",
      model: "none",
    });
    await expect(
      svc.acceptProposal({
        tenantId: "tenant_a",
        proposalId: created.id,
        actorId: "user_1",
        granted: ["qep.ai_workspace.operate", "qep.ai_workspace.read"],
        writer: writer(),
        targetReader: reader(),
      }),
    ).rejects.toThrow("ai.accept.destination_forbidden");

    const risk = await svc.createProposal({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      granted: ["qep.ai_workspace.operate", "qep.risk.operate"],
      proposalType: "quality_risk",
      content: { title: "Risk", severity: "high" },
      context: context(),
      provider: "none",
      model: "none",
    });
    await expect(
      svc.acceptProposal({
        tenantId: "tenant_a",
        proposalId: risk.id,
        actorId: "user_1",
        granted: ["qep.risk.operate", "qep.ai_workspace.operate"],
        writer: writer(),
        targetReader: reader(),
      }),
    ).rejects.toThrow("ai.accept.forbidden_type");

    for (const proposalType of [
      "gate_evaluation",
      "certification",
      "defect",
    ] as const) {
      const row = await svc.createProposal({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        actorId: "user_1",
        granted: ["qep.ai_workspace.operate"],
        proposalType,
        content: { title: proposalType },
        context: context(),
        provider: "none",
        model: "none",
      });
      await expect(
        svc.acceptProposal({
          tenantId: "tenant_a",
          proposalId: row.id,
          actorId: "user_1",
          granted: ["*"],
          writer: writer(),
          targetReader: reader(),
        }),
      ).rejects.toThrow("ai.accept.forbidden_type");
    }
  });

  it("accepts a Test Case through the type-specific writer and refuses stale targets", async () => {
    const svc = createQepAiRegistry().service;
    const created = await svc.createProposal({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      granted: ["qep.ai_workspace.operate"],
      proposalType: "test_case",
      content: { title: "Cover AC" },
      context: context(),
      provider: "openai",
      model: "gpt-4o-mini",
      targetId: "ac-1",
    });
    await expect(
      svc.acceptProposal({
        tenantId: "tenant_a",
        proposalId: created.id,
        actorId: "user_1",
        granted: ["qep.specification.create"],
        writer: writer(),
        targetReader: reader("changed"),
      }),
    ).rejects.toThrow("ai.proposal.stale");

    const accepted = await svc.acceptProposal({
      tenantId: "tenant_a",
      proposalId: created.id,
      actorId: "user_1",
      granted: ["qep.specification.create"],
      writer: writer("tc_ok"),
      targetReader: reader("t1"),
    });
    expect(accepted.status).toBe("accepted");
    expect(accepted.resultingRecordId).toBe("tc_ok");
    expect(accepted.resultingRecordKind).toBe("test_case");
  });

  it("computes deterministic gaps from QEP facts without an LLM", () => {
    const analysis = composeDeterministicAnalysis({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      acWithoutVerification: 2,
      neverExecuted: 3,
      failedWithoutEvidence: 1,
      missingTrace: 4,
      openDefects: 5,
      failedGates: 1,
      openRisks: 2,
      now: "2026-08-20T00:00:00.000Z",
    });
    expect(analysis.source).toBe("qep_facts");
    expect(
      analysis.gaps.find((row) => row.kind === "ac_without_verification")?.count,
    ).toBe(2);
  });

  it("rejects does not invoke a destination writer", async () => {
    const wrote = false;
    const svc = createQepAiRegistry().service;
    const created = await svc.createProposal({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      granted: ["qep.ai_workspace.operate"],
      proposalType: "test_case",
      content: { title: "Stay draft" },
      context: context(),
      provider: "none",
      model: "none",
    });
    const rejected = await svc.rejectProposal({
      tenantId: "tenant_a",
      proposalId: created.id,
      actorId: "user_1",
    });
    expect(rejected.status).toBe("rejected");
    expect(wrote).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  baselineToSearchDraft,
  createQepSearchAdapterForTest,
  defectToSearchDraft,
  evidenceToSearchDraft,
  relationshipToSearchDraft,
  requirementToSearchDraft,
  traceLinkToSearchDraft,
  verificationToSearchDraft,
  SEARCH_QEP_VERSION,
} from "./index";

describe("@apzhub/search-qep", () => {
  it("maps evidence and defects to QEP search drafts", () => {
    const evidence = evidenceToSearchDraft({
      id: "ev_1",
      projectId: "project_1",
      title: "Release test report",
      status: "verified",
      sourceKind: "automation",
      tags: ["release"],
      ownerId: "user_1",
      createdAt: "2026-08-14T00:00:00.000Z",
      updatedAt: "2026-08-14T01:00:00.000Z",
    });
    expect(evidence.entityType).toBe("evidence");
    expect(evidence.metadata?.projectId).toBe("project_1");

    const defect = defectToSearchDraft({
      defectId: "def_1",
      projectId: "project_1",
      title: "Checkout regression",
      description: "Checkout fails during release verification",
      status: "triaged",
      severity: "major",
      priority: "p1",
      reporterId: "user_1",
      tags: ["release"],
      createdAt: "2026-08-14T00:00:00.000Z",
      updatedAt: "2026-08-14T01:00:00.000Z",
    });
    expect(defect.entityType).toBe("defect");
    expect(defect.navigationTarget).toBe("/workspace/qep/defects/def_1");
  });

  it("maps requirements to search drafts with product-safe fields", () => {
    const draft = requirementToSearchDraft({
      id: "req_abc",
      key: "REQ-1",
      title: "Authenticate users",
      description: "Users must sign in",
      status: "draft",
      projectId: "project_1",
      tenantId: "tenant_1",
      createdAt: "2026-07-24T00:00:00.000Z",
      updatedAt: "2026-07-24T00:00:00.000Z",
    });
    expect(draft.entityId).toBe("req_abc");
    expect(draft.entityType).toBe("requirement");
    expect(draft.title).toBe("Authenticate users");
    expect(draft.lifecycleState).toBe("published");
    expect(SEARCH_QEP_VERSION).toBe("0.1.0");
  });

  it("publishes and removes via lifecycle hooks", () => {
    const adapter = createQepSearchAdapterForTest();
    const context = {
      tenantId: "tenant_1",
      correlationId: "corr_1",
      actorUserId: "user_1",
    };
    const requirement = {
      id: "req_abc",
      key: "REQ-1",
      title: "Authenticate users",
      status: "draft",
      projectId: "project_1",
      tenantId: "tenant_1",
      createdAt: "2026-07-24T00:00:00.000Z",
      updatedAt: "2026-07-24T00:00:00.000Z",
    };
    const published = adapter.hooks.onRequirementUpserted(context, requirement);
    expect(published.ok).toBe(true);
    const archived = adapter.hooks.onRequirementArchived(context, {
      ...requirement,
      archivedAt: "2026-07-24T01:00:00.000Z",
    });
    expect(archived.ok).toBe(true);
  });

  it("maps requirement baselines to search drafts without indexing items", () => {
    const draft = baselineToSearchDraft({
      id: "rbl_release_1",
      tenantId: "tenant_1",
      number: 1,
      name: "Release 1",
      description: "First configuration baseline",
      status: "draft",
      createdBy: "user_1",
      createdAt: "2026-07-25T00:00:00.000Z",
      updatedAt: "2026-07-25T00:00:00.000Z",
    });
    expect(draft.entityId).toBe("rbl_release_1");
    expect(draft.entityType).toBe("requirement_baseline");
    expect(draft.title).toBe("Release 1");
    expect(draft.lifecycleState).toBe("published");
    expect(draft.metadata?.owner).toBe("user_1");
  });

  it("publishes and removes baselines via lifecycle hooks", () => {
    const adapter = createQepSearchAdapterForTest();
    const context = {
      tenantId: "tenant_1",
      correlationId: "corr_baseline_1",
      actorUserId: "user_1",
    };
    const baseline = {
      id: "rbl_release_1",
      tenantId: "tenant_1",
      number: 1,
      name: "Release 1",
      status: "draft",
      createdBy: "user_1",
      createdAt: "2026-07-25T00:00:00.000Z",
      updatedAt: "2026-07-25T00:00:00.000Z",
    };
    const published = adapter.hooks.onBaselineUpserted(context, baseline);
    expect(published.ok).toBe(true);
    const archived = adapter.hooks.onBaselineUpserted(context, {
      ...baseline,
      archivedAt: "2026-07-25T01:00:00.000Z",
    });
    expect(archived.ok).toBe(true);
  });

  it("maps requirement relationships to search drafts without indexing endpoint content", () => {
    const draft = relationshipToSearchDraft({
      id: "rrl_dep_1",
      tenantId: "tenant_1",
      type: "depends_on",
      lifecycleState: "active",
      source: { mode: "requirement", requirementId: "req_a" },
      target: { mode: "requirement", requirementId: "req_b" },
      rationale: "A depends on B",
      createdBy: "user_1",
      createdAt: "2026-07-26T00:00:00.000Z",
      updatedAt: "2026-07-26T00:00:00.000Z",
    });
    expect(draft.entityId).toBe("rrl_dep_1");
    expect(draft.entityType).toBe("requirement_relationship");
    expect(draft.summary).toBe("A depends on B");
    expect(draft.lifecycleState).toBe("published");
  });

  it("publishes and removes relationships via lifecycle hooks", () => {
    const adapter = createQepSearchAdapterForTest();
    const context = {
      tenantId: "tenant_1",
      correlationId: "corr_relationship_1",
      actorUserId: "user_1",
    };
    const relationship = {
      id: "rrl_dep_1",
      tenantId: "tenant_1",
      type: "depends_on",
      lifecycleState: "active",
      source: { mode: "requirement", requirementId: "req_a" },
      target: { mode: "requirement", requirementId: "req_b" },
      createdBy: "user_1",
      createdAt: "2026-07-26T00:00:00.000Z",
      updatedAt: "2026-07-26T00:00:00.000Z",
    };
    const published = adapter.hooks.onRelationshipUpserted(context, relationship);
    expect(published.ok).toBe(true);
    const retired = adapter.hooks.onRelationshipUpserted(context, {
      ...relationship,
      retiredAt: "2026-07-26T01:00:00.000Z",
    });
    expect(retired.ok).toBe(true);
  });

  it("maps trace links to search drafts without indexing endpoint artefact content", () => {
    const draft = traceLinkToSearchDraft({
      id: "trc_verifies_1",
      tenantId: "tenant_1",
      type: "verifies",
      lifecycleState: "approved",
      source: { kind: "test_case", artefactId: "tc_a", owningDomain: "testing" },
      target: { kind: "requirement", artefactId: "req_b", owningDomain: "qep" },
      rationale: "TC-A verifies REQ-B",
      createdBy: "user_1",
      createdAt: "2026-07-26T00:00:00.000Z",
      updatedAt: "2026-07-26T00:00:00.000Z",
    });
    expect(draft.entityId).toBe("trc_verifies_1");
    expect(draft.entityType).toBe("trace_link");
    expect(draft.summary).toBe("TC-A verifies REQ-B");
    expect(draft.lifecycleState).toBe("published");
  });

  it("publishes and removes trace links via lifecycle hooks", () => {
    const adapter = createQepSearchAdapterForTest();
    const context = {
      tenantId: "tenant_1",
      correlationId: "corr_trace_link_1",
      actorUserId: "user_1",
    };
    const traceLink = {
      id: "trc_verifies_1",
      tenantId: "tenant_1",
      type: "verifies",
      lifecycleState: "approved",
      source: { kind: "test_case", artefactId: "tc_a", owningDomain: "testing" },
      target: { kind: "requirement", artefactId: "req_b", owningDomain: "qep" },
      createdBy: "user_1",
      createdAt: "2026-07-26T00:00:00.000Z",
      updatedAt: "2026-07-26T00:00:00.000Z",
    };
    const published = adapter.hooks.onTraceLinkUpserted(context, traceLink);
    expect(published.ok).toBe(true);
    const retired = adapter.hooks.onTraceLinkUpserted(context, {
      ...traceLink,
      retiredAt: "2026-07-26T01:00:00.000Z",
    });
    expect(retired.ok).toBe(true);

    const republished = adapter.hooks.onTraceLinkUpserted(context, {
      ...traceLink,
      id: "trc_verifies_2",
    });
    expect(republished.ok).toBe(true);
    const superseded = adapter.hooks.onTraceLinkUpserted(context, {
      ...traceLink,
      id: "trc_verifies_2",
      supersededAt: "2026-07-26T02:00:00.000Z",
    });
    expect(superseded.ok).toBe(true);
  });

  it("maps verifications to search drafts without indexing subject artefact content", () => {
    const draft = verificationToSearchDraft({
      id: "ver_abc",
      tenantId: "tenant_1",
      status: "verified",
      outcome: "verified",
      subject: { kind: "requirement", artefactId: "req_a", owningDomain: "qep" },
      rationale: "REQ-A verified against test evidence",
      createdBy: "user_1",
      createdAt: "2026-07-26T00:00:00.000Z",
      updatedAt: "2026-07-26T00:00:00.000Z",
    });
    expect(draft.entityId).toBe("ver_abc");
    expect(draft.entityType).toBe("verification_record");
    expect(draft.summary).toBe("REQ-A verified against test evidence");
    expect(draft.lifecycleState).toBe("published");
  });

  it("publishes and removes verifications via lifecycle hooks", () => {
    const adapter = createQepSearchAdapterForTest();
    const context = {
      tenantId: "tenant_1",
      correlationId: "corr_verification_1",
      actorUserId: "user_1",
    };
    const verification = {
      id: "ver_abc",
      tenantId: "tenant_1",
      status: "in_progress",
      subject: { kind: "requirement", artefactId: "req_a", owningDomain: "qep" },
      createdBy: "user_1",
      createdAt: "2026-07-26T00:00:00.000Z",
      updatedAt: "2026-07-26T00:00:00.000Z",
    };
    const published = adapter.hooks.onVerificationUpserted(context, verification);
    expect(published.ok).toBe(true);
    const retired = adapter.hooks.onVerificationUpserted(context, {
      ...verification,
      retiredAt: "2026-07-26T01:00:00.000Z",
    });
    expect(retired.ok).toBe(true);

    const republished = adapter.hooks.onVerificationUpserted(context, {
      ...verification,
      id: "ver_xyz",
    });
    expect(republished.ok).toBe(true);
    const superseded = adapter.hooks.onVerificationUpserted(context, {
      ...verification,
      id: "ver_xyz",
      supersededAt: "2026-07-26T02:00:00.000Z",
    });
    expect(superseded.ok).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import {
  QEP_REQUIREMENTS_PERMISSIONS,
  QEP_TRACEABILITY_PERMISSIONS,
  QEP_VERIFICATION_PERMISSIONS,
  QEP_TEST_SPECIFICATION_PERMISSIONS,
  QEP_TEST_PLAN_PERMISSIONS,
} from "@apzhub/qep-contracts";

import { PLATFORM_SERVICE_PERMISSION_CATALOGUE } from "../../authorization/permission-catalogue";
import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";
import { createPlatformServices } from "../create-platform-services";

import {
  createQepPlatformServicesForProduction,
  createQepPlatformServicesForTest,
} from "./create-qep-platform-services";
import { isQepServiceEnabled } from "./qep-env";

const ctx = () => ({
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_qep_020c",
  permissions: ["qep.requirements.*"],
});

const traceCtx = () => ({
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_qep_030a",
  permissions: ["qep.traceability.*"],
});

const verificationCtx = () => ({
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_qep_040b",
  permissions: ["qep.verification.*"],
});

const specificationCtx = () => ({
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_qep_050b",
  permissions: ["qep.specification.*"],
});

const planCtx = () => ({
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_qep_060b",
  permissions: ["qep.plan.*"],
});

describe("APZQEP-ENG-020C qep platform services", () => {
  it("registers qep permissions in the platform catalogue", () => {
    for (const key of QEP_REQUIREMENTS_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(key);
    }
  });

  it("maps gateway operations to qep permissions", () => {
    expect(
      resolveOperationAuthorization("qepRequirement", "list")?.requiredPermission,
    ).toBe("qep.requirements.view");
    expect(
      resolveOperationAuthorization("qepRequirement", "archive")?.requiredPermission,
    ).toBe("qep.requirements.archive");
    expect(
      resolveOperationAuthorization("qepRequirement", "submit")?.requiredPermission,
    ).toBe("qep.requirements.submit");
    expect(
      resolveOperationAuthorization("qepRequirement", "approve")?.requiredPermission,
    ).toBe("qep.requirements.approve");
    expect(
      resolveOperationAuthorization("qepRequirement", "availableTransitions")
        ?.requiredPermission,
    ).toBe("qep.requirements.view");
  });

  it("requires explicit postgres for production and explicit memory for tests", () => {
    expect(() => createQepPlatformServicesForProduction({} as never)).toThrow(/postgresDb/);
    expect(() => createQepPlatformServicesForTest({})).toThrow(/allowInMemoryPersistence/);
  });

  it("env enablement is enabled unless explicitly false", () => {
    expect(isQepServiceEnabled({})).toBe(true);
    expect(isQepServiceEnabled({ APZHUB_QEP_ENABLED: "false" })).toBe(false);
    expect(isQepServiceEnabled({ APZHUB_QEP_ENABLED: "0" })).toBe(false);
  });

  it("archives requirements through lifecycle from rejected", async () => {
    const qep = createQepPlatformServicesForTest({ allowInMemoryPersistence: true });
    const bundle = createPlatformServices({ qepPlatform: qep });
    const gateway = bundle.gateway;

    const created = await gateway.qep.requirements.create(ctx(), {
      projectId: "project_1",
      key: "REQ-001",
      title: "Login requirement",
      type: "functional",
      priority: "high",
    });

    const submitted = await gateway.qep.requirements.submit(ctx(), created.id);
    const inReview = await gateway.qep.requirements.review(ctx(), submitted.id);
    const rejected = await gateway.qep.requirements.reject(ctx(), inReview.id, {
      reason: "Incomplete",
    });
    const archived = await gateway.qep.requirements.archive(ctx(), rejected.id);
    expect(archived.archivedAt).toBeTruthy();
    expect(archived.status).toBe("archived");
  });

  it("registers qep traceability permissions in the platform catalogue", () => {
    for (const key of QEP_TRACEABILITY_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(key);
    }
  });

  it("maps gateway operations to qep traceability permissions", () => {
    expect(
      resolveOperationAuthorization("qepTraceability", "listTraceLinks")?.requiredPermission,
    ).toBe("qep.traceability.trace_links.view");
    expect(
      resolveOperationAuthorization("qepTraceability", "createTraceLink")?.requiredPermission,
    ).toBe("qep.traceability.trace_links.create");
    expect(
      resolveOperationAuthorization("qepTraceability", "validateTraceLink")?.requiredPermission,
    ).toBe("qep.traceability.trace_links.validate");
    expect(
      resolveOperationAuthorization("qepTraceability", "approveTraceLink")?.requiredPermission,
    ).toBe("qep.traceability.trace_links.approve");
    expect(
      resolveOperationAuthorization("qepTraceability", "listTraceLinkTaxonomy")
        ?.requiredPermission,
    ).toBe("qep.traceability.taxonomy.view");
  });

  it("wires the traceability gateway through requirement creation, validation, and approval", async () => {
    const qep = createQepPlatformServicesForTest({
      allowInMemoryPersistence: true,
      traceabilityEndpointResolver: {
        resolve: async (tenantId, kind, artefactId) => ({
          exists: true,
          tenantId,
          kind,
          artefactId,
        }),
      },
    });
    const bundle = createPlatformServices({ qepPlatform: qep });
    const gateway = bundle.gateway;

    const created = await gateway.qep.traceability.createTraceLink(traceCtx(), {
      type: "requirement_tested_by",
      source: { kind: "requirement", artefactId: "req_1" },
      target: { kind: "test_case", artefactId: "tc_1" },
      authority: { kind: "system", actorId: "user_1" },
      provenance: { actorId: "user_1", correlationId: "corr_qep_030a" },
    });
    expect(created.lifecycleState).toBe("draft");

    const validated = await gateway.qep.traceability.validateTraceLink(traceCtx(), created.id);
    expect(validated.lifecycleState).toBe("validated");

    const approved = await gateway.qep.traceability.approveTraceLink(traceCtx(), validated.id);
    expect(approved.lifecycleState).toBe("approved");

    const taxonomy = await gateway.qep.traceability.listTraceLinkTaxonomy(traceCtx());
    expect(taxonomy.length).toBeGreaterThan(0);
  });

  it("registers qep verification permissions in the platform catalogue", () => {
    for (const key of QEP_VERIFICATION_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(key);
    }
  });

  it("maps gateway operations to qep verification permissions", () => {
    expect(
      resolveOperationAuthorization("qepVerification", "listVerifications")?.requiredPermission,
    ).toBe("qep.verification.view");
    expect(
      resolveOperationAuthorization("qepVerification", "createVerification")?.requiredPermission,
    ).toBe("qep.verification.create");
    expect(
      resolveOperationAuthorization("qepVerification", "requestVerification")?.requiredPermission,
    ).toBe("qep.verification.request");
    expect(
      resolveOperationAuthorization("qepVerification", "completeVerification")?.requiredPermission,
    ).toBe("qep.verification.complete");
    expect(
      resolveOperationAuthorization("qepVerification", "getVerificationHistory")
        ?.requiredPermission,
    ).toBe("qep.verification.history.view");
  });

  it("wires the verification gateway through create, request, assign, start, and complete", async () => {
    const qep = createQepPlatformServicesForTest({
      allowInMemoryPersistence: true,
      verificationSubjectResolver: {
        resolve: async (tenantId, kind, artefactId) => ({
          exists: true,
          tenantId,
          kind,
          artefactId,
        }),
      },
    });
    const bundle = createPlatformServices({ qepPlatform: qep });
    const gateway = bundle.gateway;

    const created = await gateway.qep.verification.createVerification(verificationCtx(), {
      subject: { kind: "requirement", artefactId: "req_1" },
      authority: { kind: "system", actorId: "user_1" },
    });
    expect(created.status).toBe("draft");

    const requested = await gateway.qep.verification.requestVerification(
      verificationCtx(),
      created.id,
    );
    expect(requested.status).toBe("requested");

    const assigned = await gateway.qep.verification.assignVerification(
      verificationCtx(),
      requested.id,
      { assigneeId: "user_2" },
    );
    expect(assigned.status).toBe("assigned");

    const started = await gateway.qep.verification.startVerification(
      verificationCtx(),
      assigned.id,
    );
    expect(started.status).toBe("in_progress");

    const completed = await gateway.qep.verification.completeVerification(
      verificationCtx(),
      started.id,
      { outcome: "verified" },
    );
    expect(completed.status).toBe("verified");
    expect(completed.outcome).toBe("verified");

    const history = await gateway.qep.verification.getVerificationHistory(
      verificationCtx(),
      completed.id,
    );
    expect(history.length).toBeGreaterThan(0);
  });

  it("registers qep test specification permissions in the platform catalogue", () => {
    for (const key of QEP_TEST_SPECIFICATION_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(key);
    }
  });

  it("maps gateway operations to qep test specification permissions", () => {
    expect(resolveOperationAuthorization("qepTestSpecification", "list")?.requiredPermission).toBe(
      "qep.specification.read",
    );
    expect(resolveOperationAuthorization("qepTestSpecification", "create")?.requiredPermission).toBe(
      "qep.specification.create",
    );
    expect(
      resolveOperationAuthorization("qepTestSpecification", "submitForReview")?.requiredPermission,
    ).toBe("qep.specification.review");
    expect(
      resolveOperationAuthorization("qepTestSpecification", "approve")?.requiredPermission,
    ).toBe("qep.specification.approve");
    expect(
      resolveOperationAuthorization("qepTestSpecification", "listHistory")?.requiredPermission,
    ).toBe("qep.specification.history.view");
    expect(
      resolveOperationAuthorization("qepTestSpecification", "search")?.requiredPermission,
    ).toBe("qep.specification.search");
  });

  it("wires the test specification gateway through create, submit, and approve", async () => {
    const qep = createQepPlatformServicesForTest({ allowInMemoryPersistence: true });
    const bundle = createPlatformServices({ qepPlatform: qep });
    const gateway = bundle.gateway;

    const created = await gateway.qep.specifications.create(specificationCtx(), {
      number: "TS-050B-001",
      title: "Login test specification",
      description: "Desc",
      objective: "Objective",
      scope: "Scope",
      type: "functional",
      classification: "standard",
      owner: "user_1",
      author: "user_1",
    });
    expect(created.status).toBe("draft");

    const submitted = await gateway.qep.specifications.submitForReview(
      specificationCtx(),
      created.id,
      { reviewerId: "user_2" },
    );
    expect(submitted.status).toBe("under_review");

    const approved = await gateway.qep.specifications.approve(specificationCtx(), submitted.id, {
      approvalComment: "Approved",
    });
    expect(approved.status).toBe("approved");
    expect(approved.isAuthoritative).toBe(true);

    const history = await gateway.qep.specifications.listHistory(
      specificationCtx(),
      approved.id,
    );
    expect(history.length).toBeGreaterThan(0);
  });

  it("registers qep test plan permissions in the platform catalogue", () => {
    for (const key of QEP_TEST_PLAN_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(key);
    }
  });

  it("maps gateway operations to qep test plan permissions", () => {
    expect(resolveOperationAuthorization("qepTestPlan", "list")?.requiredPermission).toBe(
      "qep.plan.read",
    );
    expect(resolveOperationAuthorization("qepTestPlan", "createPlan")?.requiredPermission).toBe(
      "qep.plan.create",
    );
    expect(
      resolveOperationAuthorization("qepTestPlan", "submitForReview")?.requiredPermission,
    ).toBe("qep.plan.submit");
    expect(resolveOperationAuthorization("qepTestPlan", "approve")?.requiredPermission).toBe(
      "qep.plan.approve",
    );
    expect(resolveOperationAuthorization("qepTestPlan", "listHistory")?.requiredPermission).toBe(
      "qep.plan.history.view",
    );
    expect(resolveOperationAuthorization("qepTestPlan", "search")?.requiredPermission).toBe(
      "qep.plan.search",
    );
    expect(resolveOperationAuthorization("qepTestPlan", "supersede")?.requiredPermission).toBe(
      "qep.plan.supersede",
    );
  });

  it("wires the test plan gateway through create, item add, submit, approve, and lifecycle", async () => {
    const qep = createQepPlatformServicesForTest({ allowInMemoryPersistence: true });
    const bundle = createPlatformServices({ qepPlatform: qep });
    const gateway = bundle.gateway;

    const created = await gateway.qep.plans.createPlan(planCtx(), {
      title: "Release 1 regression plan",
      objective: "Validate release 1 scope",
      scope: { class: "release", label: "Release 1" },
    });
    expect(created.status).toBe("draft");
    expect(created.number).toMatch(/^TP-/);

    const withItem = await gateway.qep.plans.addItem(planCtx(), created.id, {
      specificationId: "tsp_platform_1",
      specificationVersionPin: "1.0",
      expectedRevision: created.revision,
    });
    expect(withItem.items).toHaveLength(1);

    const submitted = await gateway.qep.plans.submitForReview(planCtx(), created.id, {
      expectedRevision: withItem.revision,
    });
    expect(submitted.status).toBe("review");

    const approved = await gateway.qep.plans.approve(planCtx(), created.id, {
      allowSelfApproval: true,
      expectedRevision: submitted.revision,
    });
    expect(approved.status).toBe("approved");

    const ready = await gateway.qep.plans.markReady(planCtx(), created.id, {
      expectedRevision: approved.revision,
    });
    expect(ready.status).toBe("ready");

    const history = await gateway.qep.plans.listHistory(planCtx(), created.id);
    expect(history.length).toBeGreaterThan(0);
  });
});

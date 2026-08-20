import { describe, expect, it } from "vitest";

import { createQepExperienceRegistry } from "./compose";

function service() {
  return createQepExperienceRegistry().service;
}

describe("APZQEP Phase 5 experience domain", () => {
  it("creates an Application-bound Exploratory Session with charter prompts", async () => {
    const created = await service().createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Checkout Flow Exploration",
      mission: "Explore checkout usability",
      scope: "Web checkout only",
      testerName: "Jane Smith",
      environmentName: "QA",
      areas: ["Cart behaviour", "Address validation"],
    });
    expect(created.number).toMatch(/^EXS-\d+$/);
    expect(created.applicationId).toBe("qapp-1");
    expect(created.areas).toHaveLength(2);
    expect(created.areas[0]?.prompt).toBe("Cart behaviour");
    expect(created.status).toBe("draft");
    expect(created.progress).toEqual({ completed: 0, total: 2, percent: 0 });
  });

  it("rejects unbound Exploratory Sessions", async () => {
    await expect(
      service().createSession({
        tenantId: "tenant_a",
        applicationId: "",
        actorId: "user_1",
        name: "X",
        mission: "Y",
        scope: "Z",
      }),
    ).rejects.toThrow("exploratory_session.application_required");
  });

  it("isolates sessions by tenant and application", async () => {
    const svc = service();
    await svc.createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "A",
      mission: "m",
      scope: "s",
    });
    const otherApp = await svc.listSessions("tenant_a", "qapp-2");
    const otherTenant = await svc.listSessions("tenant_b", "qapp-1");
    expect(otherApp).toHaveLength(0);
    expect(otherTenant).toHaveLength(0);
  });

  it("derives exploratory progress from explored areas only", async () => {
    const svc = service();
    const session = await svc.createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "A",
      mission: "m",
      scope: "s",
      areas: ["One", "Two"],
    });
    const after = await svc.markAreaExplored({
      tenantId: "tenant_a",
      sessionId: session.id,
      areaId: session.areas[0]!.id,
      actorId: "user_1",
    });
    expect(after.progress).toEqual({ completed: 1, total: 2, percent: 50 });
  });

  it("shares Observation, Issue, and Note across both workflow roots", async () => {
    const svc = service();
    const session = await svc.createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "A",
      mission: "m",
      scope: "s",
    });
    const observation = await svc.addObservation({
      tenantId: "tenant_a",
      hostKind: "exploratory_session",
      hostId: session.id,
      actorId: "user_1",
      title: "Cart icon unclear",
      body: "Icon looks like a bag",
    });
    expect(observation?.title).toBe("Cart icon unclear");
    const issue = await svc.addIssue({
      tenantId: "tenant_a",
      hostKind: "exploratory_session",
      hostId: session.id,
      actorId: "user_1",
      title: "Checkout confusion",
      body: "Users hesitate",
      observationId: observation?.id,
    });
    expect(issue?.status).toBe("open");
    expect(issue?.observationId).toBe(observation?.id);
    const note = await svc.addNote({
      tenantId: "tenant_a",
      hostKind: "exploratory_session",
      hostId: session.id,
      actorId: "user_1",
      body: "Retry on tablet later",
    });
    expect(note.body).toContain("tablet");
    const linked = await svc.linkIssueDefect({
      tenantId: "tenant_a",
      issueId: issue!.id,
      defectId: "def_existing",
      actorId: "user_1",
    });
    expect(linked?.status).toBe("linked");
    expect(linked?.defectId).toBe("def_existing");
  });

  it("does not treat criterion results as TE Passed/Failed/Blocked/Not Run", async () => {
    const svc = service();
    const plan = await svc.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Checkout UI/UX Review",
      mission: "Verify checkout experience",
      scope: "Web checkout",
      disciplines: ["functional_ux", "responsive"],
    });
    const withContext = await svc.addContext({
      tenantId: "tenant_a",
      planId: plan.id,
      actorId: "user_1",
      context: {
        label: "Desktop 1920x1080",
        deviceClass: "desktop",
        viewportWidth: 1920,
        viewportHeight: 1080,
      },
    });
    await svc.addContext({
      tenantId: "tenant_a",
      planId: plan.id,
      actorId: "user_1",
      context: {
        label: "Mobile 375x667",
        deviceClass: "mobile",
        viewportWidth: 375,
        viewportHeight: 667,
      },
    });
    const withCriterion = await svc.addCriterion({
      tenantId: "tenant_a",
      planId: plan.id,
      actorId: "user_1",
      criterion: {
        discipline: "functional_ux",
        statement: "Primary CTA remains visible",
      },
    });
    await expect(
      svc.addContext({
        tenantId: "tenant_a",
        planId: plan.id,
        actorId: "user_1",
        context: { label: "Runner", deviceClass: "managed_runner" },
      }),
    ).rejects.toThrow("experience_context.infrastructure_target_forbidden");

    const activity = await svc.startActivity({
      tenantId: "tenant_a",
      planId: plan.id,
      actorId: "user_1",
      testerName: "Jane Smith",
    });
    expect(activity.number).toMatch(/^UXA-\d+$/);
    expect(activity.plan.id).toBe(plan.id);
    const recorded = await svc.recordCriterionResult({
      tenantId: "tenant_a",
      activityId: activity.id,
      criterionId: withCriterion.criteria[0]!.id,
      contextId: withContext.contexts[0]!.id,
      actorId: "user_1",
      state: "verified",
      concernFound: true,
    });
    expect(recorded.results[0]?.state).toBe("verified");
    expect(recorded.results[0]?.concernFound).toBe(true);
    expect(recorded.viewportMatrix).toHaveLength(2);
    expect(recorded.viewportMatrix.some((cell) => cell.status === "verified")).toBe(
      true,
    );
    expect(recorded.progress.total).toBe(2);
    expect(
      recorded.history.some((entry) => entry.eventType === "verification_started"),
    ).toBe(true);

    await expect(
      svc.recordCriterionResult({
        tenantId: "tenant_a",
        activityId: activity.id,
        criterionId: withCriterion.criteria[0]!.id,
        contextId: withContext.contexts[0]!.id,
        actorId: "user_1",
        state: "passed",
      }),
    ).rejects.toThrow("criterion_result.state_invalid");
  });

  it("keeps Exploratory Session and UI/UX Verification Activity as distinct roots", async () => {
    const svc = service();
    const session = await svc.createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "A",
      mission: "m",
      scope: "s",
    });
    const plan = await svc.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "P",
      mission: "m",
      scope: "s",
    });
    const activity = await svc.startActivity({
      tenantId: "tenant_a",
      planId: plan.id,
      actorId: "user_1",
    });
    expect(session.id.startsWith("qes_")).toBe(true);
    expect(activity.id.startsWith("qxa_")).toBe(true);
    expect(plan.id.startsWith("uxp_")).toBe(true);
    expect(session.id).not.toBe(activity.id);
  });

  it("attaches Evidence through the existing Evidence SoR relationship, not a parallel store", async () => {
    const svc = service();
    const session = await svc.createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "A",
      mission: "m",
      scope: "s",
    });
    await svc.attachEvidence({
      tenantId: "tenant_a",
      actorId: "user_1",
      evidenceId: "ev_existing",
      targetKind: "exploratory_session",
      targetId: session.id,
    });
    const presented = await svc.getSession("tenant_a", session.id);
    expect(presented.counts.evidence).toBe(1);
    expect(
      presented.history.some((entry) => entry.eventType === "evidence_attached"),
    ).toBe(true);
    await expect(
      svc.attachEvidence({
        tenantId: "tenant_a",
        actorId: "user_1",
        evidenceId: "ev_x",
        targetKind: "qep_ui_ux_execution",
        targetId: session.id,
      }),
    ).rejects.toThrow("quality_evidence.target_invalid");
  });

  it("does not auto-create Defects from observations or criterion results", async () => {
    const svc = service();
    const session = await svc.createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "A",
      mission: "m",
      scope: "s",
    });
    const observation = await svc.addObservation({
      tenantId: "tenant_a",
      hostKind: "exploratory_session",
      hostId: session.id,
      actorId: "user_1",
      title: "Noticed copy",
      body: "Label is long",
    });
    expect(observation?.id.startsWith("qob_")).toBe(true);
    const presented = await svc.getSession("tenant_a", session.id);
    expect(presented.issues).toHaveLength(0);
    expect(presented.observations[0]?.id).not.toContain("teo_");
  });

  it("keeps Experience Plan Application-bound and isolated from Test Plan numbers", async () => {
    const svc = service();
    await expect(
      svc.createPlan({
        tenantId: "tenant_a",
        applicationId: "",
        actorId: "user_1",
        name: "P",
        mission: "m",
        scope: "s",
      }),
    ).rejects.toThrow("experience_plan.application_required");
    const plan = await svc.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Checkout UI/UX Review",
      mission: "Verify checkout",
      scope: "Web",
    });
    expect(plan.number).toMatch(/^UXP-\d+$/);
    expect(plan.id.startsWith("uxp_")).toBe(true);
    const other = await svc.listPlans("tenant_a", "qapp-2");
    expect(other).toHaveLength(0);
  });

  it("records real history rather than synthesizing it from current state", async () => {
    const svc = service();
    const session = await svc.createSession({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "A",
      mission: "m",
      scope: "s",
      areas: ["Cart"],
    });
    expect(session.history.some((entry) => entry.eventType === "session_created")).toBe(
      true,
    );
    const started = await svc.transitionSession({
      tenantId: "tenant_a",
      sessionId: session.id,
      actorId: "user_1",
      action: "start",
    });
    expect(started.history.some((entry) => entry.eventType === "session_started")).toBe(
      true,
    );
    expect(started.status).toBe("in_progress");
  });
});

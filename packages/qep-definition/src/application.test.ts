import { describe, expect, it } from "vitest";

import { coverageLabel, deriveCriterionCoverage } from "./domain/coverage";
import { createQepDefinitionRegistry } from "./compose";

describe("QEP Definition — User Story and Acceptance Criterion", () => {
  it("creates a story bound to application and requirement", async () => {
    const registry = createQepDefinitionRegistry();
    const story = await registry.service.createStory({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      title: "User login",
      actorId: "user_1",
    });
    expect(story.id.startsWith("qus-")).toBe(true);
    expect(story.storyKey).toBe("US-1");
    expect(story.applicationId).toBe("qapp-1");
    expect(story.requirementId).toBe("req-1");
    expect(story.status).toBe("draft");
  });

  it("isolates stories by tenant", async () => {
    const registry = createQepDefinitionRegistry();
    await registry.service.createStory({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      title: "Login",
      actorId: "user_1",
    });
    const other = await registry.service.listStories({ tenantId: "tenant_b" });
    expect(other).toHaveLength(0);
    await expect(registry.service.getStory("tenant_b", "missing")).rejects.toThrow(
      "story.not_found",
    );
  });

  it("rejects orphan stories without application or requirement", async () => {
    const registry = createQepDefinitionRegistry();
    await expect(
      registry.service.createStory({
        tenantId: "tenant_a",
        applicationId: "",
        requirementId: "req-1",
        title: "Login",
        actorId: "user_1",
      }),
    ).rejects.toThrow("story.application_required");
    await expect(
      registry.service.createStory({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        requirementId: "",
        title: "Login",
        actorId: "user_1",
      }),
    ).rejects.toThrow("story.requirement_required");
  });

  it("creates an acceptance criterion under a requirement without a story", async () => {
    const registry = createQepDefinitionRegistry();
    const ac = await registry.service.createCriterion({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      text: "User must receive reset email",
      actorId: "user_1",
    });
    expect(ac.criterionKey).toBe("AC-1");
    expect(ac.userStoryId).toBeUndefined();
    expect(ac.requirementId).toBe("req-1");
  });

  it("creates an acceptance criterion under a story with matching requirement and application", async () => {
    const registry = createQepDefinitionRegistry();
    const story = await registry.service.createStory({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      title: "Login",
      actorId: "user_1",
    });
    const ac = await registry.service.createCriterion({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      userStoryId: story.id,
      text: "Valid credentials authenticate the user",
      actorId: "user_1",
    });
    expect(ac.userStoryId).toBe(story.id);
  });

  it("rejects AC attached to a story from another requirement", async () => {
    const registry = createQepDefinitionRegistry();
    const story = await registry.service.createStory({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      title: "Login",
      actorId: "user_1",
    });
    await expect(
      registry.service.createCriterion({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        requirementId: "req-2",
        userStoryId: story.id,
        text: "Mismatch",
        actorId: "user_1",
      }),
    ).rejects.toThrow("criterion.requirement_mismatch");
  });

  it("promotes legacy criteria idempotently without inventing a story parent", async () => {
    const registry = createQepDefinitionRegistry();
    const items = ["User must receive reset email", "Token expires after 15 minutes"];
    const first = await registry.service.promoteLegacyCriteria({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      items,
      actorId: "user_1",
    });
    expect(first.created).toBe(2);
    expect(first.inventedStoryParents).toBe(0);
    expect(first.preservedTexts).toEqual(items);
    const second = await registry.service.promoteLegacyCriteria({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      items,
      actorId: "user_1",
    });
    expect(second.created).toBe(0);
    expect(second.skipped).toBe(2);
    const listed = await registry.service.listCriteria({
      tenantId: "tenant_a",
      requirementId: "req-1",
    });
    expect(listed).toHaveLength(2);
    expect(listed.every((row) => !row.userStoryId)).toBe(true);
    expect(listed.map((row) => row.criterionKey)).toEqual(["AC-1", "AC-2"]);
    expect(listed.map((row) => row.text)).toEqual(items);
  });

  it("does not treat coverage as pass when linked verification failed", async () => {
    const registry = createQepDefinitionRegistry();
    const ac = await registry.service.createCriterion({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      text: "Reset email is delivered",
      actorId: "user_1",
    });
    await registry.service.linkVerification({
      tenantId: "tenant_a",
      criterionId: ac.id,
      actorId: "user_1",
      assetKind: "test_specification",
      assetId: "spec-481",
      latestResult: "fail",
    });
    const presented = await registry.service.getCriterion("tenant_a", ac.id);
    expect(presented.coverage).toBe("covered");
    expect(presented.result).toBe("fail");
    expect(presented.coverage === "covered" && presented.result === "pass").toBe(false);
  });

  it("derives requirement coverage from direct and story criteria", async () => {
    const registry = createQepDefinitionRegistry();
    const story = await registry.service.createStory({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      title: "Login",
      actorId: "user_1",
    });
    const direct = await registry.service.createCriterion({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      text: "Direct criterion",
      actorId: "user_1",
    });
    await registry.service.createCriterion({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      userStoryId: story.id,
      text: "Story criterion",
      actorId: "user_1",
    });
    await registry.service.linkVerification({
      tenantId: "tenant_a",
      criterionId: direct.id,
      actorId: "user_1",
      assetKind: "test_specification",
      assetId: "spec-1",
    });
    const facts = await registry.service.coverageForRequirement("tenant_a", "req-1");
    expect(facts.criterionCount).toBe(2);
    expect(facts.coveredCount).toBe(1);
    expect(facts.gapCount).toBe(1);
    expect(facts.coverage).toBe("partial");
    expect(coverageLabel(facts.coverage)).toBe("Partial");
  });

  it("re-parents an AC onto a story without changing identity or verification", async () => {
    const registry = createQepDefinitionRegistry();
    const story = await registry.service.createStory({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      title: "Login",
      actorId: "user_1",
    });
    const ac = await registry.service.createCriterion({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      text: "Legacy direct AC",
      actorId: "user_1",
    });
    await registry.service.linkVerification({
      tenantId: "tenant_a",
      criterionId: ac.id,
      actorId: "user_1",
      assetKind: "test_specification",
      assetId: "spec-9",
    });
    const moved = await registry.service.reparentCriterion(
      "tenant_a",
      ac.id,
      "user_1",
      story.id,
    );
    expect(moved.id).toBe(ac.id);
    expect(moved.userStoryId).toBe(story.id);
    const links = await registry.service.listVerification("tenant_a", ac.id);
    expect(links).toHaveLength(1);
    expect(links[0]?.assetId).toBe("spec-9");
  });

  it("archives linked stories and criteria without deleting verification history", async () => {
    const registry = createQepDefinitionRegistry();
    const story = await registry.service.createStory({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      title: "Login",
      actorId: "user_1",
    });
    const ac = await registry.service.createCriterion({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      userStoryId: story.id,
      text: "Valid login",
      actorId: "user_1",
    });
    await registry.service.linkVerification({
      tenantId: "tenant_a",
      criterionId: ac.id,
      actorId: "user_1",
      assetKind: "test_specification",
      assetId: "spec-1",
    });
    await registry.service.archiveCriterion("tenant_a", ac.id, "user_1");
    await registry.service.archiveStory("tenant_a", story.id, "user_1");
    const archivedStory = await registry.service.getStory("tenant_a", story.id);
    expect(archivedStory.status).toBe("archived");
    const archivedAc = await registry.service.getCriterion("tenant_a", ac.id);
    expect(archivedAc.status).toBe("archived");
    const links = await registry.service.listVerification("tenant_a", ac.id);
    expect(links).toHaveLength(1);
  });

  it("does not allow AI origin without human acceptance", async () => {
    const registry = createQepDefinitionRegistry();
    await expect(
      registry.service.createStory({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        requirementId: "req-1",
        title: "AI story",
        actorId: "user_1",
        originType: "ai_accepted",
      }),
    ).rejects.toThrow("story.ai_origin_requires_acceptance");
  });

  it("records promotion and create events on the existing requirement audit stream", async () => {
    const registry = createQepDefinitionRegistry();
    await registry.service.promoteLegacyCriteria({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      items: ["One"],
      actorId: "user_1",
    });
    const events = await registry.service.listAudit("tenant_a", "req-1");
    expect(events.some((row) => row.action === "ac.promoted_from_legacy")).toBe(true);
  });

  it("treats uncovered criteria as gap, not a percentage", () => {
    const derived = deriveCriterionCoverage({
      archived: false,
      verificationCount: 0,
      latestResults: [],
    });
    expect(derived.coverage).toBe("gap");
    expect(derived.result).toBe("unverified");
  });
});

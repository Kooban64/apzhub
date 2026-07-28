import { describe, expect, it } from "vitest";

import { createRequirementApplicationService } from "./create-requirement-application-service";
import { createRequirementRelationshipApplicationService } from "./requirement-relationship-application-service";
import { createQepRequirementsPersistenceForTest } from "../../infrastructure";
import { QepForbiddenError } from "../../shared/errors";

const TENANT = "tenant_relationship_app";
const USER = "user_relationship_app";
const PROJECT = "project_1";

function ctx(permissions?: string[]) {
  return {
    tenantId: TENANT,
    userId: USER,
    correlationId: "corr_relationship_app",
    permissions,
  };
}

const ALL = ["qep.requirements.*"];

async function seedRequirements(
  persistence: ReturnType<typeof createQepRequirementsPersistenceForTest>,
) {
  const requirements = createRequirementApplicationService({
    requirements: persistence.requirements,
    audits: persistence.audits,
    lifecycleHistory: persistence.lifecycleHistory,
    contentVersions: persistence.contentVersions,
    id: () => `req_rel_${Math.random().toString(36).slice(2, 8)}`,
    now: () => "2026-07-26T10:00:00.000Z",
  });
  const source = await requirements.createRequirement(ctx(ALL), {
    projectId: PROJECT,
    key: "REQ-SRC",
    title: "Source requirement",
    type: "functional",
    priority: "medium",
  });
  const target = await requirements.createRequirement(ctx(ALL), {
    projectId: PROJECT,
    key: "REQ-TGT",
    title: "Target requirement",
    type: "functional",
    priority: "medium",
  });
  return { source, target };
}

describe("RequirementRelationshipApplicationService", () => {
  it("creates and activates a relationship with in-memory persistence", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const { source, target } = await seedRequirements(persistence);
    let idCounter = 0;
    const service = createRequirementRelationshipApplicationService({
      relationships: persistence.relationships,
      relationshipTaxonomy: persistence.relationshipTaxonomy,
      requirements: persistence.requirements,
      contentVersions: persistence.contentVersions,
      baselines: persistence.baselines,
      audits: persistence.audits,
      id: () => `rrl_test_${++idCounter}`,
      now: () => "2026-07-26T10:00:00.000Z",
    });

    const created = await service.createRelationship(ctx(ALL), {
      type: "depends_on",
      source: { mode: "requirement", requirementId: source.id },
      target: { mode: "requirement", requirementId: target.id },
      rationale: "Source depends on target",
    });
    expect(created.lifecycleState).toBe("draft");

    const activated = await service.activateRelationship(ctx(ALL), created.id);
    expect(activated.lifecycleState).toBe("active");

    const listed = await service.listByRequirement(ctx(ALL), source.id, "outbound");
    expect(listed.some((row) => row.id === created.id)).toBe(true);
  });

  it("denies relationship commands without the required permission", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const { source, target } = await seedRequirements(persistence);
    const service = createRequirementRelationshipApplicationService({
      relationships: persistence.relationships,
      relationshipTaxonomy: persistence.relationshipTaxonomy,
      requirements: persistence.requirements,
      contentVersions: persistence.contentVersions,
      baselines: persistence.baselines,
      audits: persistence.audits,
      id: () => "rrl_denied",
      now: () => "2026-07-26T10:00:00.000Z",
    });

    await expect(
      service.createRelationship(ctx(["qep.requirements.relationships.view"]), {
        type: "depends_on",
        source: { mode: "requirement", requirementId: source.id },
        target: { mode: "requirement", requirementId: target.id },
      }),
    ).rejects.toBeInstanceOf(QepForbiddenError);
  });

  it("records audit and observation for lifecycle transitions", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const { source, target } = await seedRequirements(persistence);
    const observations: string[] = [];
    let idCounter = 0;
    const service = createRequirementRelationshipApplicationService({
      relationships: persistence.relationships,
      relationshipTaxonomy: persistence.relationshipTaxonomy,
      requirements: persistence.requirements,
      contentVersions: persistence.contentVersions,
      baselines: persistence.baselines,
      audits: persistence.audits,
      id: () => `rrl_audit_${++idCounter}`,
      now: () => "2026-07-26T11:00:00.000Z",
      onObservation: (event) => {
        observations.push(`${event.operation}:${event.outcome}`);
      },
    });

    const created = await service.createRelationship(ctx(ALL), {
      type: "conflicts_with",
      source: { mode: "requirement", requirementId: source.id },
      target: { mode: "requirement", requirementId: target.id },
      rationale: "Known conflict",
    });
    await service.activateRelationship(ctx(ALL), created.id);
    await service.deprecateRelationship(ctx(ALL), created.id);
    await service.retireRelationship(ctx(ALL), created.id);

    const audits = await persistence.audits.listByRequirement(
      TENANT,
      created.id as never,
    );
    expect(audits.some((entry) => entry.action.includes("activated"))).toBe(true);
    expect(audits.some((entry) => entry.action.includes("retired"))).toBe(true);
    expect(observations.some((entry) => entry.startsWith("relationship.activate:success"))).toBe(
      true,
    );
  });

  it("does not corrupt relationship state when a search hook throws", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const { source, target } = await seedRequirements(persistence);
    const service = createRequirementRelationshipApplicationService({
      relationships: persistence.relationships,
      relationshipTaxonomy: persistence.relationshipTaxonomy,
      requirements: persistence.requirements,
      contentVersions: persistence.contentVersions,
      baselines: persistence.baselines,
      audits: persistence.audits,
      id: () => "rrl_obs_fail",
      now: () => "2026-07-26T10:00:00.000Z",
      onRelationshipUpserted: () => {
        throw new Error("downstream indexing failed");
      },
    });

    const created = await service.createRelationship(ctx(ALL), {
      type: "relates_to",
      source: { mode: "requirement", requirementId: source.id },
      target: { mode: "requirement", requirementId: target.id },
    });

    const reloaded = await service.getRelationship(ctx(ALL), created.id);
    expect(reloaded?.id).toBe(created.id);
  });
});

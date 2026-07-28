import { describe, expect, it } from "vitest";

import { createRequirementsRelationship } from "../../domain/relationship/relationship";
import {
  QepConflictError,
  QepRelationshipNotFoundError,
  QepRevisionConflictError,
} from "../../shared/errors";
import {
  createEmptyRelationshipStore,
  createInMemoryRequirementsRelationshipRepository,
  createInMemoryRelationshipTaxonomyRepository,
} from "./relationship-repository";

const TENANT = "tenant_relationship_contract";
const ACTOR = "user_relationship_contract";

function draftRelationship(id: string, sourceId: string, targetId: string) {
  return createRequirementsRelationship({
    id,
    tenantId: TENANT,
    type: "depends_on",
    source: { mode: "requirement", requirementId: sourceId },
    target: { mode: "requirement", requirementId: targetId },
    rationale: "Contract test dependency",
    createdAt: "2026-07-26T10:00:00.000Z",
    createdBy: ACTOR,
    correlationId: "corr_relationship_contract",
  });
}

describe("RequirementsRelationshipRepository contract (in-memory)", () => {
  it("implements create -> get -> save with optimistic revision", async () => {
    const store = createEmptyRelationshipStore();
    const repo = createInMemoryRequirementsRelationshipRepository(store);

    const created = await repo.create(
      draftRelationship("rrl_contract_1", "req_source_1", "req_target_1"),
    );
    expect(created.lifecycleState).toBe("draft");
    expect(created.revision).toBe(1);
    expect(await repo.get(TENANT, created.id)).toEqual(created);
    expect(await repo.exists(TENANT, created.id)).toBe(true);

    const listed = await repo.list(TENANT, { requirementId: "req_source_1", direction: "outbound" });
    expect(listed).toHaveLength(1);

    const { changeRelationshipRationale } = await import("../../domain/relationship/relationship");
    const mutated = changeRelationshipRationale(
      created,
      "Updated contract rationale",
      "2026-07-26T10:05:00.000Z",
      ACTOR,
    );
    const saved = await repo.save(mutated, created.revision);
    expect(saved.revision).toBe(2);
    expect(saved.rationale).toBe("Updated contract rationale");
    expect((await repo.listHistory(TENANT, created.id)).length).toBeGreaterThan(1);
  });

  it("rejects duplicate active relationships for the same endpoints and scope", async () => {
    const store = createEmptyRelationshipStore();
    const repo = createInMemoryRequirementsRelationshipRepository(store);
    const first = draftRelationship("rrl_contract_dup_a", "req_dup_1", "req_dup_2");
    await repo.create(first);
    const { activateRequirementsRelationship } = await import("../../domain/relationship/relationship");
    const activated = activateRequirementsRelationship(
      (await repo.get(TENANT, first.id))!,
      "2026-07-26T10:05:00.000Z",
      ACTOR,
      {
        existingEdges: [],
        endpointFacts: [
          { tenantId: TENANT, requirementId: "req_dup_1", exists: true },
          { tenantId: TENANT, requirementId: "req_dup_2", exists: true },
        ],
        pinFacts: [],
        scopeFacts: [],
      },
    );
    await repo.save(activated, 1);

    const duplicate = draftRelationship("rrl_contract_dup_b", "req_dup_1", "req_dup_2");
    const duplicateActivated = activateRequirementsRelationship(
      duplicate,
      "2026-07-26T10:06:00.000Z",
      ACTOR,
      {
        existingEdges: [],
        endpointFacts: [
          { tenantId: TENANT, requirementId: "req_dup_1", exists: true },
          { tenantId: TENANT, requirementId: "req_dup_2", exists: true },
        ],
        pinFacts: [],
        scopeFacts: [],
      },
    );
    await repo.create(duplicate);
    await expect(repo.save(duplicateActivated, 1)).rejects.toThrow(QepConflictError);
  });

  it("throws revision conflict and not-found for invalid saves", async () => {
    const store = createEmptyRelationshipStore();
    const repo = createInMemoryRequirementsRelationshipRepository(store);
    const created = await repo.create(
      draftRelationship("rrl_contract_rev", "req_rev_1", "req_rev_2"),
    );

    const { changeRelationshipRationale } = await import("../../domain/relationship/relationship");
    const mutated = changeRelationshipRationale(
      created,
      "Updated rationale",
      "2026-07-26T10:06:00.000Z",
      ACTOR,
    );

    await expect(repo.save(mutated, 99)).rejects.toThrow(QepRevisionConflictError);
    await expect(
      repo.save(
        { ...mutated, id: "rrl_missing" as typeof created.id },
        1,
      ),
    ).rejects.toThrow(QepRelationshipNotFoundError);
  });

  it("seeds and lists normative taxonomy per tenant", async () => {
    const store = createEmptyRelationshipStore();
    const taxonomy = createInMemoryRelationshipTaxonomyRepository(store);
    await taxonomy.ensureSeeded(TENANT);
    const rows = await taxonomy.list(TENANT);
    expect(rows.some((row) => row.type === "depends_on")).toBe(true);
    expect(await taxonomy.get(TENANT, "supersedes")).not.toBeNull();
  });
});

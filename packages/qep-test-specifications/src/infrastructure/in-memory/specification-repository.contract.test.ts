import { describe, expect, it } from "vitest";

import {
  createTestSpecification,
  updateSpecificationContent,
} from "../../domain/test-specification/test-specification";
import {
  addSpecificationRelationship,
  approveSpecification,
  startSpecificationReview,
} from "../../domain/test-specification/test-specification";
import {
  TestSpecificationConflictError,
  TestSpecificationNotFoundError,
  TestSpecificationRevisionConflictError,
} from "../../shared/errors";
import {
  createEmptyTestSpecificationStore,
  createInMemoryTestSpecificationRepository,
} from "./specification-repository";

const TENANT = "tenant_spec_contract";
const ACTOR = "user_spec_contract";
const CORR = "corr_spec_contract";
const NOW = "2026-07-26T10:00:00.000Z";
const LATER = "2026-07-26T11:00:00.000Z";
const REVIEWER = "reviewer_contract";

function draftSpecification(id: string, number = "TS-CONTRACT-001") {
  return createTestSpecification({
    id,
    tenantId: TENANT,
    number,
    title: "Contract specification",
    description: "Contract description",
    objective: "Contract objective",
    scope: "Contract scope",
    type: "functional",
    classification: "standard",
    owner: ACTOR,
    author: ACTOR,
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: CORR,
  });
}

describe("TestSpecificationRepository contract (in-memory)", () => {
  it("implements create -> get -> save with optimistic revision", async () => {
    const store = createEmptyTestSpecificationStore();
    const repo = createInMemoryTestSpecificationRepository(store);

    const created = await repo.create(draftSpecification("tsp_contract_1"));
    expect(created.record.status).toBe("draft");
    expect(created.revision).toBe(1);
    expect(await repo.get(TENANT, created.record.id)).toEqual(created);
    expect(await repo.exists(TENANT, created.record.id)).toBe(true);

    const listed = await repo.list(TENANT, { number: "TS-CONTRACT-001" });
    expect(listed).toHaveLength(1);

    const mutated = updateSpecificationContent(
      created,
      { title: "Updated contract title" },
      LATER,
      ACTOR,
    );
    const saved = await repo.save(mutated, created.revision);
    expect(saved.revision).toBe(2);
    expect(saved.record.title).toBe("Updated contract title");
    expect((await repo.listHistory(TENANT, created.record.id)).length).toBeGreaterThan(
      1,
    );
  });

  it("throws revision conflict and not-found for invalid saves", async () => {
    const store = createEmptyTestSpecificationStore();
    const repo = createInMemoryTestSpecificationRepository(store);
    const created = await repo.create(draftSpecification("tsp_contract_rev"));

    const mutated = updateSpecificationContent(
      created,
      { title: "Updated title" },
      LATER,
      ACTOR,
    );

    await expect(repo.save(mutated, 99)).rejects.toThrow(
      TestSpecificationRevisionConflictError,
    );
    await expect(
      repo.save(
        {
          ...mutated,
          record: { ...mutated.record, id: "tsp_missing" as typeof created.record.id },
        },
        1,
      ),
    ).rejects.toThrow(TestSpecificationNotFoundError);
  });

  it("lists specifications filtered by status, owner, type, and text query", async () => {
    const store = createEmptyTestSpecificationStore();
    const repo = createInMemoryTestSpecificationRepository(store);
    await repo.create(draftSpecification("tsp_list_a", "TS-LIST-001"));
    const second = draftSpecification("tsp_list_b", "TS-LIST-002");
    await repo.create(
      updateSpecificationContent(second, { tags: ["security"] }, LATER, ACTOR),
    );

    const byStatus = await repo.list(TENANT, { status: "draft" });
    expect(byStatus).toHaveLength(2);

    const byOwner = await repo.list(TENANT, { owner: ACTOR });
    expect(byOwner).toHaveLength(2);

    const byQuery = await repo.list(TENANT, { query: "security" });
    expect(byQuery).toHaveLength(1);
  });

  it("tracks versions by number and finds latest approved", async () => {
    const store = createEmptyTestSpecificationStore();
    const repo = createInMemoryTestSpecificationRepository(store);

    const v1 = await repo.create(draftSpecification("tsp_v1", "TS-VERSION-001"));
    const underReview = startSpecificationReview(v1, REVIEWER, LATER, ACTOR);
    const approved = approveSpecification(underReview, LATER, REVIEWER, "Approved");
    await repo.save(approved, v1.revision);

    const v2Draft = createTestSpecification({
      id: "tsp_v2",
      tenantId: TENANT,
      number: "TS-VERSION-001",
      title: "Version 2",
      description: "v2",
      objective: "v2",
      scope: "v2",
      type: "functional",
      classification: "standard",
      owner: ACTOR,
      author: ACTOR,
      majorVersion: 1,
      minorVersion: 0,
      createdAt: LATER,
      createdBy: ACTOR,
      correlationId: CORR,
    });
    await repo.create(v2Draft);

    const versions = await repo.listVersionsByNumber(TENANT, "TS-VERSION-001");
    expect(versions).toHaveLength(2);

    const latestApproved = await repo.findLatestApprovedByNumber(
      TENANT,
      "TS-VERSION-001",
    );
    expect(latestApproved?.record.id).toBe("tsp_v1");
    expect(latestApproved?.record.status).toBe("approved");
  });

  it("persists and lists relationships", async () => {
    const store = createEmptyTestSpecificationStore();
    const repo = createInMemoryTestSpecificationRepository(store);
    const created = await repo.create(draftSpecification("tsp_rel"));
    const withRelationship = addSpecificationRelationship(
      created,
      {
        id: "tsr_contract_1",
        kind: "requirement",
        artefactId: "req_contract_1",
        owningDomain: "requirements",
      },
      LATER,
      ACTOR,
    );
    await repo.save(withRelationship, created.revision);

    const relationships = await repo.listRelationships(TENANT, created.record.id);
    expect(relationships).toHaveLength(1);
    expect(relationships[0]?.reference.artefactId).toBe("req_contract_1");
  });

  it("throws conflict when creating a duplicate specification id", async () => {
    const store = createEmptyTestSpecificationStore();
    const repo = createInMemoryTestSpecificationRepository(store);
    await repo.create(draftSpecification("tsp_dup"));
    await expect(repo.create(draftSpecification("tsp_dup"))).rejects.toThrow(
      TestSpecificationConflictError,
    );
  });

  it("sorts versions by major version when listing by number", async () => {
    const store = createEmptyTestSpecificationStore();
    const repo = createInMemoryTestSpecificationRepository(store);

    await repo.create(
      createTestSpecification({
        id: "tsp_major_v1",
        tenantId: TENANT,
        number: "TS-MAJOR-001",
        title: "Major v1",
        description: "v1",
        objective: "v1",
        scope: "v1",
        type: "functional",
        classification: "standard",
        owner: ACTOR,
        author: ACTOR,
        majorVersion: 1,
        minorVersion: 0,
        createdAt: NOW,
        createdBy: ACTOR,
        correlationId: CORR,
      }),
    );
    await repo.create(
      createTestSpecification({
        id: "tsp_major_v2",
        tenantId: TENANT,
        number: "TS-MAJOR-001",
        title: "Major v2",
        description: "v2",
        objective: "v2",
        scope: "v2",
        type: "functional",
        classification: "standard",
        owner: ACTOR,
        author: ACTOR,
        majorVersion: 2,
        minorVersion: 0,
        createdAt: LATER,
        createdBy: ACTOR,
        correlationId: CORR,
      }),
    );

    const versions = await repo.listVersionsByNumber(TENANT, "TS-MAJOR-001");
    expect(versions[0]?.record.version.major).toBe(2);
  });
});

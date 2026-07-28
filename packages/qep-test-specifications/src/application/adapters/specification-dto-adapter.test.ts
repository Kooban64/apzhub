import { describe, expect, it } from "vitest";

import {
  addSpecificationRelationship,
  approveSpecification,
  createTestSpecification,
  startSpecificationReview,
} from "../../domain/test-specification/test-specification";
import {
  createEmptyTestSpecificationStore,
  createInMemoryTestSpecificationRepository,
} from "../../infrastructure/in-memory/specification-repository";
import { toSpecificationDto } from "./specification-dto-adapter";

const TENANT = "tenant_dto_adapter";
const ACTOR = "user_dto_adapter";
const REVIEWER = "reviewer_dto_adapter";
const CORR = "corr_dto_adapter";
const NOW = "2026-07-26T12:00:00.000Z";
const LATER = "2026-07-26T13:00:00.000Z";

describe("toSpecificationDto", () => {
  it("maps a stored specification to a platform DTO with available actions", async () => {
    const repo = createInMemoryTestSpecificationRepository(
      createEmptyTestSpecificationStore(),
    );
    const draft = createTestSpecification({
      id: "tsp_dto_1",
      tenantId: TENANT,
      number: "TS-DTO-001",
      title: "DTO specification",
      description: "Description",
      objective: "Objective",
      scope: "Scope",
      type: "functional",
      classification: "standard",
      owner: ACTOR,
      author: ACTOR,
      priority: "high",
      complexity: "moderate",
      preconditions: ["User logged in"],
      postconditions: ["Session active"],
      acceptanceCriteria: ["Login succeeds"],
      risks: [{ id: "risk_1", summary: "Credential leak", severity: "high" }],
      dependencies: [
        {
          id: "dep_1",
          summary: "Auth service",
          referenceKind: "requirement",
          referenceId: "req_auth",
        },
      ],
      tags: ["login", "security"],
      metadata: { environment: "staging" },
      createdAt: NOW,
      createdBy: ACTOR,
      correlationId: CORR,
    });

    const withRelationship = addSpecificationRelationship(
      draft,
      {
        id: "tsr_dto_1",
        kind: "requirement",
        artefactId: "req_dto_1",
        owningDomain: "requirements",
        label: "Login requirement",
      },
      LATER,
      ACTOR,
    );
    const stored = await repo.create(withRelationship);

    const underReview = startSpecificationReview(stored, REVIEWER, LATER, ACTOR);
    const approved = approveSpecification(underReview, LATER, REVIEWER, "Looks good");
    const approvedStored = await repo.save(approved, stored.revision);

    const unrestricted = toSpecificationDto(approvedStored);
    expect(unrestricted.id).toBe("tsp_dto_1");
    expect(unrestricted.tenantId).toBe(TENANT);
    expect(unrestricted.number).toBe("TS-DTO-001");
    expect(unrestricted.title).toBe("DTO specification");
    expect(unrestricted.description).toBe("Description");
    expect(unrestricted.objective).toBe("Objective");
    expect(unrestricted.scope).toBe("Scope");
    expect(unrestricted.status).toBe("approved");
    expect(unrestricted.version).toEqual({ major: 0, minor: 1, label: "0.1" });
    expect(unrestricted.type).toBe("functional");
    expect(unrestricted.priority).toBe("high");
    expect(unrestricted.complexity).toBe("moderate");
    expect(unrestricted.classification).toBe("standard");
    expect(unrestricted.owner).toBe(ACTOR);
    expect(unrestricted.author).toBe(ACTOR);
    expect(unrestricted.reviewer).toBe(REVIEWER);
    expect(unrestricted.preconditions).toEqual(["User logged in"]);
    expect(unrestricted.postconditions).toEqual(["Session active"]);
    expect(unrestricted.acceptanceCriteria).toEqual(["Login succeeds"]);
    expect(unrestricted.risks).toEqual([
      { id: "risk_1", summary: "Credential leak", severity: "high" },
    ]);
    expect(unrestricted.dependencies).toEqual([
      {
        id: "dep_1",
        summary: "Auth service",
        referenceKind: "requirement",
        referenceId: "req_auth",
      },
    ]);
    expect(unrestricted.tags).toEqual(["login", "security"]);
    expect(unrestricted.isAuthoritative).toBe(true);
    expect(unrestricted.approval).toMatchObject({
      decision: "approved",
      decidedBy: REVIEWER,
      approvalComment: "Looks good",
    });
    expect(unrestricted.metadata).toEqual({ environment: "staging" });
    expect(unrestricted.relationships).toEqual([
      {
        id: "tsr_dto_1",
        specificationId: "tsp_dto_1",
        kind: "requirement",
        artefactId: "req_dto_1",
        owningDomain: "requirements",
        label: "Login requirement",
        createdAt: LATER,
        createdBy: ACTOR,
      },
    ]);
    expect(unrestricted.revision).toBe(approvedStored.revision);
    expect(unrestricted.createdAt).toBe(NOW);
    expect(unrestricted.createdBy).toBe(ACTOR);
    expect(unrestricted.updatedAt).toBe(approvedStored.updatedAt);
    expect(unrestricted.updatedBy).toBe(approvedStored.updatedBy);
    expect(unrestricted.correlationId).toBe(CORR);
    expect(unrestricted.versionLineage).toEqual([...approvedStored.versionLineage]);
    expect(unrestricted.reviewStartedAt).toBe(approvedStored.reviewStartedAt);
    expect(unrestricted.reviewStartedBy).toBe(approvedStored.reviewStartedBy);
    expect(unrestricted.historySummaries.length).toBeGreaterThan(1);
    expect(unrestricted.availableActions).toContain("supersede");
    expect(unrestricted.availableActions).toContain("retire");

    const readOnly = toSpecificationDto(approvedStored, ["qep.specification.read"]);
    expect(readOnly.availableActions).toEqual([]);

    const reviewOnly = toSpecificationDto(approvedStored, ["qep.specification.retire"]);
    expect(reviewOnly.availableActions).toEqual(["retire"]);
  });

  it("omits approval when the stored specification has none", async () => {
    const repo = createInMemoryTestSpecificationRepository(
      createEmptyTestSpecificationStore(),
    );
    const draft = createTestSpecification({
      id: "tsp_dto_draft",
      tenantId: TENANT,
      number: "TS-DTO-002",
      title: "Draft only",
      description: "Desc",
      objective: "Obj",
      scope: "Scope",
      type: "functional",
      classification: "standard",
      owner: ACTOR,
      author: ACTOR,
      createdAt: NOW,
      createdBy: ACTOR,
      correlationId: CORR,
    });
    const stored = await repo.create(draft);
    const dto = toSpecificationDto(stored);

    expect(dto.approval).toBeUndefined();
    expect(dto.availableActions).toContain("updateDraft");
    expect(dto.availableActions).toContain("submitForReview");
  });
});

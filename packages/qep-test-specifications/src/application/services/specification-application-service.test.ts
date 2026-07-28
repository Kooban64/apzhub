import { beforeEach, describe, expect, it } from "vitest";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import {
  createQepTestSpecificationPersistenceForTest,
  type QepTestSpecificationRepositories,
} from "../../infrastructure/factories";
import {
  TestSpecificationForbiddenError,
  TestSpecificationInvariantViolation,
  TestSpecificationNotFoundError,
} from "../../shared/errors";
import {
  createSpecificationApplicationService,
  type CreateSpecificationCommandInput,
  type SpecificationApplicationService,
} from "./specification-application-service";

const TENANT = "tenant_spec_app_svc";
const ACTOR = "user_spec_app_svc";
const REVIEWER = "reviewer_spec_app_svc";
const CORR = "corr_spec_app_svc";

const FULL_CTX: QepRequestContext = {
  tenantId: TENANT,
  userId: ACTOR,
  correlationId: CORR,
};

const READ_ONLY_CTX: QepRequestContext = {
  ...FULL_CTX,
  permissions: ["qep.specification.read"],
};

function baseCreateInput(
  overrides: Partial<CreateSpecificationCommandInput> = {},
): CreateSpecificationCommandInput {
  return {
    number: "TS-APP-001",
    title: "Application service specification",
    description: "Desc",
    objective: "Objective",
    scope: "Scope",
    type: "functional",
    classification: "standard",
    owner: ACTOR,
    author: ACTOR,
    tags: ["login"],
    ...overrides,
  };
}

function buildService(): {
  service: SpecificationApplicationService;
  repos: QepTestSpecificationRepositories;
} {
  const repos = createQepTestSpecificationPersistenceForTest({
    allowInMemoryPersistence: true,
  });
  let counter = 0;
  const service = createSpecificationApplicationService({
    specifications: repos.specifications,
    now: () => "2026-07-26T12:00:00.000Z",
    id: () => `tsptest${++counter}`,
  });
  return { service, repos };
}

describe("SpecificationApplicationService", () => {
  let service: SpecificationApplicationService;

  beforeEach(() => {
    ({ service } = buildService());
  });

  it("creates a Specification in draft and enforces the create permission", async () => {
    await expect(
      service.createSpecification(READ_ONLY_CTX, baseCreateInput()),
    ).rejects.toThrow(TestSpecificationForbiddenError);

    const created = await service.createSpecification(FULL_CTX, baseCreateInput());
    expect(created.record.status).toBe("draft");
    expect(created.record.number).toBe("TS-APP-001");
  });

  it("drives the full lifecycle: draft -> review -> approve", async () => {
    const created = await service.createSpecification(FULL_CTX, baseCreateInput());

    const updated = await service.updateDraft(FULL_CTX, created.record.id, {
      content: { title: "Updated title" },
      metadata: { risk: "medium" },
    });
    expect(updated.record.title).toBe("Updated title");
    expect(updated.metadata.entries.risk).toBe("medium");

    const underReview = await service.submitForReview(FULL_CTX, created.record.id, {
      reviewerId: REVIEWER,
    });
    expect(underReview.record.status).toBe("under_review");
    expect(underReview.record.reviewer).toBe(REVIEWER);

    const approved = await service.approve(FULL_CTX, created.record.id, {
      approvalComment: "Approved for release",
    });
    expect(approved.record.status).toBe("approved");
    expect(approved.record.isAuthoritative).toBe(true);
    expect(approved.approval?.decision).toBe("approved");
  });

  it("rejects a specification under review", async () => {
    const created = await service.createSpecification(FULL_CTX, baseCreateInput());
    await service.submitForReview(FULL_CTX, created.record.id, {
      reviewerId: REVIEWER,
    });

    const rejected = await service.reject(FULL_CTX, created.record.id, {
      reviewComment: "Needs more detail",
    });
    expect(rejected.record.status).toBe("rejected");
  });

  it("withdraws and cancels draft specifications", async () => {
    const created = await service.createSpecification(FULL_CTX, baseCreateInput());

    const cancelled = await service.cancel(FULL_CTX, created.record.id);
    expect(cancelled.record.status).toBe("cancelled");

    const created2 = await service.createSpecification(
      FULL_CTX,
      baseCreateInput({ number: "TS-APP-002" }),
    );
    const withdrawn = await service.withdraw(FULL_CTX, created2.record.id);
    expect(withdrawn.record.status).toBe("withdrawn");
  });

  it("supersedes with an existing successor", async () => {
    const approved = await driveToApproved(service);

    const successor = await service.createSpecification(
      FULL_CTX,
      baseCreateInput({ number: "TS-APP-002" }),
    );

    const { predecessor } = await service.supersede(FULL_CTX, approved.record.id, {
      successorSpecificationId: successor.record.id,
    });
    expect(predecessor.record.status).toBe("superseded");
    expect(predecessor.record.successorSpecificationId).toBe(successor.record.id);
  });

  it("supersedes by creating a successor draft in one operation", async () => {
    const approved = await driveToApproved(service);

    const { predecessor, successor } = await service.supersede(
      FULL_CTX,
      approved.record.id,
      {
        createSuccessor: {
          bump: "minor",
          title: "Successor draft",
        },
      },
    );
    expect(predecessor.record.status).toBe("superseded");
    expect(successor?.record.status).toBe("draft");
    expect(successor?.record.number).toBe(approved.record.number);
    expect(successor?.record.version.minor).toBeGreaterThan(
      approved.record.version.minor,
    );
  });

  it("retires an approved specification", async () => {
    const approved = await driveToApproved(service);
    const retired = await service.retire(FULL_CTX, approved.record.id);
    expect(retired.record.status).toBe("retired");
  });

  it("manages relationships on draft specifications", async () => {
    const created = await service.createSpecification(FULL_CTX, baseCreateInput());

    const withRelationship = await service.addRelationship(
      FULL_CTX,
      created.record.id,
      {
        id: "tsr_app_1",
        kind: "requirement",
        artefactId: "req_app_1",
        owningDomain: "requirements",
      },
    );
    expect(withRelationship.relationships).toHaveLength(1);

    const removed = await service.removeRelationship(
      FULL_CTX,
      created.record.id,
      "tsr_app_1",
    );
    expect(removed.relationships).toHaveLength(0);
  });

  it("lists, searches, and paginates specifications", async () => {
    await service.createSpecification(FULL_CTX, baseCreateInput());
    await service.createSpecification(
      FULL_CTX,
      baseCreateInput({
        number: "TS-APP-SEARCH",
        title: "Searchable login flow",
        tags: [],
      }),
    );

    const listed = await service.list(FULL_CTX, { type: "functional" });
    expect(listed.items).toHaveLength(2);
    expect(listed.total).toBe(2);

    const searched = await service.search(FULL_CTX, "login");
    expect(searched.items.length).toBeGreaterThanOrEqual(1);
  });

  it("lists history, versions, and latest approved by number", async () => {
    const approved = await driveToApproved(service);

    const history = await service.listHistory(FULL_CTX, approved.record.id);
    expect(history.length).toBeGreaterThan(1);

    const versions = await service.listVersions(FULL_CTX, approved.record.id);
    expect(versions.length).toBeGreaterThanOrEqual(1);

    const latest = await service.findLatestApproved(FULL_CTX, approved.record.number);
    expect(latest?.record.id).toBe(approved.record.id);
  });

  it("throws not-found for unknown specification ids on mutation", async () => {
    await expect(
      service.submitForReview(FULL_CTX, "tsp_does_not_exist", { reviewerId: REVIEWER }),
    ).rejects.toThrow(TestSpecificationNotFoundError);
  });

  it("requires successor or createSuccessor for supersede", async () => {
    const approved = await driveToApproved(service);
    await expect(service.supersede(FULL_CTX, approved.record.id, {})).rejects.toThrow(
      TestSpecificationInvariantViolation,
    );
  });

  it("rejects supersede when the successor id does not exist", async () => {
    const approved = await driveToApproved(service);
    await expect(
      service.supersede(FULL_CTX, approved.record.id, {
        successorSpecificationId: "tsp_missing_successor",
      }),
    ).rejects.toThrow(TestSpecificationInvariantViolation);
  });

  it("gets a specification by id and returns null when missing", async () => {
    const created = await service.createSpecification(FULL_CTX, baseCreateInput());
    const found = await service.get(READ_ONLY_CTX, created.record.id);
    expect(found?.record.id).toBe(created.record.id);

    const missing = await service.get(READ_ONLY_CTX, "tsp_not_found");
    expect(missing).toBeNull();
  });

  it("lists relationships for a specification", async () => {
    const created = await service.createSpecification(FULL_CTX, baseCreateInput());
    await service.addRelationship(FULL_CTX, created.record.id, {
      id: "tsr_list_rel",
      kind: "requirement",
      artefactId: "req_list_rel",
      owningDomain: "requirements",
    });

    const relationships = await service.listRelationships(
      READ_ONLY_CTX,
      created.record.id,
    );
    expect(relationships).toHaveLength(1);
    expect(relationships[0]?.reference.artefactId).toBe("req_list_rel");
  });

  it("returns null from findLatestApproved when no approved version exists", async () => {
    await service.createSpecification(
      FULL_CTX,
      baseCreateInput({ number: "TS-APP-NO-APPROVED" }),
    );
    const latest = await service.findLatestApproved(
      READ_ONLY_CTX,
      "TS-APP-NO-APPROVED",
    );
    expect(latest).toBeNull();
  });

  it("returns empty search results when nothing matches", async () => {
    await service.createSpecification(FULL_CTX, baseCreateInput());
    const searched = await service.search(READ_ONLY_CTX, "does-not-match-anything");
    expect(searched.items).toHaveLength(0);
    expect(searched.total).toBe(0);
  });

  it("supports audit, observation, transaction, and projection hooks", async () => {
    const auditEntries: unknown[] = [];
    const observations: string[] = [];
    const domainEvents: string[] = [];
    let transactionRuns = 0;

    const repos = createQepTestSpecificationPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const hookedService = createSpecificationApplicationService({
      specifications: repos.specifications,
      now: () => "2026-07-26T12:00:00.000Z",
      id: () => "tsp_hooked_1",
      audits: {
        append: async (entry) => {
          auditEntries.push(entry);
        },
      },
      onObservation: (event) => {
        observations.push(`${event.operation}:${event.outcome}`);
      },
      onDomainEvent: async (event) => {
        domainEvents.push(event.type);
      },
      onSpecificationUpserted: async () => {
        throw new Error("projection failed");
      },
      runInTransaction: async (work) => {
        transactionRuns += 1;
        return work();
      },
    });

    const created = await hookedService.createSpecification(
      FULL_CTX,
      baseCreateInput(),
    );
    expect(created.record.id).toBe("tsp_hooked_1");
    expect(auditEntries.length).toBeGreaterThan(0);
    expect(domainEvents).toContain("qep.specification.created");
    expect(observations.some((entry) => entry.endsWith(":success"))).toBe(true);
    expect(transactionRuns).toBeGreaterThan(0);

    await expect(
      hookedService.createSpecification(
        READ_ONLY_CTX,
        baseCreateInput({ number: "TS-APP-FORBIDDEN" }),
      ),
    ).rejects.toThrow(TestSpecificationForbiddenError);
    expect(observations.some((entry) => entry.endsWith(":error"))).toBe(true);
  });

  it("allows wildcard permissions to bypass explicit grants", async () => {
    const wildcardCtx: QepRequestContext = {
      ...FULL_CTX,
      permissions: ["qep.specification.*"],
    };
    const created = await service.createSpecification(
      wildcardCtx,
      baseCreateInput({ number: "TS-APP-WILD" }),
    );
    expect(created.record.number).toBe("TS-APP-WILD");
  });
});

async function driveToApproved(service: SpecificationApplicationService) {
  const created = await service.createSpecification(FULL_CTX, baseCreateInput());
  await service.submitForReview(FULL_CTX, created.record.id, { reviewerId: REVIEWER });
  return service.approve(FULL_CTX, created.record.id);
}

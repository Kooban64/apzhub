/**
 * Mocked PostgreSQL Test Specification repository coverage (APZQEP-ENG-050B).
 */
import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";

import {
  addSpecificationRelationship,
  approveSpecification,
  createTestSpecification,
  startSpecificationReview,
  updateSpecificationContent,
} from "../../domain/test-specification/test-specification";
import {
  TestSpecificationConflictError,
  TestSpecificationNotFoundError,
  TestSpecificationRevisionConflictError,
} from "../../shared/errors";
import { createPostgresTestSpecificationRepository } from "./specification-repository";

const TENANT = "tenant_pg_spec";
const ACTOR = "user_pg_spec";
const REVIEWER = "reviewer_pg_spec";
const CORR = "corr_pg_spec";
const NOW = new Date("2026-07-26T10:00:00.000Z");
const LATER = new Date("2026-07-26T11:00:00.000Z");

type MockDbOptions = {
  readonly selectResults?: readonly (readonly unknown[])[];
  readonly insertReturning?: readonly unknown[];
  readonly updateReturning?: readonly unknown[];
  readonly insertError?: unknown;
  readonly updateError?: unknown;
};

function thenableChain(rows: unknown[]) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.from = vi.fn(self);
  api.where = vi.fn(self);
  api.limit = vi.fn(async () => rows);
  api.orderBy = vi.fn(async () => rows);
  api.then = (
    resolve: (value: unknown) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise.resolve(rows).then(resolve, reject);
  return api;
}

function createMockDb(options: MockDbOptions = {}) {
  let selectCall = 0;
  const values = vi.fn((_payload: unknown) => {
    const builder: Record<string, unknown> = {
      returning: vi.fn(async () => options.insertReturning ?? []),
      onConflictDoUpdate: vi.fn(async () => undefined),
    };
    if (options.insertError) {
      builder.returning = vi.fn(async () => {
        throw options.insertError;
      });
      builder.onConflictDoUpdate = vi.fn(async () => {
        throw options.insertError;
      });
    }
    return builder;
  });
  const insert = vi.fn(() => ({ values }));
  const update = vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(async () => {
          if (options.updateError) throw options.updateError;
          return options.updateReturning ?? [];
        }),
      })),
    })),
  }));
  const del = vi.fn(() => ({
    where: vi.fn(async () => undefined),
  }));
  const select = vi.fn(() => {
    const rows = options.selectResults?.[selectCall] ?? [];
    selectCall += 1;
    return thenableChain([...rows]);
  });

  const db = {
    insert,
    update,
    delete: del,
    select,
  } as unknown as DatabaseExecutor;

  return { db, insert, update, del, select, values };
}

function baseSpecRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "tsp_pg_1",
    tenantId: TENANT,
    number: "TS-PG-001",
    title: "Postgres specification",
    description: "Description",
    objective: "Objective",
    scope: "Scope",
    status: "draft",
    type: "functional",
    priority: "medium",
    complexity: "simple",
    classification: "standard",
    owner: ACTOR,
    author: ACTOR,
    reviewer: null,
    majorVersion: 0,
    minorVersion: 1,
    versionLabel: "0.1",
    isAuthoritative: false,
    preconditionsJson: ["Pre"],
    postconditionsJson: ["Post"],
    acceptanceCriteriaJson: ["AC"],
    risksJson: [{ id: "risk_1", summary: "Risk", severity: "low" }],
    dependenciesJson: [{ id: "dep_1", summary: "Dep" }],
    tagsJson: ["tag-a"],
    metadataJson: { lane: "qa" },
    predecessorSpecificationId: null,
    successorSpecificationId: null,
    comparisonNotes: null,
    approvalDecision: null,
    approvalDecidedAt: null,
    approvalDecidedBy: null,
    approvalReviewComment: null,
    approvalApprovalComment: null,
    revision: 1,
    reviewStartedAt: null,
    reviewStartedBy: null,
    withdrawnAt: null,
    cancelledAt: null,
    retiredAt: null,
    supersededAt: null,
    versionLineageJson: [],
    createdAt: NOW,
    createdBy: ACTOR,
    updatedAt: NOW,
    updatedBy: ACTOR,
    correlationId: CORR,
    ...overrides,
  };
}

function approvedSpecRow(overrides: Record<string, unknown> = {}) {
  return baseSpecRow({
    status: "approved",
    isAuthoritative: true,
    reviewer: REVIEWER,
    approvalDecision: "approved",
    approvalDecidedAt: LATER,
    approvalDecidedBy: REVIEWER,
    approvalApprovalComment: "Approved",
    reviewStartedAt: NOW,
    reviewStartedBy: ACTOR,
    updatedAt: LATER,
    updatedBy: REVIEWER,
    ...overrides,
  });
}

function draftSpecification(id = "tsp_pg_create") {
  return createTestSpecification({
    id,
    tenantId: TENANT,
    number: "TS-PG-CREATE",
    title: "Create path",
    description: "Description",
    objective: "Objective",
    scope: "Scope",
    type: "functional",
    classification: "standard",
    owner: ACTOR,
    author: ACTOR,
    tags: ["create"],
    metadata: { source: "test" },
    createdAt: NOW.toISOString(),
    createdBy: ACTOR,
    correlationId: CORR,
  });
}

describe("Postgres TestSpecificationRepository", () => {
  it("creates a specification and maps the returned row", async () => {
    const row = baseSpecRow({
      id: "tsp_pg_create",
      number: "TS-PG-CREATE",
      title: "Create path",
      metadataJson: { source: "test" },
    });
    const { db } = createMockDb({
      insertReturning: [row],
      selectResults: [[], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const created = await repo.create(draftSpecification());
    expect(created.record.id).toBe("tsp_pg_create");
    expect(created.record.title).toBe("Create path");
    expect(created.metadata.entries.source).toBe("test");
    expect(created.record.preconditions.items).toEqual(["Pre"]);
  });

  it("throws conflict when create hits a unique violation", async () => {
    const { db } = createMockDb({
      insertError: { code: "23505" },
    });
    const repo = createPostgresTestSpecificationRepository(db);

    await expect(repo.create(draftSpecification())).rejects.toThrow(
      TestSpecificationConflictError,
    );
  });

  it("returns null when get finds no row", async () => {
    const { db } = createMockDb({ selectResults: [[]] });
    const repo = createPostgresTestSpecificationRepository(db);

    const result = await repo.get(TENANT, "tsp_missing" as never);
    expect(result).toBeNull();
  });

  it("loads a specification with history, relationships, and approval", async () => {
    const row = approvedSpecRow({
      id: "tsp_pg_get",
      predecessorSpecificationId: "tsp_prev",
      successorSpecificationId: "tsp_succ",
      comparisonNotes: "Compared",
    });
    const historyRow = {
      occurredAt: LATER,
      actorUserId: REVIEWER,
      kind: "approved",
      summary: "Approved",
    };
    const relationshipRow = {
      id: "tsr_pg_1",
      specificationId: "tsp_pg_get",
      kind: "requirement",
      artefactId: "req_pg_1",
      owningDomain: "requirements",
      label: "Req",
      createdAt: NOW,
      createdBy: ACTOR,
    };
    const { db } = createMockDb({
      selectResults: [[row], [historyRow], [relationshipRow]],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const loaded = await repo.get(TENANT, "tsp_pg_get" as never);
    expect(loaded?.record.status).toBe("approved");
    expect(loaded?.record.predecessorSpecificationId).toBe("tsp_prev");
    expect(loaded?.record.successorSpecificationId).toBe("tsp_succ");
    expect(loaded?.record.comparisonNotes).toBe("Compared");
    expect(loaded?.approval?.decision).toBe("approved");
    expect(loaded?.history.entries).toHaveLength(1);
    expect(loaded?.relationships[0]?.reference.artefactId).toBe("req_pg_1");
  });

  it("throws revision conflict when save returns no row but the specification exists", async () => {
    const existing = baseSpecRow({ id: "tsp_pg_rev", revision: 2 });
    const { db } = createMockDb({
      updateReturning: [],
      selectResults: [[existing], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    await expect(
      repo.save(
        updateSpecificationContent(
          {
            ...draftSpecification("tsp_pg_rev"),
            revision: 2,
          } as never,
          { title: "Updated" },
          LATER.toISOString(),
          ACTOR,
        ),
        1,
      ),
    ).rejects.toThrow(TestSpecificationRevisionConflictError);
  });

  it("throws not-found when save returns no row and the specification is missing", async () => {
    const { db } = createMockDb({
      updateReturning: [],
      selectResults: [[]],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    await expect(repo.save(draftSpecification("tsp_pg_missing"), 1)).rejects.toThrow(
      TestSpecificationNotFoundError,
    );
  });

  it("saves successfully and reloads history and relationships", async () => {
    const savedRow = baseSpecRow({
      id: "tsp_pg_save",
      title: "Saved title",
      revision: 2,
    });
    const historyRow = {
      occurredAt: LATER,
      actorUserId: ACTOR,
      kind: "updated",
      summary: "Updated title",
    };
    const relationshipRow = {
      id: "tsr_pg_save",
      specificationId: "tsp_pg_save",
      kind: "requirement",
      artefactId: "req_save",
      owningDomain: null,
      label: null,
      createdAt: LATER,
      createdBy: ACTOR,
    };
    const { db } = createMockDb({
      updateReturning: [savedRow],
      selectResults: [[], [historyRow], [relationshipRow]],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const saved = await repo.save(
      updateSpecificationContent(
        {
          ...draftSpecification("tsp_pg_save"),
          revision: 2,
          updatedAt: LATER.toISOString(),
          updatedBy: ACTOR,
        } as never,
        { title: "Saved title" },
        LATER.toISOString(),
        ACTOR,
      ),
      1,
    );
    expect(saved.record.title).toBe("Saved title");
    expect(saved.revision).toBe(2);
    expect(saved.history.entries).toHaveLength(1);
    expect(saved.relationships[0]?.reference.artefactId).toBe("req_save");
  });

  it("throws conflict when save hits a unique violation", async () => {
    const { db } = createMockDb({
      updateError: { code: "23505" },
    });
    const repo = createPostgresTestSpecificationRepository(db);

    await expect(repo.save(draftSpecification("tsp_pg_unique"), 1)).rejects.toThrow(
      TestSpecificationConflictError,
    );
  });

  it("lists specifications with filters, pagination, and relationship reload", async () => {
    const rowA = baseSpecRow({ id: "tsp_pg_list_a", tagsJson: ["alpha"] });
    const rowB = baseSpecRow({
      id: "tsp_pg_list_b",
      number: "TS-PG-002",
      title: "Second",
      tagsJson: ["beta"],
      updatedAt: LATER,
    });
    const { db } = createMockDb({
      selectResults: [[rowA, rowB], [], [], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const listed = await repo.list(TENANT, {
      status: "draft",
      query: "alpha",
      offset: 0,
      limit: 10,
    });
    expect(listed).toHaveLength(1);
    expect(listed[0]?.record.id).toBe("tsp_pg_list_a");
  });

  it("applies classification, priority, and authoritative list filters", async () => {
    const row = baseSpecRow({
      id: "tsp_pg_filters",
      classification: "restricted",
      priority: "high",
      isAuthoritative: true,
    });
    const { db } = createMockDb({
      selectResults: [[row], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const listed = await repo.list(TENANT, {
      classification: "restricted",
      priority: "high",
      isAuthoritative: true,
    });
    expect(listed).toHaveLength(1);
    expect(listed[0]?.record.classification).toBe("restricted");
  });

  it("reports existence and lists history and relationships", async () => {
    const row = baseSpecRow({ id: "tsp_pg_exists" });
    const historyRow = {
      occurredAt: NOW,
      actorUserId: ACTOR,
      kind: "created",
      summary: "Created",
    };
    const relationshipRow = {
      id: "tsr_pg_exists",
      specificationId: "tsp_pg_exists",
      kind: "requirement",
      artefactId: "req_exists",
      owningDomain: "requirements",
      label: "Exists",
      createdAt: NOW,
      createdBy: ACTOR,
    };
    const { db } = createMockDb({
      selectResults: [[{ id: "tsp_pg_exists" }], [historyRow], [relationshipRow]],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    expect(await repo.exists(TENANT, "tsp_pg_exists" as never)).toBe(true);
    expect(await repo.listHistory(TENANT, "tsp_pg_exists" as never)).toHaveLength(1);
    const relationships = await repo.listRelationships(
      TENANT,
      "tsp_pg_exists" as never,
    );
    expect(relationships[0]?.reference.label).toBe("Exists");
    expect(row.id).toBe("tsp_pg_exists");
  });

  it("lists versions by number", async () => {
    const approvedRow = approvedSpecRow({ id: "tsp_pg_v1" });
    const draftRow = baseSpecRow({
      id: "tsp_pg_v2",
      status: "draft",
      isAuthoritative: false,
      minorVersion: 2,
      versionLabel: "0.2",
    });
    const versionRows = [
      {
        specificationId: "tsp_pg_v2",
        specificationNumber: "TS-PG-001",
        majorVersion: 0,
        minorVersion: 2,
      },
      {
        specificationId: "tsp_pg_v1",
        specificationNumber: "TS-PG-001",
        majorVersion: 0,
        minorVersion: 1,
      },
    ];
    const { db } = createMockDb({
      selectResults: [versionRows, [draftRow], [], [], [approvedRow], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const versions = await repo.listVersionsByNumber(TENANT, "TS-PG-001");
    expect(versions).toHaveLength(2);
    expect(versions[0]?.record.id).toBe("tsp_pg_v2");
  });

  it("finds the latest approved authoritative version by number", async () => {
    const approvedRow = approvedSpecRow({ id: "tsp_pg_v1" });
    const draftRow = baseSpecRow({
      id: "tsp_pg_v2",
      status: "draft",
      isAuthoritative: false,
      minorVersion: 2,
      versionLabel: "0.2",
    });
    const versionRows = [
      {
        specificationId: "tsp_pg_v2",
        specificationNumber: "TS-PG-001",
        majorVersion: 0,
        minorVersion: 2,
      },
      {
        specificationId: "tsp_pg_v1",
        specificationNumber: "TS-PG-001",
        majorVersion: 0,
        minorVersion: 1,
      },
    ];
    const { db } = createMockDb({
      selectResults: [versionRows, [draftRow], [], [], [approvedRow], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const latest = await repo.findLatestApprovedByNumber(TENANT, "TS-PG-001");
    expect(latest?.record.id).toBe("tsp_pg_v1");
    expect(latest?.record.isAuthoritative).toBe(true);
  });

  it("finds latest approved without authoritative flag when none are authoritative", async () => {
    const approvedNonAuth = approvedSpecRow({
      id: "tsp_pg_v3",
      isAuthoritative: false,
    });
    const versionRows = [
      {
        specificationId: "tsp_pg_v3",
        specificationNumber: "TS-PG-003",
        majorVersion: 0,
        minorVersion: 1,
      },
    ];
    const { db } = createMockDb({
      selectResults: [versionRows, [approvedNonAuth], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const latest = await repo.findLatestApprovedByNumber(TENANT, "TS-PG-003");
    expect(latest?.record.status).toBe("approved");
    expect(latest?.record.isAuthoritative).toBe(false);
  });

  it("returns null from findLatestApproved when no approved versions exist", async () => {
    const draftRow = baseSpecRow({ id: "tsp_pg_v4", status: "draft" });
    const versionRows = [
      {
        specificationId: "tsp_pg_v4",
        specificationNumber: "TS-PG-004",
        majorVersion: 0,
        minorVersion: 1,
      },
    ];
    const { db } = createMockDb({
      selectResults: [versionRows, [draftRow], [], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const latest = await repo.findLatestApprovedByNumber(TENANT, "TS-PG-004");
    expect(latest).toBeNull();
  });

  it("persists relationships on create when the aggregate includes them", async () => {
    const withRelationship = addSpecificationRelationship(
      draftSpecification("tsp_pg_rel"),
      {
        id: "tsr_pg_rel",
        kind: "requirement",
        artefactId: "req_rel",
        owningDomain: "requirements",
      },
      LATER.toISOString(),
      ACTOR,
    );
    const row = baseSpecRow({ id: "tsp_pg_rel" });
    const { db, values } = createMockDb({
      insertReturning: [row],
      selectResults: [[], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const created = await repo.create(withRelationship);
    expect(created.relationships).toHaveLength(1);
    expect(values).toHaveBeenCalled();
  });

  it("maps approved lifecycle rows produced by domain transitions", async () => {
    let stored = draftSpecification("tsp_pg_lifecycle");
    stored = startSpecificationReview(stored, REVIEWER, LATER.toISOString(), ACTOR);
    stored = approveSpecification(stored, LATER.toISOString(), REVIEWER, "OK");
    const row = approvedSpecRow({ id: "tsp_pg_lifecycle" });
    const { db } = createMockDb({
      insertReturning: [row],
      selectResults: [[], []],
    });
    const repo = createPostgresTestSpecificationRepository(db);

    const created = await repo.create(stored);
    expect(created.record.status).toBe("approved");
    expect(created.approval?.approvalComment).toBe("Approved");
  });
});

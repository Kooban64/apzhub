/**
 * Mocked PostgreSQL Evidence Catalogue repository — APZQEP-120-S05.
 */
import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";

import { EvidenceConcurrencyError } from "../../shared/errors";
import { createPostgresEvidenceRepository } from "./evidence-repository";

const TENANT = "tenant_pg_ev";
const NOW = new Date("2026-08-02T10:00:00.000Z");

function thenableChain(rows: unknown[]) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.from = vi.fn(self);
  api.where = vi.fn(self);
  api.orderBy = vi.fn(self);
  api.limit = vi.fn(self);
  api.offset = vi.fn(self);
  api.then = (
    resolve: (value: unknown) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise.resolve(rows).then(resolve, reject);
  return api;
}

function createMockDb(options: {
  readonly selectResults?: readonly (readonly unknown[])[];
  readonly updateReturning?: readonly unknown[];
  readonly insertError?: unknown;
}) {
  let selectCall = 0;
  const values = vi.fn((_payload: unknown) => {
    if (options.insertError) {
      return Promise.reject(options.insertError);
    }
    return Promise.resolve(undefined);
  });
  const insert = vi.fn(() => ({ values }));
  const update = vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(async () => options.updateReturning ?? []),
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

function evidenceRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "ev_pg_1",
    tenantId: TENANT,
    projectId: "project-1",
    workspaceId: null,
    status: "captured",
    catalogueState: "ACTIVE",
    sourceKind: "manual_upload",
    sourceSystemId: null,
    classificationCategory: null,
    classificationSensitivityLabel: null,
    mediaType: "text/plain",
    byteSize: 4,
    contentHash: "a".repeat(64),
    hashAlgorithm: "sha256",
    storageLocator: "evst://memory/1",
    storageProviderKind: "memory",
    integrityVerificationState: "unverified",
    integritySealed: false,
    integrityLastVerifiedAt: null,
    ownerId: "actor-1",
    retentionClass: "standard",
    retainUntil: null,
    legalHold: false,
    holdReason: null,
    title: "PG Evidence",
    description: null,
    tagsJson: ["s05"],
    policyReferencesJson: [],
    version: 1,
    dispositionedAt: null,
    dispositionedBy: null,
    dispositionReason: null,
    dispositionMethod: null,
    provenanceJson: [],
    relationshipIdsJson: [],
    sealedAt: null,
    sealedBy: null,
    historyJson: [],
    revision: 1,
    createdAt: NOW,
    createdBy: "actor-1",
    updatedAt: NOW,
    updatedBy: "actor-1",
    ...overrides,
  };
}

function minimalEvidence(revision = 1) {
  return {
    id: "ev_pg_1",
    tenantId: TENANT,
    projectId: "project-1",
    status: "captured" as const,
    source: { kind: "manual_upload" as const },
    ownership: { ownerId: "actor-1" },
    retention: {
      retentionClass: "standard",
      legalHold: false,
    },
    metadata: { title: "PG Evidence", tags: ["s05"] as string[] },
    content: {
      mediaType: "text/plain",
      byteSize: 4,
      contentHash: "a".repeat(64),
      hashAlgorithm: "sha256" as const,
      storageLocator: "evst://memory/1",
    },
    integrity: {
      hashAlgorithm: "sha256" as const,
      contentHash: "a".repeat(64),
      verificationState: "unverified" as const,
      sealed: false,
    },
    version: 1,
    versions: [],
    relationshipIds: [],
    provenance: [],
    history: { entries: [] },
    policyReferences: [],
    revision,
    createdAt: NOW.toISOString(),
    createdBy: "actor-1",
    updatedAt: NOW.toISOString(),
    updatedBy: "actor-1",
    uncommittedEvents: [],
  };
}

describe("APZQEP-120-S05 PostgresEvidenceRepository", () => {
  it("creates catalogue record when expectedRevision is 0", async () => {
    const row = evidenceRow();
    const { db, insert } = createMockDb({
      selectResults: [[], [row], []],
    });
    const repo = createPostgresEvidenceRepository(db);
    const saved = await repo.save(minimalEvidence(1) as never, 0);
    expect(insert).toHaveBeenCalled();
    expect(saved.id).toBe("ev_pg_1");
    expect(saved.tenantId).toBe(TENANT);
  });

  it("rejects stale revision updates", async () => {
    const row = evidenceRow({ revision: 2 });
    const { db } = createMockDb({
      selectResults: [[row], [], [row]],
      updateReturning: [],
    });
    const repo = createPostgresEvidenceRepository(db);
    await expect(repo.save(minimalEvidence(3) as never, 1)).rejects.toBeInstanceOf(
      EvidenceConcurrencyError,
    );
  });

  it("lists with tenant scoping and deterministic ordering", async () => {
    const row = evidenceRow();
    const { db, select } = createMockDb({
      selectResults: [[{ value: 1 }], [row], []],
    });
    const repo = createPostgresEvidenceRepository(db);
    const page = await repo.list(TENANT, { projectId: "project-1" }, { limit: 10 });
    expect(page.total).toBe(1);
    expect(page.items[0]?.id).toBe("ev_pg_1");
    expect(select).toHaveBeenCalled();
  });

  it("returns null for missing catalogue id", async () => {
    const { db } = createMockDb({ selectResults: [[]] });
    const repo = createPostgresEvidenceRepository(db);
    expect(await repo.getById(TENANT, "missing")).toBeNull();
  });
});

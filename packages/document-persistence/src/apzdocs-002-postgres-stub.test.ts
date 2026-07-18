/**
 * Lightweight Postgres repository smoke tests with a stub DatabaseExecutor (APZDOCS-002).
 * Exercises query wiring without a live database.
 */

import { describe, expect, it, vi } from "vitest";

import type { DocumentRequestContext } from "@apzhub/document-contracts";
import { asDocumentId, asDocumentVersionId } from "@apzhub/document-contracts";

import { createPostgresDocumentRepositories } from "./postgres/postgres-repositories";

function ctx(): DocumentRequestContext {
  return {
    tenantId: "tenant_pg",
    userId: "user_pg",
    organisationId: "org_pg",
    permissions: ["document.*"],
  };
}

function createStubDb() {
  const rows: Record<string, unknown[]> = {
    platform_document: [],
    platform_document_version: [],
    platform_document_storage_object: [],
    platform_document_tag: [],
    platform_document_metadata: [],
    platform_document_relationship: [],
    platform_document_audit: [],
  };

  const makeChain = (): Record<string, unknown> => {
    const c: Record<string, unknown> = {};
    const self = () => c;
    c.select = vi.fn(self);
    c.from = vi.fn(self);
    c.where = vi.fn(self);
    c.orderBy = vi.fn(self);
    c.limit = vi.fn(async () => []);
    c.values = vi.fn(self);
    c.set = vi.fn(self);
    c.onConflictDoUpdate = vi.fn(self);
    c.returning = vi.fn(async () => []);
    c.then = (resolve: (v: unknown) => unknown) => Promise.resolve([]).then(resolve);
    return c;
  };

  return {
    insert: vi.fn(() => makeChain()),
    update: vi.fn(() => makeChain()),
    select: vi.fn(() => makeChain()),
    delete: vi.fn(() => makeChain()),
    execute: vi.fn(async () => ({ rows: [] })),
    _rows: rows,
  } as never;
}

describe("APZDOCS-002 postgres repositories (stubbed)", () => {
  it("creates repositories and returns null for missing documents", async () => {
    const db = createStubDb();
    const repos = createPostgresDocumentRepositories(db);
    expect(repos.documents).toBeDefined();
    expect(repos.versions).toBeDefined();
    expect(repos.storageObjects).toBeDefined();
    expect(await repos.documents.get(ctx(), asDocumentId("missing"))).toBeNull();
    expect(
      await repos.versions.get(
        ctx(),
        asDocumentId("missing"),
        asDocumentVersionId("v_missing"),
      ),
    ).toBeNull();
  });

  it("lists empty document/version collections via stub chains", async () => {
    const db = createStubDb();
    const repos = createPostgresDocumentRepositories(db);
    expect(await repos.documents.list(ctx())).toEqual([]);
    expect(await repos.versions.listByDocument(ctx(), asDocumentId("doc"))).toEqual([]);
    expect(await repos.tags.list(ctx())).toEqual([]);
    expect(await repos.storageObjects.listReconciliationCandidates(ctx())).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import { InMemoryDocumentRepository } from "./in-memory-document-repository";
import { SEED_DOCUMENTS } from "./seed-documents";
import { SEED_MATTERS } from "../matters/seed-matters";

describe("InMemoryDocumentRepository", () => {
  it("seeds twenty realistic documents linked to matters", () => {
    const repository = new InMemoryDocumentRepository();

    expect(repository.count()).toBe(20);
    expect(repository.list()).toHaveLength(20);
    expect(repository.list()[0]?.matterId).toBeTruthy();
  });

  it("retrieves a document by id", () => {
    const repository = new InMemoryDocumentRepository();
    const sample = SEED_DOCUMENTS[0]!;

    expect(repository.getById(sample.documentId)).toEqual(sample);
  });

  it("filters documents by query, status, matter, category, and folder", () => {
    const repository = new InMemoryDocumentRepository();
    const matter = SEED_MATTERS[0]!;

    expect(repository.list({ query: "Statement of Claim" })).toHaveLength(1);
    expect(repository.list({ documentStatus: "draft" }).length).toBeGreaterThan(0);
    expect(repository.list({ matterId: matter.matterId }).length).toBeGreaterThan(0);
    expect(repository.list({ documentCategoryId: "pleadings" }).length).toBeGreaterThan(
      0,
    );
    expect(
      repository.list({ folderId: SEED_DOCUMENTS[0]!.folderId! }).length,
    ).toBeGreaterThan(0);
  });

  it("soft archives documents and excludes them from list and getById", () => {
    const repository = new InMemoryDocumentRepository();
    const sample = SEED_DOCUMENTS[0]!;

    const archived = repository.softArchive(sample.documentId);
    expect(archived?.documentStatus).toBe("archived");
    expect(repository.getById(sample.documentId)).toBeUndefined();
    expect(repository.list()).toHaveLength(19);
    expect(repository.count()).toBe(19);
  });
});

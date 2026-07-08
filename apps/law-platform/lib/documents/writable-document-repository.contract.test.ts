import { describe, expect, it } from "vitest";
import { DocumentFactory } from "@apzhub/legal-business-core";

import type { WritableDocumentRepository } from "./writable-document-repository";
import { InMemoryDocumentRepository } from "./in-memory-document-repository";
import { SEED_DOCUMENTS } from "./seed-documents";
import { SEED_MATTERS } from "../matters/seed-matters";

export function registerWritableDocumentRepositoryContract(
  label: string,
  createRepository: () => WritableDocumentRepository,
  options?: { readonly seedCount?: number },
): void {
  describe(`${label} — writable document repository contract`, () => {
    it("lists and retrieves seeded documents", () => {
      const repository = createRepository();
      const expectedCount = options?.seedCount ?? 20;

      expect(repository.count()).toBe(expectedCount);
      expect(repository.list()).toHaveLength(expectedCount);
      expect(repository.getById(SEED_DOCUMENTS[0]!.documentId)).toEqual(
        SEED_DOCUMENTS[0],
      );
    });

    it("filters documents by query, status, and matter", () => {
      const repository = createRepository();

      expect(repository.list({ query: "Statement of Claim" })).toHaveLength(1);
      expect(repository.list({ documentStatus: "filed" }).length).toBeGreaterThan(0);
      expect(
        repository.list({ matterId: SEED_MATTERS[0]!.matterId }).length,
      ).toBeGreaterThan(0);
      expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
    });

    it("creates, updates, and soft archives documents", () => {
      const repository = createRepository();
      const matter = SEED_MATTERS[0]!;
      const created = DocumentFactory.create({
        title: "Contract Test Document",
        matterId: matter.matterId,
        documentCategoryId: "pleadings",
        createdByUserId: "user-legal-workbench",
        clientId: matter.clientId,
      });

      repository.create(created);
      expect(repository.getById(created.documentId)?.title).toBe(
        "Contract Test Document",
      );

      const updated = repository.update(created.documentId, {
        ...created,
        title: "Updated Contract Document",
      });
      expect(updated?.title).toBe("Updated Contract Document");

      const archived = repository.softArchive(created.documentId);
      expect(archived?.documentStatus).toBe("archived");
      expect(repository.getById(created.documentId)).toBeUndefined();
      expect(repository.isSoftArchived(created.documentId)).toBe(true);
    });
  });
}

registerWritableDocumentRepositoryContract(
  "InMemoryDocumentRepository",
  () => new InMemoryDocumentRepository(),
);

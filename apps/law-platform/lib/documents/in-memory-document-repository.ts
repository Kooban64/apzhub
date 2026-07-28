import type { Document } from "@apzhub/legal-business-core";

import type { DocumentListCriteria } from "./document-types";
import {
  matchesDocumentCriteria,
  sortDocumentsByTitle,
} from "./document-repository-filters";
import type { WritableDocumentRepository } from "./writable-document-repository";
import { SEED_DOCUMENTS } from "./seed-documents";

/** In-memory writable document repository with soft archive (LAW-004-01). */
export class InMemoryDocumentRepository implements WritableDocumentRepository {
  private readonly documents: Map<string, Document>;
  private readonly softArchivedIds = new Set<string>();

  constructor(seed: readonly Document[] = SEED_DOCUMENTS) {
    this.documents = new Map(seed.map((document) => [document.documentId, document]));
  }

  list(criteria?: DocumentListCriteria): readonly Document[] {
    return sortDocumentsByTitle(
      [...this.documents.values()]
        .filter((document) => !this.softArchivedIds.has(document.documentId))
        .filter((document) => matchesDocumentCriteria(document, criteria)),
    );
  }

  getById(documentId: string): Document | undefined {
    if (this.softArchivedIds.has(documentId)) {
      return undefined;
    }

    return this.documents.get(documentId);
  }

  create(document: Document): Document {
    this.documents.set(document.documentId, document);
    this.softArchivedIds.delete(document.documentId);
    return document;
  }

  update(documentId: string, document: Document): Document | undefined {
    if (!this.documents.has(documentId) || this.softArchivedIds.has(documentId)) {
      return undefined;
    }

    this.documents.set(documentId, document);
    return document;
  }

  softArchive(documentId: string): Document | undefined {
    const existing = this.documents.get(documentId);
    if (!existing || this.softArchivedIds.has(documentId)) {
      return undefined;
    }

    const archived: Document = {
      ...existing,
      documentStatus: "archived",
    };

    this.documents.set(documentId, archived);
    this.softArchivedIds.add(documentId);
    return archived;
  }

  count(includeArchived = false): number {
    if (includeArchived) {
      return this.documents.size;
    }

    return [...this.documents.keys()].filter(
      (documentId) => !this.softArchivedIds.has(documentId),
    ).length;
  }

  isSoftArchived(documentId: string): boolean {
    return this.softArchivedIds.has(documentId);
  }
}

/** Client-safe memory singleton — must not import repository-factory (pulls pg). */
let sharedDocumentRepository: InMemoryDocumentRepository | undefined;

export function getSharedDocumentRepository(): InMemoryDocumentRepository {
  sharedDocumentRepository ??= new InMemoryDocumentRepository();
  return sharedDocumentRepository;
}

export function resetSharedDocumentRepository(): void {
  sharedDocumentRepository = undefined;
}

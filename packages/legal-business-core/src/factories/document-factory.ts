import type { Document } from "../domain";
import { ReferenceNumberGenerator } from "../reference";
import { createEntityId } from "./id";

export interface DocumentFactoryInput {
  readonly title: string;
  readonly matterId: string;
  readonly documentCategoryId: string;
  readonly createdByUserId: string;
  readonly documentReference?: string;
  readonly clientId?: string;
}

const defaultReferenceGenerator = new ReferenceNumberGenerator();

export const DocumentFactory = {
  create(input: DocumentFactoryInput): Document {
    return {
      documentId: createEntityId("d"),
      documentReference:
        input.documentReference ?? defaultReferenceGenerator.nextDocumentReference(),
      title: input.title.trim(),
      documentType: "other",
      documentStatus: "draft",
      documentCategoryId: input.documentCategoryId,
      matterId: input.matterId,
      clientId: input.clientId,
      version: 1,
      fileName: `${input.title.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`,
      mimeType: "application/pdf",
      sizeBytes: 0,
      createdByUserId: input.createdByUserId,
      tags: [],
      customFields: {},
    };
  },
};

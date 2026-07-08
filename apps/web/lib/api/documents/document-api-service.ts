import {
  createPlaceholderEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";
import type { Document } from "@apzhub/legal-business-core";

import {
  DocumentWorkflowService,
  createEmptyDocumentFormValues,
  documentToFormValues,
  getLawRepositoryMode,
  getSharedDocumentRepository,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";
import {
  customFieldsRecordToInput,
  tagsArrayToInput,
} from "../framework/dto-input-helpers";
import type {
  CreateDocumentV1Request,
  UpdateDocumentV1Request,
} from "./document-dto-mapper";
import {
  getDocumentApiMetadata,
  touchDocumentApiMetadata,
} from "./document-dto-mapper";

let documentApiEventBus: EventBus | undefined;

export function getDocumentApiEventBus(): EventBus {
  documentApiEventBus ??= createPlaceholderEventBus();
  return documentApiEventBus;
}

export function resetDocumentApiEventBus(): void {
  documentApiEventBus = undefined;
}

const documentWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    new DocumentWorkflowService({
      repository: getSharedDocumentRepository(),
      eventBus: getDocumentApiEventBus(),
      actorId: context.user?.userId,
    }),
});

export function createDocumentWorkflowService(
  context: LawApiAuthenticatedContext,
): DocumentWorkflowService {
  return documentWorkflowRunner.createService(context);
}

export async function withDocumentWorkflowService<T>(
  context: LawApiAuthenticatedContext,
  operation: (service: DocumentWorkflowService) => T | Promise<T>,
): Promise<T> {
  return documentWorkflowRunner.withService(context, operation);
}

export function createDocumentFormValuesFromRequest(body: CreateDocumentV1Request) {
  const defaults = createEmptyDocumentFormValues(body.matterId);

  return {
    ...defaults,
    title: body.title,
    documentType: body.documentType,
    matterId: body.matterId,
    documentCategoryId: body.documentCategoryId ?? defaults.documentCategoryId,
    fileName: body.fileName,
    mimeType: body.mimeType,
    sizeBytes: String(body.sizeBytes),
    tags: tagsArrayToInput(body.tags),
    customFields: customFieldsRecordToInput(body.customFields),
  };
}

export function mergeUpdateDocumentFormValues(
  existing: Document,
  body: UpdateDocumentV1Request,
) {
  const current = documentToFormValues(existing);

  return {
    ...current,
    title: body.title ?? current.title,
    documentStatus: body.documentStatus ?? current.documentStatus,
    documentCategoryId: body.documentCategoryId ?? current.documentCategoryId,
    folderId: body.folderId !== undefined ? (body.folderId ?? "") : current.folderId,
    tags: body.tags !== undefined ? tagsArrayToInput(body.tags) : current.tags,
    customFields:
      body.customFields !== undefined
        ? customFieldsRecordToInput(body.customFields)
        : current.customFields,
  };
}

export function recordDocumentMetadataAfterWrite(document: Document, created: boolean) {
  if (getLawRepositoryMode() === "postgres") {
    return;
  }

  touchDocumentApiMetadata(document.documentId, created);
}

export function resolveDocumentMetadata(documentId: string) {
  return getDocumentApiMetadata(documentId);
}

export function assertDocumentVersion(
  documentId: string,
  expectedVersion: number | undefined,
): boolean {
  if (expectedVersion === undefined) {
    return true;
  }

  return resolveDocumentMetadata(documentId).version === expectedVersion;
}

/**
 * Document Platform foundation composition (APZDOCS-002).
 * Wires metadata service + content coordinator. No HTTP/UI.
 */

import type { DocumentContentService } from "@apzhub/document-contracts";

import {
  createDocumentStorageCoordinator,
  type DocumentStorageCoordinatorDeps,
} from "../coordinator/storage-coordinator";
import {
  createDocumentPlatformService,
  type PlatformDocumentEngineDeps,
} from "../service/create-document-platform-service";
import type {
  DocumentStorageProvider,
  DocumentStorageProviderRegistry,
} from "../storage/storage-provider";

export type CreateDocumentPlatformFoundationInput = {
  readonly documents: PlatformDocumentEngineDeps["documents"];
  readonly metadata: PlatformDocumentEngineDeps["metadata"];
  readonly tags: PlatformDocumentEngineDeps["tags"];
  readonly relationships: PlatformDocumentEngineDeps["relationships"];
  readonly audits: PlatformDocumentEngineDeps["audits"];
  readonly versions: DocumentStorageCoordinatorDeps["versions"];
  readonly storageObjects: DocumentStorageCoordinatorDeps["storageObjects"];
  readonly provider: DocumentStorageProvider;
  readonly registry?: DocumentStorageProviderRegistry;
  readonly maxObjectBytes: number;
  readonly allowBinaryDeletion: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type DocumentPlatformFoundation = {
  readonly documents: ReturnType<typeof createDocumentPlatformService>;
  readonly content: DocumentContentService;
  readonly provider: DocumentStorageProvider;
  readonly registry?: DocumentStorageProviderRegistry;
};

/**
 * Compose Document Platform domain + content storage coordinator.
 * Callers must supply production or test persistence/storage from their factories.
 */
export function createDocumentPlatformFoundation(
  input: CreateDocumentPlatformFoundationInput,
): DocumentPlatformFoundation {
  const now = input.now ?? (() => new Date().toISOString());
  let seq = 0;
  const id =
    input.id ??
    (() => {
      seq += 1;
      return `docf_${Date.now().toString(36)}_${seq}`;
    });

  const documents = createDocumentPlatformService({
    documents: input.documents,
    metadata: input.metadata,
    tags: input.tags,
    relationships: input.relationships,
    audits: input.audits,
    now,
    id,
  });

  const content = createDocumentStorageCoordinator({
    documents: input.documents,
    versions: input.versions,
    storageObjects: input.storageObjects,
    provider: input.provider,
    now,
    id,
    maxObjectBytes: input.maxObjectBytes,
    allowBinaryDeletion: input.allowBinaryDeletion,
  });

  return {
    documents,
    content,
    provider: input.provider,
    registry: input.registry,
  };
}

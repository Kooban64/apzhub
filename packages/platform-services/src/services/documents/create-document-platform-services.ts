/**
 * Document Platform Services factories (APZDOCS-003).
 * Production: PostgreSQL + configured storage — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { DocumentPlatformGateway } from "@apzhub/document-contracts";
import {
  createDocumentPlatformFoundation,
  type DocumentPlatformFoundation,
  type DocumentStorageConfig,
} from "@apzhub/document-core";
import {
  createDocumentPersistenceForProduction,
  createDocumentPersistenceForTest,
  type DocumentPersistenceBundle,
} from "@apzhub/document-persistence";
import {
  createDocumentStorageForProduction,
  createDocumentStorageForTest,
  type DocumentSecretResolver,
  type DocumentStorageBundle,
} from "@apzhub/document-storage";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createDocumentPlatformServiceImpls,
  type DocumentPlatformServiceImpls,
} from "./document-service-impls";

export type DocumentPlatformServicesBundle = {
  readonly foundation: DocumentPlatformFoundation;
  readonly persistence: DocumentPersistenceBundle;
  readonly storage: DocumentStorageBundle;
  readonly gatewaySurface: DocumentPlatformGateway;
  readonly impls: DocumentPlatformServiceImpls;
  readonly readiness: {
    readonly documentsEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly storageMode: string;
  };
  wrapWithPipeline(pipeline: RequestPipeline): DocumentPlatformGateway;
};

export type CreateDocumentPlatformServicesInput = {
  readonly foundation?: DocumentPlatformFoundation;
  readonly persistence?: DocumentPersistenceBundle;
  readonly storage?: DocumentStorageBundle;
  readonly maxObjectBytes?: number;
  readonly allowBinaryDeletion?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateDocumentPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly storageConfig: DocumentStorageConfig;
  readonly secretResolver?: DocumentSecretResolver;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateDocumentPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly storage?: DocumentStorageBundle;
  readonly storageConfig?: Partial<DocumentStorageConfig>;
  readonly allowInMemoryStorage?: boolean;
  readonly maxObjectBytes?: number;
  readonly allowBinaryDeletion?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapDocumentPlatformGatewayWithPipeline(
  gateway: DocumentPlatformGateway,
  pipeline: RequestPipeline,
): DocumentPlatformGateway {
  return {
    documents: wrapServiceWithPipeline(gateway.documents, pipeline, "documentService"),
    documentVersions: wrapServiceWithPipeline(
      gateway.documentVersions,
      pipeline,
      "documentVersion",
    ),
    documentStorage: wrapServiceWithPipeline(
      gateway.documentStorage,
      pipeline,
      "documentStorage",
    ),
    documentCollections: wrapServiceWithPipeline(
      gateway.documentCollections,
      pipeline,
      "documentCollection",
    ),
    documentFolders: wrapServiceWithPipeline(
      gateway.documentFolders,
      pipeline,
      "documentFolder",
    ),
    documentTags: wrapServiceWithPipeline(gateway.documentTags, pipeline, "documentTag"),
    documentRelationships: wrapServiceWithPipeline(
      gateway.documentRelationships,
      pipeline,
      "documentRelationship",
    ),
    documentRetention: wrapServiceWithPipeline(
      gateway.documentRetention,
      pipeline,
      "documentRetention",
    ),
    documentAudit: wrapServiceWithPipeline(
      gateway.documentAudit,
      pipeline,
      "documentAudit",
    ),
    documentMetadata: wrapServiceWithPipeline(
      gateway.documentMetadata,
      pipeline,
      "documentMetadata",
    ),
    documentClassification: wrapServiceWithPipeline(
      gateway.documentClassification,
      pipeline,
      "documentClassification",
    ),
    documentSearchMetadata: wrapServiceWithPipeline(
      gateway.documentSearchMetadata,
      pipeline,
      "documentSearchMetadata",
    ),
    documentDiagnostics: wrapServiceWithPipeline(
      gateway.documentDiagnostics,
      pipeline,
      "documentDiagnostics",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: DocumentPersistenceBundle;
  readonly storage: DocumentStorageBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly maxObjectBytes?: number;
  readonly allowBinaryDeletion?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
}): DocumentPlatformServicesBundle {
  const foundation = createDocumentPlatformFoundation({
    ...input.persistence,
    provider: input.storage.provider,
    registry: input.storage.registry,
    maxObjectBytes:
      input.maxObjectBytes ?? input.storage.config.maxObjectBytes,
    allowBinaryDeletion:
      input.allowBinaryDeletion ?? input.storage.config.allowBinaryDeletion,
    now: input.now,
    id: input.id,
  });

  const impls = createDocumentPlatformServiceImpls({
    foundation,
    maxObjectBytes: input.maxObjectBytes ?? input.storage.config.maxObjectBytes,
    getStorageObject: (ctx, versionId) =>
      input.persistence.storageObjects.getByVersion(ctx, versionId as never),
  });

  return {
    foundation,
    persistence: input.persistence,
    storage: input.storage,
    gatewaySurface: impls,
    impls,
    readiness: {
      documentsEnabled: true,
      persistenceMode: input.persistenceMode,
      storageMode: input.storage.config.mode,
    },
    wrapWithPipeline: (pipeline) =>
      wrapDocumentPlatformGatewayWithPipeline(impls, pipeline),
  };
}

/**
 * Compose document platform services from persistence + storage bundles.
 */
export function createDocumentPlatformServices(
  input: CreateDocumentPlatformServicesInput & {
    readonly persistence: DocumentPersistenceBundle;
    readonly storage: DocumentStorageBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): DocumentPlatformServicesBundle {
  if (input.foundation) {
    const impls = createDocumentPlatformServiceImpls({
      foundation: input.foundation,
      maxObjectBytes: input.maxObjectBytes,
      getStorageObject: (ctx, versionId) =>
        input.persistence.storageObjects.getByVersion(ctx, versionId as never),
    });
    return {
      foundation: input.foundation,
      persistence: input.persistence,
      storage: input.storage,
      gatewaySurface: impls,
      impls,
      readiness: {
        documentsEnabled: true,
        persistenceMode: input.persistenceMode ?? "memory",
        storageMode: input.storage.config.mode,
      },
      wrapWithPipeline: (pipeline) =>
        wrapDocumentPlatformGatewayWithPipeline(impls, pipeline),
    };
  }
  return buildBundle({
    persistence: input.persistence,
    storage: input.storage,
    persistenceMode: input.persistenceMode ?? "memory",
    maxObjectBytes: input.maxObjectBytes,
    allowBinaryDeletion: input.allowBinaryDeletion,
    now: input.now,
    id: input.id,
  });
}

export async function createDocumentPlatformServicesForProduction(
  input: CreateDocumentPlatformServicesForProductionInput,
): Promise<DocumentPlatformServicesBundle> {
  if (!input.postgresDb) {
    throw new Error(
      "createDocumentPlatformServicesForProduction requires postgresDb",
    );
  }
  const persistence = createDocumentPersistenceForProduction({
    postgresDb: input.postgresDb,
  });
  const storage = await createDocumentStorageForProduction({
    config: input.storageConfig,
    secretResolver: input.secretResolver,
  });
  return buildBundle({
    persistence,
    storage,
    persistenceMode: "postgres",
    maxObjectBytes: input.storageConfig.maxObjectBytes,
    allowBinaryDeletion: input.storageConfig.allowBinaryDeletion,
    now: input.now,
    id: input.id,
  });
}

export async function createDocumentPlatformServicesForTest(
  input: CreateDocumentPlatformServicesForTestInput = {},
): Promise<DocumentPlatformServicesBundle> {
  const persistence = createDocumentPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence:
      input.allowInMemoryPersistence ?? !input.postgresDb,
  });
  const storage =
    input.storage ??
    (await createDocumentStorageForTest({
      config: input.storageConfig,
      allowInMemoryStorage: input.allowInMemoryStorage ?? true,
    }));
  return buildBundle({
    persistence,
    storage,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    maxObjectBytes: input.maxObjectBytes ?? storage.config.maxObjectBytes,
    allowBinaryDeletion:
      input.allowBinaryDeletion ?? storage.config.allowBinaryDeletion,
    now: input.now,
    id: input.id,
  });
}

/**
 * Production DocumentStorageProvider contract (APZDOCS-002).
 * Implementations live in the document-storage package — core stays SDK-free.
 */

import type {
  DocumentBinaryResult,
  DocumentBinarySource,
  DocumentChecksum,
  DocumentRequestContext,
  DocumentStorageReference,
} from "@apzhub/document-contracts";

export const DOCUMENT_STORAGE_PROVIDER_KINDS = [
  "filesystem",
  "s3",
  "azure_blob",
  "gcs",
  "minio",
  "memory",
  "custom",
] as const;

export type DocumentStorageProviderKind =
  (typeof DOCUMENT_STORAGE_PROVIDER_KINDS)[number];

export type DocumentStorageCapabilities = {
  readonly put: boolean;
  readonly get: boolean;
  readonly head: boolean;
  readonly delete: boolean;
  readonly copy: boolean;
  readonly multipart: boolean;
  readonly implemented: boolean;
};

export type DocumentStorageObjectDescriptor = {
  readonly ref: DocumentStorageReference;
  readonly mimeType?: string;
  readonly byteLength?: number;
  readonly checksum?: DocumentChecksum;
  readonly etag?: string;
  readonly status?: string;
};

export type DocumentStoragePutInput = {
  readonly ctx: DocumentRequestContext;
  readonly ref: DocumentStorageReference;
  readonly source: DocumentBinarySource;
  readonly mimeType: string;
  readonly byteLength?: number;
  readonly checksumHex?: string;
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
  readonly idempotencyKey?: string;
};

export type DocumentStorageGetInput = {
  readonly ctx: DocumentRequestContext;
  readonly ref: DocumentStorageReference;
  readonly as?: "bytes" | "stream";
  readonly signal?: AbortSignal;
};

export type DocumentStorageProvider = {
  readonly id: string;
  readonly kind: DocumentStorageProviderKind;
  readonly capabilities: DocumentStorageCapabilities;
  initialise(): Promise<void>;
  validateConfiguration(): Promise<void>;
  healthCheck(): Promise<{ readonly healthy: boolean; readonly message: string }>;
  putObject(input: DocumentStoragePutInput): Promise<DocumentStorageObjectDescriptor>;
  getObject(input: DocumentStorageGetInput): Promise<DocumentBinaryResult>;
  headObject(
    ctx: DocumentRequestContext,
    ref: DocumentStorageReference,
  ): Promise<DocumentStorageObjectDescriptor | null>;
  deleteObject(
    ctx: DocumentRequestContext,
    ref: DocumentStorageReference,
  ): Promise<void>;
  copyObject?(
    ctx: DocumentRequestContext,
    from: DocumentStorageReference,
    to: DocumentStorageReference,
  ): Promise<DocumentStorageObjectDescriptor>;
  verifyObject(
    ctx: DocumentRequestContext,
    ref: DocumentStorageReference,
    expected: { readonly checksumHex: string; readonly byteLength: number },
  ): Promise<boolean>;
  listCapabilities(): DocumentStorageCapabilities;
  dispose(): Promise<void>;
  /** @deprecated APZDOCS-001 compatibility */
  exists?(ref: DocumentStorageReference): Promise<boolean>;
  /** @deprecated APZDOCS-001 compatibility */
  describe?(
    ref: DocumentStorageReference,
  ): Promise<DocumentStorageObjectDescriptor | null>;
};

export type DocumentStorageProviderDiagnostics = {
  readonly providerId: string;
  readonly kind: DocumentStorageProviderKind;
  readonly healthy: boolean;
  readonly implemented: boolean;
  readonly maxObjectBytes?: number;
  readonly capabilities: DocumentStorageCapabilities;
};

export interface DocumentStorageProviderRegistry {
  register(provider: DocumentStorageProvider): void;
  get(providerId: string): DocumentStorageProvider | undefined;
  list(): readonly DocumentStorageProvider[];
  setActive(providerId: string): void;
  getActive(): DocumentStorageProvider;
  diagnostics(): Promise<readonly DocumentStorageProviderDiagnostics[]>;
}

export function createDocumentStorageProviderRegistry(
  options: { readonly allowOverwrite?: boolean } = {},
): DocumentStorageProviderRegistry {
  const providers = new Map<string, DocumentStorageProvider>();
  let activeId: string | undefined;

  return {
    register(provider) {
      if (providers.has(provider.id) && !options.allowOverwrite) {
        throw new Error(`Duplicate storage provider registration: ${provider.id}`);
      }
      if (!provider.capabilities.implemented) {
        throw new Error(
          `Cannot register unimplemented storage provider: ${provider.id}`,
        );
      }
      providers.set(provider.id, provider);
      if (!activeId) activeId = provider.id;
    },
    get(providerId) {
      return providers.get(providerId);
    },
    list() {
      return [...providers.values()];
    },
    setActive(providerId) {
      if (!providers.has(providerId)) {
        throw new Error(`Unknown storage provider: ${providerId}`);
      }
      activeId = providerId;
    },
    getActive() {
      if (!activeId) {
        throw new Error("No active document storage provider configured");
      }
      const provider = providers.get(activeId);
      if (!provider) {
        throw new Error(`Active storage provider missing: ${activeId}`);
      }
      return provider;
    },
    async diagnostics() {
      const out: DocumentStorageProviderDiagnostics[] = [];
      for (const provider of providers.values()) {
        const health = await provider.healthCheck();
        out.push({
          providerId: provider.id,
          kind: provider.kind,
          healthy: health.healthy,
          implemented: provider.capabilities.implemented,
          capabilities: provider.listCapabilities(),
        });
      }
      return out;
    },
  };
}

/** @deprecated Use createDocumentStorageProviderRegistry */
export function createEmptyDocumentStorageProviderRegistry(): DocumentStorageProviderRegistry {
  return createDocumentStorageProviderRegistry();
}

/** Placeholder descriptors for Azure/GCS — not registerable as active. */
export const UNIMPLEMENTED_DOCUMENT_STORAGE_CAPABILITIES: DocumentStorageCapabilities =
  {
    put: false,
    get: false,
    head: false,
    delete: false,
    copy: false,
    multipart: false,
    implemented: false,
  };

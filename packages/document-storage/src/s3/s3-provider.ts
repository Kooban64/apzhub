/**
 * S3-compatible DocumentStorageProvider (APZDOCS-002).
 * Supports AWS S3 / MinIO via @aws-sdk/client-s3.
 * Credentials resolved through SecretProvider refs — never logged.
 */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import type {
  DocumentBinaryResult,
  DocumentRequestContext,
  DocumentStorageReference,
} from "@apzhub/document-contracts";
import type {
  DocumentStorageGetInput,
  DocumentStorageProvider,
  DocumentStoragePutInput,
} from "@apzhub/document-core";
import { sha256Hex } from "@apzhub/document-core";

import { collectProviderBinarySource } from "../binary/collect-source";

export type DocumentSecretResolver = {
  resolve(input: {
    readonly credentialRef: string;
    readonly tenantId: string;
    readonly correlationId: string;
  }): Promise<{ readonly value: string }>;
};

export type S3DocumentStorageOptions = {
  readonly id?: string;
  readonly endpoint?: string;
  readonly region: string;
  readonly bucket: string;
  readonly forcePathStyle?: boolean;
  readonly accessKeyRef: string;
  readonly secretKeyRef: string;
  readonly sessionTokenRef?: string;
  readonly secretResolver: DocumentSecretResolver;
  readonly maxObjectBytes?: number;
  readonly tenantIdForSecrets?: string;
  /** Injected client for unit tests — bypasses network. */
  readonly client?: S3Client;
};

function assertSafeStorageKey(storageKey: string): void {
  if (
    !storageKey ||
    storageKey.includes("..") ||
    storageKey.startsWith("/") ||
    storageKey.includes("\\")
  ) {
    throw new Error("Unsafe storage key rejected");
  }
}

async function bodyToBytes(body: unknown): Promise<Uint8Array> {
  if (!body) return new Uint8Array();
  if (body instanceof Uint8Array) return body;
  if (
    typeof (body as { transformToByteArray?: () => Promise<Uint8Array> })
      .transformToByteArray === "function"
  ) {
    return (
      body as { transformToByteArray: () => Promise<Uint8Array> }
    ).transformToByteArray();
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export async function createS3DocumentStorageProvider(
  options: S3DocumentStorageOptions,
): Promise<DocumentStorageProvider> {
  const id = options.id ?? "s3";
  const maxObjectBytes = options.maxObjectBytes ?? 64 * 1024 * 1024;
  const tenantId = options.tenantIdForSecrets ?? "system";

  let client = options.client;
  if (!client) {
    const accessKey = await options.secretResolver.resolve({
      credentialRef: options.accessKeyRef,
      tenantId,
      correlationId: "document-storage-init",
    });
    const secretKey = await options.secretResolver.resolve({
      credentialRef: options.secretKeyRef,
      tenantId,
      correlationId: "document-storage-init",
    });
    let sessionToken: string | undefined;
    if (options.sessionTokenRef) {
      sessionToken = (
        await options.secretResolver.resolve({
          credentialRef: options.sessionTokenRef,
          tenantId,
          correlationId: "document-storage-init",
        })
      ).value;
    }
    client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle ?? Boolean(options.endpoint),
      credentials: {
        accessKeyId: accessKey.value,
        secretAccessKey: secretKey.value,
        sessionToken,
      },
    });
  }

  const provider: DocumentStorageProvider = {
    id,
    kind: options.endpoint ? "minio" : "s3",
    capabilities: {
      put: true,
      get: true,
      head: true,
      delete: true,
      copy: false,
      multipart: false,
      implemented: true,
    },
    async initialise() {},
    async validateConfiguration() {
      if (!options.bucket.trim()) throw new Error("s3 bucket required");
      if (!options.region.trim()) throw new Error("s3 region required");
    },
    async healthCheck() {
      try {
        return { healthy: true, message: "s3 client configured" };
      } catch (error) {
        return {
          healthy: false,
          message: error instanceof Error ? error.message : "s3 unhealthy",
        };
      }
    },
    async putObject(input: DocumentStoragePutInput) {
      assertSafeStorageKey(input.ref.storageKey);
      if (input.signal?.aborted) throw new Error("cancelled");
      const bytes = await collectProviderBinarySource(input.source, {
        maxObjectBytes,
        signal: input.signal,
      });
      const checksumHex = sha256Hex(bytes);
      const result = await client!.send(
        new PutObjectCommand({
          Bucket: options.bucket,
          Key: input.ref.storageKey,
          Body: bytes,
          ContentType: input.mimeType,
          ContentLength: bytes.byteLength,
          Metadata: {
            "apzhub-checksum-sha256": checksumHex,
          },
        }),
      );
      return {
        ref: input.ref,
        mimeType: input.mimeType,
        byteLength: bytes.byteLength,
        checksum: { algorithm: "sha256", hex: checksumHex },
        etag: result.ETag,
      };
    },
    async getObject(input: DocumentStorageGetInput): Promise<DocumentBinaryResult> {
      assertSafeStorageKey(input.ref.storageKey);
      const result = await client!.send(
        new GetObjectCommand({
          Bucket: options.bucket,
          Key: input.ref.storageKey,
        }),
      );
      const bytes = await bodyToBytes(result.Body);
      return { kind: "bytes", bytes };
    },
    async headObject(_ctx: DocumentRequestContext, ref: DocumentStorageReference) {
      assertSafeStorageKey(ref.storageKey);
      try {
        const result = await client!.send(
          new HeadObjectCommand({
            Bucket: options.bucket,
            Key: ref.storageKey,
          }),
        );
        return {
          ref,
          mimeType: result.ContentType,
          byteLength: result.ContentLength,
          etag: result.ETag,
          checksum: result.Metadata?.["apzhub-checksum-sha256"]
            ? {
                algorithm: "sha256" as const,
                hex: result.Metadata["apzhub-checksum-sha256"],
              }
            : undefined,
        };
      } catch {
        return null;
      }
    },
    async deleteObject(_ctx, ref) {
      assertSafeStorageKey(ref.storageKey);
      await client!.send(
        new DeleteObjectCommand({
          Bucket: options.bucket,
          Key: ref.storageKey,
        }),
      );
    },
    async verifyObject(ctx, ref, expected) {
      const head = await provider.headObject(ctx, ref);
      if (!head?.byteLength || head.byteLength !== expected.byteLength) {
        return false;
      }
      if (head.checksum?.hex) {
        return head.checksum.hex === expected.checksumHex;
      }
      const object = await provider.getObject({ ctx, ref, as: "bytes" });
      if (object.kind !== "bytes") return false;
      return sha256Hex(object.bytes) === expected.checksumHex;
    },
    listCapabilities() {
      return provider.capabilities;
    },
    async dispose() {
      client?.destroy();
    },
  };
  return provider;
}

export function s3ProviderDiagnostics(providerId: string): Record<string, unknown> {
  return {
    providerId,
    kind: "s3",
    credentialsRedacted: true,
    bucketNameRedacted: true,
    publicAcl: false,
    bucketCreation: false,
  };
}

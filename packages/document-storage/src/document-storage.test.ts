/**
 * APZDOCS-002 — filesystem, S3 (mocked), registry, factory tests.
 */

import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import type { DocumentRequestContext } from "@apzhub/document-contracts";
import { sha256Hex } from "@apzhub/document-core";

import {
  createDocumentStorageForProduction,
  createDocumentStorageForTest,
  createFilesystemDocumentStorageProvider,
  createMemoryDocumentStorageProvider,
  createS3DocumentStorageProvider,
  DOCUMENT_STORAGE_VERSION,
  filesystemProviderDiagnostics,
  s3ProviderDiagnostics,
} from "./index";

function ctx(): DocumentRequestContext {
  return {
    tenantId: "tenant_fs",
    userId: "user_fs",
    permissions: ["document.*"],
  };
}

describe("APZDOCS-002 document-storage", () => {
  it("exports version", () => {
    expect(DOCUMENT_STORAGE_VERSION).toBe("0.1.0");
  });

  it("filesystem provider writes/reads/verifies with path traversal rejection", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "apzdocs-fs-"));
    try {
      const provider = createFilesystemDocumentStorageProvider({
        id: "fs",
        rootDirectory: root,
        maxObjectBytes: 1024,
      });
      await provider.initialise();
      await provider.validateConfiguration();
      expect((await provider.healthCheck()).healthy).toBe(true);

      const bytes = new TextEncoder().encode("fs-payload");
      const ref = {
        providerId: "fs",
        storageKey: "tenants/t1/documents/d1/versions/v1/content.bin",
      };
      const put = await provider.putObject({
        ctx: ctx(),
        ref,
        source: { kind: "bytes", bytes },
        mimeType: "text/plain",
      });
      expect(put.byteLength).toBe(bytes.byteLength);
      expect(put.checksum?.hex).toBe(sha256Hex(bytes));

      await expect(
        provider.putObject({
          ctx: ctx(),
          ref,
          source: { kind: "bytes", bytes },
          mimeType: "text/plain",
        }),
      ).rejects.toThrow(/immutable/i);

      const got = await provider.getObject({ ctx: ctx(), ref, as: "bytes" });
      expect(got.kind).toBe("bytes");
      expect(
        await provider.verifyObject(ctx(), ref, {
          checksumHex: sha256Hex(bytes),
          byteLength: bytes.byteLength,
        }),
      ).toBe(true);

      await expect(
        provider.putObject({
          ctx: ctx(),
          ref: { providerId: "fs", storageKey: "../etc/passwd" },
          source: { kind: "bytes", bytes },
          mimeType: "text/plain",
        }),
      ).rejects.toThrow(/Unsafe|traversal/i);

      await expect(
        provider.putObject({
          ctx: ctx(),
          ref: { providerId: "fs", storageKey: "/absolute/path" },
          source: { kind: "bytes", bytes },
          mimeType: "text/plain",
        }),
      ).rejects.toThrow(/Unsafe/i);

      const oversized = new Uint8Array(2048);
      await expect(
        provider.putObject({
          ctx: ctx(),
          ref: {
            providerId: "fs",
            storageKey: "tenants/t1/documents/d1/versions/v2/content.bin",
          },
          source: { kind: "bytes", bytes: oversized },
          mimeType: "application/octet-stream",
        }),
      ).rejects.toThrow(/maxObjectBytes/);

      const ac = new AbortController();
      ac.abort();
      await expect(
        provider.putObject({
          ctx: ctx(),
          ref: {
            providerId: "fs",
            storageKey: "tenants/t1/documents/d1/versions/v3/content.bin",
          },
          source: { kind: "bytes", bytes },
          mimeType: "text/plain",
          signal: ac.signal,
        }),
      ).rejects.toThrow(/cancelled/);

      await provider.deleteObject(ctx(), ref);
      expect(await provider.headObject(ctx(), ref)).toBeNull();

      const diag = filesystemProviderDiagnostics("fs");
      expect(JSON.stringify(diag)).not.toContain(root);
      expect(diag.absolutePathRedacted).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("memory provider supports stream input and overwrite denial", async () => {
    const provider = createMemoryDocumentStorageProvider({
      id: "memory",
      maxObjectBytes: 64,
    });
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const ref = { providerId: "memory", storageKey: "k1" };
    await provider.putObject({
      ctx: ctx(),
      ref,
      source: {
        kind: "stream",
        stream: (async function* () {
          yield bytes;
        })(),
      },
      mimeType: "application/octet-stream",
    });
    await expect(
      provider.putObject({
        ctx: ctx(),
        ref,
        source: { kind: "bytes", bytes },
        mimeType: "application/octet-stream",
      }),
    ).rejects.toThrow(/immutable/);
  });

  it("S3 provider uses injected client without public ACL or bucket create", async () => {
    const send = vi.fn(async (command: { constructor: { name: string } }) => {
      if (command.constructor.name === "PutObjectCommand") {
        return { ETag: '"multipart-not-hash"' };
      }
      if (command.constructor.name === "GetObjectCommand") {
        return {
          Body: {
            transformToByteArray: async () => new Uint8Array([9, 9]),
          },
        };
      }
      if (command.constructor.name === "HeadObjectCommand") {
        return {
          ContentLength: 2,
          ContentType: "application/octet-stream",
          ETag: '"multipart-not-hash"',
          Metadata: { "apzhub-checksum-sha256": sha256Hex(new Uint8Array([9, 9])) },
        };
      }
      if (command.constructor.name === "DeleteObjectCommand") {
        return {};
      }
      throw new Error(`unexpected ${command.constructor.name}`);
    });

    const provider = await createS3DocumentStorageProvider({
      id: "s3",
      region: "eu-west-1",
      bucket: "apz-docs",
      accessKeyRef: "secret://ak",
      secretKeyRef: "secret://sk",
      secretResolver: {
        async resolve() {
          return { value: "never-log-me" };
        },
      },
      client: { send, destroy: vi.fn() } as never,
    });
    await provider.validateConfiguration();
    expect((await provider.healthCheck()).healthy).toBe(true);

    const bytes = new Uint8Array([9, 9]);
    const ref = {
      providerId: "s3",
      storageKey: "tenants/t/documents/d/versions/v/content.bin",
    };
    const put = await provider.putObject({
      ctx: ctx(),
      ref,
      source: { kind: "bytes", bytes },
      mimeType: "application/octet-stream",
    });
    expect(put.etag).toBe('"multipart-not-hash"');
    expect(put.checksum?.hex).toBe(sha256Hex(bytes));
    expect(put.checksum?.hex).not.toBe("multipart-not-hash");

    const putArgs = send.mock.calls[0]![0] as {
      input: Record<string, unknown>;
    };
    expect(JSON.stringify(putArgs)).not.toMatch(/ACL|public-read|CreateBucket/i);

    expect(
      await provider.verifyObject(ctx(), ref, {
        checksumHex: sha256Hex(bytes),
        byteLength: 2,
      }),
    ).toBe(true);

    await provider.deleteObject(ctx(), ref);
    await provider.dispose();

    const diag = s3ProviderDiagnostics("s3");
    expect(diag.credentialsRedacted).toBe(true);
    expect(diag.publicAcl).toBe(false);
    expect(diag.bucketCreation).toBe(false);
  });

  it("factories: production forbids memory; test constructs memory", async () => {
    await expect(
      createDocumentStorageForProduction({
        config: {
          mode: "memory_test",
          providerId: "m",
          maxObjectBytes: 1,
          checksumAlgorithm: "sha256",
          allowBinaryDeletion: true,
        },
      }),
    ).rejects.toThrow(/memory_test/);

    const bundle = await createDocumentStorageForTest();
    expect(bundle.provider.kind).toBe("memory");
    expect(bundle.registry.getActive().id).toBe(bundle.provider.id);

    const root = await mkdtemp(path.join(os.tmpdir(), "apzdocs-prod-fs-"));
    try {
      const prod = await createDocumentStorageForProduction({
        config: {
          mode: "filesystem",
          providerId: "fs-prod",
          filesystemRoot: root,
          allowFilesystemInProduction: true,
          maxObjectBytes: 1024,
          checksumAlgorithm: "sha256",
          allowBinaryDeletion: false,
        },
      });
      expect(prod.provider.kind).toBe("filesystem");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

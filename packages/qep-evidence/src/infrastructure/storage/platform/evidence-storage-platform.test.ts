/**
 * APZQEP-120-S03 — Evidence Storage Platform unit + integration tests.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { EvidenceStorageError } from "../../../shared/errors";
import { createLocalEvidenceStorageProvider } from "../providers/local/local-evidence-storage-provider";
import { createMemoryEvidenceStorageProvider } from "../providers/memory/memory-evidence-storage-provider";
import {
  createEvidenceStorage,
  createEvidenceStorageSync,
  resolveEvidenceStorageConfigFromEnv,
} from "./create-evidence-storage";
import { createEvidenceStorageManager } from "./evidence-storage-manager";
import { createEvidenceStorageProviderRegistry } from "./registry";

const temps: string[] = [];

afterEach(async () => {
  while (temps.length > 0) {
    const dir = temps.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

async function tempRoot(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "apzqep-s03-"));
  temps.push(dir);
  return dir;
}

describe("APZQEP-120-S03 Evidence Storage Platform", () => {
  describe("configuration", () => {
    it("defaults to memory and never assumes local", () => {
      const cfg = resolveEvidenceStorageConfigFromEnv({});
      expect(cfg.provider).toBe("memory");
    });

    it("resolves local only when configured", () => {
      const cfg = resolveEvidenceStorageConfigFromEnv({
        APZQEP_EVIDENCE_STORAGE_PROVIDER: "local",
        APZQEP_EVIDENCE_STORAGE_ROOT: "/var/apzqep/evidence",
      });
      expect(cfg.provider).toBe("local");
      expect(cfg.local?.rootDirectory).toBe("/var/apzqep/evidence");
    });

    it("rejects local without root directory", () => {
      expect(() =>
        createEvidenceStorageSync({ provider: "local", local: { rootDirectory: "" } }),
      ).toThrow(EvidenceStorageError);
    });
  });

  describe("manager + memory provider", () => {
    it("selects provider by configuration (not hard-coded local)", async () => {
      const { manager } = await createEvidenceStorage({ provider: "memory" });
      expect(manager.managerId).toBe("EvidenceStorageManager");
      expect(manager.activeProviderKind).toBe("memory");
      expect(manager.portId).toBe("StoragePort");
      expect(manager.listProviders().some((p) => p.kind === "memory")).toBe(true);
    });

    it("stores, retrieves, streams, exists, deletes via manager", async () => {
      const audits: string[] = [];
      const { manager } = await createEvidenceStorage(
        { provider: "memory" },
        {
          onAudit: (e) => {
            audits.push(`${e.operation}:${e.outcome}`);
          },
        },
      );

      const put = await manager.put({
        tenantId: "tenant-a",
        bytes: new TextEncoder().encode("hello-evidence"),
        mediaType: "text/plain",
      });
      expect(put.storageLocator.startsWith("evst://memory/")).toBe(true);
      expect(put.storageLocator.includes("/")).toBe(true);
      expect(put.storageLocator.includes("tmp")).toBe(false);

      expect(await manager.exists("tenant-a", put.storageLocator)).toBe(true);
      const got = await manager.get("tenant-a", put.storageLocator);
      expect(new TextDecoder().decode(got.bytes)).toBe("hello-evidence");

      const stream = await manager.openStream("tenant-a", put.storageLocator);
      expect(stream.kind).toBe("storage-stream");
      expect(stream.chunks).toBeTypeOf("function");
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream.chunks!()) {
        chunks.push(chunk);
      }
      expect(new TextDecoder().decode(chunks[0]!)).toBe("hello-evidence");

      const meta = await manager.getMetadata("tenant-a", put.storageLocator);
      expect(meta?.byteSize).toBe(put.byteSize);

      await manager.delete("tenant-a", put.storageLocator);
      expect(await manager.exists("tenant-a", put.storageLocator)).toBe(false);
      expect(audits.some((a) => a.startsWith("store:"))).toBe(true);
    });

    it("translates missing objects to EvidenceStorageError", async () => {
      const { manager } = await createEvidenceStorage({ provider: "memory" });
      await expect(manager.get("tenant-a", "evst://memory/999")).rejects.toMatchObject({
        code: "STORAGE_NOT_FOUND",
      });
    });

    it("does not register local unless configured", () => {
      const registry = createEvidenceStorageProviderRegistry();
      registry.register(createMemoryEvidenceStorageProvider());
      const manager = createEvidenceStorageManager({
        registry,
        config: { provider: "memory" },
      });
      expect(manager.listProviders().map((p) => p.kind)).toEqual(["memory"]);
    });
  });

  describe("local provider", () => {
    it("round-trips store/retrieve/stream/exists/delete with opaque locators", async () => {
      const root = await tempRoot();
      const { manager } = await createEvidenceStorage({
        provider: "local",
        local: { rootDirectory: root },
      });

      const payload = new TextEncoder().encode("local-bytes-payload");
      const put = await manager.put({
        tenantId: "tenant-local",
        bytes: payload,
        mediaType: "application/octet-stream",
      });
      expect(put.storageLocator.startsWith("evst://local/")).toBe(true);
      expect(put.storageLocator.includes(root)).toBe(false);
      expect(put.storageLocator.includes("..")).toBe(false);

      const health = await manager.health();
      expect(health.healthy).toBe(true);
      expect(health.kind).toBe("local");

      const got = await manager.get("tenant-local", put.storageLocator);
      expect(Buffer.from(got.bytes).equals(Buffer.from(payload))).toBe(true);

      const stream = await manager.openStream("tenant-local", put.storageLocator);
      const parts: number[] = [];
      for await (const chunk of stream.chunks!()) {
        parts.push(chunk.byteLength);
      }
      expect(parts.reduce((a, b) => a + b, 0)).toBe(payload.byteLength);

      await manager.archive("tenant-local", put.storageLocator);
      await expect(
        manager.update("tenant-local", put.storageLocator, {
          bytes: new Uint8Array([1]),
          mediaType: "application/octet-stream",
        }),
      ).rejects.toMatchObject({ code: "STORAGE_FORBIDDEN" });

      await manager.delete("tenant-local", put.storageLocator);
      expect(await manager.exists("tenant-local", put.storageLocator)).toBe(false);
    });

    it("rejects path traversal / unsafe tenant / invalid locator", async () => {
      const root = await tempRoot();
      const provider = createLocalEvidenceStorageProvider({ rootDirectory: root });
      await provider.initialise();

      await expect(
        provider.store({
          tenantId: "../escape",
          bytes: new Uint8Array([1]),
          mediaType: "text/plain",
        }),
      ).rejects.toMatchObject({ code: "STORAGE_INVALID_REQUEST" });

      await expect(
        provider.retrieve("tenant-a", "evst://local/../../etc/passwd"),
      ).rejects.toMatchObject({ code: "STORAGE_INVALID_REQUEST" });

      await expect(provider.retrieve("tenant-a", "/etc/passwd")).rejects.toMatchObject({
        code: "STORAGE_INVALID_REQUEST",
      });

      await expect(
        provider.retrieve("tenant-a", "evst://local/not-a-uuid"),
      ).rejects.toMatchObject({ code: "STORAGE_INVALID_REQUEST" });
    });

    it("enforces size limits", async () => {
      const root = await tempRoot();
      const provider = createLocalEvidenceStorageProvider({
        rootDirectory: root,
        maxObjectBytes: 4,
      });
      await provider.initialise();
      await expect(
        provider.store({
          tenantId: "tenant-a",
          bytes: new Uint8Array([1, 2, 3, 4, 5]),
          mediaType: "application/octet-stream",
        }),
      ).rejects.toMatchObject({ code: "STORAGE_LIMIT_EXCEEDED" });
    });

    it("health fails when root disappears", async () => {
      const root = await tempRoot();
      const provider = createLocalEvidenceStorageProvider({ rootDirectory: root });
      await provider.initialise();
      await rm(root, { recursive: true, force: true });
      const health = await provider.health();
      expect(health.healthy).toBe(false);
    });

    it("errors do not include absolute filesystem paths", async () => {
      const root = await tempRoot();
      const { manager } = await createEvidenceStorage({
        provider: "local",
        local: { rootDirectory: root },
      });
      try {
        await manager.get(
          "tenant-a",
          "evst://local/00000000-0000-4000-8000-000000000001",
        );
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(EvidenceStorageError);
        expect(String(error)).not.toContain(root);
      }
    });
  });

  describe("metadata separation", () => {
    it("exposes logical locator metadata without provider internals", async () => {
      const root = await tempRoot();
      const { manager } = createEvidenceStorageSync({
        provider: "local",
        local: { rootDirectory: root },
      });
      const put = await manager.put({
        tenantId: "tenant-meta",
        bytes: new Uint8Array([9, 8, 7]),
        mediaType: "application/octet-stream",
      });
      const meta = await manager.getMetadata("tenant-meta", put.storageLocator);
      expect(meta?.storageLocator).toBe(put.storageLocator);
      expect(JSON.stringify(meta)).not.toContain(root);
      expect(JSON.stringify(meta)).not.toContain("content.bin");
    });
  });
});

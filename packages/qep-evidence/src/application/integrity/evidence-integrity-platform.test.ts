/**
 * APZQEP-120-S04 — Evidence Integrity Platform tests.
 */

import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { EvidenceRequestContext } from "../context";
import { createEvidenceApplicationServices } from "../services/create-application-services";
import {
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryUnitOfWork,
} from "../testing/in-memory-ports";
import { createEvidenceStorageSync } from "../../infrastructure/storage/platform/create-evidence-storage";
import { createIntegrityAlgorithmRegistry } from "./algorithms/registry";
import { createSha256IntegrityAlgorithm } from "./algorithms/sha256-integrity-algorithm";
import { EvidenceIntegrityPlatformError } from "./errors";

const PAYLOAD_A = Uint8Array.from(Buffer.from("payload-a", "utf8"));
const PAYLOAD_B = Uint8Array.from(Buffer.from("payload-b", "utf8"));
const HASH_A = createHash("sha256").update(PAYLOAD_A).digest("hex");
const HASH_B = createHash("sha256").update(PAYLOAD_B).digest("hex");

const temps: string[] = [];

afterEach(async () => {
  while (temps.length > 0) {
    const dir = temps.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

function ctx(overrides?: Partial<EvidenceRequestContext>): EvidenceRequestContext {
  return {
    tenantId: "tenant-a",
    userId: "user-owner",
    correlationId: "corr-s04",
    permissions: [
      "qep.evidence.create",
      "qep.evidence.read",
      "qep.evidence.download",
      "qep.evidence.verify",
      "qep.evidence.admin",
    ],
    ...overrides,
  };
}

function createWired(provider: "memory" | "local" = "memory", rootDirectory?: string) {
  const { manager: storage } = createEvidenceStorageSync(
    provider === "local"
      ? { provider: "local", local: { rootDirectory: rootDirectory! } }
      : { provider: "memory" },
  );
  const uow = createInMemoryUnitOfWork();
  const app = createEvidenceApplicationServices({
    uow,
    storage,
    clock: createInMemoryClockPort("2026-08-01T18:00:00.000Z"),
    ids: createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
    secure: true,
  });
  return { app, storage, uow };
}

async function capture(
  app: ReturnType<typeof createWired>["app"],
  bytes: Uint8Array,
  hash: string,
) {
  return app.commands.captureEvidence(ctx(), {
    kind: "captureEvidence",
    projectId: "proj-1",
    source: { kind: "manual_upload" },
    content: {
      mediaType: "text/plain",
      bytes,
      contentHash: hash,
      hashAlgorithm: "sha256",
    },
  });
}

describe("APZQEP-120-S04 SHA-256 algorithm", () => {
  it("digests bytes and streams deterministically", async () => {
    const algo = createSha256IntegrityAlgorithm();
    const bytes = new TextEncoder().encode("stream-safe-content");
    const fromBytes = algo.digestBytes(bytes);
    async function* chunks() {
      yield bytes.subarray(0, 6);
      yield bytes.subarray(6);
    }
    const fromStream = await algo.digestStream(chunks());
    expect(fromBytes).toBe(fromStream);
    expect(algo.isSupportedDigest(fromBytes)).toBe(true);
    expect(algo.digestsEqual(fromBytes, fromStream)).toBe(true);
    expect(algo.digestsEqual(fromBytes, "0".repeat(64))).toBe(false);
  });

  it("rejects unsupported algorithms via registry", () => {
    const registry = createIntegrityAlgorithmRegistry();
    expect(() => registry.get("md5")).toThrow(EvidenceIntegrityPlatformError);
  });

  it("hashes empty content", () => {
    const algo = createSha256IntegrityAlgorithm();
    expect(algo.digestBytes(new Uint8Array())).toBe(
      createHash("sha256").update(new Uint8Array()).digest("hex"),
    );
  });
});

describe("APZQEP-120-S04 Integrity Platform (memory provider)", () => {
  it("establishes integrity on capture with server-side SHA-256", async () => {
    const { app } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    expect(captured.data.contentHash).toBe(HASH_A);
    expect(captured.data.verificationState).toBe("unverified");

    const status = await app.integrity.getIntegrityStatus(ctx(), captured.data.id);
    expect(status.status).toBe("ESTABLISHED");
    expect("digest" in status).toBe(false);
  });

  it("rejects capture when client hash mismatches server digest", async () => {
    const { app } = createWired();
    await expect(capture(app, PAYLOAD_A, HASH_B)).rejects.toMatchObject({
      integrityCode: "INTEGRITY_MISMATCH",
    });
  });

  it("verifies unchanged content as VERIFIED via StoragePort hashing", async () => {
    const { app } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    const result = await app.integrity.verifyIntegrity(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });
    expect(result.status).toBe("VERIFIED");
    expect(result.expectedDigest).toBe(HASH_A);
    expect(result.actualDigest).toBe(HASH_A);

    const status = await app.integrity.getIntegrityStatus(ctx(), captured.data.id);
    expect(status.status).toBe("VERIFIED");
  });

  it("returns MISMATCH when content bytes are replaced after establishment", async () => {
    const { app, storage, uow } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    const aggregate = await uow.evidence.getById("tenant-a", captured.data.id);
    expect(aggregate?.content?.storageLocator).toBeTruthy();

    await storage.update("tenant-a", aggregate!.content!.storageLocator, {
      bytes: PAYLOAD_B,
      mediaType: "text/plain",
      contentHash: HASH_B,
      hashAlgorithm: "sha256",
    });

    const result = await app.integrity.verifyIntegrity(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });
    expect(result.status).toBe("MISMATCH");
    expect(result.expectedDigest).toBe(HASH_A);
    expect(result.actualDigest).toBe(HASH_B);

    const after = await uow.evidence.getById("tenant-a", captured.data.id);
    expect(after?.integrity?.contentHash).toBe(HASH_A);
    expect(after?.integrity?.verificationState).toBe("failed");
  });

  it("returns CONTENT_MISSING when storage object is deleted", async () => {
    const { app, storage, uow } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    const aggregate = await uow.evidence.getById("tenant-a", captured.data.id);
    await storage.delete("tenant-a", aggregate!.content!.storageLocator);

    const result = await app.integrity.verifyIntegrity(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });
    expect(result.status).toBe("CONTENT_MISSING");
    expect(result.expectedDigest).toBe(HASH_A);
    expect(result.actualDigest).toBeUndefined();

    const after = await uow.evidence.getById("tenant-a", captured.data.id);
    expect(after?.integrity?.contentHash).toBe(HASH_A);
    expect(after?.integrity?.verificationState).toBe("content_missing");
  });

  it("establishIntegrity is idempotent for unchanged content", async () => {
    const { app, uow } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    const aggregate = await uow.evidence.getById("tenant-a", captured.data.id);
    await uow.evidence.save(
      {
        ...aggregate!,
        integrity: null,
      },
      aggregate!.revision,
    );

    const cleared = await uow.evidence.getById("tenant-a", captured.data.id);
    const first = await app.integrity.establishIntegrity(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: cleared!.revision,
    });
    expect(first.status).toBe("ESTABLISHED");
    expect(first.idempotent).toBe(false);
    expect(first.digest).toBe(HASH_A);

    const afterFirst = await uow.evidence.getById("tenant-a", captured.data.id);
    const second = await app.integrity.establishIntegrity(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: afterFirst!.revision,
    });
    expect(second.idempotent).toBe(true);
    expect(second.digest).toBe(HASH_A);
  });

  it("does not silently replace an established digest on content change", async () => {
    const { app, storage, uow } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    const aggregate = await uow.evidence.getById("tenant-a", captured.data.id);
    await storage.update("tenant-a", aggregate!.content!.storageLocator, {
      bytes: PAYLOAD_B,
      mediaType: "text/plain",
      contentHash: HASH_B,
      hashAlgorithm: "sha256",
    });

    await expect(
      app.integrity.establishIntegrity(ctx(), {
        evidenceId: captured.data.id,
        expectedRevision: captured.data.revision,
      }),
    ).rejects.toMatchObject({ integrityCode: "INTEGRITY_MISMATCH" });

    const after = await uow.evidence.getById("tenant-a", captured.data.id);
    expect(after?.integrity?.contentHash).toBe(HASH_A);
  });

  it("denies integrity status without read permission", async () => {
    const { app } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    await expect(
      app.integrity.getIntegrityStatus(
        ctx({ userId: "stranger", permissions: [] }),
        captured.data.id,
      ),
    ).rejects.toMatchObject({ category: "forbidden" });
  });

  it("denies verify without verify permission", async () => {
    const { app } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    await expect(
      app.integrity.verifyIntegrity(
        ctx({ userId: "reader", permissions: ["qep.evidence.read"] }),
        {
          evidenceId: captured.data.id,
          expectedRevision: captured.data.revision,
        },
      ),
    ).rejects.toMatchObject({ category: "forbidden" });
  });

  it("enforces tenant isolation", async () => {
    const { app } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    await expect(
      app.integrity.getIntegrityStatus(
        ctx({ tenantId: "tenant-other", permissions: ["qep.evidence.admin"] }),
        captured.data.id,
      ),
    ).rejects.toBeTruthy();
  });

  it("command verifyIntegrity hashes via StoragePort when hash omitted", async () => {
    const { app } = createWired();
    const captured = await capture(app, PAYLOAD_A, HASH_A);
    const result = await app.commands.verifyIntegrity(ctx(), {
      kind: "verifyIntegrity",
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });
    expect(result.data.verificationState).toBe("verified");
  });
});

describe("APZQEP-120-S04 Local Provider integration", () => {
  it("establishes and verifies via Local provider streaming", async () => {
    const root = await mkdtemp(join(tmpdir(), "apzqep-s04-"));
    temps.push(root);
    const { app } = createWired("local", root);

    const bytes = Uint8Array.from(Buffer.from("local-integrity-bytes", "utf8"));
    const hash = createHash("sha256").update(bytes).digest("hex");
    const captured = await capture(app, bytes, hash);
    const verified = await app.integrity.verifyIntegrity(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });
    expect(verified.status).toBe("VERIFIED");
    expect(JSON.stringify(verified)).not.toContain(root);
  });
});

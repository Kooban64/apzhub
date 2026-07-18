import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  createInMemoryEvidenceStorageProvider,
  createManualTestingServices,
  createUnimplementedObjectStorageProvider,
  DomainRuleError,
} from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_1",
    permissions: ["*"],
  };
}

describe("evidence engine", () => {
  it("captures via in-memory storage and walks lifecycle", async () => {
    const storage = createInMemoryEvidenceStorageProvider();
    const svc = createManualTestingServices({
      persistence: createInMemoryTestingPersistence(),
      storage,
    });
    const rctx = ctx();
    const captured = await svc.evidence.captureEvidence(rctx, {
      tenantId: "tenant_1",
      type: "screenshot",
      title: "Screen",
      mimeType: "image/png",
      put: {
        keyHint: "screen-1",
        contentType: "image/png",
        bytes: new Uint8Array([1, 2, 3, 4]),
      },
    });
    expect(captured.lifecycleStatus).toBe("captured");
    expect(captured.storageRef.startsWith("mem://")).toBe(true);
    expect(captured.sizeBytes).toBe(4);
    expect(captured.contentHash).toBeTruthy();
    expect(captured.captureTime).toBeTruthy();

    const exists = await storage.exists(captured.storageRef);
    expect(exists).toBe(true);

    await svc.evidence.submitEvidence(rctx, captured.id);
    await svc.evidence.verifyEvidence(rctx, captured.id, "hash_ok");
    const approved = await svc.evidence.approveEvidence(rctx, captured.id);
    expect(approved.lifecycleStatus).toBe("approved");
    expect(approved.approvalState).toBe("approved");

    const archived = await svc.evidence.archiveEvidence(rctx, captured.id);
    expect(archived.lifecycleStatus).toBe("archived");
  });

  it("supports putViaStorage, bindStorageRef, reject path", async () => {
    const svc = createManualTestingServices({
      persistence: createInMemoryTestingPersistence(),
    });
    const rctx = ctx();
    const put = await svc.evidence.putViaStorage(rctx, {
      keyHint: "note",
      bytes: new TextEncoder().encode("hello"),
      contentType: "text/plain",
    });
    const registered = await svc.evidence.registerEvidence(rctx, {
      tenantId: "tenant_1",
      type: "note",
      title: "Note",
      storageRef: "temp://x",
    });
    const bound = await svc.evidence.bindStorageRef(
      rctx,
      registered.id,
      put.storageRef,
      {
        contentType: put.contentType,
        sizeBytes: put.sizeBytes,
        contentHash: put.contentHash,
      },
    );
    expect(bound.storageRef).toBe(put.storageRef);

    const captured = await svc.evidence.captureEvidence(rctx, {
      tenantId: "tenant_1",
      type: "log",
      title: "Log",
      put: { bytes: new Uint8Array([9]) },
    });
    await svc.evidence.submitEvidence(rctx, captured.id);
    const rejected = await svc.evidence.rejectEvidence(rctx, captured.id, "bad");
    expect(rejected.lifecycleStatus).toBe("rejected");
  });

  it("throws not_implemented for object storage provider", async () => {
    const provider = createUnimplementedObjectStorageProvider("bucket");
    expect(provider.providerKind).toBe("object_storage");
    await expect(provider.put({})).rejects.toThrow(DomainRuleError);
  });

  it("exposes storage provider from service", () => {
    const storage = createInMemoryEvidenceStorageProvider();
    const svc = createManualTestingServices({
      persistence: createInMemoryTestingPersistence(),
      storage,
    });
    expect(svc.evidence.getStorageProvider()).toBe(storage);
  });
});

/**
 * Q4 — evidence publish bridge invokes storage + catalogue (mocked).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AutomationExecutionRecord } from "@apzhub/platform-automation";
import type { EvidenceStorageManager } from "@apzhub/qep-evidence";

import {
  publishAutomationEvidence,
  resetEvidencePublishBridgeForTests,
} from "./evidence-publish-bridge";

afterEach(() => {
  resetEvidencePublishBridgeForTests();
  vi.restoreAllMocks();
});

function sampleRecord(
  overrides: Partial<AutomationExecutionRecord> = {},
): AutomationExecutionRecord {
  const artifactId = "art-1";
  return {
    executionId: "exec-1",
    tenantId: "tenant-1",
    projectId: "proj-1",
    providerId: "playwright",
    correlationId: "corr-1",
    requestedBy: "user-1",
    target: { kind: "url", name: "blank", baseUrl: "about:blank" },
    options: { dryRun: true },
    state: "completed",
    attempt: 1,
    maxAttempts: 1,
    createdAt: "2026-08-09T00:00:00.000Z",
    updatedAt: "2026-08-09T00:00:01.000Z",
    artifacts: [
      {
        artifactId,
        kind: "log",
        name: "provider.log",
        contentType: "text/plain",
        uri: "memory://playwright/provider.log",
        bytes: 12,
        sha256: "abc",
        createdAt: "2026-08-09T00:00:01.000Z",
      },
    ],
    timing: { durationMs: 1 },
    evidenceRefs: [`evidence://automation/exec-1/${artifactId}`],
    resultSummary: "ok",
    ...overrides,
  };
}

describe("publishAutomationEvidence (Q4)", () => {
  it("invokes durable storage put and catalogue capture/associate", async () => {
    const put = vi.fn(async () => ({
      storageLocator: "evst://local/loc-1",
      byteSize: 64,
      mediaType: "application/json",
    }));
    const storage = {
      put,
    } as unknown as EvidenceStorageManager;

    const capture = vi.fn(async () => ({ id: "ev-1", revision: 0 }));
    const associate = vi.fn(async () => undefined);
    const log = vi.fn();

    const result = await publishAutomationEvidence(sampleRecord(), {
      storage,
      storageConfig: {
        provider: "local",
        local: { rootDirectory: ".data/qep-evidence" },
      },
      catalogue: { capture, associate },
      log,
    });

    expect(put).toHaveBeenCalledOnce();
    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        mediaType: "application/json",
        hashAlgorithm: "sha256",
      }),
    );
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "proj-1",
        sourceKind: "automation",
        sourceSystemId: "exec-1",
        classification: "log",
      }),
    );
    expect(associate).not.toHaveBeenCalled();
    expect(result.storedCount).toBe(1);
    expect(result.cataloguedCount).toBe(1);
    expect(result.storageLocators).toEqual(["evst://local/loc-1"]);
    expect(result.catalogueIds).toEqual(["ev-1"]);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ event: "qep.automation.evidence.stored" }),
    );
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ event: "qep.automation.evidence.catalogued" }),
    );
  });

  it("fails soft when catalogue is unavailable but still stores", async () => {
    const put = vi.fn(async () => ({
      storageLocator: "evst://local/loc-2",
      byteSize: 32,
      mediaType: "application/json",
    }));
    const storage = {
      put,
    } as unknown as EvidenceStorageManager;
    const log = vi.fn();

    const result = await publishAutomationEvidence(sampleRecord(), {
      storage,
      storageConfig: {
        provider: "local",
        local: { rootDirectory: ".data/qep-evidence" },
      },
      catalogue: null,
      log,
    });

    expect(put).toHaveBeenCalledOnce();
    expect(result.storedCount).toBe(1);
    expect(result.cataloguedCount).toBe(0);
    expect(result.catalogueAvailable).toBe(false);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "qep.automation.evidence.catalogue_unavailable",
        softFail: true,
      }),
    );
  });

  it("stores binary artifact bytes with native mediaType when contentBase64 is present", async () => {
    const pngBase64 = Buffer.from("fake-png-bytes").toString("base64");
    const put = vi.fn(async () => ({
      storageLocator: "evst://local/loc-bin",
      byteSize: 14,
      mediaType: "image/png",
    }));
    const storage = {
      put,
    } as unknown as EvidenceStorageManager;
    const capture = vi.fn(async () => ({ id: "ev-bin", revision: 0 }));

    const result = await publishAutomationEvidence(
      sampleRecord({
        artifacts: [
          {
            artifactId: "art-1",
            kind: "screenshot",
            name: "page.png",
            contentType: "image/png",
            uri: "memory://playwright/page.png",
            bytes: 14,
            sha256: "deadbeef",
            contentBase64: pngBase64,
            createdAt: "2026-08-09T00:00:01.000Z",
          },
        ],
      }),
      {
        storage,
        storageConfig: {
          provider: "local",
          local: { rootDirectory: ".data/qep-evidence" },
        },
        catalogue: { capture },
        log: vi.fn(),
      },
    );

    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: "image/png",
        contentHash: "deadbeef",
        bytes: expect.any(Uint8Array),
      }),
    );
    const putArg = put.mock.calls[0]![0] as { bytes: Uint8Array };
    expect(Buffer.from(putArg.bytes).toString("utf8")).toBe("fake-png-bytes");
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: "image/png",
        classification: "screenshot",
        title: "page.png",
      }),
    );
    expect(result.storedCount).toBe(1);
  });

  it("fails soft on catalogue capture errors after storage succeeds", async () => {
    const put = vi.fn(async () => ({
      storageLocator: "evst://local/loc-3",
      byteSize: 16,
      mediaType: "application/json",
    }));
    const storage = {
      put,
    } as unknown as EvidenceStorageManager;
    const log = vi.fn();

    const result = await publishAutomationEvidence(sampleRecord(), {
      storage,
      storageConfig: {
        provider: "local",
        local: { rootDirectory: ".data/qep-evidence" },
      },
      catalogue: {
        capture: async () => {
          throw new Error("catalogue down");
        },
      },
      log,
    });

    expect(put).toHaveBeenCalledOnce();
    expect(result.storedCount).toBe(1);
    expect(result.cataloguedCount).toBe(0);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "qep.automation.evidence.catalogue_failed",
        softFail: true,
        error: "catalogue down",
      }),
    );
  });
});

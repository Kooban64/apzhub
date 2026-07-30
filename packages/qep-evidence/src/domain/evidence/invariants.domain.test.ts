import { describe, expect, it } from "vitest";

import { EvidenceValidationError } from "../../shared/errors";
import {
  captureEvidence,
  createContentHash,
  createEvidenceClassification,
  createEvidenceContent,
  createEvidenceReference,
  createEvidenceRetention,
} from "./index";

const HASH = "c".repeat(64);

describe("Evidence domain invariants / value objects (ENG-110B)", () => {
  it("rejects invalid content hash shape", () => {
    expect(() => createContentHash("not-a-hash")).toThrow(EvidenceValidationError);
  });

  it("rejects unknown classification", () => {
    expect(() => createEvidenceClassification({ category: "nope" })).toThrow(
      EvidenceValidationError,
    );
  });

  it("requires holdReason when legalHold is true", () => {
    expect(() =>
      createEvidenceRetention({ retentionClass: "standard", legalHold: true }),
    ).toThrow(EvidenceValidationError);
  });

  it("rejects negative byteSize", () => {
    expect(() =>
      createEvidenceContent({
        mediaType: "text/plain",
        byteSize: -1,
        contentHash: HASH,
        storageLocator: "x",
      }),
    ).toThrow(EvidenceValidationError);
  });

  it("creates immutable EvidenceReference value object", () => {
    const reference = createEvidenceReference({
      evidenceId: "ev-1",
      contentHash: HASH,
    });
    expect(reference.evidenceId).toBe("ev-1");
    expect(Object.isFrozen(reference)).toBe(false);
    expect(reference.contentHash).toBe(HASH);
  });

  it("requires tenant and ownership on capture", () => {
    expect(() =>
      captureEvidence({
        id: "ev-1",
        tenantId: " ",
        projectId: "project-1",
        ownerId: "owner-1",
        createdBy: "actor-1",
        createdAt: "2026-07-30T00:00:00.000Z",
        source: { kind: "manual_upload" },
        content: {
          mediaType: "text/plain",
          byteSize: 1,
          contentHash: HASH,
          storageLocator: "loc",
        },
      }),
    ).toThrow(EvidenceValidationError);
  });

  it("defaults hashAlgorithm to sha256", () => {
    const content = createEvidenceContent({
      mediaType: "application/json",
      byteSize: 10,
      contentHash: HASH,
      storageLocator: "loc",
    });
    expect(content.hashAlgorithm).toBe("sha256");
  });
});

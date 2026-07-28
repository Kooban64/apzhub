/**
 * APZQEP-ENG-020E Part 3 — mass-assignment regression for baseline request
 * body schemas. All schemas are `.strict()`, so any server-owned or unknown
 * field must be rejected rather than silently accepted.
 */
import { describe, expect, it } from "vitest";

import {
  qepBaselineAddItemBodySchema,
  qepBaselineCompareBodySchema,
  qepBaselineCreateBodySchema,
  qepBaselineUpdateDraftBodySchema,
} from "./qep";

describe("APZQEP-ENG-020E baseline body schemas reject mass assignment", () => {
  it("create rejects server-owned fields (id, status, integrity, tenantId)", () => {
    const result = qepBaselineCreateBodySchema.safeParse({
      name: "Release 1.0",
      id: "rbl_evil",
      status: "locked",
      tenantId: "other_tenant",
      integrityFingerprint: "forged",
      availableActions: ["lock"],
    });
    expect(result.success).toBe(false);
  });

  it("create accepts only the documented fields", () => {
    const result = qepBaselineCreateBodySchema.safeParse({
      name: "Release 1.0",
      description: "First release baseline",
    });
    expect(result.success).toBe(true);
  });

  it("update-draft rejects an attempt to smuggle a status or lock transition", () => {
    const result = qepBaselineUpdateDraftBodySchema.safeParse({
      name: "Renamed",
      status: "locked",
      lockedAt: "2026-07-25T10:00:00.000Z",
      lockedBy: "attacker",
    });
    expect(result.success).toBe(false);
  });

  it("add-item rejects attempts to forge inclusion metadata", () => {
    const result = qepBaselineAddItemBodySchema.safeParse({
      contentVersionId: "rcv_1",
      includedAt: "2026-07-25T10:00:00.000Z",
      includedBy: "attacker",
    });
    expect(result.success).toBe(false);
  });

  it("compare rejects unexpected extra fields", () => {
    const result = qepBaselineCompareBodySchema.safeParse({
      baseBaselineId: "rbl_1",
      targetBaselineId: "rbl_2",
      forceStatus: "archived",
    });
    expect(result.success).toBe(false);
  });
});

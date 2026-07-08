import { describe, expect, it } from "vitest";

import { ClientValidator } from "./client-validator";
import { isClientReference, validateReferenceNumber } from "./reference-validator";

describe("ClientValidator", () => {
  it("requires display name", () => {
    const result = ClientValidator.validate({
      clientReference: "",
      displayName: "",
      clientType: "individual",
      status: "prospect",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.displayName).toBeDefined();
  });

  it("accepts valid client input", () => {
    const result = ClientValidator.validate({
      clientReference: "CLT-2026-00001",
      displayName: "Example Client",
      clientType: "organisation",
      status: "active",
    });

    expect(result.valid).toBe(true);
  });
});

describe("ReferenceValidator", () => {
  it("validates canonical reference numbers", () => {
    expect(isClientReference("CLT-2026-00001")).toBe(true);
    expect(isClientReference("CLT-2026-000001")).toBe(true);
    expect(validateReferenceNumber("MAT-2026-000001", { prefix: "MAT" })).toBe(true);
    expect(isClientReference("INVALID")).toBe(false);
  });
});

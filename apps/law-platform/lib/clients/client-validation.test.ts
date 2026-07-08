import { describe, expect, it } from "vitest";

import { createEmptyClientFormValues, validateClientForm } from "./index";

describe("validateClientForm", () => {
  it("accepts valid canonical client values", () => {
    const result = validateClientForm({
      ...createEmptyClientFormValues(),
      displayName: "Harbourview Holdings Pty Ltd",
      clientReference: "CLT-2026-00099",
      customFields: "industry=Property\njurisdiction=NSW",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rejects missing display name and invalid reference format", () => {
    const result = validateClientForm({
      ...createEmptyClientFormValues(),
      displayName: "",
      clientReference: "INVALID",
      customFields: "bad-format",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.displayName).toBeDefined();
    expect(result.errors.clientReference).toBeDefined();
    expect(result.errors.customFields).toBeDefined();
  });
});

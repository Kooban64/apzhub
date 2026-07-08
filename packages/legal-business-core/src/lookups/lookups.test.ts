import { describe, expect, it } from "vitest";

import { legalLookups } from "../lookups";

describe("lookups", () => {
  it("provides matter status labels", () => {
    expect(legalLookups.matterStatus.get("open")?.label).toBe("Open");
  });

  it("provides country and language lookups", () => {
    expect(legalLookups.country.has("AU")).toBe(true);
    expect(legalLookups.language.has("en-AU")).toBe(true);
  });
});

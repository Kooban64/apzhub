import { describe, expect, it } from "vitest";

import { resolveCommandPaletteMode } from "./resolve-command-palette-mode";

describe("resolveCommandPaletteMode", () => {
  it("defaults to commands mode", () => {
    expect(resolveCommandPaletteMode(null)).toBe("commands");
    expect(resolveCommandPaletteMode(undefined)).toBe("commands");
    expect(resolveCommandPaletteMode("commands")).toBe("commands");
  });

  it("enables knowledge mode for E2E verification", () => {
    expect(resolveCommandPaletteMode("knowledge")).toBe("knowledge");
  });
});

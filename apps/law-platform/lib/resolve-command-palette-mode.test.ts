import { describe, expect, it } from "vitest";

import { resolveCommandPaletteMode } from "./resolve-command-palette-mode";

describe("resolveCommandPaletteMode", () => {
  it("defaults to commands mode outside law workspace", () => {
    expect(resolveCommandPaletteMode(null)).toBe("commands");
    expect(resolveCommandPaletteMode(undefined)).toBe("commands");
    expect(resolveCommandPaletteMode("commands")).toBe("commands");
    expect(resolveCommandPaletteMode(undefined, "/workspace/home")).toBe("commands");
  });

  it("enables knowledge mode for law workspace routes", () => {
    expect(resolveCommandPaletteMode(undefined, "/workspace/law/search")).toBe(
      "knowledge",
    );
    expect(resolveCommandPaletteMode(undefined, "/workspace/law/matters")).toBe(
      "knowledge",
    );
  });

  it("supports explicit palette mode overrides", () => {
    expect(resolveCommandPaletteMode("knowledge")).toBe("knowledge");
    expect(resolveCommandPaletteMode("commands", "/workspace/law/search")).toBe(
      "commands",
    );
  });
});

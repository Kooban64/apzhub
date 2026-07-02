import { describe, expect, it } from "vitest";

import { normaliseManifestDependencies } from "./dependencies";

describe("normaliseManifestDependencies", () => {
  it("returns empty axes when dependencies undefined", () => {
    const result = normaliseManifestDependencies(undefined);
    expect(result).toEqual({
      platform: [],
      services: [],
      integrations: [],
      modules: [],
      all: [],
    });
  });

  it("deduplicates and sorts dependency ids", () => {
    const result = normaliseManifestDependencies({
      platform: ["theme", "identity"],
      services: ["svc-b", "svc-a"],
      integrations: ["svc-a"],
      modules: ["mod-1"],
    });

    expect(result.platform).toEqual(["identity", "theme"]);
    expect(result.services).toEqual(["svc-a", "svc-b"]);
    expect(result.integrations).toEqual(["svc-a"]);
    expect(result.modules).toEqual(["mod-1"]);
    expect(result.all).toEqual(["identity", "mod-1", "svc-a", "svc-b", "theme"]);
  });
});

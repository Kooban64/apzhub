import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseCapabilityManifestYaml } from "@apzhub/platform-runtime/manifest-engine";

const fixturesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/manifests",
);

function loadFixture(fileName: string) {
  const yaml = readFileSync(path.join(fixturesDir, fileName), "utf8");
  return parseCapabilityManifestYaml(yaml);
}

describe("platform asset manifest fixtures", () => {
  it("validates platform theme asset fixture", () => {
    const result = loadFixture("platform-theme-assets.yaml");
    expect(result.success).toBe(true);
  });

  it("validates platform home asset fixture", () => {
    const result = loadFixture("platform-home-assets.yaml");
    expect(result.success).toBe(true);
  });
});

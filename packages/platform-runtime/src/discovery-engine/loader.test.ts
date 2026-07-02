import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { loadDiscoveredManifest } from "./loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(__dirname, "../../../../testing/fixtures/discovery");

describe("loadDiscoveredManifest", () => {
  it("loads a valid manifest into a discovered capability", () => {
    const manifestPath = path.join(fixturesRoot, "alpha/component.yaml");
    const result = loadDiscoveredManifest({
      absolutePath: manifestPath,
      relativePath: "testing/fixtures/discovery/alpha/component.yaml",
      fileName: "component.yaml",
      kindHint: "component",
    });

    expect("capability" in result).toBe(true);
    if ("capability" in result) {
      expect(result.capability.id).toBe("discovery-alpha");
      expect(result.capability.lifecycleState).toBe("discovered");
    }
  });

  it("returns diagnostics for invalid manifests", () => {
    const manifestPath = path.join(fixturesRoot, "invalid/component.yaml");
    const result = loadDiscoveredManifest({
      absolutePath: manifestPath,
      relativePath: "testing/fixtures/discovery/invalid/component.yaml",
      fileName: "component.yaml",
      kindHint: "component",
    });

    expect("diagnostics" in result).toBe(true);
    if ("diagnostics" in result) {
      expect(result.diagnostics[0]?.code).toBe("MANIFEST_VALIDATION_ERROR");
    }
  });

  it("returns diagnostics for broken YAML", () => {
    const manifestPath = path.join(fixturesRoot, "broken-yaml/component.yaml");
    const result = loadDiscoveredManifest({
      absolutePath: manifestPath,
      relativePath: "testing/fixtures/discovery/broken-yaml/component.yaml",
      fileName: "component.yaml",
      kindHint: "component",
    });

    expect("diagnostics" in result).toBe(true);
    if ("diagnostics" in result) {
      expect(result.diagnostics[0]?.code).toBe("MANIFEST_PARSE_ERROR");
    }
  });

  it("returns diagnostics when manifest file cannot be read", () => {
    const result = loadDiscoveredManifest({
      absolutePath: path.join(fixturesRoot, "does-not-exist/component.yaml"),
      relativePath: "does-not-exist/component.yaml",
      fileName: "component.yaml",
      kindHint: "component",
    });

    expect("diagnostics" in result).toBe(true);
    if ("diagnostics" in result) {
      expect(result.diagnostics[0]?.code).toBe("READ_ERROR");
    }
  });

  it("maps version validation errors to diagnostics", () => {
    const manifestPath = path.join(fixturesRoot, "bad-version/component.yaml");
    const result = loadDiscoveredManifest({
      absolutePath: manifestPath,
      relativePath: "bad-version/component.yaml",
      fileName: "component.yaml",
      kindHint: "component",
    });

    expect("diagnostics" in result).toBe(true);
    if ("diagnostics" in result) {
      expect(result.diagnostics[0]?.code).toBe("VERSION_INVALID");
    }
  });
});

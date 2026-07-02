import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { resolveDiscoveryConfig, resolveDiscoveryRootPaths } from "./config";
import { scanForManifestFiles } from "./scanner";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(__dirname, "../../../../testing/fixtures/discovery");
const workspaceRoot = path.resolve(__dirname, "../../../../");

describe("scanForManifestFiles", () => {
  it("recursively discovers manifests in deterministic order", () => {
    const config = resolveDiscoveryConfig({
      workspaceRoot: fixturesRoot,
      roots: ["."],
    });
    const { manifests } = scanForManifestFiles(
      config,
      resolveDiscoveryRootPaths(config),
    );

    const relativePaths = manifests.map((m) => m.relativePath);
    expect(relativePaths).toEqual([
      "alpha/component.yaml",
      "bad-version/component.yaml",
      "beta/component.yaml",
      "broken-yaml/component.yaml",
      "invalid/component.yaml",
      "nested/deep/service.yaml",
      "with-node-modules/app/component.yaml",
    ]);
  });

  it("ignores manifests under node_modules", () => {
    const config = resolveDiscoveryConfig({
      workspaceRoot: fixturesRoot,
      roots: ["with-node-modules"],
    });
    const { manifests } = scanForManifestFiles(
      config,
      resolveDiscoveryRootPaths(config),
    );

    expect(manifests).toHaveLength(1);
    expect(manifests[0]?.relativePath).toBe("with-node-modules/app/component.yaml");
  });

  it("ignores unsupported files", () => {
    const config = resolveDiscoveryConfig({
      workspaceRoot: fixturesRoot,
      roots: ["."],
      manifestFileNames: ["service.yaml"],
    });
    const { manifests } = scanForManifestFiles(
      config,
      resolveDiscoveryRootPaths(config),
    );

    expect(manifests).toHaveLength(1);
    expect(manifests[0]?.fileName).toBe("service.yaml");
  });

  it("reports missing discovery roots", () => {
    const config = resolveDiscoveryConfig({
      workspaceRoot,
      roots: ["path/that/does/not/exist"],
    });
    const { diagnostics } = scanForManifestFiles(
      config,
      resolveDiscoveryRootPaths(config),
    );

    expect(diagnostics[0]?.code).toBe("ROOT_NOT_FOUND");
  });

  it("reports when discovery root is not a directory", () => {
    const config = resolveDiscoveryConfig({
      workspaceRoot,
      roots: ["package.json"],
    });
    const { diagnostics } = scanForManifestFiles(
      config,
      resolveDiscoveryRootPaths(config),
    );

    expect(diagnostics[0]?.code).toBe("SCAN_ERROR");
    expect(diagnostics[0]?.message).toContain("not a directory");
  });

  it("assigns unknown kind hints for unmapped manifest filenames", () => {
    const config = resolveDiscoveryConfig({
      workspaceRoot: fixturesRoot,
      roots: ["custom"],
      manifestFileNames: ["widget.yaml"],
    });
    const { manifests } = scanForManifestFiles(
      config,
      resolveDiscoveryRootPaths(config),
    );
    expect(manifests).toHaveLength(1);
    expect(manifests[0]?.kindHint).toBe("unknown");
  });
});

import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { discoverCapabilities } from "./discover";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "../../../../");
const fixturesRoot = path.resolve(workspaceRoot, "testing/fixtures/discovery");

describe("discoverCapabilities", () => {
  it("discovers fixture manifests with structured diagnostics for failures", () => {
    const result = discoverCapabilities({
      workspaceRoot: fixturesRoot,
      roots: ["."],
    });

    const ids = result.capabilities.map((c) => c.id).sort();
    expect(ids).toEqual([
      "discovery-alpha",
      "discovery-app",
      "discovery-beta",
      "discovery-deep-service",
    ]);
    expect(result.capabilities.every((c) => c.lifecycleState === "discovered")).toBe(
      true,
    );
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics.some((d) => d.code === "MANIFEST_PARSE_ERROR")).toBe(
      true,
    );
    expect(result.diagnostics.some((d) => d.code === "MANIFEST_VALIDATION_ERROR")).toBe(
      true,
    );
  });

  it("discovers SPR-001 UI component manifests", () => {
    const result = discoverCapabilities({
      workspaceRoot,
      roots: ["packages/ui/src/components"],
    });

    expect(result.capabilities.length).toBeGreaterThanOrEqual(7);
    expect(result.capabilities.every((c) => c.kind === "component")).toBe(true);
    expect(result.capabilities.every((c) => c.lifecycleState === "discovered")).toBe(
      true,
    );
  });

  it("returns deterministic manifest order across runs", () => {
    const config = {
      workspaceRoot: fixturesRoot,
      roots: ["alpha", "beta"],
    };
    const first = discoverCapabilities(config);
    const second = discoverCapabilities(config);

    expect(first.manifests.map((m) => m.relativePath)).toEqual(
      second.manifests.map((m) => m.relativePath),
    );
  });

  it("does not resolve dependencies or register capabilities", () => {
    const result = discoverCapabilities({
      workspaceRoot: fixturesRoot,
      roots: ["."],
    });

    expect(result.capabilities.every((c) => c.lifecycleState === "discovered")).toBe(
      true,
    );
    expect(result).not.toHaveProperty("order");
    expect(result).not.toHaveProperty("registered");
  });

  it("uses default monorepo roots when scanning the workspace", () => {
    const result = discoverCapabilities({ workspaceRoot });

    expect(result.scannedRoots.length).toBeGreaterThan(0);
    expect(result.manifests.length).toBeGreaterThanOrEqual(7);
  });
});

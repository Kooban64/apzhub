import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseCapabilityManifestYaml, validateCapabilityManifest } from "./validate";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "../../../../testing/fixtures/registry");
const uiComponentsDir = path.resolve(
  __dirname,
  "../../../../packages/ui/src/components",
);

const componentDirs = [
  "button",
  "input",
  "card",
  "header",
  "sidebar",
  "status-bar",
  "shell-layout",
];

describe("Manifest Engine — validateCapabilityManifest", () => {
  it("validates a theme fixture", () => {
    const yaml = readFileSync(path.join(fixturesDir, "valid-theme.yaml"), "utf8");
    const themeResult = parseCapabilityManifestYaml(yaml);
    expect(themeResult.success).toBe(true);
    if (themeResult.success) {
      expect(themeResult.data.kind).toBe("theme");
    }

    const invalid = validateCapabilityManifest(
      { manifestSchemaVersion: "1.0", kind: "component" },
      "component",
    );
    expect(invalid.success).toBe(false);
  });

  it("rejects invalid capability id", () => {
    const yaml = readFileSync(
      path.join(fixturesDir, "invalid-component-id.yaml"),
      "utf8",
    );
    const result = parseCapabilityManifestYaml(yaml);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.code === "MANIFEST_VALIDATION_ERROR")).toBe(
        true,
      );
    }
  });

  it("rejects invalid semver", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "test",
      name: "Test",
      version: "not-semver",
      kind: "component",
      metadata: { category: "primitive" },
      component: { theme: { supportsDarkMode: true } },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("VERSION_INVALID");
    }
  });

  it("rejects kind mismatch when expected", () => {
    const result = validateCapabilityManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "test",
        name: "Test",
        version: "1.0.0",
        kind: "service",
        metadata: {},
        service: { category: "platform" },
      },
      "component",
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("KIND_MISMATCH");
    }
  });

  it("validates service fixture", () => {
    const yaml = readFileSync(path.join(fixturesDir, "valid-service.yaml"), "utf8");
    const result = parseCapabilityManifestYaml(yaml);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.kind).toBe("service");
    }
  });

  it("validates all SPR-001 UI component manifests", () => {
    for (const dir of componentDirs) {
      const yaml = readFileSync(
        path.join(uiComponentsDir, dir, "component.yaml"),
        "utf8",
      );
      const result = parseCapabilityManifestYaml(yaml);
      expect(result.success, `component.yaml in ${dir} should validate`).toBe(true);
    }
  });

  it("validates optional workbench navigation block on module manifests", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "platform-home",
      name: "Home",
      version: "1.0.0",
      kind: "module",
      metadata: { category: "platform" },
      module: { category: "platform" },
      workbench: {
        navigation: {
          level: "activity-bar",
          workspace: "home",
          order: 10,
          permission: "platform.nav.home.view",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown workbench navigation fields", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "platform-home",
      name: "Home",
      version: "1.0.0",
      kind: "module",
      metadata: { category: "platform" },
      module: { category: "platform" },
      workbench: {
        navigation: {
          level: "activity-bar",
          workspace: "home",
          unexpected: true,
        },
      },
    });

    expect(result.success).toBe(false);
  });

  it("validates workbench scaffold module manifests on disk", () => {
    const manifestsDir = path.resolve(
      __dirname,
      "../../../../packages/workbench-framework/manifests",
    );
    const manifestPaths = [
      path.join(manifestsDir, "platform-home/module.yaml"),
      path.join(manifestsDir, "platform-administration/module.yaml"),
      path.join(manifestsDir, "platform-home-overview/module.yaml"),
    ];

    for (const manifestPath of manifestPaths) {
      const yaml = readFileSync(manifestPath, "utf8");
      const result = parseCapabilityManifestYaml(yaml);
      expect(result.success, `${manifestPath} should validate`).toBe(true);
    }
  });
});

describe("Manifest Engine — schema coverage", () => {
  const kinds = [
    {
      kind: "module" as const,
      manifest: {
        manifestSchemaVersion: "1.0",
        id: "sample-module",
        name: "Sample",
        version: "1.0.0",
        kind: "module",
        metadata: { category: "productivity" },
        module: { status: "enabled" },
      },
    },
    {
      kind: "integration" as const,
      manifest: {
        manifestSchemaVersion: "1.0",
        id: "sample-integration",
        name: "Sample",
        version: "1.0.0",
        kind: "integration",
        metadata: {},
        integration: { type: "rest-api", capabilities: ["health"] },
      },
    },
    {
      kind: "event" as const,
      manifest: {
        manifestSchemaVersion: "1.0",
        id: "sample-event",
        name: "Sample",
        version: "1.0.0",
        kind: "event",
        metadata: {},
        event: { publisher: "platform-runtime", category: "platform" },
      },
    },
    {
      kind: "command" as const,
      manifest: {
        manifestSchemaVersion: "1.0",
        id: "sample-command",
        name: "Sample",
        version: "1.0.0",
        kind: "command",
        metadata: {},
        command: { label: "Sample" },
      },
    },
    {
      kind: "worker" as const,
      manifest: {
        manifestSchemaVersion: "1.0",
        id: "sample-worker",
        name: "Sample",
        version: "1.0.0",
        kind: "worker",
        metadata: {},
        worker: {},
      },
    },
    {
      kind: "feature-flag" as const,
      manifest: {
        manifestSchemaVersion: "1.0",
        id: "sample-flag",
        name: "Sample",
        version: "1.0.0",
        kind: "feature-flag",
        metadata: {},
        featureFlag: { default: false },
      },
    },
  ];

  it.each(kinds)("validates $kind capability manifest", ({ manifest }) => {
    const result = validateCapabilityManifest(manifest);
    expect(result.success).toBe(true);
  });
});

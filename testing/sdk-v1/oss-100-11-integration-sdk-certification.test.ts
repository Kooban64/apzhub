/**
 * OSS-100-11 — Integration SDK v1.0.0 Wave Certification harness.
 * Governance / version promotion verification — no new adapter functionality.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  INTEGRATION_SDK_PACKAGE,
  INTEGRATION_SDK_VERSION,
} from "@apzhub/integration-sdk";

const ROOT = join(__dirname, "../..");

const REQUIRED_DOCS = [
  "docs/architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Integration-SDK-Reference-Standard.md",
  "docs/developer/APZHUB-Integration-SDK-Provider-Development-Guide.md",
  "docs/guides/APZHUB-Integration-SDK-Compatibility-Guide.md",
  "docs/guides/APZHUB-Integration-SDK-Operational-Readiness-Guide.md",
  "docs/reviews/OSS-100-11-Security-Review.md",
  "docs/reviews/OSS-100-11-Quality-Evidence.md",
  "docs/releases/APZHUB-Integration-SDK-v1.0.0-Release-Notes.md",
  "docs/sprint/OSS-100-11-completion-report.md",
  "docs/adr/ADR-0065-integration-sdk-v1-architecture-freeze.md",
] as const;

const ARCHITECTURE_CHAIN = [
  "Platform Services",
  "Integration SDK",
  "Provider Adapter",
  "Vendor API",
] as const;

describe("OSS-100-11 Integration SDK v1.0.0 Wave Certification", () => {
  it("passes wave audit (architecture · boundary · compatibility · docs)", () => {
    const script = join(ROOT, "scripts/oss-100-11-integration-sdk-wave-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("promotes package and constant to 1.0.0 in lockstep", () => {
    expect(INTEGRATION_SDK_PACKAGE).toBe("@apzhub/integration-sdk");
    expect(INTEGRATION_SDK_VERSION).toBe("1.0.0");
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "packages/integration-sdk/package.json"), "utf8"),
    );
    expect(pkg.version).toBe("1.0.0");
  });

  it("requires the wave documentation pack", () => {
    for (const doc of REQUIRED_DOCS) {
      expect(existsSync(join(ROOT, doc)), doc).toBe(true);
    }
  });

  it("documents the certified architecture chain", () => {
    const freeze = readFileSync(
      join(
        ROOT,
        "docs/architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md",
      ),
      "utf8",
    );
    for (const layer of ARCHITECTURE_CHAIN) {
      expect(freeze, layer).toContain(layer);
    }
    expect(freeze).toMatch(/Architecture Frozen|FROZEN/i);
  });

  it("retains certified provider and Search publication pins", () => {
    const pins: Record<string, string> = {
      "integrations/plane/package.json": "0.6.0",
      "integrations/zammad/package.json": "0.8.0",
      "integrations/meilisearch/package.json": "0.1.0",
      "integrations/n8n/package.json": "0.1.0",
      "packages/search-integration/package.json": "0.2.0",
      "packages/search-orchestrator/package.json": "0.1.0",
    };
    for (const [path, expected] of Object.entries(pins)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("registers certify:integration-sdk in root package.json", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    expect(pkg.scripts["certify:integration-sdk"]).toContain(
      "oss-100-11-certify-integration-sdk.mjs",
    );
    expect(pkg.scripts["audit:integration-sdk-wave"]).toContain(
      "oss-100-11-integration-sdk-wave-audit.mjs",
    );
  });
});

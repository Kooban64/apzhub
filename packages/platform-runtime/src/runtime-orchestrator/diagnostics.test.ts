import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { Configuration } from "../configuration-manager";
import { Health } from "../health-manager";
import { createOrchestratorContext } from "./pipeline";
import { buildRuntimeDiagnostics, createEmptyRuntimeDiagnostics } from "./diagnostics";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(__dirname, "../../../../testing/fixtures/discovery");

describe("runtime diagnostics", () => {
  afterEach(() => {
    Configuration._resetForTests();
    Health._resetForTests();
  });

  it("returns an idle diagnostics shell", () => {
    const diagnostics = createEmptyRuntimeDiagnostics("idle");
    expect(diagnostics.configuration.validationStatus).toBe("not-loaded");
    expect(diagnostics.health.status).toBe("unknown");
    expect(diagnostics.warnings).toEqual([]);
  });

  it("aggregates subsystem summaries from orchestrator context", () => {
    Configuration.load({
      overrides: { workspaceRoot: fixturesRoot, platformVersion: "0.2.0" },
    });
    const context = createOrchestratorContext({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });
    context.scannedDiscoveryRoots = [`${fixturesRoot}/alpha`];
    context.manifestRejectedCount = 1;
    context.warnings.push({
      code: "ORCHESTRATOR_MANIFEST_FAILED",
      message: "warning",
      subsystem: "manifest-engine",
    });

    const diagnostics = buildRuntimeDiagnostics("ready", context);
    expect(diagnostics.configuration.platformVersion).toBe("0.2.0");
    expect(diagnostics.discovery.roots.length).toBeGreaterThan(0);
    expect(diagnostics.manifest.rejectedCount).toBe(1);
    expect(diagnostics.warnings).toHaveLength(1);
  });
});

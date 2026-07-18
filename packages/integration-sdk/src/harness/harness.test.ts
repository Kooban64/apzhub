import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sdkErr, sdkOk, createIntegrationError } from "../errors";
import {
  AdapterHarness,
  createAdapterHarness,
  mergeFileMaps,
  getAdapterTemplate,
  listRequiredTemplatePaths,
  REFERENCE_ADAPTER_TEMPLATE,
  scaffoldAdapter,
  createAdapterScaffold,
  certifyAdapter,
  createAdapterCertification,
  certificationReportToMarkdown,
  summariseOutcome,
  assessAdapterCompliance,
  createAdapterCompliance,
  validateAdapter,
  validateAdapterCapabilities,
  runAdapterContractSuite,
  createAdapterContractSuite,
  createAdapterTestKit,
  createDefaultFixtures,
  createFixtureFramework,
  createAdapterMockHarness,
  createAdapterDocumentationGenerator,
  buildAdapterQualityReport,
  createAdapterQualityReportBuilder,
  evaluateAdapterCompatibility,
  createAdapterCompatibilitySuite,
  createAdapterPerformanceHarness,
  validateAdapterBoundary,
  createAdapterBoundaryValidator,
  runCertificationChecks,
  runContractChecks,
  runBoundaryChecks,
  runDocumentationChecks,
  buildQualityReport,
  CERTIFICATION_CATEGORIES,
} from "./index";

describe("harness package version alignment", () => {
  it("package.json and exports target 1.0.0", () => {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, "../../package.json"), "utf8"),
    ) as { version: string; exports: Record<string, string> };
    expect(pkg.version).toBe("1.0.0");
    expect(pkg.exports["./harness"]).toBe("./src/harness/index.ts");
  });
});

describe("AdapterHarness", () => {
  it("boots, configures fixtures, runWith, and cleans up", async () => {
    const harness = createAdapterHarness();
    expect(harness.isBooted).toBe(false);

    const state = await harness.boot({
      fixtures: { custom: { hello: "world" } },
    });
    expect(state.booted).toBe(true);
    expect(harness.adapter.isInitialised).toBe(true);
    expect(harness.context.integrationId).toBe("mock-engine");
    expect(harness.configuration.manifest.adapterId).toBe("mock-engine-adapter");
    expect(harness.getFixture("custom")).toEqual({ hello: "world" });

    harness.configure({ fixtures: { extra: 1 } });
    expect(harness.listFixtureKeys()).toContain("extra");

    const loaded = harness.loadFixtures({ page: { items: [] } });
    expect(loaded.payloads.page).toEqual({ items: [] });
    expect(loaded.requestContexts["default"]?.tenantId).toBeTruthy();

    const result = await harness.runWith(async (s) => {
      expect(s.adapter.isConnected).toBe(false);
      return "ok";
    });
    expect(result).toBe("ok");

    await harness.cleanup();
    expect(harness.isDisposed).toBe(true);
    expect(() => harness.adapter).toThrow(/not booted/);
  });

  it("rejects double boot and disposed reuse without reset", async () => {
    const harness = new AdapterHarness();
    await harness.boot();
    await expect(harness.boot()).rejects.toThrow(/already booted/);
    await harness.cleanup();
    await expect(harness.boot()).rejects.toThrow(/disposed/);
    harness.reset();
    await harness.boot();
    await harness.cleanup();
  });

  it("runWith autoCleanup and mergeFileMaps", async () => {
    const harness = createAdapterHarness();
    await harness.runWith(async () => "done", { autoCleanup: true });
    expect(harness.isDisposed).toBe(true);
    expect(mergeFileMaps({ a: "1" }, { b: "2" })).toEqual({ a: "1", b: "2" });
  });
});

describe("AdapterTemplate + Scaffold", () => {
  it("describes reference template paths", () => {
    const template = getAdapterTemplate();
    expect(template.id).toBe(REFERENCE_ADAPTER_TEMPLATE.id);
    expect(template.files.length).toBeGreaterThan(10);
    expect(listRequiredTemplatePaths("acme").some((p) => p.includes("acme"))).toBe(
      true,
    );
    expect(() => getAdapterTemplate("unknown")).toThrow(/Unknown/);
  });

  it("scaffolds an in-memory adapter package without platform services", () => {
    const scaffold = createAdapterScaffold().generate({
      vendorId: "Acme Tools!",
      displayName: "Acme",
      packageVersion: "0.1.0",
    });
    expect(scaffold.vendorId).toBe("acme-tools");
    expect(scaffold.packageName).toBe("@apzhub/integration-acme-tools");
    expect(scaffold.files["package.json"]).toContain("@apzhub/integration-sdk");
    expect(scaffold.files["integration.yaml"]).toContain("layer: adapter");
    expect(scaffold.files["src/acme-tools-adapter.ts"]).toContain(
      "IntegrationAdapterBase",
    );
    expect(scaffold.files["src/internal/rest-client.ts"]).toBeTruthy();
    expect(scaffold.files["src/operations/stub.ts"]).toBeTruthy();
    expect(scaffold.files["docs/COMPLETION-CHECKLIST.md"]).toContain("Do not");
    expect(JSON.parse(scaffold.files["package.json"]!).dependencies).not.toHaveProperty(
      "@apzhub/platform-services",
    );
    expect(scaffold.checklist.length).toBeGreaterThan(5);

    const viaFn = scaffoldAdapter({ vendorId: "demo", displayName: "Demo" });
    expect(viaFn.files["src/index.ts"]).toContain("DemoAdapter");
    expect(scaffold.files["src/index.ts"]).toContain("AcmeToolsAdapter");
  });

  it("rejects empty vendorId", () => {
    expect(() => scaffoldAdapter({ vendorId: "   ", displayName: "X" })).toThrow(
      /vendorId/,
    );
  });
});

describe("AdapterCertification", () => {
  it("certifies a healthy subject across all categories", () => {
    const report = createAdapterCertification().certify({
      vendorId: "mock",
      adapterVersion: "1.0.0",
      packageName: "@apzhub/integration-mock",
      declaredCapabilities: ["authentication", "health", "diagnostics"],
      extendsAdapterBase: true,
      hasHealth: true,
      hasDiagnostics: true,
      hasCompatibilityMatrix: true,
      hasCapabilityCertification: true,
      documentationComplete: true,
      qualityGatesPassing: true,
      dependencyAuditPassing: true,
      performanceBaselineRecorded: true,
      coverageLinesPct: 95,
      knownLimitations: ["none"],
    });
    expect(report.overall).toBe("pass");
    expect(report.categories).toHaveLength(CERTIFICATION_CATEGORIES.length);
    expect(certificationReportToMarkdown(report)).toContain("Certification Report");
  });

  it("fails on architecture and dependency violations", () => {
    const report = certifyAdapter({
      vendorId: "bad",
      adapterVersion: "0.0.1",
      packageName: "@apzhub/integration-bad",
      extendsAdapterBase: false,
      importsPlatformServices: true,
      importsEntityMappingStore: true,
      declaredCapabilities: [],
      hasCapabilityCertification: false,
      hasCompatibilityMatrix: false,
      hasDiagnostics: false,
      hasHealth: false,
      documentationComplete: false,
      qualityGatesPassing: false,
      dependencyAuditPassing: false,
      performanceBaselineRecorded: false,
      coverageLinesPct: 10,
    });
    expect(report.overall).toBe("fail");
    expect(report.summary).toContain("failed");
  });

  it("supports custom category checks and skip", () => {
    const report = certifyAdapter({
      vendorId: "custom",
      adapterVersion: "1.0.0",
      packageName: "@apzhub/integration-custom",
      declaredCapabilities: ["health"],
      categories: [
        {
          category: "Performance",
          optional: true,
          checks: [],
        },
        {
          category: "Coverage",
          checks: [
            {
              id: "coverage.custom",
              name: "Custom coverage",
              outcome: "warn",
              message: "borderline",
            },
          ],
        },
      ],
    });
    expect(report.categories.find((c) => c.category === "Performance")?.outcome).toBe(
      "skip",
    );
    expect(report.overall).toBe("warn");
  });

  it("summariseOutcome handles all branches", () => {
    expect(summariseOutcome(["fail", "pass"])).toBe("fail");
    expect(summariseOutcome(["skip", "skip"])).toBe("skip");
    expect(summariseOutcome(["warn", "pass"])).toBe("warn");
    expect(summariseOutcome(["pass", "skip"])).toBe("pass");
  });
});

describe("AdapterCompliance", () => {
  it("passes for a scaffolded package structure", () => {
    const scaffold = scaffoldAdapter({ vendorId: "nova", displayName: "Nova" });
    const result = assessAdapterCompliance({
      structure: {
        vendorId: "nova",
        packageName: scaffold.packageName,
        version: "0.1.0",
        files: scaffold.files,
        declaredCapabilities: ["authentication", "health", "diagnostics"],
        dependencies: {
          "@apzhub/integration-sdk": "workspace:*",
        },
      },
    });
    expect(result.overall).not.toBe("fail");
    expect(result.checks.length).toBeGreaterThan(5);
  });

  it("fails forbidden deps and missing layout", () => {
    const result = createAdapterCompliance().assess({
      structure: {
        vendorId: "x",
        packageName: "@apzhub/integration-x",
        version: "0.0.1",
        files: {
          "src/platform-services/oops.ts": "export {}",
        },
        declaredCapabilities: [],
        dependencies: {
          "@apzhub/platform-services": "workspace:*",
        },
      },
    });
    expect(result.overall).toBe("fail");
  });
});

describe("AdapterValidator + capabilities", () => {
  it("aggregates compliance, capabilities, boundary, certification", () => {
    const scaffold = scaffoldAdapter({ vendorId: "val", displayName: "Val" });
    const result = validateAdapter({
      structure: {
        vendorId: "val",
        packageName: scaffold.packageName,
        version: "0.1.0",
        files: scaffold.files,
        declaredCapabilities: ["authentication", "health", "diagnostics"],
        dependencies: { "@apzhub/integration-sdk": "workspace:*" },
      },
      declaredCapabilities: ["authentication", "health", "diagnostics"],
      certificationSubject: {
        vendorId: "val",
        adapterVersion: "0.1.0",
        packageName: scaffold.packageName,
        declaredCapabilities: ["authentication", "health", "diagnostics"],
      },
    });
    expect(result.checks.length).toBeGreaterThan(10);
    expect(result.summary).toBeTruthy();
  });

  it("warns on unknown capability ids", () => {
    const checks = validateAdapterCapabilities({
      declared: ["authentication", "custom.vendor.cap"],
      required: ["authentication"],
    });
    expect(
      checks.some((c) => c.id.includes("custom.vendor.cap") && c.outcome === "warn"),
    ).toBe(true);
  });
});

describe("AdapterContractSuite + TestKit", () => {
  it("runs contracts against MockAdapter and metadata", async () => {
    const harness = createAdapterHarness();
    await harness.boot();
    const suite = createAdapterContractSuite().run(harness.adapter);
    expect(suite.overall).not.toBe("fail");
    expect(suite.checks.some((c) => c.id === "contract.lifecycle")).toBe(true);

    const metaSuite = runAdapterContractSuite({
      hasLifecycleHooks: false,
      hasHealth: false,
      areas: { webhooks: false, polling: false },
    });
    expect(metaSuite.overall).toBe("fail");

    const kit: import("./testing/test-kit").AdapterTestKit = createAdapterTestKit();
    const ctx = kit.buildRequestContext({ userId: "u1" });
    expect(ctx.correlationId).toBeTruthy();
    expect(ctx.userId).toBe("u1");

    const ok = sdkOk(1);
    kit.assertSdkOk(ok);
    expect(kit.isSdkOk(ok)).toBe(true);

    const err = sdkErr(
      createIntegrationError({
        category: "validation",
        code: "test",
        message: "bad",
        correlationId: "c",
      }),
    );
    kit.assertSdkErr(err);
    expect(() => kit.assertSdkOk(err)).toThrow(/Expected SdkResult ok=true/);
    expect(() => kit.assertSdkErr(ok)).toThrow(/Expected SdkResult ok=false/);
    expect(kit.runContractSuite({ hasLifecycleHooks: true }).overall).not.toBe("fail");

    await harness.cleanup();
  });

  it("fixture framework registers and retrieves payloads", () => {
    const fixtures = createFixtureFramework({
      payloads: { seeded: true },
    });
    expect(fixtures.getPayload("seeded")).toBe(true);
    fixtures.registerPayload("later", 2);
    expect(fixtures.listPayloadKeys()).toContain("later");
    expect(fixtures.getRequestContext("default").tenantId).toBe("tenant-fixture");
    expect(() => fixtures.getPayload("missing")).toThrow(/Unknown payload/);
    expect(() => fixtures.getRequestContext("missing")).toThrow(/Unknown request/);
    expect(createDefaultFixtures().metadata.fixtureVersion).toBe("1.0.0");
  });
});

describe("AdapterMockHarness", () => {
  it("simulates HTTP, errors, auth, rate limit, redirect, stream, pagination, retries", async () => {
    const mock = createAdapterMockHarness({
      transport: { defaultLatencyMs: 0 },
    });

    mock.scriptHttp("/ok", { status: 200, body: { value: 1 } });
    const ok = await mock.simulateHttp("/ok");
    expect(ok.response.data).toEqual({ value: 1 });

    mock.simulateError("/err", 500);
    expect((await mock.simulateHttp("/err")).response.status).toBe(500);

    mock.simulateAuthFailure("/auth");
    expect((await mock.simulateHttp("/auth")).response.status).toBe(401);

    mock.simulateRateLimit("/rl");
    expect((await mock.simulateHttp("/rl")).response.status).toBe(429);

    mock.simulateRedirect("/redir", "/elsewhere");
    expect((await mock.simulateHttp("/redir")).response.redirected).toBe(true);

    mock.simulateStreamPlaceholder("/stream");
    expect((await mock.simulateHttp("/stream")).response.kind).toBe("stream");

    mock.simulatePagination("/pages", [
      { items: [1], nextCursor: "c2" },
      { items: [2], nextCursor: null },
    ]);
    expect((await mock.simulateHttp("/pages")).response.data).toEqual({
      items: [1],
      nextCursor: "c2",
    });

    mock.simulateRetryThenSuccess("/retry", 1);
    expect((await mock.simulateHttp("/retry")).response.status).toBe(503);
    expect((await mock.simulateHttp("/retry")).response.status).toBe(200);

    mock.simulateTimeout("/timeout");
    await expect(mock.simulateHttp("/timeout")).rejects.toMatchObject({
      name: "AbortError",
    });

    const polling = mock.createPollingPages([2, 0]);
    const page = await polling.poll(
      { correlationId: "c", tenantId: "t" },
      { mode: "full", pageSize: 10 },
    );
    expect(page.records).toHaveLength(2);

    expect(mock.createWebhookPayload().action).toBe("created");
    expect(mock.createWebhookPipelinePieces().decoder).toBeTruthy();

    const adapter = await mock.bootAdapter();
    expect(mock.getAdapter()).toBe(adapter);
    const op = await mock.simulateAdapterOperation(
      { correlationId: "c", tenantId: "t" },
      "ping",
      true,
    );
    expect(op.ok).toBe(true);

    await mock.cleanup();
    expect(() => mock.getAdapter()).toThrow(/not booted/);
  });
});

describe("Documentation + Quality + Compatibility", () => {
  it("generates all documentation artefacts", () => {
    const gen = createAdapterDocumentationGenerator();
    const certification = certifyAdapter({
      vendorId: "doc",
      adapterVersion: "1.0.0",
      packageName: "@apzhub/integration-doc",
      declaredCapabilities: ["health"],
    });
    const compatibility = evaluateAdapterCompatibility({
      providerId: "doc",
      minVersion: "1.0.0",
      maxVersion: "2.0.0",
      detectedVersion: "1.5.0",
      optionalFeatures: [{ id: "webhooks", available: false, optional: true }],
    });
    const docs = gen.generateAll({
      vendorId: "doc",
      displayName: "Doc",
      packageName: "@apzhub/integration-doc",
      adapterVersion: "1.0.0",
      capabilities: [{ id: "health", status: "certified", optional: false }],
      certification,
      compatibility,
      knownLimitations: ["demo"],
      quality: buildAdapterQualityReport({
        vendorId: "doc",
        packageName: "@apzhub/integration-doc",
        adapterVersion: "1.0.0",
        coverage: { linesPct: 90 },
        lint: "pass",
        typecheck: "pass",
        tests: "pass",
        docs: "pass",
        architecture: "pass",
        dependencies: "pass",
      }),
    });
    expect(Object.keys(docs)).toContain("capability-matrix.md");
    expect(docs["architecture.md"]).toContain("IntegrationAdapterBase");
    expect(docs["compatibility.md"]).toContain("degraded");
    expect(docs["certification-summary.md"]).toContain("Overall");
    expect(docs["completion-report-template.md"]).toContain("Stop condition");
    expect(
      gen.generateCapabilityMatrix({
        vendorId: "empty",
        displayName: "Empty",
        packageName: "x",
        adapterVersion: "0",
      }),
    ).toContain("none declared");
    expect(
      gen.generateCompatibility({
        vendorId: "empty",
        displayName: "Empty",
        packageName: "x",
        adapterVersion: "0",
      }),
    ).toContain("not supplied");
  });

  it("builds quality reports from caller inputs", () => {
    const pass = createAdapterQualityReportBuilder().build({
      vendorId: "q",
      packageName: "@apzhub/integration-q",
      adapterVersion: "1.0.0",
      coverage: { linesPct: 95, branchesPct: 90 },
      lint: "pass",
      typecheck: "pass",
      tests: "pass",
      docs: "pass",
      architecture: "pass",
      dependencies: "pass",
    });
    expect(pass.overall).toBe("pass");

    const fail = buildAdapterQualityReport({
      vendorId: "q",
      packageName: "@apzhub/integration-q",
      adapterVersion: "1.0.0",
      coverage: { linesPct: 50 },
      lint: "fail",
      tests: "fail",
    });
    expect(fail.overall).toBe("fail");
    expect(fail.summary).toContain("coverage");
  });

  it("classifies compatibility supported/degraded/unsupported/unknown", () => {
    const suite = createAdapterCompatibilitySuite();
    expect(
      suite.evaluate({
        providerId: "p",
        minVersion: "1.0.0",
        maxVersion: "2.0.0",
        detectedVersion: "1.5.0",
      }).classification,
    ).toBe("supported");
    expect(
      evaluateAdapterCompatibility({
        providerId: "p",
        minVersion: "1.0.0",
        maxVersion: "2.0.0",
        detectedVersion: "1.5.0",
        featureDetection: { webhooks: false },
      }).classification,
    ).toBe("degraded");
    expect(
      suite.evaluate({
        providerId: "p",
        minVersion: "1.0.0",
        maxVersion: "2.0.0",
        detectedVersion: "3.0.0",
      }).classification,
    ).toBe("unsupported");
    expect(
      suite.evaluate({
        providerId: "p",
        minVersion: "1.0.0",
        maxVersion: "2.0.0",
      }).classification,
    ).toBe("unknown");
  });
});

describe("AdapterPerformanceHarness", () => {
  it("measures timings for mock adapter lifecycle", async () => {
    const report = await createAdapterPerformanceHarness().measureMockAdapter();
    expect(report.timings.length).toBeGreaterThanOrEqual(6);
    expect(report.totalMs).toBeGreaterThanOrEqual(0);
    expect(report.timings.every((t) => typeof t.durationMs === "number")).toBe(true);

    const harness = createAdapterHarness();
    await harness.boot();
    const subject = await createAdapterPerformanceHarness().measureSubject(
      harness.adapter,
    );
    expect(subject.timings.some((t) => t.name === "health")).toBe(true);
    await harness.cleanup();
  });
});

describe("AdapterBoundaryValidator", () => {
  it("passes clean files and fails forbidden imports", () => {
    const clean = validateAdapterBoundary({
      files: {
        "src/adapter.ts":
          'import { IntegrationAdapterBase } from "@apzhub/integration-sdk/adapter";',
      },
    });
    expect(clean.overall).toBe("pass");

    const dirty = createAdapterBoundaryValidator().validate({
      files: {
        "src/bad.ts": 'import { x } from "@apzhub/platform-services";',
        "src/map.ts": "const store = EntityMappingStore;",
        "src/a.ts": 'import { PlaneAdapter } from "@apzhub/integration-plane";',
        "src/b.ts": 'import { ZammadAdapter } from "@apzhub/integration-zammad";',
      },
    });
    expect(dirty.overall).toBe("fail");
    expect(dirty.violations.length).toBeGreaterThan(0);
  });
});

describe("CI helpers", () => {
  it("returns serialisable check bundles", () => {
    const cert = runCertificationChecks({
      vendorId: "ci",
      adapterVersion: "1.0.0",
      packageName: "@apzhub/integration-ci",
      declaredCapabilities: ["health", "authentication", "diagnostics"],
    });
    expect(cert.serialisable.outcome).toBeTruthy();
    expect(cert.ok).toBe(true);

    const contracts = runContractChecks({ hasLifecycleHooks: true, hasHealth: true });
    expect(contracts.result.checks.length).toBeGreaterThan(5);

    const boundary = runBoundaryChecks({
      files: { "a.ts": "export const ok = true;" },
    });
    expect(boundary.ok).toBe(true);

    const docs = runDocumentationChecks({
      vendorId: "ci",
      displayName: "CI",
      packageName: "@apzhub/integration-ci",
      adapterVersion: "1.0.0",
    });
    expect(docs.result.documents["architecture.md"]).toBeTruthy();

    const quality = buildQualityReport({
      vendorId: "ci",
      packageName: "@apzhub/integration-ci",
      adapterVersion: "1.0.0",
      coverage: { linesPct: 88 },
      lint: "pass",
      typecheck: "pass",
      tests: "pass",
    });
    expect(quality.result.coverage.status).toBe("pass");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";

import {
  createAllureMetadataAdapter,
  createAutomationAdapterRegistry,
  createAutomationIngestionServices,
  createGenericJsonAdapter,
  createGenericTapAdapter,
  createJunitXmlAdapter,
  createPlaywrightReportAdapter,
  createVitestAdapter,
  createAutomationNormalizationService,
  fingerprintPayload,
} from "./index";

const ALL_PERMS = [
  "automation.*",
  "automation.import",
  "automation.view",
  "automation.history",
  "automation.adapters",
  "automation.coverage",
  "evidence.*",
  "traceability.*",
  "testing.*",
];

function ctx(overrides: Partial<ServiceRequestContext> = {}): ServiceRequestContext {
  return {
    tenantId: "tenant-a",
    userId: "user-1",
    correlationId: "corr-auto-1",
    permissions: ALL_PERMS,
    ...overrides,
  };
}

function services() {
  return createAutomationIngestionServices({
    persistence: createInMemoryTestingPersistence(),
  });
}

describe("automation adapters", () => {
  it("parses vitest happy path and unknown status", () => {
    const adapter = createVitestAdapter();
    const payload = {
      success: true,
      numPassedTests: 1,
      testResults: [
        {
          name: "a.test.ts",
          assertionResults: [
            { fullName: "adds", status: "passed", duration: 12 },
            { fullName: "weird", status: "flaky-custom", duration: 1 },
          ],
        },
      ],
      coverage: { covered: 8, total: 10, percentage: 80 },
    };
    expect(adapter.canParse({ payload })).toBe(true);
    const result = adapter.parse({ payload, metadata: { externalRunRef: "v-1" } });
    expect(result.adapterKind).toBe("vitest");
    expect(result.suites[0]!.cases).toHaveLength(2);
    expect(result.coverage?.percentage).toBe(80);
    expect(() => adapter.parse({ payload: { foo: 1 } })).toThrow(/Vitest/);
  });

  it("parses playwright report JSON", () => {
    const adapter = createPlaywrightReportAdapter();
    const payload = {
      suites: [
        {
          title: "root",
          specs: [
            {
              title: "login",
              tests: [
                {
                  title: "ok",
                  results: [{ status: "passed", duration: 100 }],
                },
                {
                  title: "bad",
                  results: [{ status: "failed", duration: 50, error: { stack: "x" } }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adapter.canParse({ payload })).toBe(true);
    const result = adapter.parse({ payload });
    expect(result.suites.flatMap((s) => s.cases)).toHaveLength(2);
    expect(() => adapter.parse({ payload: { hello: true } })).toThrow();
  });

  it("parses junit xml", () => {
    const adapter = createJunitXmlAdapter();
    const xml = `<?xml version="1.0"?>
<testsuite name="SuiteA" tests="3">
  <testcase classname="A" name="pass" time="0.01"/>
  <testcase classname="A" name="fail" time="0.02"><failure>boom</failure></testcase>
  <testcase classname="A" name="skip" time="0"><skipped/></testcase>
</testsuite>`;
    expect(adapter.canParse({ payload: xml, fileNameHint: "report.xml" })).toBe(true);
    const result = adapter.parse({ payload: xml });
    expect(result.suites[0]!.cases).toHaveLength(3);
    expect(result.suites[0]!.cases.find((c) => c.title === "fail")?.status).toBe(
      "fail",
    );
    expect(() => adapter.parse({ payload: "<html></html>" })).toThrow();
  });

  it("parses generic json and tap and allure metadata", () => {
    const json = createGenericJsonAdapter();
    const payload = {
      externalRunRef: "g-1",
      suites: [
        {
          name: "s1",
          cases: [
            {
              title: "c1",
              status: "pass",
              durationMs: 5,
              requirementRefs: ["req_1"],
              steps: [{ name: "step1", status: "pass" }],
            },
          ],
        },
      ],
      evidence: [{ type: "log", title: "out.log", storageRef: "mem://x" }],
      coverage: { covered: 1, total: 2, percentage: 50, kind: "suite" },
    };
    const parsed = json.parse({ payload });
    expect(parsed.suites[0]!.cases[0]!.requirementRefs).toEqual(["req_1"]);

    const tap = createGenericTapAdapter();
    const tapResult = tap.parse({
      payload: "TAP version 13\nok 1 - works\nnot ok 2 - fails\nok 3 - # SKIP later\n",
    });
    expect(tapResult.suites[0]!.cases).toHaveLength(3);
    expect(tapResult.suites[0]!.cases[2]!.status).toBe("skipped");

    const allure = createAllureMetadataAdapter();
    const allureResult = allure.parse({
      payload: {
        results: [
          {
            name: "login",
            status: "broken",
            attachments: [{ name: "shot", type: "image/png", source: "a.png" }],
          },
        ],
      },
    });
    expect(allureResult.evidence).toHaveLength(1);
    expect(() => allure.parse({ payload: { results: [] } })).toThrow();
  });
});

describe("adapter registry", () => {
  it("resolves adapters and prefers specific over generic_json", () => {
    const registry = createAutomationAdapterRegistry();
    expect(registry.list().length).toBeGreaterThanOrEqual(6);
    expect(registry.get("vitest")?.kind).toBe("vitest");
    const vitestPayload = {
      payload: {
        success: true,
        testResults: [{ assertionResults: [{ fullName: "a", status: "passed" }] }],
      },
    };
    expect(registry.resolveForInput(vitestPayload).kind).toBe("vitest");
    expect(() => registry.resolveForInput({ payload: { nope: true } })).toThrow(
      /No automation adapter/,
    );
  });
});

describe("normalization matrix", () => {
  it("maps provider statuses", () => {
    const n = createAutomationNormalizationService();
    const matrix: Array<[string, string]> = [
      ["passed", "pass"],
      ["success", "pass"],
      ["ok", "pass"],
      ["failed", "fail"],
      ["failure", "fail"],
      ["skip", "skipped"],
      ["pending", "skipped"],
      ["todo", "skipped"],
      ["blocked_on", "blocked"],
      ["timedOut", "timed_out"],
      ["timeout", "timed_out"],
      ["canceled", "cancelled"],
      ["aborted", "cancelled"],
      ["error", "errored"],
      ["something-else", "unknown"],
      ["", "unknown"],
    ];
    for (const [raw, expected] of matrix) {
      expect(n.normalizeStatus(raw)).toBe(expected);
    }
    const normalized = n.normalizeResult({
      adapterKind: "generic_json",
      externalRunRef: "r1",
      environment: {},
      evidence: [],
      suites: [
        {
          name: "s",
          cases: [{ title: "t", status: "passed" as never }],
        },
      ],
      overallStatus: "SUCCESS",
    });
    expect(normalized.suites[0]!.cases[0]!.status).toBe("pass");
    expect(normalized.overallStatus).toBe("pass");
  });
});

describe("validation and duplicates", () => {
  it("validates canonical and detects duplicates", async () => {
    const svc = services();
    const c = ctx();
    expect(() =>
      svc.validation.validateCanonical({
        adapterKind: "vitest",
        externalRunRef: "",
        environment: {},
        suites: [],
        evidence: [],
        overallStatus: "pass",
      }),
    ).toThrow(/externalRunRef|suite/i);

    svc.validation.assertImportAllowed(c);
    expect(() => svc.validation.assertImportAllowed(ctx({ permissions: [] }))).toThrow(
      /permission/i,
    );

    const first = await svc.imports.importResult(c, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "dup-1",
        suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
      },
    });
    expect(first.importRecord.status).toBe("completed");

    const dup = await svc.imports.importResult(c, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "dup-1",
        suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
      },
    });
    expect(dup.importRecord.status).toBe("duplicate");
    expect(dup.duplicateOf?.id).toBe(first.importRecord.id);
  });
});

describe("import lifecycle + history", () => {
  it("imports, lists results, history, correct path", async () => {
    const svc = services();
    const c = ctx();
    const outcome = await svc.imports.importResult(c, {
      adapterKind: "vitest",
      payload: {
        success: true,
        testResults: [
          {
            assertionResults: [
              { fullName: "a", status: "passed", duration: 3 },
              { fullName: "b", status: "failed", duration: 4 },
            ],
          },
        ],
      },
      metadata: { externalRunRef: "run-lifecycle-1" },
    });
    expect(outcome.execution).toBeTruthy();
    expect(outcome.runs?.length).toBe(2);
    expect(svc.events.listByType("automation.import_completed")).toHaveLength(1);

    const imports = await svc.results.listImports(c);
    expect(imports.length).toBe(1);
    const got = await svc.results.getImport(c, outcome.importRecord.id);
    expect(got.externalRunRef).toBe("run-lifecycle-1");

    const execs = await svc.results.listExecutions(c);
    expect(execs.length).toBe(1);
    const runs = await svc.results.listRuns(c, outcome.execution!.id);
    expect(runs.length).toBe(2);

    const history = await svc.history.listByImport(c, outcome.importRecord.id);
    expect(history.some((h) => h.eventType === "import_completed")).toBe(true);

    const corrected = await svc.imports.correct(c, outcome.importRecord.id, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "run-lifecycle-1-corrected",
        suites: [{ name: "s", cases: [{ title: "fixed", status: "pass" }] }],
      },
    });
    expect(corrected.importRecord.status).toBe("corrected");
  });

  it("records failed import for invalid payload", async () => {
    const svc = services();
    await expect(
      svc.imports.importResult(ctx(), {
        adapterKind: "generic_json",
        payload: { suites: [] },
      }),
    ).rejects.toThrow();
    expect(svc.events.listByType("automation.import_failed").length).toBeGreaterThan(0);
  });
});

describe("evidence coverage traceability cert prep", () => {
  it("registers evidence metadata, coverage, links, and cert inputs", async () => {
    const svc = services();
    const c = ctx();
    const outcome = await svc.imports.importResult(c, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "cov-1",
        suites: [
          {
            name: "s",
            cases: [
              {
                title: "covers req",
                status: "pass",
                requirementRefs: ["req_100"],
                storyRefs: ["story_1"],
                caseRefs: ["case_1"],
              },
              { title: "fail case", status: "fail" },
            ],
          },
        ],
        evidence: [
          {
            type: "log",
            title: "run.log",
            storageRef: "mem://pre",
          },
          {
            type: "screenshot",
            title: "shot",
            bytesBase64: Buffer.from("png").toString("base64"),
            mimeType: "image/png",
          },
        ],
        coverage: { covered: 3, total: 4, percentage: 75 },
      },
    });

    expect(outcome.evidence?.length).toBe(2);
    expect(outcome.coverage?.percentage).toBe(75);

    const snaps = await svc.coverage.listByImport(c, outcome.importRecord.id);
    expect(snaps.length).toBe(1);
    const agg = await svc.coverage.aggregate(c, outcome.execution!.id);
    expect(agg.covered).toBe(3);

    const prep = await svc.certificationPreparation.prepareForImport(
      c,
      outcome.importRecord.id,
    );
    expect(prep.isDecision).toBe(false);
    expect(prep.failedAutomationCount).toBe(1);
    expect(prep.totalCases).toBe(2);
    expect(prep.importHealth).toMatch(/healthy|degraded/);

    const prepExec = await svc.certificationPreparation.prepareForExecution(
      c,
      outcome.execution!.id,
    );
    expect(prepExec.isDecision).toBe(false);
  });
});

describe("fingerprint helper", () => {
  it("hashes string object and bytes consistently", () => {
    expect(fingerprintPayload("abc")).toHaveLength(64);
    expect(fingerprintPayload({ a: 1 })).toHaveLength(64);
    expect(fingerprintPayload(new TextEncoder().encode("abc"))).toBe(
      fingerprintPayload("abc"),
    );
  });
});

describe("coverage expansion", () => {
  it("covers result getters, history list, reimport, duplicate throw, adapter edges", async () => {
    const svc = services();
    const c = ctx();

    const outcome = await svc.imports.importResult(c, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "exp-1",
        overallStatus: "pass",
        environment: { commit: "abc" },
        suites: [
          {
            name: "s",
            cases: [
              {
                title: "with steps",
                status: "pass",
                planRefs: ["plan_1"],
                steps: [
                  { name: "s1", status: "passed" },
                  { name: "s2", status: "failed", message: "x" },
                ],
              },
            ],
          },
        ],
      },
    });

    const exec = await svc.results.getExecution(c, outcome.execution!.id);
    expect(exec.externalRunRef).toBe("exp-1");
    const runs = await svc.results.listRuns(c, exec.id);
    const run = await svc.results.getRun(c, runs[0]!.id);
    expect(run.title).toBe("with steps");
    const items = await svc.results.listResultItems(c, run.id);
    expect(items.length).toBe(2);

    const allHistory = await svc.history.list(c);
    expect(allHistory.length).toBeGreaterThan(0);

    await expect(
      svc.imports.importResult(c, {
        adapterKind: "generic_json",
        allowDuplicateReturn: false,
        payload: {
          externalRunRef: "exp-1",
          suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
        },
      }),
    ).rejects.toThrow(/Duplicate/);

    const re = await svc.imports.reimport(c, outcome.importRecord.id, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "exp-1-re",
        suites: [{ name: "s", cases: [{ title: "re", status: "pass" }] }],
      },
    });
    expect(re.importRecord.status).toBe("completed");

    // fingerprint duplicate path
    const payload = {
      externalRunRef: "fp-unique",
      suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
    };
    await svc.imports.importResult(c, { adapterKind: "generic_json", payload });
    const fpDup = await svc.validation.detectDuplicate(c, {
      adapterKind: "generic_json",
      externalRunRef: "fp-other-ref",
      payloadFingerprint: fingerprintPayload(payload),
    });
    expect(fpDup).toBeTruthy();

    // normalize steps + empty status
    const n = createAutomationNormalizationService();
    const withSteps = n.normalizeResult({
      adapterKind: "generic_json",
      externalRunRef: "n1",
      environment: {},
      evidence: [],
      suites: [
        {
          name: "s",
          status: "passed" as never,
          cases: [
            {
              title: "t",
              status: "ok" as never,
              steps: [{ name: "st", status: "failed" as never }],
            },
          ],
        },
      ],
    });
    expect(withSteps.suites[0]!.cases[0]!.steps?.[0]?.status).toBe("fail");
    expect(n.normalizeStatus(null)).toBe("unknown");

    // adapter edge cases
    const vitest = createVitestAdapter();
    expect(
      vitest.parse({
        payload: {
          tests: [{ title: "solo", status: "passed" }],
          startTime: "2026-01-01",
          endTime: "2026-01-02",
        },
        fileNameHint: "vitest-report.json",
      }).suites[0]!.cases,
    ).toHaveLength(1);
    expect(vitest.canParse({ payload: "not-json{" })).toBe(false);
    expect(() =>
      vitest.parse({
        payload: { success: true, testResults: [{ name: "empty", status: "passed" }] },
      }),
    ).not.toThrow();

    const pw = createPlaywrightReportAdapter();
    expect(
      pw.canParse({ payload: { suites: [] }, fileNameHint: "playwright.json" }),
    ).toBe(true);
    const nested = pw.parse({
      payload: {
        suites: [
          {
            title: "root",
            suites: [
              {
                title: "child",
                specs: [{ title: "spec", tests: [{ title: "t", status: "timedOut" }] }],
              },
            ],
          },
        ],
        config: { browser: "chromium" },
      },
    });
    expect(nested.suites.flatMap((s) => s.cases).length).toBeGreaterThan(0);

    const tap = createGenericTapAdapter();
    expect(tap.canParse({ payload: "hello", fileNameHint: "out.tap" })).toBe(true);
    expect(() => tap.parse({ payload: "no results here" })).toThrow();

    const allure = createAllureMetadataAdapter();
    expect(allure.canParse({ payload: {}, fileNameHint: "allure.json" })).toBe(true);
    const am = allure.parse({
      payload: {
        results: [
          {
            name: "x",
            status: "passed",
            statusDetails: { message: "m", trace: "t" },
            labels: [{ value: "smoke" }],
          },
        ],
        environment: { branch: "main" },
      },
    });
    expect(am.suites[0]!.cases[0]!.tags).toContain("smoke");

    const junit = createJunitXmlAdapter();
    expect(junit.canParse({ payload: "<x/>", contentType: "text/plain" })).toBe(false);
    const lone = junit.parse({
      payload: `<testcase name="solo" time="1"><error>e</error></testcase>`,
    });
    expect(lone.suites[0]!.cases[0]!.status).toBe("fail");

    // coverage aggregate empty + cert missing plan paths
    const emptyAgg = await svc.coverage.aggregate(c, "auto_missing" as never);
    expect(emptyAgg).toEqual({});

    const links = await svc.traceability.linkImportedResult(c, {
      importId: outcome.importRecord.id,
      executionId: outcome.execution!.id,
      result: {
        adapterKind: "generic_json",
        externalRunRef: "x",
        environment: {},
        evidence: [],
        overallStatus: "pass",
        suites: [
          {
            name: "s",
            cases: [{ title: "t", status: "pass", storyRefs: ["st_1"] }],
          },
        ],
      },
      extraLinks: [
        {
          type: "related",
          sourceKind: "automation_import",
          sourceId: outcome.importRecord.id,
          targetKind: "release",
          targetId: "rel_1",
          notes: "extra",
        },
      ],
    });
    expect(links.length).toBeGreaterThan(0);

    // registry register custom
    const registry = createAutomationAdapterRegistry([]);
    registry.register(createGenericJsonAdapter());
    expect(registry.list()).toHaveLength(1);

    // createTestingDomainServices smoke via factory import
    const { createTestingDomainServices } = await import("../factory");
    const domain = createTestingDomainServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(domain.automation.registry.list().length).toBeGreaterThan(0);
    expect(domain.requirements).toBeTruthy();

    // types helpers
    const {
      asObject,
      asText,
      deriveExternalRunRef,
      readNumber,
      assertAdapterCanParse,
    } = await import("./adapters/types");
    expect(asObject(new TextEncoder().encode('{"a":1}')).a).toBe(1);
    expect(asObject('[{"x":1}]').items).toEqual([{ x: 1 }]);
    expect(() => asObject("not-json")).toThrow();
    expect(asText({ a: 1 })).toContain("a");
    expect(asText(new TextEncoder().encode("hi"))).toBe("hi");
    expect(readNumber({ n: "12" }, "n")).toBe(12);
    expect(deriveExternalRunRef({ payload: { id: "from-id" } }, "fallback")).toBe(
      "from-id",
    );
    expect(
      deriveExternalRunRef({ payload: {} }, "fallback").startsWith("fallback"),
    ).toBe(true);
    expect(() =>
      assertAdapterCanParse(createGenericJsonAdapter(), { payload: { no: true } }),
    ).toThrow(/cannot parse/i);

    // cert prep without evidence on completed-only run
    const bare = await svc.imports.importResult(c, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "bare-cert",
        suites: [{ name: "s", cases: [{ title: "only", status: "pass" }] }],
      },
    });
    const prepBare = await svc.certificationPreparation.prepareForExecution(
      c,
      bare.execution!.id,
    );
    expect(prepBare.missingEvidenceCount).toBe(1);
    expect(prepBare.isDecision).toBe(false);

    // planRefs + suite-only vitest file row
    await svc.imports.importResult(c, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "plans-1",
        suites: [
          {
            name: "s",
            cases: [{ title: "p", status: "pass", planRefs: ["plan_9"] }],
          },
        ],
      },
    });

    const vitestFile = createVitestAdapter().parse({
      payload: {
        success: true,
        testResults: [{ name: "file-only", status: "failed", endTime: 10 }],
        numPassedTests: 0,
      },
    });
    expect(vitestFile.suites[0]!.cases[0]!.title).toBe("file-only");

    await expect(
      svc.imports.importResult(c, {
        adapterKind: "generic_json",
        payload: {
          externalRunRef: "bad-ev",
          suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
          evidence: [{ type: "log", title: "", storageRef: "mem://z" }],
        },
      }),
    ).rejects.toThrow();

    const dupHealth = await svc.imports.importResult(c, {
      adapterKind: "generic_json",
      payload: {
        externalRunRef: "exp-1",
        suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
      },
    });
    expect(dupHealth.importRecord.status).toBe("duplicate");
    const prepDup = await svc.certificationPreparation.prepareForImport(
      c,
      dupHealth.importRecord.id,
    );
    expect(prepDup.importHealth).toBe("failed");
    expect(prepDup.isDecision).toBe(false);

    expect(() =>
      createPlaywrightReportAdapter().parse({ payload: { suites: [] } }),
    ).toThrow(/no tests/i);
    expect(() =>
      createVitestAdapter().parse({ payload: { success: true, testResults: [] } }),
    ).toThrow(/no tests/i);
    expect(createGenericTapAdapter().canParse({ payload: "ok 1 - yes\n" })).toBe(true);
  });

  it("validates canonical edge failures", () => {
    const svc = services();
    expect(() =>
      svc.validation.validateCanonical({
        adapterKind: "not_real" as never,
        externalRunRef: "r",
        environment: {},
        suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
        evidence: [],
        overallStatus: "pass",
      }),
    ).toThrow();
    expect(() =>
      svc.validation.validateCanonical({
        adapterKind: "vitest",
        externalRunRef: "r",
        environment: {},
        suites: [{ name: "s", cases: [{ title: "t", status: "bogus" as never }] }],
        evidence: [],
        overallStatus: "pass",
      }),
    ).toThrow();
    expect(() =>
      svc.validation.validateCanonical({
        adapterKind: "vitest",
        externalRunRef: "r",
        environment: {},
        suites: [{ name: "", cases: [{ title: "t", status: "pass" }] }],
        evidence: [],
        overallStatus: "pass",
      }),
    ).toThrow();
    expect(() =>
      svc.validation.validateCanonical({
        adapterKind: "vitest",
        externalRunRef: "r",
        environment: {},
        suites: [{ name: "s", cases: [{ title: "", status: "pass" }] }],
        evidence: [],
        overallStatus: "pass",
      }),
    ).toThrow();
    expect(() =>
      svc.validation.validateCanonical({
        adapterKind: "vitest",
        externalRunRef: "r",
        environment: {},
        suites: [{ name: "s", cases: [{ title: "t", status: "pass" }] }],
        evidence: [],
        overallStatus: "bogus" as never,
      }),
    ).toThrow();
  });
});

describe("automation src boundary", () => {
  it("forbids runner/http/ui package imports under automation/", () => {
    const autoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
    const forbidden = [
      /from\s+['"]playwright['"]/,
      /from\s+['"]@playwright\//,
      /from\s+['"]vitest\/runners['"]/,
      /from\s+['"]express['"]/,
      /from\s+['"]fastify['"]/,
      /from\s+['"]next\/server['"]/,
      /from\s+['"]@apzhub\/ui['"]/,
    ];
    function walk(dir: string, acc: string[] = []): string[] {
      for (const entry of readdirSync(dir)) {
        if (entry.endsWith(".test.ts")) continue;
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, acc);
        else if (full.endsWith(".ts")) acc.push(full);
      }
      return acc;
    }
    for (const file of walk(autoRoot)) {
      const content = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        expect(pattern.test(content), `${file} ${pattern}`).toBe(false);
      }
    }
  });
});

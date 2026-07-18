#!/usr/bin/env node
/**
 * APZSEARCH-013 — Testing Search Publication Adapter audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "packages/search-testing");

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(full);
  }
  return out;
}

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function scan(files, rules) {
  for (const file of files) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          violations.push({
            file: path,
            line: i + 1,
            rule: rule.rule,
            detail: line.trim().slice(0, 160),
          });
        }
      }
    }
  }
}

const files = walk(PKG);
scan(files, [
  {
    rule: "no-meilisearch",
    pattern: /@apzhub\/integration-meilisearch|from\s+["']meilisearch["']/,
  },
  {
    rule: "no-search-sdk-engine",
    pattern: /@apzhub\/integration-search-sdk/,
  },
  {
    rule: "no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "no-search-persistence",
    pattern: /@apzhub\/search-persistence/,
  },
  {
    rule: "no-testing-persistence",
    pattern: /@apzhub\/testing-persistence/,
  },
  {
    rule: "no-reporting-contracts-direct",
    pattern: /@apzhub\/reporting-contracts/,
  },
  {
    rule: "no-integration-plane",
    pattern: /@apzhub\/integration-plane/,
  },
  {
    rule: "no-zammad",
    pattern: /@apzhub\/integration-zammad|from\s+["'].*zammad/i,
  },
  {
    rule: "no-search-projects",
    pattern: /@apzhub\/search-projects/,
  },
  {
    rule: "no-search-support",
    pattern: /@apzhub\/search-support/,
  },
  {
    rule: "no-search-documents",
    pattern: /@apzhub\/search-documents/,
  },
  {
    rule: "no-apps-web",
    pattern: /apps\/web|from\s+["']@\/|NextRequest|NextResponse/,
  },
  {
    rule: "no-event-bus-ocr",
    pattern: /EventBus|BullMQ|createWorker\(|setInterval\(|\bOCR\b|tesseract|ocr\.ts/i,
  },
]);

const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
if (pkgJson.name !== "@apzhub/search-testing") {
  violations.push({
    file: "packages/search-testing/package.json",
    line: 1,
    rule: "package-name",
    detail: String(pkgJson.name),
  });
}
if (pkgJson.version !== "0.1.1") {
  violations.push({
    file: "packages/search-testing/package.json",
    line: 1,
    rule: "package-version",
    detail: `expected 0.1.1, got ${pkgJson.version}`,
  });
}
for (const required of [
  "@apzhub/search-integration",
  "@apzhub/testing-contracts",
  "@apzhub/platform-service-contracts",
  "@apzhub/search-contracts",
]) {
  if (!pkgJson.dependencies?.[required]) {
    violations.push({
      file: "packages/search-testing/package.json",
      line: 1,
      rule: "missing-dependency",
      detail: required,
    });
  }
}
for (const forbidden of [
  "@apzhub/platform-services",
  "@apzhub/integration-meilisearch",
  "@apzhub/integration-search-sdk",
  "@apzhub/search-persistence",
  "@apzhub/testing-persistence",
  "@apzhub/reporting-contracts",
  "@apzhub/search-projects",
  "@apzhub/search-support",
  "@apzhub/search-documents",
  "meilisearch",
]) {
  if (pkgJson.dependencies?.[forbidden] || pkgJson.devDependencies?.[forbidden]) {
    violations.push({
      file: "packages/search-testing/package.json",
      line: 1,
      rule: "forbidden-dependency",
      detail: forbidden,
    });
  }
}

const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
for (const symbol of [
  "TestingSearchPublisher",
  "TestingSearchEntityMapper",
  "TestingSearchEntityValidator",
  "TestingSearchPublicationContext",
  "TestingSearchLifecycle",
  "TestingSearchDiagnostics",
  "TestingSearchMetrics",
  "TestingSearchLogger",
  "TestingSearchErrorTranslator",
  "createTestingSearchPublisher",
  "createTestingSearchLifecycleHooks",
  "createTestingSearchAdapter",
  "SEARCH_TESTING_VERSION",
  "ManualTestingPublisher",
  "AutomationPublisher",
  "CertificationPublisher",
  "ReleasePublisher",
  "EngineeringIntelligencePublisher",
  "QualityPublisher",
  "ReportingMetadataPublisher",
  "PipelinePublisher",
  "TestingDomainSearchPublisher",
]) {
  if (!index.includes(symbol)) {
    violations.push({
      file: "packages/search-testing/src/index.ts",
      line: 1,
      rule: "missing-export",
      detail: symbol,
    });
  }
}

/** Specialised publisher class files must exist and declare the class name. */
const specialisedPublishers = [
  ["manual-testing-publisher.ts", "ManualTestingPublisher"],
  ["automation-publisher.ts", "AutomationPublisher"],
  ["certification-publisher.ts", "CertificationPublisher"],
  ["release-publisher.ts", "ReleasePublisher"],
  ["engineering-intelligence-publisher.ts", "EngineeringIntelligencePublisher"],
  ["quality-publisher.ts", "QualityPublisher"],
  ["reporting-metadata-publisher.ts", "ReportingMetadataPublisher"],
  ["pipeline-publisher.ts", "PipelinePublisher"],
];
for (const [fileName, className] of specialisedPublishers) {
  const filePath = join(PKG, "src/publisher", fileName);
  if (!existsSync(filePath)) {
    violations.push({
      file: `packages/search-testing/src/publisher/${fileName}`,
      line: 1,
      rule: "missing-specialised-publisher",
      detail: className,
    });
    continue;
  }
  const body = readFileSync(filePath, "utf8");
  if (!body.includes(`class ${className}`)) {
    violations.push({
      file: `packages/search-testing/src/publisher/${fileName}`,
      line: 1,
      rule: "missing-specialised-publisher-class",
      detail: className,
    });
  }
}

/**
 * Orchestrator must not contain domain map methods (heuristic).
 * Mapping belongs in specialised publishers / domain mappers.
 */
const orchestratorPath = join(PKG, "src/publisher/testing-search-publisher.ts");
if (!existsSync(orchestratorPath)) {
  violations.push({
    file: "packages/search-testing/src/publisher/testing-search-publisher.ts",
    line: 1,
    rule: "missing-orchestrator",
    detail: "testing-search-publisher.ts",
  });
} else {
  const orch = readFileSync(orchestratorPath, "utf8");
  const domainMapHeuristic =
    /\bmap(TestCase|TestPlan|TestSuite|TestExecution|TestRun|Evidence|Approval|Requirement|Defect|AutomationRun|AutomationSuite|ImportedResult|CoverageSummary|Certification|CertificationGate|CertificationEvidence|CertificationDecision|Release|ReleaseCandidate|ReleasePackage|ReleaseScope|ReleaseApproval|ReleaseDecision|ReleaseManifest|ReleaseSummary|EngineeringSnapshot|EngineeringTrend|Benchmark|HistoricalSnapshot|RiskSummary|QualitySummary|QualityCoverageSummary|DefectSummary|ReportMetadata|ReportTemplate|Pipeline|PipelineRun|PipelineImport)\b/;
  const lines = orch.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
    if (domainMapHeuristic.test(line)) {
      violations.push({
        file: "packages/search-testing/src/publisher/testing-search-publisher.ts",
        line: i + 1,
        rule: "orchestrator-no-domain-map",
        detail: line.trim().slice(0, 160),
      });
    }
  }
  if (!orch.includes("resolvePublisher") && !orch.includes("specialisedPublishers")) {
    violations.push({
      file: "packages/search-testing/src/publisher/testing-search-publisher.ts",
      line: 1,
      rule: "orchestrator-must-route",
      detail: "expected resolvePublisher or specialisedPublishers routing",
    });
  }
}

console.log(
  violations.length === 0
    ? "APZSEARCH-013 Testing Search Publication Adapter audit PASSED"
    : "APZSEARCH-013 Testing Search Publication Adapter audit FAILED",
);
console.log(`RESULT: ${violations.length === 0 ? "PASS" : "FAIL"}`);
console.log(`Violations: ${violations.length}`);
if (violations.length === 0) {
  console.log(
    "  - @apzhub/search-testing 0.1.1 → specialised publishers + search-integration",
  );
  console.log("  - No Meilisearch / platform-services / persistence / Event Bus / OCR");
  console.log("  - Required TestingSearch* + specialised publisher exports present");
  console.log("  - Orchestrator has no domain map methods");
} else {
  for (const v of violations.slice(0, 40)) {
    console.log(`  - [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
}

process.exit(violations.length === 0 ? 0 : 1);

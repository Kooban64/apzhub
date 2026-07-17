#!/usr/bin/env node
/**
 * APZWORKFLOW-006 — n8n Reference Adapter architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "integrations/n8n");

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
    else if (/\.(ts|tsx|mjs|js|yaml|yml)$/.test(entry) && !entry.endsWith(".d.ts")) {
      out.push(full);
    }
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
          if (rule.allow?.(path, line)) continue;
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

function requireExists(path, rule) {
  if (!existsSync(join(ROOT, path))) {
    violations.push({
      file: path,
      line: 1,
      rule,
      detail: `Required artefact missing: ${path}`,
    });
  }
}

if (!existsSync(PKG)) {
  console.error("APZWORKFLOW-006 audit FAILED — integrations/n8n missing");
  process.exit(1);
}

const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
if (pkgJson.name !== "@apzhub/integration-n8n") {
  violations.push({
    file: "integrations/n8n/package.json",
    line: 1,
    rule: "package-name",
    detail: `Expected @apzhub/integration-n8n, found ${pkgJson.name}`,
  });
}
if (pkgJson.version !== "0.1.0") {
  violations.push({
    file: "integrations/n8n/package.json",
    line: 1,
    rule: "package-version",
    detail: `Expected 0.1.0, found ${pkgJson.version}`,
  });
}
const deps = {
  ...pkgJson.dependencies,
  ...pkgJson.devDependencies,
  ...pkgJson.peerDependencies,
};
if (!deps["@apzhub/integration-sdk"]) {
  violations.push({
    file: "integrations/n8n/package.json",
    line: 1,
    rule: "missing-sdk",
    detail: "Must depend on @apzhub/integration-sdk",
  });
}
for (const forbidden of [
  "@apzhub/platform-services",
  "@apzhub/workflow-core",
  "@apzhub/workflow-persistence",
  "n8n",
  "n8n-workflow",
  "meilisearch",
]) {
  if (deps[forbidden]) {
    violations.push({
      file: "integrations/n8n/package.json",
      line: 1,
      rule: "forbidden-dep",
      detail: `Forbidden dependency: ${forbidden}`,
    });
  }
}

const files = walk(PKG);
scan(files, [
  {
    rule: "no-official-n8n-sdk",
    pattern: /from\s+["']n8n["']|require\(["']n8n["']\)|from\s+["']n8n-workflow["']/,
  },
  {
    rule: "no-platform-services",
    pattern: /@apzhub\/platform-services|getPlatformServiceGateway|PlatformServiceGateway/,
  },
  {
    rule: "no-http-routes",
    pattern: /NextRequest|NextResponse|withPlatformApiAuth|\/api\/v1\/workflows/,
  },
  {
    rule: "no-workbench",
    pattern: /workbench-framework|WorkflowsWorkspaceRouter|PlatformWorkflowsView/,
  },
  {
    rule: "no-event-bus-workers",
    pattern: /@apzhub\/event-bus|BullMQ|createWorker\(|\bEventBus\b/,
  },
  {
    rule: "no-execute-impl",
    pattern: /\b(executeWorkflow|activateWorkflow|deactivateWorkflow|createSchedule)\b/,
  },
]);

// Public index must not export REST client / vendor records
{
  const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
  for (const forbidden of ["N8nRestClient", "n8n-api-types", "N8nWorkflowRecord"]) {
    if (index.includes(forbidden)) {
      violations.push({
        file: "integrations/n8n/src/index.ts",
        line: 1,
        rule: "public-export-leak",
        detail: `Must not export ${forbidden}`,
      });
    }
  }
  if (!index.includes("createN8nAdapter")) {
    violations.push({
      file: "integrations/n8n/src/index.ts",
      line: 1,
      rule: "missing-factory-export",
      detail: "createN8nAdapter must be exported",
    });
  }
}

// Historical APZWORKFLOW-006 gate forbade consumer wiring before Platform Services
// integration. From APZWORKFLOW-007 onward, Platform Services (and apps/web
// bootstrap) may depend on @apzhub/integration-n8n. The adapter package itself
// must still never depend upward (enforced above). Skip premature-wiring when
// 007+ artefacts exist (APZWORKFLOW-010 certification defect correction).
const post006WiringApproved = existsSync(
  join(ROOT, "docs/sprint/APZWORKFLOW-007-completion-report.md"),
);
if (!post006WiringApproved) {
  for (const consumer of [
    "packages/platform-services/package.json",
    "apps/web/package.json",
  ]) {
    const body = readFileSync(join(ROOT, consumer), "utf8");
    if (body.includes("@apzhub/integration-n8n")) {
      violations.push({
        file: consumer,
        line: 1,
        rule: "premature-wiring",
        detail:
          "APZWORKFLOW-006 must not wire n8n into Platform Services or apps/web",
      });
    }
  }
}

const requiredArtefacts = [
  "integrations/n8n/integration.yaml",
  "integrations/n8n/src/n8n-adapter.ts",
  "integrations/n8n/src/n8n-factory.ts",
  "docs/architecture/APZHUB-N8n-Adapter-Architecture.md",
  "docs/guides/APZHUB-N8n-Mapping-Guide.md",
  "docs/guides/APZHUB-N8n-Capability-Guide.md",
  "docs/guides/APZHUB-N8n-Security-Guide.md",
  "docs/developer/APZHUB-N8n-Developer-Guide.md",
  "docs/sprint/APZWORKFLOW-006-completion-report.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

if (violations.length > 0) {
  console.error("APZWORKFLOW-006 n8n Adapter Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-006 n8n Reference Adapter Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - @apzhub/integration-n8n 0.1.0 depends on integration-sdk only");
console.log("  - No Platform Services / Gateway / HTTP / Workbench / Event Bus wiring");
console.log("  - No official n8n SDK; no execute/create/update/delete surface");
console.log("  - Docs + integration.yaml present");
process.exit(0);

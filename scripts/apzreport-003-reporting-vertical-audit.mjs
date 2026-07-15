#!/usr/bin/env node
/**
 * APZREPORT-003 — Platform Reporting vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
 *   → Platform Reporting Services → Reporting Core → Contracts → Output Providers
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */

/** @type {Violation[]} */
const violations = [];

/** @type {{ file: string; note: string }[]} */
const observations = [];

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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function scan(files, rules, { skipTests = true } = {}) {
  for (const file of files) {
    const path = rel(file);
    if (skipTests && (path.includes(".test.") || path.includes(".spec."))) continue;
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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

// --- Workbench: never imports core / gateway / contracts / handlers ---
scan(walk(join(ROOT, "apps/web/components/reporting")), [
  {
    rule: "workbench-no-reporting-core",
    pattern: /@apzhub\/reporting-core/,
  },
  {
    rule: "workbench-no-reporting-contracts",
    pattern: /@apzhub\/reporting-contracts/,
  },
  {
    rule: "workbench-no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "workbench-no-testing-services",
    pattern: /@apzhub\/testing-services/,
  },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway|gateway\.reporting/,
  },
  {
    rule: "workbench-no-handlers",
    pattern: /lib\/api\/v1\/handlers\/reporting/,
  },
]);

// --- Typed client: never imports core / testing-services / platform-services ---
scan(walk(join(ROOT, "apps/web/lib/reporting")), [
  {
    rule: "client-no-reporting-core",
    pattern: /@apzhub\/reporting-core/,
  },
  {
    rule: "client-no-testing-services",
    pattern: /@apzhub\/testing-services/,
  },
  {
    rule: "client-no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "client-no-reporting-contracts",
    pattern: /@apzhub\/reporting-contracts/,
  },
  {
    rule: "client-no-engine-factory",
    pattern: /createPlatformReportingService/,
  },
]);

// Client must only call /api/v1/reporting — re-scan for forbidden absolute engine paths
{
  const files = walk(join(ROOT, "apps/web/lib/reporting")).filter(
    (f) => !rel(f).includes(".test.") && !rel(f).includes(".spec."),
  );
  for (const file of files) {
    const path = rel(file);
    const content = readFileSync(file, "utf8");
    if (/@apzhub\/reporting-core|createPlatformReportingService/.test(content)) {
      violations.push({
        file: path,
        line: 1,
        rule: "client-no-engine-direct",
        detail: "Typed client must not call reporting-core",
      });
    }
  }
}

// --- HTTP handlers: never import reporting-core or testing-services ---
{
  const handlerFiles = [
    join(ROOT, "apps/web/lib/api/v1/handlers/reporting.ts"),
    ...walk(join(ROOT, "apps/web/app/api/v1/reporting")),
  ];
  scan(handlerFiles, [
    {
      rule: "handler-no-reporting-core",
      pattern: /@apzhub\/reporting-core|createPlatformReportingService|renderOutput/,
    },
    {
      rule: "handler-no-testing-services",
      pattern: /@apzhub\/testing-services/,
    },
    {
      rule: "handler-no-output-providers",
      pattern: /reporting-core\/.*output|renderHtml|renderMarkdown|renderPdf/,
    },
  ]);
}

// --- Gateway reporting impl: never import output provider internals ---
scan(walk(join(ROOT, "packages/platform-services/src/services/reporting")), [
  {
    rule: "gateway-no-output-internals",
    pattern: /from\s+["']@apzhub\/reporting-core\/|\/output\/(html|pdf|docx|csv)/,
  },
  {
    rule: "gateway-no-apps-web",
    pattern: /apps\/web|@\/lib\/reporting/,
  },
]);

// --- reporting-core: never imports product implementations ---
scan(walk(join(ROOT, "packages/reporting-core")), [
  {
    rule: "core-no-testing-services",
    pattern: /@apzhub\/testing-services|@apzhub\/testing-persistence/,
  },
  {
    rule: "core-no-apps",
    pattern: /apps\/web|@\/components/,
  },
  {
    rule: "core-no-plane-zammad",
    pattern: /@apzhub\/integration-plane|@apzhub\/integration-zammad|from\s+["'][^"']*plane|from\s+["'][^"']*zammad/,
  },
]);

// --- reporting-contracts: no reverse deps ---
scan(walk(join(ROOT, "packages/reporting-contracts")), [
  {
    rule: "contracts-no-core",
    pattern: /@apzhub\/reporting-core/,
  },
  {
    rule: "contracts-no-testing",
    pattern: /@apzhub\/testing-|@apzhub\/platform-services/,
  },
  {
    rule: "contracts-no-apps",
    pattern: /apps\/web/,
  },
]);

// --- Observations (not violations): gateway composition depends on testing domain ---
{
  const createServices = join(
    ROOT,
    "packages/platform-services/src/services/create-platform-services.ts",
  );
  const content = readFileSync(createServices, "utf8");
  if (/PlatformReportingServiceImpl\(input\.testing\.domain\)/.test(content)) {
    observations.push({
      file: rel(createServices),
      note: "LIMITATION: gateway.reporting is composed only when Testing first-consumer ports are present",
    });
  }
  const impl = join(
    ROOT,
    "packages/platform-services/src/services/reporting/platform-reporting-service-impl.ts",
  );
  const implContent = readFileSync(impl, "utf8");
  if (/TestingDomainServices|domain\.reporting\.reporting/.test(implContent)) {
    observations.push({
      file: rel(impl),
      note: "LIMITATION: PlatformReportingServiceImpl delegates through TCMS first-consumer reporting ports",
    });
  }
}

// --- Product leakage soft check in contracts/core (comments mentioning TCMS OK; imports not) ---
{
  const productPatterns = [
    /@apzhub\/integration-plane/,
    /@apzhub\/integration-zammad/,
    /from\s+["'][^"']*\/kimai/,
  ];
  for (const dir of ["packages/reporting-contracts", "packages/reporting-core"]) {
    for (const file of walk(join(ROOT, dir))) {
      const path = rel(file);
      if (path.includes(".test.")) continue;
      const lines = readFileSync(file, "utf8").split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of productPatterns) {
          if (pattern.test(lines[i])) {
            violations.push({
              file: path,
              line: i + 1,
              rule: "no-product-leakage",
              detail: lines[i].trim().slice(0, 160),
            });
          }
        }
      }
    }
  }
}

console.log("APZREPORT-003 Reporting Vertical Audit");
console.log("=====================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}
console.log(`Observations: ${observations.length}`);
for (const o of observations) {
  console.log(`  NOTE ${o.file} — ${o.note}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log("\nRESULT: PASS (0 architecture/dependency/boundary violations)");
process.exit(0);

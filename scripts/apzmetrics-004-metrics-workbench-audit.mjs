#!/usr/bin/env node
/**
 * APZMETRICS-004 — Metrics Workbench boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
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

const componentFiles = walk(join(ROOT, "apps/web/components/metrics"));
const libFiles = walk(join(ROOT, "apps/web/lib/metrics")).filter(
  (f) => !f.includes(".test."),
);

scan(
  [...componentFiles, ...libFiles],
  [
    {
      rule: "ui-no-metrics-core",
      pattern: /@apzhub\/metrics-core|@apzhub\/metrics-persistence/,
    },
    {
      rule: "ui-no-platform-services",
      pattern: /@apzhub\/platform-services|getPlatformServiceGateway/,
    },
    {
      rule: "ui-no-provider-sdks",
      pattern: /from\s+["'](@grafana\/|prom-client|@opentelemetry\/|@prometheus\/)/,
    },
  ],
);

scan(componentFiles, [
  {
    rule: "ui-no-event-bus",
    pattern: /\bEventBus\b/,
  },
  {
    rule: "ui-no-direct-fetch",
    pattern: /\bfetch\s*\(/,
  },
  {
    rule: "ui-no-localstorage",
    pattern: /localStorage|sessionStorage/,
  },
  {
    rule: "ui-no-execution",
    pattern:
      /\b(executeFormula|evaluateKpi|calculateMetric|queryPrometheus|scrape)\s*\(/,
  },
]);

const viewFile = join(ROOT, "apps/web/components/metrics/platform-metrics-view.tsx");
if (!existsSync(viewFile)) {
  violations.push({
    file: "apps/web/components/metrics/platform-metrics-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Metrics Workbench view required",
  });
} else {
  const content = readFileSync(viewFile, "utf8");
  if (!content.includes("metrics-api") && !content.includes("@/lib/metrics")) {
    violations.push({
      file: rel(viewFile),
      line: 1,
      rule: "view-must-use-metrics-api",
      detail: "Workbench view must import metrics typed-client facades",
    });
  }
  for (const banner of [
    "FORMULA EXECUTION NOT AVAILABLE",
    "KPI EXECUTION NOT AVAILABLE",
    "PROMETHEUS INTEGRATION NOT AVAILABLE",
    "GRAFANA INTEGRATION NOT AVAILABLE",
    "METRIC CALCULATION NOT AVAILABLE",
  ]) {
    if (!content.includes(banner)) {
      violations.push({
        file: rel(viewFile),
        line: 1,
        rule: "missing-capability-banner",
        detail: `Expected capability banner: ${banner}`,
      });
    }
  }
  if (!content.includes("METRICS_SERVICE_UNAVAILABLE")) {
    violations.push({
      file: rel(viewFile),
      line: 1,
      rule: "missing-unavailable-handling",
      detail: "Workbench must handle METRICS_SERVICE_UNAVAILABLE",
    });
  }
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-metrics/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-metrics/module.yaml",
    line: 1,
    rule: "missing-parent-manifest",
    detail: "platform-metrics activity-bar manifest required",
  });
} else {
  const manifest = readFileSync(parentManifest, "utf8");
  if (!manifest.includes("route: /workspace/metrics")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-route",
      detail: "Expected /workspace/metrics route",
    });
  }
  if (!manifest.includes("permission: metrics.read")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-permission",
      detail: "Expected metrics.read permission",
    });
  }
  if (!manifest.includes("order: 55")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-order",
      detail: "Expected Activity Bar order 55",
    });
  }
}

for (const section of [
  "overview",
  "metrics",
  "definitions",
  "versions",
  "formulas",
  "kpis",
  "diagnostics",
  "metadata",
]) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-metrics-${section}/module.yaml`,
  );
  if (!existsSync(path)) {
    violations.push({
      file: rel(path),
      line: 1,
      rule: "missing-sidebar-manifest",
      detail: `Missing sidebar manifest for ${section}`,
    });
  }
}

const workbenchPage = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!workbenchPage.includes("MetricsWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-router",
    detail: "WorkbenchPage must mount MetricsWorkspaceRouter",
  });
}
if (!workbenchPage.includes("isMetricsRoute")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-route-guard",
    detail: "WorkbenchPage must use isMetricsRoute",
  });
}

const dedicatedTree = join(ROOT, "apps/web/app/workspace/metrics");
if (existsSync(dedicatedTree)) {
  violations.push({
    file: rel(dedicatedTree),
    line: 1,
    rule: "dedicated-app-tree-forbidden",
    detail:
      "Use catch-all workspace route — do not create apps/web/app/workspace/metrics",
  });
}

const opsManifests = walk(join(ROOT, "packages/workbench-framework/manifests")).filter(
  (f) => rel(f).includes("platform-operations"),
);
for (const file of opsManifests) {
  const content = readFileSync(file, "utf8");
  if (content.includes("platform-metrics") || content.includes("/workspace/metrics")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "operations-ownership",
      detail: "Metrics must not be owned by Platform Operations manifests",
    });
  }
}

if (violations.length > 0) {
  console.error("APZMETRICS-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZMETRICS-004 architecture audit PASSED");
console.log("  workbench → typed client only");
console.log("  manifests → platform-metrics + sidebar sections");
console.log("  shell mounts MetricsWorkspaceRouter");
console.log("  capability banners + unavailable handling present");
console.log("  no provider SDKs / formula-KPI execution / Event Bus / AI");
console.log("  no dedicated app/workspace/metrics tree");
process.exit(0);

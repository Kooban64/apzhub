#!/usr/bin/env node
/**
 * APZOBSERVE-004 — Observability Workbench boundary audit.
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

const componentFiles = walk(join(ROOT, "apps/web/components/observe"));
const libFiles = walk(join(ROOT, "apps/web/lib/observe")).filter(
  (f) => !f.includes(".test."),
);

scan(
  [...componentFiles, ...libFiles],
  [
    {
      rule: "ui-no-observe-core",
      pattern: /@apzhub\/observe-core|@apzhub\/observe-persistence/,
    },
    {
      rule: "ui-no-platform-services",
      pattern: /@apzhub\/platform-services|getPlatformServiceGateway/,
    },
    {
      rule: "ui-no-provider-sdks",
      pattern:
        /from\s+["'](@grafana\/|prom-client|@opentelemetry\/|@prometheus\/|loki-js|winston-loki)/,
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
    rule: "ui-no-provider-execution",
    pattern:
      /\b(scrape|queryPrometheus|ingestLogs|ingestTraces|probeGrafana|executeAlert)\s*\(/,
  },
]);

const viewFile = join(
  ROOT,
  "apps/web/components/observe/platform-observability-view.tsx",
);
if (!existsSync(viewFile)) {
  violations.push({
    file: "apps/web/components/observe/platform-observability-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Observability Workbench view required",
  });
} else {
  const content = readFileSync(viewFile, "utf8");
  if (!content.includes("observe-api") && !content.includes("@/lib/observe")) {
    violations.push({
      file: rel(viewFile),
      line: 1,
      rule: "view-must-use-observe-api",
      detail: "Workbench view must import observe typed-client facades",
    });
  }
  for (const banner of [
    "LIVE METRICS COLLECTION NOT AVAILABLE",
    "GRAFANA INTEGRATION NOT AVAILABLE",
    "PROMETHEUS INTEGRATION NOT AVAILABLE",
    "LOKI INTEGRATION NOT AVAILABLE",
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
  if (!content.includes("OBSERVE_SERVICE_UNAVAILABLE")) {
    violations.push({
      file: rel(viewFile),
      line: 1,
      rule: "missing-unavailable-handling",
      detail: "Workbench must handle OBSERVE_SERVICE_UNAVAILABLE",
    });
  }
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-observability/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-observability/module.yaml",
    line: 1,
    rule: "missing-parent-manifest",
    detail: "platform-observability activity-bar manifest required",
  });
} else {
  const manifest = readFileSync(parentManifest, "utf8");
  if (!manifest.includes("route: /workspace/observability")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-route",
      detail: "Expected /workspace/observability route",
    });
  }
  if (!manifest.includes("permission: observe.read")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-permission",
      detail: "Expected observe.read permission",
    });
  }
}

for (const section of [
  "overview",
  "health-checks",
  "diagnostics",
  "metadata",
  "metric-definitions",
  "alert-definitions",
  "maintenance-windows",
]) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-observability-${section}/module.yaml`,
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
if (!workbenchPage.includes("ObserveWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-router",
    detail: "WorkbenchPage must mount ObserveWorkspaceRouter",
  });
}
if (!workbenchPage.includes("isObserveRoute")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-route-guard",
    detail: "WorkbenchPage must use isObserveRoute",
  });
}

const dedicatedTree = join(ROOT, "apps/web/app/workspace/observability");
if (existsSync(dedicatedTree)) {
  violations.push({
    file: rel(dedicatedTree),
    line: 1,
    rule: "dedicated-app-tree-forbidden",
    detail:
      "Use catch-all workspace route — do not create apps/web/app/workspace/observability",
  });
}

const opsManifests = walk(join(ROOT, "packages/workbench-framework/manifests")).filter(
  (f) => rel(f).includes("platform-operations"),
);
for (const file of opsManifests) {
  const content = readFileSync(file, "utf8");
  if (
    content.includes("platform-observability") ||
    content.includes("/workspace/observability")
  ) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "operations-ownership",
      detail: "Observability must not be owned by Platform Operations manifests",
    });
  }
}

if (violations.length > 0) {
  console.error("APZOBSERVE-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZOBSERVE-004 architecture audit PASSED");
console.log("  workbench → typed client only");
console.log("  manifests → platform-observability + sidebar sections");
console.log("  shell mounts ObserveWorkspaceRouter");
console.log("  capability banners + unavailable handling present");
console.log("  no provider SDKs / collection / ingest / Event Bus");
console.log("  no dedicated app/workspace/observability tree");
process.exit(0);

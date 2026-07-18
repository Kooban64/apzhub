#!/usr/bin/env node
/**
 * OSS-100-12 — Platform Event Bus & Webhook Ingress audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
/** @type {{ file: string; line: number; rule: string; detail: string }[]} */
const violations = [];

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
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

requireExists("packages/platform-event-bus/package.json", "package-present");
requireExists(
  "packages/platform-event-bus/src/create-platform-event-bus.ts",
  "runtime-factory",
);
requireExists("packages/platform-event-bus/src/ingress/service.ts", "ingress-service");
requireExists(
  "packages/platform-event-bus/src/relay/outbox-handler.ts",
  "outbox-relay",
);
requireExists("apps/web/app/api/v1/platform/events/webhooks/route.ts", "webhook-route");
requireExists("apps/web/app/api/v1/platform/events/health/route.ts", "health-route");
requireExists(
  "apps/web/app/api/v1/platform/events/diagnostics/route.ts",
  "diagnostics-route",
);
requireExists("scripts/worker-outbox.mjs", "worker-entry");
requireExists(
  "docs/sprint/OSS-100-12-Platform-Event-Bus-Sprint-Guide.md",
  "sprint-guide",
);
requireExists("docs/sprint/OSS-100-12-completion-report.md", "completion-report");

const pkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-event-bus/package.json"), "utf8"),
);
if (pkg.name !== "@apzhub/platform-event-bus" || pkg.version !== "0.1.0") {
  violations.push({
    file: "packages/platform-event-bus/package.json",
    line: 1,
    rule: "package-identity",
    detail: `Expected @apzhub/platform-event-bus@0.1.0, got ${pkg.name}@${pkg.version}`,
  });
}

const deps = pkg.dependencies ?? {};
if (!deps["@apzhub/integration-sdk"]) {
  violations.push({
    file: "packages/platform-event-bus/package.json",
    line: 1,
    rule: "sdk-dependency",
    detail: "Must depend on @apzhub/integration-sdk",
  });
}
if (!deps["@apzhub/platform-outbox"]) {
  violations.push({
    file: "packages/platform-event-bus/package.json",
    line: 1,
    rule: "outbox-dependency",
    detail: "Must depend on @apzhub/platform-outbox",
  });
}

const forbiddenCore = [
  { pattern: /\bbullmq\b/i, rule: "no-bullmq" },
  { pattern: /\bagenda\b/i, rule: "no-agenda" },
  { pattern: /from\s+["']bull/i, rule: "no-bull-import" },
  { pattern: /kimai/i, rule: "no-kimai" },
];

/** Event Bus package must not own product provisioning (OSS-100-12+ owns that). */
const forbiddenEventBusOnly = [{ pattern: /provisioning/i, rule: "no-provisioning" }];

const eventBusFiles = [
  ...walk(join(ROOT, "packages/platform-event-bus/src")),
  join(ROOT, "apps/web/lib/api/v1/handlers/platform-events.ts"),
  join(ROOT, "apps/web/lib/platform-event-bus/runtime.ts"),
].filter((f) => existsSync(f));

const sharedFiles = [join(ROOT, "scripts/worker-outbox.mjs")].filter((f) =>
  existsSync(f),
);

for (const file of eventBusFiles) {
  if (file.includes(".test.")) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of [...forbiddenCore, ...forbiddenEventBusOnly]) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: rule.rule,
          detail: line.trim().slice(0, 160),
        });
      }
    }
  }
}

for (const file of sharedFiles) {
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of forbiddenCore) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: rule.rule,
          detail: line.trim().slice(0, 160),
        });
      }
    }
  }
}

const sdkPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/integration-sdk/package.json"), "utf8"),
);
if (sdkPkg.version !== "1.0.0") {
  violations.push({
    file: "packages/integration-sdk/package.json",
    line: 1,
    rule: "sdk-freeze",
    detail: `Integration SDK must remain 1.0.0; found ${sdkPkg.version}`,
  });
}

const workerSrc = readFileSync(join(ROOT, "scripts/worker-outbox.mjs"), "utf8");
if (
  !workerSrc.includes("platform-event-bus") ||
  !workerSrc.includes("createOutboxHandler")
) {
  violations.push({
    file: "scripts/worker-outbox.mjs",
    line: 1,
    rule: "worker-event-bus-relay",
    detail: "Worker must wire Event Bus outbox relay handler",
  });
}

if (violations.length > 0) {
  console.error("OSS-100-12 platform-event-bus audit FAILED");
  for (const v of violations) {
    console.error(`- [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
  process.exit(1);
}

console.info("OSS-100-12 platform-event-bus audit PASS");
process.exit(0);

#!/usr/bin/env node
/**
 * APZNOTIFY-002 — Notification Platform Services / Gateway / Authorization audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
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
      const trimmed = line.trim();
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*")
      ) {
        continue;
      }
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

const notifyDir = "packages/platform-services/src/services/notification";
if (!existsSync(join(ROOT, notifyDir))) {
  violations.push({
    file: notifyDir,
    line: 1,
    rule: "package-present",
    detail: `${notifyDir} missing`,
  });
} else {
  scan(walk(join(ROOT, notifyDir)), [
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|createRouteHandler/ },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/notification/ },
    { rule: "no-delivery", pattern: /nodemailer|twilio|web-push|@slack\/web-api/ },
    {
      rule: "no-event-bus",
      pattern: /EventBus|publishEvent\(/,
      // ENG-004 / ENG-001B delivery plane EventBus port (platform-owned)
      allow: (path) => path.includes("/services/notification/delivery/"),
    },
    { rule: "no-queues", pattern: /BullMQ|bullmq|node-cron/ },
  ]);
}

{
  const gateway = readFileSync(
    join(ROOT, "packages/platform-services/src/gateway/platform-service-gateway.ts"),
    "utf8",
  );
  if (!gateway.includes("notificationApi") || !gateway.includes("get notification(")) {
    violations.push({
      file: "packages/platform-services/src/gateway/platform-service-gateway.ts",
      line: 1,
      rule: "gateway-notification-facet",
      detail:
        "PlatformServiceGateway must expose notificationApi and get notification()",
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
    "utf8",
  );
  if (!catalogue.includes("PLATFORM_NOTIFICATION_PERMISSIONS")) {
    violations.push({
      file: "packages/platform-services/src/authorization/permission-catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: "PLATFORM_NOTIFICATION_PERMISSIONS must be spread into catalogue",
    });
  }
}

{
  const opMap = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/authorization/operation-authorization-map.ts",
    ),
    "utf8",
  );
  if (!opMap.includes("notificationPlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "op-map",
      detail: "notificationPlatformOps missing",
    });
  }
  for (const key of [
    "notificationNotifications",
    "notificationTemplates",
    "notificationPreferences",
    "notificationCategories",
    "notificationChannels",
    "notificationRecipients",
    "notificationReferences",
    "notificationAudit",
    "notificationDiagnostics",
  ]) {
    if (!opMap.includes(`"${key}"`)) {
      violations.push({
        file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
        line: 1,
        rule: "op-map-service-key",
        detail: `missing service key ${key}`,
      });
    }
  }
}

{
  const create = readFileSync(
    join(ROOT, "packages/platform-services/src/services/create-platform-services.ts"),
    "utf8",
  );
  if (!create.includes("notificationApi") || !create.includes("input.notification")) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "create-platform-services-wire",
      detail: "createPlatformServices must accept and wire notification bundle",
    });
  }
  if (!create.includes('PLATFORM_SERVICES_VERSION = "0.32.0"')) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "version",
      detail: "PLATFORM_SERVICES_VERSION must be 0.32.0",
    });
  }
}

{
  const pkg = JSON.parse(
    readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
  );
  if (pkg.version !== "0.32.0") {
    violations.push({
      file: "packages/platform-services/package.json",
      line: 1,
      rule: "package-version",
      detail: `Expected 0.32.0, found ${pkg.version}`,
    });
  }
  for (const dep of [
    "@apzhub/notification-contracts",
    "@apzhub/notification-core",
    "@apzhub/notification-persistence",
  ]) {
    if (!pkg.dependencies?.[dep]) {
      violations.push({
        file: "packages/platform-services/package.json",
        line: 1,
        rule: "dependency",
        detail: `missing dependency ${dep}`,
      });
    }
  }
}

{
  const contractsPkg = JSON.parse(
    readFileSync(join(ROOT, "packages/notification-contracts/package.json"), "utf8"),
  );
  if (contractsPkg.version !== "0.3.5") {
    violations.push({
      file: "packages/notification-contracts/package.json",
      line: 1,
      rule: "contracts-version",
      detail: `Expected 0.3.5, found ${contractsPkg.version}`,
    });
  }
  const corePkg = JSON.parse(
    readFileSync(join(ROOT, "packages/notification-core/package.json"), "utf8"),
  );
  if (corePkg.version !== "0.2.0") {
    violations.push({
      file: "packages/notification-core/package.json",
      line: 1,
      rule: "core-version",
      detail: `Expected 0.2.0, found ${corePkg.version}`,
    });
  }
}

console.log("APZNOTIFY-002 Notification Platform Services Audit");
console.log("==================================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log(
  "\nRESULT: PASS (0 architecture/dependency/boundary/authorization violations)",
);
process.exit(0);

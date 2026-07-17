#!/usr/bin/env node
/**
 * APZNOTIFY-001 — Platform Notification Foundation architecture / dependency / boundary audit.
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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
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
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
        continue;
      }
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

const packageRoots = [
  "packages/notification-contracts",
  "packages/notification-core",
  "packages/notification-persistence",
];

for (const root of packageRoots) {
  if (!existsSync(join(ROOT, root))) {
    violations.push({
      file: root,
      line: 1,
      rule: "package-present",
      detail: `${root} missing`,
    });
    continue;
  }
  scan(walk(join(ROOT, root)), [
    { rule: "no-apps-web", pattern: /apps\/web|@\/components|@\/lib\/api/ },
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|withPlatformApiAuth|createRouteHandler/ },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/notification/ },
    { rule: "no-delivery-providers", pattern: /nodemailer|twilio|web-push|@slack\/web-api|@microsoft\/microsoft-graph-client/ },
    {
      rule: "no-event-bus",
      pattern: /@apzhub\/event-notification-framework|EventBus|publishEvent\(/,
    },
    {
      rule: "no-workers-queues",
      pattern: /BullMQ|bullmq|node-cron|setInterval\(/,
    },
    {
      rule: "no-platform-services",
      pattern: /@apzhub\/platform-services/,
    },
  ]);
}

scan(walk(join(ROOT, "packages/notification-contracts")), [
  {
    rule: "contracts-no-core-persistence",
    pattern: /@apzhub\/notification-core|@apzhub\/notification-persistence/,
  },
]);

scan(walk(join(ROOT, "packages/notification-core")), [
  { rule: "core-no-persistence", pattern: /@apzhub\/notification-persistence/ },
]);

for (const pkg of packageRoots) {
  const packageJsonPath = join(ROOT, pkg, "package.json");
  if (!existsSync(packageJsonPath)) continue;
  const pkgJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const allowed = pkg.includes("notification-persistence")
    ? new Set(["0.1.0"])
    : new Set(["0.1.0", "0.2.0"]);
  if (!allowed.has(pkgJson.version)) {
    violations.push({
      file: rel(packageJsonPath),
      line: 1,
      rule: "package-version-floor",
      detail: `expected one of ${[...allowed].join(", ")} got ${pkgJson.version}`,
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/notification-contracts/src/permissions/catalogue.ts"),
    "utf8",
  );
  for (const key of [
    "notification.*",
    "notification.read",
    "notification.manage",
    "notification.template",
    "notification.preference",
    "notification.audit",
    "notification.delivery",
  ]) {
    if (!catalogue.includes(`"${key}"`)) {
      violations.push({
        file: "packages/notification-contracts/src/permissions/catalogue.ts",
        line: 1,
        rule: "permission-catalogue-complete",
        detail: `missing permission key ${key}`,
      });
    }
  }
}

{
  const version = readFileSync(
    join(ROOT, "packages/notification-contracts/src/version.ts"),
    "utf8",
  );
  if (!version.includes('NOTIFICATION_CONTRACTS_VERSION = "0.2.0"')) {
    violations.push({
      file: "packages/notification-contracts/src/version.ts",
      line: 1,
      rule: "contracts-version-export",
      detail: "NOTIFICATION_CONTRACTS_VERSION must be 0.1.0",
    });
  }
  const domain = readFileSync(
    join(ROOT, "packages/notification-contracts/src/domain/notification.ts"),
    "utf8",
  );
  for (const symbol of [
    "Notification",
    "NotificationRecipient",
    "NotificationTemplate",
    "NotificationChannel",
    "NotificationPreference",
    "NotificationCategory",
    "NotificationAuditEntry",
    "NotificationRule",
    "NotificationAttachmentMetadata",
    "NotificationReference",
    "NotificationDeliveryAttempt",
  ]) {
    if (!domain.includes(`export type ${symbol}`)) {
      violations.push({
        file: "packages/notification-contracts/src/domain/notification.ts",
        line: 1,
        rule: "required-domain-export",
        detail: `missing export type ${symbol}`,
      });
    }
  }
  const index = readFileSync(
    join(ROOT, "packages/notification-contracts/src/index.ts"),
    "utf8",
  );
  if (!index.includes("./services/notification-service")) {
    violations.push({
      file: "packages/notification-contracts/src/index.ts",
      line: 1,
      rule: "required-service-export",
      detail: "notification-service must be exported",
    });
  }
  const service = readFileSync(
    join(ROOT, "packages/notification-contracts/src/services/notification-service.ts"),
    "utf8",
  );
  if (/\bsend\w*\s*\(/.test(service) || /\bdeliver\w*\s*\(/.test(service)) {
    violations.push({
      file: "packages/notification-contracts/src/services/notification-service.ts",
      line: 1,
      rule: "no-delivery-port",
      detail: "NotificationPlatformService must not expose send/deliver methods",
    });
  }
}

for (const migration of [
  "packages/config/drizzle/0046_apz_platform_notification.sql",
  "packages/config/drizzle/0047_apz_platform_notification_rls.sql",
]) {
  if (!existsSync(join(ROOT, migration))) {
    violations.push({
      file: migration,
      line: 1,
      rule: "migration-present",
      detail: `${migration} missing`,
    });
  }
}

console.log("APZNOTIFY-001 Platform Notification Foundation Audit");
console.log("====================================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log("\nRESULT: PASS (0 architecture/dependency/boundary/authorization violations)");
process.exit(0);

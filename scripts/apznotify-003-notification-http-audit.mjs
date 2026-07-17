#!/usr/bin/env node
/**
 * APZNOTIFY-003 — Notification HTTP API & Typed Client boundary audit.
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

const notificationHandler = join(ROOT, "apps/web/lib/api/v1/handlers/notifications.ts");
if (!existsSync(notificationHandler)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/notifications.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "notification handlers required",
  });
} else {
  const content = readFileSync(notificationHandler, "utf8");
  if (!content.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(notificationHandler),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "notification handlers must call getPlatformServiceGateway",
    });
  }
  if (!content.includes("gateway.notification")) {
    violations.push({
      file: rel(notificationHandler),
      line: 1,
      rule: "handlers-missing-notification-facet",
      detail: "handlers must call gateway.notification.*",
    });
  }
  if (
    content.includes("@apzhub/notification-core") ||
    content.includes("@apzhub/notification-persistence") ||
    /from\s+["']drizzle-orm/.test(content) ||
    /from\s+["']postgres/.test(content)
  ) {
    violations.push({
      file: rel(notificationHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no notification-core/persistence/drizzle/postgres in handlers",
    });
  }
  if (
    content.includes("/send") ||
    content.includes("/deliver") ||
    content.includes("notification.delivery")
  ) {
    violations.push({
      file: rel(notificationHandler),
      line: 1,
      rule: "handlers-forbidden-delivery",
      detail: "no delivery routes or notification.delivery wiring",
    });
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
    f.includes("notifications"),
  ),
  [
    {
      rule: "handlers-no-core",
      pattern:
        /@apzhub\/notification-core|@apzhub\/notification-persistence|from\s+["']drizzle-orm|from\s+["']postgres/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/notifications")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/notification-core|@apzhub\/notification-persistence|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!notifications)/,
  },
]);

for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/notifications") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/notifications/notification-client.ts");
if (existsSync(clientFile)) {
  const client = readFileSync(clientFile, "utf8");
  if (
    !client.includes('"/api/v1/notifications"') &&
    !client.includes("'/api/v1/notifications'") &&
    !client.includes("NOTIFICATIONS_API_BASE")
  ) {
    violations.push({
      file: rel(clientFile),
      line: 1,
      rule: "client-missing-base",
      detail: "typed client must target /api/v1/notifications",
    });
  }
  for (const method of ["sendNotification", "deliverNotification", "scheduleNotification"]) {
    if (client.includes(method)) {
      violations.push({
        file: rel(clientFile),
        line: 1,
        rule: "client-forbidden-delivery-method",
        detail: `typed client must not expose ${method}`,
      });
    }
  }
}

const notificationRoutes = walk(join(ROOT, "apps/web/app/api/v1/notifications"));
for (const file of notificationRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Notification HTTP routes must use withPlatformApiAuth",
    });
  }
}

const forbiddenSegments = [
  "send",
  "resend",
  "deliver",
  "dispatch",
  "retry",
  "schedule",
  "cancel-delivery",
  "providers",
  "smtp",
  "sms",
  "push",
  "teams",
  "slack",
  "webhooks",
  "workers",
  "queues",
  "events",
  "stream",
  "subscribe",
  "realtime",
];
for (const file of notificationRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/notifications/${segment}/`) ||
      path.includes(`/notifications/${segment}/route.ts`) ||
      path.endsWith(`/notifications/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden notification HTTP segment present: ${segment}`,
      });
    }
  }
}

const workbench = join(ROOT, "apps/web/app/workspace/notifications");
if (existsSync(workbench)) {
  violations.push({
    file: rel(workbench),
    line: 1,
    rule: "workbench-forbidden",
    detail: "Notification Workbench is APZNOTIFY-004 — not this milestone",
  });
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("\n  /notifications:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-notifications",
    detail: "Expected /notifications paths in OpenAPI",
  });
}
if (!openapi.includes("name: Platform Notifications")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-tag",
    detail: "Expected Platform Notifications tag",
  });
}
if (!openapi.includes("CreateNotificationRequest")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-schemas",
    detail: "Expected CreateNotificationRequest schema",
  });
}
if (!openapi.includes("version: 1.4.0")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-version",
    detail: "Expected OpenAPI info.version 1.4.0",
  });
}
for (const bad of ["/notifications/send", "/notifications/deliver", "/notifications/providers"]) {
  if (openapi.includes(`\n  ${bad}:`)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-forbidden-delivery",
      detail: `OpenAPI must not document ${bad}`,
    });
  }
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("createNotificationPlatformServicesForProduction")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-notification",
    detail: "Gateway bootstrap must wire notification platform services",
  });
}
if (!bootstrap.includes("isNotificationServiceEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-flag",
    detail: "Bootstrap must reuse isNotificationServiceEnabled / APZHUB_NOTIFICATION_ENABLED",
  });
}

const nestedStatic = [
  "templates",
  "preferences",
  "categories",
  "channels",
  "audit",
  "capabilities",
  "health",
  "readiness",
  "diagnostics",
];
for (const segment of nestedStatic) {
  const bad = join(
    ROOT,
    `apps/web/app/api/v1/notifications/[notificationId]/${segment}`,
  );
  if (existsSync(bad) && segment !== "audit" && segment !== "recipients" && segment !== "references") {
    // audit/recipients/references under notificationId are intentional
  }
  if (["templates", "preferences", "categories", "channels", "capabilities", "health", "readiness", "diagnostics"].includes(segment)) {
    const badNested = join(
      ROOT,
      `apps/web/app/api/v1/notifications/[notificationId]/${segment}`,
    );
    if (existsSync(badNested)) {
      violations.push({
        file: rel(badNested),
        line: 1,
        rule: "static-segment-under-dynamic",
        detail: `${segment} must be sibling of [notificationId], not nested under it`,
      });
    }
    const good = join(ROOT, `apps/web/app/api/v1/notifications/${segment}`);
    if (!existsSync(good)) {
      violations.push({
        file: rel(good),
        line: 1,
        rule: "static-segment-missing",
        detail: `Expected static sibling directory: notifications/${segment}`,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("APZNOTIFY-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZNOTIFY-003 architecture audit PASSED");
console.log("  handlers → gateway.notification.* only");
console.log("  typed client → /api/v1/notifications only");
console.log("  bootstrap wires createNotificationPlatformServicesForProduction");
console.log("  OpenAPI Platform Notifications + 1.4.0 present");
console.log("  no send/deliver/providers/workers/realtime routes");
console.log("  no Notification Workbench");
process.exit(0);

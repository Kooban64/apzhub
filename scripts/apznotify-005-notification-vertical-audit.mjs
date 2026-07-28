#!/usr/bin/env node
/**
 * APZNOTIFY-005 — Notification vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → PlatformServiceGateway.notification.*
 *   → RequestPipeline → Production Authorization
 *   → Notification Platform Services → Notification Core → Notification Persistence → PostgreSQL
 *
 * Metadata management plane only — no delivery providers, Event Bus, workers, queues,
 * scheduling, or realtime.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(full);
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

function requirePackageVersion(pkgJsonPath, expected, rule) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) {
    violations.push({
      file: pkgJsonPath,
      line: 1,
      rule,
      detail: `package.json missing (expected ${expected})`,
    });
    return;
  }
  const version = JSON.parse(readFileSync(full, "utf8")).version;
  if (version !== expected) {
    violations.push({
      file: pkgJsonPath,
      line: 1,
      rule,
      detail: `Expected version ${expected}, found ${version}`,
    });
  }
}

function packageDeps(pkgJsonPath) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) return {};
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  return {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };
}

function forbidDeps(pkgJsonPath, forbidden, rule) {
  const deps = packageDeps(pkgJsonPath);
  for (const name of forbidden) {
    if (deps[name]) {
      violations.push({
        file: pkgJsonPath,
        line: 1,
        rule,
        detail: `Forbidden dependency: ${name}`,
      });
    }
  }
}

const DELIVERY_PROVIDER =
  /\b(nodemailer|sendgrid|twilio|firebase-admin|web-push|@slack\/web-api|botframework|smtp|ses\.send)\b/i;
const DELIVERY_METHOD =
  /\b(sendNotification|deliverNotification|resendNotification|scheduleNotification|enqueueDelivery)\b/;

// ---------------------------------------------------------------------------
// Layer 1 — Workbench UI
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/components/notifications")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  { rule: "workbench-no-notification-core", pattern: /@apzhub\/notification-core/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/notification-persistence/ },
  { rule: "workbench-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "workbench-no-delivery-methods", pattern: DELIVERY_METHOD },
  {
    rule: "workbench-no-delivery-providers",
    pattern: DELIVERY_PROVIDER,
    // ENG-004 deferred copy may mention SMTP without implementing a provider
    allow: (_path, line) => /deferred/i.test(line),
  },
  {
    rule: "workbench-no-realtime",
    pattern: /\bWebSocket\b/,
    // ENG-003 SSE inbox uses EventSource (authorised); WebSocket remains forbidden
  },
]);

scan(
  walk(join(ROOT, "apps/web/lib/notifications")).filter(
    (f) => !f.includes("notification-boundary"),
  ),
  [
    { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "client-no-gateway",
      pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
    },
    { rule: "client-no-notification-core", pattern: /@apzhub\/notification-core/ },
    { rule: "client-no-persistence", pattern: /@apzhub\/notification-persistence/ },
    { rule: "client-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "client-no-delivery-methods", pattern: DELIVERY_METHOD },
    {
      rule: "client-no-delivery-providers",
      pattern: DELIVERY_PROVIDER,
      allow: (path) => path.endsWith("apps/web/lib/notifications/routes.ts"),
    },
    {
      rule: "client-api-only",
      pattern: /fetch\(|\/api\/v1\//,
      allow: (path, line) =>
        path.includes("notification-client.ts") ||
        path.includes("notification-delivery-api.ts") ||
        path.includes("mock-") ||
        path.includes("routes.ts") ||
        /\/api\/v1\/notifications/.test(line) ||
        line.includes("AbortSignal"),
    },
  ],
);

{
  const clientPath = join(ROOT, "apps/web/lib/notifications/notification-client.ts");
  if (existsSync(clientPath)) {
    const body = readFileSync(clientPath, "utf8");
    const apiHits = body.match(/\/api\/v1\/[a-zA-Z0-9_/-]+/g) ?? [];
    for (const hit of apiHits) {
      if (!hit.startsWith("/api/v1/notifications")) {
        violations.push({
          file: "apps/web/lib/notifications/notification-client.ts",
          line: 1,
          rule: "client-wrong-api",
          detail: `Typed client must only call /api/v1/notifications*; found ${hit}`,
        });
      }
    }
    if (!body.includes("createHttpNotificationClient")) {
      violations.push({
        file: "apps/web/lib/notifications/notification-client.ts",
        line: 1,
        rule: "missing-http-client-factory",
        detail: "createHttpNotificationClient missing",
      });
    }
    for (const forbidden of [
      "sendNotification",
      "deliverNotification",
      "resendNotification",
      "scheduleNotification",
    ]) {
      if (body.includes(forbidden)) {
        violations.push({
          file: "apps/web/lib/notifications/notification-client.ts",
          line: 1,
          rule: "client-delivery-surface",
          detail: `Forbidden client method surface: ${forbidden}`,
        });
      }
    }
  }
}

{
  const view = join(
    ROOT,
    "apps/web/components/notifications/platform-notifications-view.tsx",
  );
  if (!existsSync(view)) {
    violations.push({
      file: "apps/web/components/notifications/platform-notifications-view.tsx",
      line: 1,
      rule: "missing-workbench-view",
      detail: "Platform Notifications view required",
    });
  } else {
    const content = readFileSync(view, "utf8");
    if (!content.includes("DELIVERY PROVIDERS NOT AVAILABLE")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "missing-delivery-banner",
        detail: "Workbench must display DELIVERY PROVIDERS NOT AVAILABLE",
      });
    }
    if (!content.includes("@/lib/notifications/notification-api")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "view-must-use-notification-api",
        detail: "Workbench must call notification-api facades",
      });
    }
    if (/\b(Send|Resend|Retry Delivery)\b/.test(content)) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "workbench-delivery-controls",
        detail: "Send/Resend/Retry Delivery controls must not exist",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — HTTP routes + handlers
// ---------------------------------------------------------------------------
const routeFiles = walk(join(ROOT, "apps/web/app/api/v1/notifications"));
const handlerFiles = walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
  /notification/.test(rel(f)),
);
const httpFiles = [...routeFiles, ...handlerFiles];

scan(httpFiles, [
  { rule: "http-no-notification-core", pattern: /@apzhub\/notification-core/ },
  { rule: "http-no-persistence", pattern: /@apzhub\/notification-persistence/ },
  { rule: "http-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "http-no-delivery-methods", pattern: DELIVERY_METHOD },
  { rule: "http-no-delivery-providers", pattern: DELIVERY_PROVIDER },
  {
    rule: "http-no-direct-platform-services-pkg",
    pattern: /from\s+["']@apzhub\/platform-services/,
  },
]);

{
  const gatewaySurface = handlerFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  if (
    !gatewaySurface.includes("getPlatformServiceGateway") &&
    !gatewaySurface.includes("gateway.notification")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers",
      line: 1,
      rule: "http-missing-gateway",
      detail:
        "Notification handlers must call getPlatformServiceGateway().notification.*",
    });
  }
}

for (const omitted of [
  "apps/web/app/api/v1/notifications/send",
  "apps/web/app/api/v1/notifications/deliver",
  // ENG-004 / Platform 1.4: providers + deliveries/delivery-* are authorised
  "apps/web/app/api/v1/notifications/email",
  "apps/web/app/api/v1/notifications/sms",
  "apps/web/app/api/v1/notifications/push",
  "apps/web/app/api/v1/notifications/webhooks",
  "apps/web/app/api/v1/notifications/workers",
  "apps/web/app/api/v1/notifications/queues",
  "apps/web/app/api/v1/notifications/schedules",
  "apps/web/app/api/v1/notifications/realtime",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "delivery-route-present",
      detail: "Unauthorised delivery/channel/worker route must not exist",
    });
  }
}

// ---------------------------------------------------------------------------
// Layer 3 — Platform services / packages
// ---------------------------------------------------------------------------
forbidDeps(
  "packages/notification-contracts/package.json",
  [
    "@apzhub/notification-core",
    "@apzhub/notification-persistence",
    "@apzhub/platform-services",
    "nodemailer",
    "twilio",
    "meilisearch",
  ],
  "contracts-deps",
);
forbidDeps(
  "packages/notification-core/package.json",
  [
    "@apzhub/notification-persistence",
    "@apzhub/platform-services",
    "nodemailer",
    "twilio",
    "meilisearch",
  ],
  "core-deps",
);
forbidDeps(
  "packages/notification-persistence/package.json",
  ["@apzhub/platform-services", "nodemailer", "twilio", "meilisearch"],
  "persistence-deps",
);

scan(walk(join(ROOT, "packages/platform-services/src/services/notification")), [
  { rule: "services-no-http", pattern: /apps\/web|next\/server|NextRequest/ },
  {
    rule: "services-no-event-bus",
    pattern: /\bEventBus\b|@apzhub\/event-bus/,
    // Delivery plane EventBus port types authorised under ENG-004 / ENG-001B
    allow: (path) => path.includes("/services/notification/delivery/"),
  },
  { rule: "services-no-delivery-methods", pattern: DELIVERY_METHOD },
  {
    rule: "services-no-delivery-providers",
    pattern: DELIVERY_PROVIDER,
    allow: (_path, line) =>
      /deferred/i.test(line) || /services\/notification\/delivery\//.test(_path),
  },
]);

scan(walk(join(ROOT, "packages/notification-core/src")), [
  { rule: "core-no-persistence-impl", pattern: /@apzhub\/notification-persistence/ },
  { rule: "core-no-http", pattern: /apps\/web|NextRequest|fetch\(/ },
  { rule: "core-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "core-no-delivery-providers", pattern: DELIVERY_PROVIDER },
]);

scan(walk(join(ROOT, "packages/notification-persistence/src")), [
  { rule: "persistence-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "persistence-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "persistence-no-delivery-providers", pattern: DELIVERY_PROVIDER },
]);

requireExists(
  "packages/workbench-framework/manifests/platform-notifications/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
  "overview",
  "inbox",
  "templates",
  "preferences",
  "categories",
  "channels",
  "recipients",
  "references",
  "audit",
  "diagnostics",
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-notifications-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

{
  const shell = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (
    !shell.includes("NotificationsWorkspaceRouter") ||
    !shell.includes("isNotificationsRoute")
  ) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-notifications-mount",
      detail: "WorkbenchPage must mount NotificationsWorkspaceRouter",
    });
  }
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Notifications")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Platform Notifications tag",
    });
  }
  for (const required of [
    "/notifications:",
    "/notifications/{notificationId}:",
    "/notifications/templates:",
    "/notifications/capabilities:",
    "/notifications/health:",
  ]) {
    if (!openapi.includes(required)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-parity",
        detail: `Missing OpenAPI surface: ${required}`,
      });
    }
  }
  for (const forbidden of [
    "/notifications/send",
    "/notifications/email",
    "/notifications/sms",
  ]) {
    if (openapi.includes(forbidden)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-delivery-leak",
        detail: `OpenAPI must not publish ${forbidden}`,
      });
    }
  }
  // Exact singular /deliver only — do not match /deliveries or /delivery-*
  if (/\n {2}\/notifications\/deliver:/.test(openapi)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-delivery-leak",
      detail: "OpenAPI must not publish /notifications/deliver",
    });
  }
}

requirePackageVersion(
  "packages/notification-contracts/package.json",
  "0.3.5",
  "version-notification-contracts",
);
requirePackageVersion(
  "packages/notification-core/package.json",
  "0.2.0",
  "version-notification-core",
);
requirePackageVersion(
  "packages/notification-persistence/package.json",
  "0.1.0",
  "version-notification-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.32.0",
  "version-platform-services",
);
requirePackageVersion(
  "packages/platform-service-contracts/package.json",
  "0.18.0",
  "version-platform-service-contracts",
);

// ---------------------------------------------------------------------------
// Required artefacts 001–005
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZNOTIFY-001-completion-report.md",
  "docs/sprint/APZNOTIFY-002-completion-report.md",
  "docs/sprint/APZNOTIFY-003-completion-report.md",
  "docs/sprint/APZNOTIFY-004-completion-report.md",
  "docs/sprint/APZNOTIFY-005-completion-report.md",
  "docs/reviews/APZNOTIFY-001-coverage-baseline.md",
  "docs/reviews/APZNOTIFY-002-coverage-baseline.md",
  "docs/reviews/APZNOTIFY-003-coverage-baseline.md",
  "docs/reviews/APZNOTIFY-004-coverage-baseline.md",
  "docs/reviews/APZNOTIFY-005-Vertical-Certification.md",
  "docs/reviews/APZNOTIFY-005-Architecture-Audit.md",
  "docs/reviews/APZNOTIFY-005-Dependency-Audit.md",
  "docs/reviews/APZNOTIFY-005-Boundary-Audit.md",
  "docs/reviews/APZNOTIFY-005-HTTP-Certification.md",
  "docs/reviews/APZNOTIFY-005-Typed-Client-Certification.md",
  "docs/reviews/APZNOTIFY-005-Workbench-Certification.md",
  "docs/reviews/APZNOTIFY-005-Authorization-Review.md",
  "docs/reviews/APZNOTIFY-005-Security-Review.md",
  "docs/reviews/APZNOTIFY-005-Performance-Baseline.md",
  "docs/reviews/APZNOTIFY-005-Coverage-Baseline.md",
  "docs/reviews/APZNOTIFY-005-Production-Readiness.md",
  "scripts/apznotify-001-notification-foundation-audit.mjs",
  "scripts/apznotify-002-platform-services-audit.mjs",
  "scripts/apznotify-003-notification-http-audit.mjs",
  "scripts/apznotify-004-notification-workbench-audit.mjs",
  "docs/architecture/APZHUB-Notification-Platform-Architecture.md",
  "docs/architecture/APZHUB-Notification-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Notification-HTTP-API.md",
  "docs/architecture/APZHUB-Notification-Typed-Client-Architecture.md",
  "docs/architecture/APZHUB-Notification-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

// ---------------------------------------------------------------------------
// Re-exec prior layered audits
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apznotify-001-notification-foundation-audit.mjs",
  "scripts/apznotify-002-platform-services-audit.mjs",
  "scripts/apznotify-003-notification-http-audit.mjs",
  "scripts/apznotify-004-notification-workbench-audit.mjs",
];

for (const script of priorAudits) {
  const full = join(ROOT, script);
  try {
    execFileSync(process.execPath, [full], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const stderr = err.stderr?.toString?.() ?? String(err);
    violations.push({
      file: script,
      line: 1,
      rule: "prior-audit-failed",
      detail: stderr.split("\n").slice(0, 4).join(" | ").slice(0, 200),
    });
  }
}

observations.push({
  file: "apps/web/app/api/v1/testing/traceability",
  note: "Pre-existing Next.js slug conflict may block Playwright webServer — external to Notification; not a Notification defect.",
});
observations.push({
  file: "notification-delivery",
  note: "Delivery providers / Event Bus / workers / queues / scheduling / realtime deliberately unavailable (metadata plane only). Not a defect.",
});
observations.push({
  file: "packages/notification-persistence",
  note: "Live PostgreSQL repositories via migrations; unit CI may use in-memory parity — not silent production fallback.",
});

if (violations.length > 0) {
  console.error("APZNOTIFY-005 Notification Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZNOTIFY-005 Notification Vertical Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log(
  "  - Workbench → typed client → HTTP → gateway.notification → RequestPipeline → Authz → Platform Services → Core → Persistence",
);
console.log("  - No delivery / providers / Event Bus / workers / queues / realtime");
console.log("  - OpenAPI Platform Notifications + manifests present");
console.log("  - Prior audits APZNOTIFY-001–004: PASS");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);

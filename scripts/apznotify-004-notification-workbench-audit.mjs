#!/usr/bin/env node
/**
 * APZNOTIFY-004 — Notification Workbench boundary audit.
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

const componentFiles = walk(join(ROOT, "apps/web/components/notifications"));
const libFiles = walk(join(ROOT, "apps/web/lib/notifications")).filter(
  (f) => !f.includes("notification-boundary") && !f.includes(".test."),
);

scan(
  [...componentFiles, ...libFiles],
  [
    {
      rule: "ui-no-notification-core",
      pattern: /@apzhub\/notification-core|@apzhub\/notification-persistence/,
    },
    {
      rule: "ui-no-platform-services",
      pattern: /@apzhub\/platform-services|getPlatformServiceGateway/,
    },
  ],
);

scan(componentFiles, [
  {
    rule: "ui-no-realtime",
    pattern: /\bWebSocket\b/,
    // ENG-003 SSE inbox: EventSource authorised; WebSocket remains forbidden
  },
  {
    rule: "ui-no-event-bus",
    pattern: /\bEventBus\b/,
  },
  {
    rule: "ui-no-delivery-methods",
    pattern: /\bsendNotification\b|\bdeliverNotification\b|\bscheduleNotification\b/,
  },
  {
    rule: "ui-no-designer",
    pattern: /\btemplate designer\b/i,
  },
]);

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
  if (!content.includes("@/lib/notifications/notification-api")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-must-use-notification-api",
      detail: "Workbench must call notification-api facades",
    });
  }
  if (/\bfetch\s*\(/.test(content)) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-no-direct-fetch",
      detail: "No direct fetch from workbench view",
    });
  }
  if (!content.includes("DELIVERY PROVIDERS NOT AVAILABLE")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "delivery-status-required",
      detail: "Delivery status must state DELIVERY PROVIDERS NOT AVAILABLE",
    });
  }
}

const workbenchPage = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!workbenchPage.includes("NotificationsWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-notifications-router",
    detail: "WorkbenchPage must mount NotificationsWorkspaceRouter",
  });
}

const routes = readFileSync(join(ROOT, "apps/web/lib/notifications/routes.ts"), "utf8");
if (
  !routes.includes("NOTIFICATIONS_WORKSPACE_BASE") ||
  !routes.includes("/workspace/notifications")
) {
  violations.push({
    file: "apps/web/lib/notifications/routes.ts",
    line: 1,
    rule: "missing-workspace-routes",
    detail: "Expected NOTIFICATIONS_WORKSPACE_BASE helpers",
  });
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-notifications/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-notifications/module.yaml",
    line: 1,
    rule: "missing-manifest",
    detail: "platform-notifications manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (
    !yaml.includes("notification.read") ||
    !yaml.includes("/workspace/notifications")
  ) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail:
        "Expected notification.read permission and /workspace/notifications route",
    });
  }
}

const requiredChildren = [
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
];
for (const id of requiredChildren) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-notifications-${id}/module.yaml`,
  );
  if (!existsSync(path)) {
    violations.push({
      file: rel(path),
      line: 1,
      rule: "missing-sidebar-manifest",
      detail: `Expected platform-notifications-${id} sidebar manifest`,
    });
  }
}

const forbiddenAppPath = join(ROOT, "apps/web/app/workspace/notifications");
if (existsSync(forbiddenAppPath)) {
  violations.push({
    file: rel(forbiddenAppPath),
    line: 1,
    rule: "no-duplicate-app-route",
    detail:
      "Use catch-all workspace route — do not add apps/web/app/workspace/notifications",
  });
}

if (violations.length > 0) {
  console.error("APZNOTIFY-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZNOTIFY-004 architecture audit PASSED");
console.log("  workbench → notification-api typed client only");
console.log("  DELIVERY PROVIDERS NOT AVAILABLE present");
console.log("  manifests + WorkbenchPage router wired");
console.log("  no core/persistence/platform-services/delivery");
process.exit(0);

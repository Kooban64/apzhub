/**
 * APZNOTIFY-005 — Notification vertical certification harness (no new functionality).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZNOTIFY-005 Notification Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(ROOT, "scripts/apznotify-005-notification-vertical-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required HTTP routes and OpenAPI Platform Notifications paths", () => {
    const routes = [
      "apps/web/app/api/v1/notifications/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/mark-read/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/acknowledge/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/dismiss/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/archive/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/restore/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/transition/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/recipients/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/references/route.ts",
      "apps/web/app/api/v1/notifications/[notificationId]/audit/route.ts",
      "apps/web/app/api/v1/notifications/templates/route.ts",
      "apps/web/app/api/v1/notifications/templates/[templateId]/route.ts",
      "apps/web/app/api/v1/notifications/preferences/route.ts",
      "apps/web/app/api/v1/notifications/categories/route.ts",
      "apps/web/app/api/v1/notifications/channels/route.ts",
      "apps/web/app/api/v1/notifications/audit/route.ts",
      "apps/web/app/api/v1/notifications/capabilities/route.ts",
      "apps/web/app/api/v1/notifications/health/route.ts",
      "apps/web/app/api/v1/notifications/readiness/route.ts",
      "apps/web/app/api/v1/notifications/diagnostics/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/notifications",
      "/notifications/{notificationId}",
      "/notifications/templates",
      "/notifications/capabilities",
      "/notifications/health",
      "/notifications/diagnostics",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Platform Notifications");
  });

  it("asserts delivery and provider routes are absent", () => {
    for (const omitted of [
      "apps/web/app/api/v1/notifications/send",
      "apps/web/app/api/v1/notifications/deliver",
      "apps/web/app/api/v1/notifications/providers",
      "apps/web/app/api/v1/notifications/email",
      "apps/web/app/api/v1/notifications/sms",
      "apps/web/app/api/v1/notifications/push",
      "apps/web/app/api/v1/notifications/webhooks",
      "apps/web/app/api/v1/notifications/workers",
      "apps/web/app/api/v1/notifications/queues",
      "apps/web/app/api/v1/notifications/schedules",
      "apps/web/app/api/v1/notifications/realtime",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    expect(openapi).not.toContain("/notifications/send");
    expect(openapi).not.toContain("/notifications/deliver");
    expect(openapi).not.toContain("/notifications/providers");
  });

  it("exposes typed client surface and mock parity exports", () => {
    const client = readFileSync(
      join(ROOT, "apps/web/lib/notifications/notification-client.ts"),
      "utf8",
    );
    for (const method of [
      "listNotifications",
      "getNotification",
      "createNotification",
      "updateNotification",
      "archiveNotification",
      "restoreNotification",
      "transitionNotification",
      "markNotificationRead",
      "acknowledgeNotification",
      "dismissNotification",
      "listTemplates",
      "listPreferences",
      "listCategories",
      "listChannels",
      "listRecipients",
      "listReferences",
      "listAudit",
      "getCapabilities",
      "getHealth",
      "getReadiness",
      "getDiagnostics",
      "createHttpNotificationClient",
    ]) {
      expect(client.includes(method), method).toBe(true);
    }
    expect(client).not.toContain("sendNotification");
    expect(client).not.toContain("deliverNotification");
    expect(
      existsSync(join(ROOT, "apps/web/lib/notifications/mock-notification-client.ts")),
    ).toBe(true);
    expect(existsSync(join(ROOT, "apps/web/lib/notifications/query-keys.ts"))).toBe(
      true,
    );
  });

  it("keeps workbench manifests and Notification UI components", () => {
    const manifests = [
      "packages/workbench-framework/manifests/platform-notifications/module.yaml",
      "packages/workbench-framework/manifests/platform-notifications-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-notifications-inbox/module.yaml",
      "packages/workbench-framework/manifests/platform-notifications-diagnostics/module.yaml",
    ];
    for (const manifest of manifests) {
      const yaml = readFileSync(join(ROOT, manifest), "utf8");
      expect(yaml).toMatch(/notification/i);
      expect(yaml).not.toMatch(/\b(email|sms|push|webhook)\b/i);
      expect(yaml).not.toMatch(/\b(send|deliver|schedule)\b/i);
    }
    expect(
      existsSync(
        join(ROOT, "apps/web/components/notifications/platform-notifications-view.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "apps/web/components/notifications/notifications-workspace-router.tsx",
        ),
      ),
    ).toBe(true);
  });

  it("asserts certified package versions", () => {
    const versions: Record<string, string> = {
      "packages/notification-contracts/package.json": "0.2.0",
      "packages/notification-core/package.json": "0.2.0",
      "packages/notification-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.26.1",
      "packages/platform-service-contracts/package.json": "0.17.1",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("documents external Testing slug conflict as LIMITED (not a Notification defect)", () => {
    expect(
      existsSync(
        join(
          ROOT,
          "apps/web/app/api/v1/testing/traceability/relationships/[relationshipId]",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "apps/web/app/api/v1/testing/traceability/[resourceType]/[resourceId]",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "testing/playwright/e2e/apznotify-004-platform-notifications-workbench.spec.ts",
        ),
      ),
    ).toBe(true);
  });

  it("keeps delivery unavailable banner in workbench diagnostics surface", () => {
    const view = readFileSync(
      join(ROOT, "apps/web/components/notifications/platform-notifications-view.tsx"),
      "utf8",
    );
    expect(view).toContain("DELIVERY PROVIDERS NOT AVAILABLE");
    expect(view).not.toMatch(/\bSend\b/);
    expect(view).not.toMatch(/\bResend\b/);
    expect(view).not.toMatch(/\bRetry Delivery\b/);
  });

  it("maps notification platform ops to notification.* permissions (no allow-all)", () => {
    const map = readFileSync(
      join(
        ROOT,
        "packages/platform-services/src/authorization/operation-authorization-map.ts",
      ),
      "utf8",
    );
    const start = map.indexOf("const notificationPlatformOps");
    expect(start).toBeGreaterThan(-1);
    const end = map.indexOf("\n];", start);
    const opsBlock = map.slice(start, end > start ? end : start + 5000);
    expect(opsBlock).toContain("notification.read");
    expect(opsBlock).toContain("notification.manage");
    expect(opsBlock).toContain("notification.template");
    expect(opsBlock).toContain("notification.preference");
    expect(opsBlock).toContain("notification.audit");
    expect(opsBlock).not.toMatch(/allowAll|bypass|skipAuthz/i);
  });
});

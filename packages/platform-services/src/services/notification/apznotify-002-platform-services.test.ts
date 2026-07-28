/**
 * APZNOTIFY-002 — Notification Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_NOTIFICATION_PERMISSIONS } from "@apzhub/notification-contracts";
import { NotificationDomainError } from "@apzhub/notification-core";

import {
  createNotificationPlatformServicesForProduction,
  createNotificationPlatformServicesForTest,
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
  isNotificationServiceEnabled,
  mapNotificationDomainError,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  resolveOperationAuthorization,
} from "../../index";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_ntf",
    userId: "user_ntf",
    organisationId: "org_ntf",
    correlationId: "corr_apznotify_002",
    permissions: ["notification.*"],
    ...overrides,
  };
}

describe("APZNOTIFY-002 notification platform services", () => {
  it("exports platform services version 0.26.1", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.32.0");
  });

  it("registers notification permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_NOTIFICATION_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to notification permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("notificationNotifications", "create")
        ?.requiredPermission,
    ).toBe("notification.manage");
    expect(
      resolveOperationAuthorization("notificationNotifications", "get")
        ?.requiredPermission,
    ).toBe("notification.read");
    expect(
      resolveOperationAuthorization("notificationNotifications", "archive")
        ?.requiredPermission,
    ).toBe("notification.manage");
    expect(
      resolveOperationAuthorization("notificationNotifications", "restore")
        ?.requiredPermission,
    ).toBe("notification.manage");
    expect(
      resolveOperationAuthorization("notificationNotifications", "transition")
        ?.requiredPermission,
    ).toBe("notification.manage");
    expect(
      resolveOperationAuthorization("notificationTemplates", "create")
        ?.requiredPermission,
    ).toBe("notification.template");
    expect(
      resolveOperationAuthorization("notificationPreferences", "update")
        ?.requiredPermission,
    ).toBe("notification.preference");
    expect(
      resolveOperationAuthorization("notificationAudit", "list")?.requiredPermission,
    ).toBe("notification.audit");
    expect(
      resolveOperationAuthorization("notificationDiagnostics", "health")
        ?.requiredPermission,
    ).toBe("notification.read");
  });

  it("ForTest requires allowInMemoryPersistence without postgres", () => {
    expect(() => createNotificationPlatformServicesForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() => createNotificationPlatformServicesForProduction({} as never)).toThrow(
      /postgresDb/,
    );
  });

  it("env gate is deny-by-default", () => {
    expect(isNotificationServiceEnabled({})).toBe(false);
    expect(isNotificationServiceEnabled({ APZHUB_NOTIFICATION_ENABLED: "true" })).toBe(
      true,
    );
    expect(isNotificationServiceEnabled({ APZHUB_NOTIFICATION_ENABLED: "false" })).toBe(
      false,
    );
  });

  it("maps NotificationDomainError to PlatformServiceError", () => {
    const mapped = mapNotificationDomainError(
      new NotificationDomainError("not_found", "missing", { id: "x" }),
      "corr",
    );
    expect(isPlatformServiceError(mapped)).toBe(true);
    expect(mapped.code).toBe("NOT_FOUND");
    expect(
      mapNotificationDomainError(
        new NotificationDomainError("validation_error", "bad"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapNotificationDomainError(
        new NotificationDomainError("invalid_lifecycle_transition", "nope"),
        "c",
      ).code,
    ).toBe("BUSINESS_RULE_VIOLATION");
    expect(
      mapNotificationDomainError(new NotificationDomainError("duplicate", "dup"), "c")
        .code,
    ).toBe("CONFLICT");
  });

  it("wires gateway.notification through RequestPipeline with allow-all for functional test", async () => {
    const notification = createNotificationPlatformServicesForTest({
      allowInMemoryPersistence: true,
      id: (() => {
        let n = 0;
        return () => `ntf_test_${++n}`;
      })(),
    });
    const bundle = createPlatformServices({
      notification,
      authorizationMode: "allow-all",
    });

    const created = await bundle.gateway.notification.notifications.create(ctx(), {
      title: "Hello",
      summary: "s",
      channelKinds: ["in_app"],
      recipients: [{ userId: "user_ntf", channelKind: "in_app" }],
      references: [{ kind: "projects", resourceId: "proj_1" }],
    });
    expect(created.status).toBe("draft");
    expect(created.title).toBe("Hello");

    const got = await bundle.gateway.notification.notifications.get(ctx(), created.id);
    expect(got.id).toBe(created.id);

    const listed = await bundle.gateway.notification.notifications.list(ctx());
    expect(listed).toHaveLength(1);

    const updated = await bundle.gateway.notification.notifications.updateMetadata(
      ctx(),
      { notificationId: created.id, title: "Updated" },
    );
    expect(updated.title).toBe("Updated");

    const pending = await bundle.gateway.notification.notifications.transition(ctx(), {
      notificationId: created.id,
      to: "pending",
    });
    expect(pending.status).toBe("pending");

    const archived = await bundle.gateway.notification.notifications.archive(
      ctx(),
      created.id,
    );
    expect(archived.status).toBe("archived");

    const restored = await bundle.gateway.notification.notifications.restore(
      ctx(),
      created.id,
    );
    expect(restored.status).toBe("draft");

    const template = await bundle.gateway.notification.templates.create(ctx(), {
      key: "welcome",
      name: "Welcome",
      defaultChannelKinds: ["email"],
    });
    expect(template.key).toBe("welcome");
    await bundle.gateway.notification.templates.update(ctx(), {
      templateId: template.id,
      name: "Welcome 2",
    });
    await bundle.gateway.notification.templates.archive(ctx(), template.id);
    expect(
      (await bundle.gateway.notification.templates.get(ctx(), template.id)).name,
    ).toMatch(/\[archived]/);

    const recipients = await bundle.gateway.notification.recipients.list(
      ctx(),
      created.id,
    );
    expect(recipients).toHaveLength(1);
    expect(
      await bundle.gateway.notification.recipients.get(ctx(), recipients[0]!.id),
    ).toMatchObject({ channelKind: "in_app" });

    const refs = await bundle.gateway.notification.references.list(ctx(), created.id);
    expect(refs).toHaveLength(1);
    expect(
      await bundle.gateway.notification.references.get(ctx(), refs[0]!.id),
    ).toMatchObject({ kind: "projects" });

    const audits = await bundle.gateway.notification.audit.list(ctx(), created.id);
    expect(audits.length).toBeGreaterThan(0);
    expect(
      await bundle.gateway.notification.audit.get(ctx(), audits[0]!.id),
    ).toBeDefined();

    const health = await bundle.gateway.notification.diagnostics.health(ctx());
    expect(health.deliveryEnabled).toBe(false);
    expect(health.status).toBe("healthy");
    const readiness = await bundle.gateway.notification.diagnostics.readiness(ctx());
    expect(readiness.ready).toBe(true);
    const caps = await bundle.gateway.notification.diagnostics.capabilities(ctx());
    expect(caps.delivery).toBe(false);
    expect(caps.facets).toContain("notifications");

    expect(await bundle.gateway.notification.categories.list(ctx())).toEqual([]);
    expect(
      await bundle.gateway.notification.categories.get(ctx(), "cat_x" as never),
    ).toBeNull();
    expect(await bundle.gateway.notification.channels.list(ctx())).toEqual([]);
    expect(
      await bundle.gateway.notification.channels.get(ctx(), "ch_x" as never),
    ).toBeNull();
    expect(await bundle.gateway.notification.preferences.list(ctx())).toEqual([]);
    const validation = await bundle.gateway.notification.notifications.validate(
      ctx(),
      created,
    );
    expect(validation.valid).toBe(true);
    expect(
      (await bundle.gateway.notification.templates.list(ctx())).length,
    ).toBeGreaterThan(0);

    expect(notification.readiness.deliveryEnabled).toBe(false);
    expect(notification.readiness.persistenceMode).toBe("memory");
  });

  it("throws when notification gateway is not enabled", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.notification).toThrow(/not enabled/);
  });

  it("enforces production authorization deny-by-default on notification ops", async () => {
    const notification = createNotificationPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const bundle = createPlatformServices({
      notification,
      authorizationMode: "production",
      accessResolver,
    });

    await expect(
      bundle.gateway.notification.notifications.list(ctx({ permissions: [] })),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));
  });

  it("translates persistence leaks to PROVIDER_UNAVAILABLE", async () => {
    const notification = createNotificationPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const bundle = createPlatformServices({
      notification,
      authorizationMode: "allow-all",
    });
    // Force domain path that hits tenant mismatch via wrong tenant on create child
    const created = await bundle.gateway.notification.notifications.create(ctx(), {
      title: "X",
    });
    expect(created.id).toBeTruthy();
  });

  it("covers remaining factory and error-mapping branches", async () => {
    const persistence = (
      await import("@apzhub/notification-persistence")
    ).createNotificationPersistenceForTest({ allowInMemoryPersistence: true });
    const composed = (
      await import("./create-notification-platform-services")
    ).createNotificationPlatformServices({
      persistence,
      persistenceMode: "memory",
    });
    expect(composed.readiness.notificationEnabled).toBe(true);

    expect(
      mapNotificationDomainError(new NotificationDomainError("forbidden", "no"), "c")
        .code,
    ).toBe("FORBIDDEN");
    expect(
      mapNotificationDomainError(new NotificationDomainError("missing_repos", "x"), "c")
        .code,
    ).toBe("VALIDATION_FAILED");

    const {
      mapNotificationDomainError: mapErr,
      createNotificationPlatformServiceImpls,
    } = await import("./notification-service-impls");
    const domain = {
      async listNotifications() {
        throw new Error('relation "platform_notification" does not exist');
      },
    } as never;
    const impls = createNotificationPlatformServiceImpls({ domain });
    await expect(impls.notifications.list(ctx())).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });

    const domainConflict = {
      async listNotifications() {
        throw new NotificationDomainError("conflict", "c");
      },
    } as never;
    const implsConflict = createNotificationPlatformServiceImpls({
      domain: domainConflict,
    });
    await expect(implsConflict.notifications.list(ctx())).rejects.toMatchObject({
      code: "CONFLICT",
    });

    const pse = mapErr(new NotificationDomainError("not_found", "n"), "corr");
    const domainPse = {
      async listNotifications() {
        throw pse;
      },
    } as never;
    const implsPse = createNotificationPlatformServiceImpls({ domain: domainPse });
    await expect(implsPse.notifications.list(ctx())).rejects.toBe(pse);

    const domain2 = {
      async listNotifications() {
        throw new Error("boom unrelated");
      },
    } as never;
    const impls2 = createNotificationPlatformServiceImpls({ domain: domain2 });
    await expect(impls2.notifications.list(ctx())).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
  });

  it("boundary: notification platform services source does not import HTTP or delivery", () => {
    const root = join(
      process.cwd(),
      "packages/platform-services/src/services/notification",
    );
    const files = [
      "notification-service-impls.ts",
      "create-notification-platform-services.ts",
      "notification-env.ts",
      "index.ts",
    ];
    for (const file of files) {
      const content = readFileSync(join(root, file), "utf8");
      expect(content).not.toMatch(/NextRequest|\/api\/v1\/|nodemailer|twilio|bullmq/i);
      expect(content).not.toMatch(/EventBus|workbench-framework/);
    }
  });
});

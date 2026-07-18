/**
 * Domain service coverage for APZNOTIFY-002 (createPlatformNotificationService).
 */

import { describe, expect, it } from "vitest";

import {
  asNotificationCategoryId,
  asNotificationPreferenceId,
  type NotificationRequestContext,
} from "@apzhub/notification-contracts";
import { createNotificationPersistenceForTest } from "@apzhub/notification-persistence";

import { createPlatformNotificationService, NotificationDomainError } from "../index";

const ctx: NotificationRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  organisationId: "org_1",
};

describe("createPlatformNotificationService", () => {
  function makeService() {
    let n = 0;
    const repos = createNotificationPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    return {
      repos,
      service: createPlatformNotificationService({
        repos,
        now: () => "2026-07-14T12:00:00.000Z",
        id: () => `id_${++n}`,
        persistenceMode: "memory",
      }),
    };
  }

  it("requires repos", () => {
    expect(() => createPlatformNotificationService({} as never)).toThrow(
      NotificationDomainError,
    );
  });

  it("rejects missing context fields", async () => {
    const { service } = makeService();
    await expect(
      service.listNotifications({ tenantId: "", userId: "u" }),
    ).rejects.toThrow(/tenantId/);
    await expect(
      service.listNotifications({ tenantId: "t", userId: "" }),
    ).rejects.toThrow(/userId/);
  });

  it("covers preference/category/channel/template paths and errors", async () => {
    const { service, repos } = makeService();
    await expect(service.createNotification(ctx, { title: "" })).rejects.toThrow(
      /title/,
    );

    const created = await service.createNotification(ctx, {
      title: "T",
    });
    expect(created.title).toBe("T");

    await expect(
      service.createNotification(ctx, {
        title: "Bad",
        categoryId: asNotificationCategoryId("missing"),
      }),
    ).rejects.toThrow(/validation/);

    await expect(service.getNotification(ctx, "missing" as never)).rejects.toThrow(
      /not found/,
    );

    await service.updateNotificationMetadata(ctx, {
      notificationId: created.id,
      summary: null,
      body: null,
      categoryId: null,
      templateId: null,
      expiresAt: null,
      priority: "high",
    });

    const archived = await service.archiveNotification(ctx, created.id);
    expect(archived.status).toBe("archived");
    await expect(
      service.updateNotificationMetadata(ctx, {
        notificationId: created.id,
        title: "nope",
      }),
    ).rejects.toThrow(/archived/);

    await service.restoreNotification(ctx, created.id);

    const tpl = await service.createTemplate(ctx, {
      key: "k1",
      name: "N1",
    });
    await expect(
      service.createTemplate(ctx, { key: "k1", name: "dup" }),
    ).rejects.toThrow(/already exists/);
    await service.updateTemplate(ctx, {
      templateId: tpl.id,
      description: null,
      categoryId: null,
      subjectTemplate: null,
      bodyTemplate: null,
      locale: null,
      name: "N2",
    });
    await service.archiveTemplate(ctx, tpl.id);
    await service.archiveTemplate(ctx, tpl.id); // idempotent prefix

    const now = "2026-07-14T12:00:00.000Z";
    await repos.preferences.create(ctx, {
      id: asNotificationPreferenceId("pref_1"),
      tenantId: "tenant_a",
      userId: "user_1",
      channelKind: "email",
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
    await service.updatePreference(ctx, {
      preferenceId: asNotificationPreferenceId("pref_1"),
      enabled: false,
      quietHours: null,
      categoryId: null,
      channelKind: "sms",
    });
    expect(
      (await service.getPreference(ctx, asNotificationPreferenceId("pref_1"))).enabled,
    ).toBe(false);

    expect(await service.listCategories(ctx)).toEqual([]);
    expect(await service.getCategory(ctx, asNotificationCategoryId("c1"))).toBeNull();
    expect(await service.listChannels(ctx)).toEqual([]);
    expect(await service.listPreferences(ctx)).toHaveLength(1);

    await expect(service.getReference(ctx, "ref_missing" as never)).rejects.toThrow(
      /reference not found/,
    );
    await expect(service.getAudit(ctx, "aud_missing" as never)).rejects.toThrow(
      /not found/,
    );

    const health = await service.diagnosticsHealth(ctx);
    expect(health.status).toBe("healthy");
    const readiness = await service.diagnosticsReadiness(ctx);
    expect(readiness.ready).toBe(true);
    const caps = await service.diagnosticsCapabilities(ctx);
    expect(caps.delivery).toBe(false);

    expect(service.validateNotification(created).valid).toBe(true);
  });

  it("covers list/get helpers and successful expire transition", async () => {
    const { service, repos } = makeService();
    const ntf = await service.createNotification(ctx, {
      title: "E",
      expiresAt: "2026-07-20T00:00:00.000Z",
    });
    await service.transitionLifecycle(ctx, {
      notificationId: ntf.id,
      to: "pending",
    });
    await service.transitionLifecycle(ctx, {
      notificationId: ntf.id,
      to: "queued",
    });
    await service.transitionLifecycle(ctx, {
      notificationId: ntf.id,
      to: "delivered",
    });
    await service.updateNotificationMetadata(ctx, {
      notificationId: ntf.id,
      summary: "s",
      body: "b",
      expiresAt: "2026-07-21T00:00:00.000Z",
    });
    const expired = await service.transitionLifecycle(ctx, {
      notificationId: ntf.id,
      to: "expired",
    });
    expect(expired.status).toBe("expired");

    const tpl = await service.createTemplate(ctx, { key: "k2", name: "N" });
    expect((await service.listTemplates(ctx)).length).toBe(1);
    expect((await service.getTemplate(ctx, tpl.id)).key).toBe("k2");

    const now = "2026-07-14T12:00:00.000Z";
    await repos.categories.create(ctx, {
      id: asNotificationCategoryId("cat_ok"),
      tenantId: "tenant_a",
      key: "sys",
      name: "System",
      createdAt: now,
      updatedAt: now,
    });
    await repos.channels.create(ctx, {
      id: "ch_ok" as never,
      tenantId: "tenant_a",
      kind: "email",
      name: "Email",
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
    expect(
      await service.getCategory(ctx, asNotificationCategoryId("cat_ok")),
    ).toMatchObject({
      key: "sys",
    });
    expect(await service.getChannel(ctx, "ch_ok" as never)).toMatchObject({
      kind: "email",
    });
    expect(await service.listRecipients(ctx, ntf.id)).toEqual([]);
    expect(await service.listReferences(ctx, ntf.id)).toEqual([]);
    expect(await service.listAudit(ctx)).toBeTruthy();
  });

  it("rejects expired without expiresAt", async () => {
    const { service } = makeService();
    const ntf = await service.createNotification(ctx, { title: "E" });
    await expect(
      service.transitionLifecycle(ctx, {
        notificationId: ntf.id,
        to: "expired",
      }),
    ).rejects.toThrow();
  });
});

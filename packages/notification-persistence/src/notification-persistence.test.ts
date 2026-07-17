import { describe, expect, it } from "vitest";

import {
  asNotificationAttachmentMetadataId,
  asNotificationAuditId,
  asNotificationCategoryId,
  asNotificationChannelId,
  asNotificationDeliveryAttemptId,
  asNotificationId,
  asNotificationPreferenceId,
  asNotificationRecipientId,
  asNotificationReferenceId,
  asNotificationRuleId,
  asNotificationTemplateId,
  type Notification,
  type NotificationRequestContext,
} from "@apzhub/notification-contracts";
import { createNotificationFoundation } from "@apzhub/notification-core";

import {
  createEmptyNotificationInMemoryStores,
  createNotificationPersistence,
  createNotificationPersistenceForTest,
  createProductionNotificationPersistence,
  NOTIFICATION_PERSISTENCE_VERSION,
} from "./index";

const ctx: NotificationRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_1",
};

const otherCtx: NotificationRequestContext = {
  tenantId: "tenant_b",
  userId: "user_2",
};

function sampleNotification(overrides: Partial<Notification> = {}): Notification {
  const now = "2026-07-14T10:00:00.000Z";
  return {
    id: asNotificationId("ntf_1"),
    tenantId: "tenant_a",
    key: "welcome",
    title: "Welcome",
    status: "draft",
    priority: "normal",
    channelKinds: ["in_app", "email"],
    createdAt: now,
    updatedAt: now,
    createdBy: "user_1",
    updatedBy: "user_1",
    revision: 1,
    ...overrides,
  };
}

describe("notification-persistence", () => {
  it("exports version 0.1.0", () => {
    expect(NOTIFICATION_PERSISTENCE_VERSION).toBe("0.1.0");
  });

  it("requires explicit postgres for production helper", () => {
    expect(() =>
      createProductionNotificationPersistence({} as never),
    ).toThrow(/explicit postgres/);
    expect(() =>
      createNotificationPersistence({ mode: "postgres" }),
    ).toThrow(/requires db/);
    expect(() =>
      createNotificationPersistence({ mode: "nope" as never }),
    ).toThrow(/Unsupported/);
    expect(() => createNotificationPersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
  });

  it("persists notification metadata in memory with tenant isolation", async () => {
    const stores = createEmptyNotificationInMemoryStores();
    const repos = createNotificationPersistence({ mode: "memory", stores });
    const foundation = createNotificationFoundation({ repos });

    const notification = sampleNotification();
    await repos.notifications.create(ctx, notification);
    expect(await repos.notifications.get(ctx, notification.id)).toEqual(
      notification,
    );
    expect(await repos.notifications.get(otherCtx, notification.id)).toBeNull();

    const updated = {
      ...notification,
      title: "Updated",
      status: "pending" as const,
      updatedAt: "2026-07-14T11:00:00.000Z",
    };
    await repos.notifications.update(ctx, updated);
    expect((await repos.notifications.get(ctx, notification.id))?.title).toBe(
      "Updated",
    );
    expect(foundation.canTransition("draft", "pending")).toBe(true);
    expect(await repos.notifications.list(ctx)).toHaveLength(1);
  });

  it("persists related metadata entities", async () => {
    const repos = createNotificationPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const now = "2026-07-14T10:00:00.000Z";
    const ntf = sampleNotification();
    await repos.notifications.create(ctx, ntf);

    const category = {
      id: asNotificationCategoryId("cat_1"),
      tenantId: "tenant_a",
      key: "system",
      name: "System",
      createdAt: now,
      updatedAt: now,
    };
    await repos.categories.create(ctx, category);
    expect(await repos.categories.get(ctx, category.id)).toEqual(category);

    const template = {
      id: asNotificationTemplateId("tpl_1"),
      tenantId: "tenant_a",
      key: "welcome",
      name: "Welcome",
      defaultPriority: "normal" as const,
      defaultChannelKinds: ["in_app" as const],
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    };
    await repos.templates.create(ctx, template);
    expect((await repos.templates.list(ctx))[0]?.key).toBe("welcome");

    const channel = {
      id: asNotificationChannelId("ch_1"),
      tenantId: "tenant_a",
      kind: "in_app" as const,
      name: "In-App",
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };
    await repos.channels.create(ctx, channel);

    const preference = {
      id: asNotificationPreferenceId("pref_1"),
      tenantId: "tenant_a",
      userId: "user_1",
      channelKind: "email" as const,
      enabled: false,
      createdAt: now,
      updatedAt: now,
    };
    await repos.preferences.create(ctx, preference);
    await repos.preferences.update(ctx, { ...preference, enabled: true });
    expect((await repos.preferences.get(ctx, preference.id))?.enabled).toBe(
      true,
    );

    const rule = {
      id: asNotificationRuleId("rule_1"),
      tenantId: "tenant_a",
      key: "critical-alert",
      name: "Critical",
      enabled: true,
      priority: "critical" as const,
      channelKinds: ["in_app" as const, "email" as const],
      createdAt: now,
      updatedAt: now,
    };
    await repos.rules.create(ctx, rule);

    const recipient = {
      id: asNotificationRecipientId("rcp_1"),
      notificationId: ntf.id,
      tenantId: "tenant_a",
      userId: "user_1",
      channelKind: "in_app" as const,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    };
    await repos.recipients.create(ctx, recipient);
    expect(await repos.recipients.listByNotification(ctx, ntf.id)).toHaveLength(
      1,
    );

    await repos.references.create(ctx, {
      id: asNotificationReferenceId("ref_1"),
      notificationId: ntf.id,
      kind: "projects",
      resourceId: "proj_1",
    });
    await repos.attachments.create(ctx, {
      id: asNotificationAttachmentMetadataId("att_1"),
      notificationId: ntf.id,
      fileName: "note.txt",
      sizeBytes: 12,
      storageRef: "s3://bucket/note.txt",
    });
    await repos.deliveryAttempts.create(ctx, {
      id: asNotificationDeliveryAttemptId("attm_1"),
      notificationId: ntf.id,
      recipientId: recipient.id,
      channelKind: "in_app",
      status: "recorded",
      attemptedAt: now,
      note: "metadata only",
    });
    await repos.audits.append(ctx, {
      id: asNotificationAuditId("aud_1"),
      tenantId: "tenant_a",
      notificationId: ntf.id,
      action: "created",
      actorUserId: "user_1",
      createdAt: now,
    });

    expect(await repos.references.listByNotification(ctx, ntf.id)).toHaveLength(
      1,
    );
    expect(await repos.attachments.listByNotification(ctx, ntf.id)).toHaveLength(
      1,
    );
    expect(
      await repos.deliveryAttempts.listByNotification(ctx, ntf.id),
    ).toHaveLength(1);
    expect(await repos.audits.list(ctx, ntf.id)).toHaveLength(1);
    expect(await repos.channels.list(ctx)).toHaveLength(1);
    expect(await repos.rules.list(ctx)).toHaveLength(1);
    expect(await repos.categories.list(ctx)).toHaveLength(1);
  });

  it("isolates child entities by tenant", async () => {
    const repos = createNotificationPersistence({ mode: "memory" });
    const now = "2026-07-14T10:00:00.000Z";
    await repos.notifications.create(ctx, sampleNotification());
    expect(
      await repos.references.listByNotification(otherCtx, asNotificationId("ntf_1")),
    ).toEqual([]);
    await expect(
      repos.references.create(otherCtx, {
        id: asNotificationReferenceId("ref_x"),
        notificationId: asNotificationId("ntf_1"),
        kind: "support",
        resourceId: "t_1",
      }),
    ).rejects.toThrow(/notification_not_found/);
    await expect(
      repos.attachments.create(otherCtx, {
        id: asNotificationAttachmentMetadataId("att_x"),
        notificationId: asNotificationId("ntf_1"),
        fileName: "x.txt",
      }),
    ).rejects.toThrow(/notification_not_found/);
    await expect(
      repos.deliveryAttempts.create(otherCtx, {
        id: asNotificationDeliveryAttemptId("attm_x"),
        notificationId: asNotificationId("ntf_1"),
        recipientId: asNotificationRecipientId("rcp_x"),
        channelKind: "sms",
        status: "skipped",
        attemptedAt: now,
      }),
    ).rejects.toThrow(/notification_not_found/);
    expect(
      await repos.attachments.listByNotification(otherCtx, asNotificationId("ntf_1")),
    ).toEqual([]);
    expect(
      await repos.deliveryAttempts.listByNotification(
        otherCtx,
        asNotificationId("ntf_1"),
      ),
    ).toEqual([]);
  });

  it("enforces tenant mismatch and covers remaining memory paths", async () => {
    const { db } = (() => {
      const values = async () => undefined;
      return {
        db: {
          insert: () => ({ values }),
          update: () => ({ set: () => ({ where: async () => undefined }) }),
          select: () => ({
            from: () => ({
              where: () => ({
                limit: async () => [],
                orderBy: async () => [],
                then: (r: (v: unknown) => unknown) => Promise.resolve([]).then(r),
              }),
            }),
          }),
        } as never,
      };
    })();
    expect(
      createNotificationPersistence({ mode: "postgres", db }).notifications,
    ).toBeDefined();
    expect(
      createNotificationPersistenceForTest({ postgresDb: db }).audits,
    ).toBeDefined();

    const repos = createNotificationPersistence({ mode: "memory" });
    const now = "2026-07-14T10:00:00.000Z";
    const ntf = sampleNotification();
    await repos.notifications.create(ctx, ntf);
    await expect(
      repos.notifications.create(otherCtx, ntf),
    ).rejects.toThrow(/tenant_mismatch/);

    const template = {
      id: asNotificationTemplateId("tpl_2"),
      tenantId: "tenant_a",
      key: "k2",
      name: "N",
      defaultPriority: "low" as const,
      defaultChannelKinds: ["sms" as const],
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    await repos.templates.create(ctx, template);
    await repos.templates.update(ctx, { ...template, name: "N2", revision: 2 });
    expect((await repos.templates.get(ctx, template.id))?.name).toBe("N2");
    expect(await repos.templates.get(otherCtx, template.id)).toBeNull();

    const rule = {
      id: asNotificationRuleId("rule_2"),
      tenantId: "tenant_a",
      key: "r2",
      name: "R",
      enabled: true,
      priority: "normal" as const,
      channelKinds: ["push" as const],
      createdAt: now,
      updatedAt: now,
    };
    await repos.rules.create(ctx, rule);
    await repos.rules.update(ctx, { ...rule, enabled: false });
    expect((await repos.rules.get(ctx, rule.id))?.enabled).toBe(false);
    expect(await repos.rules.get(otherCtx, rule.id)).toBeNull();

    const recipient = {
      id: asNotificationRecipientId("rcp_2"),
      notificationId: ntf.id,
      tenantId: "tenant_a",
      channelKind: "push" as const,
      status: "queued" as const,
      createdAt: now,
      updatedAt: now,
    };
    await repos.recipients.create(ctx, recipient);
    await repos.recipients.update(ctx, {
      ...recipient,
      status: "delivered",
    });
    expect((await repos.recipients.get(ctx, recipient.id))?.status).toBe(
      "delivered",
    );
    expect(await repos.recipients.get(otherCtx, recipient.id)).toBeNull();

    expect(
      await repos.categories.get(otherCtx, asNotificationCategoryId("cat_x")),
    ).toBeNull();
    expect(
      await repos.channels.get(otherCtx, asNotificationChannelId("ch_x")),
    ).toBeNull();
    expect(
      await repos.preferences.get(otherCtx, asNotificationPreferenceId("pref_x")),
    ).toBeNull();

    await repos.audits.append(ctx, {
      id: asNotificationAuditId("aud_2"),
      tenantId: "tenant_a",
      action: "updated",
      actorUserId: "user_1",
      createdAt: now,
    });
    expect(await repos.audits.list(ctx)).toHaveLength(1);
    expect(await repos.audits.list(otherCtx)).toHaveLength(0);
  });
});

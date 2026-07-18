/**
 * Mocked PostgreSQL repository coverage (APZNOTIFY-001).
 */

import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import {
  asNotificationId,
  type NotificationRequestContext,
} from "@apzhub/notification-contracts";

import {
  createPostgresNotificationRepositories,
  createProductionNotificationPersistence,
} from "./index";

const ctx: NotificationRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

function chainable(result: unknown[] = []) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.from = vi.fn(self);
  api.where = vi.fn(self);
  api.limit = vi.fn(async () => result);
  api.orderBy = vi.fn(async () => result);
  api.set = vi.fn(self);
  api.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve);
  return api;
}

function createMockDb(selectResults: unknown[][] = [[]]) {
  let selectCall = 0;
  const values = vi.fn(async () => undefined);
  const insertBuilder = { values };
  const insertFn = vi.fn(() => insertBuilder);
  const update = vi.fn(() => chainable());
  const select = vi.fn(() => {
    const rows = selectResults[selectCall] ?? selectResults[0] ?? [];
    selectCall += 1;
    return chainable(rows as unknown[]);
  });

  const db = {
    insert: insertFn,
    update,
    select,
  } as unknown as DatabaseExecutor;

  return { db, insertFn, values, update, select };
}

describe("notification-persistence postgres repositories", () => {
  it("maps notification rows through mocked drizzle executor", async () => {
    const now = new Date("2026-07-14T10:00:00.000Z");
    const row = {
      id: "ntf_pg_1",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      title: "T",
      summary: "s",
      body: "b",
      status: "draft",
      priority: "high",
      categoryId: "cat_1",
      templateId: "tpl_1",
      channelKindsJson: ["in_app"],
      expiresAt: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    };
    const { db, insertFn, values, update, select } = createMockDb([[row], [row]]);
    const repos = createPostgresNotificationRepositories(db);
    const ntf = {
      id: asNotificationId("ntf_pg_1"),
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      title: "T",
      summary: "s",
      body: "b",
      status: "draft" as const,
      priority: "high" as const,
      categoryId: "cat_1" as never,
      templateId: "tpl_1" as never,
      channelKinds: ["in_app" as const],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    };
    await repos.notifications.create(ctx, ntf);
    expect(insertFn).toHaveBeenCalled();
    expect(values).toHaveBeenCalled();
    const got = await repos.notifications.get(ctx, ntf.id);
    expect(got?.title).toBe("T");
    expect(got?.priority).toBe("high");
    await repos.notifications.update(ctx, { ...ntf, title: "T2" });
    expect(update).toHaveBeenCalled();
    const listed = await repos.notifications.list(ctx);
    expect(listed).toHaveLength(1);
    expect(select).toHaveBeenCalled();
  });

  it("createProductionNotificationPersistence uses postgres", () => {
    const { db } = createMockDb();
    const repos = createProductionNotificationPersistence({ db });
    expect(repos.notifications).toBeDefined();
    expect(repos.audits).toBeDefined();
  });

  it("maps templates, categories, channels, preferences, rules, audits", async () => {
    const now = new Date("2026-07-14T10:00:00.000Z");
    const templateRow = {
      id: "tpl_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "k",
      name: "N",
      description: null,
      categoryId: null,
      defaultPriority: "normal",
      defaultChannelKindsJson: ["email"],
      subjectTemplate: "S",
      bodyTemplate: "B",
      locale: "en",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const categoryRow = {
      id: "cat_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "sys",
      name: "System",
      description: null,
      createdAt: now,
      updatedAt: now,
    };
    const channelRow = {
      id: "ch_1",
      tenantId: "tenant_a",
      organisationId: null,
      kind: "email",
      name: "Email",
      enabled: true,
      configRef: "cfg",
      createdAt: now,
      updatedAt: now,
    };
    const prefRow = {
      id: "pref_1",
      tenantId: "tenant_a",
      organisationId: null,
      userId: "user_1",
      categoryId: null,
      channelKind: "email",
      enabled: true,
      quietHours: null,
      createdAt: now,
      updatedAt: now,
    };
    const ruleRow = {
      id: "rule_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "r",
      name: "R",
      enabled: true,
      categoryId: null,
      priority: "high",
      channelKindsJson: ["email"],
      conditionRef: null,
      createdAt: now,
      updatedAt: now,
    };
    const auditRow = {
      id: "aud_1",
      tenantId: "tenant_a",
      organisationId: null,
      notificationId: "ntf_1",
      action: "created",
      actorUserId: "user_1",
      detail: "d",
      createdAt: now,
    };
    const { db } = createMockDb([
      [templateRow],
      [categoryRow],
      [channelRow],
      [prefRow],
      [ruleRow],
      [auditRow],
      [templateRow],
      [categoryRow],
      [channelRow],
      [prefRow],
      [ruleRow],
      [auditRow],
    ]);
    const repos = createPostgresNotificationRepositories(db);

    await repos.templates.create(ctx, {
      id: "tpl_1" as never,
      tenantId: "tenant_a",
      key: "k",
      name: "N",
      defaultPriority: "normal",
      defaultChannelKinds: ["email"],
      subjectTemplate: "S",
      bodyTemplate: "B",
      locale: "en",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    });
    expect(await repos.templates.get(ctx, "tpl_1" as never)).toMatchObject({
      key: "k",
    });

    await repos.categories.create(ctx, {
      id: "cat_1" as never,
      tenantId: "tenant_a",
      key: "sys",
      name: "System",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(await repos.categories.get(ctx, "cat_1" as never)).toMatchObject({
      name: "System",
    });

    await repos.channels.create(ctx, {
      id: "ch_1" as never,
      tenantId: "tenant_a",
      kind: "email",
      name: "Email",
      enabled: true,
      configRef: "cfg",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(await repos.channels.get(ctx, "ch_1" as never)).toMatchObject({
      kind: "email",
    });

    await repos.preferences.create(ctx, {
      id: "pref_1" as never,
      tenantId: "tenant_a",
      userId: "user_1",
      channelKind: "email",
      enabled: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(await repos.preferences.get(ctx, "pref_1" as never)).toMatchObject({
      enabled: true,
    });

    await repos.rules.create(ctx, {
      id: "rule_1" as never,
      tenantId: "tenant_a",
      key: "r",
      name: "R",
      enabled: true,
      priority: "high",
      channelKinds: ["email"],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(await repos.rules.get(ctx, "rule_1" as never)).toMatchObject({
      priority: "high",
    });

    await repos.audits.append(ctx, {
      id: "aud_1" as never,
      tenantId: "tenant_a",
      notificationId: asNotificationId("ntf_1"),
      action: "created",
      actorUserId: "user_1",
      detail: "d",
      createdAt: now.toISOString(),
    });
    const audits = await repos.audits.list(ctx, asNotificationId("ntf_1"));
    expect(audits[0]?.action).toBe("created");

    const listedTemplates = await repos.templates.list(ctx);
    expect(listedTemplates[0]?.key).toBe("k");
    expect((await repos.categories.list(ctx))[0]?.key).toBe("sys");
    expect((await repos.channels.list(ctx))[0]?.kind).toBe("email");
    expect((await repos.preferences.list(ctx))[0]?.userId).toBe("user_1");
    expect((await repos.rules.list(ctx))[0]?.key).toBe("r");
    expect((await repos.audits.list(ctx))[0]?.action).toBe("created");
  });

  it("maps recipients, references, attachments, and delivery attempts", async () => {
    const now = new Date("2026-07-14T10:00:00.000Z");
    const recipientRow = {
      id: "rcp_1",
      notificationId: "ntf_1",
      tenantId: "tenant_a",
      userId: "user_1",
      addressHint: "u@example.com",
      channelKind: "email",
      status: "pending",
      readAt: null,
      acknowledgedAt: null,
      dismissedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const referenceRow = {
      id: "ref_1",
      notificationId: "ntf_1",
      kind: "documents",
      resourceId: "doc_1",
      label: "Doc",
    };
    const attachmentRow = {
      id: "att_1",
      notificationId: "ntf_1",
      fileName: "a.txt",
      contentType: "text/plain",
      sizeBytes: 3,
      storageRef: "ref://a",
    };
    const attemptRow = {
      id: "attm_1",
      notificationId: "ntf_1",
      recipientId: "rcp_1",
      channelKind: "email",
      status: "recorded",
      attemptedAt: now,
      note: "meta",
    };
    const { db, update } = createMockDb([
      [recipientRow],
      [recipientRow],
      [referenceRow],
      [attachmentRow],
      [attemptRow],
      [attemptRow],
    ]);
    const repos = createPostgresNotificationRepositories(db);

    await repos.recipients.create(ctx, {
      id: "rcp_1" as never,
      notificationId: asNotificationId("ntf_1"),
      tenantId: "tenant_a",
      userId: "user_1",
      addressHint: "u@example.com",
      channelKind: "email",
      status: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(await repos.recipients.get(ctx, "rcp_1" as never)).toMatchObject({
      channelKind: "email",
    });
    await repos.recipients.update(ctx, {
      id: "rcp_1" as never,
      notificationId: asNotificationId("ntf_1"),
      tenantId: "tenant_a",
      channelKind: "email",
      status: "read",
      readAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(update).toHaveBeenCalled();
    expect(
      await repos.recipients.listByNotification(ctx, asNotificationId("ntf_1")),
    ).toHaveLength(1);

    await repos.references.create(ctx, {
      id: "ref_1" as never,
      notificationId: asNotificationId("ntf_1"),
      kind: "documents",
      resourceId: "doc_1",
      label: "Doc",
    });
    expect(
      await repos.references.listByNotification(ctx, asNotificationId("ntf_1")),
    ).toMatchObject([{ kind: "documents" }]);

    await repos.attachments.create(ctx, {
      id: "att_1" as never,
      notificationId: asNotificationId("ntf_1"),
      fileName: "a.txt",
      contentType: "text/plain",
      sizeBytes: 3,
      storageRef: "ref://a",
    });
    expect(
      await repos.attachments.listByNotification(ctx, asNotificationId("ntf_1")),
    ).toMatchObject([{ fileName: "a.txt" }]);

    await repos.deliveryAttempts.create(ctx, {
      id: "attm_1" as never,
      notificationId: asNotificationId("ntf_1"),
      recipientId: "rcp_1" as never,
      channelKind: "email",
      status: "recorded",
      attemptedAt: now.toISOString(),
      note: "meta",
    });
    expect(
      await repos.deliveryAttempts.listByNotification(ctx, asNotificationId("ntf_1")),
    ).toMatchObject([{ status: "recorded" }]);

    await repos.templates.update(ctx, {
      id: "tpl_1" as never,
      tenantId: "tenant_a",
      key: "k",
      name: "N2",
      defaultPriority: "normal",
      defaultChannelKinds: ["email"],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "u",
      updatedBy: "u",
      revision: 2,
    });
    await repos.preferences.update(ctx, {
      id: "pref_1" as never,
      tenantId: "tenant_a",
      userId: "user_1",
      channelKind: "email",
      enabled: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.rules.update(ctx, {
      id: "rule_1" as never,
      tenantId: "tenant_a",
      key: "r",
      name: "R2",
      enabled: false,
      priority: "low",
      channelKinds: ["sms"],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(update).toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";

import {
  asNotificationCategoryId,
  asNotificationId,
  asNotificationReferenceId,
  asNotificationTemplateId,
  type Notification,
} from "@apzhub/notification-contracts";

import {
  assertNotificationLifecycleTransition,
  canTransitionNotificationLifecycle,
  createNotificationFoundation,
  listAllowedNotificationLifecycleTransitions,
  NOTIFICATION_CORE_VERSION,
  NotificationDomainError,
  requireFound,
  validateNotification,
  validateNotificationStructural,
  type NotificationFoundationRepos,
} from "./index";

function stubRepos(): NotificationFoundationRepos {
  const noop = async () => {
    throw new Error("unused");
  };
  return {
    notifications: {
      create: noop,
      get: async () => null,
      update: noop,
      list: async () => [],
    },
    recipients: {
      create: noop,
      get: async () => null,
      update: noop,
      listByNotification: async () => [],
    },
    templates: {
      create: noop,
      get: async () => null,
      update: noop,
      list: async () => [],
    },
    categories: {
      create: noop,
      get: async () => null,
      list: async () => [],
    },
    channels: {
      create: noop,
      get: async () => null,
      list: async () => [],
    },
    preferences: {
      create: noop,
      get: async () => null,
      update: noop,
      list: async () => [],
    },
    rules: {
      create: noop,
      get: async () => null,
      update: noop,
      list: async () => [],
    },
    references: {
      create: noop,
      listByNotification: async () => [],
    },
    attachments: {
      create: noop,
      listByNotification: async () => [],
    },
    deliveryAttempts: {
      create: noop,
      listByNotification: async () => [],
    },
    audits: {
      append: noop,
      list: async () => [],
    },
  };
}

function sampleNotification(overrides: Partial<Notification> = {}): Notification {
  const now = "2026-07-14T10:00:00.000Z";
  return {
    id: asNotificationId("ntf_1"),
    tenantId: "tenant_a",
    title: "Hello",
    status: "draft",
    priority: "normal",
    channelKinds: ["in_app"],
    createdAt: now,
    updatedAt: now,
    createdBy: "user_1",
    updatedBy: "user_1",
    revision: 1,
    ...overrides,
  };
}

describe("notification-core", () => {
  it("exports version 0.2.0", () => {
    expect(NOTIFICATION_CORE_VERSION).toBe("0.2.0");
  });

  it("enforces lifecycle transitions", () => {
    expect(canTransitionNotificationLifecycle("draft", "pending")).toBe(true);
    expect(canTransitionNotificationLifecycle("draft", "delivered")).toBe(false);
    expect(canTransitionNotificationLifecycle("archived", "draft")).toBe(true);
    expect(canTransitionNotificationLifecycle("read", "read")).toBe(true);
    expect(listAllowedNotificationLifecycleTransitions("queued")).toContain(
      "delivered",
    );
    expect(() => assertNotificationLifecycleTransition("draft", "read")).toThrow(
      NotificationDomainError,
    );
  });

  it("validates notifications structurally", () => {
    const ok = validateNotification({ notification: sampleNotification() });
    expect(ok.valid).toBe(true);

    const bad = validateNotificationStructural(
      sampleNotification({ title: "", status: "sent" as never }),
    );
    expect(bad.some((i) => i.code === "missing_title")).toBe(true);
    expect(bad.some((i) => i.code === "invalid_status")).toBe(true);
  });

  it("validates references, attachments, and lifecycle fields", () => {
    const ntf = sampleNotification({
      categoryId: asNotificationCategoryId("cat_missing"),
      templateId: asNotificationTemplateId("tpl_1"),
      status: "archived",
    });
    const result = validateNotification({
      notification: ntf,
      knownCategoryIds: new Set(["cat_1"]),
      knownTemplateIds: new Set(["tpl_1"]),
      references: [
        {
          id: asNotificationReferenceId("ref_1"),
          notificationId: asNotificationId("other"),
          kind: "projects",
          resourceId: "",
        },
      ],
      attachments: [
        {
          id: asNotificationId("att_1") as never,
          notificationId: ntf.id,
          fileName: "",
          sizeBytes: -1,
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "unknown_category")).toBe(true);
    expect(result.issues.some((i) => i.code === "missing_archived_at")).toBe(true);
    expect(
      result.issues.some((i) => i.code === "reference_notification_mismatch"),
    ).toBe(true);
    expect(result.issues.some((i) => i.code === "missing_resource_id")).toBe(true);
    expect(result.issues.some((i) => i.code === "missing_file_name")).toBe(true);
    expect(result.issues.some((i) => i.code === "invalid_size")).toBe(true);
  });

  it("requires expired expiresAt", () => {
    const result = validateNotification({
      notification: sampleNotification({ status: "expired" }),
    });
    expect(result.issues.some((i) => i.code === "missing_expires_at")).toBe(true);
  });

  it("rejects invalid channel kinds and revision", () => {
    const result = validateNotification({
      notification: sampleNotification({
        channelKinds: ["fax" as never],
        revision: 0,
      }),
    });
    expect(result.issues.some((i) => i.code === "invalid_channel_kind")).toBe(true);
    expect(result.issues.some((i) => i.code === "invalid_revision")).toBe(true);
  });

  it("covers remaining structural and reference branches", () => {
    const empty = validateNotification({
      notification: sampleNotification({
        id: "" as never,
        tenantId: "",
        priority: "urgent" as never,
        channelKinds: null as never,
      }),
    });
    expect(empty.issues.some((i) => i.code === "missing_id")).toBe(true);
    expect(empty.issues.some((i) => i.code === "missing_tenant")).toBe(true);
    expect(empty.issues.some((i) => i.code === "invalid_priority")).toBe(true);
    expect(empty.issues.some((i) => i.code === "invalid_channels")).toBe(true);

    const ntf = sampleNotification({
      templateId: asNotificationTemplateId("tpl_missing"),
    });
    const refs = validateNotification({
      notification: ntf,
      knownTemplateIds: new Set(["tpl_1"]),
      references: [
        {
          id: asNotificationReferenceId("ref_bad"),
          notificationId: ntf.id,
          kind: "plane" as never,
          resourceId: "x",
        },
      ],
      attachments: [
        {
          id: "att_x" as never,
          notificationId: asNotificationId("other"),
          fileName: "ok.txt",
        },
      ],
    });
    expect(refs.issues.some((i) => i.code === "unknown_template")).toBe(true);
    expect(refs.issues.some((i) => i.code === "invalid_reference_kind")).toBe(true);
    expect(refs.issues.some((i) => i.code === "attachment_notification_mismatch")).toBe(
      true,
    );

    const archivedOk = validateNotification({
      notification: sampleNotification({
        status: "archived",
        archivedAt: "2026-07-14T12:00:00.000Z",
      }),
    });
    expect(archivedOk.valid).toBe(true);
    const expiredOk = validateNotification({
      notification: sampleNotification({
        status: "expired",
        expiresAt: "2026-07-14T12:00:00.000Z",
      }),
    });
    expect(expiredOk.valid).toBe(true);
  });

  it("composes foundation with explicit repos only", () => {
    expect(() => createNotificationFoundation({} as never)).toThrow(/explicit repos/);
    const foundation = createNotificationFoundation({ repos: stubRepos() });
    expect(foundation.canTransition("pending", "queued")).toBe(true);
    expect(foundation.validate({ notification: sampleNotification() }).valid).toBe(
      true,
    );
    expect(() =>
      createNotificationFoundation({
        repos: { ...stubRepos(), audits: null as never },
      }),
    ).toThrow(/repos.audits/);
  });

  it("requireFound throws NotificationDomainError", () => {
    expect(() => requireFound(null, "notification", "x")).toThrow(
      NotificationDomainError,
    );
    expect(requireFound(1, "n", "1")).toBe(1);
  });
});

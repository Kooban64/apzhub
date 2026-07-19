/**
 * Platform Notification typed client coverage (APZNOTIFY-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  acknowledgeNotification,
  archiveNotification,
  archiveNotificationTemplate,
  assertNotificationApiPath,
  clearNotificationQueries,
  createHttpNotificationClient,
  createMockNotificationClient,
  createNotification,
  createNotificationTemplate,
  dismissNotification,
  getNotification,
  getNotificationCapabilities,
  getNotificationCategory,
  getNotificationChannel,
  getNotificationClient,
  getNotificationDiagnostics,
  getNotificationHealth,
  getNotificationPreference,
  getNotificationReadiness,
  getNotificationRecipient,
  getNotificationReference,
  getNotificationTemplate,
  listNotificationAudit,
  listNotificationCategories,
  listNotificationChannels,
  listNotificationPreferences,
  listNotificationRecipients,
  listNotificationReferences,
  listNotifications,
  listNotificationTemplates,
  listScopedNotificationAudit,
  markNotificationRead,
  NotificationClientError,
  notificationQueryKeys,
  resetNotificationClient,
  restoreNotification,
  setNotificationClient,
  toNotificationUserMessage,
  transitionNotification,
  updateNotification,
  updateNotificationPreference,
  updateNotificationTemplate,
} from "./index";

function okData(data: unknown) {
  return new Response(
    JSON.stringify({ data, meta: { requestId: "r", correlationId: "c" } }),
    {
      status: 200,
    },
  );
}

function okCollection(data: unknown[]) {
  return new Response(
    JSON.stringify({
      data,
      page: { limit: data.length, hasMore: false },
      meta: { requestId: "r", correlationId: "c" },
    }),
    { status: 200 },
  );
}

const baseNotification = {
  id: "ntf_1",
  tenantId: "tenant_a",
  organisationId: "org_a",
  key: "k",
  title: "T",
  summary: "S",
  body: "B",
  status: "pending",
  priority: "normal",
  categoryId: "ntc_1",
  templateId: "ntt_1",
  channelKinds: ["in_app"],
  expiresAt: "2026-08-01T00:00:00.000Z",
  archivedAt: null,
  createdAt: "2026-07-16T12:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

describe("APZNOTIFY-003 notification client coverage", () => {
  afterEach(() => {
    resetNotificationClient();
    vi.unstubAllGlobals();
  });

  it("exercises HTTP client methods and mapping branches", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      if (url.includes("/templates/") && url.endsWith("/archive")) {
        return okData({
          id: "ntt_1",
          tenantId: "tenant_a",
          key: "welcome",
          name: "Welcome",
          defaultPriority: "normal",
          defaultChannelKinds: ["in_app"],
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
          revision: 1,
        });
      }
      if (url.includes("/templates/")) {
        return okData({
          id: "ntt_1",
          tenantId: "tenant_a",
          organisationId: null,
          key: "welcome",
          name: "Welcome",
          description: null,
          categoryId: null,
          defaultPriority: "normal",
          defaultChannelKinds: ["in_app"],
          subjectTemplate: null,
          bodyTemplate: null,
          locale: null,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
          revision: 1,
        });
      }
      if (url.endsWith("/templates")) {
        if (method === "POST") {
          return okData({
            id: "ntt_1",
            tenantId: "tenant_a",
            key: "welcome",
            name: "Welcome",
            defaultPriority: "normal",
            defaultChannelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          });
        }
        return okCollection([
          {
            id: "ntt_1",
            tenantId: "tenant_a",
            key: "welcome",
            name: "Welcome",
            defaultPriority: "normal",
            defaultChannelKinds: ["email"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          },
        ]);
      }
      if (url.includes("/preferences/")) {
        return okData({
          id: "ntp_1",
          tenantId: "tenant_a",
          organisationId: null,
          userId: "user_1",
          categoryId: null,
          channelKind: "in_app",
          enabled: true,
          quietHours: null,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        });
      }
      if (url.includes("/preferences")) {
        return okCollection([
          {
            id: "ntp_1",
            tenantId: "tenant_a",
            userId: "user_1",
            channelKind: "in_app",
            enabled: true,
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/categories/")) {
        return okData({
          id: "ntc_1",
          tenantId: "tenant_a",
          organisationId: null,
          key: "system",
          name: "System",
          description: null,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        });
      }
      if (url.includes("/categories")) {
        return okCollection([
          {
            id: "ntc_1",
            tenantId: "tenant_a",
            key: "system",
            name: "System",
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/channels/")) {
        return okData({
          id: "ntch_1",
          tenantId: "tenant_a",
          organisationId: null,
          kind: "in_app",
          name: "In-app",
          enabled: true,
          configRef: null,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        });
      }
      if (url.includes("/channels")) {
        return okCollection([
          {
            id: "ntch_1",
            tenantId: "tenant_a",
            kind: "email",
            name: "Email",
            enabled: false,
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/recipients/")) {
        return okData({
          id: "ntr_1",
          notificationId: "ntf_1",
          tenantId: "tenant_a",
          userId: "user_1",
          addressHint: null,
          channelKind: "in_app",
          status: "pending",
          readAt: null,
          acknowledgedAt: null,
          dismissedAt: null,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        });
      }
      if (url.includes("/recipients")) {
        return okCollection([
          {
            id: "ntr_1",
            notificationId: "ntf_1",
            tenantId: "tenant_a",
            channelKind: "in_app",
            status: "pending",
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/references/")) {
        return okData({
          id: "ntref_1",
          notificationId: "ntf_1",
          kind: "projects",
          resourceId: "proj_1",
          label: null,
        });
      }
      if (url.includes("/references")) {
        return okCollection([
          {
            id: "ntref_1",
            notificationId: "ntf_1",
            kind: "support",
            resourceId: "sreq_1",
            label: "Ticket",
          },
        ]);
      }
      if (url.includes("/audit")) {
        return okCollection([
          {
            id: "nta_1",
            tenantId: "tenant_a",
            organisationId: null,
            notificationId: "ntf_1",
            action: "notification.created",
            actorUserId: "user_1",
            detail: null,
            createdAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (
        url.includes("/capabilities") ||
        url.includes("/health") ||
        url.includes("/readiness") ||
        url.includes("/diagnostics")
      ) {
        return okData({
          notificationEnabled: true,
          managementPlaneReady: true,
          deliveryEnabled: false,
          deliveryPlaneReady: false,
          providersConfigured: false,
          workersReady: false,
          eventBusReady: false,
          realtimeReady: false,
          persistenceMode: "postgres",
          capabilities: { delivery: false },
          status: "ok",
          healthy: true,
          ready: true,
          platformServicesVersion: "0.26.1",
        });
      }
      if (
        url.includes("/transition") ||
        url.includes("/archive") ||
        url.includes("/restore") ||
        url.includes("/mark-read") ||
        url.includes("/acknowledge") ||
        url.includes("/dismiss")
      ) {
        return okData({ ...baseNotification, status: "read" });
      }
      if (url === "/api/v1/notifications" || url.startsWith("/api/v1/notifications?")) {
        if (method === "POST") return okData(baseNotification);
        return okCollection([baseNotification]);
      }
      if (url.match(/\/api\/v1\/notifications\/[^/?]+$/)) {
        return okData(baseNotification);
      }
      return new Response(
        JSON.stringify({ error: { message: "missing", code: "NOT_FOUND" } }),
        {
          status: 404,
        },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpNotificationClient();
    expect(
      (await client.listNotifications({ status: "pending" })).items[0]?.title,
    ).toBe("T");
    expect((await client.getNotification("ntf_1")).revision).toBe(1);
    expect((await client.createNotification({ title: "X" })).id).toBe("ntf_1");
    expect((await client.updateNotification("ntf_1", { title: "Y" })).id).toBe("ntf_1");
    expect((await client.archiveNotification("ntf_1")).status).toBe("read");
    expect((await client.restoreNotification("ntf_1")).status).toBe("read");
    expect((await client.transitionNotification("ntf_1", { to: "read" })).status).toBe(
      "read",
    );
    expect((await client.markNotificationRead("ntf_1")).status).toBe("read");
    expect((await client.acknowledgeNotification("ntf_1")).status).toBe("read");
    expect((await client.dismissNotification("ntf_1")).status).toBe("read");
    expect((await client.listTemplates()).items[0]?.key).toBe("welcome");
    expect((await client.getTemplate("ntt_1")).name).toBe("Welcome");
    expect((await client.createTemplate({ key: "k", name: "n" })).id).toBe("ntt_1");
    expect((await client.updateTemplate("ntt_1", { name: "n2" })).id).toBe("ntt_1");
    expect((await client.archiveTemplate("ntt_1")).id).toBe("ntt_1");
    expect((await client.listPreferences()).items[0]?.id).toBe("ntp_1");
    expect((await client.getPreference("ntp_1")).enabled).toBe(true);
    expect((await client.updatePreference("ntp_1", { enabled: false })).id).toBe(
      "ntp_1",
    );
    expect((await client.listCategories()).items[0]?.key).toBe("system");
    expect((await client.getCategory("ntc_1")).id).toBe("ntc_1");
    expect((await client.listChannels()).items[0]?.deliveryAvailable).toBe(false);
    expect((await client.getChannel("ntch_1")).providersConfigured).toBe(false);
    expect((await client.listRecipients("ntf_1")).items[0]?.id).toBe("ntr_1");
    expect((await client.getRecipient("ntf_1", "ntr_1")).channelKind).toBe("in_app");
    expect((await client.listReferences("ntf_1")).items[0]?.kind).toBe("support");
    expect((await client.getReference("ntref_1")).resourceId).toBe("proj_1");
    expect((await client.listAudit()).items[0]?.action).toBe("notification.created");
    expect((await client.listNotificationAudit("ntf_1")).items[0]?.id).toBe("nta_1");
    expect((await client.getCapabilities()).deliveryEnabled).toBe(false);
    expect((await client.getHealth()).healthy).toBe(true);
    expect((await client.getReadiness()).ready).toBe(true);
    expect((await client.getDiagnostics()).platformServicesVersion).toBe("0.26.1");
  });

  it("covers mock parity and facade accessors", async () => {
    const mock = createMockNotificationClient();
    setNotificationClient(mock);
    expect(getNotificationClient()).toBe(mock);
    expect((await listNotifications()).items).toHaveLength(1);
    expect((await getNotification("x")).id).toBe("x");
    expect((await createNotification({ title: "A" })).title).toBe("A");
    expect((await updateNotification("x", { title: "B" })).revision).toBe(2);
    expect((await archiveNotification("x")).status).toBe("archived");
    expect((await restoreNotification("x")).status).toBe("draft");
    expect((await transitionNotification("x", { to: "pending" })).status).toBe(
      "pending",
    );
    expect((await markNotificationRead("x")).status).toBe("read");
    expect((await acknowledgeNotification("x")).status).toBe("acknowledged");
    expect((await dismissNotification("x")).status).toBe("dismissed");
    expect((await listNotificationTemplates()).items[0]?.id).toBe("ntt_mock_1");
    expect((await getNotificationTemplate("t")).id).toBe("t");
    expect((await createNotificationTemplate({ key: "k", name: "n" })).key).toBe("k");
    expect((await updateNotificationTemplate("t", { name: "n2" })).name).toBe("n2");
    expect((await archiveNotificationTemplate("t")).id).toBe("t");
    expect((await listNotificationPreferences()).items[0]?.enabled).toBe(true);
    expect((await getNotificationPreference("p")).id).toBe("p");
    expect((await updateNotificationPreference("p", { enabled: false })).enabled).toBe(
      false,
    );
    expect((await listNotificationCategories()).items[0]?.key).toBe("system");
    expect((await getNotificationCategory("c")).id).toBe("c");
    expect((await listNotificationChannels()).items[0]?.deliveryAvailable).toBe(false);
    expect((await getNotificationChannel("ch")).providersConfigured).toBe(false);
    expect((await listNotificationRecipients("n")).items[0]?.notificationId).toBe("n");
    expect((await getNotificationRecipient("n", "r")).id).toBe("r");
    expect((await listNotificationReferences("n")).items[0]?.kind).toBe("projects");
    expect((await getNotificationReference("ref")).id).toBe("ref");
    expect((await listNotificationAudit()).items[0]?.action).toContain("created");
    expect((await listScopedNotificationAudit("n")).items[0]?.notificationId).toBe("n");
    expect((await getNotificationCapabilities()).deliveryPlaneReady).toBe(false);
    expect((await getNotificationHealth()).healthy).toBe(true);
    expect((await getNotificationReadiness()).ready).toBe(true);
    expect((await getNotificationDiagnostics()).platformServicesVersion).toBe("0.26.1");

    expect(notificationQueryKeys.list({ status: "pending" })[0]).toBe("notifications");
    expect(notificationQueryKeys.templates.detail("t")[3]).toBe("t");
    expect(notificationQueryKeys.preferences.detail("p")[3]).toBe("p");
    expect(notificationQueryKeys.categories.detail("c")[3]).toBe("c");
    expect(notificationQueryKeys.channels.detail("ch")[3]).toBe("ch");
    expect(notificationQueryKeys.recipients("n")[2]).toBe("n");
    expect(notificationQueryKeys.references("n")[2]).toBe("n");
    expect(notificationQueryKeys.audit.notification("n")[2]).toBe("n");
    expect(notificationQueryKeys.capabilities()[1]).toBe("capabilities");
    expect(notificationQueryKeys.health()[1]).toBe("health");
    expect(notificationQueryKeys.readiness()[1]).toBe("readiness");
    expect(notificationQueryKeys.diagnostics()[1]).toBe("diagnostics");

    const removeQueries = vi.fn();
    clearNotificationQueries({ removeQueries } as never);
    expect(removeQueries).toHaveBeenCalled();

    expect(
      toNotificationUserMessage(
        new NotificationClientError({ message: "x", status: 401 }),
      ),
    ).toContain("authorized");
    expect(
      toNotificationUserMessage(
        new NotificationClientError({ message: "x", status: 404 }),
      ),
    ).toContain("not found");
    expect(
      toNotificationUserMessage(
        new NotificationClientError({
          message: "x",
          code: "NOTIFICATION_SERVICE_UNAVAILABLE",
          status: 503,
        }),
      ),
    ).toContain("unavailable");
    expect(
      toNotificationUserMessage(
        new NotificationClientError({ message: "x", status: 501 }),
      ),
    ).toContain("delivery");
    expect(
      toNotificationUserMessage(new NotificationClientError({ message: "custom" })),
    ).toBe("custom");
    expect(toNotificationUserMessage(new Error("boom"))).toBe("boom");
    expect(toNotificationUserMessage("nope")).toContain("Unable");

    expect(() => assertNotificationApiPath("/api/v1/notifications/smtp")).toThrow(
      /Forbidden/,
    );
  });
});

/**
 * Platform Notification HTTP handler coverage (APZNOTIFY-003).
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertNotificationHttpEnabled,
  buildNotificationManagementPlaneDto,
  handleAcknowledgeNotification,
  handleArchiveNotification,
  handleArchiveNotificationTemplate,
  handleCreateNotification,
  handleCreateNotificationTemplate,
  handleDeleteNotification,
  handleDeleteNotificationTemplate,
  handleDismissNotification,
  handleGetNotification,
  handleGetNotificationAuditEntry,
  handleGetNotificationCapabilities,
  handleGetNotificationCategory,
  handleGetNotificationChannel,
  handleGetNotificationDiagnostics,
  handleGetNotificationHealth,
  handleGetNotificationPreference,
  handleGetNotificationReadiness,
  handleGetNotificationRecipient,
  handleGetNotificationReference,
  handleGetNotificationTemplate,
  handleListNotificationAudit,
  handleListNotificationCategories,
  handleListNotificationChannels,
  handleListNotificationPreferences,
  handleListNotificationRecipients,
  handleListNotificationReferences,
  handleListNotifications,
  handleListNotificationScopedAudit,
  handleListNotificationTemplates,
  handleMarkNotificationRead,
  handleRestoreNotification,
  handleTransitionNotification,
  handleUpdateNotification,
  handleUpdateNotificationPreference,
  handleUpdateNotificationTemplate,
} from "./notifications";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  installMockGateway,
} from "../testing/fixtures";
import { loadPlatformOpenApiSpecObject } from "../openapi";
import { PlatformApiHttpError } from "../errors";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-notifications",
      correlationId: "corr-test-notifications",
      timestamp: "2026-07-16T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZNOTIFY-003 notification handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when notification HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        notificationEnabled: false,
      }),
    );
    await expect(assertNotificationHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "NOTIFICATION_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists, creates, gets, updates, and archives notifications", async () => {
    installMockGateway();
    const ctx = makeContext();

    const list = await handleListNotifications(
      makeRequest("/api/v1/notifications?status=pending&limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.meta.requestId).toBe("req-test-notifications");
    expect(listBody.page.limit).toBe(10);

    const created = await handleCreateNotification(
      makeRequest("/api/v1/notifications", {
        method: "POST",
        body: JSON.stringify({ title: "Hello", channelKinds: ["in_app"] }),
      }),
      ctx,
    );
    expect(created.status).toBe(200);
    expect((await created.json()).data.title).toBe("Hello");

    const got = await handleGetNotification(
      makeRequest("/api/v1/notifications/ntf_1"),
      ctx,
      { params: Promise.resolve({ notificationId: "ntf_1" }) },
    );
    expect((await got.json()).data.id).toBe("ntf_1");

    const updated = await handleUpdateNotification(
      makeRequest("/api/v1/notifications/ntf_1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      }),
      ctx,
      { params: Promise.resolve({ notificationId: "ntf_1" }) },
    );
    expect((await updated.json()).data.title).toBe("Updated");

    const deleted = await handleDeleteNotification(
      makeRequest("/api/v1/notifications/ntf_1", { method: "DELETE" }),
      ctx,
      { params: Promise.resolve({ notificationId: "ntf_1" }) },
    );
    const deletedBody = await deleted.json();
    expect(deletedBody.data.archived).toBe(true);
    expect(deletedBody.data.notification.status).toBe("archived");
  });

  it("supports lifecycle transition, archive, restore, mark-read, acknowledge, dismiss", async () => {
    installMockGateway();
    const ctx = makeContext();
    const route = { params: Promise.resolve({ notificationId: "ntf_1" }) };

    const transitioned = await handleTransitionNotification(
      makeRequest("/api/v1/notifications/ntf_1/transition", {
        method: "POST",
        body: JSON.stringify({ to: "pending" }),
      }),
      ctx,
      route,
    );
    expect((await transitioned.json()).data.status).toBe("pending");

    expect(
      (await (await handleArchiveNotification(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("archived");
    expect(
      (await (await handleRestoreNotification(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("draft");
    expect(
      (await (await handleMarkNotificationRead(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("read");
    expect(
      (await (await handleAcknowledgeNotification(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("acknowledged");
    expect(
      (await (await handleDismissNotification(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("dismissed");
  });

  it("covers templates, preferences, categories, channels, recipients, references, audit", async () => {
    installMockGateway();
    const ctx = makeContext();

    expect(
      (await (await handleListNotificationTemplates(makeRequest("/"), ctx)).json())
        .data[0].id,
    ).toBe("ntt_1");
    expect(
      (
        await (
          await handleCreateNotificationTemplate(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify({ key: "k", name: "N" }),
            }),
            ctx,
          )
        ).json()
      ).data.key,
    ).toBe("k");
    expect(
      (
        await (
          await handleGetNotificationTemplate(makeRequest("/"), ctx, {
            params: Promise.resolve({ templateId: "ntt_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("ntt_1");
    expect(
      (
        await (
          await handleUpdateNotificationTemplate(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ name: "Renamed" }),
            }),
            ctx,
            { params: Promise.resolve({ templateId: "ntt_1" }) },
          )
        ).json()
      ).data.name,
    ).toBe("Renamed");
    expect(
      (
        await (
          await handleArchiveNotificationTemplate(makeRequest("/"), ctx, {
            params: Promise.resolve({ templateId: "ntt_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("ntt_1");
    expect(
      (
        await (
          await handleDeleteNotificationTemplate(makeRequest("/"), ctx, {
            params: Promise.resolve({ templateId: "ntt_1" }),
          })
        ).json()
      ).data.archived,
    ).toBe(true);

    expect(
      (await (await handleListNotificationPreferences(makeRequest("/"), ctx)).json())
        .data[0].id,
    ).toBe("ntp_1");
    expect(
      (
        await (
          await handleUpdateNotificationPreference(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ enabled: false }),
            }),
            ctx,
            { params: Promise.resolve({ preferenceId: "ntp_1" }) },
          )
        ).json()
      ).data.enabled,
    ).toBe(false);
    expect(
      (
        await (
          await handleGetNotificationPreference(makeRequest("/"), ctx, {
            params: Promise.resolve({ preferenceId: "ntp_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("ntp_1");

    expect(
      (await (await handleListNotificationCategories(makeRequest("/"), ctx)).json())
        .data[0].key,
    ).toBe("system");
    expect(
      (
        await (
          await handleGetNotificationCategory(makeRequest("/"), ctx, {
            params: Promise.resolve({ categoryId: "ntc_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("ntc_1");

    const channels = await (
      await handleListNotificationChannels(makeRequest("/"), ctx)
    ).json();
    expect(channels.data[0].deliveryAvailable).toBe(false);
    expect(
      (
        await (
          await handleGetNotificationChannel(makeRequest("/"), ctx, {
            params: Promise.resolve({ channelId: "ntch_1" }),
          })
        ).json()
      ).data.providersConfigured,
    ).toBe(false);

    expect(
      (
        await (
          await handleListNotificationRecipients(makeRequest("/"), ctx, {
            params: Promise.resolve({ notificationId: "ntf_1" }),
          })
        ).json()
      ).data[0].id,
    ).toBe("ntr_1");
    expect(
      (
        await (
          await handleGetNotificationRecipient(makeRequest("/"), ctx, {
            params: Promise.resolve({
              notificationId: "ntf_1",
              recipientId: "ntr_1",
            }),
          })
        ).json()
      ).data.userId,
    ).toBe("user_1");

    expect(
      (
        await (
          await handleListNotificationReferences(makeRequest("/"), ctx, {
            params: Promise.resolve({ notificationId: "ntf_1" }),
          })
        ).json()
      ).data[0].kind,
    ).toBe("projects");
    expect(
      (
        await (
          await handleGetNotificationReference(makeRequest("/"), ctx, {
            params: Promise.resolve({ referenceId: "ntref_1" }),
          })
        ).json()
      ).data.resourceId,
    ).toBe("proj_1");

    expect(
      (await (await handleListNotificationAudit(makeRequest("/"), ctx)).json()).data[0]
        .action,
    ).toBe("notification.created");
    expect(
      (
        await (
          await handleListNotificationScopedAudit(makeRequest("/"), ctx, {
            params: Promise.resolve({ notificationId: "ntf_1" }),
          })
        ).json()
      ).data[0].notificationId,
    ).toBe("ntf_1");
    expect(
      (
        await (
          await handleGetNotificationAuditEntry(makeRequest("/"), ctx, {
            params: Promise.resolve({ auditId: "nta_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("nta_1");
  });

  it("reports management-plane readiness with delivery unavailable", async () => {
    installMockGateway();
    const ctx = makeContext();

    const caps = await (
      await handleGetNotificationCapabilities(makeRequest("/"), ctx)
    ).json();
    expect(caps.data.delivery).toBe(false);
    expect(caps.data.deliveryPlaneReady).toBe(false);
    expect(caps.data.providersConfigured).toBe(false);
    expect(caps.data.workersAvailable).toBe(false);
    expect(caps.data.eventBusAvailable).toBe(false);
    expect(caps.data.realtimeAvailable).toBe(false);

    const health = await (
      await handleGetNotificationHealth(makeRequest("/"), ctx)
    ).json();
    expect(health.data.deliveryEnabled).toBe(false);
    expect(health.data.healthy).toBe(true);

    const readiness = await (
      await handleGetNotificationReadiness(makeRequest("/"), ctx)
    ).json();
    expect(readiness.data.ready).toBe(true);
    expect(readiness.data.workersReady).toBe(false);

    const diagnostics = await (
      await handleGetNotificationDiagnostics(makeRequest("/"), ctx)
    ).json();
    expect(diagnostics.data.deliveryPlaneReady).toBe(false);
    expect(diagnostics.data.eventBusReady).toBe(false);

    const plane = buildNotificationManagementPlaneDto({
      notificationEnabled: true,
      persistenceMode: "postgres",
    });
    expect(plane.deliveryPlaneReady).toBe(false);
    expect(plane.capabilities.delivery).toBe(false);
  });

  it("rejects invalid create bodies and unknown category/channel", async () => {
    installMockGateway({
      notification: {
        categories: {
          get: async () => null,
        },
        channels: {
          get: async () => null,
        },
      },
    });
    const ctx = makeContext();

    await expect(
      handleCreateNotification(
        makeRequest("/", {
          method: "POST",
          body: JSON.stringify({ title: "" }),
        }),
        ctx,
      ),
    ).rejects.toBeInstanceOf(PlatformApiHttpError);

    await expect(
      handleGetNotificationCategory(makeRequest("/"), ctx, {
        params: Promise.resolve({ categoryId: "missing" }),
      }),
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      handleGetNotificationChannel(makeRequest("/"), ctx, {
        params: Promise.resolve({ channelId: "missing" }),
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("proves forbidden external-provider route segments remain absent", () => {
    const routesRoot = join(process.cwd(), "apps/web/app/api/v1/notifications");
    const files = walkRoutes(routesRoot);
    const joined = files.join("\n");
    // ENG-004 authorises retry (under deliveries) and providers (status only).
    const forbidden = [
      "send",
      "resend",
      "deliver",
      "dispatch",
      "schedule",
      "cancel-delivery",
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
    for (const segment of forbidden) {
      expect(joined.includes(`/notifications/${segment}/`)).toBe(false);
      expect(joined.endsWith(`/notifications/${segment}/route.ts`)).toBe(false);
      expect(joined.includes(`/notifications/${segment}/route.ts`)).toBe(false);
    }
    expect(joined.includes("/notifications/providers/route.ts")).toBe(true);
    expect(joined.includes("/notifications/deliveries/")).toBe(true);
  });

  it("documents notification metadata and ENG-004 delivery paths in OpenAPI", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      paths: Record<string, unknown>;
      tags?: { name: string }[];
    };
    expect(spec.paths["/notifications"]).toBeDefined();
    expect(spec.paths["/notifications/{notificationId}/transition"]).toBeDefined();
    expect(spec.paths["/notifications/templates"]).toBeDefined();
    expect(spec.paths["/notifications/capabilities"]).toBeDefined();
    expect(spec.paths["/notifications/inbox"]).toBeDefined();
    expect(spec.paths["/notifications/providers"]).toBeDefined();
    expect(spec.paths["/notifications/delivery-health"]).toBeDefined();
    expect(spec.tags?.some((t) => t.name === "Platform Notifications")).toBe(true);
    for (const bad of [
      "/notifications/send",
      "/notifications/deliver",
      "/notifications/smtp",
      "/notifications/workers",
      "/notifications/realtime",
    ]) {
      expect(spec.paths[bad]).toBeUndefined();
    }
  });
});

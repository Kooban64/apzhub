/**
 * Platform Notification typed client tests (APZNOTIFY-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createHttpNotificationClient,
  createMockNotificationClient,
  getNotificationClient,
  listNotifications,
  NotificationClientError,
  NOTIFICATION_FORBIDDEN_HTTP_SEGMENTS,
  notificationQueryKeys,
  resetNotificationClient,
  setNotificationClient,
  toNotificationUserMessage,
  assertNotificationApiPath,
} from "./index";

describe("APZNOTIFY-003 notification typed client", () => {
  afterEach(() => {
    resetNotificationClient();
    vi.unstubAllGlobals();
  });

  it("mock client covers core operations without delivery methods", async () => {
    const client = createMockNotificationClient();
    expect(await client.listNotifications()).toMatchObject({
      items: [{ id: "ntf_mock_1" }],
    });
    expect((await client.createNotification({ title: "X" })).title).toBe("X");
    expect((await client.markNotificationRead("ntf_1")).status).toBe("read");
    expect((await client.getCapabilities()).deliveryEnabled).toBe(false);
    expect((await client.listChannels()).items[0]?.deliveryAvailable).toBe(false);
    expect(client).not.toHaveProperty("send");
    expect(client).not.toHaveProperty("deliver");
    expect(client).not.toHaveProperty("schedule");
  });

  it("HTTP client builds routes, parses envelopes, and supports AbortSignal", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/capabilities")) {
        return new Response(
          JSON.stringify({
            data: {
              notificationEnabled: true,
              deliveryEnabled: false,
              deliveryPlaneReady: false,
              providersConfigured: false,
              workersReady: false,
              eventBusReady: false,
              realtimeReady: false,
              persistenceMode: "postgres",
            },
            meta: { requestId: "r1", correlationId: "c1" },
          }),
          { status: 200 },
        );
      }
      if (init?.method === "POST" && url.endsWith("/api/v1/notifications")) {
        return new Response(
          JSON.stringify({
            data: {
              id: "ntf_1",
              tenantId: "tenant_a",
              title: "Created",
              status: "draft",
              priority: "normal",
              channelKinds: ["in_app"],
              createdAt: "2026-07-16T12:00:00.000Z",
              updatedAt: "2026-07-16T12:00:00.000Z",
              createdBy: "user_1",
              updatedBy: "user_1",
              revision: 1,
            },
          }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({
          data: [
            {
              id: "ntf_1",
              tenantId: "tenant_a",
              title: "Welcome",
              status: "pending",
              priority: "normal",
              channelKinds: ["in_app"],
              createdAt: "2026-07-16T12:00:00.000Z",
              updatedAt: "2026-07-16T12:00:00.000Z",
              createdBy: "user_1",
              updatedBy: "user_1",
              revision: 1,
            },
          ],
          page: { limit: 20, hasMore: false },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpNotificationClient();
    const listed = await client.listNotifications(
      { status: "pending", limit: 20 },
      { signal: AbortSignal.timeout(5_000) },
    );
    expect(listed.items[0]?.title).toBe("Welcome");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/api/v1/notifications?status=pending&limit=20",
    );

    const created = await client.createNotification({ title: "Created" });
    expect(created.revision).toBe(1);

    const caps = await client.getCapabilities();
    expect(caps.deliveryPlaneReady).toBe(false);
  });

  it("translates HTTP errors and user messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: { code: "FORBIDDEN", message: "Denied" },
              meta: { correlationId: "c1" },
            }),
            { status: 403 },
          ),
      ),
    );
    const client = createHttpNotificationClient();
    await expect(client.getNotification("ntf_1")).rejects.toBeInstanceOf(
      NotificationClientError,
    );
    try {
      await client.getNotification("ntf_1");
    } catch (error) {
      expect(toNotificationUserMessage(error)).toContain("permission");
    }

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 500 })),
    );
    await expect(client.listNotifications()).rejects.toMatchObject({
      status: 500,
      code: "NOTIFICATION_HTTP_ERROR",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ data: null, page: undefined }), {
            status: 200,
          }),
      ),
    );
    expect((await client.listNotifications()).items).toEqual([]);
  });

  it("rejects forbidden API paths and enforces accessor injection", async () => {
    expect(() => assertNotificationApiPath("/api/v1/workflows")).toThrow(/only call/);
    expect(() => assertNotificationApiPath("/api/v1/notifications/send")).toThrow(
      /Forbidden/,
    );
    expect(NOTIFICATION_FORBIDDEN_HTTP_SEGMENTS).toContain("deliver");

    setNotificationClient(createMockNotificationClient());
    expect((await listNotifications()).items[0]?.id).toBe("ntf_mock_1");
    expect(getNotificationClient()).toBeDefined();
    expect(notificationQueryKeys.detail("ntf_1")).toEqual([
      "notifications",
      "detail",
      "ntf_1",
    ]);
  });

  it("HTTP client source has no server-only or delivery imports", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = join(process.cwd(), "apps/web/lib/notifications");
    const client = readFileSync(join(root, "notification-client.ts"), "utf8");
    expect(client).not.toMatch(/@apzhub\/platform-services/);
    expect(client).not.toMatch(/@apzhub\/notification-core/);
    expect(client).not.toMatch(/@apzhub\/notification-persistence/);
    expect(client).not.toMatch(/getPlatformServiceGateway/);
    expect(client).not.toMatch(/\bsend\b|\bdeliver\b|\bschedule\b/);
    expect(client).toContain("/api/v1/notifications");
  });
});

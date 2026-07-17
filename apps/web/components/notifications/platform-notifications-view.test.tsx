"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockNotificationClient,
  MOCK_NOTIFICATION,
  MOCK_NOTIFICATION_TEMPLATE,
} from "@/lib/notifications/mock-notification-client";
import {
  resetNotificationClient,
  setNotificationClient,
} from "@/lib/notifications/notification-api";

import { NotificationsWorkspaceRouter } from "./notifications-workspace-router";
import { PlatformNotificationsView } from "./platform-notifications-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/notifications/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformNotificationsView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetNotificationClient();
    setNotificationClient(createMockNotificationClient());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("renders overview with delivery unavailable and toolbar", async () => {
    render(wrap(<PlatformNotificationsView section="overview" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
      expect(screen.getByTestId("card-notifications-count")).toBeTruthy();
    });

    expect(screen.getByTestId("card-delivery-status").textContent).toContain(
      "DELIVERY PROVIDERS NOT AVAILABLE",
    );
    expect(
      screen.getByRole("toolbar", { name: /Notifications commands/i }),
    ).toBeTruthy();
    expect(screen.getByTestId("notifications-page")).toBeTruthy();
  });

  it("lists notifications and copies ID", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="notifications" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION.title)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Copy ID/i }));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-status").textContent).toMatch(
        /Copied notification ID/i,
      );
    });
  });

  it("shows templates metadata without designer", async () => {
    render(wrap(<PlatformNotificationsView section="templates" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION_TEMPLATE.name)).toBeTruthy();
    });
    expect(screen.getByText(/no designer/i)).toBeTruthy();
  });

  it("shows channels with delivery unavailable", async () => {
    render(wrap(<PlatformNotificationsView section="channels" />));

    await waitFor(() => {
      expect(screen.getByTestId("channels-delivery-unavailable")).toBeTruthy();
    });
    expect(
      screen.getByTestId("channels-delivery-unavailable").textContent,
    ).toContain("Delivery unavailable");
  });

  it("shows diagnostics delivery and providers unavailable", async () => {
    render(wrap(<PlatformNotificationsView section="diagnostics" />));

    await waitFor(() => {
      expect(screen.getByTestId("diagnostics-delivery-status")).toBeTruthy();
    });
    expect(
      screen.getByTestId("diagnostics-delivery-status").textContent,
    ).toContain("DELIVERY PROVIDERS NOT AVAILABLE");
    expect(screen.getByText("Providers").parentElement?.textContent).toContain(
      "unavailable",
    );
  });

  it("renders audit timeline", async () => {
    render(wrap(<PlatformNotificationsView section="audit" />));

    await waitFor(() => {
      expect(screen.getByTestId("notifications-audit-timeline")).toBeTruthy();
    });
  });

  it("supports mark-read lifecycle command", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="notifications" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION.title)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Mark Read/i }));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-status").textContent).toMatch(
        /Lifecycle action completed: mark-read/i,
      );
    });
  });

  it("filters notifications by status", async () => {
    render(wrap(<PlatformNotificationsView section="notifications" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION.title)).toBeTruthy();
    });

    fireEvent.change(screen.getByPlaceholderText(/Filter by status/i), {
      target: { value: "archived" },
    });
    await waitFor(() => {
      expect(screen.getByText(/No notifications found/i)).toBeTruthy();
    });
  });

  it("router resolves overview section", async () => {
    render(wrap(<NotificationsWorkspaceRouter />));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
    });
  });

  it("hides lifecycle when canManage is false", async () => {
    render(
      wrap(
        <PlatformNotificationsView section="notifications" canManage={false} />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION.title)).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: /Mark Read/i })).toBeNull();
  });

  it("opens API metadata panel", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("card-delivery-status")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open API Metadata/i }));
    expect(screen.getByTestId("notifications-api-metadata")).toBeTruthy();
  });

  it("covers preferences section detail", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="preferences" />));
    await waitFor(() => {
      expect(screen.getByText(/Preference details/i)).toBeTruthy();
    });
    await user.click(screen.getAllByText("user_1")[0]!);
    await waitFor(() => {
      expect(screen.getByText(/Quiet hours/i)).toBeTruthy();
    });
  });

  it("covers categories section detail", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="categories" />));
    await waitFor(() => {
      expect(screen.getByText("System")).toBeTruthy();
    });
    await user.click(screen.getByText("System"));
    await waitFor(() => {
      expect(screen.getByText(/Description/i)).toBeTruthy();
    });
  });

  it("covers recipients and references when a notification is selected", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="recipients" />));
    await waitFor(() => {
      expect(screen.getByText(/Recipient details/i)).toBeTruthy();
      expect(screen.getByText(/No address editing/i)).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("ntr_mock_1")).toBeTruthy();
    });
    await user.click(screen.getByText("ntr_mock_1"));
    await waitFor(() => {
      expect(screen.getByText(/Address hint/i)).toBeTruthy();
    });

    cleanup();
    render(wrap(<PlatformNotificationsView section="references" />));
    await waitFor(() => {
      expect(screen.getByText(/Reference details/i)).toBeTruthy();
      expect(screen.getByText(/Cross-product metadata only/i)).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("ntref_mock_1")).toBeTruthy();
    });
    await user.click(screen.getByText("ntref_mock_1"));
    await waitFor(() => {
      expect(screen.getAllByText("proj_1").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("covers recipients and references query errors", async () => {
    const { NotificationClientError } = await import(
      "@/lib/notifications/notification-errors"
    );
    const broken = createMockNotificationClient();
    broken.listRecipients = async () => {
      throw new NotificationClientError({ message: "recipients", status: 500 });
    };
    broken.listReferences = async () => {
      throw new NotificationClientError({
        message: "references",
        status: 403,
        code: "FORBIDDEN",
      });
    };
    setNotificationClient(broken);

    render(wrap(<PlatformNotificationsView section="recipients" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-error")).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /Retry/i })).toBeTruthy();

    cleanup();
    render(wrap(<PlatformNotificationsView section="references" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-forbidden")).toBeTruthy();
    });
  });

  it("covers notification detail not-found and clipboard failure", async () => {
    const { NotificationClientError } = await import(
      "@/lib/notifications/notification-errors"
    );
    const missing = createMockNotificationClient();
    missing.getNotification = async () => {
      throw new NotificationClientError({
        message: "Missing",
        status: 404,
        code: "NOT_FOUND",
      });
    };
    setNotificationClient(missing);
    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-not-found")).toBeTruthy();
    });

    cleanup();
    setNotificationClient(createMockNotificationClient());
    const writeText = vi.fn(async () => {
      throw new Error("Clipboard is unavailable.");
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION.title)).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /Copy ID/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      expect(screen.getByTestId("notifications-action-error").textContent).toMatch(
        /Clipboard is unavailable/i,
      );
    });
  });

  it("covers MetaTable Space activation and audit without detail", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getAllByText(MOCK_NOTIFICATION.title).length).toBeGreaterThan(
        0,
      );
    });
    const row = screen.getAllByText(MOCK_NOTIFICATION.title)[0]!.closest("tr");
    row!.focus();
    await user.keyboard(" ");

    cleanup();
    const noDetail = createMockNotificationClient();
    noDetail.listNotificationAudit = async () => ({
      items: [
        {
          id: "nta_plain",
          tenantId: "tenant_a",
          notificationId: MOCK_NOTIFICATION.id,
          action: "notification.read",
          actorUserId: "user_1",
          createdAt: "2026-07-16T11:00:00.000Z",
        },
      ],
      page: { limit: 1, hasMore: false },
    });
    noDetail.listAudit = async () => ({
      items: [
        {
          id: "nta_plain",
          tenantId: "tenant_a",
          notificationId: MOCK_NOTIFICATION.id,
          action: "notification.read",
          actorUserId: "user_1",
          createdAt: "2026-07-16T11:00:00.000Z",
        },
      ],
      page: { limit: 1, hasMore: false },
    });
    setNotificationClient(noDetail);
    render(wrap(<PlatformNotificationsView section="audit" />));
    await waitFor(() => {
      expect(screen.getByText("notification.read")).toBeTruthy();
    });
    expect(screen.queryByText(/Created in draft/i)).toBeNull();
  });

  it("covers overview degraded health and diagnostics without capabilities", async () => {
    const degraded = createMockNotificationClient();
    degraded.getHealth = async () => ({
      notificationEnabled: true,
      deliveryPlaneReady: false,
      deliveryEnabled: false,
      providersConfigured: false,
      workersReady: false,
      eventBusReady: false,
      realtimeReady: false,
      persistenceMode: "memory",
      healthy: false,
      status: "degraded",
    });
    degraded.getReadiness = async () => ({
      notificationEnabled: true,
      deliveryPlaneReady: false,
      deliveryEnabled: false,
      providersConfigured: false,
      workersReady: false,
      eventBusReady: false,
      realtimeReady: false,
      persistenceMode: "memory",
      ready: false,
      status: "not_ready",
    });
    degraded.getCapabilities = async () => ({
      notificationEnabled: false,
      deliveryPlaneReady: false,
      deliveryEnabled: false,
      providersConfigured: false,
      workersReady: false,
      eventBusReady: false,
      realtimeReady: false,
      persistenceMode: "memory",
      healthy: false,
      ready: false,
      status: "unavailable",
    });
    setNotificationClient(degraded);

    render(wrap(<PlatformNotificationsView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("card-platform-health").textContent).toContain(
        "degraded",
      );
    });
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.getByText("not_ready")).toBeTruthy();

    cleanup();
    render(wrap(<PlatformNotificationsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diagnostics-delivery-status")).toBeTruthy();
    });
    expect(screen.queryByTestId("diagnostics-capabilities-json")).toBeNull();
  });

  it("supports acknowledge, dismiss, archive, restore, and transition", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION.title)).toBeTruthy();
    });

    for (const label of [
      /Acknowledge/i,
      /Dismiss/i,
      /Archive/i,
      /Restore/i,
      /^Transition$/i,
    ]) {
      await user.click(screen.getByRole("button", { name: label }));
      await waitFor(() => {
        expect(screen.getByTestId("notifications-status").textContent).toMatch(
          /Lifecycle action completed/i,
        );
      });
    }
  });

  it("refreshes via toolbar", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("card-delivery-status")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Refresh$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-status").textContent).toMatch(
        /Refreshed/i,
      );
    });
  });

  it("shows forbidden and empty list states", async () => {
    const { NotificationClientError } = await import(
      "@/lib/notifications/notification-errors"
    );
    const forbidden = createMockNotificationClient();
    forbidden.listNotifications = async () => {
      throw new NotificationClientError({
        message: "Denied",
        code: "FORBIDDEN",
        status: 403,
      });
    };
    setNotificationClient(forbidden);
    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-forbidden")).toBeTruthy();
    });

    const empty = createMockNotificationClient();
    empty.listNotifications = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    empty.listTemplates = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    empty.listPreferences = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    empty.listCategories = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    empty.listChannels = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    empty.listAudit = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    empty.listNotificationAudit = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    setNotificationClient(empty);

    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-empty")).toBeTruthy();
    });
    render(wrap(<PlatformNotificationsView section="templates" />));
    await waitFor(() => {
      expect(screen.getByText(/No templates/i)).toBeTruthy();
    });
    render(wrap(<PlatformNotificationsView section="preferences" />));
    await waitFor(() => {
      expect(screen.getByText(/No preferences/i)).toBeTruthy();
    });
    render(wrap(<PlatformNotificationsView section="categories" />));
    await waitFor(() => {
      expect(screen.getByText(/No categories/i)).toBeTruthy();
    });
    render(wrap(<PlatformNotificationsView section="channels" />));
    await waitFor(() => {
      expect(screen.getByText(/No channels/i)).toBeTruthy();
    });
    render(wrap(<PlatformNotificationsView section="audit" />));
    await waitFor(() => {
      expect(screen.getByText(/No audit entries/i)).toBeTruthy();
    });
  });

  it("selects template and channel rows for detail panels", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="templates" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_NOTIFICATION_TEMPLATE.name)).toBeTruthy();
    });
    await user.click(screen.getByText(MOCK_NOTIFICATION_TEMPLATE.name));
    await waitFor(() => {
      expect(screen.getByText(/Subject template/i)).toBeTruthy();
    });

    render(wrap(<PlatformNotificationsView section="channels" />));
    await waitFor(() => {
      expect(screen.getByText("In-app")).toBeTruthy();
    });
    await user.click(screen.getByText("In-app"));
    await waitFor(() => {
      expect(screen.getByText(/Providers configured/i)).toBeTruthy();
    });
  });

  it("shows section error with retry control", async () => {
    const { NotificationClientError } = await import(
      "@/lib/notifications/notification-errors"
    );
    const flaky = createMockNotificationClient();
    flaky.listTemplates = async () => {
      throw new NotificationClientError({
        message: "Templates down",
        status: 500,
      });
    };
    setNotificationClient(flaky);
    render(wrap(<PlatformNotificationsView section="templates" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-error")).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /Retry/i })).toBeTruthy();

    const mutating = createMockNotificationClient();
    mutating.markNotificationRead = async () => {
      throw new NotificationClientError({
        message: "Cannot mark",
        status: 409,
      });
    };
    setNotificationClient(mutating);
    cleanup();
    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getAllByText(MOCK_NOTIFICATION.title).length).toBeGreaterThan(
        0,
      );
    });
    await userEvent.setup().click(screen.getByRole("button", { name: /Mark Read/i }));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-action-error").textContent).toMatch(
        /Cannot mark|Unable/i,
      );
    });
  });

  it("supports keyboard row activation and transition select", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformNotificationsView section="notifications" />));
    await waitFor(() => {
      expect(screen.getAllByText(MOCK_NOTIFICATION.title).length).toBeGreaterThan(
        0,
      );
    });
    const row = screen.getAllByText(MOCK_NOTIFICATION.title)[0]!.closest("tr");
    expect(row).toBeTruthy();
    row!.focus();
    await user.keyboard("{Enter}");
    fireEvent.change(screen.getByLabelText(/Transition target/i), {
      target: { value: "dismissed" },
    });
    expect(
      (screen.getByLabelText(/Transition target/i) as HTMLSelectElement).value,
    ).toBe("dismissed");
  });

  it("shows diagnostics when health is degraded and capabilities present", async () => {
    const degraded = createMockNotificationClient();
    degraded.getHealth = async () => ({
      notificationEnabled: true,
      deliveryPlaneReady: false,
      deliveryEnabled: false,
      providersConfigured: false,
      workersReady: false,
      eventBusReady: false,
      realtimeReady: false,
      persistenceMode: "memory",
      healthy: false,
      status: "degraded",
    });
    degraded.getReadiness = async () => ({
      notificationEnabled: true,
      deliveryPlaneReady: false,
      deliveryEnabled: false,
      providersConfigured: false,
      workersReady: false,
      eventBusReady: false,
      realtimeReady: false,
      persistenceMode: "memory",
      ready: false,
      status: "not_ready",
    });
    setNotificationClient(degraded);
    render(wrap(<PlatformNotificationsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diagnostics-capabilities-json")).toBeTruthy();
    });
    expect(screen.getByTestId("diagnostics-capabilities-json").textContent).toContain(
      "delivery",
    );
  });

  it("shows select-notification empty states for recipients and references", async () => {
    const emptyList = createMockNotificationClient();
    emptyList.listNotifications = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    setNotificationClient(emptyList);
    render(wrap(<PlatformNotificationsView section="recipients" />));
    await waitFor(() => {
      expect(screen.getByText(/Select a notification/i)).toBeTruthy();
    });
    cleanup();
    render(wrap(<PlatformNotificationsView section="references" />));
    await waitFor(() => {
      expect(screen.getByText(/Select a notification/i)).toBeTruthy();
    });
  });

  it("shows empty recipients and references lists", async () => {
    const emptyScoped = createMockNotificationClient();
    emptyScoped.listRecipients = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    emptyScoped.listReferences = async () => ({
      items: [],
      page: { limit: 0, hasMore: false },
    });
    setNotificationClient(emptyScoped);
    render(wrap(<PlatformNotificationsView section="recipients" />));
    await waitFor(() => {
      expect(screen.getByText(/No recipients/i)).toBeTruthy();
    });
    cleanup();
    render(wrap(<PlatformNotificationsView section="references" />));
    await waitFor(() => {
      expect(screen.getByText(/No references/i)).toBeTruthy();
    });
  });

  it("shows preference and audit error retry controls", async () => {
    const { NotificationClientError } = await import(
      "@/lib/notifications/notification-errors"
    );
    const broken = createMockNotificationClient();
    broken.listPreferences = async () => {
      throw new NotificationClientError({ message: "prefs", status: 500 });
    };
    broken.listAudit = async () => {
      throw new NotificationClientError({
        message: "audit",
        status: 403,
        code: "FORBIDDEN",
      });
    };
    broken.listNotificationAudit = async () => {
      throw new NotificationClientError({
        message: "audit",
        status: 403,
        code: "FORBIDDEN",
      });
    };
    broken.listCategories = async () => {
      throw new NotificationClientError({ message: "cats", status: 500 });
    };
    broken.listChannels = async () => {
      throw new NotificationClientError({ message: "channels", status: 500 });
    };
    setNotificationClient(broken);

    render(wrap(<PlatformNotificationsView section="preferences" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-error")).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /Retry/i })).toBeTruthy();

    cleanup();
    render(wrap(<PlatformNotificationsView section="audit" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-forbidden")).toBeTruthy();
    });

    cleanup();
    render(wrap(<PlatformNotificationsView section="categories" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-error")).toBeTruthy();
    });

    cleanup();
    render(wrap(<PlatformNotificationsView section="channels" />));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-error")).toBeTruthy();
    });
  });
});

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  CommandRegistryProvider,
  type ActionRegistryDto,
} from "@apzhub/command-framework/react";
import { NotificationServiceProvider } from "@apzhub/event-notification-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { DesktopShell } from "./desktop-shell";
import { seedNotificationService } from "./notifications/test-fixtures";

const sampleDto = {
  actions: [
    {
      id: "platform.theme.toggle",
      label: "Toggle Theme",
      handler: "service:theme:toggle",
      handlerKind: "service" as const,
      source: "manifest" as const,
    },
  ],
  toolbar: [],
} satisfies ActionRegistryDto;

function ShellProviders({
  children,
  service = seedNotificationService(),
}: {
  readonly children: ReactNode;
  readonly service?: ReturnType<typeof seedNotificationService>;
}) {
  const execute = vi.fn().mockResolvedValue({
    ok: true,
    code: "SUCCESS",
    actionId: "platform.theme.toggle",
    actor: "user",
    durationMs: 1,
  });

  return (
    <ThemeProvider>
      <NotificationServiceProvider service={service}>
        <CommandRegistryProvider
          dto={sampleDto}
          executor={{
            execute,
            executeSync: vi.fn(),
            getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
          }}
        >
          {children}
        </CommandRegistryProvider>
      </NotificationServiceProvider>
    </ThemeProvider>
  );
}

describe("DesktopShell notifications", () => {
  it("renders badge unread count when enableNotificationBadge is true", () => {
    render(
      <ShellProviders>
        <DesktopShell enableNotificationBadge activityBarItems={[]} sidebarItems={[]}>
          <p>Workspace</p>
        </DesktopShell>
      </ShellProviders>,
    );

    const shellNotifications = screen.getByTestId("workbench-notifications");
    expect(
      within(shellNotifications).getByTestId("notification-badge-count"),
    ).toHaveTextContent("1");
  });

  it("opens panel and marks all read when badge and panel are enabled", async () => {
    const user = userEvent.setup();
    const service = seedNotificationService();

    render(
      <ShellProviders service={service}>
        <DesktopShell
          enableNotificationBadge
          enableNotificationPanel
          activityBarItems={[]}
          sidebarItems={[]}
        >
          <p>Workspace</p>
        </DesktopShell>
      </ShellProviders>,
    );

    const shellNotifications = screen.getByTestId("workbench-notifications");
    await user.click(within(shellNotifications).getByTestId("notification-badge"));

    expect(
      within(shellNotifications).getByTestId("notification-panel"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bootstrap complete")).toBeInTheDocument();

    await user.click(screen.getByTestId("notification-mark-all-read"));

    await waitFor(() => {
      expect(service.getUnreadCount()).toBe(0);
    });
  });

  it("does not render notifications when flags are disabled", () => {
    render(
      <ShellProviders>
        <DesktopShell activityBarItems={[]} sidebarItems={[]}>
          <p>Workspace</p>
        </DesktopShell>
      </ShellProviders>,
    );

    expect(screen.queryByTestId("workbench-notifications")).not.toBeInTheDocument();
  });
});

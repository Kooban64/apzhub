import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  CommandRegistryProvider,
  type ActionRegistryDto,
} from "@apzhub/command-framework/react";
import { createDefaultNotificationService } from "@apzhub/event-notification-framework";
import { NotificationServiceProvider } from "@apzhub/event-notification-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { NotificationPanelExperience } from "./notification-panel-experience";
import {
  seedNotificationService,
  seedNotificationServiceWithAction,
} from "./test-fixtures";

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

function Providers({
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

describe("NotificationPanelExperience", () => {
  it("renders notifications and marks one read", async () => {
    const user = userEvent.setup();
    const service = seedNotificationService();

    render(
      <Providers service={service}>
        <NotificationPanelExperience open />
      </Providers>,
    );

    expect(screen.getByText("Bootstrap complete")).toBeInTheDocument();
    expect(screen.getByTestId("notification-diagnostics")).toHaveAttribute(
      "data-unread-count",
      "1",
    );

    await user.click(
      screen.getByTestId("notification-mark-read-env-shell-1:platform.inbox.system"),
    );

    await waitFor(() => {
      expect(service.getUnreadCount()).toBe(0);
    });
  });

  it("marks all notifications read", async () => {
    const user = userEvent.setup();
    const service = seedNotificationService();

    render(
      <Providers service={service}>
        <NotificationPanelExperience open />
      </Providers>,
    );

    await user.click(screen.getByTestId("notification-mark-all-read"));

    await waitFor(() => {
      expect(service.getUnreadCount()).toBe(0);
    });
  });

  it("shows empty state when service has no notifications", () => {
    render(
      <Providers service={createDefaultNotificationService()}>
        <NotificationPanelExperience open />
      </Providers>,
    );

    expect(screen.getByTestId("notification-panel-empty")).toBeInTheDocument();
  });

  it("delegates actionRef through Action Framework execute", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "platform.theme.toggle",
      actor: "user",
      durationMs: 1,
    });
    const service = seedNotificationServiceWithAction();

    render(
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
            <NotificationPanelExperience open onActionExecuted={vi.fn()} />
          </CommandRegistryProvider>
        </NotificationServiceProvider>
      </ThemeProvider>,
    );

    await user.click(
      screen.getByTestId("notification-action-env-shell-1:platform.inbox.system"),
    );

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("platform.theme.toggle", {
        actor: "user",
        args: { source: "notification" },
      });
    });
  });
});

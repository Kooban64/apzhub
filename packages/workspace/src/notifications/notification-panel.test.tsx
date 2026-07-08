import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { NotificationPriorityGroup, NotificationViewModel } from "./types";
import { NotificationPanel } from "./notification-panel";

const viewModel: NotificationViewModel = {
  notificationId: "env-1:platform.inbox.system",
  routeId: "platform.inbox.system",
  eventId: "system.platform.bootstrap.completed",
  title: "Bootstrap complete",
  body: "Platform is ready",
  kind: "inbox",
  channel: "in-app",
  priority: "high",
  severity: "warning",
  timestamp: "2026-07-04T10:00:00.000Z",
  relativeTimestamp: "5m ago",
  readState: "unread",
  isUnread: true,
  category: "system",
  correlationId: "corr-1",
};

const groups: readonly NotificationPriorityGroup[] = [
  {
    key: "high",
    label: "High priority",
    priority: "high",
    severity: "warning",
    items: [viewModel],
    unreadCount: 1,
  },
];

describe("NotificationPanel", () => {
  it("renders empty state when there are no notifications", () => {
    render(
      <NotificationPanel
        open
        groups={[]}
        viewModels={[]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />,
    );

    expect(screen.getByTestId("notification-panel-empty")).toBeInTheDocument();
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("renders grouped notifications and read controls", () => {
    render(
      <NotificationPanel
        open
        groups={groups}
        viewModels={[viewModel]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onSelectAction={vi.fn()}
      />,
    );

    expect(screen.getByTestId("notification-panel")).toBeInTheDocument();
    expect(screen.getByText("Bootstrap complete")).toBeInTheDocument();
    expect(screen.getByTestId("notification-mark-all-read")).toBeInTheDocument();
    expect(
      screen.getByTestId(`notification-mark-read-${viewModel.notificationId}`),
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <NotificationPanel
        open={false}
        groups={groups}
        viewModels={[viewModel]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("notification-panel")).not.toBeInTheDocument();
  });
});

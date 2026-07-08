import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotificationBadge } from "./notification-badge";

describe("NotificationBadge", () => {
  it("shows unread count badge", () => {
    render(<NotificationBadge unreadCount={3} onPress={vi.fn()} />);

    expect(screen.getByTestId("notification-badge")).toBeInTheDocument();
    expect(screen.getByTestId("notification-badge-count")).toHaveTextContent("3");
    expect(screen.getByLabelText("Notifications, 3 unread")).toBeInTheDocument();
  });

  it("hides count badge when unread is zero", () => {
    render(<NotificationBadge unreadCount={0} onPress={vi.fn()} />);

    expect(screen.queryByTestId("notification-badge-count")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Notifications, none unread")).toBeInTheDocument();
  });
});

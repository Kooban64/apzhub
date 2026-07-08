import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { NotificationServiceProvider } from "@apzhub/event-notification-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { NotificationBadgeExperience } from "./notification-badge-experience";
import { seedNotificationService } from "./test-fixtures";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationServiceProvider service={seedNotificationService()}>
        {children}
      </NotificationServiceProvider>
    </ThemeProvider>
  );
}

describe("NotificationBadgeExperience", () => {
  it("shows unread count from presentation layer", () => {
    render(
      <Wrapper>
        <NotificationBadgeExperience />
      </Wrapper>,
    );

    expect(screen.getByTestId("notification-badge-count")).toHaveTextContent("1");
    expect(screen.getByTestId("notification-diagnostics")).toHaveAttribute(
      "data-surface",
      "notification-badge",
    );
  });
});

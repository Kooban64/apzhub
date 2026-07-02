import { ThemeProvider } from "@apzhub/theme";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DesktopShell } from "./desktop-shell";

describe("DesktopShell", () => {
  it("renders activity bar, sidebar items, and children", () => {
    render(
      <ThemeProvider>
        <DesktopShell
          userName="Dev User"
          environment="development"
          activityBarItems={[
            {
              id: "platform-home",
              label: "Home",
              active: true,
              ariaLabel: "Home workspace",
            },
          ]}
          sidebarItems={[
            { id: "platform-home-overview", label: "Overview", active: true },
          ]}
        >
          <p>Welcome</p>
        </DesktopShell>
      </ThemeProvider>,
    );

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Dev User")).toBeInTheDocument();
  });
});

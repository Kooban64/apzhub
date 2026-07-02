import { ThemeProvider } from "@apzhub/theme";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Header } from "./header";

function renderHeader(props: React.ComponentProps<typeof Header> = {}) {
  return render(
    <ThemeProvider>
      <Header {...props} />
    </ThemeProvider>,
  );
}

describe("Header", () => {
  it("renders branding and user name", () => {
    renderHeader({ userName: "Dev User" });
    expect(screen.getByText("APZHUB")).toBeInTheDocument();
    expect(screen.getByText("Dev User")).toBeInTheDocument();
  });

  it("invokes sign out handler", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    renderHeader({ userName: "Dev User", onSignOut });

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});

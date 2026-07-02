import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBar } from "./status-bar";

describe("StatusBar", () => {
  it("renders environment and connection status", () => {
    render(<StatusBar environment="test" connectionStatus="connected" />);
    expect(screen.getByText("Environment: test")).toBeInTheDocument();
    expect(screen.getByText("Platform: connected")).toBeInTheDocument();
  });

  it("uses semantic token classes for degraded status", () => {
    const { container } = render(
      <StatusBar environment="test" connectionStatus="degraded" />,
    );
    const status = container.querySelector(".text-\\[var\\(--color-warning\\)\\]");
    expect(status).toBeTruthy();
  });
});

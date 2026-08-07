import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GovernanceContextView } from "./governance-context-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("GovernanceContextView (N-03)", () => {
  beforeEach(() => {
    // no-op
  });

  it("presents experience model for consumer products without claiming ownership", () => {
    render(<GovernanceContextView permissions={["law.view"]} />);
    expect(screen.getByTestId("governance-context-consumers")).toBeInTheDocument();
    expect(screen.getByTestId("governance-context-projects")).toBeInTheDocument();
    expect(screen.getByTestId("governance-context-workflow")).toBeInTheDocument();
    expect(screen.getByTestId("governance-context-documents")).toBeInTheDocument();
    expect(screen.getByTestId("governance-context-support")).toBeInTheDocument();
    expect(screen.getByTestId("governance-context-apzqep")).toBeInTheDocument();
    expect(screen.getByText(/Actual wiring into Projects/i)).toBeInTheDocument();
  });
});

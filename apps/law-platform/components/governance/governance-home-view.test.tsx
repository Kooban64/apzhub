import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GovernanceHomeView } from "./governance-home-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("GovernanceHomeView (N-03 Governance Companion)", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders governance-first home with GQ catalogue — not practice admin", () => {
    render(<GovernanceHomeView permissions={["law.view"]} />);
    expect(screen.getByTestId("governance-page")).toBeInTheDocument();
    expect(screen.getByTestId("governance-home-onboarding")).toBeInTheDocument();
    expect(screen.getByTestId("governance-home-prompts")).toBeInTheDocument();
    expect(screen.getByTestId("governance-home-questions")).toBeInTheDocument();
    expect(screen.getByTestId("governance-home-question-GQ-01")).toBeInTheDocument();
    expect(
      screen.getByTestId("governance-home-prompt-obligations-today"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("governance-home-practice-note"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText(/Start with a governance question/i)).toBeInTheDocument();
  });

  it("shows practice operator note only for law.admin", () => {
    const { rerender } = render(<GovernanceHomeView permissions={["law.view"]} />);
    expect(
      screen.queryByTestId("governance-home-practice-note"),
    ).not.toBeInTheDocument();
    rerender(<GovernanceHomeView permissions={["law.admin"]} />);
    expect(screen.getByTestId("governance-home-practice-note")).toBeInTheDocument();
  });
});

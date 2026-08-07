import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsHomeView } from "./analytics-home-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("AnalyticsHomeView (N-03 Decision Companion)", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders question-first home with horizons — not dashboard suites", () => {
    render(<AnalyticsHomeView permissions={["analytics.view"]} />);
    expect(screen.getByTestId("analytics-page")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-onboarding")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-horizons")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-questions")).toBeInTheDocument();
    expect(
      screen.getByTestId("analytics-home-horizon-operational"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-question-EQ-E01")).toBeInTheDocument();
    expect(screen.queryByTestId("analytics-home-suites")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText(/Start with a business question/i)).toBeInTheDocument();
  });

  it("shows operator note only for admin", () => {
    const { rerender } = render(<AnalyticsHomeView permissions={["analytics.view"]} />);
    expect(
      screen.queryByTestId("analytics-home-operator-note"),
    ).not.toBeInTheDocument();
    rerender(<AnalyticsHomeView permissions={["analytics.admin"]} />);
    expect(screen.getByTestId("analytics-home-operator-note")).toBeInTheDocument();
  });
});

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TrustDashboardPage } from "./trust-dashboard-page";
import { TrustWorkflowProvider } from "../../lib/trust/trust-workflow-context";
import { resetSharedTrustWorkbench } from "../../lib/trust/shared-trust-workbench";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("TrustDashboardPage", () => {
  beforeEach(() => {
    resetSharedTrustWorkbench();
  });

  it("renders dashboard metrics, navigation, and diagnostics panel", async () => {
    render(
      <TrustWorkflowProvider>
        <TrustDashboardPage />
      </TrustWorkflowProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("trust-dashboard-page")).toBeInTheDocument();
    });

    expect(screen.getByTestId("trust-sub-nav")).toBeInTheDocument();
    expect(screen.getByTestId("trust-dashboard-metrics")).toBeInTheDocument();
    expect(screen.getByTestId("trust-diagnostics-panel")).toBeInTheDocument();
    expect(screen.getByTestId("trust-compliance-placeholder")).toBeInTheDocument();
    expect(screen.getByText(/Total trust balance/i)).toBeInTheDocument();
  });
});

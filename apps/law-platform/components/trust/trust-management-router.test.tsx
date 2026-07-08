import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TrustManagementRouter } from "./trust-management-router";
import { TrustWorkflowProvider } from "../../lib/trust/trust-workflow-context";
import { resetSharedTrustWorkbench } from "../../lib/trust/shared-trust-workbench";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("TrustManagementRouter", () => {
  beforeEach(() => {
    resetSharedTrustWorkbench();
  });

  it("routes to dashboard, accounts, transactions, allocations, reconciliation, interest, transfers, and reports", async () => {
    const { rerender } = render(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust" />
      </TrustWorkflowProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("trust-dashboard-page")).toBeInTheDocument();
    });

    rerender(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust/accounts" />
      </TrustWorkflowProvider>,
    );
    expect(screen.getByTestId("trust-accounts-page")).toBeInTheDocument();

    rerender(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust/transactions" />
      </TrustWorkflowProvider>,
    );
    expect(screen.getByTestId("trust-transactions-page")).toBeInTheDocument();

    rerender(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust/allocations" />
      </TrustWorkflowProvider>,
    );
    expect(screen.getByTestId("trust-allocations-page")).toBeInTheDocument();

    rerender(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust/reconciliation" />
      </TrustWorkflowProvider>,
    );
    expect(screen.getByTestId("trust-reconciliation-page")).toBeInTheDocument();

    rerender(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust/interest" />
      </TrustWorkflowProvider>,
    );
    expect(screen.getByTestId("trust-interest-page")).toBeInTheDocument();

    rerender(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust/transfers" />
      </TrustWorkflowProvider>,
    );
    expect(screen.getByTestId("trust-transfers-page")).toBeInTheDocument();

    rerender(
      <TrustWorkflowProvider>
        <TrustManagementRouter pathname="/workspace/law/trust/reports" />
      </TrustWorkflowProvider>,
    );
    expect(screen.getByTestId("trust-reports-page")).toBeInTheDocument();
  });
});

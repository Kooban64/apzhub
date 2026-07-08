import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TrustReportsPage } from "./trust-reports-page";
import { TrustWorkflowProvider } from "../../lib/trust/trust-workflow-context";
import { resetSharedTrustWorkbench } from "../../lib/trust/shared-trust-workbench";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../../lib/trust/trust-report-export", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lib/trust/trust-report-export")>();
  return {
    ...actual,
    downloadTrustReportCsv: vi.fn(),
    openTrustReportPrintView: vi.fn(),
  };
});

import {
  downloadTrustReportCsv,
  openTrustReportPrintView,
} from "../../lib/trust/trust-report-export";

describe("TrustReportsPage", () => {
  beforeEach(() => {
    resetSharedTrustWorkbench();
    vi.mocked(downloadTrustReportCsv).mockReset();
    vi.mocked(openTrustReportPrintView).mockReset();
  });

  it("renders export buttons after generating a report", async () => {
    const user = userEvent.setup();

    render(
      <TrustWorkflowProvider>
        <TrustReportsPage />
      </TrustWorkflowProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Generate report/i }));

    await waitFor(() => {
      expect(screen.getByTestId("trust-report-export-csv")).toBeInTheDocument();
    });

    expect(screen.getByTestId("trust-report-print-view")).toBeInTheDocument();
  });

  it("invokes CSV export and print view handlers", async () => {
    const user = userEvent.setup();

    render(
      <TrustWorkflowProvider>
        <TrustReportsPage />
      </TrustWorkflowProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Generate report/i }));

    await waitFor(() => {
      expect(screen.getByTestId("trust-report-export-csv")).toBeEnabled();
    });

    await user.click(screen.getByTestId("trust-report-export-csv"));
    await user.click(screen.getByTestId("trust-report-print-view"));

    expect(downloadTrustReportCsv).toHaveBeenCalledTimes(1);
    expect(openTrustReportPrintView).toHaveBeenCalledTimes(1);
  });
});

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvoiceManagementRouter } from "./invoice-management-router";
import {
  getSharedInvoiceRepository,
  resetSharedInvoiceRepository,
} from "../../lib/billing";
import { InvoiceWorkflowProvider } from "../../lib/billing/invoice-workflow-context";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("InvoiceManagementRouter", () => {
  beforeEach(() => {
    resetSharedInvoiceRepository();
  });

  it("routes to list, detail, create, edit, and preview pages", async () => {
    const { rerender } = render(
      <InvoiceWorkflowProvider>
        <InvoiceManagementRouter pathname="/workspace/law/billing" />
      </InvoiceWorkflowProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("invoice-list-page")).toBeInTheDocument();
    });

    rerender(
      <InvoiceWorkflowProvider>
        <InvoiceManagementRouter pathname="/workspace/law/billing/new" />
      </InvoiceWorkflowProvider>,
    );
    expect(screen.getByTestId("invoice-form-page")).toBeInTheDocument();

    const invoice = getSharedInvoiceRepository().list()[0]!;
    rerender(
      <InvoiceWorkflowProvider>
        <InvoiceManagementRouter
          pathname={`/workspace/law/billing/${invoice.invoiceId}`}
        />
      </InvoiceWorkflowProvider>,
    );
    expect(
      screen.getByRole("heading", { name: invoice.invoiceReference }),
    ).toBeInTheDocument();

    rerender(
      <InvoiceWorkflowProvider>
        <InvoiceManagementRouter
          pathname={`/workspace/law/billing/${invoice.invoiceId}/edit`}
        />
      </InvoiceWorkflowProvider>,
    );
    expect(screen.getByTestId("invoice-form-page")).toBeInTheDocument();

    rerender(
      <InvoiceWorkflowProvider>
        <InvoiceManagementRouter
          pathname={`/workspace/law/billing/${invoice.invoiceId}/preview`}
        />
      </InvoiceWorkflowProvider>,
    );
    expect(screen.getByTestId("invoice-preview-page")).toBeInTheDocument();
  });
});

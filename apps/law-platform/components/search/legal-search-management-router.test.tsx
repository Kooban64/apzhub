import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LegalSearchManagementRouter } from "./legal-search-management-router";
import { resetLegalSearchWorkflowDiagnostics } from "../../lib/search";
import { renderWithLegalSearchWorkflow } from "../../lib/search/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LegalSearchManagementRouter", () => {
  beforeEach(() => {
    resetLegalSearchWorkflowDiagnostics();
  });

  it("routes to the unified search page", async () => {
    renderWithLegalSearchWorkflow(
      <LegalSearchManagementRouter
        pathname="/workspace/law/search"
        initialSearchQuery="Harbourview"
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("legal-search-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
  });
});

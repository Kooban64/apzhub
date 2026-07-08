import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientListPage } from "./client-list-page";
import { renderWithClientWorkflow } from "../../lib/clients/test-utils";
import { resetSharedClientRepository } from "../../lib/clients";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("ClientListPage", () => {
  beforeEach(() => {
    push.mockReset();
    resetSharedClientRepository();
    vi.useRealTimers();
  });

  it("renders list layout with search, filters, table, and pagination", async () => {
    renderWithClientWorkflow(<ClientListPage />);

    expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("client-search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("law-filter-bar")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("client-list-table")).toBeInTheDocument();
    });

    expect(screen.getByTestId("law-pagination")).toBeInTheDocument();
    expect(screen.getByText("Harbourview Holdings Pty Ltd")).toBeInTheDocument();
  });

  it("navigates to create client from toolbar", async () => {
    const user = userEvent.setup();
    renderWithClientWorkflow(<ClientListPage />);

    await waitFor(() => {
      expect(screen.getByTestId("client-toolbar-create")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("client-toolbar-create"));
    expect(push).toHaveBeenCalledWith("/workspace/law/clients/new");
  });
});

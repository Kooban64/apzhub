import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientManagementRouter } from "./client-management-router";
import { SEED_CLIENTS, resetSharedClientRepository } from "../../lib/clients";
import { renderWithClientWorkflow } from "../../lib/clients/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ClientManagementRouter", () => {
  beforeEach(() => {
    resetSharedClientRepository();
  });

  it("routes to list, detail, create, and edit pages", async () => {
    const { rerender } = renderWithClientWorkflow(
      <ClientManagementRouter pathname="/workspace/law/clients" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    });

    rerender(<ClientManagementRouter pathname="/workspace/law/clients/new" />);
    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();

    const client = SEED_CLIENTS[0]!;
    rerender(
      <ClientManagementRouter pathname={`/workspace/law/clients/${client.clientId}`} />,
    );
    expect(
      screen.getByRole("heading", { name: client.displayName }),
    ).toBeInTheDocument();

    rerender(
      <ClientManagementRouter
        pathname={`/workspace/law/clients/${client.clientId}/edit`}
      />,
    );
    expect(screen.getByDisplayValue(client.displayName)).toBeInTheDocument();
  });
});

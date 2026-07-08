import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientDetailPage } from "./client-detail-page";
import { renderWithClientWorkflow } from "../../lib/clients/test-utils";
import { SEED_CLIENTS, resetSharedClientRepository } from "../../lib/clients";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("ClientDetailPage", () => {
  beforeEach(() => {
    push.mockReset();
    resetSharedClientRepository();
  });

  it("renders detail layout with summary, properties, and CRM tabs", async () => {
    const client = SEED_CLIENTS[0]!;
    renderWithClientWorkflow(<ClientDetailPage clientId={client.clientId} />);

    expect(screen.getByTestId("law-detail-page-layout")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: client.displayName }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("law-detail-properties")).toBeInTheDocument();
    expect(screen.getByTestId("law-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("client-context-panel")).toBeInTheDocument();
  });

  it("shows related matters tab content", async () => {
    const user = userEvent.setup();
    const client = SEED_CLIENTS[0]!;
    renderWithClientWorkflow(<ClientDetailPage clientId={client.clientId} />);

    await user.click(screen.getByRole("tab", { name: "Matters" }));
    expect(screen.getByTestId("client-related-matters")).toBeInTheDocument();
  });
});

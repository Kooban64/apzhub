import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientFormPage } from "./client-form-page";
import { SEED_CLIENTS, resetSharedClientRepository } from "../../lib/clients";
import { renderWithClientWorkflow } from "../../lib/clients/test-utils";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("ClientFormPage", () => {
  beforeEach(() => {
    push.mockReset();
    resetSharedClientRepository();
  });

  it("validates create form and shows success without persisting", async () => {
    const user = userEvent.setup();
    renderWithClientWorkflow(<ClientFormPage mode="create" />);

    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("client-form-fields")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByTestId("law-form-validation-summary")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Display name/i), "New Client Pty Ltd");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByTestId("law-success-dialog")).toBeInTheDocument();
  });

  it("populates edit form from the in-memory repository", () => {
    const client = SEED_CLIENTS[1]!;
    renderWithClientWorkflow(<ClientFormPage mode="edit" clientId={client.clientId} />);

    expect(screen.getByDisplayValue(client.displayName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(client.clientReference)).toBeInTheDocument();
  });
});

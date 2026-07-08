import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  LawConfirmationDialog,
  LawDeleteDialog,
  LawSidePanel,
  LawSuccessDialog,
} from "./index";

describe("Law UX dialogs and panels", () => {
  it("renders confirmation dialog actions", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <LawConfirmationDialog
        open
        title="Confirm"
        description="Proceed?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("renders delete dialog", () => {
    render(
      <LawDeleteDialog
        open
        title="Delete"
        description="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByTestId("law-delete-dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders success dialog", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <LawSuccessDialog
        open
        title="Saved"
        description="Changes saved."
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders side panel and close control", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <LawSidePanel title="Details" open onClose={onClose}>
        Panel body
      </LawSidePanel>,
    );

    expect(screen.getByTestId("law-side-panel")).toHaveTextContent("Panel body");
    await user.click(screen.getByRole("button", { name: "Close panel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

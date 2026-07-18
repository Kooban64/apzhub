import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  AttachmentMetadataList,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  StatusBadge,
  SupportTable,
  VisibilityBadge,
} from "./support-ui";

describe("support-ui states", () => {
  it("renders ErrorState unavailable and forbidden messaging with retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorState
        message="Support is temporarily unavailable. Try again later."
        onRetry={onRetry}
      />,
    );
    expect(screen.getByTestId("support-error").textContent).toMatch(/unavailable/i);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();

    render(<ErrorState message="You do not have permission to perform this action." />);
    expect(screen.getAllByTestId("support-error")[1]?.textContent).toMatch(
      /permission/i,
    );
  });

  it("renders badges, empty state, attachments, table row click, and confirm dialog", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <>
        <StatusBadge status="open" priority="high" />
        <VisibilityBadge visibility="internal" />
        <VisibilityBadge visibility="public" />
        <EmptyState title="Nothing here" description="Try again" />
        <AttachmentMetadataList
          attachments={[
            {
              id: "att_1",
              articleId: "sart_dddddddddddddddddddddddddddddddd",
              filename: "note.txt",
              contentType: "text/plain",
              sizeBytes: 2048,
              disposition: "attachment",
            },
          ]}
        />
        <SupportTable
          columns={["Name"]}
          rows={[{ id: "row-1", cells: ["Alpha"] }]}
          onRowClick={onRowClick}
        />
        <ConfirmDialog
          open
          title="Confirm?"
          description="Really?"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </>,
    );

    expect(screen.getByTestId("support-status-badge")).toBeTruthy();
    expect(screen.getAllByTestId("support-visibility-badge")).toHaveLength(2);
    expect(screen.getByTestId("support-empty")).toBeTruthy();
    expect(screen.getByTestId("support-attachments").textContent).toContain("note.txt");
    expect(screen.getByTestId("support-attachments").textContent).toContain("2.0 KB");

    await user.click(screen.getByText("Alpha"));
    expect(onRowClick).toHaveBeenCalledWith("row-1");

    await user.click(screen.getByTestId("support-confirm-dialog-confirm"));
    expect(onConfirm).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});

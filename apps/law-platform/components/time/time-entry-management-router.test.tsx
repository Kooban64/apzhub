import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TimeEntryManagementRouter } from "./time-entry-management-router";
import { SEED_TIME_ENTRIES, resetSharedTimeEntryRepository } from "../../lib/time";
import { renderWithTimeEntryWorkflow } from "../../lib/time/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("TimeEntryManagementRouter", () => {
  beforeEach(() => {
    resetSharedTimeEntryRepository();
  });

  it("routes to list, detail, create, and edit pages", async () => {
    const { rerender } = renderWithTimeEntryWorkflow(
      <TimeEntryManagementRouter pathname="/workspace/law/time" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    });

    rerender(<TimeEntryManagementRouter pathname="/workspace/law/time/new" />);
    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();

    const entry = SEED_TIME_ENTRIES[0]!;
    rerender(
      <TimeEntryManagementRouter
        pathname={`/workspace/law/time/${entry.timeEntryId}`}
      />,
    );
    expect(screen.getByRole("heading", { name: entry.narrative })).toBeInTheDocument();

    rerender(
      <TimeEntryManagementRouter
        pathname={`/workspace/law/time/${entry.timeEntryId}/edit`}
      />,
    );
    expect(screen.getByDisplayValue(entry.narrative)).toBeInTheDocument();
  });
});

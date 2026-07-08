import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatterManagementRouter } from "./matter-management-router";
import { SEED_MATTERS, resetSharedMatterRepository } from "../../lib/matters";
import { renderWithMatterWorkflow } from "../../lib/matters/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@apzhub/activity-timeline-framework/react", () => ({
  useActivityService: () => ({ listActivities: () => [], isReady: true }),
}));

vi.mock("@apzhub/event-notification-framework/react", () => ({
  useNotificationService: () => ({ notifications: [], unreadCount: 0 }),
}));

vi.mock("../../lib/search/legal-search-workflow-context", () => ({
  useLegalSearchWorkflow: () => ({
    executeSearch: vi
      .fn()
      .mockResolvedValue({ ok: true, results: [], grouped: {}, filters: {}, run: {} }),
    openResult: vi.fn(),
  }),
}));

describe("MatterManagementRouter", () => {
  beforeEach(() => {
    resetSharedMatterRepository();
  });

  it("routes to list, detail, create, and edit pages", async () => {
    const { rerender } = renderWithMatterWorkflow(
      <MatterManagementRouter pathname="/workspace/law/matters" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    });

    rerender(<MatterManagementRouter pathname="/workspace/law/matters/new" />);
    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();

    const matter = SEED_MATTERS[0]!;
    rerender(
      <MatterManagementRouter pathname={`/workspace/law/matters/${matter.matterId}`} />,
    );
    expect(screen.getByRole("heading", { name: matter.title })).toBeInTheDocument();

    rerender(
      <MatterManagementRouter
        pathname={`/workspace/law/matters/${matter.matterId}/edit`}
      />,
    );
    expect(screen.getByDisplayValue(matter.title)).toBeInTheDocument();

    rerender(
      <MatterManagementRouter
        pathname={`/workspace/law/matters/${matter.matterId}/workspace`}
      />,
    );
    expect(screen.getByTestId("matter-workspace-page")).toBeInTheDocument();
  });
});

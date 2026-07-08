import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CalendarEventManagementRouter } from "./calendar-event-management-router";
import {
  SEED_CALENDAR_EVENTS,
  resetSharedCalendarEventRepository,
} from "../../lib/calendar";
import { renderWithCalendarEventWorkflow } from "../../lib/calendar/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("CalendarEventManagementRouter", () => {
  beforeEach(() => {
    resetSharedCalendarEventRepository();
  });

  it("routes to list, detail, create, and edit pages", async () => {
    const { rerender } = renderWithCalendarEventWorkflow(
      <CalendarEventManagementRouter pathname="/workspace/law/calendar" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("calendar-event-list-page")).toBeInTheDocument();
    });

    rerender(<CalendarEventManagementRouter pathname="/workspace/law/calendar/new" />);
    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();

    const event = SEED_CALENDAR_EVENTS[0]!;
    rerender(
      <CalendarEventManagementRouter
        pathname={`/workspace/law/calendar/${event.calendarEventId}`}
      />,
    );
    expect(screen.getByRole("heading", { name: event.title })).toBeInTheDocument();

    rerender(
      <CalendarEventManagementRouter
        pathname={`/workspace/law/calendar/${event.calendarEventId}/edit`}
      />,
    );
    expect(screen.getByDisplayValue(event.title)).toBeInTheDocument();
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockReportingClient,
  MOCK_REPORT_TEMPLATE,
} from "@/lib/reporting/mock-reporting-client";
import {
  resetReportingClient,
  setReportingClient,
} from "@/lib/reporting/reporting-api";

import { ReportingWorkspaceRouter } from "./reporting-workspace-router";

const usePathname = vi.fn(() => "/workspace/reporting/templates");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("ReportingWorkspaceRouter", () => {
  beforeEach(() => {
    resetReportingClient();
    setReportingClient(createMockReportingClient());
    usePathname.mockReturnValue("/workspace/reporting/templates");
  });

  it("renders templates from pathname", async () => {
    render(wrap(<ReportingWorkspaceRouter />));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Templates" }),
      ).toBeTruthy();
      expect(screen.getByText(MOCK_REPORT_TEMPLATE.name)).toBeTruthy();
    });
  });

  it("renders formats section from pathname", async () => {
    usePathname.mockReturnValue("/workspace/reporting/formats");
    render(wrap(<ReportingWorkspaceRouter />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Formats" })).toBeTruthy();
    });
  });
});

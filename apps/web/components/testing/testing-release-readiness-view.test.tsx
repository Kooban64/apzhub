import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TestingClientError } from "@/lib/testing/errors";
import * as testingApi from "@/lib/testing/testing-api";
import { resetTestingClient } from "@/lib/testing/testing-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/testing/release-readiness",
  useSearchParams: () => new URLSearchParams(),
}));

import { TestingReleaseReadinessView } from "./testing-release-readiness-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingReleaseReadinessView", () => {
  beforeEach(() => {
    resetTestingClient();
    vi.restoreAllMocks();
  });

  it("renders release readiness dimensions from the mock client", async () => {
    render(wrap(<TestingReleaseReadinessView permissions={["release.view"]} />));

    await waitFor(() => {
      expect(screen.getByTestId("testing-release-readiness")).toBeTruthy();
    });

    expect(screen.getByRole("heading", { name: /Release 2.4.0/i })).toBeTruthy();
    expect(screen.getByText("Certification")).toBeTruthy();
    expect(screen.getByTestId("testing-page")).toBeTruthy();
  });

  it("shows error state when release readiness load fails", async () => {
    vi.spyOn(testingApi, "listReleaseReadiness").mockRejectedValue(
      new TestingClientError("Release data unavailable", "ERROR", 500),
    );

    render(wrap(<TestingReleaseReadinessView permissions={["release.view"]} />));

    await waitFor(() => {
      expect(screen.getByText("Release data unavailable")).toBeTruthy();
    });
  });

  it("shows empty state when no release records exist", async () => {
    vi.spyOn(testingApi, "listReleaseReadiness").mockResolvedValue({
      items: [],
      total: 0,
    });

    render(wrap(<TestingReleaseReadinessView permissions={["release.view"]} />));

    await waitFor(() => {
      expect(screen.getByText("No release readiness records found")).toBeTruthy();
    });
  });

  it("shows empty dimensions panel when a release has no dimensions", async () => {
    vi.spyOn(testingApi, "listReleaseReadiness").mockResolvedValue({
      items: [
        {
          id: "rel-empty",
          releaseLabel: "9.9.9",
          overallStatus: "unknown",
          dimensions: [],
          updatedAt: "2026-07-10T10:00:00.000Z",
        },
      ],
      total: 1,
    });

    render(wrap(<TestingReleaseReadinessView permissions={["release.view"]} />));

    await waitFor(() => {
      expect(screen.getByText("No readiness dimensions")).toBeTruthy();
    });
  });
});

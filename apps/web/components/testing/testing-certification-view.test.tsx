import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FIXTURE_IDS } from "@/lib/testing/mock-client";
import { TestingClientError } from "@/lib/testing/errors";
import * as testingApi from "@/lib/testing/testing-api";
import { resetTestingClient } from "@/lib/testing/testing-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/testing/certification",
  useSearchParams: () => new URLSearchParams(),
}));

import { TestingCertificationView } from "./testing-certification-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingCertificationView", () => {
  beforeEach(() => {
    resetTestingClient();
    vi.restoreAllMocks();
  });

  it("shows gates and advisory recommendation on detail", async () => {
    render(
      wrap(
        <TestingCertificationView
          certificationId={FIXTURE_IDS.certification}
          permissions={["certification.*"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Requirement coverage")).toBeTruthy();
    });

    expect(screen.getByText(/Advisory only/i)).toBeTruthy();
    expect(screen.getByText("Open critical defects")).toBeTruthy();
    expect(screen.getByTestId("testing-command-approve")).toBeTruthy();
  });

  it("hides approve when approval permission is missing", async () => {
    render(
      wrap(
        <TestingCertificationView
          certificationId={FIXTURE_IDS.certification}
          permissions={["certification.review", "certification.reject"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Requirement coverage")).toBeTruthy();
    });

    expect(screen.queryByTestId("testing-command-approve")).toBeNull();
    expect(screen.getByTestId("testing-command-review")).toBeTruthy();
    expect(screen.getByTestId("testing-command-reject")).toBeTruthy();
  });

  it("renders certification list view", async () => {
    render(wrap(<TestingCertificationView permissions={["certification.view"]} />));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Certification" })).toBeTruthy();
      expect(screen.getByText("Release 2.4 Certification")).toBeTruthy();
    });
  });

  it("runs review command from detail panel", async () => {
    const user = userEvent.setup();
    render(
      wrap(
        <TestingCertificationView
          certificationId={FIXTURE_IDS.certification}
          permissions={["certification.review", "certification.reject"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("testing-command-review")).toBeTruthy();
    });

    await user.click(screen.getByTestId("testing-command-review"));
    await waitFor(() => {
      expect(screen.getAllByText(/in review/i).length).toBeGreaterThan(0);
    });
  });

  it("runs approve command when permitted", async () => {
    const user = userEvent.setup();
    render(
      wrap(
        <TestingCertificationView
          certificationId={FIXTURE_IDS.certification}
          permissions={["certification.approve", "certification.review"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("testing-command-approve")).toBeTruthy();
    });

    await user.click(screen.getByTestId("testing-command-approve"));
    await waitFor(() => {
      expect(screen.getAllByText(/approved/i).length).toBeGreaterThan(0);
    });
  });

  it("shows list error state", async () => {
    vi.spyOn(testingApi, "listCertifications").mockRejectedValueOnce(
      new TestingClientError("Cert list failed", "ERROR", 500),
    );

    render(wrap(<TestingCertificationView permissions={["certification.view"]} />));

    await waitFor(() => {
      expect(screen.getByText("Cert list failed")).toBeTruthy();
    });
  });

  it("shows list empty state", async () => {
    vi.spyOn(testingApi, "listCertifications").mockResolvedValueOnce({
      items: [],
      total: 0,
    });

    render(wrap(<TestingCertificationView permissions={["certification.view"]} />));

    await waitFor(() => {
      expect(screen.getByText("No certifications found")).toBeTruthy();
    });
  });

  it("shows empty gate, approval, and audit panels on sparse detail", async () => {
    vi.spyOn(testingApi, "getCertification").mockResolvedValueOnce({
      id: FIXTURE_IDS.certification,
      name: "Sparse certification",
      state: "draft",
      recommendation: "pending",
      recommendationAdvisoryOnly: true,
      gates: [],
      approvals: [],
      audit: [],
      updatedAt: "2026-07-10T10:00:00.000Z",
    });

    render(
      wrap(
        <TestingCertificationView
          certificationId={FIXTURE_IDS.certification}
          permissions={["certification.view"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("No gates evaluated")).toBeTruthy();
      expect(screen.getByText("No approval decisions")).toBeTruthy();
      expect(screen.getByText("No audit events")).toBeTruthy();
    });
  });
});

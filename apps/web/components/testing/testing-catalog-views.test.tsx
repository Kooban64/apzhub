import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FIXTURE_IDS } from "@/lib/testing/mock-client";
import * as commands from "@/lib/testing/commands";
import { TestingClientError } from "@/lib/testing/errors";
import * as testingApi from "@/lib/testing/testing-api";
import { resetTestingClient } from "@/lib/testing/testing-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/testing",
  useSearchParams: () => new URLSearchParams(),
}));

import {
  TestingAdministrationView,
  TestingAutomationView,
  TestingCasesView,
  TestingCoverageView,
  TestingDefectsView,
  TestingEvidenceView,
  TestingPlansView,
  TestingQualityView,
  TestingReportsView,
  TestingRequirementsView,
  TestingSuitesView,
} from "./testing-catalog-views";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function expectPageTitle(title: string) {
  expect(screen.getByRole("heading", { level: 1, name: title })).toBeTruthy();
}

describe("Testing catalog views", () => {
  beforeEach(() => {
    resetTestingClient();
    vi.restoreAllMocks();
  });

  it("renders requirements list with fixture content", async () => {
    render(
      wrap(<TestingRequirementsView permissions={["testing.requirements.read"]} />),
    );

    await waitFor(() => {
      expectPageTitle("Requirements");
      expect(screen.getByText("REQ-AUTH-12")).toBeTruthy();
    });
    expect(screen.getByText("Single sign-on silent session handoff")).toBeTruthy();
  });

  it("renders plans list and gates create by permission", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      wrap(<TestingPlansView permissions={["testing.plans.create"]} />),
    );

    await waitFor(() => {
      expectPageTitle("Test plans");
      expect(screen.getByText("Release 2.4 Regression")).toBeTruthy();
    });
    expect(screen.getByTestId("testing-plans-create")).toBeTruthy();

    await user.click(screen.getByTestId("testing-plans-create"));
    await waitFor(() => {
      expect(screen.getAllByText("New test plan").length).toBeGreaterThan(0);
    });

    rerender(wrap(<TestingPlansView permissions={[]} />));
    await waitFor(() => {
      expect(screen.getByText("Release 2.4 Regression")).toBeTruthy();
    });
    expect(screen.queryByTestId("testing-plans-create")).toBeNull();
  });

  it("renders plan detail when planId is provided", async () => {
    render(
      wrap(
        <TestingPlansView
          planId={FIXTURE_IDS.plan}
          permissions={["testing.plans.create"]}
        />,
      ),
    );

    await waitFor(() => {
      expectPageTitle("Release 2.4 Regression");
    });
    expect(screen.getByText(`Plan ${FIXTURE_IDS.plan}`)).toBeTruthy();
    expect(screen.getByText("2.4.0")).toBeTruthy();
    expect(screen.getByTestId("testing-plans-back")).toBeTruthy();
  });

  it("renders suites list and creates suite when permitted", async () => {
    const user = userEvent.setup();
    render(wrap(<TestingSuitesView permissions={["testing.suites.create"]} />));

    await waitFor(() => {
      expectPageTitle("Test suites");
      expect(screen.getByText("Authentication & Access")).toBeTruthy();
    });

    await user.click(screen.getByTestId("testing-suites-create"));
    await waitFor(() => {
      expect(screen.getAllByText("New test suite").length).toBeGreaterThan(0);
    });
  });

  it("hides suite create controls without permission", async () => {
    render(wrap(<TestingSuitesView permissions={[]} />));

    await waitFor(() => {
      expectPageTitle("Test suites");
      expect(screen.getByText("Authentication & Access")).toBeTruthy();
    });
    expect(screen.queryByTestId("testing-suites-create")).toBeNull();
  });

  it("renders cases list and creates case when permitted", async () => {
    const user = userEvent.setup();
    render(wrap(<TestingCasesView permissions={["testing.cases.create"]} />));

    await waitFor(() => {
      expectPageTitle("Test cases");
      expect(screen.getByText("TC-AUTH-001")).toBeTruthy();
    });
    expect(screen.getByText("Verify SSO silent handoff")).toBeTruthy();

    await user.click(screen.getByTestId("testing-cases-create"));
    await waitFor(() => {
      expect(screen.getAllByText("New test case").length).toBeGreaterThan(0);
    });
  });

  it("hides case create controls without permission", async () => {
    render(wrap(<TestingCasesView permissions={[]} />));

    await waitFor(() => {
      expectPageTitle("Test cases");
    });
    expect(screen.queryByTestId("testing-cases-create")).toBeNull();
  });

  it("renders automation runs", async () => {
    render(wrap(<TestingAutomationView permissions={["automation.view"]} />));

    await waitFor(() => {
      expectPageTitle("Automation");
      expect(screen.getByText("playwright")).toBeTruthy();
    });
  });

  it("renders evidence metadata without upload controls", async () => {
    render(wrap(<TestingEvidenceView permissions={["evidence.read"]} />));

    await waitFor(() => {
      expectPageTitle("Evidence");
      expect(screen.getByText("SSO redirect capture")).toBeTruthy();
    });
    expect(screen.getByText("image/png")).toBeTruthy();
    expect(screen.getByText("0 B")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /upload/i })).toBeNull();
    expect(screen.queryByTestId("testing-evidence-upload")).toBeNull();
  });

  it("renders coverage summaries", async () => {
    render(wrap(<TestingCoverageView permissions={["coverage.view"]} />));

    await waitFor(() => {
      expectPageTitle("Coverage");
      expect(screen.getByText("Requirements")).toBeTruthy();
    });
    expect(screen.getByText("98%")).toBeTruthy();
  });

  it("renders defects list", async () => {
    render(wrap(<TestingDefectsView permissions={["defects.view"]} />));

    await waitFor(() => {
      expectPageTitle("Defects");
      expect(
        screen.getByText("Intermittent SSO timeout on mobile Safari"),
      ).toBeTruthy();
    });
  });

  it("renders quality summaries", async () => {
    render(wrap(<TestingQualityView permissions={["quality.view"]} />));

    await waitFor(() => {
      expectPageTitle("Quality");
      expect(screen.getByText("Release 2.4 quality posture")).toBeTruthy();
    });
  });

  it("renders report placeholders", async () => {
    render(wrap(<TestingReportsView permissions={["reporting.view"]} />));

    await waitFor(() => {
      expectPageTitle("Reports");
      expect(screen.getByText("Execution summary")).toBeTruthy();
    });
    expect(screen.getByText("Certification audit trail")).toBeTruthy();
    expect(screen.getAllByText("Placeholder")).toHaveLength(2);
  });

  it("renders administration settings", async () => {
    render(wrap(<TestingAdministrationView permissions={["testing.admin"]} />));

    await waitFor(() => {
      expectPageTitle("Administration");
      expect(screen.getByText("Evidence retention (days)")).toBeTruthy();
    });
    expect(screen.getByText("365")).toBeTruthy();
  });

  it("filters list views via search inputs", async () => {
    const user = userEvent.setup();
    render(
      wrap(<TestingRequirementsView permissions={["testing.requirements.read"]} />),
    );

    await waitFor(() => {
      expect(screen.getByText("REQ-AUTH-12")).toBeTruthy();
    });

    await user.type(screen.getByTestId("testing-requirements-search"), "mfa");
    await waitFor(() => {
      expect(screen.queryByText("REQ-AUTH-12")).toBeNull();
      expect(screen.getByText("REQ-AUTH-18")).toBeTruthy();
    });
  });

  it("shows create mutation errors for suites and cases", async () => {
    const user = userEvent.setup();
    vi.spyOn(commands, "executeTestingCommand").mockRejectedValue(
      new TestingClientError("Create failed", "ERROR", 500),
    );

    const { rerender } = render(
      wrap(<TestingSuitesView permissions={["testing.suites.create"]} />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("testing-suites-create")).toBeTruthy();
    });
    await user.click(screen.getByTestId("testing-suites-create"));
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Create failed");
    });

    rerender(wrap(<TestingCasesView permissions={["testing.cases.create"]} />));
    await waitFor(() => {
      expect(screen.getByTestId("testing-cases-create")).toBeTruthy();
    });
    await user.click(screen.getByTestId("testing-cases-create"));
    await waitFor(() => {
      expect(
        screen
          .getAllByRole("alert")
          .some((node) => node.textContent?.includes("Create failed")),
      ).toBe(true);
    });
  });

  it("shows plan detail error for missing plans", async () => {
    vi.spyOn(testingApi, "getPlan").mockRejectedValue(
      new TestingClientError("Plan not found", "NOT_FOUND", 404),
    );

    render(
      wrap(
        <TestingPlansView
          planId="missing-plan"
          permissions={["testing.plans.create"]}
        />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Plan not found")).toBeTruthy();
    });
  });

  it("shows list query error states", async () => {
    vi.spyOn(testingApi, "listRequirements").mockRejectedValueOnce(
      new TestingClientError("Requirements unavailable", "ERROR", 500),
    );

    render(
      wrap(<TestingRequirementsView permissions={["testing.requirements.read"]} />),
    );

    await waitFor(() => {
      expect(screen.getByText("Requirements unavailable")).toBeTruthy();
    });
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockReportingClient,
  MOCK_REPORT_METADATA,
  MOCK_REPORT_TEMPLATE,
} from "@/lib/reporting/mock-reporting-client";
import {
  resetReportingClient,
  setReportingClient,
} from "@/lib/reporting/reporting-api";
import { ReportingClientError } from "@/lib/reporting/reporting-errors";

import { PlatformReportingView } from "./platform-reporting-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/reporting/templates",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformReportingView", () => {
  beforeEach(() => {
    resetReportingClient();
    setReportingClient(createMockReportingClient());
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:mock"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  it("renders templates section with mock data", async () => {
    render(wrap(<PlatformReportingView section="templates" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Templates" }),
      ).toBeTruthy();
      expect(screen.getByText(MOCK_REPORT_TEMPLATE.name)).toBeTruthy();
    });

    expect(screen.getByRole("toolbar", { name: /Reporting commands/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Open Consumer/i })).toHaveAttribute(
      "href",
      "/workspace/testing/reports",
    );
  });

  it("renders formats, generations, and history sections", async () => {
    const { rerender } = render(wrap(<PlatformReportingView section="formats" />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Formats" })).toBeTruthy();
      expect(screen.getByText("html")).toBeTruthy();
    });

    rerender(wrap(<PlatformReportingView section="generations" />));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Generated Reports" }),
      ).toBeTruthy();
      expect(screen.getByText(MOCK_REPORT_METADATA.id)).toBeTruthy();
    });

    rerender(wrap(<PlatformReportingView section="history" />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "History" })).toBeTruthy();
      expect(screen.getByText(MOCK_REPORT_METADATA.id)).toBeTruthy();
    });
  });

  it("filters templates by search and runs commands", async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(wrap(<PlatformReportingView section="templates" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_REPORT_TEMPLATE.name)).toBeTruthy();
    });

    const search = screen.getByLabelText(/Filter reporting list/i);
    await user.clear(search);
    await user.type(search, "zzz-no-match");
    await waitFor(() => {
      expect(screen.queryByText(MOCK_REPORT_TEMPLATE.name)).toBeNull();
      expect(screen.getByText(/No templates found/i)).toBeTruthy();
    });

    await user.clear(search);
    await user.type(search, "Executive");
    await waitFor(() => {
      expect(screen.getByText(MOCK_REPORT_TEMPLATE.name)).toBeTruthy();
    });

    await user.selectOptions(screen.getByLabelText(/Sort templates/i), "type");
    await user.selectOptions(screen.getByLabelText(/Sort templates/i), "updated");
    await user.selectOptions(screen.getByLabelText(/Sort order/i), "desc");

    const row = screen.getByTestId(`reporting-row-${MOCK_REPORT_TEMPLATE.id}`);
    await user.click(row);
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.keyDown(row, { key: " " });

    await user.click(screen.getByRole("button", { name: /Validate Template/i }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/valid/i);
    });

    await user.click(screen.getByRole("button", { name: /Preview/i }));
    await waitFor(() => {
      expect(screen.getByText(/Mock preview content/i)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /^Generate$/i }));
    await user.click(screen.getByRole("button", { name: /Refresh/i }));
    await user.click(screen.getByRole("button", { name: /View Metadata/i }));
    await user.click(screen.getByRole("button", { name: /Download Metadata/i }));

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("sorts generations and supports row selection plus pagination controls", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 12 }, (_, index) => ({
      ...MOCK_REPORT_METADATA,
      id: `rmeta_${index}`,
      reportType: index % 2 === 0 ? "executive" : "coverage",
      outputFormat: (index % 2 === 0 ? "html" : "json") as
        typeof MOCK_REPORT_METADATA.outputFormat,
      generatedAt: `2026-07-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
    }));
    setReportingClient(
      createMockReportingClient({
        async listGeneratedReports() {
          return { items: many, total: many.length };
        },
      }),
    );

    render(wrap(<PlatformReportingView section="generations" />));
    await waitFor(() => {
      expect(screen.getByText("rmeta_0")).toBeTruthy();
    });

    await user.selectOptions(screen.getByLabelText(/Sort generations/i), "type");
    await user.selectOptions(screen.getByLabelText(/Sort order/i), "desc");
    await user.selectOptions(screen.getByLabelText(/Sort generations/i), "format");

    const row = screen.getByTestId("reporting-row-rmeta_0");
    await user.click(row);

    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Page 2 of/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Previous$/i }));
  });

  it("shows query and action errors with retry", async () => {
    const user = userEvent.setup();
    setReportingClient(
      createMockReportingClient({
        async listTemplates() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async listOutputFormats() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async listGeneratedReports() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async validateTemplate() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async previewReport() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async generateReport() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async getGenerationMetadata() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
      }),
    );

    const { rerender } = render(wrap(<PlatformReportingView section="templates" />));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    rerender(wrap(<PlatformReportingView section="formats" />));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toBeTruthy();
    });

    rerender(wrap(<PlatformReportingView section="history" />));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toBeTruthy();
    });
  });

  it("surfaces validation failure and empty generation metadata actions", async () => {
    const user = userEvent.setup();
    setReportingClient(
      createMockReportingClient({
        async listGeneratedReports() {
          return { items: [], total: 0 };
        },
        async validateTemplate() {
          return { valid: false, errors: ["missing title"], warnings: [] };
        },
      }),
    );

    render(wrap(<PlatformReportingView section="templates" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_REPORT_TEMPLATE.name)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Validate Template/i }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/missing title/i);
    });

    await user.click(screen.getByRole("button", { name: /View Metadata/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toHaveTextContent(
        /No generation metadata selected/i,
      );
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    await user.click(screen.getByRole("button", { name: /Download Metadata/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toHaveTextContent(
        /No generation metadata available/i,
      );
    });
  });

  it("surfaces action failures when queries succeed", async () => {
    const user = userEvent.setup();
    setReportingClient(
      createMockReportingClient({
        async validateTemplate() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async previewReport() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async generateReport() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
        async getGenerationMetadata() {
          throw new ReportingClientError({
            message: "Denied",
            code: "forbidden",
            status: 403,
          });
        },
      }),
    );

    render(wrap(<PlatformReportingView section="templates" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_REPORT_TEMPLATE.name)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Validate Template/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toHaveTextContent(/permission/i);
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    await user.click(screen.getByRole("button", { name: /Preview/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    await user.click(screen.getByRole("button", { name: /^Generate$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    await user.click(screen.getByRole("button", { name: /View Metadata/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toBeTruthy();
    });
  });

  it("shows empty generations state", async () => {
    setReportingClient(
      createMockReportingClient({
        async listGeneratedReports() {
          return { items: [], total: 0 };
        },
      }),
    );
    render(wrap(<PlatformReportingView section="generations" />));
    await waitFor(() => {
      expect(screen.getByText(/No generated reports/i)).toBeTruthy();
    });
  });

  it("prompts when no template is available for actions", async () => {
    const user = userEvent.setup();
    setReportingClient(
      createMockReportingClient({
        async listTemplates() {
          return { items: [], total: 0 };
        },
      }),
    );
    render(wrap(<PlatformReportingView section="templates" />));
    await waitFor(() => {
      expect(screen.getByText(/No templates found/i)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Validate Template/i }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/Select a template first/i);
    });

    await user.click(screen.getByRole("button", { name: /Preview/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toHaveTextContent(
        /Select a template first/i,
      );
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    await user.click(screen.getByRole("button", { name: /^Generate$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("reporting-error")).toHaveTextContent(
        /Select a template first/i,
      );
    });
  });
});

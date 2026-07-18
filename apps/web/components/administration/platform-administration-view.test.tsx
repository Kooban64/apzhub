"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockAdministrationClient,
  MOCK_ADMINISTRATION_MODULE,
} from "@/lib/administration/mock-administration-client";
import {
  resetAdministrationClient,
  setAdministrationClient,
} from "@/lib/administration/administration-api";

import { AdministrationWorkspaceRouter } from "./administration-workspace-router";
import { PlatformAdministrationView } from "./platform-administration-view";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/administration/overview",
  useRouter: () => ({ push: pushMock }),
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformAdministrationView", () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  beforeEach(() => {
    resetAdministrationClient();
    setAdministrationClient(createMockAdministrationClient());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("renders overview with metadata banner and unavailable cards", async () => {
    render(wrap(<PlatformAdministrationView section="overview" />));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
      expect(screen.getByTestId("card-modules-count")).toBeTruthy();
    });

    expect(screen.getByTestId("banner-metadata").textContent).toContain(
      "ADMINISTRATION METADATA ONLY — RUNTIME ADMINISTRATION IS NOT AVAILABLE",
    );
    expect(
      screen.getByTestId("card-unavailable-runtime-administration").textContent,
    ).toContain("Unavailable");
    expect(
      screen.getByTestId("card-unavailable-user-management").textContent,
    ).toContain("Unavailable");
    expect(screen.getByTestId("card-unavailable-event-bus").textContent).toContain(
      "Unavailable",
    );
    expect(
      screen.getByTestId("card-unavailable-ai-administration").textContent,
    ).toContain("Unavailable");
    expect(
      screen.getByRole("toolbar", { name: /Administration commands/i }),
    ).toBeTruthy();
  });

  it("lists modules and copies ID", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_ADMINISTRATION_MODULE.id)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Copy ID/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-status").textContent).toMatch(
        /Copied module ID/i,
      );
    });
    expect(screen.getByTestId("module-status-model").textContent).toMatch(
      /Registered/i,
    );
  });

  it("opens product via canonical route only", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open Product/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open Product/i }));
    expect(pushMock).toHaveBeenCalledWith("/workspace/configuration");
  });

  it("archives module when canManage", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" canManage />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Archive$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Archive$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-status").textContent).toMatch(
        /Completed: archive/i,
      );
    });
  });

  it("hides manage commands when canManage is false", async () => {
    render(wrap(<PlatformAdministrationView section="modules" canManage={false} />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_ADMINISTRATION_MODULE.id)).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: /^Archive$/i })).toBeNull();
  });

  it("shows categories metadata", async () => {
    render(wrap(<PlatformAdministrationView section="categories" />));
    await waitFor(() => {
      expect(screen.getByTestId("category-detail")).toBeTruthy();
    });
  });

  it("shows sections metadata", async () => {
    render(wrap(<PlatformAdministrationView section="sections" />));
    await waitFor(() => {
      expect(screen.getByTestId("section-detail")).toBeTruthy();
    });
  });

  it("shows registrations with provisioning notice", async () => {
    render(wrap(<PlatformAdministrationView section="registrations" />));
    await waitFor(() => {
      expect(screen.getByTestId("banner-registration").textContent).toContain(
        "NO SERVICE PROVISIONING",
      );
      expect(screen.getByTestId("registration-detail")).toBeTruthy();
    });
  });

  it("shows capabilities detail flags", async () => {
    render(wrap(<PlatformAdministrationView section="capabilities" />));
    await waitFor(() => {
      expect(screen.getByTestId("capability-detail")).toBeTruthy();
    });
  });

  it("shows actions catalogue without execute", async () => {
    render(wrap(<PlatformAdministrationView section="actions" />));
    await waitFor(() => {
      expect(screen.getByTestId("banner-actions").textContent).toContain(
        "RUNTIME EXECUTION IS NOT AVAILABLE",
      );
      expect(screen.getByTestId("action-no-execute")).toBeTruthy();
    });
  });

  it("shows permissions catalogue without grant/revoke", async () => {
    render(wrap(<PlatformAdministrationView section="permissions" />));
    await waitFor(() => {
      expect(screen.getByTestId("banner-permissions").textContent).toContain(
        "ACCESS ASSIGNMENT IS OUTSIDE THIS MILESTONE",
      );
      expect(screen.getByTestId("permission-no-grant")).toBeTruthy();
    });
  });

  it("shows policies metadata", async () => {
    render(wrap(<PlatformAdministrationView section="policies" />));
    await waitFor(() => {
      expect(screen.getByTestId("policy-detail")).toBeTruthy();
    });
  });

  it("shows navigation metadata", async () => {
    render(wrap(<PlatformAdministrationView section="navigation" />));
    await waitFor(() => {
      expect(screen.getByTestId("navigation-detail")).toBeTruthy();
    });
  });

  it("shows shortcuts metadata", async () => {
    render(wrap(<PlatformAdministrationView section="shortcuts" />));
    await waitFor(() => {
      expect(screen.getByTestId("shortcut-detail")).toBeTruthy();
    });
  });

  it("shows dashboards metadata-only banner", async () => {
    render(wrap(<PlatformAdministrationView section="dashboards" />));
    await waitFor(() => {
      expect(screen.getByTestId("banner-dashboards").textContent).toContain(
        "ANALYTICS RENDERING IS NOT PART OF ADMINISTRATION",
      );
      expect(screen.getByTestId("dashboard-detail")).toBeTruthy();
    });
  });

  it("shows widgets metadata", async () => {
    render(wrap(<PlatformAdministrationView section="widgets" />));
    await waitFor(() => {
      expect(screen.getByTestId("widget-detail")).toBeTruthy();
    });
  });

  it("shows references when module selected", async () => {
    render(wrap(<PlatformAdministrationView section="references" />));
    await waitFor(() => {
      expect(screen.getByTestId("reference-detail")).toBeTruthy();
    });
  });

  it("shows audit table", async () => {
    render(wrap(<PlatformAdministrationView section="audit" />));
    await waitFor(() => {
      expect(screen.getByTestId("administration-audit-table")).toBeTruthy();
    });
  });

  it("shows history table", async () => {
    render(wrap(<PlatformAdministrationView section="history" />));
    await waitFor(() => {
      expect(screen.getByTestId("administration-history-table")).toBeTruthy();
    });
  });

  it("shows diagnostics unavailable capabilities", async () => {
    render(wrap(<PlatformAdministrationView section="diagnostics" />));

    await waitFor(() => {
      expect(screen.getByTestId("diag-runtime").textContent).toContain("Unavailable");
      expect(screen.getByTestId("diag-event-bus").textContent).toContain("Unavailable");
      expect(screen.getByTestId("diag-ai").textContent).toContain("Unavailable");
      expect(screen.getByTestId("banner-health").textContent).toContain(
        "NO LIVE PROBE",
      );
      expect(screen.getByTestId("diag-administration").textContent).toContain("Ready");
      expect(screen.getByTestId("diag-readiness").textContent).toContain("Ready");
      expect(screen.getByTestId("diagnostic-detail").textContent).toContain(
        "ADMIN_METADATA_OK",
      );
    });
  });

  it("shows forbidden state when list fails with 403", async () => {
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async listModules() {
        const { AdministrationClientError } =
          await import("@/lib/administration/administration-errors");
        throw new AdministrationClientError({
          message: "Denied",
          status: 403,
          code: "FORBIDDEN",
        });
      },
    });

    render(wrap(<PlatformAdministrationView section="modules" />));

    await waitFor(() => {
      expect(screen.getByTestId("administration-forbidden")).toBeTruthy();
    });
  });

  it("router mounts overview from pathname", async () => {
    render(wrap(<AdministrationWorkspaceRouter />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    });
  });

  it("opens API metadata panel", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="overview" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open API Metadata/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open API Metadata/i }));
    await waitFor(() => {
      expect(screen.getByTestId("api-metadata-panel")).toBeTruthy();
    });
  });

  it("transitions module status", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" canManage />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Transition$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Transition$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-status").textContent).toMatch(
        /Completed: transition/i,
      );
    });
  });

  it("restores archived module", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" canManage />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Restore$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Restore$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-status").textContent).toMatch(
        /Completed: restore/i,
      );
    });
  });

  it("filters modules by search text", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_ADMINISTRATION_MODULE.id)).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/Module search/i), "zzz-no-match");
    await waitFor(() => {
      expect(screen.getByTestId("administration-empty")).toBeTruthy();
    });
  });

  it("shows empty configurations path for empty categories", async () => {
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async listCategories() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformAdministrationView section="categories" />));
    await waitFor(() => {
      expect(screen.getByTestId("administration-empty")).toBeTruthy();
    });
  });

  it("opens documentation from capability metadata", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open Documentation/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open Documentation/i }));
    expect(pushMock).toHaveBeenCalledWith(
      "/docs/architecture/APZHUB-Configuration-Workbench.md",
    );
  });

  it("reports missing canonical product route", async () => {
    const user = userEvent.setup();
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async getModule() {
        return {
          ...MOCK_ADMINISTRATION_MODULE,
          key: "unknown-product",
        };
      },
      async listModules() {
        return {
          items: [{ ...MOCK_ADMINISTRATION_MODULE, key: "unknown-product" }],
          page: { limit: 1, hasMore: false },
        };
      },
    });
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open Product/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open Product/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-action-error").textContent).toMatch(
        /No canonical product route/i,
      );
    });
  });

  it("opens navigation route from detail", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="navigation" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open route/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open route/i }));
    expect(pushMock).toHaveBeenCalledWith("/workspace/configuration");
  });

  it("shows empty states for catalogue sections", async () => {
    const empty = async () => ({
      items: [] as const,
      page: { limit: 0, hasMore: false },
    });
    setAdministrationClient({
      ...createMockAdministrationClient(),
      listModules: empty,
      listSections: empty,
      listRegistrations: empty,
      listCapabilities: empty,
      listActions: empty,
      listPermissions: empty,
      listPolicies: empty,
      listNavigations: empty,
      listShortcuts: empty,
      listDashboards: empty,
      listAudit: empty,
    });

    for (const section of [
      "modules",
      "sections",
      "registrations",
      "capabilities",
      "actions",
      "permissions",
      "policies",
      "navigation",
      "shortcuts",
      "dashboards",
      "audit",
    ] as const) {
      cleanup();
      render(wrap(<PlatformAdministrationView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId("administration-empty")).toBeTruthy();
      });
    }
  });

  it("shows widgets empty when no dashboard", async () => {
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async listDashboards() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformAdministrationView section="widgets" />));
    await waitFor(() => {
      expect(screen.getByText(/Select a dashboard first/i)).toBeTruthy();
    });
  });

  it("shows empty history and references", async () => {
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async listModuleHistory() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
      async listReferences() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformAdministrationView section="history" />));
    await waitFor(() => {
      expect(screen.getByText(/No history entries/i)).toBeTruthy();
    });
    cleanup();
    render(wrap(<PlatformAdministrationView section="references" />));
    await waitFor(() => {
      expect(screen.getByText(/No references/i)).toBeTruthy();
    });
  });

  it("shows non-forbidden list error with retry", async () => {
    const user = userEvent.setup();
    const listModules = vi.fn(async () => {
      const { AdministrationClientError } =
        await import("@/lib/administration/administration-errors");
      throw new AdministrationClientError({
        message: "Boom",
        status: 500,
        code: "INTERNAL",
      });
    });
    setAdministrationClient({
      ...createMockAdministrationClient(),
      listModules,
    });
    render(wrap(<PlatformAdministrationView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("administration-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));
    expect(listModules.mock.calls.length).toBeGreaterThan(1);
  });

  it("shows not-found module detail", async () => {
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async getModule() {
        const { AdministrationClientError } =
          await import("@/lib/administration/administration-errors");
        throw new AdministrationClientError({
          message: "Missing",
          status: 404,
          code: "NOT_FOUND",
        });
      },
    });
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByTestId("administration-not-found")).toBeTruthy();
    });
  });

  it("handles clipboard failure when copying ID", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Copy ID/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Copy ID/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-action-error").textContent).toMatch(
        /Clipboard is unavailable/i,
      );
    });
  });

  it("selects module row with keyboard", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_ADMINISTRATION_MODULE.id)).toBeTruthy();
    });
    const row = screen.getByText(MOCK_ADMINISTRATION_MODULE.id).closest("tr");
    expect(row).toBeTruthy();
    row!.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByTestId("administration-module-detail")).toBeTruthy();
    });
  });

  it("reports missing documentation reference", async () => {
    const user = userEvent.setup();
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async listCapabilities() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open Documentation/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open Documentation/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-action-error").textContent).toMatch(
        /No documentation reference/i,
      );
    });
  });

  it("surfaces mutation errors from archive", async () => {
    const user = userEvent.setup();
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async archiveModule() {
        const { AdministrationClientError } =
          await import("@/lib/administration/administration-errors");
        throw new AdministrationClientError({
          message: "Archive denied",
          status: 403,
          code: "FORBIDDEN",
        });
      },
    });
    render(wrap(<PlatformAdministrationView section="modules" canManage />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Archive$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Archive$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-action-error").textContent).toMatch(
        /Archive denied|Access denied|Forbidden/i,
      );
    });
  });

  it("shows empty widgets list for dashboard", async () => {
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async listWidgets() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformAdministrationView section="widgets" />));
    await waitFor(() => {
      expect(screen.getByText(/No widgets/i)).toBeTruthy();
    });
  });

  it("refreshes module catalogue", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByTestId("administration-module-detail")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Refresh$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-module-detail")).toBeTruthy();
    });
  });

  it("surfaces non-path documentation references", async () => {
    const user = userEvent.setup();
    setAdministrationClient({
      ...createMockAdministrationClient(),
      async listCapabilities() {
        return {
          items: [
            {
              id: "cap_mock_1",
              tenantId: "tenant_mock",
              moduleId: MOCK_ADMINISTRATION_MODULE.id,
              key: "configuration.metadata",
              name: "Configuration metadata",
              enabled: true,
              available: true,
              healthy: true,
              certified: true,
              productionReady: false,
              owner: "platform",
              version: "0.1.0",
              documentation: "https://example.test/docs",
              createdAt: "2026-07-16T00:00:00.000Z",
              updatedAt: "2026-07-16T00:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
        };
      },
    });
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open Documentation/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open Documentation/i }));
    await waitFor(() => {
      expect(screen.getByTestId("administration-status").textContent).toMatch(
        /Documentation reference: https:\/\/example.test\/docs/i,
      );
    });
  });

  it("selects row with Space key", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformAdministrationView section="modules" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_ADMINISTRATION_MODULE.id)).toBeTruthy();
    });
    const row = screen.getByText(MOCK_ADMINISTRATION_MODULE.id).closest("tr");
    row!.focus();
    await user.keyboard(" ");
    await waitFor(() => {
      expect(screen.getByTestId("administration-module-detail")).toBeTruthy();
    });
  });
});

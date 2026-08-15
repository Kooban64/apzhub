import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pathnameState = vi.hoisted(() => ({ value: "/workspace/projects/list" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/projects/projects-api", () => ({
  listProjects: vi.fn(),
  listProductivityShortcuts: vi.fn(async () => []),
  listRecentProjects: vi.fn(async () => []),
}));

vi.mock("./project-create-view", () => ({
  ProjectCreateView: () => <div data-testid="route-create" />,
}));
vi.mock("./projects-search-view", () => ({
  ProjectsSearchView: () => <div data-testid="route-search" />,
}));
vi.mock("./projects-health-view", () => ({
  ProjectsHealthView: () => <div data-testid="route-health" />,
}));
vi.mock("./projects-help-view", () => ({
  ProjectsHelpView: () => <div data-testid="route-help" />,
}));
vi.mock("./projects-settings-view", () => ({
  ProjectsSettingsView: () => <div data-testid="route-settings" />,
}));

import { listProjects } from "@/lib/projects/projects-api";

import { ProjectsWorkspaceRouter } from "./projects-workspace-router";

const FULL = ["projects.*"] as const;

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("ProjectsWorkspaceRouter", () => {
  beforeEach(() => {
    pathnameState.value = "/workspace/projects/list";
    vi.mocked(listProjects).mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          data: { entitlements: { productKeys: ["projects", "qep"] } },
        }),
      ),
    );
  });

  it("renders list view for /workspace/projects/list", async () => {
    vi.mocked(listProjects).mockResolvedValue({
      items: [
        {
          id: "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          tenantId: "tenant_e2e",
          workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          name: "Alpha",
          identifier: "ALPHA",
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      page: { limit: 20, hasMore: false },
    });

    render(wrap(<ProjectsWorkspaceRouter permissions={FULL} />));
    await waitFor(() => {
      expect(screen.getByTestId("projects-page")).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeTruthy();
    });
  });

  it("denies create/search/health without grants (no projects.* default)", async () => {
    pathnameState.value = "/workspace/projects/new";
    render(wrap(<ProjectsWorkspaceRouter permissions={[]} />));
    await waitFor(() => {
      expect(screen.getAllByText("Permission required").length).toBeGreaterThan(0);
    });
    expect(screen.queryByTestId("route-create")).toBeNull();

    pathnameState.value = "/workspace/projects/search";
    render(wrap(<ProjectsWorkspaceRouter permissions={[]} />));
    await waitFor(() => {
      expect(screen.queryByTestId("route-search")).toBeNull();
    });

    pathnameState.value = "/workspace/projects/health";
    render(wrap(<ProjectsWorkspaceRouter permissions={[]} />));
    await waitFor(() => {
      expect(screen.queryByTestId("route-health")).toBeNull();
    });
  });

  it("allows create/search/health with projects.*", async () => {
    pathnameState.value = "/workspace/projects/new";
    render(wrap(<ProjectsWorkspaceRouter permissions={FULL} />));
    await waitFor(() => {
      expect(screen.getByTestId("route-create")).toBeTruthy();
    });

    pathnameState.value = "/workspace/projects/search";
    render(wrap(<ProjectsWorkspaceRouter permissions={FULL} />));
    await waitFor(() => {
      expect(screen.getByTestId("route-search")).toBeTruthy();
    });

    pathnameState.value = "/workspace/projects/health";
    render(wrap(<ProjectsWorkspaceRouter permissions={FULL} />));
    await waitFor(() => {
      expect(screen.getByTestId("route-health")).toBeTruthy();
    });
  });

  it("routes help and settings", async () => {
    pathnameState.value = "/workspace/projects/help";
    render(wrap(<ProjectsWorkspaceRouter permissions={FULL} />));
    await waitFor(() => {
      expect(screen.getByTestId("route-help")).toBeTruthy();
    });

    pathnameState.value = "/workspace/projects/settings";
    render(wrap(<ProjectsWorkspaceRouter permissions={FULL} />));
    await waitFor(() => {
      expect(screen.getByTestId("route-settings")).toBeTruthy();
    });
  });

  it("denies workspace when product not entitled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          data: { entitlements: { productKeys: ["qep"] } },
        }),
      ),
    );
    render(wrap(<ProjectsWorkspaceRouter permissions={FULL} />));
    await waitFor(() => {
      expect(screen.getByText("Projects not entitled")).toBeTruthy();
    });
  });
});

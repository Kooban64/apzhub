import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/projects/list",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/projects/projects-api", () => ({
  listProjects: vi.fn(),
}));

import { listProjects } from "@/lib/projects/projects-api";

import { ProjectsWorkspaceRouter } from "./projects-workspace-router";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("ProjectsWorkspaceRouter", () => {
  beforeEach(() => {
    vi.mocked(listProjects).mockReset();
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

    render(wrap(<ProjectsWorkspaceRouter />));
    expect(screen.getByTestId("projects-page")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeTruthy();
    });
  });
});

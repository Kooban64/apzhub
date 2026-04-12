import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { WorkspaceHome } from "@/features/workspace/workspace-home";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { minimalEmptyWorkspaceConfig } from "@/lib/workspace/workspace-config";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("workspace empty composition", () => {
  it("renders intentionally with minimal modules and no attention stack", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/api/auth/session")) {
          return {
            ok: true,
            json: () =>
              Promise.resolve({
                snapshot: mockAdminSession(),
                credential: "active" as const,
              }),
          } as Response;
        }
        return { ok: true, json: () => Promise.resolve({}) } as Response;
      }),
    );

    render(
      <AppProviders>
        <WorkspaceHome config={minimalEmptyWorkspaceConfig} />
      </AppProviders>,
    );

    expect(await screen.findByTestId("workspace-home-root")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByTestId("workspace-module-today_summary")).toBeInTheDocument();
    expect(screen.queryByTestId("workspace-module-attention")).not.toBeInTheDocument();
    expect(screen.getByTestId("workspace-module-launcher")).toBeInTheDocument();
    expect(screen.getByTestId("launcher-tile-calendar")).toBeInTheDocument();
    expect(screen.queryByTestId("launcher-tile-mail")).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});

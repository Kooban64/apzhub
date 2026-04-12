import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { AppLauncher } from "@/features/workspace/app-launcher";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { defaultWorkspaceConfig } from "@/lib/workspace/workspace-config";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/workspace",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AppLauncher", () => {
  it("shows readiness pills and surfaces blocked message on click (no dead click)", async () => {
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

    const user = userEvent.setup();
    render(
      <AppProviders>
        <AppLauncher config={defaultWorkspaceConfig} />
      </AppProviders>,
    );

    expect(await screen.findByTestId("workspace-app-launcher")).toBeInTheDocument();
    expect(screen.getByTestId("launcher-tile-mail")).toHaveTextContent(/Ready/i);
    expect(screen.getByTestId("launcher-tile-calendar")).toHaveTextContent(/Pending/i);

    await user.click(screen.getByTestId("launcher-tile-calendar"));
    expect(screen.getByTestId("launcher-tile-calendar")).toHaveTextContent(/not ready to launch yet/i);

    vi.unstubAllGlobals();
  });
});

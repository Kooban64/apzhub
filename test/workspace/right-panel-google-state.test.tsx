import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { WorkspaceRightPanelContent } from "@/features/workspace/workspace-right-panel-content";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { defaultWorkspaceConfig } from "@/lib/workspace/workspace-config";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/workspace",
  useSearchParams: () => new URLSearchParams(),
}));

function mockSessionFetch(snapshot: ReturnType<typeof mockAdminSession>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/api/auth/session")) {
        return {
          ok: true,
          json: () => Promise.resolve({ snapshot, credential: "active" as const }),
        } as Response;
      }
      return { ok: true, json: () => Promise.resolve({}) } as Response;
    }),
  );
}

describe("WorkspaceRightPanelContent Google posture", () => {
  it("shows connectable CTA when Google is not linked", async () => {
    mockSessionFetch(mockAdminSession());
    render(
      <AppProviders>
        <WorkspaceRightPanelContent config={defaultWorkspaceConfig} />
      </AppProviders>,
    );

    expect(await screen.findByTestId("right-panel-widget-connectable")).toBeInTheDocument();
    expect(screen.getByText(/Open profile to connect/i)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("shows enabled placeholder when Google is linked", async () => {
    mockSessionFetch({ ...mockAdminSession(), linkedAccounts: { google: "linked" } });
    render(
      <AppProviders>
        <WorkspaceRightPanelContent config={defaultWorkspaceConfig} />
      </AppProviders>,
    );

    const user = userEvent.setup();
    expect(await screen.findByTestId("right-panel-widget-enabled-calendar")).toBeInTheDocument();
    await user.click(screen.getByTestId("right-panel-tab-reminders"));
    expect(await screen.findByTestId("right-panel-widget-reminders")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

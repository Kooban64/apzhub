import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { anonymousSessionSnapshot } from "@/lib/auth/session-types";

vi.mock("react-resizable-panels", () => ({
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-resizable-group">{children}</div>
  ),
  Panel: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div data-testid={`mock-panel-${id ?? "unknown"}`}>{children}</div>
  ),
  Separator: () => <div data-testid="mock-separator" />,
  usePanelRef: () => ({
    current: {
      collapse: vi.fn(),
      expand: vi.fn(),
      isCollapsed: () => false,
    },
  }),
  useGroupRef: () => ({
    current: {
      setLayout: vi.fn(),
      getLayout: vi.fn(() => ({})),
    },
  }),
}));

import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/shell/app-shell";
import { getWorkspaceChrome } from "@/lib/shell/chrome-defaults";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace",
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("AppShell", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/api/auth/session")) {
          return {
            ok: true,
            json: () =>
              Promise.resolve({
                snapshot: anonymousSessionSnapshot(),
                credential: "none" as const,
              }),
          } as Response;
        }
        return { ok: true, json: () => Promise.resolve({}) } as Response;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders persistent chrome", () => {
    render(
      <AppProviders>
        <AppShell
          versionLabel="v0.0.0-test"
          chrome={getWorkspaceChrome()}
          pathname="/workspace"
        >
          <p>Canvas body</p>
        </AppShell>
      </AppProviders>,
    );

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.getByTestId("app-header")).toBeInTheDocument();
    expect(screen.getByTestId("app-footer")).toBeInTheDocument();
    expect(screen.getByTestId("primary-rail")).toBeInTheDocument();
    expect(screen.getByTestId("main-canvas")).toHaveTextContent("Canvas body");
  });
});

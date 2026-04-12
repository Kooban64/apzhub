import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { ProfileSettingsPage } from "@/features/profile/profile-settings-page";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { userAppearancePreferencesSchema } from "@/lib/profile/user-appearance-preferences";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/profile",
  useSearchParams: () => new URLSearchParams(),
}));

function countSessionGetCalls(calls: [RequestInfo, RequestInit?][]) {
  return calls.filter(([input, init]) => {
    const url = typeof input === "string" ? input : input.url;
    const method =
      init && typeof init === "object" && "method" in init && init.method
        ? String(init.method).toUpperCase()
        : "GET";
    return url.includes("/api/auth/session") && method === "GET";
  }).length;
}

describe("ProfileSettingsPage", () => {
  it("calls mock Google connect API from profile", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/api/auth/session") && (!init || init.method === undefined || init.method === "GET")) {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              snapshot: mockAdminSession(),
              credential: "active" as const,
            }),
        } as Response;
      }
      if (url.includes("/api/profile/google/connect") && init?.method === "POST") {
        return { ok: true, json: () => Promise.resolve({ ok: true }) } as Response;
      }
      return { ok: true, json: () => Promise.resolve({}) } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <AppProviders>
        <ProfileSettingsPage />
      </AppProviders>,
    );

    expect(await screen.findByTestId("profile-page-root")).toBeInTheDocument();
    expect(screen.getByTestId("profile-google-status")).toHaveTextContent("not_linked");

    await user.click(screen.getByTestId("profile-google-connect"));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/profile/google/connect"),
      expect.objectContaining({ method: "POST" }),
    );

    vi.unstubAllGlobals();
  });

  it("shows Google connect error banner and dismiss clears it without refreshing session or changing link state", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/api/auth/session") && (!init || init.method === undefined || init.method === "GET")) {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              snapshot: mockAdminSession(),
              credential: "active" as const,
            }),
        } as Response;
      }
      if (url.includes("/api/profile/google/connect") && init?.method === "POST") {
        return { ok: false, status: 500, json: () => Promise.resolve({ error: "mock_failure" }) } as Response;
      }
      return { ok: true, json: () => Promise.resolve({}) } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <AppProviders>
        <ProfileSettingsPage />
      </AppProviders>,
    );

    expect(await screen.findByTestId("profile-page-root")).toBeInTheDocument();
    expect(screen.getByTestId("profile-google-status")).toHaveTextContent("not_linked");
    expect(screen.getByText("ops.admin@example.com")).toBeInTheDocument();

    await waitFor(() => {
      expect(countSessionGetCalls(fetchMock.mock.calls)).toBeGreaterThanOrEqual(1);
    });
    const sessionGetsAfterBootstrap = countSessionGetCalls(fetchMock.mock.calls);

    await user.click(screen.getByTestId("profile-google-connect"));

    const banner = await screen.findByTestId("profile-operation-error");
    expect(banner).toHaveAttribute("role", "alert");
    expect(banner).toHaveTextContent(/Could not connect \(mock\)/i);

    expect(screen.getByTestId("profile-google-status")).toHaveTextContent("not_linked");
    expect(screen.getByText("ops.admin@example.com")).toBeInTheDocument();
    expect(countSessionGetCalls(fetchMock.mock.calls)).toBe(sessionGetsAfterBootstrap);

    await user.click(screen.getByTestId("profile-error-dismiss"));

    await waitFor(() => {
      expect(screen.queryByTestId("profile-operation-error")).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    expect(screen.getByTestId("profile-google-status")).toHaveTextContent("not_linked");
    expect(screen.getByText("ops.admin@example.com")).toBeInTheDocument();
    expect(countSessionGetCalls(fetchMock.mock.calls)).toBe(sessionGetsAfterBootstrap);

    vi.unstubAllGlobals();
  });

  it("parses appearance preferences from theme constants", () => {
    const parsed = userAppearancePreferencesSchema.parse({ themeId: "mist-blue", densityId: "comfortable" });
    expect(parsed.themeId).toBe("mist-blue");
  });
});

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SessionProvider } from "@/components/providers/session-provider";
import * as authClient from "@/lib/api/auth-client";
import { mockAdminSession } from "@/lib/auth/mock-session";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("SessionProvider expiry", () => {
  it("calls logout once and navigates to login when snapshot is expired", async () => {
    replace.mockClear();
    const logoutSpy = vi.spyOn(authClient, "postClientLogout").mockResolvedValue(undefined);
    const sessionSpy = vi.spyOn(authClient, "getClientSession").mockResolvedValue({
      snapshot: { ...mockAdminSession(), sessionStatus: "expired" },
      credential: "expired",
    });

    render(
      <SessionProvider>
        <span>child</span>
      </SessionProvider>,
    );

    await waitFor(() => expect(logoutSpy).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith("/login?reason=expired");
    logoutSpy.mockRestore();
    sessionSpy.mockRestore();
  });
});

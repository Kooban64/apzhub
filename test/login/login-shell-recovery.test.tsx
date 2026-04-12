import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockReplace = vi.fn();
const searchParamsRef = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/login",
  useSearchParams: () => searchParamsRef.current,
}));

import { LoginShell } from "@/app/(public)/login/login-shell";

describe("LoginShell recovery flows", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    searchParamsRef.current = new URLSearchParams();
  });

  it("shows local-only notice for forgot password when identity is not local", () => {
    searchParamsRef.current = new URLSearchParams("forgot=1");
    render(<LoginShell identitySource="mock" />);
    expect(screen.getByText(/APZHUB_IDENTITY_SOURCE=local/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Forgot password/i })).not.toBeInTheDocument();
  });

  it("shows forgot password panel when local and forgot=1", () => {
    searchParamsRef.current = new URLSearchParams("forgot=1");
    render(<LoginShell identitySource="local" />);
    expect(screen.getByRole("heading", { name: /Forgot password/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send reset link/i })).toBeInTheDocument();
  });

  it("shows verify help panel when local and verifyHelp=1", () => {
    searchParamsRef.current = new URLSearchParams("verifyHelp=1");
    render(<LoginShell identitySource="local" />);
    expect(screen.getByRole("heading", { name: /Resend verification email/i })).toBeInTheDocument();
  });

  it("shows verify error guidance when local and verifyError=1", () => {
    searchParamsRef.current = new URLSearchParams("verifyError=1");
    render(<LoginShell identitySource="local" />);
    expect(screen.getByText(/invalid, expired, or already used/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Resend verification email/i })).toHaveAttribute(
      "href",
      "/login?verifyHelp=1",
    );
  });
});

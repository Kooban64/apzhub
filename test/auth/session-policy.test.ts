import { describe, expect, it } from "vitest";

import { canAccessPath, isSessionExpired } from "@/lib/auth/session-policy";
import { anonymousSessionSnapshot, type SessionSnapshot } from "@/lib/auth/session-types";
import { mockAdminSession, mockUserSession } from "@/lib/auth/mock-session";

describe("session-policy", () => {
  it("detects expiry from status or epoch", () => {
    expect(isSessionExpired({ ...mockAdminSession(), sessionStatus: "expired" })).toBe(true);
    expect(
      isSessionExpired({
        ...mockAdminSession(),
        sessionStatus: "active",
        expiresAtEpochSec: Math.floor(Date.now() / 1000) - 60,
      }),
    ).toBe(true);
    expect(isSessionExpired(mockAdminSession())).toBe(false);
  });

  it("denies anonymous and expired for protected paths", () => {
    expect(canAccessPath(anonymousSessionSnapshot(), "/workspace")).toBe(false);
    const expired: SessionSnapshot = {
      ...mockUserSession(),
      sessionStatus: "expired",
    };
    expect(canAccessPath(expired, "/workspace")).toBe(false);
  });

  it("allows admin routes only when availableModes includes admin", () => {
    expect(canAccessPath(mockUserSession(), "/admin")).toBe(false);
    expect(canAccessPath(mockUserSession(), "/workspace")).toBe(true);
    expect(canAccessPath(mockAdminSession(), "/admin")).toBe(true);
    const mismatched: SessionSnapshot = {
      ...mockAdminSession(),
      platformRole: "admin",
      availableModes: ["workspace"],
    };
    expect(canAccessPath(mismatched, "/admin")).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { resolveSessionCookie } from "@/lib/auth/session-resolution";

describe("resolveSessionCookie", () => {
  it("classifies missing, invalid, expired, and active", () => {
    expect(resolveSessionCookie(undefined).credential).toBe("none");
    expect(resolveSessionCookie("%%%").credential).toBe("invalid");
    const expired = {
      ...mockAdminSession(),
      expiresAtEpochSec: Math.floor(Date.now() / 1000) - 10,
    };
    expect(resolveSessionCookie(encodeSessionCookie(expired)).credential).toBe("expired");
    expect(resolveSessionCookie(encodeSessionCookie(mockAdminSession())).credential).toBe("active");
  });

  it("treats soon-to-expire snapshot as active (server clock governs edge in e2e)", () => {
    const soon = {
      ...mockAdminSession(),
      expiresAtEpochSec: Math.floor(Date.now() / 1000) + 30,
    };
    expect(resolveSessionCookie(encodeSessionCookie(soon)).credential).toBe("active");
  });

  it("flips from active to expired when system time passes expiresAtEpochSec", () => {
    vi.useFakeTimers();
    const t0 = new Date("2030-01-01T12:00:00Z").getTime();
    vi.setSystemTime(t0);
    const snap = {
      ...mockAdminSession(),
      expiresAtEpochSec: Math.floor(t0 / 1000) + 5,
    };
    const raw = encodeSessionCookie(snap);
    expect(resolveSessionCookie(raw).credential).toBe("active");
    vi.setSystemTime(t0 + 10_000);
    expect(resolveSessionCookie(raw).credential).toBe("expired");
    vi.useRealTimers();
  });
});

afterEach(() => {
  vi.useRealTimers();
});

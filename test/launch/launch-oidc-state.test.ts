import { afterEach, describe, expect, it, vi } from "vitest";

import { mintOidcLaunchState, verifyOidcLaunchState } from "@/lib/launch/oidc/launch-oidc-state";

describe("OIDC launch state", () => {
  const secret = "c".repeat(32);

  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips service and user", () => {
    const state = mintOidcLaunchState(secret, { serviceId: "mail", userId: "u-1", ttlSec: 600 });
    const v = verifyOidcLaunchState(secret, state, 60);
    expect(v).toEqual({ ok: true, serviceId: "mail", userId: "u-1" });
  });

  it("rejects tampered state", () => {
    const state = mintOidcLaunchState(secret, { serviceId: "mail", userId: "u-1" });
    const broken = `${state.slice(0, -4)}xxxx`;
    expect(verifyOidcLaunchState(secret, broken, 60).ok).toBe(false);
  });

  it("rejects expired state", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const state = mintOidcLaunchState(secret, { serviceId: "drive", userId: "u-2", ttlSec: 60 });
    vi.setSystemTime(new Date("2024-01-01T00:05:00Z"));
    expect(verifyOidcLaunchState(secret, state, 30).ok).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { resolveSessionCookieForProxy } from "@/lib/auth/proxy-session-resolution";
import { encodeSignedSessionCookie } from "@/lib/auth/signed-session-cookie";

const SECRET = "unit-test-session-signing-secret-32c";

describe("resolveSessionCookieForProxy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("decodes legacy base64 session cookies", async () => {
    const raw = encodeSessionCookie(mockAdminSession());
    expect((await resolveSessionCookieForProxy(raw)).credential).toBe("active");
  });

  it("decodes signed s2 cookies when APZHUB_SESSION_SIGNING_SECRET is set", async () => {
    vi.stubEnv("APZHUB_SESSION_SIGNING_SECRET", SECRET);
    const snap = {
      ...mockAdminSession(),
      authSessionId: "550e8400-e29b-41d4-a716-446655440000",
    };
    const raw = encodeSignedSessionCookie(snap, SECRET);
    const resolved = await resolveSessionCookieForProxy(raw);
    expect(resolved.credential).toBe("active");
    expect(resolved.decoded?.user?.email).toBe(snap.user?.email);
  });

  it("returns invalid when secret is missing for s2", async () => {
    const raw = encodeSignedSessionCookie(
      { ...mockAdminSession(), authSessionId: "550e8400-e29b-41d4-a716-446655440000" },
      SECRET,
    );
    expect((await resolveSessionCookieForProxy(raw)).credential).toBe("invalid");
  });
});

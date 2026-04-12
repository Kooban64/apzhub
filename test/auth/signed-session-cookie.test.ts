import { describe, expect, it } from "vitest";

import { decodeSignedSessionCookie, encodeSignedSessionCookie } from "@/lib/auth/signed-session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

const TEST_SECRET = "unit-test-signing-secret-32chars-min";

describe("signed session cookie (s2)", () => {
  it("round-trips a snapshot when signing secret is passed", () => {
    const snap = { ...mockAdminSession(), authSessionId: "11111111-1111-4111-8111-111111111111" };
    const raw = encodeSignedSessionCookie(snap, TEST_SECRET);
    expect(raw.startsWith("s2.")).toBe(true);
    const decoded = decodeSignedSessionCookie(raw, TEST_SECRET);
    expect(decoded?.user?.email).toBe(snap.user?.email);
    expect(decoded?.authSessionId).toBe(snap.authSessionId);
  });

  it("rejects tampered payloads", () => {
    const snap = { ...mockAdminSession(), authSessionId: "22222222-2222-4222-8222-222222222222" };
    const raw = encodeSignedSessionCookie(snap, TEST_SECRET);
    const tampered = raw.replace("s2.", "s2.X");
    expect(decodeSignedSessionCookie(tampered, TEST_SECRET)).toBeNull();
  });

  it("rejects wrong secret", () => {
    const snap = { ...mockAdminSession(), authSessionId: "33333333-3333-4333-8333-333333333333" };
    const raw = encodeSignedSessionCookie(snap, TEST_SECRET);
    expect(decodeSignedSessionCookie(raw, "wrong-secret-wrong-secret-wrong-sec")).toBeNull();
  });
});

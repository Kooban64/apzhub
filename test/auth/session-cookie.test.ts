import { describe, expect, it } from "vitest";

import { decodeSessionCookie, encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockUserSession } from "@/lib/auth/mock-session";

describe("session-cookie", () => {
  it("round-trips a snapshot", () => {
    const snap = mockUserSession();
    const raw = encodeSessionCookie(snap);
    expect(decodeSessionCookie(raw)).toEqual(snap);
  });

  it("returns null for invalid payloads", () => {
    expect(decodeSessionCookie(undefined)).toBeNull();
    expect(decodeSessionCookie("not-json")).toBeNull();
  });
});

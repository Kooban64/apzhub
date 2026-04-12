import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

const appendAuthAuditMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/lib/auth/session-signing.server", () => ({
  requireSessionSigningSecret: () => "unit-test-signing-secret-32chars-min",
  resolveSessionSigningSecret: () => "unit-test-signing-secret-32chars-min",
}));
vi.mock("@/lib/identity/auth-audit.server", () => ({
  appendAuthAuditEventSafe: appendAuthAuditMock,
}));

import { decodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { appendSessionCookie, clearSessionCookie, encodeSessionCookieValue } from "@/lib/auth/session-issuer.server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
describe("session issuer (server)", () => {
  beforeEach(() => {
    appendAuthAuditMock.mockClear();
  });

  describe("encodeSessionCookieValue", () => {
    it("uses signed s2 transport for local mode when authSessionId is set", () => {
      const snap = { ...mockAdminSession(), authSessionId: "11111111-1111-4111-8111-111111111111" };
      const raw = encodeSessionCookieValue(snap, "local");
      expect(raw.startsWith("s2.")).toBe(true);
    });

    it("throws for local mode without authSessionId", () => {
      const snap = mockAdminSession();
      expect(() => encodeSessionCookieValue(snap, "local")).toThrow(/authSessionId/);
    });

    it("uses legacy JSON transport for mock without authSessionId", () => {
      const snap = mockAdminSession();
      const raw = encodeSessionCookieValue(snap, "mock");
      expect(raw.startsWith("s2.")).toBe(false);
      expect(decodeSessionCookie(raw)?.user?.email).toBe(snap.user?.email);
    });

    it("throws for mock/oidc when authSessionId is present", () => {
      const snap = { ...mockAdminSession(), authSessionId: "22222222-2222-4222-8222-222222222222" };
      expect(() => encodeSessionCookieValue(snap, "mock")).toThrow(/authSessionId/);
      expect(() => encodeSessionCookieValue(snap, "oidc")).toThrow(/authSessionId/);
    });
  });

  describe("appendSessionCookie", () => {
    it("sets cookie and appends session_issued audit by default", async () => {
      const snap = mockAdminSession();
      const res = NextResponse.json({ ok: true });
      appendSessionCookie(res, snap, { mode: "mock", correlationId: "cid-1" });
      expect(res.cookies.get(SESSION_COOKIE_NAME)?.value).toBeTruthy();
      await Promise.resolve();
      expect(appendAuthAuditMock).toHaveBeenCalledTimes(1);
      expect(appendAuthAuditMock.mock.calls[0]?.[0]).toMatchObject({
        type: "session_issued",
        correlationId: "cid-1",
        metadata: { identityMode: "mock", transport: "legacy_json" },
      });
    });

    it("skips audit when auditSessionIssued is false", async () => {
      const snap = { ...mockAdminSession(), authSessionId: "33333333-3333-4333-8333-333333333333" };
      const res = NextResponse.json({ ok: true });
      appendSessionCookie(res, snap, { mode: "local", auditSessionIssued: false });
      expect(res.cookies.get(SESSION_COOKIE_NAME)?.value?.startsWith("s2.")).toBe(true);
      await Promise.resolve();
      expect(appendAuthAuditMock).not.toHaveBeenCalled();
    });

    it("records signed_s2 transport in audit for local sessions", async () => {
      const snap = { ...mockAdminSession(), authSessionId: "44444444-4444-4444-8444-444444444444" };
      const res = NextResponse.json({ ok: true });
      appendSessionCookie(res, snap, { mode: "local" });
      await Promise.resolve();
      expect(appendAuthAuditMock.mock.calls[0]?.[0]?.metadata).toEqual({
        identityMode: "local",
        transport: "signed_s2",
      });
    });
  });

  describe("clearSessionCookie", () => {
    it("clears the session cookie", () => {
      const res = NextResponse.json({ ok: true });
      clearSessionCookie(res);
      const c = res.cookies.get(SESSION_COOKIE_NAME);
      expect(c?.value).toBe("");
      expect(c?.maxAge).toBe(0);
    });
  });
});

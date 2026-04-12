import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logDevEmailTokenIfEnabled } from "@/lib/identity/auth-dev-mail-log";

describe("logDevEmailTokenIfEnabled", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  beforeEach(() => {
    warnSpy.mockClear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not log in production even when flag is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS", "1");
    logDevEmailTokenIfEnabled("password_reset", { correlationId: "c1", rawToken: "secret-token" });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not log when flag is off", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS", "0");
    logDevEmailTokenIfEnabled("email_verify", { correlationId: "c2", rawToken: "tok" });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs banner once then token when non-production and flag is 1", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS", "1");
    logDevEmailTokenIfEnabled("password_reset", { correlationId: "c3", rawToken: "t1" });
    logDevEmailTokenIfEnabled("email_verify", { correlationId: "c4", rawToken: "t2" });
    expect(warnSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
    const first = String(warnSpy.mock.calls[0]?.[0] ?? "");
    expect(first).toContain("APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS is ACTIVE");
    const lines = warnSpy.mock.calls.map((c) => String(c[0] ?? ""));
    expect(lines.some((l) => l.includes("rawToken"))).toBe(true);
  });
});

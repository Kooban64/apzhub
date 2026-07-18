import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_SESSION_CONSTANTS,
  getBetterAuthAdvancedConfig,
  getBetterAuthSessionConfig,
  getSessionSecurityPolicy,
  isDevRegistrationAllowedFromEnv,
} from "./session-policy";

describe("session-policy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enforces secure cookies in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_DEV_REGISTRATION", "false");

    const policy = getSessionSecurityPolicy();
    expect(policy.cookies.secure).toBe(true);
    expect(policy.cookies.httpOnly).toBe(true);
    expect(policy.cookies.sameSite).toBe("lax");
    expect(policy.useSecureCookies).toBe(true);
    expect(policy.devRegistrationBlockedInProduction).toBe(true);
  });

  it("relaxes secure cookies in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ALLOW_DEV_REGISTRATION", "true");
    vi.stubEnv("DATABASE_URL", "postgresql://apzhub:apzhub@localhost:54334/apzhub");
    vi.stubEnv("REDIS_URL", "redis://localhost:6380");
    vi.stubEnv("BETTER_AUTH_SECRET", "test-test-test-test-test-test-test-test");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3300");

    const policy = getSessionSecurityPolicy();
    expect(policy.cookies.secure).toBe(false);
    expect(
      isDevRegistrationAllowedFromEnv({
        NODE_ENV: "development",
        ALLOW_DEV_REGISTRATION: "true",
      }),
    ).toBe(true);
  });

  it("maps policy to Better Auth session and advanced config", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_DEV_REGISTRATION", "false");

    const session = getBetterAuthSessionConfig();
    const advanced = getBetterAuthAdvancedConfig();

    expect(session.expiresIn).toBe(AUTH_SESSION_CONSTANTS.SESSION_EXPIRY_SECONDS);
    expect(session.updateAge).toBe(AUTH_SESSION_CONSTANTS.SESSION_UPDATE_AGE_SECONDS);
    expect(advanced.defaultCookieAttributes?.httpOnly).toBe(true);
    expect(advanced.useSecureCookies).toBe(true);
  });
});

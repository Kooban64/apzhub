import { afterEach, describe, expect, it, vi } from "vitest";

import { getDatabaseUrl, isDevRegistrationAllowed, resetEnvCache } from "./env";

const baseEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://apzhub:apzhub@localhost:54334/apzhub",
  REDIS_URL: "redis://localhost:6380",
  BETTER_AUTH_SECRET: "test-test-test-test-test-test-test-test",
  BETTER_AUTH_URL: "http://localhost:3300",
};

describe("env", () => {
  afterEach(() => {
    resetEnvCache();
    vi.unstubAllEnvs();
  });

  it("parses required environment variables", () => {
    vi.stubEnv("NODE_ENV", baseEnv.NODE_ENV);
    vi.stubEnv("DATABASE_URL", baseEnv.DATABASE_URL);
    vi.stubEnv("REDIS_URL", baseEnv.REDIS_URL);
    vi.stubEnv("BETTER_AUTH_SECRET", baseEnv.BETTER_AUTH_SECRET);
    vi.stubEnv("BETTER_AUTH_URL", baseEnv.BETTER_AUTH_URL);

    expect(getDatabaseUrl()).toBe(baseEnv.DATABASE_URL);
  });

  it("allows dev registration only in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ALLOW_DEV_REGISTRATION", "true");
    vi.stubEnv("DATABASE_URL", baseEnv.DATABASE_URL);
    vi.stubEnv("REDIS_URL", baseEnv.REDIS_URL);
    vi.stubEnv("BETTER_AUTH_SECRET", baseEnv.BETTER_AUTH_SECRET);
    vi.stubEnv("BETTER_AUTH_URL", baseEnv.BETTER_AUTH_URL);

    expect(isDevRegistrationAllowed()).toBe(true);

    resetEnvCache();
    vi.stubEnv("NODE_ENV", "production");
    expect(isDevRegistrationAllowed()).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { buildPlaywrightWebServerEnv } from "./web-server-env";

describe("buildPlaywrightWebServerEnv (RG-HEALTH-503)", () => {
  it("preserves process DATABASE_URL while applying overrides", () => {
    const previous = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgresql://example/db";
    try {
      const env = buildPlaywrightWebServerEnv({
        NEXT_PUBLIC_E2E_TEST_HOOKS: "true",
      });
      expect(env.DATABASE_URL).toBe("postgresql://example/db");
      expect(env.NEXT_PUBLIC_E2E_TEST_HOOKS).toBe("true");
    } finally {
      if (previous === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previous;
      }
    }
  });
});

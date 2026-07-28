/**
 * APZHUB-ENG-0006 / RG-HEALTH-503
 * Playwright `webServer.env` replaces the process environment when set.
 * Always merge with `process.env` so DATABASE_URL / REDIS_URL / auth secrets remain available.
 */

export function buildPlaywrightWebServerEnv(
  overrides: Record<string, string>,
): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      env[key] = value;
    }
  }
  return {
    ...env,
    ...overrides,
  };
}

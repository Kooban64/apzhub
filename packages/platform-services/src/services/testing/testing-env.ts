export function isTestingServiceEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.TESTING_SERVICE_ENABLED === "true";
}

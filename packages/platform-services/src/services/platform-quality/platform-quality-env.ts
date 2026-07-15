export function isPlatformQualityEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.PLATFORM_QUALITY_ENABLED === "true";
}

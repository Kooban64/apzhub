/**
 * Readiness indicators for the Platform Quality gateway layer (APZTCMS-014).
 *
 * Optional env flag: `PLATFORM_QUALITY_ENABLED=true` — bootstrap may check via
 * `isPlatformQualityEnabled()`. The test factory always enables the capability
 * without requiring the env flag. HTTP/OpenAPI/UI remain out of scope for this milestone.
 */
export interface PlatformQualityReadinessIndicators {
  readonly enabled: boolean;
  readonly domain: "provided" | "created";
  readonly eventBus: "not-wired";
  readonly httpRoutes: "not-wired";
  readonly openApi: "not-wired";
  readonly ui: "not-wired";
  readonly generatedAt: string;
}

export function createPlatformQualityReadinessIndicators(input: {
  readonly enabled: boolean;
  readonly domain: PlatformQualityReadinessIndicators["domain"];
}): PlatformQualityReadinessIndicators {
  return {
    enabled: input.enabled,
    domain: input.domain,
    eventBus: "not-wired",
    httpRoutes: "not-wired",
    openApi: "not-wired",
    ui: "not-wired",
    generatedAt: new Date().toISOString(),
  };
}

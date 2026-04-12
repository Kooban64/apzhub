/** Step 13: per-domain data source toggles. Default `mock` keeps CI and local dev stable. */

export type AdapterSource = "mock" | "file" | "real";

function readSource(env: string | undefined, fallback: AdapterSource): AdapterSource {
  const v = (env ?? "").toLowerCase().trim();
  if (v === "file" || v === "real" || v === "mock") {
    return v;
  }
  return fallback;
}

export function getIdentitySource(): "mock" | "oidc" | "local" {
  const v = (process.env.APZHUB_IDENTITY_SOURCE ?? process.env.NEXT_PUBLIC_APZHUB_IDENTITY_SOURCE ?? "mock")
    .toLowerCase()
    .trim();
  if (v === "oidc") {
    return "oidc";
  }
  if (v === "local") {
    return "local";
  }
  return "mock";
}

export function getProfileSource(): AdapterSource {
  return readSource(process.env.APZHUB_PROFILE_SOURCE, "mock");
}

export function getCatalogSource(): AdapterSource {
  return readSource(process.env.APZHUB_CATALOG_SOURCE, "mock");
}

export function getAccessSource(): AdapterSource {
  return readSource(process.env.APZHUB_ACCESS_SOURCE, "mock");
}

/**
 * When `true`, Postgres-materialized access rows treat any resolved entitlement as **provisioned**
 * (launch-ready) instead of `pending`. Use only in dev/staging without a provisioning worker.
 */
export function getAccessOptimisticRealization(): boolean {
  return (process.env.APZHUB_ACCESS_OPTIMISTIC_REALIZATION ?? "").toLowerCase().trim() === "true";
}

/**
 * When `true` with `APZHUB_ACCESS_SOURCE=real`, Postgres materialization errors **throw** instead of
 * falling back to mock catalog data (API routes return 5xx). Use in production when silent mock is unacceptable.
 */
export function getAccessStrictReal(): boolean {
  return (process.env.APZHUB_ACCESS_STRICT_REAL ?? "").toLowerCase().trim() === "true";
}

export function getProvisioningSource(): AdapterSource {
  return readSource(process.env.APZHUB_PROVISIONING_SOURCE, "mock");
}

export function getLaunchSource(): AdapterSource {
  return readSource(process.env.APZHUB_LAUNCH_SOURCE, "mock");
}

/** Required for `APZHUB_LAUNCH_SOURCE=real` internal JWT mint (HMAC-SHA256). */
export function getLaunchJwtSigningSecret(): string | undefined {
  const s = process.env.APZHUB_LAUNCH_JWT_SIGNING_SECRET?.trim();
  return s || undefined;
}

export function getLaunchJwtIssuer(): string {
  return process.env.APZHUB_LAUNCH_JWT_ISSUER?.trim() || "apzhub";
}

export function getLaunchJwtAudience(): string {
  return process.env.APZHUB_LAUNCH_JWT_AUDIENCE?.trim() || "apzhub-internal-services";
}

/**
 * JWT `aud` minted per workspace service so a token for `mail` cannot be presented as `drive`.
 * Format: `{baseAudience}:workspace-service:{serviceId}`.
 */
export function getLaunchJwtAudienceForService(serviceId: string): string {
  return `${getLaunchJwtAudience()}:workspace-service:${serviceId}`;
}

/** Max seconds token `iat`/`exp` may drift from server clock (RFC 7519 leeway). Default 60, max 300. */
export function getLaunchJwtClockSkewSeconds(): number {
  const n = Number(process.env.APZHUB_LAUNCH_JWT_CLOCK_SKEW_SECONDS ?? "60");
  return Number.isFinite(n) && n >= 0 && n <= 300 ? n : 60;
}

/**
 * When true, each `jti` is accepted only once at landing (refresh or replay reuses fail).
 * Default false so confirmation page can be refreshed.
 */
export function getLaunchJwtSingleUseEnabled(): boolean {
  return (process.env.APZHUB_LAUNCH_JWT_SINGLE_USE ?? "").toLowerCase().trim() === "true";
}

export function getLaunchJwtTtlSeconds(): number {
  const n = Number(process.env.APZHUB_LAUNCH_JWT_TTL_SECONDS ?? "300");
  return Number.isFinite(n) && n > 30 ? Math.min(n, 3600) : 300;
}

/** HMAC secret for signed OIDC `state`; defaults to JWT signing secret when unset. */
export function getLaunchOidcStateSigningSecret(): string | undefined {
  const o = process.env.APZHUB_LAUNCH_OIDC_STATE_SECRET?.trim();
  if (o) {
    return o;
  }
  return getLaunchJwtSigningSecret();
}

/** When true, OIDC transport uses `/api/workspace/launch/oidc-start` to attach session + state before IdP redirect. */
export function getLaunchOidcUseInternalStart(): boolean {
  return (process.env.APZHUB_LAUNCH_OIDC_USE_INTERNAL_START ?? "").toLowerCase().trim() === "true";
}

export function getAuditSource(): AdapterSource {
  return readSource(process.env.APZHUB_AUDIT_SOURCE, "mock");
}

export function getAccessFilePath(): string {
  return process.env.APZHUB_ACCESS_FILE ?? "data/config/admin-access.json";
}

/** When true, workspace launch posture is loaded via `/api/admin/access/posture` instead of bundled mock access. */
export function getAccessPostureUsesApi(): boolean {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_APZHUB_ACCESS_SOURCE ?? "mock") !== "mock";
  }
  return getAccessSource() !== "mock";
}

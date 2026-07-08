/** Law Platform API tenant identifiers (aligned with apps/law-platform/lib/persistence/default-tenant.ts). */

export const DEFAULT_LAW_TENANT_ID = "t0000001-0000-4000-8000-000000000001";

export const LAW_API_TENANT_ID_HEADER = "x-tenant-id";

const TENANT_ID_PATTERN =
  /^(?:t[\da-f]{7}|[\da-f]{8})-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

/** Validate tenant ID format. */
export function sanitizeTenantId(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!TENANT_ID_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

/** Default development tenant for single-firm law platform mode (LAW-012-02). */
export const DEFAULT_LAW_TENANT_ID = "t0000001-0000-4000-8000-000000000001";

/** Secondary tenant for tenant-isolation tests. */
export const SECONDARY_LAW_TENANT_ID = "t0000002-0000-4000-8000-000000000002";

export function resolveLawTenantId(override?: string): string {
  return override ?? process.env.LAW_TENANT_ID ?? DEFAULT_LAW_TENANT_ID;
}

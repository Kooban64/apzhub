import type { AdminAccessData } from "@/lib/admin/mock-access-data";

/** How the current admin access JSON payload was produced (for operators and UI). */
export type AdminAccessDataPlaneMeta = {
  origin:
    | "postgres"
    | "mock_catalog"
    | "mock_fallback_db_error"
    | "mock_fallback_no_database_url"
    | "mock_fallback_file_parse"
    | "mock_fallback_file_missing"
    | "access_file";
  /** Short operator-facing detail (e.g. error message for DB failures). */
  detail?: string;
};

/** Response shape for `GET /api/admin/access` (panels use `accessData` from the hook helper). */
export type AdminAccessApiResponse = AdminAccessData & {
  _meta: AdminAccessDataPlaneMeta;
};

export function stripAdminAccessMeta(full: AdminAccessApiResponse): AdminAccessData {
  const { _meta: _m, ...rest } = full;
  return rest as AdminAccessData;
}

export function isMockFallbackOrigin(origin: AdminAccessDataPlaneMeta["origin"]): boolean {
  return origin.startsWith("mock_fallback");
}

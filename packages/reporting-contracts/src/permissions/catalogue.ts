/**
 * Platform reporting permissions (APZREPORT-001).
 * Products may alias or extend; keys remain stable for gateway authz.
 */
export const PLATFORM_REPORT_PERMISSIONS = [
  "report.view",
  "report.generate",
  "report.preview",
  "report.templates",
  "report.audit",
  "report.admin",
] as const;

export type PlatformReportPermission = (typeof PLATFORM_REPORT_PERMISSIONS)[number];

/** Legacy TCMS-prefixed keys retained for compatibility. */
export const PLATFORM_REPORTING_LEGACY_PERMISSIONS = [
  "reporting.view",
  "reporting.generate",
  "reporting.admin",
] as const;

/**
 * Reporting searchable entity catalogue (APZSEARCH-014).
 * Source product is always `reporting`.
 * Local types expand the framework contract (`report|template|dashboard`).
 * Metadata-only — never rendered bodies, parametersJson values, or checksum hex.
 */

export const REPORTING_SEARCH_ENTITY_TYPES = [
  "report_template",
  "report_category",
  "report_placeholder_catalogue",
  "report_definition",
  "report_type",
  "report_profile",
  "report_generation",
  "report_generation_metadata",
  "report_output_metadata",
  "report_consumer",
  "report_usage_summary",
] as const;

export type ReportingSearchEntityType = (typeof REPORTING_SEARCH_ENTITY_TYPES)[number];

/** Framework-friendly aliases accepted by type guards (map to local expanded types). */
const FRAMEWORK_ALIASES: Readonly<Record<string, ReportingSearchEntityType>> = {
  template: "report_template",
  report: "report_generation_metadata",
  dashboard: "report_usage_summary",
};

export function isReportingSearchEntityType(
  value: string,
): value is ReportingSearchEntityType {
  if ((REPORTING_SEARCH_ENTITY_TYPES as readonly string[]).includes(value)) {
    return true;
  }
  return value in FRAMEWORK_ALIASES;
}

/** Resolve framework alias → local canonical entity type (identity when already local). */
export function resolveReportingSearchEntityType(
  value: string,
): ReportingSearchEntityType | undefined {
  if ((REPORTING_SEARCH_ENTITY_TYPES as readonly string[]).includes(value)) {
    return value as ReportingSearchEntityType;
  }
  return FRAMEWORK_ALIASES[value];
}

/** Detect rendered-content / credential / storage leakage patterns. */
const LEAKAGE_PATTERN =
  /parametersJson|checksum.?hex|renderedBody|pdfContent|docxContent|htmlBody|markdownBody|storageKey|bucket|signedUrl|secret|token|credential|password|s3:\/\/|\/tmp\/|\.pem\b/i;

export function looksLikeReportingLeak(value: string): boolean {
  return LEAKAGE_PATTERN.test(value);
}

export function assertPlatformEntityId(id: string, field = "id"): void {
  if (!id || id.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  if (looksLikeReportingLeak(id)) {
    throw new Error(
      `${field} must be a platform canonical id — rendered content / credential identifiers are forbidden`,
    );
  }
}

/**
 * APZ TCMS reporting domain models.
 * Platform canonical types from `@apzhub/reporting-contracts` (APZREPORT-001).
 * TCMS-specific report kinds remain product-owned.
 */

export type {
  ReportOutputFormat,
  ReportBlock,
  ReportSection,
  ReportBranding,
  CanonicalReportDocument,
  ReportParameters,
  TemplateSectionDefinition,
  TemplateBlockDefinition,
  ReportTemplate,
  ReportRequest,
  ReportValidationResult,
  RenderedReportOutput,
  ReportGenerationMetadata,
  ReportGenerationResult,
  ReportDescriptor,
  ReportTypeId,
} from "@apzhub/reporting-contracts";

export { REPORT_OUTPUT_FORMATS } from "@apzhub/reporting-contracts";

/** Supported TCMS report kinds (first consumer of platform reporting). */
export type ReportType =
  | "executive"
  | "engineering"
  | "qa"
  | "release"
  | "certification"
  | "coverage"
  | "automation"
  | "manual_testing"
  | "risk"
  | "evidence"
  | "historical"
  | "benchmark"
  | "quality"
  | "release_readiness";

export const REPORT_TYPES: readonly ReportType[] = [
  "executive",
  "engineering",
  "qa",
  "release",
  "certification",
  "coverage",
  "automation",
  "manual_testing",
  "risk",
  "evidence",
  "historical",
  "benchmark",
  "quality",
  "release_readiness",
] as const;

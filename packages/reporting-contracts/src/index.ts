export const REPORTING_CONTRACTS_VERSION = "0.1.0";

export type { ReportingRequestContext } from "./common/context";

export type {
  ReportTypeId,
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
} from "./domain/reporting";

export { REPORT_OUTPUT_FORMATS } from "./domain/reporting";

export type {
  PlatformReportingService,
  ReportingService,
  GenerateReportInput,
  PreviewReportInput,
  ValidateReportInput,
  RegisterTemplateInput,
  RenderReportInput,
} from "./services/reporting-service";

export {
  PLATFORM_REPORT_PERMISSIONS,
  PLATFORM_REPORTING_LEGACY_PERMISSIONS,
  type PlatformReportPermission,
} from "./permissions/catalogue";

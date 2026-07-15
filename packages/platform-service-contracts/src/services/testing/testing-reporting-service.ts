import type { ServiceRequestContext } from "../../common/context";
import type {
  CanonicalReportDocument,
  GenerateReportInput,
  PreviewReportInput,
  RegisterTemplateInput,
  RenderReportInput,
  ReportGenerationMetadata,
  ReportGenerationResult,
  ReportOutputFormat,
  ReportTemplate,
  ReportType,
  ReportValidationResult,
  RenderedReportOutput,
  ValidateReportInput,
} from "@apzhub/testing-contracts";

export interface TestingReportPlaceholder {
  readonly id: string;
  readonly title: string;
  readonly reason: "deferred" | "available";
  readonly reportType?: ReportType;
}

/**
 * Reporting framework platform facet (APZTCMS-024).
 * Gateway → RequestPipeline → authz → domain ReportingService.
 * No REST in this milestone.
 */
export interface TestingReportingService {
  listReportPlaceholders(
    ctx: ServiceRequestContext,
  ): Promise<readonly TestingReportPlaceholder[]>;

  listAvailableReports(
    ctx: ServiceRequestContext,
  ): Promise<readonly ReportType[]>;

  listTemplates(
    ctx: ServiceRequestContext,
    reportType?: ReportType,
  ): Promise<readonly ReportTemplate[]>;

  getTemplate(
    ctx: ServiceRequestContext,
    templateId: string,
  ): Promise<ReportTemplate>;

  registerTemplate(
    ctx: ServiceRequestContext,
    input: RegisterTemplateInput,
  ): Promise<ReportTemplate>;

  validateReport(
    ctx: ServiceRequestContext,
    input: ValidateReportInput,
  ): Promise<ReportValidationResult>;

  previewReport(
    ctx: ServiceRequestContext,
    input: PreviewReportInput,
  ): Promise<ReportGenerationResult>;

  generateReport(
    ctx: ServiceRequestContext,
    input: GenerateReportInput,
  ): Promise<ReportGenerationResult>;

  renderReport(
    ctx: ServiceRequestContext,
    input: RenderReportInput,
  ): Promise<RenderedReportOutput>;

  archiveReportMetadata(
    ctx: ServiceRequestContext,
    metadataId: string,
  ): Promise<ReportGenerationMetadata>;

  listReportMetadata(
    ctx: ServiceRequestContext,
  ): Promise<readonly ReportGenerationMetadata[]>;

  getReportMetadata(
    ctx: ServiceRequestContext,
    metadataId: string,
  ): Promise<ReportGenerationMetadata>;
}

export type {
  CanonicalReportDocument,
  GenerateReportInput,
  PreviewReportInput,
  RegisterTemplateInput,
  RenderReportInput,
  ReportGenerationMetadata,
  ReportGenerationResult,
  ReportOutputFormat,
  ReportTemplate,
  ReportType,
  ReportValidationResult,
  RenderedReportOutput,
  ValidateReportInput,
};

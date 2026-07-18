import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  CanonicalReportDocument,
  GenerateReportInput as PlatformGenerateReportInput,
  RegisterTemplateInput,
  RenderReportInput,
  ReportGenerationMetadata,
  ReportGenerationResult,
  ReportOutputFormat,
  ReportParameters,
  ReportTemplate,
  ReportValidationResult,
  RenderedReportOutput,
  ValidateReportInput as PlatformValidateReportInput,
} from "@apzhub/reporting-contracts";

import type { ReportType } from "../domain/reporting";

export type GenerateReportInput = Omit<PlatformGenerateReportInput, "reportType"> & {
  readonly reportType: ReportType;
};

export type PreviewReportInput = GenerateReportInput;

export type ValidateReportInput = Omit<PlatformValidateReportInput, "reportType"> & {
  readonly reportType: ReportType;
};

export type { RegisterTemplateInput, RenderReportInput };

/**
 * TCMS ReportingService — product-facing API with TCMS ReportType narrowing.
 * Implemented via `@apzhub/reporting-core` (APZREPORT-001).
 */
export interface ReportingService {
  listAvailableReports(ctx: ServiceRequestContext): Promise<readonly ReportType[]>;
  listTemplates(
    ctx: ServiceRequestContext,
    reportType?: ReportType,
  ): Promise<readonly ReportTemplate[]>;
  getTemplate(ctx: ServiceRequestContext, templateId: string): Promise<ReportTemplate>;
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

export type { CanonicalReportDocument, ReportOutputFormat, ReportParameters };

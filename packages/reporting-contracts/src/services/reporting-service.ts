import type { ReportingRequestContext } from "../common/context";

import type {
  CanonicalReportDocument,
  ReportGenerationMetadata,
  ReportGenerationResult,
  ReportOutputFormat,
  ReportParameters,
  ReportTemplate,
  ReportTypeId,
  ReportValidationResult,
  RenderedReportOutput,
} from "../domain/reporting";

export type GenerateReportInput = {
  readonly reportType: ReportTypeId;
  readonly templateId?: string;
  readonly outputFormat: ReportOutputFormat;
  readonly parameters?: ReportParameters;
  readonly organisationId?: string;
};

export type PreviewReportInput = GenerateReportInput;

export type ValidateReportInput = {
  readonly reportType: ReportTypeId;
  readonly templateId?: string;
  readonly outputFormat: ReportOutputFormat;
  readonly parameters?: ReportParameters;
};

export type RegisterTemplateInput = {
  readonly template: Omit<
    ReportTemplate,
    "builtin" | "createdAt" | "updatedAt" | "id"
  > & { readonly id?: string };
};

export type RenderReportInput = {
  readonly document: CanonicalReportDocument;
  readonly outputFormat: ReportOutputFormat;
};

/**
 * Platform Reporting Service (APZREPORT-001).
 * Product-agnostic. Consumes pre-computed parameters; does not calculate business values.
 */
export interface PlatformReportingService {
  listAvailableReports(
    ctx: ReportingRequestContext,
  ): Promise<readonly ReportTypeId[]>;
  listTemplates(
    ctx: ReportingRequestContext,
    reportType?: ReportTypeId,
  ): Promise<readonly ReportTemplate[]>;
  getTemplate(
    ctx: ReportingRequestContext,
    templateId: string,
  ): Promise<ReportTemplate>;
  registerTemplate(
    ctx: ReportingRequestContext,
    input: RegisterTemplateInput,
  ): Promise<ReportTemplate>;
  validateReport(
    ctx: ReportingRequestContext,
    input: ValidateReportInput,
  ): Promise<ReportValidationResult>;
  previewReport(
    ctx: ReportingRequestContext,
    input: PreviewReportInput,
  ): Promise<ReportGenerationResult>;
  generateReport(
    ctx: ReportingRequestContext,
    input: GenerateReportInput,
  ): Promise<ReportGenerationResult>;
  renderReport(
    ctx: ReportingRequestContext,
    input: RenderReportInput,
  ): Promise<RenderedReportOutput>;
  archiveReportMetadata(
    ctx: ReportingRequestContext,
    metadataId: string,
  ): Promise<ReportGenerationMetadata>;
  listReportMetadata(
    ctx: ReportingRequestContext,
  ): Promise<readonly ReportGenerationMetadata[]>;
  getReportMetadata(
    ctx: ReportingRequestContext,
    metadataId: string,
  ): Promise<ReportGenerationMetadata>;
}

/** @deprecated Prefer PlatformReportingService — alias for migration. */
export type ReportingService = PlatformReportingService;

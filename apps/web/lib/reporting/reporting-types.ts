/**
 * Presentation view models for Platform Reporting workbench (APZREPORT-002).
 */

export type ReportingClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
};

export type ReportingCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total: number;
};

export type ReportOutputFormatViewModel =
  "html" | "markdown" | "pdf" | "docx" | "json" | "csv";

export type ReportTypeViewModel = string;

export type ReportTemplateViewModel = {
  readonly id: string;
  readonly reportType: string;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly revision: number;
  readonly title: string;
  readonly subtitle?: string;
  readonly builtin: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReportValidationViewModel = {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
};

export type ReportGenerationMetadataViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly requestId: string;
  readonly templateId: string;
  readonly reportType: string;
  readonly outputFormat: ReportOutputFormatViewModel;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly version: string;
  readonly revision: number;
  readonly checksumSha256: string;
  readonly byteLength: number;
  readonly preview: boolean;
  readonly archivedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RenderedReportOutputViewModel = {
  readonly format: ReportOutputFormatViewModel;
  readonly contentType: string;
  readonly encoding: "utf-8" | "binary";
  readonly body: string;
  readonly byteLength: number;
  readonly checksumSha256: string;
};

export type CanonicalReportDocumentViewModel = {
  readonly id: string;
  readonly reportType: string;
  readonly templateId: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly tenantId: string;
  readonly version: string;
  readonly revision: number;
  readonly sections: readonly {
    readonly id: string;
    readonly title: string;
    readonly blocks: readonly unknown[];
  }[];
};

export type ReportGenerationResultViewModel = {
  readonly document: CanonicalReportDocumentViewModel;
  readonly output: RenderedReportOutputViewModel;
  readonly metadata: ReportGenerationMetadataViewModel;
};

export type GenerateReportClientInput = {
  readonly reportType: string;
  readonly templateId?: string;
  readonly outputFormat: ReportOutputFormatViewModel;
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly organisationId?: string;
};

export type ValidateReportClientInput = {
  readonly reportType: string;
  readonly templateId?: string;
  readonly outputFormat: ReportOutputFormatViewModel;
  readonly parameters?: Readonly<Record<string, unknown>>;
};

/**
 * APZHUB Platform Reporting domain models (APZREPORT-001).
 * Product-agnostic. Consumes pre-computed canonical values only — no business calculations.
 */

/** Product-supplied report kind identifier (e.g. TCMS "executive", Projects "portfolio"). */
export type ReportTypeId = string;

export type ReportOutputFormat =
  | "html"
  | "markdown"
  | "pdf"
  | "docx"
  | "json"
  | "csv";

export const REPORT_OUTPUT_FORMATS: readonly ReportOutputFormat[] = [
  "html",
  "markdown",
  "pdf",
  "docx",
  "json",
  "csv",
] as const;

export type ReportBlock =
  | {
      readonly kind: "heading";
      readonly level: 1 | 2 | 3;
      readonly text: string;
    }
  | { readonly kind: "paragraph"; readonly text: string }
  | {
      readonly kind: "metric";
      readonly label: string;
      readonly value: string;
      readonly unit?: string;
    }
  | {
      readonly kind: "table";
      readonly columns: readonly string[];
      readonly rows: readonly (readonly string[])[];
    }
  | {
      readonly kind: "list";
      readonly ordered?: boolean;
      readonly items: readonly string[];
    }
  | { readonly kind: "summary"; readonly text: string };

export type ReportSection = {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly ReportBlock[];
};

export type ReportBranding = {
  readonly productName?: string;
  readonly organisationName?: string;
  readonly footerText?: string;
};

/** Canonical document shared by all renderers / output providers. */
export type CanonicalReportDocument = {
  readonly id: string;
  readonly reportType: ReportTypeId;
  readonly templateId: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly version: string;
  readonly revision: number;
  readonly header?: string;
  readonly footer?: string;
  readonly branding?: ReportBranding;
  readonly metadata: Readonly<Record<string, string>>;
  readonly metrics: readonly { readonly label: string; readonly value: string }[];
  readonly sections: readonly ReportSection[];
};

/** Pre-computed display parameters — callers supply values; engine does not calculate. */
export type ReportParameters = {
  readonly metrics?: Readonly<Record<string, string | number>>;
  readonly tables?: Readonly<
    Record<
      string,
      {
        readonly columns: readonly string[];
        readonly rows: readonly (readonly string[])[];
      }
    >
  >;
  readonly lists?: Readonly<Record<string, readonly string[]>>;
  readonly summaries?: Readonly<Record<string, string>>;
  readonly text?: Readonly<Record<string, string>>;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type TemplateSectionDefinition = {
  readonly id: string;
  readonly title: string;
  /** Block blueprints; string fields may contain {{path}} placeholders. */
  readonly blocks: readonly TemplateBlockDefinition[];
};

export type TemplateBlockDefinition =
  | { readonly kind: "heading"; readonly level: 1 | 2 | 3; readonly text: string }
  | { readonly kind: "paragraph"; readonly text: string }
  | {
      readonly kind: "metric";
      readonly label: string;
      readonly valueKey: string;
      readonly unit?: string;
    }
  | { readonly kind: "table"; readonly tableKey: string }
  | {
      readonly kind: "list";
      readonly listKey: string;
      readonly ordered?: boolean;
    }
  | { readonly kind: "summary"; readonly summaryKey: string };

export type ReportTemplate = {
  readonly id: string;
  readonly reportType: ReportTypeId;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly revision: number;
  readonly title: string;
  readonly subtitle?: string;
  readonly header?: string;
  readonly footer?: string;
  readonly branding?: ReportBranding;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly metricKeys?: readonly string[];
  readonly sections: readonly TemplateSectionDefinition[];
  readonly builtin: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReportRequest = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly reportType: ReportTypeId;
  readonly templateId: string;
  readonly outputFormat: ReportOutputFormat;
  readonly parameters: ReportParameters;
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly preview?: boolean;
};

export type ReportValidationResult = {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
};

export type RenderedReportOutput = {
  readonly format: ReportOutputFormat;
  readonly contentType: string;
  readonly encoding: "utf-8" | "binary";
  /** UTF-8 text for text formats; base64 for binary formats. */
  readonly body: string;
  readonly byteLength: number;
  readonly checksumSha256: string;
};

export type ReportGenerationMetadata = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly requestId: string;
  readonly templateId: string;
  readonly reportType: ReportTypeId;
  readonly outputFormat: ReportOutputFormat;
  readonly parametersJson: string;
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
  readonly createdBy?: string;
  readonly updatedBy?: string;
};

export type ReportGenerationResult = {
  readonly document: CanonicalReportDocument;
  readonly output: RenderedReportOutput;
  readonly metadata: ReportGenerationMetadata;
};

/** Legacy descriptor retained for older product adapters. */
export type ReportDescriptor = {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly generatedAt: string;
  readonly format: string;
  readonly summary: string;
  readonly sections: readonly {
    readonly id: string;
    readonly title: string;
    readonly body: string;
  }[];
};

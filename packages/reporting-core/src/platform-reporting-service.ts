import type {
  GenerateReportInput,
  PlatformReportingService,
  PreviewReportInput,
  RegisterTemplateInput,
  RenderReportInput,
  ReportGenerationResult,
  ReportOutputFormat,
  ReportParameters,
  ReportTemplate,
  ReportingRequestContext,
  ReportTypeId,
  ValidateReportInput,
} from "@apzhub/reporting-contracts";
import { REPORT_OUTPUT_FORMATS } from "@apzhub/reporting-contracts";

import { renderOutput } from "./output";
import {
  ReportingDomainError,
  requireFound,
  type BuiltinTemplateCatalogue,
  type ReportMetadataRepositoryPort,
  type ReportTemplateRepositoryPort,
} from "./ports/types";
import {
  bindTemplateToDocument,
  validateTemplateBinding,
} from "./template-engine";

export type PlatformReportingEngineDeps = {
  readonly catalogue: BuiltinTemplateCatalogue;
  readonly templates: ReportTemplateRepositoryPort;
  readonly metadata: ReportMetadataRepositoryPort;
  readonly now: () => string;
  readonly id: () => string;
};

function assertOutputFormat(
  outputFormat: string,
): asserts outputFormat is ReportOutputFormat {
  if (!(REPORT_OUTPUT_FORMATS as readonly string[]).includes(outputFormat)) {
    throw new ReportingDomainError(
      "invalid_output_format",
      `Unsupported output format: ${outputFormat}`,
      { outputFormat },
    );
  }
}

function assertKnownReportType(
  reportType: ReportTypeId,
  known: readonly ReportTypeId[],
): void {
  if (known.length > 0 && !known.includes(reportType)) {
    throw new ReportingDomainError(
      "invalid_report_type",
      `Unknown report type: ${reportType}`,
      { reportType },
    );
  }
}

async function resolveTemplate(
  deps: PlatformReportingEngineDeps,
  ctx: ReportingRequestContext,
  templateId: string,
): Promise<ReportTemplate> {
  const builtin = deps.catalogue.get(templateId);
  if (builtin) return builtin;
  const row = await deps.templates.get(ctx, templateId);
  return requireFound(row, "report_template", templateId);
}

async function generate(
  deps: PlatformReportingEngineDeps,
  ctx: ReportingRequestContext,
  input: {
    readonly reportType: ReportTypeId;
    readonly templateId?: string;
    readonly outputFormat: ReportOutputFormat;
    readonly parameters?: ReportParameters;
    readonly organisationId?: string;
    readonly preview: boolean;
  },
): Promise<ReportGenerationResult> {
  assertKnownReportType(input.reportType, deps.catalogue.listReportTypes());
  assertOutputFormat(input.outputFormat);

  const templateId =
    input.templateId ?? deps.catalogue.defaultIdFor(input.reportType);
  const template = await resolveTemplate(deps, ctx, templateId);
  if (template.reportType !== input.reportType) {
    throw new ReportingDomainError(
      "template_type_mismatch",
      `Template ${template.id} is for ${template.reportType}, not ${input.reportType}`,
      { templateId: template.id, reportType: input.reportType },
    );
  }

  const parameters = input.parameters ?? {};
  const validation = validateTemplateBinding(
    template,
    parameters,
    input.outputFormat,
  );
  if (!validation.valid) {
    throw new ReportingDomainError(
      "report_validation_failed",
      validation.errors.join("; "),
      { errors: validation.errors, warnings: validation.warnings },
    );
  }

  const generatedAt = deps.now();
  const document = bindTemplateToDocument({
    template,
    parameters,
    documentId: deps.id(),
    tenantId: ctx.tenantId,
    organisationId: input.organisationId ?? ctx.organisationId,
    generatedBy: ctx.userId,
    generatedAt,
  });
  const output = renderOutput(document, input.outputFormat);
  const requestId = deps.id();

  const metadata = await deps.metadata.create(ctx, {
    id: deps.id(),
    requestId,
    templateId: template.id,
    reportType: input.reportType,
    outputFormat: input.outputFormat,
    parametersJson: JSON.stringify(parameters),
    generatedAt,
    generatedBy: ctx.userId,
    version: template.version,
    checksumSha256: output.checksumSha256,
    byteLength: output.byteLength,
    preview: input.preview,
    organisationId: input.organisationId ?? ctx.organisationId,
  });

  return { document, output, metadata };
}

/** Create the product-agnostic platform reporting service. */
export function createPlatformReportingService(
  deps: PlatformReportingEngineDeps,
): PlatformReportingService {
  return {
    async listAvailableReports() {
      return deps.catalogue.listReportTypes();
    },

    async listTemplates(ctx, reportType) {
      const builtins = deps.catalogue.list(reportType);
      const persisted = await deps.templates.list(ctx);
      const filtered = reportType
        ? persisted.filter((t) => t.reportType === reportType)
        : persisted;
      const builtinIds = new Set(builtins.map((t) => t.id));
      const custom = filtered.filter((t) => !builtinIds.has(t.id));
      return [...builtins, ...custom];
    },

    async getTemplate(ctx, templateId) {
      return resolveTemplate(deps, ctx, templateId);
    },

    async registerTemplate(ctx, input: RegisterTemplateInput) {
      const id = input.template.id ?? deps.id();
      if (deps.catalogue.get(id)) {
        throw new ReportingDomainError(
          "builtin_template_collision",
          `Cannot register template: id collides with builtin "${id}"`,
          { id },
        );
      }
      assertKnownReportType(
        input.template.reportType,
        deps.catalogue.listReportTypes(),
      );

      return deps.templates.create(ctx, {
        id,
        reportType: input.template.reportType,
        name: input.template.name,
        description: input.template.description,
        version: input.template.version,
        title: input.template.title,
        subtitle: input.template.subtitle,
        header: input.template.header,
        footer: input.template.footer,
        branding: input.template.branding,
        metadata: input.template.metadata,
        metricKeys: input.template.metricKeys,
        sections: input.template.sections,
        builtin: false,
        organisationId: ctx.organisationId,
      });
    },

    async validateReport(ctx, input: ValidateReportInput) {
      assertKnownReportType(input.reportType, deps.catalogue.listReportTypes());
      assertOutputFormat(input.outputFormat);
      const templateId =
        input.templateId ?? deps.catalogue.defaultIdFor(input.reportType);
      const template = await resolveTemplate(deps, ctx, templateId);
      return validateTemplateBinding(
        template,
        input.parameters ?? {},
        input.outputFormat,
      );
    },

    async previewReport(ctx, input: PreviewReportInput) {
      return generate(deps, ctx, { ...input, preview: true });
    },

    async generateReport(ctx, input: GenerateReportInput) {
      return generate(deps, ctx, { ...input, preview: false });
    },

    async renderReport(_ctx, input: RenderReportInput) {
      assertOutputFormat(input.outputFormat);
      return renderOutput(input.document, input.outputFormat);
    },

    async archiveReportMetadata(ctx, metadataId) {
      return deps.metadata.archive(ctx, metadataId);
    },

    async listReportMetadata(ctx) {
      return deps.metadata.list(ctx);
    },

    async getReportMetadata(ctx, metadataId) {
      return requireFound(
        await deps.metadata.get(ctx, metadataId),
        "report_generation_metadata",
        metadataId,
      );
    },
  };
}

import type {
  CanonicalReportDocument,
  ReportBlock,
  ReportBranding,
  ReportOutputFormat,
  ReportParameters,
  ReportSection,
  ReportTemplate,
  ReportValidationResult,
  TemplateBlockDefinition,
  TemplateSectionDefinition,
} from "@apzhub/reporting-contracts";
import { REPORT_OUTPUT_FORMATS } from "@apzhub/reporting-contracts";

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

function stringifyMetric(value: string | number | undefined): string {
  if (value === undefined) return "";
  return String(value);
}

/** Build lookup bag: text → metadata → metrics (stringified). Prefixed paths supported. */
function buildLookup(parameters: ReportParameters): Map<string, string> {
  const bag = new Map<string, string>();

  for (const [key, value] of Object.entries(parameters.metrics ?? {})) {
    const s = stringifyMetric(value);
    bag.set(key, s);
    bag.set(`metrics.${key}`, s);
  }
  for (const [key, value] of Object.entries(parameters.metadata ?? {})) {
    bag.set(key, value);
    bag.set(`metadata.${key}`, value);
  }
  for (const [key, value] of Object.entries(parameters.text ?? {})) {
    bag.set(key, value);
    bag.set(`text.${key}`, value);
  }
  return bag;
}

function resolvePlaceholders(text: string, bag: ReadonlyMap<string, string>): string {
  return text.replace(PLACEHOLDER, (_match, path: string) => bag.get(path) ?? "");
}

function bindBranding(
  branding: ReportBranding | undefined,
  bag: ReadonlyMap<string, string>,
): ReportBranding | undefined {
  if (!branding) return undefined;
  return {
    productName: branding.productName
      ? resolvePlaceholders(branding.productName, bag)
      : undefined,
    organisationName: branding.organisationName
      ? resolvePlaceholders(branding.organisationName, bag)
      : undefined,
    footerText: branding.footerText
      ? resolvePlaceholders(branding.footerText, bag)
      : undefined,
  };
}

function emptyTable(): {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
} {
  return { columns: [], rows: [] };
}

function bindBlock(
  block: TemplateBlockDefinition,
  parameters: ReportParameters,
  bag: ReadonlyMap<string, string>,
): ReportBlock {
  switch (block.kind) {
    case "heading":
      return {
        kind: "heading",
        level: block.level,
        text: resolvePlaceholders(block.text, bag),
      };
    case "paragraph":
      return {
        kind: "paragraph",
        text: resolvePlaceholders(block.text, bag),
      };
    case "metric": {
      const raw = parameters.metrics?.[block.valueKey];
      const value = stringifyMetric(raw);
      return {
        kind: "metric",
        label: block.label,
        value,
        ...(block.unit !== undefined ? { unit: block.unit } : {}),
      };
    }
    case "table": {
      const table = parameters.tables?.[block.tableKey] ?? emptyTable();
      return {
        kind: "table",
        columns: table.columns,
        rows: table.rows,
      };
    }
    case "list": {
      const items = parameters.lists?.[block.listKey] ?? [];
      return {
        kind: "list",
        ...(block.ordered !== undefined ? { ordered: block.ordered } : {}),
        items,
      };
    }
    case "summary":
      return {
        kind: "summary",
        text: parameters.summaries?.[block.summaryKey] ?? "",
      };
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

function bindSection(
  section: TemplateSectionDefinition,
  parameters: ReportParameters,
  bag: ReadonlyMap<string, string>,
): ReportSection {
  return {
    id: section.id,
    title: resolvePlaceholders(section.title, bag),
    blocks: section.blocks.map((b) => bindBlock(b, parameters, bag)),
  };
}

export type BindTemplateArgs = {
  readonly template: ReportTemplate;
  readonly parameters: ReportParameters;
  readonly documentId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly generatedBy: string;
  readonly generatedAt: string;
};

/**
 * Bind a template to a canonical document using pre-computed parameters only.
 * Performs string/table/list binding — no business calculations.
 */
export function bindTemplateToDocument(
  args: BindTemplateArgs,
): CanonicalReportDocument {
  const { template, parameters } = args;
  const bag = buildLookup(parameters);

  const sections = template.sections.map((s) => bindSection(s, parameters, bag));

  const metrics: { readonly label: string; readonly value: string }[] = [];
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.kind === "metric") {
        metrics.push({ label: block.label, value: block.value });
      }
    }
  }

  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(template.metadata ?? {})) {
    metadata[key] = resolvePlaceholders(value, bag);
  }
  for (const [key, value] of Object.entries(parameters.metadata ?? {})) {
    metadata[key] = value;
  }

  return {
    id: args.documentId,
    reportType: template.reportType,
    templateId: template.id,
    title: resolvePlaceholders(template.title, bag),
    ...(template.subtitle !== undefined
      ? { subtitle: resolvePlaceholders(template.subtitle, bag) }
      : {}),
    generatedAt: args.generatedAt,
    generatedBy: args.generatedBy,
    tenantId: args.tenantId,
    ...(args.organisationId !== undefined
      ? { organisationId: args.organisationId }
      : {}),
    version: template.version,
    revision: template.revision,
    ...(template.header !== undefined
      ? { header: resolvePlaceholders(template.header, bag) }
      : {}),
    ...(template.footer !== undefined
      ? { footer: resolvePlaceholders(template.footer, bag) }
      : {}),
    ...(template.branding !== undefined
      ? { branding: bindBranding(template.branding, bag) }
      : {}),
    metadata,
    metrics,
    sections,
  };
}

function isOutputFormat(value: string): value is ReportOutputFormat {
  return (REPORT_OUTPUT_FORMATS as readonly string[]).includes(value);
}

/**
 * Validate that parameters can bind to a template for the given output format.
 * Does not perform business calculations.
 */
export function validateTemplateBinding(
  template: ReportTemplate,
  parameters: ReportParameters,
  outputFormat: ReportOutputFormat | string,
): ReportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isOutputFormat(outputFormat)) {
    errors.push(`Unsupported output format: ${outputFormat}`);
  }

  const metricKeys = new Set(template.metricKeys ?? []);
  for (const section of template.sections) {
    for (const block of section.blocks) {
      if (block.kind === "metric") metricKeys.add(block.valueKey);
      if (block.kind === "table" && !parameters.tables?.[block.tableKey]) {
        warnings.push(`Missing table "${block.tableKey}" — empty table will be used`);
      }
      if (block.kind === "list" && !parameters.lists?.[block.listKey]) {
        warnings.push(`Missing list "${block.listKey}" — empty list will be used`);
      }
      if (
        block.kind === "summary" &&
        parameters.summaries?.[block.summaryKey] === undefined
      ) {
        warnings.push(
          `Missing summary "${block.summaryKey}" — empty summary will be used`,
        );
      }
    }
  }

  for (const key of metricKeys) {
    if (parameters.metrics?.[key] === undefined) {
      errors.push(`Missing required metric "${key}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

import {
  REPORT_OUTPUT_FORMATS,
  type ReportGenerationMetadata,
  type ReportTemplate,
} from "@apzhub/reporting-contracts";
import { describe, expect, it } from "vitest";

import {
  bindTemplateToDocument,
  createPlatformReportingService,
  renderOutput,
  REPORTING_CORE_VERSION,
  sha256Hex,
  type BuiltinTemplateCatalogue,
  type ReportMetadataRepositoryPort,
  type ReportTemplateRepositoryPort,
} from "./index";

const FIXED = "2026-07-13T00:00:00.000Z";

const template: ReportTemplate = {
  id: "tmpl-platform-demo",
  reportType: "demo",
  name: "Demo",
  version: "1.0.0",
  revision: 1,
  title: "Demo — {{productName}}",
  metricKeys: ["score"],
  sections: [
    {
      id: "main",
      title: "Main",
      blocks: [
        { kind: "heading", level: 1, text: "Demo" },
        { kind: "metric", label: "Score", valueKey: "score" },
        { kind: "summary", summaryKey: "summary" },
      ],
    },
  ],
  builtin: true,
  createdAt: FIXED,
  updatedAt: FIXED,
};

const catalogue: BuiltinTemplateCatalogue = {
  list: (reportType) =>
    !reportType || reportType === "demo" ? [template] : [],
  get: (id) => (id === template.id ? template : undefined),
  defaultIdFor: () => template.id,
  listReportTypes: () => ["demo"],
};

function memoryStores(): {
  templates: ReportTemplateRepositoryPort;
  metadata: ReportMetadataRepositoryPort;
} {
  const templates = new Map<string, ReportTemplate>();
  const metadata = new Map<string, ReportGenerationMetadata>();
  return {
    templates: {
      async list() {
        return [...templates.values()];
      },
      async get(_ctx, id) {
        return templates.get(id) ?? null;
      },
      async create(_ctx, input) {
        const row: ReportTemplate = {
          id: input.id,
          reportType: input.reportType,
          name: input.name,
          version: input.version,
          revision: 1,
          title: input.title,
          sections: input.sections,
          builtin: false,
          createdAt: FIXED,
          updatedAt: FIXED,
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
        };
        templates.set(row.id, row);
        return row;
      },
    },
    metadata: {
      async create(_ctx, input) {
        const row: ReportGenerationMetadata = {
          id: input.id ?? `meta_${metadata.size + 1}`,
          tenantId: "t1",
          requestId: input.requestId,
          templateId: input.templateId,
          reportType: input.reportType,
          outputFormat: input.outputFormat as ReportGenerationMetadata["outputFormat"],
          parametersJson: input.parametersJson,
          generatedAt: input.generatedAt,
          generatedBy: input.generatedBy,
          version: input.version,
          revision: 1,
          checksumSha256: input.checksumSha256,
          byteLength: input.byteLength,
          preview: input.preview,
          createdAt: FIXED,
          updatedAt: FIXED,
        };
        metadata.set(row.id, row);
        return row;
      },
      async get(_ctx, id) {
        return metadata.get(id) ?? null;
      },
      async list() {
        return [...metadata.values()];
      },
      async archive(_ctx, id) {
        const existing = metadata.get(id);
        if (!existing) throw new Error("missing");
        const archived = {
          ...existing,
          archivedAt: FIXED,
          updatedAt: FIXED,
          revision: existing.revision + 1,
        };
        metadata.set(id, archived);
        return archived;
      },
    },
  };
}

const ctx = {
  tenantId: "t1",
  userId: "u1",
  correlationId: "c1",
  permissions: ["report.*"],
  organisationId: "o1",
};

describe("@apzhub/reporting-core", () => {
  it("exports version 0.1.0", () => {
    expect(REPORTING_CORE_VERSION).toBe("0.1.0");
  });

  it("binds templates and renders all formats without business calculation", () => {
    const document = bindTemplateToDocument({
      template,
      parameters: {
        text: { productName: "APZHUB" },
        metrics: { score: 42 },
        summaries: { summary: "ok" },
      },
      documentId: "d1",
      tenantId: "t1",
      generatedBy: "u1",
      generatedAt: FIXED,
    });
    expect(document.title).toContain("APZHUB");
    expect(document.metrics[0]?.value).toBe("42");
    for (const format of REPORT_OUTPUT_FORMATS) {
      const out = renderOutput(document, format);
      expect(out.byteLength).toBeGreaterThan(0);
      expect(out.checksumSha256).toBe(
        sha256Hex(
          out.encoding === "binary"
            ? Buffer.from(out.body, "base64")
            : Buffer.from(out.body, "utf8"),
        ),
      );
    }
  });

  it("creates platform reporting service over ports", async () => {
    const stores = memoryStores();
    let n = 0;
    const service = createPlatformReportingService({
      catalogue,
      templates: stores.templates,
      metadata: stores.metadata,
      now: () => FIXED,
      id: () => `id_${++n}`,
    });

    expect(await service.listAvailableReports(ctx)).toEqual(["demo"]);
    const generated = await service.generateReport(ctx, {
      reportType: "demo",
      outputFormat: "html",
      parameters: {
        text: { productName: "X" },
        metrics: { score: 9 },
        summaries: { summary: "s" },
      },
    });
    expect(generated.output.format).toBe("html");
    expect(generated.metadata.preview).toBe(false);

    const archived = await service.archiveReportMetadata(
      ctx,
      generated.metadata.id,
    );
    expect(archived.archivedAt).toBe(FIXED);
  });
});

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  REPORT_OUTPUT_FORMATS,
  REPORT_TYPES,
  type ReportParameters,
  type ReportTemplate,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  bindTemplateToDocument,
  createReportingFrameworkServices,
  createTestingDomainServices,
  defaultTemplateIdFor,
  getBuiltinTemplate,
  listBuiltinTemplates,
  renderOutput,
  ReportingDomainError,
  sha256Hex,
  TESTING_SERVICES_VERSION,
  BUILTIN_REPORT_TEMPLATES,
} from "../index";

const ALL_PERMS = [
  "report.view",
  "report.generate",
  "report.preview",
  "report.templates",
  "report.audit",
  "report.admin",
  "reporting.view",
  "reporting.generate",
  "reporting.admin",
] as const;

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_rpt_1",
    permissions: [...ALL_PERMS],
    organisationId: "org_1",
    ...overrides,
  };
}

function services() {
  return createReportingFrameworkServices({
    persistence: createInMemoryTestingPersistence(),
    now: () => "2026-07-13T00:00:00.000Z",
    id: (() => {
      let n = 0;
      return () => `rpt_${++n}`;
    })(),
  });
}

function sampleParameters(): ReportParameters {
  return {
    text: {
      productName: "APZHUB",
      organisationName: "Acme",
      periodLabel: "Q2 2026",
      executiveSummary: "Quality is stable.",
    },
    metadata: { environment: "staging" },
    metrics: {
      passRate: 97.5,
      coveragePercent: 88,
      openRisks: 3,
      releaseReadiness: 92,
    },
    tables: {
      keyIndicators: {
        columns: ["Indicator", "Value"],
        rows: [
          ["Pass rate", "97.5"],
          ["Coverage", "88"],
        ],
      },
    },
    lists: {
      highlights: ["Coverage improved", "No critical defects"],
    },
    summaries: {
      executiveSummary: "Ready for executive review.",
    },
  };
}

describe("reporting framework version & wiring", () => {
  it("exports 0.11.0 and wires reporting on domain factory", () => {
    expect(TESTING_SERVICES_VERSION).toBe("0.11.0");
    const all = createTestingDomainServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(all.reporting.reporting).toBeTruthy();
  });
});

describe("builtin templates", () => {
  it("lists one builtin per report type and resolves by id", () => {
    const listed = listBuiltinTemplates();
    expect(listed).toHaveLength(REPORT_TYPES.length);
    expect(BUILTIN_REPORT_TEMPLATES).toHaveLength(14);
    for (const reportType of REPORT_TYPES) {
      const id = defaultTemplateIdFor(reportType);
      const tmpl = getBuiltinTemplate(id);
      expect(tmpl).toBeDefined();
      expect(tmpl!.reportType).toBe(reportType);
      expect(tmpl!.builtin).toBe(true);
      expect(tmpl!.version).toBe("1.0.0");
      expect(listBuiltinTemplates(reportType)).toHaveLength(1);
    }
  });
});

describe("template engine binding", () => {
  it("resolves placeholders and passes metrics through without calculation", () => {
    const template = getBuiltinTemplate("tmpl-executive-dashboard")!;
    const parameters = sampleParameters();
    const doc = bindTemplateToDocument({
      template,
      parameters,
      documentId: "doc_1",
      tenantId: "tenant_1",
      organisationId: "org_1",
      generatedBy: "user_1",
      generatedAt: "2026-07-13T00:00:00.000Z",
    });
    expect(doc.title).toContain("APZHUB");
    expect(doc.subtitle).toBe("Q2 2026");
    const passMetric = doc.metrics.find((m) => m.label === "Pass rate");
    expect(passMetric?.value).toBe("97.5");
    // No business calculation — values pass through as provided.
    expect(passMetric?.value).not.toBe("98");
    const table = doc.sections[0]!.blocks.find((b) => b.kind === "table");
    expect(table?.kind).toBe("table");
    if (table?.kind === "table") {
      expect(table.rows).toHaveLength(2);
    }
  });
});

describe("output providers", () => {
  it("produces non-empty output and checksum for each format", () => {
    const template = getBuiltinTemplate("tmpl-executive-dashboard")!;
    const document = bindTemplateToDocument({
      template,
      parameters: sampleParameters(),
      documentId: "doc_out",
      tenantId: "tenant_1",
      generatedBy: "user_1",
      generatedAt: "2026-07-13T00:00:00.000Z",
    });
    for (const format of REPORT_OUTPUT_FORMATS) {
      const rendered = renderOutput(document, format);
      expect(rendered.format).toBe(format);
      expect(rendered.byteLength).toBeGreaterThan(0);
      expect(rendered.body.length).toBeGreaterThan(0);
      expect(rendered.checksumSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(rendered.checksumSha256).toBe(
        sha256Hex(
          rendered.encoding === "binary"
            ? Buffer.from(rendered.body, "base64")
            : Buffer.from(rendered.body, "utf8"),
        ),
      );
      if (format === "pdf" || format === "docx") {
        expect(rendered.encoding).toBe("binary");
      } else {
        expect(rendered.encoding).toBe("utf-8");
      }
    }
  });
});

describe("ReportingService", () => {
  it("lists available reports and templates", async () => {
    const { reporting } = services();
    const types = await reporting.listAvailableReports(ctx());
    expect(types).toEqual(REPORT_TYPES);
    const templates = await reporting.listTemplates(ctx());
    expect(templates.length).toBeGreaterThanOrEqual(14);
    const exec = await reporting.getTemplate(ctx(), "tmpl-executive-dashboard");
    expect(exec.id).toBe("tmpl-executive-dashboard");
  });

  it("validates, previews, and generates reports", async () => {
    const { reporting } = services();
    const parameters = sampleParameters();

    const invalid = await reporting.validateReport(ctx(), {
      reportType: "executive",
      outputFormat: "html",
      parameters: { metrics: {} },
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);

    const valid = await reporting.validateReport(ctx(), {
      reportType: "executive",
      outputFormat: "html",
      parameters,
    });
    expect(valid.valid).toBe(true);

    const preview = await reporting.previewReport(ctx(), {
      reportType: "executive",
      outputFormat: "markdown",
      parameters,
    });
    expect(preview.metadata.preview).toBe(true);
    expect(preview.output.format).toBe("markdown");
    expect(preview.document.metrics.find((m) => m.label === "Pass rate")?.value).toBe(
      "97.5",
    );

    const generated = await reporting.generateReport(ctx(), {
      reportType: "executive",
      outputFormat: "json",
      parameters,
    });
    expect(generated.metadata.preview).toBe(false);
    expect(generated.output.contentType).toBe("application/json");
    expect(generated.output.checksumSha256).toHaveLength(64);

    const listed = await reporting.listReportMetadata(ctx());
    expect(listed.length).toBeGreaterThanOrEqual(2);
    const fetched = await reporting.getReportMetadata(ctx(), generated.metadata.id);
    expect(fetched.id).toBe(generated.metadata.id);
  });

  it("registers custom templates and archives metadata", async () => {
    const { reporting } = services();
    const custom: Omit<ReportTemplate, "builtin" | "createdAt" | "updatedAt" | "id"> & {
      id?: string;
    } = {
      id: "tmpl-custom-exec",
      reportType: "executive",
      name: "Custom Executive",
      version: "1.0.0",
      revision: 1,
      title: "Custom — {{productName}}",
      metricKeys: ["passRate"],
      sections: [
        {
          id: "main",
          title: "Main",
          blocks: [
            { kind: "heading", level: 1, text: "Custom" },
            { kind: "metric", label: "Pass rate", valueKey: "passRate" },
          ],
        },
      ],
    };

    const registered = await reporting.registerTemplate(ctx(), {
      template: custom,
    });
    expect(registered.builtin).toBe(false);
    expect(registered.id).toBe("tmpl-custom-exec");

    await expect(
      reporting.registerTemplate(ctx(), {
        template: {
          ...custom,
          id: "tmpl-executive-dashboard",
        },
      }),
    ).rejects.toThrow(ReportingDomainError);

    const generated = await reporting.generateReport(ctx(), {
      reportType: "executive",
      templateId: "tmpl-custom-exec",
      outputFormat: "csv",
      parameters: {
        text: { productName: "APZHUB" },
        metrics: { passRate: 42 },
      },
    });
    expect(generated.document.metrics[0]?.value).toBe("42");

    const archived = await reporting.archiveReportMetadata(
      ctx(),
      generated.metadata.id,
    );
    expect(archived.archivedAt).toBeTruthy();
  });

  it("renderReport only renders without persisting new generation for same call", async () => {
    const { reporting } = services();
    const parameters = sampleParameters();
    const generated = await reporting.generateReport(ctx(), {
      reportType: "executive",
      outputFormat: "html",
      parameters,
    });
    const before = (await reporting.listReportMetadata(ctx())).length;
    const rendered = await reporting.renderReport(ctx(), {
      document: generated.document,
      outputFormat: "pdf",
    });
    expect(rendered.format).toBe("pdf");
    expect(rendered.encoding).toBe("binary");
    expect(rendered.body.length).toBeGreaterThan(0);
    const after = (await reporting.listReportMetadata(ctx())).length;
    expect(after).toBe(before);
  });

  it("rejects invalid types, template mismatches, and missing templates", async () => {
    const { reporting } = services();
    await expect(
      reporting.generateReport(ctx(), {
        reportType: "not-a-type" as never,
        outputFormat: "html",
        parameters: sampleParameters(),
      }),
    ).rejects.toThrow(/Unknown report type/);

    await expect(
      reporting.generateReport(ctx(), {
        reportType: "executive",
        outputFormat: "xml" as never,
        parameters: sampleParameters(),
      }),
    ).rejects.toThrow(/Unsupported output format/);

    await expect(
      reporting.generateReport(ctx(), {
        reportType: "qa",
        templateId: "tmpl-executive-dashboard",
        outputFormat: "html",
        parameters: sampleParameters(),
      }),
    ).rejects.toThrow(/not qa/);

    await expect(reporting.getTemplate(ctx(), "tmpl-missing-xyz")).rejects.toThrow();

    await expect(
      reporting.generateReport(ctx(), {
        reportType: "executive",
        outputFormat: "html",
        parameters: { metrics: {} },
      }),
    ).rejects.toThrow(/report_validation_failed|Missing required metric/);
  });
});

describe("html/markdown edge blocks", () => {
  it("renders ordered lists, branding, and empty optional fields", () => {
    const document = {
      id: "doc_edge",
      reportType: "automation" as const,
      templateId: "tmpl-automation-summary",
      title: "Edge <Report>",
      generatedAt: "2026-07-13T00:00:00.000Z",
      generatedBy: "user_1",
      tenantId: "tenant_1",
      version: "1.0.0",
      revision: 1,
      branding: {
        productName: "APZHUB",
        organisationName: "Acme",
        footerText: "Footer",
      },
      metadata: { k: "v" },
      metrics: [{ label: "A", value: "1" }],
      sections: [
        {
          id: "s1",
          title: "S1",
          blocks: [
            { kind: "heading" as const, level: 2 as const, text: "H2" },
            { kind: "paragraph" as const, text: "P & Q" },
            { kind: "metric" as const, label: "M", value: "2", unit: "%" },
            {
              kind: "list" as const,
              ordered: true,
              items: ["one", "two"],
            },
            { kind: "summary" as const, text: "Sum" },
            {
              kind: "table" as const,
              columns: ["C"],
              rows: [["R"]],
            },
          ],
        },
      ],
    };
    const html = renderOutput(document, "html");
    expect(html.body).toContain("<ol>");
    expect(html.body).toContain("Edge &lt;Report&gt;");
    const md = renderOutput(document, "markdown");
    expect(md.body).toContain("1. one");
    const csv = renderOutput(document, "csv");
    expect(csv.body).toContain("A");
  });
});

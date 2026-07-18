/**
 * APZSEARCH-014 — Reporting Search Publication Adapter tests.
 */
import { describe, expect, it } from "vitest";
import type {
  ReportGenerationMetadata,
  ReportTemplate,
} from "@apzhub/reporting-contracts";
import { createSearchIntegration } from "@apzhub/search-integration";

import {
  SEARCH_REPORTING_VERSION,
  createReportingSearchAdapter,
  createReportingSearchAdapterForTest,
  createReportingSearchPublisher,
  createReportingSearchPublicationContext,
  isReportingSearchEntityType,
  looksLikeReportingLeak,
  resolveReportingSearchEntityType,
} from "./index";

function ctx(tenantId = "tenant-a", org = "org-a") {
  return createReportingSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-014",
      permissions: ["reporting.read", "search.query.execute"],
      organisationId: org,
      workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });
}

const template: ReportTemplate = {
  id: "tpl_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reportType: "executive",
  name: "Executive Template",
  description: "Monthly executive summary",
  version: "1.0.0",
  revision: 1,
  title: "Executive Report",
  subtitle: "Confidential",
  header: "MUST NOT PUBLISH HEADER",
  footer: "MUST NOT PUBLISH FOOTER",
  branding: { productName: "Hidden Brand" },
  metadata: { reportType: "executive", status: "active" },
  sections: [
    {
      id: "sec-1",
      title: "Overview",
      blocks: [{ kind: "paragraph", text: "SECRET BODY" }],
    },
  ],
  builtin: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const generation: ReportGenerationMetadata = {
  id: "gen_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  organisationId: "org-a",
  requestId: "req-1",
  templateId: template.id,
  reportType: "executive",
  outputFormat: "pdf",
  parametersJson: '{"secret":"MUST_NOT_PUBLISH"}',
  generatedAt: "2026-01-03T00:00:00.000Z",
  generatedBy: "user-1",
  version: "1.0.0",
  revision: 1,
  checksumSha256: "deadbeef".repeat(8),
  byteLength: 4096,
  preview: false,
  createdAt: "2026-01-03T00:00:00.000Z",
  updatedAt: "2026-01-03T00:00:00.000Z",
};

describe("APZSEARCH-014 search-reporting", () => {
  it("ships version and entity catalogue", () => {
    expect(SEARCH_REPORTING_VERSION).toBe("0.1.0");
    expect(isReportingSearchEntityType("report_template")).toBe(true);
    expect(isReportingSearchEntityType("report_generation_metadata")).toBe(true);
    expect(isReportingSearchEntityType("template")).toBe(true);
    expect(resolveReportingSearchEntityType("template")).toBe("report_template");
    expect(isReportingSearchEntityType("support_request")).toBe(false);
    expect(looksLikeReportingLeak("parametersJson")).toBe(true);
    expect(looksLikeReportingLeak("tpl_ok")).toBe(false);
  });

  it("maps and publishes Reporting entity types without content leakage", () => {
    const adapter = createReportingSearchAdapterForTest();
    const context = ctx();

    const inputs = [
      {
        entityType: "report_template" as const,
        entity: template,
        extras: { tenantId: "tenant-a" },
      },
      {
        entityType: "report_category" as const,
        entity: {
          id: "cat_1",
          tenantId: "tenant-a",
          name: "Finance",
          description: "Finance reports",
          parentId: "cat_root",
        },
      },
      {
        entityType: "report_placeholder_catalogue" as const,
        entity: {
          id: "ph_1",
          title: "Executive placeholders",
          placeholders: ["period", "owner"],
        },
      },
      {
        entityType: "report_definition" as const,
        entity: {
          id: "def_1",
          title: "Exec def",
          templateId: template.id,
          reportType: "executive",
        },
      },
      {
        entityType: "report_type" as const,
        entity: { id: "rtype_1", name: "executive", description: "Exec" },
      },
      {
        entityType: "report_profile" as const,
        entity: { id: "prof_1", name: "Default", description: "Default profile" },
      },
      {
        entityType: "report_generation_metadata" as const,
        entity: generation,
      },
      {
        entityType: "report_generation" as const,
        entity: { ...generation, id: "gen_cccccccccccccccccccccccccccccccc" },
      },
      {
        entityType: "report_output_metadata" as const,
        entity: generation,
      },
      {
        entityType: "report_consumer" as const,
        entity: { id: "cons_1", name: "Projects", description: "Projects product" },
      },
      {
        entityType: "report_usage_summary" as const,
        entity: {
          id: "usage_1",
          title: "Executive usage",
          generationCount: 12,
          lastGeneratedAt: "2026-01-03T00:00:00.000Z",
        },
      },
    ];

    for (const input of inputs) {
      const preview = adapter.publisher.preview(context, input);
      expect(preview.ok, input.entityType).toBe(true);
      expect(preview.previewMetadata?.productId).toBe("reporting");
      expect(JSON.stringify(preview.previewMetadata)).not.toMatch(
        /MUST_NOT_PUBLISH|SECRET BODY|deadbeef|Hidden Brand/i,
      );

      const published = adapter.publisher.publish(context, input);
      expect(published.ok, input.entityType).toBe(true);
      expect(published.lifecycleState).toBe("published");
    }

    expect(adapter.integration.sink.count()).toBeGreaterThanOrEqual(11);
    const stats = adapter.publisher.statistics(context);
    expect(stats.published).toBeGreaterThanOrEqual(11);

    const tplDraft = adapter.mapper.mapReportTemplate(context, template, {
      tenantId: "tenant-a",
    });
    expect(tplDraft.entityType).toBe("report_template");
    expect(tplDraft.metadata?.reportType).toBe("executive");
    expect(tplDraft.metadata).not.toHaveProperty("sections");
    expect(tplDraft.metadata).not.toHaveProperty("header");
    expect(JSON.stringify(tplDraft)).not.toMatch(/SECRET BODY|MUST NOT PUBLISH/);

    const genDraft = adapter.mapper.mapReportGeneration(
      context,
      generation,
      "report_generation_metadata",
    );
    expect(genDraft.title).toBe("executive report (pdf)");
    expect(genDraft.metadata?.checksumPresent).toBe("true");
    expect(genDraft.metadata).not.toHaveProperty("parametersJson");
    expect(JSON.stringify(genDraft.metadata)).not.toMatch(/deadbeef|MUST_NOT/);

    const outDraft = adapter.mapper.mapReportOutputMetadata(context, generation);
    expect(outDraft.entityType).toBe("report_output_metadata");
    expect(outDraft.metadata?.outputFormat).toBe("pdf");
    expect(outDraft.metadata?.byteLength).toBe("4096");
  });

  it("rejects content leakage and tenant mismatches", () => {
    const adapter = createReportingSearchAdapterForTest();
    const context = ctx();

    expect(() =>
      adapter.mapper.mapReportTemplate(context, {
        ...template,
        id: "parametersJson_leaky",
      }),
    ).toThrow(/forbidden|credential|content/i);

    expect(() =>
      adapter.mapper.mapReportGeneration(
        context,
        { ...generation, tenantId: "other-tenant" },
        "report_generation_metadata",
      ),
    ).toThrow(/tenant mismatch/);

    const leakReject = adapter.validator.validateDraft(context, {
      entityId: "ok",
      entityType: "report_template",
      title: "X",
      classification: "confidential",
      permissions: ["reporting.read"],
      metadata: {
        reportType: "executive",
        version: "1",
        parametersJson: '{"a":1}',
      },
    });
    expect(leakReject.valid).toBe(false);
    expect(leakReject.issues.some((i) => i.code === "content_leakage")).toBe(true);

    const published = adapter.publisher.publish(context, {
      entityType: "report_generation_metadata",
      entity: generation,
    });
    expect(published.ok).toBe(true);

    const crossTenantRemove = adapter.publisher.remove(
      ctx("other-tenant"),
      "report_generation_metadata",
      generation.id,
    );
    expect(crossTenantRemove.ok).toBe(false);
  });

  it("supports production factory with explicit sink and rejects silent memory", () => {
    expect(() => createReportingSearchAdapter()).toThrow(/explicit sink/);
    expect(() => createReportingSearchPublisher()).toThrow(/explicit sink/);

    const integration = createSearchIntegration();
    const adapter = createReportingSearchAdapter({
      sink: integration.sink,
    });
    expect(
      adapter.publisher.publish(ctx(), {
        entityType: "report_template",
        entity: template,
        extras: { tenantId: "tenant-a" },
      }).ok,
    ).toBe(true);

    const publisher = createReportingSearchPublisher({
      integrationPublisher: integration.publisher,
      integration,
    });
    expect(publisher).toBeDefined();
  });

  it("accepts ReportingRequestContext for publication context", () => {
    const context = createReportingSearchPublicationContext({
      reportingContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-rpt",
        permissions: ["reporting.read"],
        organisationId: "org-a",
      },
      classification: "internal",
    });
    expect(context.classification).toBe("internal");
    expect(context.correlationId).toBe("corr-rpt");

    const adapter = createReportingSearchAdapterForTest();
    expect(
      adapter.publisher.validate(context, {
        entityType: "report_type",
        entity: { id: "rtype_x", name: "ops" },
      }).ok,
    ).toBe(true);
  });
});

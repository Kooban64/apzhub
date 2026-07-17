/**
 * APZSEARCH-014 deep coverage — hooks, throwing sink, validator edges, definition mapping.
 */
import { describe, expect, it } from "vitest";
import type {
  ReportGenerationMetadata,
  ReportTemplate,
} from "@apzhub/reporting-contracts";
import {
  createSearchIntegration,
  InMemorySearchPublicationSink,
} from "@apzhub/search-integration";

import {
  ReportingSearchPublisher,
  createReportingSearchAdapter,
  createReportingSearchAdapterForTest,
  createReportingSearchPublisherForTest,
  createReportingSearchPublicationContext,
} from "./index";

function ctx(overrides?: { permissions?: readonly string[] }) {
  return createReportingSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-deep",
      permissions: overrides?.permissions ?? ["reporting.read"],
      organisationId: "org-a",
    },
  });
}

const template: ReportTemplate = {
  id: "tpl_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reportType: "portfolio",
  name: "Portfolio",
  description: "Portfolio template",
  version: "2.0.0",
  revision: 2,
  title: "Portfolio Report",
  sections: [
    {
      id: "s1",
      title: "S",
      blocks: [{ kind: "heading", level: 1, text: "H" }],
    },
  ],
  builtin: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const generation: ReportGenerationMetadata = {
  id: "gen_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  organisationId: "org-a",
  requestId: "req-deep",
  templateId: template.id,
  reportType: "portfolio",
  outputFormat: "html",
  parametersJson: "{}",
  generatedAt: "2026-01-04T00:00:00.000Z",
  generatedBy: "user-1",
  version: "2.0.0",
  revision: 2,
  checksumSha256: "ab".repeat(32),
  byteLength: 512,
  preview: true,
  createdAt: "2026-01-04T00:00:00.000Z",
  updatedAt: "2026-01-04T00:00:00.000Z",
};

describe("APZSEARCH-014 deep coverage", () => {
  it("exercises validator edge codes and definition/template mapping", () => {
    const adapter = createReportingSearchAdapterForTest();
    const context = ctx();

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "",
        entityType: "report_template",
        title: "",
        classification: undefined,
        metadata: {
          reportType: "x",
          version: "1",
          meiliUid: "x",
          parametersJson: "bad",
          checksumSha256: "aa".repeat(32),
        },
      }).issues.map((i) => i.code),
    ).toEqual(
      expect.arrayContaining([
        "required",
        "provider_leakage",
        "content_leakage",
      ]),
    );

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "parametersJson_leak",
        entityType: "unknown",
        title: "T",
        classification: "internal",
        permissions: ["x"],
        metadata: {},
      }).issues.some(
        (i) => i.code === "unsupported" || i.code === "content_leakage",
      ),
    ).toBe(true);

    expect(
      adapter.validator.validateDraft(
        {
          ...context,
          tenantId: "",
          permissions: null as unknown as readonly string[],
        },
        {
          entityId: "x",
          entityType: "report_type",
          title: "T",
          classification: "internal",
          metadata: {},
        },
      ).issues.map((i) => i.field),
    ).toEqual(expect.arrayContaining(["tenantId", "permissions"]));

    const fromTemplate = adapter.mapper.mapReportDefinition(
      context,
      template,
      { tenantId: "tenant-a" },
    );
    expect(fromTemplate.entityType).toBe("report_definition");
    expect(fromTemplate.metadata?.templateId).toBe(template.id);
    expect(JSON.stringify(fromTemplate)).not.toMatch(/heading/);

    expect(() =>
      adapter.mapper.mapReportCategory(context, { id: "cat_empty" }),
    ).toThrow(/title/);

    expect(() =>
      adapter.mapper.mapPlaceholderCatalogue(context, { id: "ph_empty" }),
    ).toThrow(/title/);

    expect(() =>
      adapter.mapper.mapReportDefinition(context, { id: "def_empty" }),
    ).toThrow(/title/);

    expect(() =>
      adapter.mapper.mapReportCategory(context, {
        id: "cat_x",
        name: "X",
        tenantId: "other",
      }),
    ).toThrow(/tenant mismatch/);
  });

  it("covers hooks, preview/diagnostics, and throwing publisher paths", () => {
    const adapter = createReportingSearchAdapterForTest();
    const context = ctx();

    expect(
      adapter.hooks.onReportTemplateUpserted(context, template, {
        tenantId: "tenant-a",
      }).operation,
    ).toBe("publish");
    expect(
      adapter.hooks.onReportTemplateUpserted(
        context,
        { ...template, title: "Updated" },
        { tenantId: "tenant-a" },
      ).operation,
    ).toBe("update");

    expect(
      adapter.hooks.onReportCategoryUpserted(context, {
        id: "cat_h",
        name: "Cat",
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onReportDefinitionUpserted(context, {
        id: "def_h",
        title: "Def",
        templateId: template.id,
        reportType: "portfolio",
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onReportTypeUpserted(context, {
        id: "rtype_h",
        name: "portfolio",
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onReportProfileUpserted(context, {
        id: "prof_h",
        name: "Profile",
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onPlaceholderCatalogueUpserted(context, {
        id: "ph_h",
        title: "Placeholders",
        placeholders: ["a"],
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onReportConsumerUpserted(context, {
        id: "cons_h",
        name: "Consumer",
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onReportUsageSummaryUpserted(context, {
        id: "usage_h",
        title: "Usage",
        generationCount: 3,
      }).ok,
    ).toBe(true);

    const recorded = adapter.hooks.onReportGenerationRecorded(
      context,
      generation,
    );
    expect(recorded.ok).toBe(true);
    expect(adapter.integration.sink.get(generation.id)?.entityType).toBe(
      "report_generation_metadata",
    );
    expect(
      adapter.integration.sink.get(`output:${generation.id}`)?.entityType,
    ).toBe("report_output_metadata");

    expect(
      adapter.hooks.onReportGenerationArchived(context, {
        ...generation,
        archivedAt: "2026-02-01T00:00:00.000Z",
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onReportOutputMetadataPublished(context, generation).ok,
    ).toBe(true);

    expect(adapter.hooks.onReportTemplateRemoved(context, template.id).ok).toBe(
      true,
    );
    expect(adapter.hooks.onReportCategoryRemoved(context, "cat_h").ok).toBe(
      true,
    );
    expect(adapter.hooks.onReportDefinitionRemoved(context, "def_h").ok).toBe(
      true,
    );
    expect(adapter.hooks.onReportTypeRemoved(context, "rtype_h").ok).toBe(true);
    expect(adapter.hooks.onReportProfileRemoved(context, "prof_h").ok).toBe(
      true,
    );
    expect(adapter.hooks.onReportConsumerRemoved(context, "cons_h").ok).toBe(
      true,
    );
    expect(
      adapter.hooks.onReportGenerationRemoved(context, generation.id).ok,
    ).toBe(true);

    const diag = adapter.publisher.diagnostics(context);
    expect(diag.productId).toBe("reporting");
    expect(diag.supportedEntityTypes).toContain("report_template");
    expect(adapter.publisher.getLogger().recent().length).toBeGreaterThan(0);
    expect(adapter.publisher.getMetrics().snapshot().published).toBeGreaterThan(
      0,
    );
    expect(adapter.publisher.getMapper()).toBe(adapter.mapper);
    expect(adapter.publisher.getValidator()).toBe(adapter.validator);
    expect(adapter.publisher.getLifecycle()).toBe(adapter.lifecycle);

    // Empty permissions → validation failure path
    const noPerm = createReportingSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-noperm",
        permissions: [],
      },
    });
    const rejected = adapter.publisher.publish(noPerm, {
      entityType: "report_type",
      entity: { id: "rtype_noperm", name: "x" },
    });
    expect(rejected.ok).toBe(false);

    // Throwing integration publisher
    const throwing = {
      validate: () => {
        throw new Error("boom validate");
      },
      preview: () => {
        throw new Error("boom preview");
      },
      publish: () => {
        throw new Error("boom publish");
      },
      update: () => {
        throw new Error("boom update");
      },
      remove: () => {
        throw new Error("boom remove");
      },
      lifecycle: () => {
        throw new Error("boom lifecycle");
      },
      getSink: () => new InMemorySearchPublicationSink(),
    };
    const pub = new ReportingSearchPublisher({
      integrationPublisher: throwing as never,
    });
    expect(
      pub.validate(context, {
        entityType: "report_type",
        entity: { id: "t1", name: "T" },
      }).ok,
    ).toBe(false);
    expect(
      pub.preview(context, {
        entityType: "report_type",
        entity: { id: "t2", name: "T" },
      }).ok,
    ).toBe(false);
    expect(
      pub.publish(context, {
        entityType: "report_type",
        entity: { id: "t3", name: "T" },
      }).ok,
    ).toBe(false);
    expect(pub.remove(context, "report_type", "t3").ok).toBe(false);
    expect(pub.lifecycle(context, "t3", "removed").ok).toBe(false);

    // Lifecycle success path after publish
    const happy = createReportingSearchAdapterForTest();
    happy.publisher.publish(context, {
      entityType: "report_type",
      entity: { id: "life_1", name: "Life" },
    });
    expect(happy.publisher.lifecycle(context, "life_1", "archived").ok).toBe(
      true,
    );

    // Production factory branches
    const integration = createSearchIntegration();
    expect(
      createReportingSearchAdapter({
        integrationPublisher: integration.publisher,
        integration,
      }).publisher,
    ).toBeDefined();
    expect(
      createReportingSearchAdapter({
        integrationPublisher: integration.publisher,
        sink: integration.sink,
      }).publisher,
    ).toBeDefined();
    expect(
      createReportingSearchAdapter({ integration }).publisher,
    ).toBeDefined();
    expect(
      createReportingSearchAdapter({
        searchIntegrationOptions: { sink: integration.sink },
      }).publisher,
    ).toBeDefined();
    expect(createReportingSearchPublisherForTest().getIntegrationPublisher()).toBeDefined();

    // Mapping remaining thin types with optional fields
    const mapper = happy.mapper;
    expect(
      mapper.mapReportProfile(context, {
        id: "p1",
        name: "P",
        description: "d",
        createdAt: "2026-01-01T00:00:00.000Z",
      }).entityType,
    ).toBe("report_profile");
    expect(
      mapper.mapReportConsumer(context, {
        id: "c1",
        name: "C",
        description: "d",
      }).metadata?.consumerId,
    ).toBe("c1");
    expect(
      mapper.mapReportUsageSummary(context, {
        id: "u1",
        title: "U",
        generationCount: 1,
        lastGeneratedAt: "2026-01-01T00:00:00.000Z",
      }).metadata?.generationCount,
    ).toBe("1");
    expect(
      mapper
        .mapReportGeneration(context, generation, "report_generation", {
          title: "Custom title",
        })
        .title,
    ).toBe("Custom title");

    // Context creation without permissions throws
    expect(() =>
      createReportingSearchPublicationContext({
        reportingContext: {
          tenantId: "t",
          userId: "u",
        },
      }),
    ).toThrow(/permissions/);

    expect(() =>
      createReportingSearchPublicationContext({}),
    ).toThrow(/requires reportingContext or serviceContext/);
  });
});

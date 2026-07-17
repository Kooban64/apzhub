/**
 * APZSEARCH-014 residual coverage — classification, lifecycle, safe fields, errors.
 */
import { describe, expect, it } from "vitest";
import type { ReportTemplate } from "@apzhub/reporting-contracts";

import {
  DiagnosticsStore,
  ReportingSearchErrorTranslator,
  ReportingSearchLifecycle,
  assertPlatformEntityId,
  createReportingSearchAdapterForTest,
  createReportingSearchPublicationContext,
  filterSafeCustomMetadata,
  isForbiddenMetadataKey,
  isForbiddenMetadataValue,
  isSafeMetadataKey,
  resolveReportingClassification,
  scanMetadataForReportingLeakage,
  toSearchIntegrationContext,
} from "./index";

function ctx() {
  return createReportingSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-cov",
      permissions: ["reporting.read"],
      organisationId: "org-a",
      requestId: "req-1",
      locale: "en",
    },
    publicationReason: "coverage",
    lifecycleOperation: "validated",
  });
}

const template: ReportTemplate = {
  id: "tpl_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  reportType: "ops",
  name: "Ops",
  version: "1",
  revision: 1,
  title: "Ops Report",
  sections: [],
  builtin: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-014 residual coverage", () => {
  it("covers context helpers, assert ids, lifecycle suggest, errors", () => {
    const context = ctx();
    expect(toSearchIntegrationContext(context).productId).toBe("reporting");
    expect(context.publicationReason).toBe("coverage");
    expect(context.lifecycleOperation).toBe("validated");
    expect(() => assertPlatformEntityId("")).toThrow(/required/);
    expect(() => assertPlatformEntityId("checksumHex_x")).toThrow(/forbidden/);

    const life = new ReportingSearchLifecycle();
    expect(life.suggestFromReportingStatus("draft")).toBe("draft");
    expect(life.suggestFromReportingStatus("preview")).toBe("draft");
    expect(life.suggestFromReportingStatus("active")).toBe("validated");
    expect(life.suggestFromReportingStatus("published")).toBe("validated");
    expect(life.suggestFromReportingStatus("archived")).toBe("archived");
    expect(life.suggestFromReportingStatus("deleted")).toBe("removed");
    expect(life.suggestFromReportingStatus(undefined)).toBe("validated");
    expect(
      life.suggestFromDomainStatus("report_generation_metadata", "preview"),
    ).toBe("draft");
    expect(
      life.suggestFromDomainStatus("report_generation_metadata", "archived"),
    ).toBe("archived");
    expect(
      life.suggestFromDomainStatus("report_output_metadata", "deleted"),
    ).toBe("removed");
    expect(life.suggestFromDomainStatus("report_template", "draft")).toBe(
      "draft",
    );
    expect(life.canTransition("published", "removed")).toBe(true);
    expect(() => life.assertTransition("archived", "published")).toThrow();

    const errors = new ReportingSearchErrorTranslator();
    expect(
      errors.translate(new Error("parametersJson forbidden")).classification,
    ).toBe("validation_failed");
    expect(
      errors.translate(new Error("classification required")).classification,
    ).toBe("validation_failed");
    expect(
      errors.translate(new Error("tenant mismatch")).classification,
    ).toBe("tenant_mismatch");
    expect(errors.translate(new Error("boom")).message).toContain("boom");

    const store = new DiagnosticsStore();
    store.touch("validate", "corr");
    expect(
      store.build(
        {
          byEntityType: {},
          published: 0,
          updated: 0,
          removed: 0,
          validated: 0,
          previewed: 0,
          validationFailures: 0,
          publicationFailures: 0,
        },
        ["report_template"],
      ).productId,
    ).toBe("reporting");
  });

  it("covers classification never-downgrade and fail-closed default", () => {
    const context = createReportingSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-class",
        permissions: ["reporting.read"],
      },
      classification: "restricted",
    });
    expect(resolveReportingClassification(context)).toBe("restricted");
    expect(
      resolveReportingClassification(context, { classification: "public" }),
    ).toBe("restricted");
    expect(
      resolveReportingClassification(context, {
        classification: "public",
        neverDowngrade: false,
      }),
    ).toBe("public");
    expect(
      resolveReportingClassification(context, {
        classification: "confidential",
      }),
    ).toBe("restricted");

    const defaultCtx = createReportingSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-default",
        permissions: ["reporting.read"],
      },
    });
    expect(defaultCtx.classification).toBe("confidential");

    const adapter = createReportingSearchAdapterForTest();
    const draft = adapter.mapper.mapReportTemplate(context, template, {
      tenantId: "tenant-a",
      classification: "internal",
    });
    expect(draft.classification).toBe("restricted");
  });

  it("covers safe fields allowlist and rejection", () => {
    expect(isSafeMetadataKey("byteLength")).toBe(true);
    expect(isSafeMetadataKey("parametersJson")).toBe(false);
    expect(isForbiddenMetadataKey("parametersJson")).toBe(true);
    expect(isForbiddenMetadataKey("renderedBody")).toBe(true);
    expect(isForbiddenMetadataKey("byteLength")).toBe(false);
    expect(isForbiddenMetadataValue("s3://bucket/obj")).toBe(true);
    expect(isForbiddenMetadataValue("deadbeefdeadbeefdeadbeefdeadbeef")).toBe(
      true,
    );
    expect(isForbiddenMetadataValue("pdf")).toBe(false);

    const leaks = scanMetadataForReportingLeakage({
      parametersJson: "x",
      outputFormat: "pdf",
      mystery: "<html>secret</html>",
    });
    expect(leaks.some((i) => i.code === "content_leakage")).toBe(true);

    expect(
      filterSafeCustomMetadata({
        byteLength: "10",
        parametersJson: "bad",
        mystery: "value",
      }),
    ).toEqual({ byteLength: "10" });

    const adapter = createReportingSearchAdapterForTest();
    const validated = adapter.publisher.validate(ctx(), {
      entityType: "report_template",
      entity: template,
      extras: { tenantId: "tenant-a" },
    });
    expect(validated.ok).toBe(true);
  });
});

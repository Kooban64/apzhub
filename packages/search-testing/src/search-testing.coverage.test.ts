/**
 * APZSEARCH-013 residual coverage — classification, lifecycle, safe fields, errors.
 */
import { describe, expect, it } from "vitest";
import {
  asTestCaseId,
  type TestCase,
} from "@apzhub/testing-contracts";

import {
  DiagnosticsStore,
  TestingSearchErrorTranslator,
  TestingSearchLifecycle,
  assertPlatformEntityId,
  createTestingSearchAdapterForTest,
  createTestingSearchPublicationContext,
  filterSafeCustomMetadata,
  isForbiddenMetadataKey,
  isForbiddenMetadataValue,
  isSafeMetadataKey,
  mapTestingSeverityToClassification,
  mapTestingStatusToClassification,
  neverDowngradeClassification,
  resolveTestingClassification,
  scanMetadataForStorageLeakage,
  toSearchIntegrationContext,
} from "./index";

function ctx() {
  return createTestingSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-cov",
      permissions: ["testing.read"],
      organisationId: "org-a",
      requestId: "req-1",
      locale: "en",
    },
    publicationReason: "coverage",
    lifecycleOperation: "validated",
  });
}

function ctxNoPermsField() {
  return createTestingSearchPublicationContext({
    // Intentional incomplete context to exercise permissions ?? [] fallback.
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-noperm",
    } as import("@apzhub/platform-service-contracts").ServiceRequestContext,
    organisationId: "org-from-extras",
    classification: "restricted",
  });
}

const baseCase: TestCase = {
  id: asTestCaseId("tca_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  tenantId: "tenant-a",
  key: "TC-C",
  title: "Coverage case",
  status: "draft",
  priority: "medium",
  suiteIds: [],
  requirementIds: [],
  steps: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-013 residual coverage", () => {
  it("covers context helpers, assert ids, lifecycle suggest, errors", () => {
    const context = ctx();
    expect(toSearchIntegrationContext(context).productId).toBe("testing");
    expect(context.publicationReason).toBe("coverage");
    expect(context.lifecycleOperation).toBe("validated");
    expect(context.classification).toBe("confidential");
    const sparse = ctxNoPermsField();
    expect(sparse.permissions).toEqual([]);
    expect(sparse.organisationId).toBe("org-from-extras");
    expect(sparse.classification).toBe("restricted");
    expect(() => assertPlatformEntityId("")).toThrow(/required/);
    expect(() => assertPlatformEntityId("s3://bucket/x")).toThrow(/storage/);

    const life = new TestingSearchLifecycle();
    expect(life.suggestFromDomainStatus("draft")).toBe("draft");
    expect(life.suggestFromDomainStatus("pending")).toBe("draft");
    expect(life.suggestFromDomainStatus("active")).toBe("validated");
    expect(life.suggestFromDomainStatus("approved")).toBe("validated");
    expect(life.suggestFromDomainStatus("certified")).toBe("validated");
    expect(life.suggestFromDomainStatus("archived")).toBe("archived");
    expect(life.suggestFromDomainStatus("deleted")).toBe("removed");
    expect(life.suggestFromDomainStatus("rejected")).toBe("removed");
    expect(life.suggestFromDomainStatus(undefined)).toBe("validated");
    expect(life.suggestFromEntityStatus("historical_snapshot", "active")).toBe(
      "validated",
    );
    expect(life.suggestFromEntityStatus("historical_snapshot", "deleted")).toBe(
      "removed",
    );
    expect(life.suggestFromEntityStatus("test_case", "draft")).toBe("draft");
    expect(life.canTransition("published", "removed")).toBe(true);
    expect(() => life.assertTransition("archived", "published")).toThrow();

    const errors = new TestingSearchErrorTranslator();
    expect(
      errors.translate(new Error("storageRef forbidden")).classification,
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
        ["test_case"],
      ).productId,
    ).toBe("testing");
  });

  it("covers classification mapping matrix and never-downgrade", () => {
    expect(mapTestingSeverityToClassification("critical")).toBe("restricted");
    expect(mapTestingSeverityToClassification("blocker")).toBe("restricted");
    expect(mapTestingSeverityToClassification("high")).toBe("confidential");
    expect(mapTestingSeverityToClassification("major")).toBe("confidential");
    expect(mapTestingSeverityToClassification("medium")).toBe("internal");
    expect(mapTestingSeverityToClassification("low")).toBe("internal");
    expect(mapTestingSeverityToClassification("unknown")).toBe("confidential");
    expect(mapTestingSeverityToClassification("normal")).toBe("internal");
    expect(mapTestingSeverityToClassification("minor")).toBe("internal");
    expect(mapTestingSeverityToClassification("trivial")).toBe("internal");
    expect(mapTestingSeverityToClassification(undefined)).toBeUndefined();

    expect(mapTestingStatusToClassification("certified")).toBe("confidential");
    expect(mapTestingStatusToClassification("restricted")).toBe("confidential");
    expect(mapTestingStatusToClassification("confidential")).toBe(
      "confidential",
    );
    expect(mapTestingStatusToClassification("approved")).toBe("internal");
    expect(mapTestingStatusToClassification("released")).toBe("internal");
    expect(mapTestingStatusToClassification("passed")).toBe("internal");
    expect(mapTestingStatusToClassification("active")).toBe("internal");
    expect(mapTestingStatusToClassification("draft")).toBe("internal");
    expect(mapTestingStatusToClassification("pending")).toBe("internal");
    expect(mapTestingStatusToClassification("public")).toBe("public");
    expect(mapTestingStatusToClassification("weird")).toBeUndefined();
    expect(mapTestingStatusToClassification(undefined)).toBeUndefined();

    expect(neverDowngradeClassification("public", "confidential")).toBe(
      "confidential",
    );
    expect(neverDowngradeClassification("restricted", "internal")).toBe(
      "restricted",
    );
    expect(neverDowngradeClassification("internal")).toBe("internal");

    const context = ctx();
    expect(
      resolveTestingClassification(context, { status: "public" }),
    ).toBe("confidential");
    expect(
      resolveTestingClassification(context, {
        explicit: "restricted",
        severity: "low",
      }),
    ).toBe("restricted");

    const adapter = createTestingSearchAdapterForTest();
    const draft = adapter.mapper.mapTestCase(context, {
      ...baseCase,
      riskLevel: "critical",
    });
    expect(draft.classification).toBe("restricted");
  });

  it("covers safe fields allowlist and rejection", () => {
    expect(isSafeMetadataKey("status")).toBe(true);
    expect(isSafeMetadataKey("storageRef")).toBe(false);
    expect(isForbiddenMetadataKey("storageRef")).toBe(true);
    expect(isForbiddenMetadataKey("payloadFingerprint")).toBe(true);
    expect(isForbiddenMetadataKey("status")).toBe(false);
    expect(isForbiddenMetadataValue("s3://bucket/obj")).toBe(true);
    expect(isForbiddenMetadataValue("deadbeefdeadbeefdeadbeefdeadbeef")).toBe(
      true,
    );
    expect(isForbiddenMetadataValue("application/pdf")).toBe(false);

    const leaks = scanMetadataForStorageLeakage({
      storageRef: "x",
      mimeType: "s3://bucket/x",
      ok: "yes",
    });
    expect(leaks.some((i) => i.code === "storage_leakage")).toBe(true);

    expect(
      filterSafeCustomMetadata({
        status: "active",
        storageRef: "bad",
        mystery: "value",
      }),
    ).toEqual({ status: "active" });

    const adapter = createTestingSearchAdapterForTest();
    const validated = adapter.publisher.validate(ctx(), {
      entityType: "test_case",
      entity: baseCase,
    });
    expect(validated.ok).toBe(true);

    expect(
      adapter.publisher.publish(ctx(), {
        entityType: "test_case",
        entity: baseCase,
      }).ok,
    ).toBe(true);

    const diag = adapter.publisher.diagnostics(ctx());
    expect(diag.productId).toBe("testing");
    expect(diag.adapterVersion).toBe("0.1.1");
    expect(adapter.publisher.statistics(ctx()).validated).toBeGreaterThan(0);
    expect(adapter.publisher.getLogger().recent().length).toBeGreaterThan(0);
    expect(adapter.publisher.getMapper()).toBeDefined();
    expect(adapter.publisher.getValidator()).toBeDefined();
    expect(adapter.publisher.getLifecycle()).toBeDefined();
    expect(adapter.publisher.getMetrics()).toBeDefined();
  });
});

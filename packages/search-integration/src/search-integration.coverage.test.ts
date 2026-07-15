/**
 * APZSEARCH-009 residual coverage for Cross-Product Search Integration Framework.
 */
import { describe, expect, it } from "vitest";

import {
  SearchEntityLifecycle,
  SearchEntityMapper,
  SearchEntityPublisher,
  SearchEntityValidator,
  SearchIntegrationPublisher,
  SearchPublicationErrorTranslator,
  SearchPublicationLogger,
  asCanonicalSearchEntityId,
  createSearchIntegration,
  createSearchIntegrationContext,
  isSearchEntityLifecycleState,
  toSearchRequestContext,
} from "./index";
import { SearchDomainError } from "@apzhub/search-contracts";

function ctx(
  productId: "projects" | "support" | "documents" = "projects",
  overrides?: { organisationId?: string },
) {
  return createSearchIntegrationContext({
    productId,
    searchContext: {
      correlationId: "corr-cov",
      requestId: "req-1",
      actorUserId: "user-1",
      tenantId: "tenant-a",
      organisationId: overrides?.organisationId ?? "org-a",
      workspaceId: "ws-1",
      locale: "en",
      permissions: ["search.query.execute"],
    },
  });
}

describe("APZSEARCH-009 residual coverage", () => {
  it("covers context helpers and branded ids", () => {
    const context = ctx();
    expect(toSearchRequestContext(context).workspaceId).toBe("ws-1");
    expect(asCanonicalSearchEntityId("e1")).toBe("e1");
    expect(() => asCanonicalSearchEntityId("")).toThrow(/invalid/);
    expect(isSearchEntityLifecycleState("published")).toBe(true);
    expect(isSearchEntityLifecycleState("nope")).toBe(false);
  });

  it("covers validator assertValid and organisation mismatch", () => {
    const validator = new SearchEntityValidator();
    const context = ctx("documents");
    expect(() =>
      validator.assertValid(context, {
        id: "",
        entityType: "document",
        productId: "documents",
        tenantId: "tenant-a",
        title: "X",
      }),
    ).toThrow(SearchDomainError);

    const orgMismatch = validator.validate(context, {
      id: "d1",
      entityType: "document",
      productId: "documents",
      tenantId: "tenant-a",
      organisationId: "other-org",
      title: "X",
      classification: "not-a-class" as never,
      lifecycleState: "not-a-state" as never,
      metadata: { ok: "1", meiliUid: "x" },
    });
    expect(orgMismatch.valid).toBe(false);
    expect(
      orgMismatch.issues.some((i) => i.code === "organisation_mismatch"),
    ).toBe(true);
    expect(orgMismatch.issues.some((i) => i.field === "classification")).toBe(
      true,
    );
    expect(orgMismatch.issues.some((i) => i.field === "lifecycleState")).toBe(
      true,
    );

    const productMismatch = validator.validate(context, {
      id: "d2",
      entityType: "document",
      productId: "projects",
      tenantId: "tenant-a",
      title: "X",
    });
    expect(productMismatch.issues.some((i) => i.code === "product_mismatch")).toBe(
      true,
    );
  });

  it("covers publisher edge paths and facade fallbacks", () => {
    const fw = createSearchIntegration();
    const publisher = fw.publisher;
    const context = ctx();

    const updateMissing = publisher.update(context, {
      entityId: "missing",
      entityType: "project",
      title: "Gone",
    });
    expect(updateMissing.ok).toBe(false);

    const removeMissing = publisher.remove(context, "missing");
    expect(removeMissing.ok).toBe(false);

    const published = publisher.publish(context, {
      id: "prj_cov",
      entityType: "project",
      productId: "projects",
      tenantId: "tenant-a",
      title: "Cov",
      lifecycleState: "draft",
    });
    expect(published.ok).toBe(true);

    const lifeFail = publisher.lifecycle(context, "prj_cov", "draft");
    expect(lifeFail.ok).toBe(false);

    const lifeMissing = publisher.lifecycle(context, "nope", "archived");
    expect(lifeMissing.ok).toBe(false);

    const wrongTenantLife = publisher.lifecycle(
      createSearchIntegrationContext({
        productId: "projects",
        searchContext: {
          correlationId: "c",
          actorUserId: "u",
          tenantId: "other",
          permissions: [],
        },
      }),
      "prj_cov",
      "archived",
    );
    expect(wrongTenantLife.ok).toBe(false);

    const previewFail = publisher.preview(context, {
      entityId: "",
      entityType: "project",
      title: "x",
    });
    expect(previewFail.ok).toBe(false);

    const entityPublisher = new SearchEntityPublisher({
      sink: fw.sink,
      validator: fw.validator,
      mapper: fw.mapper,
      lifecycle: fw.lifecycle,
      metrics: fw.metrics,
      logger: fw.logger,
      errors: fw.errors,
    });
    const facaded = new SearchIntegrationPublisher({ entityPublisher });
    expect(facaded.getEntityPublisher()).toBe(entityPublisher);
    expect(facaded.diagnostics(context).sinkKind).toBe("memory");
    expect(facaded.statistics(context).activeEntities).toBeGreaterThan(0);

    // Force diagnostics / statistics JSON fallback paths via monkeypatch
    const broken = new SearchIntegrationPublisher({
      entityPublisher: {
        ...entityPublisher,
        diagnostics: () => ({
          operation: "diagnostics",
          ok: true,
          correlationId: "x",
          durationMs: 0,
          acceptedAt: new Date().toISOString(),
          message: "{not-json",
        }),
        statistics: () => ({
          operation: "statistics",
          ok: true,
          correlationId: "x",
          durationMs: 0,
          acceptedAt: new Date().toISOString(),
          message: "{not-json",
        }),
        getSink: () => fw.sink,
        getMetrics: () => fw.metrics,
      } as never,
    });
    expect(broken.diagnostics(context).frameworkVersion).toBe("0.1.0");
    expect(broken.statistics(context).failures).toBeGreaterThanOrEqual(0);
  });

  it("covers lifecycle assert, logger sink, metrics defaults, error paths", () => {
    const lc = new SearchEntityLifecycle();
    expect(() => lc.assertTransition("archived", "published")).toThrow(/Invalid/);

    const written: string[] = [];
    const logger = new SearchPublicationLogger({
      write: (e) => written.push(e.message),
    });
    logger.log("debug", "hello");
    expect(logger.recent(1)[0]?.message).toBe("hello");
    expect(written).toEqual(["hello"]);

    const translator = new SearchPublicationErrorTranslator();
    expect(
      translator.translate(new SearchDomainError("not_found", "missing token=abc"))
        .classification,
    ).toBe("not_found");
    expect(translator.translate(new Error("organisation denied")).classification).toBe(
      "organisation_mismatch",
    );
    expect(translator.translate(new Error("tenant denied")).classification).toBe(
      "tenant_mismatch",
    );
    expect(translator.translate(new Error("lifecycle bad")).classification).toBe(
      "conflict",
    );
    expect(translator.translate(new Error("item not found")).classification).toBe(
      "not_found",
    );
    expect(translator.translate("weird").classification).toBe("validation_failed");
    expect(
      translator.translate(
        new SearchDomainError("invalid_input", "x", { api_key: "secret", note: "ok" }),
      ).details?.["api_key"],
    ).toBe("[redacted]");

    const { sink } = createSearchIntegration({ sinkKind: "noop" });
    expect(sink.get("x")).toBeNull();
    expect(sink.list()).toEqual([]);
    expect(sink.remove("x")).toBeNull();
    expect(sink.setLifecycle("x", "archived")).toBeNull();

    const mem = createSearchIntegration().sink;
    expect(mem.list({ productId: "projects" })).toEqual([]);
    const mapper = new SearchEntityMapper();
    const mapped = mapper.map(ctx(), {
      entityId: "p1",
      entityType: "project",
      title: "T",
      keywords: ["a"],
      sourceId: "custom_src",
    });
    expect(mapper.toSearchMetadata(mapped).sourceId).toBe("custom_src");
  });
});

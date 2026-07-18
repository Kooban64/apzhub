/**
 * APZSEARCH-009 — Cross-Product Search Integration Framework tests.
 */
import { describe, expect, it } from "vitest";

import {
  CROSS_PRODUCT_SEARCH_PRODUCTS,
  DECLARED_PRODUCT_SEARCH_PUBLICATION_CONTRACTS,
  DocumentsSearchPublicationContract,
  ProjectsSearchPublicationContract,
  SEARCH_INTEGRATION_VERSION,
  SearchEntityLifecycle,
  SearchPublicationErrorTranslator,
  SupportSearchPublicationContract,
  createSearchIntegration,
  createSearchIntegrationContext,
  getProductSearchPublicationContract,
  isCrossProductSearchProductId,
} from "./index";

function ctx(productId: "projects" | "support" | "documents" = "projects") {
  return createSearchIntegrationContext({
    productId,
    searchContext: {
      correlationId: "corr-009",
      actorUserId: "user-1",
      tenantId: "tenant-a",
      organisationId: "org-a",
      permissions: ["search.query.execute"],
    },
  });
}

describe("APZSEARCH-009 search-integration", () => {
  it("ships version 0.2.0", () => {
    expect(SEARCH_INTEGRATION_VERSION).toBe("0.2.0");
  });

  it("declares product contracts without adapters", () => {
    expect(CROSS_PRODUCT_SEARCH_PRODUCTS).toEqual([
      "projects",
      "support",
      "documents",
      "testing",
      "reporting",
    ]);
    expect(isCrossProductSearchProductId("projects")).toBe(true);
    expect(isCrossProductSearchProductId("plane")).toBe(false);
    expect(ProjectsSearchPublicationContract.toSearchEntityDraft).toBeUndefined();
    expect(SupportSearchPublicationContract.describeSources).toBeUndefined();
    expect(DocumentsSearchPublicationContract.supportedEntityTypes).toContain(
      "document",
    );
    expect(DECLARED_PRODUCT_SEARCH_PUBLICATION_CONTRACTS).toHaveLength(5);
    expect(getProductSearchPublicationContract("testing")?.label).toBe("APZ TCMS");
  });

  it("validates, previews, publishes, updates, and removes canonical entities", () => {
    const { publisher } = createSearchIntegration();
    const context = ctx("projects");

    const invalid = publisher.validate(context, {
      entityId: "",
      entityType: "project",
      title: "Alpha",
    });
    expect(invalid.ok).toBe(false);
    expect(invalid.issues?.some((i) => i.field === "id")).toBe(true);

    const preview = publisher.preview(context, {
      entityId: "prj_1",
      entityType: "project",
      title: "Alpha",
      summary: "First project",
      metadata: { status: "active" },
      classification: "internal",
    });
    expect(preview.ok).toBe(true);
    expect(preview.previewMetadata?.productId).toBe("projects");
    expect(preview.previewMetadata?.tenantId).toBe("tenant-a");
    expect(publisher.getSink().count()).toBe(0);

    const published = publisher.publish(context, {
      entityId: "prj_1",
      entityType: "project",
      title: "Alpha",
      summary: "First project",
      metadata: { status: "active" },
    });
    expect(published.ok).toBe(true);
    expect(published.lifecycleState).toBe("published");
    expect(publisher.getSink().count()).toBe(1);

    const duplicate = publisher.publish(context, {
      entityId: "prj_1",
      entityType: "project",
      title: "Alpha",
    });
    expect(duplicate.ok).toBe(false);

    const updated = publisher.update(context, {
      entityId: "prj_1",
      entityType: "project",
      title: "Alpha 2",
      summary: "Renamed",
    });
    expect(updated.ok).toBe(true);
    expect(updated.lifecycleState).toBe("updated");
    expect(updated.entity?.version).toBe("2");
    expect(updated.entity?.title).toBe("Alpha 2");

    const removed = publisher.remove(context, "prj_1");
    expect(removed.ok).toBe(true);
    expect(removed.lifecycleState).toBe("removed");
    expect(publisher.getSink().count()).toBe(0);
  });

  it("enforces tenant / product isolation and rejects provider metadata keys", () => {
    const { publisher } = createSearchIntegration();
    const context = ctx("support");

    const leak = publisher.validate(context, {
      entityId: "tkt_1",
      entityType: "ticket",
      title: "Outage",
      metadata: { meilisearchIndex: "bad" },
    });
    expect(leak.ok).toBe(false);
    expect(leak.issues?.some((i) => i.code === "provider_leakage")).toBe(true);

    const wrongTenant = publisher.validate(
      createSearchIntegrationContext({
        productId: "support",
        searchContext: {
          correlationId: "c2",
          actorUserId: "u",
          tenantId: "tenant-a",
          permissions: [],
        },
      }),
      {
        id: "tkt_2",
        entityType: "ticket",
        productId: "support",
        tenantId: "other-tenant",
        title: "X",
      },
    );
    expect(wrongTenant.ok).toBe(false);
    expect(wrongTenant.issues?.some((i) => i.code === "tenant_mismatch")).toBe(true);

    publisher.publish(context, {
      entityId: "tkt_1",
      entityType: "ticket",
      title: "Outage",
    });
    const crossProduct = publisher.remove(ctx("documents"), "tkt_1");
    expect(crossProduct.ok).toBe(false);
  });

  it("supports lifecycle, diagnostics, and statistics", () => {
    const fw = createSearchIntegration();
    const context = ctx("documents");
    fw.publisher.publish(context, {
      entityId: "doc_1",
      entityType: "document",
      title: "Policy",
    });

    const life = fw.publisher.lifecycle(context, "doc_1", "archived", "retire");
    expect(life.ok).toBe(true);
    expect(life.lifecycleState).toBe("archived");

    const diag = fw.publisher.diagnostics(context);
    expect(diag.frameworkVersion).toBe("0.2.0");
    expect(diag.sinkKind).toBe("memory");
    expect(diag.entityCount).toBe(1);

    const stats = fw.publisher.statistics(context);
    expect(stats.published).toBeGreaterThanOrEqual(1);
    expect(stats.activeEntities).toBe(1);

    const lc = new SearchEntityLifecycle();
    expect(lc.canTransition("published", "removed")).toBe(true);
    expect(lc.canTransition("draft", "published")).toBe(true);
    expect(lc.canTransition("archived", "published")).toBe(false);
  });

  it("redacts secrets in error translation", () => {
    const translator = new SearchPublicationErrorTranslator();
    const err = translator.translate(new Error("failed with api_key=super-secret"));
    expect(err.message).toContain("[redacted]");
    expect(err.message).not.toContain("super-secret");
  });

  it("noop sink does not retain entities", () => {
    const { publisher } = createSearchIntegration({ sinkKind: "noop" });
    const context = ctx();
    const published = publisher.publish(context, {
      entityId: "prj_x",
      entityType: "project",
      title: "Temp",
    });
    expect(published.ok).toBe(true);
    expect(publisher.getSink().count()).toBe(0);
  });
});

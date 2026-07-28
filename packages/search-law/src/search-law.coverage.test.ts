/**
 * R12-SEARCH-02 residual coverage.
 */
import { describe, expect, it } from "vitest";
import type { Matter } from "@apzhub/legal-business-core";

import {
  DiagnosticsStore,
  LawSearchErrorTranslator,
  LawSearchLifecycle,
  assertPlatformEntityId,
  createLawSearchAdapter,
  createLawSearchPublicationContext,
  toSearchIntegrationContext,
} from "./index";

function ctx() {
  return createLawSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-cov",
      permissions: ["legal.matter.read"],
      organisationId: "org-a",
      requestId: "req-1",
      locale: "en",
    },
  });
}

const matter: Matter = {
  matterId: "m1111111-0001-4000-8000-000000000001",
  matterReference: "MAT-2026-00001",
  title: "Matter",
  clientId: "c2222222-0001-4000-8000-000000000002",
  matterTypeId: "mt1",
  matterStatus: "closed",
  practiceAreaId: "pa1",
  priority: "normal",
  openedAt: "2026-01-01T00:00:00.000Z",
  closedAt: "2026-02-01T00:00:00.000Z",
  leadAttorneyId: "att-1",
  teamMemberIds: [],
  tags: [],
  customFields: {},
};

describe("R12-SEARCH-02 residual coverage", () => {
  it("covers context helpers, assert ids, lifecycle suggest, errors", () => {
    const context = ctx();
    expect(toSearchIntegrationContext(context).productId).toBe("law");
    expect(context.classification).toBe("confidential");
    expect(() => assertPlatformEntityId("")).toThrow(/required/);
    expect(() => assertPlatformEntityId("a::b")).toThrow(/external engine/i);
    expect(() => assertPlatformEntityId("zammad_1")).toThrow(/external engine/i);

    const life = new LawSearchLifecycle();
    expect(life.suggestFromDomainStatus("law_matter", "archived")).toBe("archived");
    expect(life.suggestFromDomainStatus("law_matter", "prospect")).toBe("draft");
    expect(life.suggestFromDomainStatus("law_client", "active", true)).toBe("archived");
    expect(life.canTransition("draft", "validated")).toBe(true);

    const errors = new LawSearchErrorTranslator();
    expect(errors.translate(new Error("external engine leak")).classification).toBe(
      "validation_failed",
    );
    expect(errors.translate(new Error("tenant mismatch")).classification).toBe(
      "tenant_mismatch",
    );

    const store = new DiagnosticsStore();
    store.touch("preview", "corr", "law_matter");
    const diag = store.build(
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
      ["law_matter"],
    );
    expect(diag.productId).toBe("law");
  });

  it("covers publisher validate/update/remove paths and accessors", () => {
    const adapter = createLawSearchAdapter();
    const context = ctx();

    expect(
      adapter.publisher.validate(context, { entityType: "law_matter", entity: matter })
        .ok,
    ).toBe(true);
    expect(
      adapter.publisher.publish(context, { entityType: "law_matter", entity: matter })
        .ok,
    ).toBe(true);
    expect(
      adapter.publisher.update(context, {
        entityType: "law_matter",
        entity: { ...matter, title: "Updated" },
      }).ok,
    ).toBe(true);
    expect(adapter.publisher.getMapper()).toBe(adapter.mapper);
    expect(adapter.publisher.getValidator()).toBe(adapter.validator);
    expect(adapter.publisher.getLifecycle()).toBe(adapter.lifecycle);
    expect(adapter.publisher.getMetrics()).toBe(adapter.metrics);
    expect(adapter.publisher.getLogger()).toBe(adapter.logger);
    expect(adapter.hooks.onClientRemoved(context, "c_x").ok).toBe(false);
    expect(adapter.hooks.onDocumentRemoved(context, "d_x").ok).toBe(false);
    expect(adapter.hooks.onTaskRemoved(context, "t_x").ok).toBe(false);
    expect(adapter.hooks.onKnowledgeArticleRemoved(context, "k_x").ok).toBe(false);
  });
});

/**
 * R12-SEARCH-02 — Law Search Publication Adapter tests.
 */
import { describe, expect, it } from "vitest";
import type {
  Client,
  Document,
  KnowledgeArticle,
  Matter,
  Task,
} from "@apzhub/legal-business-core";

import {
  SEARCH_LAW_VERSION,
  createLawSearchAdapter,
  createLawSearchPublicationContext,
  isLawSearchEntityType,
  looksLikeExternalEngineIdentifier,
} from "./index";

function ctx(tenantId = "tenant-a", org = "org-a") {
  return createLawSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-search-law",
      permissions: ["legal.matter.read", "search.query.execute"],
      organisationId: org,
      workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });
}

const matter: Matter = {
  matterId: "m1111111-0001-4000-8000-000000000001",
  matterReference: "MAT-2026-00001",
  title: "Acme v. Beta",
  description: "Commercial dispute",
  clientId: "c2222222-0001-4000-8000-000000000002",
  matterTypeId: "mt1",
  matterStatus: "open",
  practiceAreaId: "pa1",
  priority: "high",
  openedAt: "2026-01-01T00:00:00.000Z",
  leadAttorneyId: "att-1",
  teamMemberIds: ["att-1"],
  tags: ["litigation"],
  customFields: {},
};

const client: Client = {
  clientId: "c2222222-0001-4000-8000-000000000002",
  clientReference: "CLT-2026-00001",
  displayName: "Acme Corp",
  clientType: "organisation",
  status: "active",
  tags: ["enterprise"],
  customFields: {},
};

const document: Document = {
  documentId: "d3333333-0001-4000-8000-000000000003",
  documentReference: "DOC-2026-00001",
  title: "Pleadings pack",
  documentType: "pleading",
  documentStatus: "filed",
  documentCategoryId: "cat1",
  matterId: matter.matterId,
  clientId: client.clientId,
  version: 1,
  fileName: "pleadings.pdf",
  mimeType: "application/pdf",
  sizeBytes: 1024,
  createdByUserId: "user-1",
  tags: ["court"],
  customFields: {},
};

const task: Task = {
  taskId: "t4444444-0001-4000-8000-000000000004",
  taskReference: "TSK-2026-00001",
  title: "File notice of motion",
  description: "Prepare and file",
  taskStatus: "in_progress",
  taskPriority: "high",
  assigneeUserId: "user-1",
  matterId: matter.matterId,
  tags: ["deadline"],
};

const article: KnowledgeArticle = {
  knowledgeArticleId: "k5555555-0001-4000-8000-000000000005",
  articleCode: "HELP-MATTER-01",
  title: "Opening a matter",
  summary: "How to open a matter",
  body: "<p>Steps to open a <b>matter</b>.</p>",
  practiceAreaIds: ["pa1"],
  precedentIds: [],
  matterTypeIds: [],
  status: "published",
  publishedAt: "2026-01-02T00:00:00.000Z",
  authorUserId: "user-1",
};

describe("R12-SEARCH-02 search-law", () => {
  it("ships version and entity catalogue", () => {
    expect(SEARCH_LAW_VERSION).toBe("0.1.0");
    expect(isLawSearchEntityType("law_matter")).toBe(true);
    expect(isLawSearchEntityType("time_entry")).toBe(false);
    expect(looksLikeExternalEngineIdentifier("m_zammad_99")).toBe(true);
    expect(looksLikeExternalEngineIdentifier("plane_issue_1")).toBe(true);
    expect(looksLikeExternalEngineIdentifier("Ticket::1")).toBe(true);
    expect(
      looksLikeExternalEngineIdentifier("m1111111-0001-4000-8000-000000000001"),
    ).toBe(false);
  });

  it("maps and publishes all Law entity types without engine or financial leakage", () => {
    const adapter = createLawSearchAdapter();
    const context = ctx();

    for (const input of [
      { entityType: "law_matter" as const, entity: matter },
      { entityType: "law_client" as const, entity: client },
      { entityType: "law_document" as const, entity: document },
      { entityType: "law_task" as const, entity: task },
      { entityType: "law_knowledge_article" as const, entity: article },
    ]) {
      const preview = adapter.publisher.preview(context, input);
      expect(preview.ok, input.entityType).toBe(true);
      expect(preview.previewMetadata?.productId).toBe("law");
      expect(JSON.stringify(preview.previewMetadata)).not.toMatch(
        /kimai|zammad|plane/i,
      );
      expect(JSON.stringify(preview.previewMetadata?.custom ?? {})).not.toMatch(
        /invoice|trust|hourlyRate|storageRef/i,
      );

      const published = adapter.publisher.publish(context, input);
      expect(published.ok, input.entityType).toBe(true);
      expect(published.lifecycleState).toBe("published");
    }

    expect(adapter.integration.sink.count()).toBe(5);
    const stats = adapter.publisher.statistics(context);
    expect(stats.published).toBe(5);
    expect(stats.byEntityType["law_matter"]).toBeGreaterThan(0);

    const docDraft = adapter.mapper.mapLawDocument(context, document);
    expect(docDraft.metadata).not.toHaveProperty("storageRef");
    expect(docDraft.metadata).not.toHaveProperty("fileName");
    expect(JSON.stringify(docDraft.metadata)).not.toMatch(/storageRef/i);
  });

  it("rejects external engine ids", () => {
    const adapter = createLawSearchAdapter();
    const context = ctx();

    expect(() =>
      adapter.mapper.mapLawMatter(context, {
        ...matter,
        matterId: "m_zammad_native123",
      }),
    ).toThrow(/external engine/i);

    const badValidate = adapter.publisher.validate(context, {
      entityType: "law_matter",
      entity: { ...matter, matterId: "plane_matter_x" },
    });
    expect(badValidate.ok).toBe(false);
  });

  it("supports lifecycle hooks upsert/remove and diagnostics", () => {
    const adapter = createLawSearchAdapter();
    const context = ctx();

    const first = adapter.hooks.onLawMatterUpserted(context, matter);
    expect(first.ok).toBe(true);
    expect(first.operation).toBe("publish");

    const second = adapter.hooks.onLawMatterUpserted(context, {
      ...matter,
      title: "Acme v. Beta (updated)",
    });
    expect(second.ok).toBe(true);
    expect(second.operation).toBe("update");

    expect(adapter.hooks.onClientUpserted(context, client).ok).toBe(true);
    expect(adapter.hooks.onDocumentUpserted(context, document).ok).toBe(true);
    expect(adapter.hooks.onTaskUpserted(context, task).ok).toBe(true);
    expect(adapter.hooks.onKnowledgeArticleUpserted(context, article).ok).toBe(true);

    const other: Matter = {
      ...matter,
      matterId: "m9999999-0001-4000-8000-000000000099",
      matterReference: "MAT-2026-00099",
      title: "Other matter",
    };
    expect(adapter.hooks.onMatterUpserted(context, other).ok).toBe(true);
    const removed = adapter.hooks.onLawMatterRemoved(context, other.matterId);
    expect(removed.ok).toBe(true);

    const life = adapter.publisher.lifecycle(
      context,
      matter.matterId,
      "archived",
      "done",
    );
    expect(life.ok).toBe(true);

    const diag = adapter.publisher.diagnostics(context);
    expect(diag.adapterVersion).toBe("0.1.0");
    expect(diag.productId).toBe("law");
    expect(diag.supportedEntityTypes).toContain("law_matter");
    expect(diag.mapperNotes.length).toBeGreaterThan(0);
    expect(adapter.lifecycle.suggestFromDomainStatus("law_matter", "archived")).toBe(
      "archived",
    );
    expect(adapter.lifecycle.suggestFromDomainStatus("law_matter", "prospect")).toBe(
      "draft",
    );
  });

  it("validates mandatory metadata and rejects financial / provider leakage", () => {
    const adapter = createLawSearchAdapter();
    const context = ctx();
    const draft = adapter.mapper.mapLawMatter(context, matter);
    const ok = adapter.validator.validateDraft(context, draft);
    expect(ok.valid).toBe(true);

    const leak = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, meilisearchIndex: "x" },
    });
    expect(leak.valid).toBe(false);
    expect(leak.issues.some((i) => i.code === "provider_leakage")).toBe(true);

    const financial = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, invoiceId: "inv-1", trustBalance: "100" },
    });
    expect(financial.valid).toBe(false);
    expect(financial.issues.some((i) => i.code === "financial_forbidden")).toBe(true);

    const incomplete = adapter.validator.validateDraft(context, {
      entityId: "m_x",
      entityType: "law_matter",
      title: "X",
      classification: "confidential",
      metadata: {},
    });
    expect(incomplete.valid).toBe(false);
  });
});

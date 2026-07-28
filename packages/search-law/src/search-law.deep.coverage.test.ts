/**
 * R12-SEARCH-02 deep coverage — validator / mapper branches.
 */
import { describe, expect, it } from "vitest";
import type {
  Client,
  Document,
  KnowledgeArticle,
  Matter,
  Task,
} from "@apzhub/legal-business-core";

import { createLawSearchAdapter, createLawSearchPublicationContext } from "./index";

function ctx() {
  return createLawSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-deep",
      permissions: ["legal.matter.read"],
      organisationId: "org-a",
    },
  });
}

describe("R12-SEARCH-02 deep coverage", () => {
  it("maps archived/closed entities with restricted classification", () => {
    const adapter = createLawSearchAdapter();
    const context = ctx();
    const matter: Matter = {
      matterId: "m1111111-0001-4000-8000-000000000001",
      matterReference: "MAT-1",
      title: "Closed matter",
      clientId: "c2222222-0001-4000-8000-000000000002",
      matterTypeId: "mt1",
      matterStatus: "archived",
      practiceAreaId: "pa1",
      priority: "low",
      openedAt: "2026-01-01T00:00:00.000Z",
      leadAttorneyId: "att-1",
      teamMemberIds: [],
      tags: [],
      customFields: {},
    };
    expect(adapter.mapper.mapLawMatter(context, matter).classification).toBe(
      "restricted",
    );

    const client: Client = {
      clientId: "c2222222-0001-4000-8000-000000000002",
      clientReference: "CLT-1",
      displayName: "Inactive",
      clientType: "individual",
      status: "inactive",
      tags: [],
      customFields: {},
    };
    expect(adapter.mapper.mapLawClient(context, client).classification).toBe(
      "restricted",
    );

    const document: Document = {
      documentId: "d3333333-0001-4000-8000-000000000003",
      documentReference: "DOC-1",
      title: "Old",
      documentType: "other",
      documentStatus: "superseded",
      documentCategoryId: "cat1",
      matterId: matter.matterId,
      version: 2,
      fileName: "x.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1,
      createdByUserId: "user-1",
      tags: [],
      customFields: {},
    };
    expect(adapter.mapper.mapLawDocument(context, document).classification).toBe(
      "restricted",
    );

    const task: Task = {
      taskId: "t4444444-0001-4000-8000-000000000004",
      taskReference: "TSK-1",
      title: "Done",
      taskStatus: "completed",
      taskPriority: "low",
      assigneeUserId: "user-1",
      tags: [],
    };
    expect(adapter.mapper.mapLawTask(context, task).classification).toBe("restricted");

    const article: KnowledgeArticle = {
      knowledgeArticleId: "k5555555-0001-4000-8000-000000000005",
      articleCode: "HELP-1",
      title: "Draft tip",
      summary: "s",
      body: "b",
      practiceAreaIds: [],
      precedentIds: [],
      matterTypeIds: [],
      status: "draft",
      authorUserId: "user-1",
    };
    expect(adapter.mapper.mapLawKnowledgeArticle(context, article).classification).toBe(
      "restricted",
    );
  });

  it("rejects storageRef and engine metadata keys", () => {
    const adapter = createLawSearchAdapter();
    const context = ctx();
    const draft = adapter.mapper.mapLawMatter(context, {
      matterId: "m1111111-0001-4000-8000-000000000001",
      matterReference: "MAT-1",
      title: "M",
      clientId: "c2222222-0001-4000-8000-000000000002",
      matterTypeId: "mt1",
      matterStatus: "open",
      practiceAreaId: "pa1",
      priority: "normal",
      openedAt: "2026-01-01T00:00:00.000Z",
      leadAttorneyId: "att-1",
      teamMemberIds: [],
      tags: [],
      customFields: {},
    });
    const storage = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, storageRef: "s3://x" },
    });
    expect(storage.issues.some((i) => i.code === "payload_leakage")).toBe(true);

    const engine = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, planeId: "1" },
    });
    expect(engine.issues.some((i) => i.code === "external_engine_id_forbidden")).toBe(
      true,
    );
  });
});

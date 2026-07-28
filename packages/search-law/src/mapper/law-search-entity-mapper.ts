/**
 * LawSearchEntityMapper — canonical Law models → SearchEntityDraft (R12-SEARCH-02).
 * Never emits engine IDs, financials, trust, rates, storage refs, or binary payloads.
 */

import type {
  Client,
  Document,
  KnowledgeArticle,
  Matter,
  Task,
} from "@apzhub/legal-business-core";
import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { LawSearchPublicationContext } from "../context/law-search-publication-context";
import {
  assertPlatformEntityId,
  type LawSearchEntityType,
} from "../types/entity-types";

export type LawSearchMappableEntity =
  | { readonly entityType: "law_matter"; readonly entity: Matter }
  | { readonly entityType: "law_client"; readonly entity: Client }
  | { readonly entityType: "law_document"; readonly entity: Document }
  | { readonly entityType: "law_task"; readonly entity: Task }
  | {
      readonly entityType: "law_knowledge_article";
      readonly entity: KnowledgeArticle;
    };

function stripHtml(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return (
    text
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || undefined
  );
}

function bodyExcerpt(body: string | undefined, max = 280): string | undefined {
  const stripped = stripHtml(body);
  if (!stripped) return undefined;
  if (stripped.length <= max) return stripped;
  return `${stripped.slice(0, max - 1).trimEnd()}…`;
}

function navigationTarget(entityType: LawSearchEntityType, id: string): string {
  switch (entityType) {
    case "law_matter":
      return `/workspace/law/matters/${id}`;
    case "law_client":
      return `/workspace/law/clients/${id}`;
    case "law_document":
      return `/workspace/law/documents/${id}`;
    case "law_task":
      return `/workspace/law/tasks/${id}`;
    case "law_knowledge_article":
      return `/workspace/law/knowledge/${id}`;
  }
}

export class LawSearchEntityMapper {
  map(
    context: LawSearchPublicationContext,
    input: LawSearchMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "law_matter":
        return this.mapLawMatter(context, input.entity);
      case "law_client":
        return this.mapLawClient(context, input.entity);
      case "law_document":
        return this.mapLawDocument(context, input.entity);
      case "law_task":
        return this.mapLawTask(context, input.entity);
      case "law_knowledge_article":
        return this.mapLawKnowledgeArticle(context, input.entity);
    }
  }

  mapLawMatter(
    context: LawSearchPublicationContext,
    matter: Matter,
  ): SearchEntityDraft {
    assertPlatformEntityId(matter.matterId, "law_matter.matterId");
    assertPlatformEntityId(matter.clientId, "law_matter.clientId");
    return {
      entityId: matter.matterId,
      entityType: "law_matter",
      title: matter.title,
      summary: stripHtml(matter.description),
      organisationId: context.organisationId,
      classification:
        matter.matterStatus === "archived" || matter.matterStatus === "closed"
          ? "restricted"
          : (context.classification ?? "confidential"),
      permissions: [...context.permissions],
      metadata: {
        status: matter.matterStatus,
        priority: matter.priority,
        clientId: matter.clientId,
        matterReference: matter.matterReference,
        practiceAreaId: matter.practiceAreaId,
        leadAttorneyId: matter.leadAttorneyId,
        openedAt: matter.openedAt,
        ...(matter.closedAt ? { closedAt: matter.closedAt } : {}),
      },
      keywords: [
        matter.title,
        matter.matterReference,
        matter.matterStatus,
        matter.priority,
        ...matter.tags,
      ],
      createdAt: matter.openedAt,
      updatedAt: matter.closedAt ?? matter.openedAt,
      navigationTarget: navigationTarget("law_matter", matter.matterId),
      sourceId: "law:law_matter",
      ownerUserId: matter.leadAttorneyId,
    };
  }

  mapLawClient(
    context: LawSearchPublicationContext,
    client: Client,
  ): SearchEntityDraft {
    assertPlatformEntityId(client.clientId, "law_client.clientId");
    return {
      entityId: client.clientId,
      entityType: "law_client",
      title: client.displayName,
      summary: client.clientReference,
      organisationId: context.organisationId,
      classification:
        client.status === "archived" || client.status === "inactive"
          ? "restricted"
          : (context.classification ?? "confidential"),
      permissions: [...context.permissions],
      metadata: {
        status: client.status,
        clientType: client.clientType,
        clientReference: client.clientReference,
        ...(client.primaryContactId
          ? { primaryContactId: client.primaryContactId }
          : {}),
      },
      keywords: [
        client.displayName,
        client.clientReference,
        client.status,
        client.clientType,
        ...client.tags,
      ],
      navigationTarget: navigationTarget("law_client", client.clientId),
      sourceId: "law:law_client",
      ownerUserId: context.actorUserId,
    };
  }

  mapLawDocument(
    context: LawSearchPublicationContext,
    document: Document,
  ): SearchEntityDraft {
    assertPlatformEntityId(document.documentId, "law_document.documentId");
    assertPlatformEntityId(document.matterId, "law_document.matterId");
    // Metadata only — never storageRef, binaries, or mime payload bodies.
    return {
      entityId: document.documentId,
      entityType: "law_document",
      title: document.title,
      summary: document.documentReference,
      organisationId: context.organisationId,
      classification:
        document.documentStatus === "superseded"
          ? "restricted"
          : (context.classification ?? "confidential"),
      permissions: [...context.permissions],
      metadata: {
        status: document.documentStatus,
        documentType: document.documentType,
        documentReference: document.documentReference,
        matterId: document.matterId,
        version: String(document.version),
        ...(document.clientId ? { clientId: document.clientId } : {}),
        ...(document.folderId ? { folderId: document.folderId } : {}),
      },
      keywords: [
        document.title,
        document.documentReference,
        document.documentType,
        document.documentStatus,
        ...document.tags,
      ],
      navigationTarget: navigationTarget("law_document", document.documentId),
      sourceId: "law:law_document",
      ownerUserId: document.createdByUserId,
    };
  }

  mapLawTask(context: LawSearchPublicationContext, task: Task): SearchEntityDraft {
    assertPlatformEntityId(task.taskId, "law_task.taskId");
    if (task.matterId) assertPlatformEntityId(task.matterId, "law_task.matterId");
    if (task.clientId) assertPlatformEntityId(task.clientId, "law_task.clientId");
    return {
      entityId: task.taskId,
      entityType: "law_task",
      title: task.title,
      summary: stripHtml(task.description),
      organisationId: context.organisationId,
      classification:
        task.taskStatus === "cancelled" || task.taskStatus === "completed"
          ? "restricted"
          : (context.classification ?? "confidential"),
      permissions: [...context.permissions],
      metadata: {
        status: task.taskStatus,
        priority: task.taskPriority,
        taskReference: task.taskReference,
        assigneeUserId: task.assigneeUserId,
        ...(task.matterId ? { matterId: task.matterId } : {}),
        ...(task.clientId ? { clientId: task.clientId } : {}),
        ...(task.dueAt ? { dueAt: task.dueAt } : {}),
      },
      keywords: [
        task.title,
        task.taskReference,
        task.taskStatus,
        task.taskPriority,
        ...task.tags,
      ],
      updatedAt: task.completedAt,
      navigationTarget: navigationTarget("law_task", task.taskId),
      sourceId: "law:law_task",
      ownerUserId: task.assigneeUserId,
    };
  }

  mapLawKnowledgeArticle(
    context: LawSearchPublicationContext,
    article: KnowledgeArticle,
  ): SearchEntityDraft {
    assertPlatformEntityId(
      article.knowledgeArticleId,
      "law_knowledge_article.knowledgeArticleId",
    );
    return {
      entityId: article.knowledgeArticleId,
      entityType: "law_knowledge_article",
      title: article.title,
      summary: stripHtml(article.summary) ?? bodyExcerpt(article.body),
      organisationId: context.organisationId,
      classification:
        article.status === "archived" || article.status === "draft"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: article.status,
        articleCode: article.articleCode,
        ...(article.publishedAt ? { publishedAt: article.publishedAt } : {}),
      },
      keywords: [article.title, article.articleCode, article.status],
      createdAt: article.publishedAt,
      updatedAt: article.publishedAt,
      navigationTarget: navigationTarget(
        "law_knowledge_article",
        article.knowledgeArticleId,
      ),
      sourceId: "law:law_knowledge_article",
      ownerUserId: article.authorUserId,
    };
  }
}

/**
 * Synchronous publication hooks for Law lifecycle events (R12-SEARCH-02).
 * No listeners, webhooks, polling, or Event Bus — call sites invoke explicitly.
 */

import type {
  Client,
  Document,
  KnowledgeArticle,
  Matter,
  Task,
} from "@apzhub/legal-business-core";
import type { SearchPublicationResult } from "@apzhub/search-integration";

import type { LawSearchPublicationContext } from "../context/law-search-publication-context";
import type { LawSearchPublisher } from "../publisher/law-search-publisher";

export type LawSearchLifecycleHooks = {
  onLawMatterUpserted(
    context: LawSearchPublicationContext,
    matter: Matter,
  ): SearchPublicationResult;
  onLawMatterRemoved(
    context: LawSearchPublicationContext,
    matterId: string,
  ): SearchPublicationResult;
  onLawClientUpserted(
    context: LawSearchPublicationContext,
    client: Client,
  ): SearchPublicationResult;
  onLawClientRemoved(
    context: LawSearchPublicationContext,
    clientId: string,
  ): SearchPublicationResult;
  onLawDocumentUpserted(
    context: LawSearchPublicationContext,
    document: Document,
  ): SearchPublicationResult;
  onLawDocumentRemoved(
    context: LawSearchPublicationContext,
    documentId: string,
  ): SearchPublicationResult;
  onLawTaskUpserted(
    context: LawSearchPublicationContext,
    task: Task,
  ): SearchPublicationResult;
  onLawTaskRemoved(
    context: LawSearchPublicationContext,
    taskId: string,
  ): SearchPublicationResult;
  onLawKnowledgeArticleUpserted(
    context: LawSearchPublicationContext,
    article: KnowledgeArticle,
  ): SearchPublicationResult;
  onLawKnowledgeArticleRemoved(
    context: LawSearchPublicationContext,
    articleId: string,
  ): SearchPublicationResult;
  onMatterUpserted(
    context: LawSearchPublicationContext,
    matter: Matter,
  ): SearchPublicationResult;
  onMatterRemoved(
    context: LawSearchPublicationContext,
    matterId: string,
  ): SearchPublicationResult;
  onClientUpserted(
    context: LawSearchPublicationContext,
    client: Client,
  ): SearchPublicationResult;
  onClientRemoved(
    context: LawSearchPublicationContext,
    clientId: string,
  ): SearchPublicationResult;
  onDocumentUpserted(
    context: LawSearchPublicationContext,
    document: Document,
  ): SearchPublicationResult;
  onDocumentRemoved(
    context: LawSearchPublicationContext,
    documentId: string,
  ): SearchPublicationResult;
  onTaskUpserted(
    context: LawSearchPublicationContext,
    task: Task,
  ): SearchPublicationResult;
  onTaskRemoved(
    context: LawSearchPublicationContext,
    taskId: string,
  ): SearchPublicationResult;
  onKnowledgeArticleUpserted(
    context: LawSearchPublicationContext,
    article: KnowledgeArticle,
  ): SearchPublicationResult;
  onKnowledgeArticleRemoved(
    context: LawSearchPublicationContext,
    articleId: string,
  ): SearchPublicationResult;
};

export function createLawSearchLifecycleHooks(
  publisher: LawSearchPublisher,
): LawSearchLifecycleHooks {
  const entityIdOf = (input: Parameters<LawSearchPublisher["publish"]>[1]): string => {
    switch (input.entityType) {
      case "law_matter":
        return input.entity.matterId;
      case "law_client":
        return input.entity.clientId;
      case "law_document":
        return input.entity.documentId;
      case "law_task":
        return input.entity.taskId;
      case "law_knowledge_article":
        return input.entity.knowledgeArticleId;
    }
  };

  const upsert = (
    context: LawSearchPublicationContext,
    input: Parameters<LawSearchPublisher["publish"]>[1],
  ): SearchPublicationResult => {
    const entityId = entityIdOf(input);
    const prior = publisher.getIntegrationPublisher().getSink().get(entityId);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  const onLawMatterUpserted = (c: LawSearchPublicationContext, e: Matter) =>
    upsert(c, { entityType: "law_matter", entity: e });
  const onLawMatterRemoved = (c: LawSearchPublicationContext, id: string) =>
    publisher.remove(c, "law_matter", id);
  const onLawClientUpserted = (c: LawSearchPublicationContext, e: Client) =>
    upsert(c, { entityType: "law_client", entity: e });
  const onLawClientRemoved = (c: LawSearchPublicationContext, id: string) =>
    publisher.remove(c, "law_client", id);
  const onLawDocumentUpserted = (c: LawSearchPublicationContext, e: Document) =>
    upsert(c, { entityType: "law_document", entity: e });
  const onLawDocumentRemoved = (c: LawSearchPublicationContext, id: string) =>
    publisher.remove(c, "law_document", id);
  const onLawTaskUpserted = (c: LawSearchPublicationContext, e: Task) =>
    upsert(c, { entityType: "law_task", entity: e });
  const onLawTaskRemoved = (c: LawSearchPublicationContext, id: string) =>
    publisher.remove(c, "law_task", id);
  const onLawKnowledgeArticleUpserted = (
    c: LawSearchPublicationContext,
    e: KnowledgeArticle,
  ) => upsert(c, { entityType: "law_knowledge_article", entity: e });
  const onLawKnowledgeArticleRemoved = (c: LawSearchPublicationContext, id: string) =>
    publisher.remove(c, "law_knowledge_article", id);

  return {
    onLawMatterUpserted,
    onLawMatterRemoved,
    onLawClientUpserted,
    onLawClientRemoved,
    onLawDocumentUpserted,
    onLawDocumentRemoved,
    onLawTaskUpserted,
    onLawTaskRemoved,
    onLawKnowledgeArticleUpserted,
    onLawKnowledgeArticleRemoved,
    onMatterUpserted: onLawMatterUpserted,
    onMatterRemoved: onLawMatterRemoved,
    onClientUpserted: onLawClientUpserted,
    onClientRemoved: onLawClientRemoved,
    onDocumentUpserted: onLawDocumentUpserted,
    onDocumentRemoved: onLawDocumentRemoved,
    onTaskUpserted: onLawTaskUpserted,
    onTaskRemoved: onLawTaskRemoved,
    onKnowledgeArticleUpserted: onLawKnowledgeArticleUpserted,
    onKnowledgeArticleRemoved: onLawKnowledgeArticleRemoved,
  };
}

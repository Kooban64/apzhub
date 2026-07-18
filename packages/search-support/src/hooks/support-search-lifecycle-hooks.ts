/**
 * Synchronous publication hooks for Support lifecycle events (APZSEARCH-011).
 * No listeners, webhooks, polling, or Event Bus — call sites invoke explicitly.
 */

import type {
  SupportArticle,
  SupportGroup,
  SupportOrganization,
  SupportTicket,
  SupportUser,
} from "@apzhub/platform-service-contracts";
import type { SearchPublicationResult } from "@apzhub/search-integration";

import type { SupportSearchPublicationContext } from "../context/support-search-publication-context";
import type { SupportSearchPublisher } from "../publisher/support-search-publisher";

export type SupportSearchLifecycleHooks = {
  onSupportRequestUpserted(
    context: SupportSearchPublicationContext,
    ticket: SupportTicket,
  ): SearchPublicationResult;
  onSupportRequestRemoved(
    context: SupportSearchPublicationContext,
    requestId: string,
  ): SearchPublicationResult;
  onSupportArticleUpserted(
    context: SupportSearchPublicationContext,
    article: SupportArticle,
  ): SearchPublicationResult;
  onSupportArticleRemoved(
    context: SupportSearchPublicationContext,
    articleId: string,
  ): SearchPublicationResult;
  onSupportOrganisationUpserted(
    context: SupportSearchPublicationContext,
    organisation: SupportOrganization,
  ): SearchPublicationResult;
  onSupportOrganisationRemoved(
    context: SupportSearchPublicationContext,
    organisationId: string,
  ): SearchPublicationResult;
  onSupportGroupUpserted(
    context: SupportSearchPublicationContext,
    group: SupportGroup,
  ): SearchPublicationResult;
  onSupportGroupRemoved(
    context: SupportSearchPublicationContext,
    groupId: string,
  ): SearchPublicationResult;
  onSupportUserUpserted(
    context: SupportSearchPublicationContext,
    user: SupportUser,
  ): SearchPublicationResult;
  onSupportUserRemoved(
    context: SupportSearchPublicationContext,
    userId: string,
  ): SearchPublicationResult;
  /** Shorter aliases */
  onRequestUpserted(
    context: SupportSearchPublicationContext,
    ticket: SupportTicket,
  ): SearchPublicationResult;
  onRequestRemoved(
    context: SupportSearchPublicationContext,
    requestId: string,
  ): SearchPublicationResult;
  onArticleUpserted(
    context: SupportSearchPublicationContext,
    article: SupportArticle,
  ): SearchPublicationResult;
  onArticleRemoved(
    context: SupportSearchPublicationContext,
    articleId: string,
  ): SearchPublicationResult;
  onOrganisationUpserted(
    context: SupportSearchPublicationContext,
    organisation: SupportOrganization,
  ): SearchPublicationResult;
  onOrganisationRemoved(
    context: SupportSearchPublicationContext,
    organisationId: string,
  ): SearchPublicationResult;
  onGroupUpserted(
    context: SupportSearchPublicationContext,
    group: SupportGroup,
  ): SearchPublicationResult;
  onGroupRemoved(
    context: SupportSearchPublicationContext,
    groupId: string,
  ): SearchPublicationResult;
  onUserUpserted(
    context: SupportSearchPublicationContext,
    user: SupportUser,
  ): SearchPublicationResult;
  onUserRemoved(
    context: SupportSearchPublicationContext,
    userId: string,
  ): SearchPublicationResult;
};

/**
 * Creates explicit hooks that call publish-or-update based on existence in the sink.
 * No background subscription.
 */
export function createSupportSearchLifecycleHooks(
  publisher: SupportSearchPublisher,
): SupportSearchLifecycleHooks {
  const upsert = (
    context: SupportSearchPublicationContext,
    input: Parameters<SupportSearchPublisher["publish"]>[1],
  ): SearchPublicationResult => {
    const entityId = (input.entity as { id: string }).id;
    const prior = publisher.getIntegrationPublisher().getSink().get(entityId);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  const onSupportRequestUpserted = (
    c: SupportSearchPublicationContext,
    e: SupportTicket,
  ) => upsert(c, { entityType: "support_request", entity: e });
  const onSupportRequestRemoved = (c: SupportSearchPublicationContext, id: string) =>
    publisher.remove(c, "support_request", id);
  const onSupportArticleUpserted = (
    c: SupportSearchPublicationContext,
    e: SupportArticle,
  ) => upsert(c, { entityType: "support_article", entity: e });
  const onSupportArticleRemoved = (c: SupportSearchPublicationContext, id: string) =>
    publisher.remove(c, "support_article", id);
  const onSupportOrganisationUpserted = (
    c: SupportSearchPublicationContext,
    e: SupportOrganization,
  ) => upsert(c, { entityType: "support_organisation", entity: e });
  const onSupportOrganisationRemoved = (
    c: SupportSearchPublicationContext,
    id: string,
  ) => publisher.remove(c, "support_organisation", id);
  const onSupportGroupUpserted = (
    c: SupportSearchPublicationContext,
    e: SupportGroup,
  ) => upsert(c, { entityType: "support_group", entity: e });
  const onSupportGroupRemoved = (c: SupportSearchPublicationContext, id: string) =>
    publisher.remove(c, "support_group", id);
  const onSupportUserUpserted = (c: SupportSearchPublicationContext, e: SupportUser) =>
    upsert(c, { entityType: "support_user", entity: e });
  const onSupportUserRemoved = (c: SupportSearchPublicationContext, id: string) =>
    publisher.remove(c, "support_user", id);

  return {
    onSupportRequestUpserted,
    onSupportRequestRemoved,
    onSupportArticleUpserted,
    onSupportArticleRemoved,
    onSupportOrganisationUpserted,
    onSupportOrganisationRemoved,
    onSupportGroupUpserted,
    onSupportGroupRemoved,
    onSupportUserUpserted,
    onSupportUserRemoved,
    onRequestUpserted: onSupportRequestUpserted,
    onRequestRemoved: onSupportRequestRemoved,
    onArticleUpserted: onSupportArticleUpserted,
    onArticleRemoved: onSupportArticleRemoved,
    onOrganisationUpserted: onSupportOrganisationUpserted,
    onOrganisationRemoved: onSupportOrganisationRemoved,
    onGroupUpserted: onSupportGroupUpserted,
    onGroupRemoved: onSupportGroupRemoved,
    onUserUpserted: onSupportUserUpserted,
    onUserRemoved: onSupportUserRemoved,
  };
}

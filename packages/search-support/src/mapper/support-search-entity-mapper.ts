/**
 * SupportSearchEntityMapper — canonical Platform models → SearchEntityDraft (APZSEARCH-011).
 * Never emits Zammad IDs, originMetadata, or provider metadata.
 */

import type {
  SupportArticle,
  SupportGroup,
  SupportOrganization,
  SupportTicket,
  SupportUser,
} from "@apzhub/platform-service-contracts";
import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { SupportSearchPublicationContext } from "../context/support-search-publication-context";
import {
  assertPlatformEntityId,
  type SupportSearchEntityType,
} from "../types/entity-types";

export type SupportSearchMappableEntity =
  | { readonly entityType: "support_request"; readonly entity: SupportTicket }
  | { readonly entityType: "support_article"; readonly entity: SupportArticle }
  | {
      readonly entityType: "support_organisation";
      readonly entity: SupportOrganization;
    }
  | { readonly entityType: "support_group"; readonly entity: SupportGroup }
  | { readonly entityType: "support_user"; readonly entity: SupportUser };

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

function navigationTarget(
  entityType: SupportSearchEntityType,
  id: string,
  supportTicketId?: string,
): string {
  switch (entityType) {
    case "support_request":
      return `/workspace/support/requests/${id}`;
    case "support_article":
      return `/workspace/support/requests/${supportTicketId}/articles/${id}`;
    case "support_organisation":
      return `/workspace/support/organisations/${id}`;
    case "support_group":
      return `/workspace/support/groups/${id}`;
    case "support_user":
      return `/workspace/support/users/${id}`;
  }
}

export class SupportSearchEntityMapper {
  map(
    context: SupportSearchPublicationContext,
    input: SupportSearchMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "support_request":
        return this.mapSupportRequest(context, input.entity);
      case "support_article":
        return this.mapSupportArticle(context, input.entity);
      case "support_organisation":
        return this.mapSupportOrganisation(context, input.entity);
      case "support_group":
        return this.mapSupportGroup(context, input.entity);
      case "support_user":
        return this.mapSupportUser(context, input.entity);
    }
  }

  mapSupportRequest(
    context: SupportSearchPublicationContext,
    ticket: SupportTicket,
  ): SearchEntityDraft {
    assertPlatformEntityId(ticket.id, "support_request.id");
    assertPlatformEntityId(ticket.groupId, "support_request.groupId");
    assertPlatformEntityId(ticket.requesterId, "support_request.requesterId");
    this.assertTenant(ticket.tenantId, context);
    return {
      entityId: ticket.id,
      entityType: "support_request",
      title: ticket.title,
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        status: ticket.status,
        priority: ticket.priority,
        groupId: ticket.groupId,
        requesterId: ticket.requesterId,
        ...(ticket.assigneeId ? { assigneeId: ticket.assigneeId } : {}),
        ...(ticket.organizationId ? { organizationId: ticket.organizationId } : {}),
        ...(ticket.displayId ? { displayId: ticket.displayId } : {}),
      },
      keywords: [
        ticket.title,
        ticket.status,
        ticket.priority,
        ...(ticket.displayId ? [ticket.displayId] : []),
        ...(ticket.tags ?? []),
      ],
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      navigationTarget: navigationTarget("support_request", ticket.id),
      sourceId: "support:support_request",
      ownerUserId: ticket.assigneeId ?? ticket.requesterId,
    };
  }

  mapSupportArticle(
    context: SupportSearchPublicationContext,
    article: SupportArticle,
  ): SearchEntityDraft {
    assertPlatformEntityId(article.id, "support_article.id");
    assertPlatformEntityId(article.supportTicketId, "support_article.supportTicketId");
    this.assertTenant(article.tenantId, context);
    const title = article.subject?.trim() || "Article";
    // Never publish originMetadata or zammad keys into search metadata.
    return {
      entityId: article.id,
      entityType: "support_article",
      title,
      summary: bodyExcerpt(article.body),
      organisationId: context.organisationId,
      classification:
        article.visibility === "internal"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        supportTicketId: article.supportTicketId,
        channel: article.channel,
        visibility: article.visibility,
        senderType: article.senderType,
      },
      keywords: [title, article.channel, article.visibility, article.senderType],
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      navigationTarget: navigationTarget(
        "support_article",
        article.id,
        article.supportTicketId,
      ),
      sourceId: "support:support_article",
      ownerUserId: article.author.userId ?? context.actorUserId,
    };
  }

  mapSupportOrganisation(
    context: SupportSearchPublicationContext,
    organisation: SupportOrganization,
  ): SearchEntityDraft {
    assertPlatformEntityId(organisation.id, "support_organisation.id");
    this.assertTenant(organisation.tenantId, context);
    return {
      entityId: organisation.id,
      entityType: "support_organisation",
      title: organisation.name,
      summary: stripHtml(organisation.note),
      organisationId: context.organisationId,
      classification: organisation.active
        ? (context.classification ?? "internal")
        : "restricted",
      permissions: [...context.permissions],
      metadata: {
        active: String(organisation.active),
        ...(organisation.domain ? { domain: organisation.domain } : {}),
      },
      keywords: [
        organisation.name,
        ...(organisation.domain ? [organisation.domain] : []),
      ],
      createdAt: organisation.createdAt,
      updatedAt: organisation.updatedAt,
      navigationTarget: navigationTarget("support_organisation", organisation.id),
      sourceId: "support:support_organisation",
      ownerUserId: context.actorUserId,
    };
  }

  mapSupportGroup(
    context: SupportSearchPublicationContext,
    group: SupportGroup,
  ): SearchEntityDraft {
    assertPlatformEntityId(group.id, "support_group.id");
    this.assertTenant(group.tenantId, context);
    return {
      entityId: group.id,
      entityType: "support_group",
      title: group.name,
      summary: stripHtml(group.note),
      organisationId: context.organisationId,
      classification: group.active
        ? (context.classification ?? "internal")
        : "restricted",
      permissions: [...context.permissions],
      metadata: {
        active: String(group.active),
      },
      keywords: [group.name],
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      navigationTarget: navigationTarget("support_group", group.id),
      sourceId: "support:support_group",
      ownerUserId: context.actorUserId,
    };
  }

  mapSupportUser(
    context: SupportSearchPublicationContext,
    user: SupportUser,
  ): SearchEntityDraft {
    assertPlatformEntityId(user.id, "support_user.id");
    this.assertTenant(user.tenantId, context);
    // Email is allowed as metadata summary; never publish login secrets.
    return {
      entityId: user.id,
      entityType: "support_user",
      title: user.displayName,
      summary: user.email ?? user.role,
      organisationId: context.organisationId,
      classification: user.active
        ? (context.classification ?? "internal")
        : "restricted",
      permissions: [...context.permissions],
      metadata: {
        role: user.role,
        active: String(user.active),
        ...(user.email ? { email: user.email } : {}),
      },
      keywords: [user.displayName, user.role, ...(user.email ? [user.email] : [])],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      navigationTarget: navigationTarget("support_user", user.id),
      sourceId: "support:support_user",
      ownerUserId: user.id,
    };
  }

  private assertTenant(
    entityTenantId: string,
    context: SupportSearchPublicationContext,
  ): void {
    if (entityTenantId !== context.tenantId) {
      throw new Error("tenant mismatch between Support entity and publication context");
    }
  }
}

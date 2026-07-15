import type {
  SupportSearchHit,
  SupportSearchHitKind,
  SupportSearchResult,
  SupportTicket,
  SupportOrganization,
  SupportGroup,
  SupportUser,
  SupportArticle,
} from "../models/canonical";
import {
  toSupportSearchHitId,
} from "./mapper-context";

export function mapTicketToSearchHit(ticket: SupportTicket): SupportSearchHit {
  return {
    id: toSupportSearchHitId("support_request", ticket.id.replace(/^sreq_zammad_/, "")),
    kind: "support_request",
    title: ticket.title,
    snippet: ticket.displayId ? `#${ticket.displayId}` : undefined,
    supportTicketId: ticket.id,
    updatedAt: ticket.updatedAt,
  };
}

export function mapOrganizationToSearchHit(
  organization: SupportOrganization,
): SupportSearchHit {
  return {
    id: toSupportSearchHitId("organization", organization.id.replace(/^sorg_zammad_/, "")),
    kind: "organization",
    title: organization.name,
    snippet: organization.domain,
    organizationId: organization.id,
    updatedAt: organization.updatedAt,
  };
}

export function mapGroupToSearchHit(group: SupportGroup): SupportSearchHit {
  return {
    id: toSupportSearchHitId("group", group.id.replace(/^sgrp_zammad_/, "")),
    kind: "group",
    title: group.name,
    snippet: group.note,
    groupId: group.id,
    updatedAt: group.updatedAt,
  };
}

export function mapUserToSearchHit(user: SupportUser): SupportSearchHit {
  return {
    id: toSupportSearchHitId("user", user.id.replace(/^suser_zammad_/, "")),
    kind: "user",
    title: user.displayName,
    snippet: user.email ?? user.login,
    userId: user.id,
    updatedAt: user.updatedAt,
  };
}

export function mapArticleToSearchHit(article: SupportArticle): SupportSearchHit {
  return {
    id: toSupportSearchHitId("article", article.id.replace(/^sart_zammad_/, "")),
    kind: "article",
    title: article.subject ?? article.body.slice(0, 80),
    snippet: article.body.slice(0, 160),
    supportTicketId: article.supportTicketId,
    articleId: article.id,
    updatedAt: article.updatedAt,
  };
}

export function buildSupportSearchResult(input: {
  readonly query: string;
  readonly hits: readonly SupportSearchHit[];
  readonly page: number;
  readonly perPage: number;
}): SupportSearchResult {
  const start = (input.page - 1) * input.perPage;
  const pageHits = input.hits.slice(start, start + input.perPage);
  return {
    query: input.query,
    hits: pageHits,
    totalCount: input.hits.length,
    page: input.page,
    perPage: input.perPage,
    hasNextPage: start + input.perPage < input.hits.length,
  };
}

export function isSearchHitKind(value: string): value is SupportSearchHitKind {
  return (
    value === "support_request" ||
    value === "organization" ||
    value === "group" ||
    value === "user" ||
    value === "article"
  );
}

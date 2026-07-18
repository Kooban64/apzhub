import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import { mapZammadArticle } from "../mappers/article-mapper";
import { mapZammadGroup } from "../mappers/group-mapper";
import { mapZammadOrganization } from "../mappers/organization-mapper";
import {
  buildSupportSearchResult,
  mapArticleToSearchHit,
  mapGroupToSearchHit,
  mapOrganizationToSearchHit,
  mapTicketToSearchHit,
  mapUserToSearchHit,
} from "../mappers/search-mapper";
import { mapZammadTicket } from "../mappers/support-ticket-mapper";
import { mapZammadUser } from "../mappers/user-mapper";
import type { SupportSearchHit, SupportSearchResult } from "../models/canonical";
import type {
  PageRequest,
  SortField,
  SupportSearchFilter,
  SupportSearchSortField,
} from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import { applyClientSort, buildZammadListQuery } from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

const SEARCH_SORT_FIELDS = [
  "score",
  "updatedAt",
  "title",
] as const satisfies readonly SupportSearchSortField[];

const ALL_KINDS = [
  "support_request",
  "organization",
  "group",
  "user",
  "article",
] as const;

/**
 * Canonical Support search — does not expose Zammad query syntax.
 */
export class ZammadSearchService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async search(
    context: IntegrationRequestContext,
    queryText: string,
    filter: SupportSearchFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportSearchSortField>[] = [
      { field: "updatedAt", direction: "desc" },
    ],
  ): Promise<SupportSearchResult> {
    assertValid(
      mergeValidation(
        validateRequiredString(queryText, "query"),
        validatePageRequest(page),
        validateSortFields(sort, SEARCH_SORT_FIELDS),
      ),
      "search.search",
    );

    return this.deps.runner.run(context, "zammad.search.search", async () => {
      const kinds = filter.kinds?.length ? filter.kinds : ALL_KINDS;
      const needle = queryText.trim().toLowerCase();
      const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
      const hits: SupportSearchHit[] = [];

      if (kinds.includes("support_request")) {
        const list = await this.deps.client.searchTickets(
          context,
          queryText,
          buildZammadListQuery({ page: 1, perPage: 50 }),
        );
        for (const item of list.items) {
          const ticket = mapZammadTicket(item, mapperCtx);
          if (filter.supportTicketId && ticket.id !== filter.supportTicketId) {
            continue;
          }
          if (
            filter.organizationId &&
            ticket.organizationId !== filter.organizationId
          ) {
            continue;
          }
          if (filter.groupId && ticket.groupId !== filter.groupId) {
            continue;
          }
          hits.push(mapTicketToSearchHit(ticket));
        }
      }

      if (kinds.includes("organization")) {
        const list = await this.deps.client.searchOrganizations(
          context,
          queryText,
          buildZammadListQuery({ page: 1, perPage: 50 }),
        );
        for (const item of list.items) {
          const organization = mapZammadOrganization(item, mapperCtx);
          if (filter.organizationId && organization.id !== filter.organizationId) {
            continue;
          }
          hits.push(mapOrganizationToSearchHit(organization));
        }
      }

      if (kinds.includes("group")) {
        const list = await this.deps.client.searchGroups(
          context,
          queryText,
          buildZammadListQuery({ page: 1, perPage: 50 }),
        );
        for (const item of list.items) {
          const group = mapZammadGroup(item, mapperCtx);
          if (
            !group.name.toLowerCase().includes(needle) &&
            !group.note?.toLowerCase().includes(needle)
          ) {
            continue;
          }
          if (filter.groupId && group.id !== filter.groupId) continue;
          hits.push(mapGroupToSearchHit(group));
        }
      }

      if (kinds.includes("user")) {
        const list = await this.deps.client.searchUsers(
          context,
          queryText,
          buildZammadListQuery({ page: 1, perPage: 50 }),
        );
        for (const item of list.items) {
          hits.push(mapUserToSearchHit(mapZammadUser(item, mapperCtx)));
        }
      }

      if (kinds.includes("article")) {
        // Article search: scan articles for tickets matching the query text via ticket search first.
        const tickets = await this.deps.client.searchTickets(
          context,
          queryText,
          buildZammadListQuery({ page: 1, perPage: 20 }),
        );
        const ticketIds = tickets.items.map((ticket) => ticket.id);
        // Also search known open inventory when ticket search is empty.
        const fallback =
          ticketIds.length > 0
            ? ticketIds
            : (
                await this.deps.client.listTickets(
                  context,
                  buildZammadListQuery({ page: 1, perPage: 20 }),
                )
              ).items.map((ticket) => ticket.id);

        for (const ticketId of fallback.slice(0, 20)) {
          const articles = await this.deps.client.listTicketArticles(
            context,
            ticketId,
            buildZammadListQuery({ page: 1, perPage: 50 }),
          );
          for (const item of articles.items) {
            const article = mapZammadArticle(item, mapperCtx);
            const haystack = `${article.subject ?? ""} ${article.body}`.toLowerCase();
            if (!haystack.includes(needle)) continue;
            if (
              filter.supportTicketId &&
              article.supportTicketId !== filter.supportTicketId
            ) {
              continue;
            }
            hits.push(mapArticleToSearchHit(article));
          }
        }
      }

      const sorted = applyClientSort(hits, sort, (item, field) => {
        if (field === "score") return item.score ?? 0;
        if (field === "updatedAt") return item.updatedAt ?? "";
        return item.title;
      });

      return buildSupportSearchResult({
        query: queryText,
        hits: sorted,
        page: page.page ?? 1,
        perPage: page.perPage ?? 25,
      });
    });
  }

  async searchSupportRequests(
    context: IntegrationRequestContext,
    queryText: string,
    page: PageRequest = {},
  ): Promise<SupportSearchResult> {
    return this.search(context, queryText, { kinds: ["support_request"] }, page);
  }

  async searchOrganizations(
    context: IntegrationRequestContext,
    queryText: string,
    page: PageRequest = {},
  ): Promise<SupportSearchResult> {
    return this.search(context, queryText, { kinds: ["organization"] }, page);
  }

  async searchGroups(
    context: IntegrationRequestContext,
    queryText: string,
    page: PageRequest = {},
  ): Promise<SupportSearchResult> {
    return this.search(context, queryText, { kinds: ["group"] }, page);
  }

  async searchUsers(
    context: IntegrationRequestContext,
    queryText: string,
    page: PageRequest = {},
  ): Promise<SupportSearchResult> {
    return this.search(context, queryText, { kinds: ["user"] }, page);
  }

  async searchArticles(
    context: IntegrationRequestContext,
    queryText: string,
    page: PageRequest = {},
  ): Promise<SupportSearchResult> {
    return this.search(context, queryText, { kinds: ["article"] }, page);
  }
}

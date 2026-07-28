import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type {
  CreateSupportArticleInput,
  CreateSupportCustomerReplyInput,
  CreateSupportInternalNoteInput,
  SupportArticleListFilter,
  SupportArticleSortField,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { SupportArticleProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_ARTICLE_PROVIDER_ID = "zammad-article";

export const ZAMMAD_ARTICLE_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_ARTICLE_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_article" as const,
  priority: 100,
};

const ARTICLE_SORT_MAP: Partial<
  Record<SupportArticleSortField, SupportArticleSortField>
> = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

function mapArticleSort(
  sort: readonly { field: SupportArticleSortField; direction: "asc" | "desc" }[],
): readonly SortField<SupportArticleSortField>[] {
  return sort.flatMap((entry) => {
    const mapped = ARTICLE_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

export function createZammadArticleProvider(
  core: ZammadCoreServices,
): SupportArticleProvider {
  return {
    list(ctx, supportTicketId, query) {
      const { page, sort, filter } = unwrapListQuery<
        SupportArticleListFilter,
        SupportArticleSortField
      >(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.articles.list(
          toIntegrationContext(ctx),
          supportTicketId,
          filter,
          page,
          mapArticleSort(sort),
        ),
      );
    },

    get(ctx, supportTicketId, articleId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.articles.get(toIntegrationContext(ctx), supportTicketId, articleId),
      );
    },

    createNote(ctx, input: CreateSupportInternalNoteInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.articles.createNote(toIntegrationContext(ctx), input),
      );
    },

    createReply(ctx, input: CreateSupportCustomerReplyInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.articles.createReply(toIntegrationContext(ctx), input),
      );
    },

    create(ctx, input: CreateSupportArticleInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.articles.create(toIntegrationContext(ctx), input),
      );
    },

    downloadAttachment(ctx, supportTicketId, articleId, attachmentId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.articles.downloadAttachment(
          toIntegrationContext(ctx),
          supportTicketId,
          articleId,
          attachmentId,
        ),
      );
    },
  };
}

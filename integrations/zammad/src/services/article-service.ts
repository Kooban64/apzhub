import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { ZammadArticleRecord } from "../internal/zammad-api-types";
import { ZAMMAD_ATTACHMENT_MAX_BYTES } from "../internal/zammad-rest-client";
import {
  mapSupportArticleToZammadCreateBody,
  mapZammadArticle,
} from "../mappers/article-mapper";
import {
  extractSupportArticleAttachmentZammadId,
  extractSupportArticleZammadId,
  extractSupportTicketZammadId,
} from "../mappers/mapper-context";
import type { SupportArticleAttachmentContent } from "../models/attachment-content";
import type { SupportArticle } from "../models/canonical";
import type {
  CreateSupportArticleInput,
  CreateSupportCustomerReplyInput,
  CreateSupportInternalNoteInput,
} from "../models/inputs";
import type {
  PageRequest,
  PageResult,
  SortField,
  SupportArticleListFilter,
  SupportArticleSortField,
} from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import {
  validateZammadArrayResponse,
  validateZammadArticleResponse,
} from "../validation/response-validation";
import {
  applyClientFilters,
  applyClientSort,
  buildZammadListQuery,
  paginateInMemory,
} from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

const ARTICLE_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
] as const satisfies readonly SupportArticleSortField[];

const SUPPORTED_CREATE_CHANNELS = [
  "note",
  "email",
  "phone",
  "web",
  "chat",
  "sms",
  "fax",
] as const;

/**
 * Support conversation articles (Zammad ticket articles).
 * Distinct from Projects Comment. Update/delete are unsupported on CE public API.
 */
export class ZammadArticleService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    supportTicketId: string,
    filter: SupportArticleListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportArticleSortField>[] = [
      { field: "createdAt", direction: "asc" },
    ],
  ): Promise<PageResult<SupportArticle>> {
    assertValid(
      mergeValidation(
        validateRequiredString(supportTicketId, "supportTicketId"),
        validatePageRequest(page),
        validateSortFields(sort, ARTICLE_SORT_FIELDS),
      ),
      "articles.list",
    );

    return this.deps.runner.run(context, "zammad.articles.list", async () => {
      const ticketZammadId = extractSupportTicketZammadId(supportTicketId);
      const list = await this.deps.client.listTicketArticles(
        context,
        ticketZammadId,
        // Fetch broadly; filter/sort/paginate client-side for deterministic CE behaviour.
        buildZammadListQuery({ page: 1, perPage: 100 }),
      );
      assertValid(validateZammadArrayResponse(list.items), "articles.list.response");

      const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
      let mapped = list.items.map((item) => {
        assertValid(validateZammadArticleResponse(item), "article.entity");
        return mapZammadArticle(
          item as ZammadArticleRecord,
          mapperCtx,
          supportTicketId,
        );
      });

      mapped = [
        ...applyClientFilters(mapped, (article) =>
          matchesArticleFilter(article, filter),
        ),
      ];

      if (sort.length > 0) {
        mapped = [
          ...applyClientSort(mapped, sort, (item, field) => {
            if (field === "updatedAt") return item.updatedAt;
            return item.createdAt;
          }),
        ];
      }

      return paginateInMemory(mapped, page);
    });
  }

  async get(
    context: IntegrationRequestContext,
    supportTicketId: string,
    articleId: string,
  ): Promise<SupportArticle> {
    assertValid(
      mergeValidation(
        validateRequiredString(supportTicketId, "supportTicketId"),
        validateRequiredString(articleId, "articleId"),
      ),
      "articles.get",
    );

    return this.deps.runner.run(context, "zammad.articles.get", async () => {
      const record = await this.deps.client.getTicketArticle(
        context,
        extractSupportArticleZammadId(articleId),
      );
      assertValid(validateZammadArticleResponse(record), "article.entity");
      return mapZammadArticle(
        record,
        {
          tenantId: this.deps.serviceContext.tenantId,
        },
        supportTicketId,
      );
    });
  }

  async createNote(
    context: IntegrationRequestContext,
    input: CreateSupportInternalNoteInput,
  ): Promise<SupportArticle> {
    assertValid(
      mergeValidation(
        validateRequiredString(input.supportTicketId, "supportTicketId"),
        validateRequiredString(input.body, "body"),
      ),
      "articles.createNote",
    );

    return this.deps.runner.run(context, "zammad.articles.createNote", async () => {
      validateAttachmentDescriptors(input.attachments, "articles.createNote");
      const payload = mapSupportArticleToZammadCreateBody({
        supportTicketId: input.supportTicketId,
        body: input.body,
        bodyFormat: input.bodyFormat,
        subject: input.subject,
        channel: "note",
        visibility: "internal",
        senderType: "agent",
        attachments: input.attachments,
      });

      // Safety: internal notes must never be customer-visible.
      if (payload.internal !== true) {
        throw Object.assign(new Error("Internal note must set internal=true"), {
          category: "validation" as const,
          code: "zammad.validation.invalid_visibility",
          message: "Internal note must set internal=true",
          retryable: false,
          correlationId: "zammad-validation",
        });
      }

      const record = await this.deps.client.createTicketArticle(context, payload);
      assertValid(validateZammadArticleResponse(record), "article.entity");
      const mapped = mapZammadArticle(
        record,
        {
          tenantId: this.deps.serviceContext.tenantId,
        },
        input.supportTicketId,
      );
      if (mapped.visibility !== "internal") {
        throw Object.assign(new Error("Created note is not internal"), {
          category: "mapping" as const,
          code: "zammad.mapping.invalid_visibility",
          message: "Created note is not internal",
          retryable: false,
          correlationId: "zammad-mapping",
        });
      }
      return mapped;
    });
  }

  async createReply(
    context: IntegrationRequestContext,
    input: CreateSupportCustomerReplyInput,
  ): Promise<SupportArticle> {
    assertValid(
      mergeValidation(
        validateRequiredString(input.supportTicketId, "supportTicketId"),
        validateRequiredString(input.body, "body"),
      ),
      "articles.createReply",
    );

    const channel = input.channel ?? "email";
    if ((channel as string) === "note") {
      throw Object.assign(new Error("Customer reply cannot use note channel"), {
        category: "validation" as const,
        code: "zammad.validation.invalid_article_type",
        message: "Customer reply cannot use note channel",
        retryable: false,
        correlationId: "zammad-validation",
      });
    }

    return this.deps.runner.run(context, "zammad.articles.createReply", async () => {
      validateAttachmentDescriptors(input.attachments, "articles.createReply");
      const payload = mapSupportArticleToZammadCreateBody({
        supportTicketId: input.supportTicketId,
        body: input.body,
        bodyFormat: input.bodyFormat,
        subject: input.subject,
        channel,
        visibility: "public",
        senderType: "agent",
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        attachments: input.attachments,
      });

      if (payload.internal !== false) {
        throw Object.assign(new Error("Customer reply must set internal=false"), {
          category: "validation" as const,
          code: "zammad.validation.invalid_visibility",
          message: "Customer reply must set internal=false",
          retryable: false,
          correlationId: "zammad-validation",
        });
      }

      const record = await this.deps.client.createTicketArticle(context, payload);
      assertValid(validateZammadArticleResponse(record), "article.entity");
      const mapped = mapZammadArticle(
        record,
        {
          tenantId: this.deps.serviceContext.tenantId,
        },
        input.supportTicketId,
      );
      if (mapped.visibility !== "public") {
        throw Object.assign(new Error("Created reply is not customer-visible"), {
          category: "mapping" as const,
          code: "zammad.mapping.invalid_visibility",
          message: "Created reply is not customer-visible",
          retryable: false,
          correlationId: "zammad-mapping",
        });
      }
      return mapped;
    });
  }

  async create(
    context: IntegrationRequestContext,
    input: CreateSupportArticleInput,
  ): Promise<SupportArticle> {
    assertValid(
      mergeValidation(
        validateRequiredString(input.supportTicketId, "supportTicketId"),
        validateRequiredString(input.body, "body"),
        validateRequiredString(input.visibility, "visibility"),
      ),
      "articles.create",
    );

    if (input.visibility === "internal") {
      return this.createNote(context, {
        supportTicketId: input.supportTicketId,
        body: input.body,
        bodyFormat: input.bodyFormat,
        subject: input.subject,
        attachments: input.attachments,
      });
    }

    const channel = input.channel ?? "email";
    if (
      !SUPPORTED_CREATE_CHANNELS.includes(
        channel as (typeof SUPPORTED_CREATE_CHANNELS)[number],
      )
    ) {
      throw Object.assign(new Error(`Unsupported article channel: ${channel}`), {
        category: "validation" as const,
        code: "zammad.validation.invalid_article_type",
        message: `Unsupported article channel: ${channel}`,
        retryable: false,
        correlationId: "zammad-validation",
      });
    }

    if (channel === "note") {
      return this.createNote(context, {
        supportTicketId: input.supportTicketId,
        body: input.body,
        bodyFormat: input.bodyFormat,
        subject: input.subject,
        attachments: input.attachments,
      });
    }

    return this.createReply(context, {
      supportTicketId: input.supportTicketId,
      body: input.body,
      bodyFormat: input.bodyFormat,
      subject: input.subject,
      channel: channel as CreateSupportCustomerReplyInput["channel"],
      to: input.to,
      cc: input.cc,
      bcc: input.bcc,
      attachments: input.attachments,
    });
  }

  async downloadAttachment(
    context: IntegrationRequestContext,
    supportTicketId: string,
    articleId: string,
    attachmentId: string,
  ): Promise<SupportArticleAttachmentContent> {
    assertValid(
      mergeValidation(
        validateRequiredString(supportTicketId, "supportTicketId"),
        validateRequiredString(articleId, "articleId"),
        validateRequiredString(attachmentId, "attachmentId"),
      ),
      "articles.downloadAttachment",
    );

    return this.deps.runner.run(
      context,
      "zammad.articles.downloadAttachment",
      async () => {
        const ticketZammadId = extractSupportTicketZammadId(supportTicketId);
        const articleZammadId = extractSupportArticleZammadId(articleId);
        const attachmentZammadId =
          extractSupportArticleAttachmentZammadId(attachmentId);

        const article = await this.deps.client.getTicketArticle(
          context,
          articleZammadId,
        );
        assertValid(validateZammadArticleResponse(article), "article.entity");
        if (String(article.ticket_id) !== ticketZammadId) {
          throw Object.assign(
            new Error("Article does not belong to the requested support ticket"),
            {
              category: "not_found" as const,
              code: "zammad.article.ticket_mismatch",
              message: "Article does not belong to the requested support ticket",
              retryable: false,
              correlationId: context.correlationId,
            },
          );
        }

        const meta = (article.attachments ?? []).find(
          (item) => String(item.id) === attachmentZammadId,
        );
        if (!meta) {
          throw Object.assign(new Error("Attachment not found on article"), {
            category: "not_found" as const,
            code: "zammad.attachment.not_found",
            message: "Attachment not found on article",
            retryable: false,
            correlationId: context.correlationId,
          });
        }

        const binary = await this.deps.client.downloadTicketAttachment(
          context,
          ticketZammadId,
          articleZammadId,
          attachmentZammadId,
        );

        const filename =
          binary.filename?.trim() ||
          meta.filename?.trim() ||
          `attachment-${attachmentZammadId}`;
        const contentType =
          binary.contentType ||
          (typeof meta.preferences?.["Mime-Type"] === "string"
            ? meta.preferences["Mime-Type"]
            : "application/octet-stream");

        return {
          id: attachmentId,
          articleId,
          supportTicketId,
          filename,
          contentType,
          sizeBytes: binary.sizeBytes,
          dataBase64: uint8ToBase64(binary.bytes),
        };
      },
    );
  }
}

function validateAttachmentDescriptors(
  attachments: CreateSupportArticleInput["attachments"],
  operation: string,
): void {
  if (!attachments?.length) return;
  for (const attachment of attachments) {
    assertValid(
      validateRequiredString(attachment.filename, "attachments.filename"),
      operation,
    );
    if (!attachment.dataBase64) {
      throw Object.assign(
        new Error("Attachment binary dataBase64 is required for upload"),
        {
          category: "validation" as const,
          code: "zammad.attachment.data_required",
          message: "Attachment binary dataBase64 is required for upload",
          retryable: false,
          correlationId: "zammad-validation",
        },
      );
    }
    const approxBytes = Math.floor((attachment.dataBase64.length * 3) / 4);
    if (approxBytes > ZAMMAD_ATTACHMENT_MAX_BYTES) {
      throw Object.assign(new Error("Attachment exceeds maximum allowed size"), {
        category: "validation" as const,
        code: "zammad.attachment.too_large",
        message: `Attachment exceeds maximum allowed size (${ZAMMAD_ATTACHMENT_MAX_BYTES} bytes)`,
        retryable: false,
        correlationId: "zammad-validation",
      });
    }
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function matchesArticleFilter(
  article: SupportArticle,
  filter: SupportArticleListFilter,
): boolean {
  if (filter.visibility && article.visibility !== filter.visibility) return false;
  if (filter.channel && article.channel !== filter.channel) return false;
  if (filter.senderType && article.senderType !== filter.senderType) return false;
  if (filter.authorId && article.author.userId !== filter.authorId) return false;
  if (filter.createdAfter && article.createdAt < filter.createdAfter) return false;
  if (filter.createdBefore && article.createdAt > filter.createdBefore) return false;
  return true;
}

/** Exported for tests — builds the Zammad create payload for internal notes. */
export function buildInternalNotePayloadForTest(
  input: CreateSupportInternalNoteInput,
): Record<string, unknown> {
  return mapSupportArticleToZammadCreateBody({
    supportTicketId: input.supportTicketId,
    body: input.body,
    bodyFormat: input.bodyFormat,
    subject: input.subject,
    channel: "note",
    visibility: "internal",
    senderType: "agent",
    attachments: input.attachments,
  });
}

/** Exported for tests — builds the Zammad create payload for customer replies. */
export function buildCustomerReplyPayloadForTest(
  input: CreateSupportCustomerReplyInput,
): Record<string, unknown> {
  return mapSupportArticleToZammadCreateBody({
    supportTicketId: input.supportTicketId,
    body: input.body,
    bodyFormat: input.bodyFormat,
    subject: input.subject,
    channel: input.channel ?? "email",
    visibility: "public",
    senderType: "agent",
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    attachments: input.attachments,
  });
}

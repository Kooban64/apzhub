import type {
  SupportArticle,
  SupportArticleAttachment,
  SupportArticleAuthor,
  SupportArticleBodyFormat,
  SupportArticleChannel,
  SupportArticleDeliveryStatus,
  SupportArticleRecipients,
  SupportArticleSenderType,
  SupportArticleVisibility,
} from "../models/canonical";
import type {
  ZammadArticleAttachmentRecord,
  ZammadArticleRecord,
} from "../internal/zammad-api-types";
import {
  type MapperContext,
  extractSupportTicketZammadId,
  toSupportArticleAttachmentId,
  toSupportArticleId,
  toSupportTicketId,
  toSupportUserId,
} from "./mapper-context";

const CHANNEL_BY_TYPE: Readonly<Record<string, SupportArticleChannel>> = {
  note: "note",
  email: "email",
  "email outbound": "email",
  "email inbound": "email",
  phone: "phone",
  web: "web",
  chat: "chat",
  sms: "sms",
  fax: "fax",
  twitter: "unknown",
  facebook: "unknown",
  telegram: "unknown",
};

const SENDER_BY_NAME: Readonly<Record<string, SupportArticleSenderType>> = {
  agent: "agent",
  customer: "customer",
  system: "system",
};

export function mapZammadArticleChannel(type: string | undefined): SupportArticleChannel {
  if (!type?.trim()) return "unknown";
  return CHANNEL_BY_TYPE[type.trim().toLowerCase()] ?? "unknown";
}

export function mapChannelToZammadType(channel: SupportArticleChannel): string {
  if (channel === "unknown") return "note";
  if (channel === "sms") return "sms";
  return channel;
}

export function mapZammadSenderType(sender: string | undefined): SupportArticleSenderType {
  if (!sender?.trim()) return "unknown";
  return SENDER_BY_NAME[sender.trim().toLowerCase()] ?? "unknown";
}

export function mapZammadBodyFormat(
  contentType: string | undefined,
): SupportArticleBodyFormat {
  if (!contentType) return "unknown";
  const normalized = contentType.toLowerCase();
  if (normalized.includes("html")) return "text/html";
  if (normalized.includes("plain") || normalized === "text") return "text/plain";
  return "unknown";
}

export function mapBodyFormatToZammad(
  format: SupportArticleBodyFormat | undefined,
): string {
  if (format === "text/html") return "text/html";
  return "text/plain";
}

function splitRecipients(value: string | undefined): readonly string[] | undefined {
  if (!value?.trim()) return undefined;
  const parts = value
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

export function mapZammadRecipients(
  record: ZammadArticleRecord,
): SupportArticleRecipients | undefined {
  const to = splitRecipients(record.to);
  const cc = splitRecipients(record.cc);
  const from = splitRecipients(record.from);
  if (!to && !cc && !from) return undefined;
  return {
    ...(to ? { to } : {}),
    ...(cc ? { cc } : {}),
    ...(from ? { replyTo: from } : {}),
  };
}

export function mapZammadArticleAuthor(
  record: ZammadArticleRecord,
): SupportArticleAuthor {
  const senderType = mapZammadSenderType(record.sender);
  const fromEmail = splitRecipients(record.from)?.[0];

  if (record.created_by_id !== undefined && record.created_by_id !== null) {
    return {
      userId: toSupportUserId(record.created_by_id),
      email: fromEmail,
      displayName: fromEmail,
      senderType,
    };
  }

  if (senderType === "system") {
    return { senderType: "system", displayName: "System" };
  }

  return {
    senderType,
    email: fromEmail,
    displayName: fromEmail,
  };
}

export function mapZammadArticleAttachment(
  record: ZammadArticleAttachmentRecord,
  articleId: string,
): SupportArticleAttachment {
  const preferences = record.preferences ?? {};
  const contentType =
    typeof preferences["Mime-Type"] === "string"
      ? preferences["Mime-Type"]
      : typeof preferences["Content-Type"] === "string"
        ? preferences["Content-Type"]
        : undefined;
  const contentId =
    typeof preferences["Content-ID"] === "string"
      ? preferences["Content-ID"]
      : undefined;
  const disposition =
    typeof preferences["Content-Disposition"] === "string"
      ? preferences["Content-Disposition"]
      : undefined;

  const size =
    typeof record.size === "number" && Number.isFinite(record.size) && record.size >= 0
      ? record.size
      : undefined;

  return {
    id: toSupportArticleAttachmentId(record.id),
    articleId,
    filename: record.filename?.trim() || `attachment-${record.id}`,
    contentType,
    sizeBytes: size,
    disposition,
    contentId,
    createdAt: record.created_at,
  };
}

function mapDeliveryStatus(
  record: ZammadArticleRecord,
): SupportArticleDeliveryStatus {
  const prefs = record.preferences ?? {};
  const delivery = prefs["delivery_status"] ?? prefs["send-error"];
  if (delivery === undefined || delivery === null) {
    return record.type?.toLowerCase().includes("email") ? "unknown" : "none";
  }
  const value = String(delivery).toLowerCase();
  if (value.includes("fail") || value.includes("error")) return "failed";
  if (value.includes("pending") || value.includes("queue")) return "pending";
  if (value.includes("sent") || value.includes("success")) return "sent";
  return "unknown";
}

/**
 * Maps a Zammad article record to canonical SupportArticle.
 * Strips binary attachment payloads. Throws controlled mapping error when required fields missing.
 */
export function mapZammadArticle(
  record: ZammadArticleRecord,
  ctx: MapperContext,
  expectedTicketId?: string,
): SupportArticle {
  if (typeof record.id !== "number" || typeof record.ticket_id !== "number") {
    throw Object.assign(new Error("Invalid Zammad article response: missing id/ticket_id"), {
      category: "mapping" as const,
      code: "zammad.mapping.invalid_article",
      message: "Invalid Zammad article response: missing id/ticket_id",
      retryable: false,
      correlationId: "zammad-mapping",
    });
  }

  if (!record.created_at || typeof record.created_at !== "string") {
    throw Object.assign(new Error("Invalid Zammad article response: missing created_at"), {
      category: "mapping" as const,
      code: "zammad.mapping.invalid_article",
      message: "Invalid Zammad article response: missing created_at",
      retryable: false,
      correlationId: "zammad-mapping",
    });
  }

  const supportTicketId = toSupportTicketId(record.ticket_id);
  if (
    expectedTicketId &&
    extractSupportTicketZammadId(expectedTicketId) !== String(record.ticket_id)
  ) {
    throw Object.assign(
      new Error("Article does not belong to the requested support ticket"),
      {
        category: "not_found" as const,
        code: "zammad.article.ticket_mismatch",
        message: "Article does not belong to the requested support ticket",
        retryable: false,
        correlationId: "zammad-mapping",
      },
    );
  }

  const articleId = toSupportArticleId(record.id);
  const visibility: SupportArticleVisibility =
    record.internal === true ? "internal" : "public";

  const attachments = (record.attachments ?? []).map((attachment) =>
    mapZammadArticleAttachment(attachment, articleId),
  );

  return {
    id: articleId,
    tenantId: ctx.tenantId,
    supportTicketId,
    subject: record.subject,
    body: typeof record.body === "string" ? record.body : "",
    bodyFormat: mapZammadBodyFormat(record.content_type),
    channel: mapZammadArticleChannel(record.type),
    visibility,
    senderType: mapZammadSenderType(record.sender),
    author: mapZammadArticleAuthor(record),
    recipients: mapZammadRecipients(record),
    deliveryStatus: mapDeliveryStatus(record),
    attachments,
    createdAt: record.created_at,
    updatedAt: record.updated_at ?? record.created_at,
    originMetadata: {
      ...(record.type ? { zammadType: record.type } : {}),
      ...(record.sender ? { zammadSender: record.sender } : {}),
    },
  };
}

export function mapSupportArticleToZammadCreateBody(input: {
  readonly supportTicketId: string;
  readonly body: string;
  readonly bodyFormat?: SupportArticleBodyFormat;
  readonly subject?: string;
  readonly channel: SupportArticleChannel;
  readonly visibility: SupportArticleVisibility;
  readonly senderType?: SupportArticleSenderType;
  readonly to?: readonly string[];
  readonly cc?: readonly string[];
  readonly bcc?: readonly string[];
  readonly attachments?: readonly {
    readonly filename: string;
    readonly contentType?: string;
    readonly dataBase64?: string;
  }[];
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    ticket_id: Number(extractSupportTicketZammadId(input.supportTicketId)),
    body: input.body,
    content_type: mapBodyFormatToZammad(input.bodyFormat),
    type: mapChannelToZammadType(input.channel),
    internal: input.visibility === "internal",
    sender: input.senderType === "customer" ? "Customer" : "Agent",
  };

  if (input.subject !== undefined) body.subject = input.subject;
  if (input.to?.length) body.to = input.to.join(", ");
  if (input.cc?.length) body.cc = input.cc.join(", ");
  if (input.bcc?.length) {
    // Zammad may ignore bcc on some channels; still pass when provided.
    body.bcc = input.bcc.join(", ");
  }

  if (input.attachments?.length) {
    body.attachments = input.attachments.map((attachment) => ({
      filename: attachment.filename,
      "mime-type": attachment.contentType ?? "application/octet-stream",
      ...(attachment.dataBase64 ? { data: attachment.dataBase64 } : {}),
    }));
  }

  return body;
}

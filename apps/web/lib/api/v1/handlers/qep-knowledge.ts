import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import { createArticle, listArticles, publishArticle } from "@/lib/qep/knowledge-store";

function hasPerm(context: PlatformApiRequestContext, keys: readonly string[]): boolean {
  const perms = context.serviceContext.permissions ?? [];
  if (perms.includes("*") || perms.includes("qep.*")) return true;
  return keys.some((k) => perms.includes(k));
}

export async function handleListKnowledge(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  if (!hasPerm(context, ["qep.knowledge.read"])) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Missing permission: qep.knowledge.read",
    });
  }
  return jsonDataResponse({ items: listArticles() }, context.tracing);
}

export async function handleKnowledgeMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  if (!hasPerm(context, ["qep.knowledge.operate"])) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Missing permission: qep.knowledge.operate",
    });
  }
  const body = (await request.json()) as {
    action?: string;
    title?: string;
    body?: string;
    tags?: string[];
    articleId?: string;
  };
  const actorId = context.serviceContext.userId ?? "unknown";
  const { correlationId } = context.tracing;

  if (body.action === "create") {
    if (!body.title?.trim()) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "title is required",
      });
    }
    const item = createArticle({
      title: body.title,
      body: body.body ?? "",
      tags: body.tags,
      actorId,
    });
    appendQepAuditEvent({
      action: "knowledge.created",
      actor: actorId,
      correlationId,
      detail: item.articleId,
    });
    return jsonDataResponse(item, context.tracing);
  }

  if (body.action === "publish") {
    if (!body.articleId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "articleId is required",
      });
    }
    const item = publishArticle({ articleId: body.articleId });
    if (!item) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Article not found",
      });
    }
    appendQepAuditEvent({
      action: "knowledge.published",
      actor: actorId,
      correlationId,
      detail: item.articleId,
    });
    return jsonDataResponse(item, context.tracing);
  }

  throw new PlatformApiHttpError(400, {
    code: "VALIDATION_ERROR",
    message: "Unknown action",
  });
}

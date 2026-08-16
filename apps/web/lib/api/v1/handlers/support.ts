import type { NextRequest } from "next/server";

import type {
  CreateSupportArticleInput,
  CreateSupportCustomerReplyInput,
  CreateSupportGroupInput,
  CreateSupportInternalNoteInput,
  CreateSupportOrganizationInput,
  CreateSupportTicketInput,
  UpdateSupportOrganizationInput,
  UpdateSupportTicketInput,
  SupportTicketSortField,
  SupportOrganizationSortField,
  SupportGroupSortField,
  SupportUserSortField,
  SupportArticleSortField,
  SupportHistorySortField,
} from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import { paginationQuerySchema } from "../schemas/common";
import {
  articleIdParamSchema,
  assignSupportCustomerBodySchema,
  assignSupportOwnerBodySchema,
  attachmentIdParamSchema,
  changeSupportPriorityBodySchema,
  changeSupportStateBodySchema,
  createCustomerReplyBodySchema,
  createGroupBodySchema,
  createInternalNoteBodySchema,
  createOrganizationBodySchema,
  createSupportRequestBodySchema,
  groupIdParamSchema,
  groupListQuerySchema,
  historyListQuerySchema,
  organizationIdParamSchema,
  organizationListQuerySchema,
  supportRequestIdParamSchema,
  supportSearchQuerySchema,
  supportRequestListQuerySchema,
  supportUserIdParamSchema,
  supportUserListQuerySchema,
  updateGroupBodySchema,
  updateOrganizationBodySchema,
  updateSupportRequestBodySchema,
  type CreateSupportRequestBody,
  type UpdateSupportRequestBody,
} from "../schemas/support";
import { toListQuery, toPlatformApiPage } from "./paging";
import {
  filterItemsBySupportQueueScope,
  isGroupInSupportQueueScope,
  resolveScopedGroupIdFilter,
  resolveSupportQueueScope,
} from "@/lib/support/queue-scope";
import { PlatformApiHttpError } from "../errors";
import { requireSupportPermission } from "./require-support-permission";

// ---------------------------------------------------------------------------
// Path param helpers
// ---------------------------------------------------------------------------

async function resolveSupportRequestId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(
    supportRequestIdParamSchema,
    params?.supportRequestId ?? "",
    "supportRequestId",
  );
}

async function resolveArticleId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<{ supportRequestId: string; articleId: string }> {
  const params = await routeContext?.params;
  const supportRequestId = parsePathParam(
    supportRequestIdParamSchema,
    params?.supportRequestId ?? "",
    "supportRequestId",
  );
  const articleId = parsePathParam(
    articleIdParamSchema,
    params?.articleId ?? "",
    "articleId",
  );
  return { supportRequestId, articleId };
}

async function resolveOrganizationId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(
    organizationIdParamSchema,
    params?.organizationId ?? "",
    "organizationId",
  );
}

async function resolveGroupId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(groupIdParamSchema, params?.groupId ?? "", "groupId");
}

async function resolveSupportUserId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(supportUserIdParamSchema, params?.userId ?? "", "userId");
}

// ---------------------------------------------------------------------------
// Input mappers
// ---------------------------------------------------------------------------

function toCreateSupportRequestInput(
  body: CreateSupportRequestBody,
): CreateSupportTicketInput {
  return {
    title: body.title,
    groupId: body.groupId,
    requesterId: body.requesterId,
    assigneeId: body.assigneeId,
    organizationId: body.organizationId,
    status: body.status,
    priority: body.priority,
    tags: body.tags,
  };
}

function toUpdateSupportRequestInput(
  body: UpdateSupportRequestBody,
): UpdateSupportTicketInput {
  const input: UpdateSupportTicketInput = {
    title: body.title,
    groupId: body.groupId,
    requesterId: body.requesterId,
    assigneeId: body.assigneeId,
    organizationId: body.organizationId,
    status: body.status,
    priority: body.priority,
    tags: body.tags,
  };
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as UpdateSupportTicketInput;
}

// ---------------------------------------------------------------------------
// Support Request handlers
// ---------------------------------------------------------------------------

export async function handleListSupportRequests(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.requests.list");
  const query = parseQuery(supportRequestListQuerySchema, request.nextUrl.searchParams);
  const queueScope = resolveSupportQueueScope(context.serviceContext.permissions);
  const scopedGroup = resolveScopedGroupIdFilter(query.groupId, queueScope);
  if (!scopedGroup.ok) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Support queue scope does not include the requested group",
    });
  }
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.support.listSupportRequests(context.serviceContext, {
    page: listQuery.page,
    sort: listQuery.sort as
      | readonly { field: SupportTicketSortField; direction: "asc" | "desc" }[]
      | undefined,
    filter: {
      status: query.status,
      priority: query.priority,
      groupId: scopedGroup.groupId,
      assigneeId: query.ownerId ?? query.assigneeId,
      requesterId: query.customerId ?? query.requesterId,
      organizationId: query.organizationId,
      search: query.search,
    },
  });
  const items = filterItemsBySupportQueueScope(result.items, queueScope);
  return jsonCollectionResponse(
    items,
    toPlatformApiPage({ ...result, items }, query),
    context.tracing,
  );
}

export async function handleGetSupportRequest(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.read", "support.requests.list");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.getSupportRequest(
    context.serviceContext,
    supportRequestId,
  );
  const queueScope = resolveSupportQueueScope(context.serviceContext.permissions);
  if (!isGroupInSupportQueueScope(ticket.groupId, queueScope)) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Support queue scope does not include this request",
    });
  }
  return jsonDataResponse(ticket, context.tracing);
}

export async function handleCreateSupportRequest(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.requests.create");
  const body = await parseJsonBody(
    request,
    createSupportRequestBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.createSupportRequest(
    context.serviceContext,
    toCreateSupportRequestInput(body),
  );
  return jsonDataResponse(ticket, context.tracing, { status: 201 });
}

export async function handleUpdateSupportRequest(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.update");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const body = await parseJsonBody(
    request,
    updateSupportRequestBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.updateSupportRequest(
    context.serviceContext,
    supportRequestId,
    toUpdateSupportRequestInput(body),
  );
  return jsonDataResponse(ticket, context.tracing);
}

/**
 * DELETE maps to closeSupportRequest — soft-close semantics per platform contract.
 * Hard-delete is not exposed.
 */
export async function handleCloseSupportRequest(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.transition");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.closeSupportRequest(
    context.serviceContext,
    supportRequestId,
  );
  return jsonDataResponse(ticket, context.tracing);
}

export async function handleReopenSupportRequest(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.transition");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.reopenSupportRequest(
    context.serviceContext,
    supportRequestId,
  );
  return jsonDataResponse(ticket, context.tracing);
}

export async function handleChangeSupportState(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.transition");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const body = await parseJsonBody(
    request,
    changeSupportStateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.changeSupportRequestState(
    context.serviceContext,
    supportRequestId,
    { status: body.status },
  );
  return jsonDataResponse(ticket, context.tracing);
}

export async function handleChangeSupportPriority(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.update");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const body = await parseJsonBody(
    request,
    changeSupportPriorityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.changeSupportRequestPriority(
    context.serviceContext,
    supportRequestId,
    { priority: body.priority },
  );
  return jsonDataResponse(ticket, context.tracing);
}

/** POST owner — assign via assignSupportRequest({ assigneeId }). */
export async function handleAssignSupportOwner(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.assign");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const body = await parseJsonBody(
    request,
    assignSupportOwnerBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.assignSupportRequest(
    context.serviceContext,
    supportRequestId,
    { assigneeId: body.assigneeId },
  );
  return jsonDataResponse(ticket, context.tracing);
}

/** DELETE owner — remove via assignSupportRequest({ assigneeId: null }). */
export async function handleRemoveSupportOwner(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.assign");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.assignSupportRequest(
    context.serviceContext,
    supportRequestId,
    { assigneeId: null },
  );
  return jsonDataResponse(ticket, context.tracing);
}

/**
 * POST customer — uses updateSupportRequest({ requesterId }) because the
 * SupportService contract has no dedicated assignCustomer method.
 */
export async function handleAssignSupportCustomer(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.update");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const body = await parseJsonBody(
    request,
    assignSupportCustomerBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const requesterId = (body.requesterId ?? body.customerId)!;
  const gateway = await getPlatformServiceGateway();
  const ticket = await gateway.support.updateSupportRequest(
    context.serviceContext,
    supportRequestId,
    { requesterId },
  );
  return jsonDataResponse(ticket, context.tracing);
}

// ---------------------------------------------------------------------------
// Article handlers
// ---------------------------------------------------------------------------

export async function handleListSupportArticles(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.articles.list", "support.requests.read");
  const params = await routeContext?.params;
  const supportRequestId = parsePathParam(
    supportRequestIdParamSchema,
    params?.supportRequestId ?? "",
    "supportRequestId",
  );
  const query = parseQuery(paginationQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.supportArticles.list(
    context.serviceContext,
    supportRequestId,
    {
      page: listQuery.page,
      sort: listQuery.sort as
        | readonly { field: SupportArticleSortField; direction: "asc" | "desc" }[]
        | undefined,
    },
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetSupportArticle(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.articles.read", "support.articles.list");
  const { supportRequestId, articleId } = await resolveArticleId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const article = await gateway.supportArticles.get(
    context.serviceContext,
    supportRequestId,
    articleId,
  );
  return jsonDataResponse(article, context.tracing);
}

/**
 * Create an internal note — visibility is always "internal".
 * Never accept visibility override; schema rejects unknown keys via .strict().
 */
export async function handleCreateInternalNote(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.articles.create");
  const params = await routeContext?.params;
  const supportRequestId = parsePathParam(
    supportRequestIdParamSchema,
    params?.supportRequestId ?? "",
    "supportRequestId",
  );
  const body = await parseJsonBody(
    request,
    createInternalNoteBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const input: CreateSupportInternalNoteInput = {
    supportTicketId: supportRequestId,
    body: body.body,
    bodyFormat: body.bodyFormat as CreateSupportArticleInput["bodyFormat"],
    subject: body.subject,
    attachments: body.attachments,
  };
  const gateway = await getPlatformServiceGateway();
  const article = await gateway.supportArticles.createNote(
    context.serviceContext,
    input,
  );
  return jsonDataResponse(article, context.tracing, { status: 201 });
}

/**
 * Create a customer reply — visibility is always "public".
 * Channel must be a public channel; "note" / "unknown" are blocked by schema.
 */
export async function handleCreateCustomerReply(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.articles.create");
  const params = await routeContext?.params;
  const supportRequestId = parsePathParam(
    supportRequestIdParamSchema,
    params?.supportRequestId ?? "",
    "supportRequestId",
  );
  const body = await parseJsonBody(
    request,
    createCustomerReplyBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const input: CreateSupportCustomerReplyInput = {
    supportTicketId: supportRequestId,
    body: body.body,
    bodyFormat: body.bodyFormat as CreateSupportArticleInput["bodyFormat"],
    subject: body.subject,
    channel: body.channel as CreateSupportCustomerReplyInput["channel"],
    to: body.to,
    cc: body.cc,
    bcc: body.bcc,
    attachments: body.attachments,
  };
  const gateway = await getPlatformServiceGateway();
  const article = await gateway.supportArticles.createReply(
    context.serviceContext,
    input,
  );
  return jsonDataResponse(article, context.tracing, { status: 201 });
}

export async function handleDownloadSupportAttachment(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.articles.read", "support.articles.list");
  const params = await routeContext?.params;
  const supportRequestId = parsePathParam(
    supportRequestIdParamSchema,
    params?.supportRequestId ?? "",
    "supportRequestId",
  );
  const articleId = parsePathParam(
    articleIdParamSchema,
    params?.articleId ?? "",
    "articleId",
  );
  const attachmentId = parsePathParam(
    attachmentIdParamSchema,
    params?.attachmentId ?? "",
    "attachmentId",
  );
  const gateway = await getPlatformServiceGateway();
  const content = await gateway.supportArticles.downloadAttachment(
    context.serviceContext,
    supportRequestId,
    articleId,
    attachmentId,
  );
  return jsonDataResponse(content, context.tracing);
}

// ---------------------------------------------------------------------------
// History handler
// ---------------------------------------------------------------------------

export async function handleGetSupportHistory(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.requests.read", "support.requests.list");
  const supportRequestId = await resolveSupportRequestId(routeContext);
  const query = parseQuery(historyListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.supportHistory.getTimeline(
    context.serviceContext,
    supportRequestId,
    {
      page: listQuery.page,
      sort: listQuery.sort as
        | readonly { field: SupportHistorySortField; direction: "asc" | "desc" }[]
        | undefined,
      filter: {
        occurredAfter: query.occurredAfter,
        occurredBefore: query.occurredBefore,
      },
    },
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

// ---------------------------------------------------------------------------
// Organization handlers
// ---------------------------------------------------------------------------

export async function handleListOrganizations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.organizations.list");
  const query = parseQuery(organizationListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.supportOrganizations.listOrganizations(
    context.serviceContext,
    {
      page: listQuery.page,
      sort: listQuery.sort as
        | readonly { field: SupportOrganizationSortField; direction: "asc" | "desc" }[]
        | undefined,
      filter: {
        search: query.search,
        active: query.active === undefined ? undefined : query.active === "true",
      },
    },
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetOrganization(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(
    context,
    "support.organizations.read",
    "support.organizations.list",
  );
  const organizationId = await resolveOrganizationId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const org = await gateway.supportOrganizations.getOrganization(
    context.serviceContext,
    organizationId,
  );
  return jsonDataResponse(org, context.tracing);
}

export async function handleCreateOrganization(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.organizations.create");
  const body = await parseJsonBody(
    request,
    createOrganizationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const input: CreateSupportOrganizationInput = {
    name: body.name,
    note: body.note,
    domain: body.domain,
    shared: body.shared,
  };
  const gateway = await getPlatformServiceGateway();
  const org = await gateway.supportOrganizations.createOrganization(
    context.serviceContext,
    input,
  );
  return jsonDataResponse(org, context.tracing, { status: 201 });
}

export async function handleUpdateOrganization(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.organizations.update");
  const organizationId = await resolveOrganizationId(routeContext);
  const body = await parseJsonBody(
    request,
    updateOrganizationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const input: UpdateSupportOrganizationInput = Object.fromEntries(
    Object.entries({
      name: body.name,
      note: body.note,
      domain: body.domain,
      shared: body.shared,
      active: body.active,
    }).filter(([, v]) => v !== undefined),
  ) as UpdateSupportOrganizationInput;
  const gateway = await getPlatformServiceGateway();
  const org = await gateway.supportOrganizations.updateOrganization(
    context.serviceContext,
    organizationId,
    input,
  );
  return jsonDataResponse(org, context.tracing);
}

/** DELETE organization → archiveOrganization (soft). */
export async function handleArchiveOrganization(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(
    context,
    "support.organizations.archive",
    "support.organizations.update",
  );
  const organizationId = await resolveOrganizationId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const org = await gateway.supportOrganizations.archiveOrganization(
    context.serviceContext,
    organizationId,
  );
  return jsonDataResponse(org, context.tracing);
}

// ---------------------------------------------------------------------------
// Group handlers
// ---------------------------------------------------------------------------

export async function handleListGroups(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.groups.list");
  const query = parseQuery(groupListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.supportGroups.listGroups(context.serviceContext, {
    page: listQuery.page,
    sort: listQuery.sort as
      | readonly { field: SupportGroupSortField; direction: "asc" | "desc" }[]
      | undefined,
    filter: {
      search: query.search,
      active: query.active === undefined ? undefined : query.active === "true",
    },
  });
  const queueScope = resolveSupportQueueScope(context.serviceContext.permissions);
  const items =
    queueScope.mode === "scoped"
      ? result.items.filter((g) => isGroupInSupportQueueScope(g.id, queueScope))
      : result.items;
  return jsonCollectionResponse(
    items,
    toPlatformApiPage({ ...result, items }, query),
    context.tracing,
  );
}

export async function handleGetGroup(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.groups.read", "support.groups.list");
  const groupId = await resolveGroupId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const group = await gateway.supportGroups.getGroup(context.serviceContext, groupId);
  return jsonDataResponse(group, context.tracing);
}

export async function handleCreateGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.groups.create");
  const body = await parseJsonBody(
    request,
    createGroupBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const input: CreateSupportGroupInput = {
    name: body.name,
    note: body.note,
    active: body.active,
  };
  const gateway = await getPlatformServiceGateway();
  const group = await gateway.supportGroups.createGroup(context.serviceContext, input);
  return jsonDataResponse(group, context.tracing, { status: 201 });
}

export async function handleUpdateGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.groups.update");
  const groupId = await resolveGroupId(routeContext);
  const body = await parseJsonBody(
    request,
    updateGroupBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const group = await gateway.supportGroups.updateGroup(
    context.serviceContext,
    groupId,
    {
      name: body.name,
      note: body.note,
      active: body.active,
    },
  );
  return jsonDataResponse(group, context.tracing);
}

// ---------------------------------------------------------------------------
// User handlers
// ---------------------------------------------------------------------------

export async function handleListSupportUsers(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.users.list");
  const query = parseQuery(supportUserListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();

  // lookup by email or login
  if (query.email ?? query.login) {
    const user = await gateway.supportUsers.lookup(context.serviceContext, {
      email: query.email,
      login: query.login,
    });
    if (!user) {
      return jsonCollectionResponse(
        [],
        { cursor: null, nextCursor: null, limit: 1, hasMore: false },
        context.tracing,
      );
    }
    return jsonCollectionResponse(
      [user],
      { cursor: null, nextCursor: null, limit: 1, hasMore: false },
      context.tracing,
    );
  }

  // text search
  if (query.search) {
    const listQuery = toListQuery(query);
    const result = await gateway.supportUsers.search(
      context.serviceContext,
      query.search,
      {
        page: listQuery.page,
        sort: listQuery.sort as
          | readonly { field: SupportUserSortField; direction: "asc" | "desc" }[]
          | undefined,
        filter: {
          active: query.active === undefined ? undefined : query.active === "true",
          role: query.role,
        },
      },
    );
    return jsonCollectionResponse(
      result.items,
      toPlatformApiPage(result, query),
      context.tracing,
    );
  }

  // default list
  const listQuery = toListQuery(query);
  const result = await gateway.supportUsers.listUsers(context.serviceContext, {
    page: listQuery.page,
    sort: listQuery.sort as
      readonly { field: SupportUserSortField; direction: "asc" | "desc" }[] | undefined,
    filter: {
      active: query.active === undefined ? undefined : query.active === "true",
      role: query.role,
    },
  });
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetSupportUser(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireSupportPermission(context, "support.users.read", "support.users.list");
  const userId = await resolveSupportUserId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const user = await gateway.supportUsers.getUser(context.serviceContext, userId);
  return jsonDataResponse(user, context.tracing);
}

// ---------------------------------------------------------------------------
// Search handler
// ---------------------------------------------------------------------------

export async function handleSupportSearch(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.search.execute", "support.requests.list");
  const query = parseQuery(supportSearchQuerySchema, request.nextUrl.searchParams);
  const queryText = (query.q ?? query.query)!;
  const gateway = await getPlatformServiceGateway();

  const kindsFilter: string[] | undefined = query.kinds
    ? query.kinds
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;

  const result = await gateway.supportSearch.search(context.serviceContext, queryText, {
    filter: {
      kinds: kindsFilter as never,
      organizationId: query.organizationId,
      groupId: query.groupId,
      supportTicketId: query.supportRequestId,
    },
    sort: query.sort
      ? [{ field: query.sort, direction: query.order ?? "desc" }]
      : undefined,
  });

  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Analytics handler
// ---------------------------------------------------------------------------

export async function handleSupportAnalytics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(context, "support.analytics.read");
  const gateway = await getPlatformServiceGateway();
  const snapshot = await gateway.supportAnalytics.getSupportIntelligence(
    context.serviceContext,
  );
  return jsonDataResponse(snapshot, context.tracing);
}

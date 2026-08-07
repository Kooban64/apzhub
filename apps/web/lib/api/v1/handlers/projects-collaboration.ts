/**
 * Collaboration — conversations · meeting outcomes · timeline · digests · search (W007 / PX-04).
 */

import type { NextRequest } from "next/server";

import type {
  ConversationAnchorType,
  ConversationType,
  CreateAnnouncementInput,
  CreateConversationInput,
  CreateMeetingOutcomeInput,
  CreateNoticeInput,
  DigestKind,
  PostMessageInput,
  ResolveConversationInput,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsCollaborationService,
  createProjectsOperationalService,
  getMemoryProjectsCollaborationStore,
  getMemoryProjectsOperationalStore,
  setProjectsCollaborationStoreForTests,
  setProjectsOperationalStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import { parsePathParam } from "../schemas/common";
import { projectIdParamSchema } from "../schemas/project";

function collaboration() {
  try {
    return createProjectsCollaborationService(undefined, {
      loadOperationalHistory: async (ctx, projectId, objectType, objectId) => {
        if (!objectType || !objectId) return [];
        const items = await ops().listHistory(ctx, projectId, objectType, objectId);
        return items.map((e) => ({
          id: e.id,
          at: e.at,
          kind: e.kind,
          summary: e.summary,
          objectType: e.objectType,
          objectId: e.objectId,
          actorUserId: e.actorUserId,
        }));
      },
    });
  } catch {
    setProjectsCollaborationStoreForTests(getMemoryProjectsCollaborationStore());
    return createProjectsCollaborationService(getMemoryProjectsCollaborationStore());
  }
}

function ops() {
  try {
    return createProjectsOperationalService();
  } catch {
    setProjectsOperationalStoreForTests(getMemoryProjectsOperationalStore());
    return createProjectsOperationalService(getMemoryProjectsOperationalStore());
  }
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  if (message.includes("decision_outcome_required")) {
    return {
      status: 400,
      code: "DECISION_OUTCOME_REQUIRED",
      message:
        "Decision conversations require Approved/Rejected/Deferred/Superseded/Cancelled.",
    };
  }
  return { status: 400, code: "VALIDATION_ERROR", message };
}

async function projectIdFrom(routeContext?: {
  params: Promise<Record<string, string>>;
}) {
  return parsePathParam(
    projectIdParamSchema,
    (await routeContext?.params)?.projectId ?? "",
    "projectId",
  );
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleListConversations(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const url = new URL(request.url);
  const items = await collaboration().listConversations(
    context.serviceContext,
    projectId,
    {
      anchorType: url.searchParams.get("anchorType") ?? undefined,
      anchorId: url.searchParams.get("anchorId") ?? undefined,
      conversationType: url.searchParams.get("conversationType") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    },
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateConversation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateConversationInput = {
      projectId,
      programmeId: typeof body.programmeId === "string" ? body.programmeId : undefined,
      anchorType: body.anchorType as ConversationAnchorType,
      anchorId: String(body.anchorId ?? ""),
      conversationType: body.conversationType as ConversationType | undefined,
      title: typeof body.title === "string" ? body.title : undefined,
      watcherPrincipalIds: Array.isArray(body.watcherPrincipalIds)
        ? body.watcherPrincipalIds.filter((x): x is string => typeof x === "string")
        : undefined,
    };
    const item = await collaboration().createConversation(
      context.serviceContext,
      input,
    );
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListMessages(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const conversationId = String((await routeContext?.params)?.conversationId ?? "");
  const items = await collaboration().listMessages(
    context.serviceContext,
    conversationId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handlePostMessage(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const conversationId = String((await routeContext?.params)?.conversationId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: PostMessageInput = {
      body: String(body.body ?? ""),
      messageType: body.messageType as PostMessageInput["messageType"],
      linkedObjectRefs: Array.isArray(body.linkedObjectRefs)
        ? body.linkedObjectRefs
            .filter(
              (x): x is { type: string; id: string } =>
                typeof x === "object" &&
                x !== null &&
                typeof (x as { type?: unknown }).type === "string" &&
                typeof (x as { id?: unknown }).id === "string",
            )
            .map((x) => ({ type: x.type, id: x.id }))
        : undefined,
      mentionPrincipalIds: Array.isArray(body.mentionPrincipalIds)
        ? body.mentionPrincipalIds.filter((x): x is string => typeof x === "string")
        : undefined,
    };
    const item = await collaboration().postMessage(
      context.serviceContext,
      conversationId,
      input,
    );
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleResolveConversation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const conversationId = String((await routeContext?.params)?.conversationId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: ResolveConversationInput = {
      status: body.status as ResolveConversationInput["status"],
      decisionOutcome:
        body.decisionOutcome as ResolveConversationInput["decisionOutcome"],
      summary: typeof body.summary === "string" ? body.summary : undefined,
    };
    const item = await collaboration().resolveConversation(
      context.serviceContext,
      conversationId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListMeetingOutcomes(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await collaboration().listMeetingOutcomes(
    context.serviceContext,
    "project",
    projectId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateMeetingOutcome(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateMeetingOutcomeInput = {
      scopeType: "project",
      scopeId: projectId,
      heldAt: String(body.heldAt ?? new Date().toISOString()),
      title: String(body.title ?? ""),
      summary: String(body.summary ?? ""),
      attendeePrincipalIds: Array.isArray(body.attendeePrincipalIds)
        ? body.attendeePrincipalIds.filter((x): x is string => typeof x === "string")
        : undefined,
      decisionsRecorded: Array.isArray(body.decisionsRecorded)
        ? body.decisionsRecorded.filter((x): x is string => typeof x === "string")
        : undefined,
      commitmentsCaptured: Array.isArray(body.commitmentsCaptured)
        ? body.commitmentsCaptured.filter((x): x is string => typeof x === "string")
        : undefined,
      risksRaised: Array.isArray(body.risksRaised)
        ? body.risksRaised.filter((x): x is string => typeof x === "string")
        : undefined,
      actionsCaptured: Array.isArray(body.actionsCaptured)
        ? body.actionsCaptured.filter((x): x is string => typeof x === "string")
        : undefined,
      recordingRef:
        typeof body.recordingRef === "string" ? body.recordingRef : undefined,
    };
    const item = await collaboration().createMeetingOutcome(
      context.serviceContext,
      input,
    );
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCreateNotice(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateNoticeInput = {
      scopeType: "project",
      scopeId: projectId,
      title: String(body.title ?? ""),
      body: String(body.body ?? ""),
      pinned: Boolean(body.pinned),
    };
    const item = await collaboration().createNotice(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCreateAnnouncement(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateAnnouncementInput = {
      scopeType: "project",
      scopeId: projectId,
      title: String(body.title ?? ""),
      body: String(body.body ?? ""),
      priority: body.priority as CreateAnnouncementInput["priority"],
      audience: body.audience as CreateAnnouncementInput["audience"],
      validFrom: typeof body.validFrom === "string" ? body.validFrom : undefined,
      validTo: typeof body.validTo === "string" ? body.validTo : undefined,
      acknowledgeRequired: Boolean(body.acknowledgeRequired),
    };
    const item = await collaboration().createAnnouncement(
      context.serviceContext,
      input,
    );
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleUnifiedTimeline(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const url = new URL(request.url);
  try {
    const items = await collaboration().getUnifiedTimeline(
      context.serviceContext,
      projectId,
      {
        objectType: url.searchParams.get("objectType") ?? undefined,
        objectId: url.searchParams.get("objectId") ?? undefined,
        unresolvedOnly: url.searchParams.get("unresolvedOnly") === "true",
      },
    );
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleBuildDigest(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  try {
    const item = await collaboration().buildDigest(context.serviceContext, {
      kind: String(body?.kind ?? "weekly") as DigestKind,
      scopeType: "project",
      scopeId: projectId,
      projectId,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleContextualSearch(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  try {
    const items = await collaboration().contextualSearch(
      context.serviceContext,
      projectId,
      q,
    );
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

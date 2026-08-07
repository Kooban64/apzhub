/**
 * APZ Knowledge Organisational Memory handlers — APZ-KNOWLEDGE-CAPABILITY-001.
 */

import type { NextRequest } from "next/server";

import type {
  CreateDecisionKnowledgeInput,
  CreateKnowledgeLessonInput,
  CreateKnowledgeLibraryItemInput,
  KnowledgeObjectKind,
  TransitionKnowledgeLifecycleInput,
  UpdateKnowledgeObjectInput,
} from "@apzhub/platform-service-contracts";
import {
  createOrganisationalMemoryService,
  getMemoryOrganisationalMemoryStore,
  setOrganisationalMemoryStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function service() {
  try {
    return createOrganisationalMemoryService();
  } catch {
    setOrganisationalMemoryStoreForTests(getMemoryOrganisationalMemoryStore());
    return createOrganisationalMemoryService(getMemoryOrganisationalMemoryStore());
  }
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  const notFound = message.includes("_not_found");
  return {
    status: notFound ? 404 : 400,
    code: notFound ? "NOT_FOUND" : "VALIDATION_ERROR",
    message,
  };
}

const KINDS: readonly KnowledgeObjectKind[] = [
  "lesson",
  "standard",
  "procedure",
  "best_practice",
  "operational_guide",
  "reference",
  "decision_knowledge",
];

const STATUSES = ["draft", "review", "approved", "archived"] as const;

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function handleListKnowledgeObjects(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const kindParam = request.nextUrl.searchParams.get("kind") ?? undefined;
  const kind =
    kindParam && KINDS.includes(kindParam as KnowledgeObjectKind)
      ? (kindParam as KnowledgeObjectKind)
      : undefined;
  const items = await service().list(context.serviceContext, kind);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleGetKnowledgeObject(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  objectId: string,
) {
  const item = await service().get(context.serviceContext, objectId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "Knowledge object not found." },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleCreateKnowledgeLesson(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateKnowledgeLessonInput = {
    title: String(body.title ?? ""),
    summary: String(body.summary ?? ""),
    context: String(body.context ?? ""),
    situation: String(body.situation ?? ""),
    resolution: String(body.resolution ?? ""),
    recommendation: String(body.recommendation ?? ""),
    owner: String(body.owner ?? ""),
    relatedProducts: asStringArray(body.relatedProducts),
    relatedCapabilities: asStringArray(body.relatedCapabilities),
    tags: asStringArray(body.tags),
    reviewDate: typeof body.reviewDate === "string" ? body.reviewDate : undefined,
    expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined,
  };
  try {
    const created = await service().createLesson(context.serviceContext, input);
    return jsonDataResponse(created, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleCreateKnowledgeLibraryItem(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateKnowledgeLibraryItemInput = {
    title: String(body.title ?? ""),
    summary: String(body.summary ?? ""),
    content: String(body.content ?? ""),
    owner: String(body.owner ?? ""),
    libraryCategory:
      body.libraryCategory as CreateKnowledgeLibraryItemInput["libraryCategory"],
    relatedProducts: asStringArray(body.relatedProducts),
    relatedCapabilities: asStringArray(body.relatedCapabilities),
    tags: asStringArray(body.tags),
    reviewDate: typeof body.reviewDate === "string" ? body.reviewDate : undefined,
    expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined,
  };
  try {
    const created = await service().createLibraryItem(context.serviceContext, input);
    return jsonDataResponse(created, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleCreateDecisionKnowledge(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateDecisionKnowledgeInput = {
    title: String(body.title ?? ""),
    summary: String(body.summary ?? ""),
    rationale: String(body.rationale ?? ""),
    owner: String(body.owner ?? ""),
    decisionRef: String(body.decisionRef ?? ""),
    relatedQuestionId:
      typeof body.relatedQuestionId === "string" ? body.relatedQuestionId : undefined,
    relatedProducts: asStringArray(body.relatedProducts),
    tags: asStringArray(body.tags),
    reviewDate: typeof body.reviewDate === "string" ? body.reviewDate : undefined,
  };
  try {
    const created = await service().createDecisionKnowledge(
      context.serviceContext,
      input,
    );
    return jsonDataResponse(created, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleUpdateKnowledgeObject(
  request: NextRequest,
  context: PlatformApiRequestContext,
  objectId: string,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateKnowledgeObjectInput = {
    title: typeof body.title === "string" ? body.title : undefined,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    body:
      typeof body.body === "object" && body.body !== null
        ? (body.body as Record<string, unknown>)
        : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    tags: Array.isArray(body.tags) ? asStringArray(body.tags) : undefined,
    relatedProducts: Array.isArray(body.relatedProducts)
      ? asStringArray(body.relatedProducts)
      : undefined,
    relatedCapabilities: Array.isArray(body.relatedCapabilities)
      ? asStringArray(body.relatedCapabilities)
      : undefined,
    reviewDate:
      body.reviewDate === null
        ? null
        : typeof body.reviewDate === "string"
          ? body.reviewDate
          : undefined,
    expiresAt:
      body.expiresAt === null
        ? null
        : typeof body.expiresAt === "string"
          ? body.expiresAt
          : undefined,
    decisionRef: typeof body.decisionRef === "string" ? body.decisionRef : undefined,
  };
  try {
    const updated = await service().update(context.serviceContext, objectId, input);
    return jsonDataResponse(updated, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleTransitionKnowledgeLifecycle(
  request: NextRequest,
  context: PlatformApiRequestContext,
  objectId: string,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const status = String(body.status ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "organisational_memory_status_invalid" },
      context.tracing,
    );
  }
  const input: TransitionKnowledgeLifecycleInput = {
    status: status as TransitionKnowledgeLifecycleInput["status"],
    note: typeof body.note === "string" ? body.note : undefined,
  };
  try {
    const updated = await service().transitionLifecycle(
      context.serviceContext,
      objectId,
      input,
    );
    return jsonDataResponse(updated, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleGetKnowledgeQuality(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const report = await service().getQuality(context.serviceContext);
  return jsonDataResponse(report, context.tracing);
}

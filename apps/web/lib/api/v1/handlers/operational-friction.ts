/**
 * Operational Friction Register HTTP handlers — APZHUB-PRODUCT-BOARD-001.
 */

import type { NextRequest } from "next/server";

import type {
  CreateOperationalFrictionInput,
  FrictionBoardDecision,
  FrictionEngineeringStatus,
  FrictionSource,
  UpdateOperationalFrictionInput,
} from "@apzhub/platform-service-contracts";
import {
  FRICTION_BOARD_DECISIONS,
  FRICTION_ENGINEERING_STATUSES,
  FRICTION_SOURCES,
} from "@apzhub/platform-service-contracts";
import {
  createOperationalFrictionService,
  getMemoryOperationalFrictionStore,
  setOperationalFrictionStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function service() {
  try {
    return createOperationalFrictionService();
  } catch {
    setOperationalFrictionStoreForTests(getMemoryOperationalFrictionStore());
    return createOperationalFrictionService(getMemoryOperationalFrictionStore());
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseCreate(body: Record<string, unknown>): CreateOperationalFrictionInput {
  const boardDecision = body.boardDecision as FrictionBoardDecision | undefined;
  const engineeringStatus = body.engineeringStatus as
    FrictionEngineeringStatus | undefined;
  const source = body.source as FrictionSource | undefined;

  if (boardDecision && !FRICTION_BOARD_DECISIONS.includes(boardDecision)) {
    throw new Error("friction_board_decision_invalid");
  }
  if (engineeringStatus && !FRICTION_ENGINEERING_STATUSES.includes(engineeringStatus)) {
    throw new Error("friction_engineering_status_invalid");
  }
  if (source && !FRICTION_SOURCES.includes(source)) {
    throw new Error("friction_source_invalid");
  }

  return {
    title: String(body.title ?? ""),
    reportedAt: typeof body.reportedAt === "string" ? body.reportedAt : undefined,
    reporter: String(body.reporter ?? ""),
    productsAffected: asStringArray(body.productsAffected),
    userRole: String(body.userRole ?? ""),
    frustration: String(body.frustration ?? ""),
    whoExperiences: String(body.whoExperiences ?? ""),
    evidence: String(body.evidence ?? ""),
    nonEngineeringOptions: String(body.nonEngineeringOptions ?? ""),
    smallestCapability: String(body.smallestCapability ?? ""),
    boardDecision,
    engineeringStatus,
    source,
  };
}

function parseUpdate(body: Record<string, unknown>): UpdateOperationalFrictionInput {
  const out: Record<string, unknown> = {};
  for (const key of [
    "title",
    "reporter",
    "userRole",
    "frustration",
    "whoExperiences",
    "evidence",
    "nonEngineeringOptions",
    "smallestCapability",
    "outcomeNotes",
  ] as const) {
    if (typeof body[key] === "string") {
      out[key] = body[key];
    }
  }
  if (Array.isArray(body.productsAffected)) {
    out.productsAffected = asStringArray(body.productsAffected);
  }
  if (
    typeof body.boardDecision === "string" &&
    FRICTION_BOARD_DECISIONS.includes(body.boardDecision as FrictionBoardDecision)
  ) {
    out.boardDecision = body.boardDecision as FrictionBoardDecision;
  }
  if (
    typeof body.engineeringStatus === "string" &&
    FRICTION_ENGINEERING_STATUSES.includes(
      body.engineeringStatus as FrictionEngineeringStatus,
    )
  ) {
    out.engineeringStatus = body.engineeringStatus as FrictionEngineeringStatus;
  }
  for (const key of [
    "outcomeFaster",
    "outcomeClearer",
    "outcomeSafer",
    "outcomeBetterDecision",
  ] as const) {
    if (body[key] === null || typeof body[key] === "boolean") {
      out[key] = body[key] as boolean | null;
    }
  }
  return out as UpdateOperationalFrictionInput;
}

export async function handleListOperationalFriction(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await service().list(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateOperationalFriction(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  if (typeof body !== "object" || body === null) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Body must be an object." },
      context.tracing,
    );
  }

  try {
    const created = await service().create(
      context.serviceContext,
      parseCreate(body as Record<string, unknown>),
    );
    return jsonDataResponse(created, context.tracing, { status: 201 });
  } catch (error) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message: error instanceof Error ? error.message : "Invalid friction payload.",
      },
      context.tracing,
    );
  }
}

export async function handleGetOperationalFriction(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  frictionId: string,
) {
  const item = await service().get(context.serviceContext, frictionId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "Friction record not found." },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateOperationalFriction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  frictionId: string,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  if (typeof body !== "object" || body === null) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Body must be an object." },
      context.tracing,
    );
  }

  try {
    const updated = await service().update(
      context.serviceContext,
      frictionId,
      parseUpdate(body as Record<string, unknown>),
    );
    return jsonDataResponse(updated, context.tracing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed.";
    const status = message === "friction_not_found" ? 404 : 400;
    return jsonErrorResponse(
      status,
      { code: status === 404 ? "NOT_FOUND" : "VALIDATION_ERROR", message },
      context.tracing,
    );
  }
}

export async function handleListOperationalFrictionAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  frictionId: string,
) {
  const items = await service().listAudit(context.serviceContext, frictionId);
  return jsonDataResponse({ items }, context.tracing);
}

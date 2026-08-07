/**
 * Operational administration — W010 / PX-07.
 */

import type { NextRequest } from "next/server";

import type {
  CreateGovernedSearchInput,
  CreateLegalHoldInput,
  CreateOperationalDelegationInput,
  CreateOperationalRoleInput,
  CreateRetentionPolicyInput,
  GovernanceScopeType,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsAdministrationService,
  getMemoryProjectsAdministrationStore,
  setProjectsAdministrationStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function admin() {
  try {
    return createProjectsAdministrationService();
  } catch {
    setProjectsAdministrationStoreForTests(getMemoryProjectsAdministrationStore());
    return createProjectsAdministrationService(getMemoryProjectsAdministrationStore());
  }
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  if (message.includes("sod_forbidden") || message.includes("not_active")) {
    return { status: 409, code: "CONFLICT", message };
  }
  return { status: 400, code: "VALIDATION_ERROR", message };
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleListDelegations(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await admin().expireDueDelegations(context.serviceContext);
  const items = await admin().listDelegations(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateDelegation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const input: CreateOperationalDelegationInput = {
    fromPrincipalId: String(body.fromPrincipalId ?? ""),
    toPrincipalId: String(body.toPrincipalId ?? ""),
    scopeType: body.scopeType as GovernanceScopeType,
    scopeId: String(body.scopeId ?? ""),
    permissionSet: Array.isArray(body.permissionSet)
      ? body.permissionSet.map(String)
      : undefined,
    roleKeys: Array.isArray(body.roleKeys) ? body.roleKeys.map(String) : undefined,
    validFrom: String(body.validFrom ?? ""),
    validTo: String(body.validTo ?? ""),
    reason: String(body.reason ?? ""),
  };
  try {
    const item = await admin().createDelegation(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleRevokeDelegation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const delegationId = String((await routeContext?.params)?.delegationId ?? "");
  try {
    const item = await admin().revokeDelegation(context.serviceContext, delegationId);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListRetentionPolicies(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await admin().listRetentionPolicies(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateRetentionPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const input: CreateRetentionPolicyInput = {
    key: String(body.key ?? ""),
    name: String(body.name ?? ""),
    classification: String(body.classification ?? ""),
    retainYears: Number(body.retainYears ?? 0),
    archiveBehaviour:
      body.archiveBehaviour as CreateRetentionPolicyInput["archiveBehaviour"],
  };
  try {
    const item = await admin().createRetentionPolicy(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handlePublishRetentionPolicy(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const policyId = String((await routeContext?.params)?.policyId ?? "");
  try {
    const item = await admin().publishRetentionPolicy(context.serviceContext, policyId);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListLegalHolds(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await admin().listLegalHolds(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handlePlaceLegalHold(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const input: CreateLegalHoldInput = {
    scopeType: body.scopeType as GovernanceScopeType,
    scopeId: String(body.scopeId ?? ""),
    reason: String(body.reason ?? ""),
  };
  try {
    const item = await admin().placeLegalHold(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleReleaseLegalHold(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const holdId = String((await routeContext?.params)?.holdId ?? "");
  try {
    const item = await admin().releaseLegalHold(context.serviceContext, holdId);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListGovernedSearches(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await admin().listGovernedSearches(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateGovernedSearch(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const input: CreateGovernedSearchInput = {
    key: String(body.key ?? ""),
    name: String(body.name ?? ""),
    query: String(body.query ?? ""),
    facets:
      body.facets && typeof body.facets === "object"
        ? (body.facets as Record<string, string>)
        : undefined,
    audience: body.audience as CreateGovernedSearchInput["audience"],
    scopeId: body.scopeId !== undefined ? String(body.scopeId) : undefined,
  };
  try {
    const item = await admin().createGovernedSearch(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handlePublishGovernedSearch(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const searchId = String((await routeContext?.params)?.searchId ?? "");
  try {
    const item = await admin().publishGovernedSearch(context.serviceContext, searchId);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListOperationalRoles(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await admin().listOperationalRoles(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateOperationalRole(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const input: CreateOperationalRoleInput = {
    key: String(body.key ?? ""),
    label: String(body.label ?? ""),
    description: body.description !== undefined ? String(body.description) : undefined,
    accountabilityHint:
      body.accountabilityHint !== undefined
        ? String(body.accountabilityHint)
        : undefined,
  };
  try {
    const item = await admin().createOperationalRole(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListAdminAudit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "100");
  const items = await admin().listAdminAudit(context.serviceContext, limit);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleAssessMaturity(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const scopeType = String(
    url.searchParams.get("scopeType") ?? "organisation",
  ) as GovernanceScopeType;
  const scopeId = String(url.searchParams.get("scopeId") ?? "organisation");
  const item = await admin().assessMaturity(context.serviceContext, {
    scopeType,
    scopeId,
    publishedProfileCount: Number(url.searchParams.get("publishedProfileCount") ?? "0"),
    publishedPolicyCount: Number(url.searchParams.get("publishedPolicyCount") ?? "0"),
    activeDelegationCount: Number(url.searchParams.get("activeDelegationCount") ?? "0"),
    retentionPublished: url.searchParams.get("retentionPublished") === "true",
    governedSearchCount: Number(url.searchParams.get("governedSearchCount") ?? "0"),
  });
  return jsonDataResponse(item, context.tracing);
}

export async function handleGetHierarchyLayers(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const scopeType = String(
    url.searchParams.get("scopeType") ?? "project",
  ) as GovernanceScopeType;
  const scopeId = String(url.searchParams.get("scopeId") ?? "");
  const items = admin().getHierarchyLayers(scopeType, scopeId);
  return jsonDataResponse({ items }, context.tracing);
}

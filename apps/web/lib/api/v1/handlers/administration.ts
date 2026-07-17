/**
 * Platform Administration HTTP handlers (APZADMIN-003) — presentation only.
 * Call PlatformServiceGateway.administration.* exclusively — never admin-core/persistence.
 * Management plane only — no workbench, runtime admin, user/role/tenant management.
 */

import {
  asAdministrationActionId,
  asAdministrationAuditId,
  asAdministrationCapabilityId,
  asAdministrationCategoryId,
  asAdministrationDashboardId,
  asAdministrationDiagnosticId,
  asAdministrationHistoryId,
  asAdministrationMetadataId,
  asAdministrationModuleId,
  asAdministrationNavigationId,
  asAdministrationPermissionId,
  asAdministrationPolicyId,
  asAdministrationReferenceId,
  asAdministrationRegistrationId,
  asAdministrationSectionId,
  asAdministrationShortcutId,
  asAdministrationWidgetId,
  type AdministrationLifecycleStatus,
  type AdministrationModule,
} from "@apzhub/admin-contracts";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import {
  parseJsonBody,
  parsePathParam,
  parseQuery,
  resolvePageLimit,
} from "../schemas/common";
import {
  administrationActionIdParamSchema,
  administrationAuditIdParamSchema,
  administrationAuditListQuerySchema,
  administrationCapabilityIdParamSchema,
  administrationCategoryIdParamSchema,
  administrationDashboardIdParamSchema,
  administrationDiagnosticIdParamSchema,
  administrationHistoryIdParamSchema,
  administrationMetadataIdParamSchema,
  administrationModuleIdParamSchema,
  administrationModuleScopedListQuerySchema,
  administrationNavigationIdParamSchema,
  administrationOptionalModuleListQuerySchema,
  administrationPermissionIdParamSchema,
  administrationPolicyIdParamSchema,
  administrationReferenceIdParamSchema,
  administrationRegistrationIdParamSchema,
  administrationSectionIdParamSchema,
  administrationShortcutIdParamSchema,
  administrationWidgetIdParamSchema,
  createAdministrationActionBodySchema,
  createAdministrationCapabilityBodySchema,
  createAdministrationCategoryBodySchema,
  createAdministrationDashboardBodySchema,
  createAdministrationMetadataBodySchema,
  createAdministrationModuleBodySchema,
  createAdministrationNavigationBodySchema,
  createAdministrationPermissionBodySchema,
  createAdministrationPolicyBodySchema,
  createAdministrationReferenceBodySchema,
  createAdministrationRegistrationBodySchema,
  createAdministrationSectionBodySchema,
  createAdministrationShortcutBodySchema,
  createAdministrationWidgetBodySchema,
  modulesListQuerySchema,
  transitionAdministrationModuleBodySchema,
  updateAdministrationActionBodySchema,
  updateAdministrationCapabilityBodySchema,
  updateAdministrationCategoryBodySchema,
  updateAdministrationDashboardBodySchema,
  updateAdministrationMetadataBodySchema,
  updateAdministrationModuleBodySchema,
  updateAdministrationNavigationBodySchema,
  updateAdministrationPermissionBodySchema,
  updateAdministrationPolicyBodySchema,
  updateAdministrationRegistrationBodySchema,
  updateAdministrationSectionBodySchema,
  updateAdministrationShortcutBodySchema,
  updateAdministrationWidgetBodySchema,
} from "../schemas/administration";

type RouteContext = { params: Promise<Record<string, string>> };

function listPage(items: readonly unknown[], limit?: number) {
  const pageLimit = limit ?? items.length;
  return {
    cursor: null,
    nextCursor: null,
    limit: pageLimit,
    hasMore: false,
  };
}

function collection<T>(
  items: readonly T[],
  context: PlatformApiRequestContext,
  limit?: number,
) {
  return jsonCollectionResponse(items, listPage(items, limit), context.tracing);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

export async function assertAdministrationHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.administrationEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "ADMINISTRATION_SERVICE_UNAVAILABLE",
      message:
        "Administration Platform HTTP API is not enabled (APZHUB_ADMINISTRATION_ENABLED).",
    });
  }
}

export function buildAdministrationManagementPlaneDto(input: {
  readonly administrationEnabled: boolean;
  readonly persistenceMode?: "postgres" | "memory" | "unknown";
}) {
  return {
    administrationEnabled: input.administrationEnabled,
    managementPlaneReady: input.administrationEnabled,
    persistenceReady: input.administrationEnabled,
    administrationCoreReady: input.administrationEnabled,
    gatewayRegistered: input.administrationEnabled,
    requestPipelineReady: input.administrationEnabled,
    authorizationReady: input.administrationEnabled,
    httpEnabled: true as const,
    workbenchEnabled: false as const,
    runtimeAdminEnabled: false as const,
    userManagementEnabled: false as const,
    roleManagementEnabled: false as const,
    tenantManagementEnabled: false as const,
    organisationManagementEnabled: false as const,
    provisioningEnabled: false as const,
    liveDiagnosticsEnabled: false as const,
    eventBusReady: false as const,
    aiEnabled: false as const,
    persistenceMode: input.persistenceMode ?? "unknown",
    capabilities: {
      modules: true,
      categories: true,
      sections: true,
      actions: true,
      permissions: true,
      registrations: true,
      policies: true,
      capabilityMetadata: true,
      navigations: true,
      shortcuts: true,
      dashboards: true,
      widgets: true,
      metadata: true,
      references: true,
      audit: true,
      history: true,
      diagnostics: true,
      lifecycle: true,
      http: true,
      workbench: false,
      runtimeAdmin: false,
      userManagement: false,
      eventBus: false,
      ai: false,
    },
  };
}

async function requireAdministrationGateway() {
  await assertAdministrationHttpEnabled();
  return getPlatformServiceGateway();
}

function filterModules(
  items: readonly AdministrationModule[],
  query: { status?: AdministrationLifecycleStatus; key?: string },
): AdministrationModule[] {
  return items.filter((item) => {
    if (query.status && item.status !== query.status) return false;
    if (query.key && item.key !== query.key) return false;
    return true;
  });
}

function pageSlice<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export async function handleListAdministrationModules(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(modulesListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.modules.list(context.serviceContext);
  const filtered = filterModules(items, query);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(filtered, limit), context, limit);
}

export async function handleCreateAdministrationModule(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationModuleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.modules.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationModule(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.modules.get(
    context.serviceContext,
    moduleId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationModule(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationModuleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.modules.updateMetadata(
    context.serviceContext,
    { moduleId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeleteAdministrationModule(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.modules.archive(
    context.serviceContext,
    moduleId,
  );
  return jsonDataResponse(
    { archived: true, moduleId, module: result },
    context.tracing,
  );
}

export async function handleArchiveAdministrationModule(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  return handleDeleteAdministrationModule(request, context, routeContext);
}

export async function handleRestoreAdministrationModule(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.modules.restore(
    context.serviceContext,
    moduleId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleTransitionAdministrationModule(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    transitionAdministrationModuleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.modules.transition(
    context.serviceContext,
    { moduleId, to: body.to, reason: body.reason },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListAdministrationModuleAudit(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.audit.list(
    context.serviceContext,
    moduleId,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleListAdministrationModuleHistory(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.history.list(
    context.serviceContext,
    moduleId,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleListAdministrationModuleMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.metadata.list(
    context.serviceContext,
    moduleId,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleListAdministrationModuleReferences(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const moduleId = asAdministrationModuleId(
    await param(routeContext, "moduleId", administrationModuleIdParamSchema),
  );
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.references.list(
    context.serviceContext,
    moduleId,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function handleListAdministrationCategories(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.categories.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationCategory(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationCategoryBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.categories.create(
    context.serviceContext,
    {
      ...body,
      moduleId: body.moduleId
        ? asAdministrationModuleId(body.moduleId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationCategory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const categoryId = asAdministrationCategoryId(
    await param(routeContext, "categoryId", administrationCategoryIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.categories.get(
    context.serviceContext,
    categoryId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationCategory(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const categoryId = asAdministrationCategoryId(
    await param(routeContext, "categoryId", administrationCategoryIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationCategoryBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.categories.update(
    context.serviceContext,
    { categoryId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export async function handleListAdministrationSections(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.sections.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationSection(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationSectionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.sections.create(
    context.serviceContext,
    {
      ...body,
      categoryId: asAdministrationCategoryId(body.categoryId),
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationSection(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const sectionId = asAdministrationSectionId(
    await param(routeContext, "sectionId", administrationSectionIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.sections.get(
    context.serviceContext,
    sectionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationSection(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const sectionId = asAdministrationSectionId(
    await param(routeContext, "sectionId", administrationSectionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationSectionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.sections.update(
    context.serviceContext,
    { sectionId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function handleListAdministrationActions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.actions.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationActionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.actions.create(
    context.serviceContext,
    {
      ...body,
      moduleId: body.moduleId
        ? asAdministrationModuleId(body.moduleId)
        : undefined,
      sectionId: body.sectionId
        ? asAdministrationSectionId(body.sectionId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationAction(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const actionId = asAdministrationActionId(
    await param(routeContext, "actionId", administrationActionIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.actions.get(
    context.serviceContext,
    actionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const actionId = asAdministrationActionId(
    await param(routeContext, "actionId", administrationActionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationActionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.actions.update(
    context.serviceContext,
    { actionId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export async function handleListAdministrationPermissions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.permissions.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationPermission(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationPermissionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.permissions.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationPermission(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const permissionId = asAdministrationPermissionId(
    await param(
      routeContext,
      "permissionId",
      administrationPermissionIdParamSchema,
    ),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.permissions.get(
    context.serviceContext,
    permissionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationPermission(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const permissionId = asAdministrationPermissionId(
    await param(
      routeContext,
      "permissionId",
      administrationPermissionIdParamSchema,
    ),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationPermissionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.permissions.update(
    context.serviceContext,
    { permissionId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

export async function handleListAdministrationRegistrations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.registrations.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationRegistration(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationRegistrationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.registrations.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationRegistration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const registrationId = asAdministrationRegistrationId(
    await param(
      routeContext,
      "registrationId",
      administrationRegistrationIdParamSchema,
    ),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.registrations.get(
    context.serviceContext,
    registrationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationRegistration(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const registrationId = asAdministrationRegistrationId(
    await param(
      routeContext,
      "registrationId",
      administrationRegistrationIdParamSchema,
    ),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationRegistrationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.registrations.update(
    context.serviceContext,
    { registrationId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

export async function handleListAdministrationPolicies(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.policies.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationPolicyBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.policies.create(
    context.serviceContext,
    {
      ...body,
      moduleId: body.moduleId
        ? asAdministrationModuleId(body.moduleId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationPolicy(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const policyId = asAdministrationPolicyId(
    await param(routeContext, "policyId", administrationPolicyIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.policies.get(
    context.serviceContext,
    policyId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const policyId = asAdministrationPolicyId(
    await param(routeContext, "policyId", administrationPolicyIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationPolicyBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.policies.update(
    context.serviceContext,
    { policyId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Capabilities (SoR metadata)
// ---------------------------------------------------------------------------

export async function handleListAdministrationCapabilities(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.capabilities.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationCapability(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationCapabilityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.capabilities.create(
    context.serviceContext,
    {
      ...body,
      moduleId: asAdministrationModuleId(body.moduleId),
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationCapability(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const capabilityId = asAdministrationCapabilityId(
    await param(
      routeContext,
      "capabilityId",
      administrationCapabilityIdParamSchema,
    ),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.capabilities.get(
    context.serviceContext,
    capabilityId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationCapability(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const capabilityId = asAdministrationCapabilityId(
    await param(
      routeContext,
      "capabilityId",
      administrationCapabilityIdParamSchema,
    ),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationCapabilityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.capabilities.update(
    context.serviceContext,
    { capabilityId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Navigations
// ---------------------------------------------------------------------------

export async function handleListAdministrationNavigations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.navigations.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationNavigation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationNavigationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.navigations.create(
    context.serviceContext,
    {
      ...body,
      moduleId: asAdministrationModuleId(body.moduleId),
      categoryId: body.categoryId
        ? asAdministrationCategoryId(body.categoryId)
        : undefined,
      sectionId: body.sectionId
        ? asAdministrationSectionId(body.sectionId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationNavigation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const navigationId = asAdministrationNavigationId(
    await param(
      routeContext,
      "navigationId",
      administrationNavigationIdParamSchema,
    ),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.navigations.get(
    context.serviceContext,
    navigationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationNavigation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const navigationId = asAdministrationNavigationId(
    await param(
      routeContext,
      "navigationId",
      administrationNavigationIdParamSchema,
    ),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationNavigationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.navigations.update(
    context.serviceContext,
    { navigationId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Shortcuts
// ---------------------------------------------------------------------------

export async function handleListAdministrationShortcuts(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.shortcuts.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationShortcut(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationShortcutBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.shortcuts.create(
    context.serviceContext,
    {
      ...body,
      moduleId: body.moduleId
        ? asAdministrationModuleId(body.moduleId)
        : undefined,
      actionId: body.actionId
        ? asAdministrationActionId(body.actionId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationShortcut(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const shortcutId = asAdministrationShortcutId(
    await param(routeContext, "shortcutId", administrationShortcutIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.shortcuts.get(
    context.serviceContext,
    shortcutId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationShortcut(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const shortcutId = asAdministrationShortcutId(
    await param(routeContext, "shortcutId", administrationShortcutIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationShortcutBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.shortcuts.update(
    context.serviceContext,
    { shortcutId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------

export async function handleListAdministrationDashboards(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.dashboards.list(
    context.serviceContext,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationDashboard(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationDashboardBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.dashboards.create(
    context.serviceContext,
    {
      ...body,
      moduleId: body.moduleId
        ? asAdministrationModuleId(body.moduleId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationDashboard(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const dashboardId = asAdministrationDashboardId(
    await param(
      routeContext,
      "dashboardId",
      administrationDashboardIdParamSchema,
    ),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.dashboards.get(
    context.serviceContext,
    dashboardId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationDashboard(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const dashboardId = asAdministrationDashboardId(
    await param(
      routeContext,
      "dashboardId",
      administrationDashboardIdParamSchema,
    ),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationDashboardBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.dashboards.update(
    context.serviceContext,
    { dashboardId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Widgets
// ---------------------------------------------------------------------------

export async function handleListAdministrationWidgets(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const dashboardId = asAdministrationDashboardId(
    await param(
      routeContext,
      "dashboardId",
      administrationDashboardIdParamSchema,
    ),
  );
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.widgets.list(
    context.serviceContext,
    dashboardId,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationWidget(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const dashboardIdFromPath = routeContext
    ? asAdministrationDashboardId(
        await param(
          routeContext,
          "dashboardId",
          administrationDashboardIdParamSchema,
        ),
      )
    : undefined;
  const body = await parseJsonBody(
    request,
    createAdministrationWidgetBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const dashboardId = dashboardIdFromPath
    ?? (body.dashboardId
      ? asAdministrationDashboardId(body.dashboardId)
      : undefined);
  if (!dashboardId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "dashboardId is required",
    });
  }
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.widgets.create(
    context.serviceContext,
    {
      dashboardId,
      key: body.key,
      name: body.name,
      kind: body.kind,
      ordering: body.ordering,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationWidget(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const widgetId = asAdministrationWidgetId(
    await param(routeContext, "widgetId", administrationWidgetIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.widgets.get(
    context.serviceContext,
    widgetId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationWidget(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const widgetId = asAdministrationWidgetId(
    await param(routeContext, "widgetId", administrationWidgetIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationWidgetBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.widgets.update(
    context.serviceContext,
    { widgetId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function handleListAdministrationMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationModuleScopedListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.metadata.list(
    context.serviceContext,
    asAdministrationModuleId(query.moduleId),
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.metadata.create(
    context.serviceContext,
    {
      ...body,
      moduleId: asAdministrationModuleId(body.moduleId),
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationMetadata(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const metadataId = asAdministrationMetadataId(
    await param(routeContext, "metadataId", administrationMetadataIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.metadata.get(
    context.serviceContext,
    metadataId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAdministrationMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const metadataId = asAdministrationMetadataId(
    await param(routeContext, "metadataId", administrationMetadataIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAdministrationMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.metadata.update(
    context.serviceContext,
    { metadataId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

export async function handleListAdministrationReferences(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationModuleScopedListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.references.list(
    context.serviceContext,
    asAdministrationModuleId(query.moduleId),
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAdministrationReference(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAdministrationReferenceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.references.create(
    context.serviceContext,
    {
      ...body,
      moduleId: asAdministrationModuleId(body.moduleId),
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationReference(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const referenceId = asAdministrationReferenceId(
    await param(
      routeContext,
      "referenceId",
      administrationReferenceIdParamSchema,
    ),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.references.get(
    context.serviceContext,
    referenceId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Audit / History
// ---------------------------------------------------------------------------

export async function handleListAdministrationAudit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationAuditListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAdministrationGateway();
  const items = await gateway.administration.audit.list(
    context.serviceContext,
    query.moduleId ? asAdministrationModuleId(query.moduleId) : undefined,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleGetAdministrationAuditEntry(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const auditId = asAdministrationAuditId(
    await param(routeContext, "auditId", administrationAuditIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.audit.get(
    context.serviceContext,
    auditId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const historyId = asAdministrationHistoryId(
    await param(routeContext, "historyId", administrationHistoryIdParamSchema),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.history.get(
    context.serviceContext,
    historyId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Diagnostics / management plane
// ---------------------------------------------------------------------------

export async function handleListAdministrationDiagnostics(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    administrationOptionalModuleListQuerySchema,
    request.nextUrl.searchParams,
  );
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const gateway = await requireAdministrationGateway();
  const [health, readiness, capabilities, items] = await Promise.all([
    gateway.administration.diagnostics.health(context.serviceContext),
    gateway.administration.diagnostics.readiness(context.serviceContext),
    gateway.administration.diagnostics.capabilities(context.serviceContext),
    gateway.administration.diagnostics.list(context.serviceContext),
  ]);
  const limit = resolvePageLimit(query);
  return jsonDataResponse(
    {
      ...buildAdministrationManagementPlaneDto({
        administrationEnabled: bootstrap.administrationEnabled,
        persistenceMode: bootstrap.administrationReadiness?.persistenceMode,
      }),
      health: { ...health, httpEnabled: true, workbenchEnabled: false, runtimeAdminEnabled: false },
      readiness: {
        ...readiness,
        httpEnabled: true,
        workbenchEnabled: false,
        runtimeAdminEnabled: false,
      },
      capabilities: {
        ...capabilities,
        http: true,
        workbench: false,
        runtimeAdmin: false,
      },
      diagnostics: pageSlice(items, limit),
    },
    context.tracing,
  );
}

export async function handleGetAdministrationDiagnostic(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const diagnosticId = asAdministrationDiagnosticId(
    await param(
      routeContext,
      "diagnosticId",
      administrationDiagnosticIdParamSchema,
    ),
  );
  const gateway = await requireAdministrationGateway();
  const result = await gateway.administration.diagnostics.get(
    context.serviceContext,
    diagnosticId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAdministrationHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireAdministrationGateway();
  const health = await gateway.administration.diagnostics.health(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...health,
      httpEnabled: true,
      workbenchEnabled: false,
      runtimeAdminEnabled: false,
    },
    context.tracing,
  );
}

export async function handleGetAdministrationReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireAdministrationGateway();
  const readiness = await gateway.administration.diagnostics.readiness(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...readiness,
      httpEnabled: true,
      workbenchEnabled: false,
      runtimeAdminEnabled: false,
    },
    context.tracing,
  );
}

export async function handleGetAdministrationManagementCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const gateway = await requireAdministrationGateway();
  const caps = await gateway.administration.diagnostics.capabilities(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...buildAdministrationManagementPlaneDto({
        administrationEnabled: bootstrap.administrationEnabled,
        persistenceMode: bootstrap.administrationReadiness?.persistenceMode,
      }),
      gatewayCapabilities: {
        ...caps,
        http: true,
        workbench: false,
        runtimeAdmin: false,
      },
    },
    context.tracing,
  );
}

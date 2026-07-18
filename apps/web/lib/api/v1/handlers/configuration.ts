/**
 * Platform Configuration HTTP handlers (APZCONFIG-003) — presentation only.
 * Call PlatformServiceGateway.configuration.* exclusively — never configuration-core/persistence.
 * Management plane only — no runtime apply, secrets, env injection, or feature flags.
 */

import {
  asConfigurationAuditId,
  asConfigurationGroupId,
  asConfigurationId,
  asConfigurationKeyId,
  asConfigurationNamespaceId,
  asConfigurationOverrideId,
  asConfigurationReferenceId,
  asConfigurationVersionId,
  type Configuration,
  type ConfigurationLifecycleStatus,
} from "@apzhub/configuration-contracts";
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
  configurationAuditIdParamSchema,
  configurationAuditListQuerySchema,
  configurationGroupIdParamSchema,
  configurationIdParamSchema,
  configurationNamespaceIdParamSchema,
  configurationOverrideIdParamSchema,
  configurationReferenceIdParamSchema,
  configurationScopeIdParamSchema,
  configurationVersionIdParamSchema,
  configurationsListQuerySchema,
  createConfigurationBodySchema,
  createConfigurationGroupBodySchema,
  createConfigurationNamespaceBodySchema,
  createConfigurationOverrideBodySchema,
  createConfigurationVersionBodySchema,
  overridesListQuerySchema,
  transitionConfigurationBodySchema,
  updateConfigurationBodySchema,
  updateConfigurationGroupBodySchema,
  updateConfigurationNamespaceBodySchema,
  updateConfigurationOverrideBodySchema,
  validateConfigurationMetadataBodySchema,
} from "../schemas/configuration";

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

export async function assertConfigurationHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.configurationEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "CONFIGURATION_SERVICE_UNAVAILABLE",
      message:
        "Configuration Platform HTTP API is not enabled (APZHUB_CONFIGURATION_ENABLED).",
    });
  }
}

export function buildConfigurationManagementPlaneDto(input: {
  readonly configurationEnabled: boolean;
  readonly persistenceMode?: "postgres" | "memory" | "unknown";
}) {
  return {
    configurationEnabled: input.configurationEnabled,
    managementPlaneReady: input.configurationEnabled,
    persistenceReady: input.configurationEnabled,
    configurationCoreReady: input.configurationEnabled,
    gatewayRegistered: input.configurationEnabled,
    requestPipelineReady: input.configurationEnabled,
    authorizationReady: input.configurationEnabled,
    validationReady: input.configurationEnabled,
    versioningReady: input.configurationEnabled,
    hierarchyMetadataReady: input.configurationEnabled,
    runtimeResolutionReady: false as const,
    runtimeApplicationReady: false as const,
    featureFlagsReady: false as const,
    secretManagementReady: false as const,
    hotReloadReady: false as const,
    eventBusReady: false as const,
    persistenceMode: input.persistenceMode ?? "unknown",
    capabilities: {
      metadataCrud: true,
      lifecycle: true,
      namespaces: true,
      groups: true,
      versions: true,
      overrides: true,
      scopes: true,
      validation: true,
      references: true,
      audit: true,
      diagnostics: true,
      runtimeResolution: false,
      runtimeApplication: false,
      featureFlags: false,
      secrets: false,
      hotReload: false,
      eventBus: false,
    },
  };
}

async function requireConfigurationGateway() {
  await assertConfigurationHttpEnabled();
  return getPlatformServiceGateway();
}

function filterConfigurations(
  items: readonly Configuration[],
  query: {
    status?: ConfigurationLifecycleStatus;
    namespaceId?: string;
    groupId?: string;
    hierarchyLevel?: string;
    scopeKind?: string;
  },
): Configuration[] {
  return items.filter((item) => {
    if (query.status && item.status !== query.status) return false;
    if (query.namespaceId && item.namespaceId !== query.namespaceId) return false;
    if (query.groupId && item.groupId !== query.groupId) return false;
    if (query.hierarchyLevel && item.hierarchyLevel !== query.hierarchyLevel) {
      return false;
    }
    if (query.scopeKind && item.scope.kind !== query.scopeKind) return false;
    return true;
  });
}

function pageSlice<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Configurations
// ---------------------------------------------------------------------------

export async function handleListConfigurations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(configurationsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.configurations.list(context.serviceContext);
  const filtered = filterConfigurations(items, query);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(filtered, limit), context, limit);
}

export async function handleCreateConfiguration(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createConfigurationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.configurations.create(
    context.serviceContext,
    {
      ...body,
      inheritsFromConfigurationId: body.inheritsFromConfigurationId
        ? asConfigurationId(body.inheritsFromConfigurationId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.configurations.get(
    context.serviceContext,
    configurationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateConfiguration(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateConfigurationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const existing = await gateway.configuration.configurations.get(
    context.serviceContext,
    configurationId,
  );
  if (body.revision !== undefined && body.revision !== existing.revision) {
    throw new PlatformApiHttpError(409, {
      code: "REVISION_CONFLICT",
      message: "Configuration revision conflict",
    });
  }
  const result = await gateway.configuration.configurations.updateMetadata(
    context.serviceContext,
    {
      configurationId,
      hierarchyLevel: body.hierarchyLevel,
      scope: body.scope,
      inheritsFromConfigurationId: body.inheritsFromConfigurationId
        ? asConfigurationId(body.inheritsFromConfigurationId)
        : undefined,
      organisationId: body.organisationId,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeleteConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.configurations.archive(
    context.serviceContext,
    configurationId,
  );
  return jsonDataResponse(
    { archived: true, configurationId, configuration: result },
    context.tracing,
  );
}

export async function handleArchiveConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  return handleDeleteConfiguration(_request, context, routeContext);
}

export async function handleRestoreConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.configurations.restore(
    context.serviceContext,
    configurationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleTransitionConfiguration(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    transitionConfigurationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.configurations.transition(
    context.serviceContext,
    { configurationId, to: body.to, reason: body.reason },
  );
  return jsonDataResponse(result, context.tracing);
}

async function lifecycleShortcut(
  configurationId: ReturnType<typeof asConfigurationId>,
  to: ConfigurationLifecycleStatus,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.configurations.transition(
    context.serviceContext,
    { configurationId, to },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleApproveConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  return lifecycleShortcut(configurationId, "approved", context);
}

export async function handlePublishConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  return lifecycleShortcut(configurationId, "published", context);
}

export async function handleDeprecateConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  return lifecycleShortcut(configurationId, "deprecated", context);
}

export async function handleValidateConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const configuration = await gateway.configuration.configurations.get(
    context.serviceContext,
    configurationId,
  );
  const result = await gateway.configuration.validation.validateMetadata(
    context.serviceContext,
    configuration,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Namespaces
// ---------------------------------------------------------------------------

export async function handleListConfigurationNamespaces(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.namespaces.list(context.serviceContext);
  return collection(items, context);
}

export async function handleCreateConfigurationNamespace(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createConfigurationNamespaceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.namespaces.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetConfigurationNamespace(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const namespaceId = asConfigurationNamespaceId(
    await param(routeContext, "namespaceId", configurationNamespaceIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.namespaces.get(
    context.serviceContext,
    namespaceId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateConfigurationNamespace(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const namespaceId = asConfigurationNamespaceId(
    await param(routeContext, "namespaceId", configurationNamespaceIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateConfigurationNamespaceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.namespaces.update(context.serviceContext, {
    namespaceId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export async function handleListConfigurationGroups(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.groups.list(context.serviceContext);
  return collection(items, context);
}

export async function handleCreateConfigurationGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createConfigurationGroupBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.groups.create(context.serviceContext, {
    ...body,
    namespaceId: asConfigurationNamespaceId(body.namespaceId),
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetConfigurationGroup(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const groupId = asConfigurationGroupId(
    await param(routeContext, "groupId", configurationGroupIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.groups.get(
    context.serviceContext,
    groupId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateConfigurationGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const groupId = asConfigurationGroupId(
    await param(routeContext, "groupId", configurationGroupIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateConfigurationGroupBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.groups.update(context.serviceContext, {
    groupId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

export async function handleListConfigurationVersions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.versions.list(
    context.serviceContext,
    configurationId,
  );
  return collection(items, context);
}

export async function handleCreateConfigurationVersion(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    createConfigurationVersionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.versions.create(context.serviceContext, {
    configurationId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetConfigurationVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const versionId = asConfigurationVersionId(
    await param(routeContext, "versionId", configurationVersionIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.versions.get(
    context.serviceContext,
    versionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handlePublishConfigurationVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const versionId = asConfigurationVersionId(
    await param(routeContext, "versionId", configurationVersionIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.versions.publish(
    context.serviceContext,
    versionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeprecateConfigurationVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const versionId = asConfigurationVersionId(
    await param(routeContext, "versionId", configurationVersionIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.versions.deprecate(
    context.serviceContext,
    versionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleValidateConfigurationVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  return handleValidateConfiguration(_request, context, {
    params: Promise.resolve({ configurationId }),
  });
}

// ---------------------------------------------------------------------------
// Overrides
// ---------------------------------------------------------------------------

export async function handleListConfigurationOverrides(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(overridesListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.overrides.list(
    context.serviceContext,
    asConfigurationId(query.configurationId),
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateConfigurationOverride(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createConfigurationOverrideBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.overrides.create(context.serviceContext, {
    ...body,
    configurationId: asConfigurationId(body.configurationId),
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetConfigurationOverride(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const overrideId = asConfigurationOverrideId(
    await param(routeContext, "overrideId", configurationOverrideIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.overrides.get(
    context.serviceContext,
    overrideId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateConfigurationOverride(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const overrideId = asConfigurationOverrideId(
    await param(routeContext, "overrideId", configurationOverrideIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateConfigurationOverrideBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.overrides.update(context.serviceContext, {
    overrideId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Scopes
// ---------------------------------------------------------------------------

export async function handleListConfigurationScopes(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.scopes.list(context.serviceContext);
  return collection(items, context);
}

export async function handleGetConfigurationScope(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const scopeId = asConfigurationId(
    await param(routeContext, "scopeId", configurationScopeIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.scopes.get(
    context.serviceContext,
    scopeId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export async function handleValidateConfigurationMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    validateConfigurationMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireConfigurationGateway();
  const now = new Date().toISOString();
  const configuration = {
    id: asConfigurationId("cfg_preview_validate"),
    tenantId: context.serviceContext.tenantId,
    organisationId: body.organisationId ?? context.serviceContext.organisationId,
    namespaceId: asConfigurationNamespaceId(body.namespaceId ?? "ns_preview"),
    groupId: body.groupId ? asConfigurationGroupId(body.groupId) : undefined,
    keyId: asConfigurationKeyId("key_preview"),
    hierarchyLevel: body.hierarchyLevel,
    scope: body.scope,
    status: body.status ?? "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: context.serviceContext.userId,
    updatedBy: context.serviceContext.userId,
    revision: 1,
  } satisfies Configuration;
  const result = await gateway.configuration.validation.validateMetadata(
    context.serviceContext,
    configuration,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListConfigurationValidationRules(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.validation.listRules(
    context.serviceContext,
  );
  return collection(items, context);
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

export async function handleListConfigurationReferences(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.references.list(
    context.serviceContext,
    configurationId,
  );
  return collection(items, context);
}

export async function handleGetConfigurationReference(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const referenceId = asConfigurationReferenceId(
    await param(routeContext, "referenceId", configurationReferenceIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.references.get(
    context.serviceContext,
    referenceId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export async function handleListConfigurationAudit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    configurationAuditListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.audit.list(
    context.serviceContext,
    query.configurationId ? asConfigurationId(query.configurationId) : undefined,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleGetConfigurationAuditEntry(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const auditId = asConfigurationAuditId(
    await param(routeContext, "auditId", configurationAuditIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const result = await gateway.configuration.audit.get(context.serviceContext, auditId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListConfigurationScopedAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = asConfigurationId(
    await param(routeContext, "configurationId", configurationIdParamSchema),
  );
  const gateway = await requireConfigurationGateway();
  const items = await gateway.configuration.audit.list(
    context.serviceContext,
    configurationId,
  );
  return collection(items, context);
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export async function handleGetConfigurationCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const gateway = await requireConfigurationGateway();
  const caps = await gateway.configuration.diagnostics.capabilities(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...buildConfigurationManagementPlaneDto({
        configurationEnabled: bootstrap.configurationEnabled,
        persistenceMode: bootstrap.configurationReadiness?.persistenceMode,
      }),
      gatewayCapabilities: caps,
    },
    context.tracing,
  );
}

export async function handleGetConfigurationHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireConfigurationGateway();
  const health = await gateway.configuration.diagnostics.health(context.serviceContext);
  return jsonDataResponse(health, context.tracing);
}

export async function handleGetConfigurationReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireConfigurationGateway();
  const readiness = await gateway.configuration.diagnostics.readiness(
    context.serviceContext,
  );
  return jsonDataResponse(readiness, context.tracing);
}

export async function handleGetConfigurationDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const gateway = await requireConfigurationGateway();
  const [health, readiness, capabilities] = await Promise.all([
    gateway.configuration.diagnostics.health(context.serviceContext),
    gateway.configuration.diagnostics.readiness(context.serviceContext),
    gateway.configuration.diagnostics.capabilities(context.serviceContext),
  ]);
  return jsonDataResponse(
    {
      ...buildConfigurationManagementPlaneDto({
        configurationEnabled: bootstrap.configurationEnabled,
        persistenceMode: bootstrap.configurationReadiness?.persistenceMode,
      }),
      health,
      readiness,
      capabilities,
    },
    context.tracing,
  );
}

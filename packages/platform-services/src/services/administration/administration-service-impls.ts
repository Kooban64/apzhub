/**
 * Administration Platform Services — thin gateway facets (APZADMIN-002).
 * Business logic remains in @apzhub/admin-core.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  AdministrationPlatformGateway,
  AdministrationRequestContext,
} from "@apzhub/admin-contracts";
import {
  AdministrationDomainError,
  type PlatformAdministrationDomainService,
} from "@apzhub/admin-core";

function toAdminCtx(ctx: ServiceRequestContext): AdministrationRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export function mapAdministrationDomainError(
  error: AdministrationDomainError,
  correlationId: string,
): PlatformServiceError {
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    error.code === "validation_error" ||
    error.code === "missing_repos" ||
    error.code === "missing_repository" ||
    error.code === "invalid_module_key" ||
    error.code === "invalid_capability_key" ||
    error.code === "invalid_capability_owner" ||
    error.code === "invalid_capability_version" ||
    error.code === "invalid_production_ready" ||
    error.code === "invalid_navigation" ||
    error.code === "invalid_navigation_visibility" ||
    error.code === "invalid_navigation_ordering" ||
    error.code === "invalid_tenant" ||
    error.code === "secret_metadata_forbidden"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (error.code === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (error.code === "duplicate" || error.code === "conflict") {
    category = "conflict";
    code = "CONFLICT";
  } else if (error.code === "invalid_lifecycle_transition") {
    category = "business_rule";
    code = "BUSINESS_RULE_VIOLATION";
  } else if (error.code === "forbidden") {
    category = "authorization";
    code = "FORBIDDEN";
  }

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: false,
    details: {
      classification: error.code,
      ...(error.details ?? {}),
    },
  });
}

function mapUnknownError(
  error: unknown,
  correlationId: string,
): PlatformServiceError {
  if (isPlatformServiceError(error)) return error;
  if (error instanceof AdministrationDomainError) {
    return mapAdministrationDomainError(error, correlationId);
  }
  const message =
    error instanceof Error
      ? error.message
      : "Unexpected administration service error";
  if (
    /drizzle|postgres|pg_|relation |"platform_administration|ECONNREFUSED|tenant_mismatch/i.test(
      message,
    )
  ) {
    return new PlatformServiceError({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
      message: "Administration persistence operation failed",
      correlationId,
      retryable: true,
    });
  }
  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Unexpected administration service error",
    correlationId,
    retryable: false,
  });
}

async function withAdministrationErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    throw mapUnknownError(error, ctx.correlationId);
  }
}

export type AdministrationPlatformServiceImpls = AdministrationPlatformGateway;

export function createAdministrationPlatformServiceImpls(input: {
  readonly domain: PlatformAdministrationDomainService;
}): AdministrationPlatformServiceImpls {
  const domain = input.domain;

  return {
    modules: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listModules(toAdminCtx(ctx)),
        ),
      get: (ctx, moduleId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getModule(toAdminCtx(ctx), moduleId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createModule(toAdminCtx(ctx), createInput),
        ),
      updateMetadata: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateModuleMetadata(toAdminCtx(ctx), updateInput),
        ),
      archive: (ctx, moduleId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.archiveModule(toAdminCtx(ctx), moduleId),
        ),
      restore: (ctx, moduleId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.restoreModule(toAdminCtx(ctx), moduleId),
        ),
      transition: (ctx, transitionInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.transitionLifecycle(toAdminCtx(ctx), transitionInput),
        ),
    },
    categories: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listCategories(toAdminCtx(ctx)),
        ),
      get: (ctx, categoryId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getCategory(toAdminCtx(ctx), categoryId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createCategory(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateCategory(toAdminCtx(ctx), updateInput),
        ),
    },
    sections: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listSections(toAdminCtx(ctx)),
        ),
      get: (ctx, sectionId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getSection(toAdminCtx(ctx), sectionId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createSection(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateSection(toAdminCtx(ctx), updateInput),
        ),
    },
    actions: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listActions(toAdminCtx(ctx)),
        ),
      get: (ctx, actionId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getAction(toAdminCtx(ctx), actionId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createAction(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateAction(toAdminCtx(ctx), updateInput),
        ),
    },
    permissions: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listPermissions(toAdminCtx(ctx)),
        ),
      get: (ctx, permissionId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getPermission(toAdminCtx(ctx), permissionId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createPermission(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updatePermission(toAdminCtx(ctx), updateInput),
        ),
    },
    audit: {
      list: (ctx, moduleId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listAudit(toAdminCtx(ctx), moduleId),
        ),
      get: (ctx, auditId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getAudit(toAdminCtx(ctx), auditId),
        ),
    },
    history: {
      list: (ctx, moduleId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listHistory(toAdminCtx(ctx), moduleId),
        ),
      get: (ctx, historyId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getHistory(toAdminCtx(ctx), historyId),
        ),
    },
    diagnostics: {
      health: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.diagnosticsHealth(toAdminCtx(ctx)),
        ),
      readiness: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.diagnosticsReadiness(toAdminCtx(ctx)),
        ),
      capabilities: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.diagnosticsCapabilities(toAdminCtx(ctx)),
        ),
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listDiagnostics(toAdminCtx(ctx)),
        ),
      get: (ctx, diagnosticId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getDiagnostic(toAdminCtx(ctx), diagnosticId),
        ),
    },
    registrations: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listRegistrations(toAdminCtx(ctx)),
        ),
      get: (ctx, registrationId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getRegistration(toAdminCtx(ctx), registrationId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createRegistration(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateRegistration(toAdminCtx(ctx), updateInput),
        ),
    },
    metadata: {
      list: (ctx, moduleId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listMetadata(toAdminCtx(ctx), moduleId),
        ),
      get: (ctx, metadataId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getMetadata(toAdminCtx(ctx), metadataId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createMetadata(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateMetadata(toAdminCtx(ctx), updateInput),
        ),
    },
    policies: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listPolicies(toAdminCtx(ctx)),
        ),
      get: (ctx, policyId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getPolicy(toAdminCtx(ctx), policyId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createPolicy(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updatePolicy(toAdminCtx(ctx), updateInput),
        ),
    },
    references: {
      list: (ctx, moduleId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listReferences(toAdminCtx(ctx), moduleId),
        ),
      get: (ctx, referenceId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getReference(toAdminCtx(ctx), referenceId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createReference(toAdminCtx(ctx), createInput),
        ),
    },
    capabilities: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listCapabilities(toAdminCtx(ctx)),
        ),
      get: (ctx, capabilityId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getCapability(toAdminCtx(ctx), capabilityId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createCapability(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateCapability(toAdminCtx(ctx), updateInput),
        ),
    },
    navigations: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listNavigations(toAdminCtx(ctx)),
        ),
      get: (ctx, navigationId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getNavigation(toAdminCtx(ctx), navigationId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createNavigation(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateNavigation(toAdminCtx(ctx), updateInput),
        ),
    },
    shortcuts: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listShortcuts(toAdminCtx(ctx)),
        ),
      get: (ctx, shortcutId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getShortcut(toAdminCtx(ctx), shortcutId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createShortcut(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateShortcut(toAdminCtx(ctx), updateInput),
        ),
    },
    dashboards: {
      list: (ctx) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listDashboards(toAdminCtx(ctx)),
        ),
      get: (ctx, dashboardId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getDashboard(toAdminCtx(ctx), dashboardId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createDashboard(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateDashboard(toAdminCtx(ctx), updateInput),
        ),
    },
    widgets: {
      list: (ctx, dashboardId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.listWidgets(toAdminCtx(ctx), dashboardId),
        ),
      get: (ctx, widgetId) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.getWidget(toAdminCtx(ctx), widgetId),
        ),
      create: (ctx, createInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.createWidget(toAdminCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withAdministrationErrorMapping(ctx, () =>
          domain.updateWidget(toAdminCtx(ctx), updateInput),
        ),
    },
  };
}

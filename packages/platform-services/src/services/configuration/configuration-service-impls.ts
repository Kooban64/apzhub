/**
 * Configuration Platform Services — thin gateway facets (APZCONFIG-002).
 * Business logic remains in @apzhub/configuration-core.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type { ConfigurationPlatformGateway } from "@apzhub/configuration-contracts";
import type { ConfigurationRequestContext } from "@apzhub/configuration-contracts";
import {
  ConfigurationDomainError,
  type PlatformConfigurationDomainService,
} from "@apzhub/configuration-core";

function toConfigurationCtx(
  ctx: ServiceRequestContext,
): ConfigurationRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export function mapConfigurationDomainError(
  error: ConfigurationDomainError,
  correlationId: string,
): PlatformServiceError {
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    error.code === "validation_error" ||
    error.code === "missing_repos" ||
    error.code === "missing_repository" ||
    error.code === "invalid_key" ||
    error.code === "invalid_value_kind" ||
    error.code === "invalid_tenant" ||
    error.code === "secret_payload_forbidden"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (error.code === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (error.code === "duplicate" || error.code === "conflict") {
    category = "conflict";
    code = "CONFLICT";
  } else if (
    error.code === "invalid_lifecycle_transition" ||
    error.code === "version_not_immutable" ||
    error.code === "rollback_source_mutable"
  ) {
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
  if (error instanceof ConfigurationDomainError) {
    return mapConfigurationDomainError(error, correlationId);
  }
  const message =
    error instanceof Error
      ? error.message
      : "Unexpected configuration service error";
  if (
    /drizzle|postgres|pg_|relation |"platform_configuration|ECONNREFUSED|tenant_mismatch/i.test(
      message,
    )
  ) {
    return new PlatformServiceError({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
      message: "Configuration persistence operation failed",
      correlationId,
      retryable: true,
    });
  }
  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Unexpected configuration service error",
    correlationId,
    retryable: false,
  });
}

async function withConfigurationErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    throw mapUnknownError(error, ctx.correlationId);
  }
}

export type ConfigurationPlatformServiceImpls = ConfigurationPlatformGateway;

export function createConfigurationPlatformServiceImpls(input: {
  readonly domain: PlatformConfigurationDomainService;
}): ConfigurationPlatformServiceImpls {
  const domain = input.domain;

  return {
    configurations: {
      list: (ctx) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listConfigurations(toConfigurationCtx(ctx)),
        ),
      get: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getConfiguration(toConfigurationCtx(ctx), configurationId),
        ),
      create: (ctx, createInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.createConfiguration(toConfigurationCtx(ctx), createInput),
        ),
      updateMetadata: (ctx, updateInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.updateConfigurationMetadata(
            toConfigurationCtx(ctx),
            updateInput,
          ),
        ),
      archive: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.archiveConfiguration(toConfigurationCtx(ctx), configurationId),
        ),
      restore: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.restoreConfiguration(toConfigurationCtx(ctx), configurationId),
        ),
      transition: (ctx, transitionInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.transitionLifecycle(toConfigurationCtx(ctx), transitionInput),
        ),
    },
    namespaces: {
      list: (ctx) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listNamespaces(toConfigurationCtx(ctx)),
        ),
      get: (ctx, namespaceId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getNamespace(toConfigurationCtx(ctx), namespaceId),
        ),
      create: (ctx, createInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.createNamespace(toConfigurationCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.updateNamespace(toConfigurationCtx(ctx), updateInput),
        ),
    },
    groups: {
      list: (ctx) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listGroups(toConfigurationCtx(ctx)),
        ),
      get: (ctx, groupId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getGroup(toConfigurationCtx(ctx), groupId),
        ),
      create: (ctx, createInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.createGroup(toConfigurationCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.updateGroup(toConfigurationCtx(ctx), updateInput),
        ),
    },
    versions: {
      list: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listVersions(toConfigurationCtx(ctx), configurationId),
        ),
      get: (ctx, versionId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getVersion(toConfigurationCtx(ctx), versionId),
        ),
      create: (ctx, createInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.createVersion(toConfigurationCtx(ctx), createInput),
        ),
      publish: (ctx, versionId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.publishVersion(toConfigurationCtx(ctx), versionId),
        ),
      deprecate: (ctx, versionId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.deprecateVersion(toConfigurationCtx(ctx), versionId),
        ),
    },
    overrides: {
      list: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listOverrides(toConfigurationCtx(ctx), configurationId),
        ),
      get: (ctx, overrideId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getOverride(toConfigurationCtx(ctx), overrideId),
        ),
      create: (ctx, createInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.createOverride(toConfigurationCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.updateOverride(toConfigurationCtx(ctx), updateInput),
        ),
    },
    scopes: {
      list: (ctx) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listScopes(toConfigurationCtx(ctx)),
        ),
      get: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getScope(toConfigurationCtx(ctx), configurationId),
        ),
    },
    validation: {
      validateMetadata: (ctx, configuration) =>
        withConfigurationErrorMapping(ctx, async () =>
          domain.validateConfigurationMetadata(configuration),
        ),
      listRules: (ctx) =>
        withConfigurationErrorMapping(ctx, async () =>
          domain.listValidationRules(),
        ),
    },
    references: {
      list: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listReferences(toConfigurationCtx(ctx), configurationId),
        ),
      get: (ctx, referenceId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getReference(toConfigurationCtx(ctx), referenceId),
        ),
    },
    audit: {
      list: (ctx, configurationId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.listAudit(toConfigurationCtx(ctx), configurationId),
        ),
      get: (ctx, auditId) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.getAudit(toConfigurationCtx(ctx), auditId),
        ),
    },
    diagnostics: {
      health: (ctx) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.diagnosticsHealth(toConfigurationCtx(ctx)),
        ),
      readiness: (ctx) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.diagnosticsReadiness(toConfigurationCtx(ctx)),
        ),
      capabilities: (ctx) =>
        withConfigurationErrorMapping(ctx, () =>
          domain.diagnosticsCapabilities(toConfigurationCtx(ctx)),
        ),
    },
  };
}

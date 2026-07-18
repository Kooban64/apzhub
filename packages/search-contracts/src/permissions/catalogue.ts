/**
 * Platform Search permissions (APZSEARCH-003 / APZSEARCH-006).
 * Additive — legacy coarse keys remain stable; granular keys enable fine-grained authz.
 */

export const PLATFORM_SEARCH_PERMISSIONS = [
  // Legacy / coarse (APZSEARCH-001)
  "search.execute",
  "search.list",
  "search.read",
  "search.query",
  "search.provider",
  "search.diagnostics",
  "search.configuration",
  "search.audit",
  "search.*",
  // Provider granular
  "search.provider.list",
  "search.provider.read",
  "search.provider.register",
  "search.provider.update",
  "search.provider.enable",
  "search.provider.disable",
  "search.provider.activate",
  "search.provider.unregister",
  "search.provider.health",
  "search.provider.diagnostics",
  // Configuration granular
  "search.configuration.list",
  "search.configuration.read",
  "search.configuration.create",
  "search.configuration.update",
  "search.configuration.version",
  "search.configuration.activate",
  "search.configuration.validate",
  "search.configuration.archive",
  // Collection granular
  "search.collection.list",
  "search.collection.read",
  "search.collection.create",
  "search.collection.update",
  "search.collection.enable",
  "search.collection.disable",
  "search.collection.archive",
  // Source granular
  "search.source.list",
  "search.source.read",
  "search.source.create",
  "search.source.update",
  "search.source.enable",
  "search.source.disable",
  "search.source.archive",
  // Scope granular
  "search.scope.list",
  "search.scope.read",
  "search.scope.create",
  "search.scope.update",
  "search.scope.archive",
  // Profile granular
  "search.profile.list",
  "search.profile.read",
  "search.profile.create",
  "search.profile.update",
  "search.profile.archive",
  "search.profile.validate",
  // Metadata granular
  "search.metadata.list",
  "search.metadata.read",
  "search.metadata.create",
  "search.metadata.update",
  "search.metadata.archive",
  // Cross-cutting read / execute
  "search.capabilities.read",
  "search.health.read",
  "search.diagnostics.read",
  "search.statistics.read",
  "search.validation.execute",
  // Execution query granular (APZSEARCH-006)
  "search.query.execute",
  "search.query.validate",
  "search.query.facets",
  "search.query.highlights",
  "search.query.select-provider",
  // Index lifecycle granular
  "search.index.list",
  "search.index.read",
  "search.index.create",
  "search.index.update",
  "search.index.delete",
  // Document indexing granular
  "search.document.list",
  "search.document.read",
  "search.document.upsert",
  "search.document.delete",
  // Execution plane health / diagnostics / statistics
  "search.execution.health",
  "search.execution.diagnostics",
  "search.execution.statistics",
] as const;

export type PlatformSearchPermission = (typeof PLATFORM_SEARCH_PERMISSIONS)[number];

/** Wildcard namespace for role grants (not a security bypass). */
export const PLATFORM_SEARCH_PERMISSION_WILDCARD = "search.*" as const;

export function isPlatformSearchPermission(value: string): boolean {
  return (PLATFORM_SEARCH_PERMISSIONS as readonly string[]).includes(value);
}

function hasWildcard(permissions: readonly string[]): boolean {
  return permissions.includes("search.*");
}

function hasAnyPrefix(permissions: readonly string[], prefix: string): boolean {
  return permissions.some((p) => p === prefix || p.startsWith(`${prefix}.`));
}

export function hasSearchQueryPermission(permissions: readonly string[]): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.query") ||
    permissions.includes("search.execute") ||
    permissions.includes("search.read") ||
    permissions.includes("search.query.execute") ||
    permissions.includes("search.validation.execute")
  );
}

export type SearchQueryPermissionOp =
  "execute" | "validate" | "facets" | "highlights" | "select-provider";

export function hasSearchQueryOpPermission(
  permissions: readonly string[],
  op: SearchQueryPermissionOp,
): boolean {
  if (hasWildcard(permissions) || permissions.includes("search.query")) {
    return true;
  }
  if (op === "execute") {
    return (
      permissions.includes("search.query.execute") ||
      permissions.includes("search.execute") ||
      permissions.includes("search.read")
    );
  }
  if (op === "validate") {
    return (
      permissions.includes("search.query.validate") ||
      permissions.includes("search.validation.execute") ||
      hasSearchQueryPermission(permissions)
    );
  }
  return permissions.includes(`search.query.${op}`);
}

export type SearchIndexPermissionOp = "list" | "read" | "create" | "update" | "delete";

export function hasSearchIndexPermission(
  permissions: readonly string[],
  op?: SearchIndexPermissionOp,
): boolean {
  if (hasWildcard(permissions)) return true;
  if (op) {
    return permissions.includes(`search.index.${op}`);
  }
  return hasAnyPrefix(permissions, "search.index");
}

export type SearchDocumentPermissionOp = "list" | "read" | "upsert" | "delete";

export function hasSearchDocumentPermission(
  permissions: readonly string[],
  op?: SearchDocumentPermissionOp,
): boolean {
  if (hasWildcard(permissions)) return true;
  if (op) {
    return permissions.includes(`search.document.${op}`);
  }
  return hasAnyPrefix(permissions, "search.document");
}

export function hasSearchExecutionHealthPermission(
  permissions: readonly string[],
): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.execution.health") ||
    permissions.includes("search.health.read") ||
    hasSearchDiagnosticsPermission(permissions)
  );
}

export function hasSearchExecutionDiagnosticsPermission(
  permissions: readonly string[],
): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.execution.diagnostics") ||
    permissions.includes("search.diagnostics.read") ||
    hasSearchDiagnosticsPermission(permissions)
  );
}

export function hasSearchExecutionStatisticsPermission(
  permissions: readonly string[],
): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.execution.statistics") ||
    permissions.includes("search.statistics.read") ||
    hasSearchDiagnosticsPermission(permissions)
  );
}

export type SearchProviderPermissionOp =
  | "list"
  | "read"
  | "register"
  | "update"
  | "enable"
  | "disable"
  | "activate"
  | "unregister"
  | "health"
  | "diagnostics";

/** Coarse `search.provider` grants all provider ops; granular keys work too. */
export function hasSearchProviderPermission(
  permissions: readonly string[],
  op?: SearchProviderPermissionOp,
): boolean {
  if (hasWildcard(permissions) || permissions.includes("search.provider")) {
    return true;
  }
  if (op) {
    return permissions.includes(`search.provider.${op}`);
  }
  return hasAnyPrefix(permissions, "search.provider");
}

export type SearchConfigurationPermissionOp =
  | "list"
  | "read"
  | "create"
  | "update"
  | "version"
  | "activate"
  | "validate"
  | "archive";

export function hasSearchConfigurationPermission(
  permissions: readonly string[],
  op?: SearchConfigurationPermissionOp,
): boolean {
  if (hasWildcard(permissions) || permissions.includes("search.configuration")) {
    return true;
  }
  if (op) {
    return permissions.includes(`search.configuration.${op}`);
  }
  return hasAnyPrefix(permissions, "search.configuration");
}

export function hasSearchDiagnosticsPermission(
  permissions: readonly string[],
): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.diagnostics") ||
    permissions.includes("search.diagnostics.read") ||
    permissions.includes("search.health.read") ||
    permissions.includes("search.statistics.read")
  );
}

export function hasSearchAuditPermission(permissions: readonly string[]): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.audit") ||
    permissions.includes("search.read")
  );
}

export type SearchCollectionPermissionOp =
  "list" | "read" | "create" | "update" | "enable" | "disable" | "archive";

export function hasSearchCollectionPermission(
  permissions: readonly string[],
  op?: SearchCollectionPermissionOp,
): boolean {
  if (hasWildcard(permissions)) return true;
  if (op) {
    return permissions.includes(`search.collection.${op}`);
  }
  return hasAnyPrefix(permissions, "search.collection");
}

export type SearchSourcePermissionOp =
  "list" | "read" | "create" | "update" | "enable" | "disable" | "archive";

export function hasSearchSourcePermission(
  permissions: readonly string[],
  op?: SearchSourcePermissionOp,
): boolean {
  if (hasWildcard(permissions)) return true;
  if (op) {
    return permissions.includes(`search.source.${op}`);
  }
  return hasAnyPrefix(permissions, "search.source");
}

export type SearchScopePermissionOp = "list" | "read" | "create" | "update" | "archive";

export function hasSearchScopePermission(
  permissions: readonly string[],
  op?: SearchScopePermissionOp,
): boolean {
  if (hasWildcard(permissions)) return true;
  if (op) {
    return permissions.includes(`search.scope.${op}`);
  }
  return hasAnyPrefix(permissions, "search.scope");
}

export type SearchProfilePermissionOp =
  "list" | "read" | "create" | "update" | "archive" | "validate";

export function hasSearchProfilePermission(
  permissions: readonly string[],
  op?: SearchProfilePermissionOp,
): boolean {
  if (hasWildcard(permissions)) return true;
  if (op) {
    return permissions.includes(`search.profile.${op}`);
  }
  return hasAnyPrefix(permissions, "search.profile");
}

export type SearchMetadataPermissionOp =
  "list" | "read" | "create" | "update" | "archive";

export function hasSearchMetadataPermission(
  permissions: readonly string[],
  op?: SearchMetadataPermissionOp,
): boolean {
  if (hasWildcard(permissions)) return true;
  if (op) {
    return permissions.includes(`search.metadata.${op}`);
  }
  return hasAnyPrefix(permissions, "search.metadata");
}

export function hasSearchCapabilitiesPermission(
  permissions: readonly string[],
): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.capabilities.read") ||
    hasSearchProviderPermission(permissions, "read") ||
    hasSearchDiagnosticsPermission(permissions)
  );
}

export function hasSearchHealthPermission(permissions: readonly string[]): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.health.read") ||
    hasSearchDiagnosticsPermission(permissions)
  );
}

export function hasSearchStatisticsPermission(permissions: readonly string[]): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.statistics.read") ||
    hasSearchDiagnosticsPermission(permissions)
  );
}

export function hasSearchValidationPermission(permissions: readonly string[]): boolean {
  return (
    hasWildcard(permissions) ||
    permissions.includes("search.validation.execute") ||
    hasSearchQueryPermission(permissions) ||
    hasSearchConfigurationPermission(permissions, "validate")
  );
}

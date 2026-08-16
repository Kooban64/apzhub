export {
  ensureUserAuthorizationMembership,
  ensurePlatformTenantRow,
  getPostgresAuthorizationDiagnostics,
  listPostgresAssignments,
  listPostgresPermissions,
  listPostgresRoles,
  resolvePostgresSessionAuthorization,
  seedDefaultAuthorizationRows,
  upsertPostgresRoleAssignment,
  upsertPostgresUserScopedPermissions,
} from "./postgres-authorization-store";

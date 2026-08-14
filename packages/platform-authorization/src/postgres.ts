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
} from "./postgres-authorization-store";

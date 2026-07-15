import type { AuthorizationContext } from "./authorization-types";
import { getSharedAuthorizationService, provisionDefaultAuthorizationForUser } from "./index";
import { AuthorizationService } from "./authorization-service";

export * from "./index";

export interface ResolveSessionAuthorizationInput {
  readonly userId?: string;
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly provisionIfEmpty?: boolean;
}

export interface SessionAuthorizationSnapshot {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export async function resolveSessionAuthorization(
  input: ResolveSessionAuthorizationInput,
  service: AuthorizationService = getSharedAuthorizationService(),
): Promise<SessionAuthorizationSnapshot> {
  if (!input.userId) {
    return { roles: [], permissions: [] };
  }

  if (process.env.DATABASE_URL) {
    try {
      const { resolvePostgresSessionAuthorization } = await import("./postgres-authorization-store");
      const postgresSnapshot = await resolvePostgresSessionAuthorization(input, service);
      if (postgresSnapshot.permissions.length > 0 || postgresSnapshot.roles.length > 0) {
        return postgresSnapshot;
      }
    } catch {
      // Fall through to in-memory authorization.
    }
  }

  const context: AuthorizationContext = {
    userId: input.userId,
    tenantId: input.tenantId,
    productKey: input.productKey,
  };

  let snapshot = service.resolveSessionPermissions(context);

  if (
    input.provisionIfEmpty !== false &&
    snapshot.permissions.length === 0 &&
    snapshot.roles.length === 0
  ) {
    provisionDefaultAuthorizationForUser({
      userId: input.userId,
      tenantId: input.tenantId,
    });
    snapshot = service.resolveSessionPermissions(context);
  }

  return snapshot;
}

export async function evaluateSessionPermission(
  input: ResolveSessionAuthorizationInput & { readonly permissionKey?: string },
  service: AuthorizationService = getSharedAuthorizationService(),
) {
  if (!input.userId) {
    return service.evaluatePermission({ userId: "" }, input.permissionKey);
  }

  return service.evaluatePermission(
    {
      userId: input.userId,
      tenantId: input.tenantId,
      productKey: input.productKey,
    },
    input.permissionKey,
  );
}

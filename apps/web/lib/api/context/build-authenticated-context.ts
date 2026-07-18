import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { authenticateLawApiRequest } from "../auth/authenticate";
import {
  forbiddenResponse,
  tenantRequiredResponse,
  unauthorizedResponse,
} from "../auth/auth-errors";
import {
  resolveLawApiPermissions,
  type LawApiPermissionChecker,
} from "../auth/permission-resolver";
import { resolveLawApiUser, type LawApiUser } from "../auth/user-resolver";
import { createLawApiPersistenceContext } from "../persistence/law-api-persistence-context";
import { getLawApiRepositoryMode } from "../persistence/repository-mode";
import { resolveRequestContext } from "../request-context";
import {
  resolveLawApiTenant,
  type LawApiTenantSource,
} from "../tenant/tenant-resolver";
import { validateLawApiTenantMembership } from "../tenant/validate-law-api-tenant-membership";
import type { LawApiPersistenceContext } from "../persistence/law-api-persistence-context";
import type { LawApiRepositoryMode } from "../persistence/repository-mode";
import type { LawApiRequestContext } from "../types";

export interface LawApiAuthenticatedContext extends LawApiRequestContext {
  readonly authenticated: boolean;
  readonly user?: LawApiUser;
  readonly tenantId?: string;
  readonly tenantSource: LawApiTenantSource;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly permissionChecker: LawApiPermissionChecker;
  readonly repositoryMode: LawApiRepositoryMode;
  readonly persistenceContext?: LawApiPersistenceContext;
}

export interface BuildLawApiAuthenticatedContextOptions {
  readonly requireAuth?: boolean;
  readonly requireTenant?: boolean;
  readonly requiredPermission?: string;
}

export type LawApiAuthenticatedContextResult =
  | { readonly ok: true; readonly context: LawApiAuthenticatedContext }
  | { readonly ok: false; readonly response: NextResponse };

/** Build full Law API request context with auth, tenant, and persistence binding (LAW-014-02). */
export async function buildLawApiAuthenticatedContext(
  request: NextRequest,
  options: BuildLawApiAuthenticatedContextOptions = {},
): Promise<LawApiAuthenticatedContextResult> {
  const tracing = resolveRequestContext(request);
  const auth = await authenticateLawApiRequest(request.headers);

  if (options.requireAuth && !auth.authenticated) {
    return { ok: false, response: unauthorizedResponse(tracing) };
  }

  const user = resolveLawApiUser(auth.session);
  const tenant = resolveLawApiTenant({ session: auth.session, request });
  const permissionChecker = await resolveLawApiPermissions({
    user,
    tenantId: tenant.tenantId,
  });

  if (options.requireTenant && auth.authenticated && !tenant.tenantId) {
    return { ok: false, response: tenantRequiredResponse(tracing) };
  }

  if (options.requireTenant && auth.authenticated && tenant.tenantId && user?.userId) {
    const membership = await validateLawApiTenantMembership({
      userId: user.userId,
      tenantId: tenant.tenantId,
      tenantSource: tenant.source,
    });

    if (!membership.valid) {
      return {
        ok: false,
        response: forbiddenResponse(tracing, {
          code: "TENANT_MEMBERSHIP_DENIED",
          message:
            membership.message ?? "Tenant membership is required for this request.",
        }),
      };
    }
  }

  if (
    options.requiredPermission &&
    auth.authenticated &&
    !permissionChecker.can(options.requiredPermission)
  ) {
    return {
      ok: false,
      response: forbiddenResponse(tracing, {
        code: "FORBIDDEN",
        message: `Permission "${options.requiredPermission}" is required.`,
        details: { requiredPermission: options.requiredPermission },
      }),
    };
  }

  const persistenceContext =
    tenant.tenantId !== undefined
      ? createLawApiPersistenceContext({
          tenantId: tenant.tenantId,
          actorId: user?.userId,
        })
      : undefined;

  return {
    ok: true,
    context: {
      ...tracing,
      authenticated: auth.authenticated,
      user,
      tenantId: tenant.tenantId,
      tenantSource: tenant.source,
      roles: permissionChecker.roles,
      permissions: permissionChecker.permissions,
      permissionChecker,
      repositoryMode: getLawApiRepositoryMode(),
      persistenceContext,
    },
  };
}

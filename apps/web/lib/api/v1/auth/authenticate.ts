import type { EnrichedValidatedSession } from "@apzhub/auth/server";
import { getValidatedSession } from "@apzhub/auth/server";

import { authenticationRequiredError, tenantRequiredError } from "../errors";

export interface PlatformApiAuthenticationResult {
  readonly authenticated: boolean;
  readonly session: EnrichedValidatedSession | null;
}

/** Resolve Platform authentication from incoming request headers. */
export async function authenticatePlatformApiRequest(
  headers: Headers,
): Promise<PlatformApiAuthenticationResult> {
  const session = await getValidatedSession(headers);
  return {
    authenticated: session !== null,
    session,
  };
}

export function requireAuthenticatedSession(
  result: PlatformApiAuthenticationResult,
): EnrichedValidatedSession {
  if (!result.authenticated || !result.session) {
    throw authenticationRequiredError();
  }

  const tenantId =
    result.session.tenantId ??
    result.session.user.tenantId ??
    result.session.user.activeTenantId;

  if (!tenantId) {
    throw tenantRequiredError();
  }

  return result.session;
}

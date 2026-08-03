import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type { EnrichedValidatedSession } from "@apzhub/auth/server";

import type { PlatformApiTracingContext } from "./types";

export interface BuildServiceRequestContextInput {
  readonly session: EnrichedValidatedSession;
  readonly tracing: PlatformApiTracingContext;
  readonly locale?: string;
  readonly timezone?: string;
  readonly workspaceId?: string;
}

/**
 * Build ServiceRequestContext from trusted server-side session data.
 *
 * Never trusts client-supplied roles, permissions, actor IDs, tenant IDs,
 * or organisation memberships.
 *
 * APZQEP-152: when `permissions` is supplied (from resolveSessionAuthorization),
 * they are attached for Cap A–F domain enforcement. Gateway paths that use
 * ProductionAuthorizationProvider may still pass empty and resolve separately.
 */
export function buildServiceRequestContext(
  input: BuildServiceRequestContextInput & {
    readonly permissions?: readonly string[];
  },
): ServiceRequestContext {
  const { session, tracing } = input;
  const userId = session.user.id;
  const tenantId =
    session.tenantId ?? session.user.tenantId ?? session.user.activeTenantId;

  if (!userId) {
    throw new Error("Session user id is required");
  }
  if (!tenantId) {
    throw new Error("Session tenant id is required");
  }

  const extras: Record<string, string> = {};
  if (tracing.idempotencyKey) {
    extras.idempotencyKey = tracing.idempotencyKey;
  }
  if (session.session?.id) {
    extras.sessionId = session.session.id;
  }

  return {
    tenantId,
    userId,
    correlationId: tracing.correlationId,
    permissions: input.permissions ? [...input.permissions] : [],
    requestId: tracing.requestId,
    locale: input.locale,
    timezone: input.timezone,
    workspaceId: input.workspaceId,
    // organisationId: only when identity model exposes trusted org on session (not client headers)
    execution: {
      requestId: tracing.requestId,
      startedAt: tracing.timestamp,
      source: "http-api-v1",
      extras: Object.keys(extras).length > 0 ? extras : undefined,
    },
  };
}

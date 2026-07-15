import { DEFAULT_LAW_TENANT_ID, resolveLawTenantId } from "./default-tenant";
import {
  createLawPersistenceContext,
  type LawPersistenceContext,
} from "./law-persistence-context";

/** How the active tenant id was resolved (LAW-012-03, M8-01). */
export type LawTenantSource =
  | "explicit"
  | "session-claim"
  | "env-override"
  | "default-firm"
  | "session-single-firm-fallback";

export interface LawTenantBinding {
  readonly tenantId: string;
  readonly source: LawTenantSource;
}

export interface ResolveLawTenantBindingInput {
  readonly userId?: string;
  readonly explicitTenantId?: string;
  readonly sessionTenantId?: string;
}

/**
 * Resolves tenant scope for law persistence.
 *
 * Auth session → tenant binding → LawPersistenceContext (M8-01).
 */
export function resolveLawTenantBinding(
  input: ResolveLawTenantBindingInput = {},
): LawTenantBinding {
  if (input.explicitTenantId?.trim()) {
    return {
      tenantId: input.explicitTenantId.trim(),
      source: "explicit",
    };
  }

  if (input.sessionTenantId?.trim()) {
    return {
      tenantId: input.sessionTenantId.trim(),
      source: "session-claim",
    };
  }

  if (input.userId && shouldUseSingleFirmFallback()) {
    return {
      tenantId: DEFAULT_LAW_TENANT_ID,
      source: "session-single-firm-fallback",
    };
  }

  if (process.env.LAW_TENANT_ID?.trim()) {
    return {
      tenantId: process.env.LAW_TENANT_ID.trim(),
      source: "env-override",
    };
  }

  return {
    tenantId: resolveLawTenantId(),
    source: "default-firm",
  };
}

function shouldUseSingleFirmFallback(): boolean {
  if (process.env.NODE_ENV === "production") {
    return process.env.LAW_ALLOW_SINGLE_FIRM_FALLBACK === "true";
  }
  return process.env.LAW_ALLOW_SINGLE_FIRM_FALLBACK !== "false";
}

export function createLawPersistenceContextFromSession(input: {
  readonly userId?: string;
  readonly explicitTenantId?: string;
  readonly sessionTenantId?: string;
  readonly actorId?: string;
}): { readonly binding: LawTenantBinding; readonly context: LawPersistenceContext } {
  const binding = resolveLawTenantBinding({
    userId: input.userId,
    explicitTenantId: input.explicitTenantId,
    sessionTenantId: input.sessionTenantId,
  });

  return {
    binding,
    context: createLawPersistenceContext({
      tenantId: binding.tenantId,
      actorId: input.actorId ?? input.userId,
    }),
  };
}

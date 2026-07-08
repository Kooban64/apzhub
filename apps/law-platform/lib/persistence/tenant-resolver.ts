import { DEFAULT_LAW_TENANT_ID, resolveLawTenantId } from "./default-tenant";
import {
  createLawPersistenceContext,
  type LawPersistenceContext,
} from "./law-persistence-context";

/** How the active tenant id was resolved (LAW-012-03). */
export type LawTenantSource =
  "explicit" | "env-override" | "default-firm" | "session-single-firm-fallback";

export interface LawTenantBinding {
  readonly tenantId: string;
  readonly source: LawTenantSource;
}

export interface ResolveLawTenantBindingInput {
  readonly userId?: string;
  readonly explicitTenantId?: string;
}

/**
 * Resolves tenant scope for law persistence.
 *
 * Auth session → tenant binding → LawPersistenceContext
 *
 * Auth does not yet expose firm/tenant claims. Until it does, authenticated
 * sessions use the single-firm development fallback (env override or default).
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

  if (input.userId) {
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

export function createLawPersistenceContextFromSession(input: {
  readonly userId?: string;
  readonly explicitTenantId?: string;
  readonly actorId?: string;
}): { readonly binding: LawTenantBinding; readonly context: LawPersistenceContext } {
  const binding = resolveLawTenantBinding({
    userId: input.userId,
    explicitTenantId: input.explicitTenantId,
  });

  return {
    binding,
    context: createLawPersistenceContext({
      tenantId: binding.tenantId,
      actorId: input.actorId ?? input.userId,
    }),
  };
}

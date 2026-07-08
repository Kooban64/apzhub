import type { Database } from "@apzhub/config";

import { resolveLawTenantId } from "./default-tenant";

/** Tenant-scoped persistence context for law repository adapters (LAW-012-02). */
export interface LawPersistenceContext {
  readonly tenantId: string;
  readonly actorId?: string;
  readonly db?: Database;
}

export function createLawPersistenceContext(
  options: Partial<LawPersistenceContext> = {},
): LawPersistenceContext {
  const tenantId =
    options.tenantId && options.tenantId.trim().length > 0
      ? options.tenantId.trim()
      : resolveLawTenantId();

  return {
    tenantId,
    actorId: options.actorId,
    db: options.db,
  };
}

let defaultContext: LawPersistenceContext | undefined;

export function getDefaultLawPersistenceContext(): LawPersistenceContext {
  defaultContext ??= createLawPersistenceContext();
  return defaultContext;
}

export function resetDefaultLawPersistenceContext(): void {
  defaultContext = undefined;
}

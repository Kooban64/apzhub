/** Law API persistence context — compatible with LawPersistenceContext shape (LAW-014-02). */

export interface LawApiPersistenceContext {
  readonly tenantId: string;
  readonly actorId?: string;
}

export function createLawApiPersistenceContext(input: {
  readonly tenantId: string;
  readonly actorId?: string;
}): LawApiPersistenceContext {
  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
  };
}

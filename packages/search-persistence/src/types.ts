/** Shared repository context (APZSEARCH-002). */

export type SearchRepositoryContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly actorUserId: string;
  readonly permissions: readonly string[];
  readonly correlationId?: string;
};

export type SoftDeletable = {
  readonly deletedAt?: string;
  readonly revision: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

import type { Requirement } from "./entities/requirement";

/** Requirement aggregate plus persistence metadata (ENG-020B). */
export type PersistedRequirement = Requirement & {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
  readonly archivedBy?: string;
  readonly revision: number;
};

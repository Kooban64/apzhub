import type { SpecificationHistoryEntry } from "./specification-history";
import type { SpecificationId } from "./specification-id";
import type { SpecificationRelationship } from "./specification-relationship";
import type { SpecificationStatus } from "./specification-status";
import type { TestSpecification } from "./test-specification";

/**
 * Persisted aggregate: domain TestSpecification without transient domain events.
 */
export type StoredTestSpecification = Omit<TestSpecification, "domainEvents"> & {
  readonly domainEvents: readonly [];
};

export type TestSpecificationListQuery = {
  readonly status?: SpecificationStatus;
  readonly type?: string;
  readonly owner?: string;
  readonly classification?: string;
  readonly priority?: string;
  readonly number?: string;
  readonly isAuthoritative?: boolean;
  readonly query?: string;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Persistence boundary for Test Specifications (APZQEP-ENG-050B / ARCH-011).
 */
export interface TestSpecificationRepository {
  create(spec: TestSpecification): Promise<StoredTestSpecification>;
  get(tenantId: string, id: SpecificationId): Promise<StoredTestSpecification | null>;
  save(spec: TestSpecification, expectedRevision: number): Promise<StoredTestSpecification>;
  list(
    tenantId: string,
    query?: TestSpecificationListQuery,
  ): Promise<readonly StoredTestSpecification[]>;
  exists(tenantId: string, id: SpecificationId): Promise<boolean>;
  listHistory(
    tenantId: string,
    id: SpecificationId,
  ): Promise<readonly SpecificationHistoryEntry[]>;
  listVersionsByNumber(
    tenantId: string,
    number: string,
  ): Promise<readonly StoredTestSpecification[]>;
  findLatestApprovedByNumber(
    tenantId: string,
    number: string,
  ): Promise<StoredTestSpecification | null>;
  listRelationships(
    tenantId: string,
    id: SpecificationId,
  ): Promise<readonly SpecificationRelationship[]>;
}

import type { TestPlanHistoryEntry } from "./plan-history";
import type { TestPlanRevision } from "./plan-revision";
import type { PlanStatus, PlanType, Priority } from "./value-objects";
import type { TestPlan } from "./test-plan";

/**
 * Persisted aggregate: domain TestPlan without transient uncommitted events.
 */
export type StoredTestPlan = Omit<TestPlan, "uncommittedEvents"> & {
  readonly uncommittedEvents: readonly [];
};

export type TestPlanListQuery = {
  readonly status?: PlanStatus;
  readonly ownerId?: string;
  readonly leadId?: string;
  readonly priority?: Priority;
  readonly planType?: PlanType;
  readonly number?: string;
  readonly scheduledFrom?: string;
  readonly scheduledTo?: string;
  /** Default false — terminal statuses (archived/cancelled/superseded) excluded unless requested. */
  readonly includeArchived?: boolean;
  readonly query?: string;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Persistence boundary for Test Plans (APZQEP-ENG-060B / OES-ENG-060B Part 2).
 */
export interface TestPlanRepository {
  create(plan: TestPlan): Promise<StoredTestPlan>;
  get(tenantId: string, id: string): Promise<StoredTestPlan | null>;
  getByNumber(tenantId: string, number: string): Promise<StoredTestPlan | null>;
  save(plan: TestPlan, expectedRevision: number): Promise<StoredTestPlan>;
  list(tenantId: string, query?: TestPlanListQuery): Promise<readonly StoredTestPlan[]>;
  exists(tenantId: string, id: string): Promise<boolean>;
  existsByNumber(tenantId: string, number: string): Promise<boolean>;
  listHistory(tenantId: string, id: string): Promise<readonly TestPlanHistoryEntry[]>;
  listRevisions(tenantId: string, id: string): Promise<readonly TestPlanRevision[]>;
}

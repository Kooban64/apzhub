import type {
  ExecutiveSummary,
  OperationalReview,
  ReviewPackSnapshot,
  ReviewSchedule,
} from "@apzhub/platform-service-contracts";

type Bucket = {
  reviews: Map<string, OperationalReview>;
  schedules: Map<string, ReviewSchedule>;
  snapshots: Map<string, ReviewPackSnapshot>;
  summaries: Map<string, ExecutiveSummary>;
  events: { type: string; payload: Record<string, unknown>; at: string }[];
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = {
      reviews: new Map(),
      schedules: new Map(),
      snapshots: new Map(),
      summaries: new Map(),
      events: [],
    };
    tenants.set(tenantId, b);
  }
  return b;
}

export type ProjectsReportingStore = {
  readonly listReviews: (
    tenantId: string,
    filter?: { scopeType?: string; scopeId?: string; status?: string },
  ) => Promise<readonly OperationalReview[]>;
  readonly getReview: (
    tenantId: string,
    id: string,
  ) => Promise<OperationalReview | null>;
  readonly upsertReview: (
    tenantId: string,
    row: OperationalReview,
  ) => Promise<OperationalReview>;
  readonly listSchedules: (
    tenantId: string,
    filter?: { scopeType?: string; scopeId?: string },
  ) => Promise<readonly ReviewSchedule[]>;
  readonly upsertSchedule: (
    tenantId: string,
    row: ReviewSchedule,
  ) => Promise<ReviewSchedule>;
  readonly getSnapshot: (
    tenantId: string,
    id: string,
  ) => Promise<ReviewPackSnapshot | null>;
  readonly upsertSnapshot: (
    tenantId: string,
    row: ReviewPackSnapshot,
  ) => Promise<ReviewPackSnapshot>;
  readonly getSummary: (
    tenantId: string,
    id: string,
  ) => Promise<ExecutiveSummary | null>;
  readonly upsertSummary: (
    tenantId: string,
    row: ExecutiveSummary,
  ) => Promise<ExecutiveSummary>;
  readonly publishEvent: (
    tenantId: string,
    type: string,
    payload: Record<string, unknown>,
  ) => Promise<void>;
};

let override: ProjectsReportingStore | null = null;

export function setProjectsReportingStoreForTests(
  store: ProjectsReportingStore | null,
): void {
  override = store;
}

export function resetProjectsReportingStoreForTests(): void {
  tenants.clear();
  override = null;
}

export function getMemoryProjectsReportingStore(): ProjectsReportingStore {
  return {
    async listReviews(tenantId, filter) {
      return Object.freeze(
        [...bucket(tenantId).reviews.values()].filter((r) => {
          if (filter?.scopeType && r.scopeType !== filter.scopeType) return false;
          if (filter?.scopeId && r.scopeId !== filter.scopeId) return false;
          if (filter?.status && r.status !== filter.status) return false;
          return true;
        }),
      );
    },
    async getReview(tenantId, id) {
      return bucket(tenantId).reviews.get(id) ?? null;
    },
    async upsertReview(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        attendeePrincipalIds: Object.freeze([...row.attendeePrincipalIds]),
        agenda: Object.freeze([...row.agenda]),
        outcomes: row.outcomes
          ? Object.freeze({
              ...row.outcomes,
              decisions: Object.freeze([...row.outcomes.decisions]),
              newCommitments: Object.freeze([...row.outcomes.newCommitments]),
              risksRaised: Object.freeze([...row.outcomes.risksRaised]),
              risksClosed: Object.freeze([...row.outcomes.risksClosed]),
              exceptionsRaised: Object.freeze([...row.outcomes.exceptionsRaised]),
              exceptionsClosed: Object.freeze([...row.outcomes.exceptionsClosed]),
              governanceActions: Object.freeze([...row.outcomes.governanceActions]),
            })
          : undefined,
      });
      bucket(tenantId).reviews.set(row.id, frozen);
      return frozen;
    },
    async listSchedules(tenantId, filter) {
      return Object.freeze(
        [...bucket(tenantId).schedules.values()].filter((s) => {
          if (filter?.scopeType && s.scopeType !== filter.scopeType) return false;
          if (filter?.scopeId && s.scopeId !== filter.scopeId) return false;
          return true;
        }),
      );
    },
    async upsertSchedule(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        previousReviewIds: Object.freeze([...row.previousReviewIds]),
      });
      bucket(tenantId).schedules.set(row.id, frozen);
      return frozen;
    },
    async getSnapshot(tenantId, id) {
      return bucket(tenantId).snapshots.get(id) ?? null;
    },
    async upsertSnapshot(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        metrics: Object.freeze([...row.metrics]),
        recommendedActions: Object.freeze([...row.recommendedActions]),
        forecast: row.forecast
          ? Object.freeze({
              ...row.forecast,
              contributingFactors: Object.freeze([...row.forecast.contributingFactors]),
              recommendedActions: Object.freeze([...row.forecast.recommendedActions]),
            })
          : undefined,
      });
      bucket(tenantId).snapshots.set(row.id, frozen);
      return frozen;
    },
    async getSummary(tenantId, id) {
      return bucket(tenantId).summaries.get(id) ?? null;
    },
    async upsertSummary(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).summaries.set(row.id, frozen);
      return frozen;
    },
    async publishEvent(tenantId, type, payload) {
      bucket(tenantId).events.push({
        type,
        payload,
        at: new Date().toISOString(),
      });
    },
  };
}

export function resolveProjectsReportingStore(): ProjectsReportingStore {
  if (override) return override;
  return getMemoryProjectsReportingStore();
}

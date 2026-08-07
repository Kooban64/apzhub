import type {
  ContinuityCase,
  DeliveryAssignment,
  DeliveryAssignmentEvent,
  ExternalParticipant,
  Responsibility,
  Stakeholder,
} from "@apzhub/platform-service-contracts";

export type ProjectsResourceStore = {
  readonly listAssignments: (
    tenantId: string,
    scopeType?: string,
    scopeId?: string,
  ) => Promise<readonly DeliveryAssignment[]>;
  readonly getAssignment: (
    tenantId: string,
    id: string,
  ) => Promise<DeliveryAssignment | null>;
  readonly upsertAssignment: (
    tenantId: string,
    row: DeliveryAssignment,
  ) => Promise<DeliveryAssignment>;
  readonly listAssignmentEvents: (
    tenantId: string,
    assignmentId: string,
  ) => Promise<readonly DeliveryAssignmentEvent[]>;
  readonly addAssignmentEvent: (
    tenantId: string,
    row: DeliveryAssignmentEvent,
  ) => Promise<DeliveryAssignmentEvent>;
  readonly listResponsibilities: (
    tenantId: string,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly Responsibility[]>;
  readonly upsertResponsibility: (
    tenantId: string,
    row: Responsibility,
  ) => Promise<Responsibility>;
  readonly listContinuityCases: (
    tenantId: string,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly ContinuityCase[]>;
  readonly getContinuityCase: (
    tenantId: string,
    id: string,
  ) => Promise<ContinuityCase | null>;
  readonly upsertContinuityCase: (
    tenantId: string,
    row: ContinuityCase,
  ) => Promise<ContinuityCase>;
  readonly listStakeholders: (
    tenantId: string,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly Stakeholder[]>;
  readonly upsertStakeholder: (
    tenantId: string,
    row: Stakeholder,
  ) => Promise<Stakeholder>;
  readonly listExternals: (tenantId: string) => Promise<readonly ExternalParticipant[]>;
  readonly upsertExternal: (
    tenantId: string,
    row: ExternalParticipant,
  ) => Promise<ExternalParticipant>;
};

type Bucket = {
  assignments: Map<string, DeliveryAssignment>;
  events: Map<string, DeliveryAssignmentEvent[]>;
  responsibilities: Map<string, Responsibility>;
  continuity: Map<string, ContinuityCase>;
  stakeholders: Map<string, Stakeholder>;
  externals: Map<string, ExternalParticipant>;
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = {
      assignments: new Map(),
      events: new Map(),
      responsibilities: new Map(),
      continuity: new Map(),
      stakeholders: new Map(),
      externals: new Map(),
    };
    tenants.set(tenantId, b);
  }
  return b;
}

export function resetProjectsResourceStoreForTests(): void {
  tenants.clear();
}

export function getMemoryProjectsResourceStore(): ProjectsResourceStore {
  return {
    async listAssignments(tenantId, scopeType, scopeId) {
      const all = [...bucket(tenantId).assignments.values()];
      return Object.freeze(
        all.filter((a) => {
          if (scopeType && a.scopeType !== scopeType) return false;
          if (scopeId && a.scopeId !== scopeId) return false;
          return true;
        }),
      );
    },
    async getAssignment(tenantId, id) {
      return bucket(tenantId).assignments.get(id) ?? null;
    },
    async upsertAssignment(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).assignments.set(row.id, frozen);
      return frozen;
    },
    async listAssignmentEvents(tenantId, assignmentId) {
      return Object.freeze([...(bucket(tenantId).events.get(assignmentId) ?? [])]);
    },
    async addAssignmentEvent(tenantId, row) {
      const b = bucket(tenantId);
      const list = [...(b.events.get(row.assignmentId) ?? [])];
      const frozen = Object.freeze({ ...row });
      list.push(frozen);
      b.events.set(row.assignmentId, list);
      return frozen;
    },
    async listResponsibilities(tenantId, scopeType, scopeId) {
      return Object.freeze(
        [...bucket(tenantId).responsibilities.values()].filter(
          (r) => r.scopeType === scopeType && r.scopeId === scopeId,
        ),
      );
    },
    async upsertResponsibility(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).responsibilities.set(row.id, frozen);
      return frozen;
    },
    async listContinuityCases(tenantId, scopeType, scopeId) {
      return Object.freeze(
        [...bucket(tenantId).continuity.values()].filter(
          (c) => c.scopeType === scopeType && c.scopeId === scopeId,
        ),
      );
    },
    async getContinuityCase(tenantId, id) {
      return bucket(tenantId).continuity.get(id) ?? null;
    },
    async upsertContinuityCase(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        affectedCommitments: Object.freeze([...row.affectedCommitments]),
        affectedMilestones: Object.freeze([...row.affectedMilestones]),
        pendingDecisions: Object.freeze([...row.pendingDecisions]),
        openExceptions: Object.freeze([...row.openExceptions]),
        agedWaitsChasing: Object.freeze([...row.agedWaitsChasing]),
        recommendedReplacementRoles: Object.freeze([
          ...row.recommendedReplacementRoles,
        ]),
      });
      bucket(tenantId).continuity.set(row.id, frozen);
      return frozen;
    },
    async listStakeholders(tenantId, scopeType, scopeId) {
      return Object.freeze(
        [...bucket(tenantId).stakeholders.values()].filter(
          (s) => s.scopeType === scopeType && s.scopeId === scopeId,
        ),
      );
    },
    async upsertStakeholder(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).stakeholders.set(row.id, frozen);
      return frozen;
    },
    async listExternals(tenantId) {
      return Object.freeze([...bucket(tenantId).externals.values()]);
    },
    async upsertExternal(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).externals.set(row.id, frozen);
      return frozen;
    },
  };
}

let testOverride: ProjectsResourceStore | undefined;

export function setProjectsResourceStoreForTests(
  store: ProjectsResourceStore | undefined,
): void {
  testOverride = store;
}

export function resolveProjectsResourceStore(
  preferred?: ProjectsResourceStore,
): ProjectsResourceStore {
  if (preferred) return preferred;
  if (testOverride) return testOverride;
  if (process.env.APZHUB_PROJECTS_RESOURCE_STORE === "memory") {
    return getMemoryProjectsResourceStore();
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPostgresProjectsResourceStore } = require("./postgres-store") as {
      createPostgresProjectsResourceStore: () => ProjectsResourceStore;
    };
    return createPostgresProjectsResourceStore();
  } catch {
    return getMemoryProjectsResourceStore();
  }
}

import type {
  GovernanceAdminAuditEvent,
  GovernedSearch,
  LegalHold,
  OperationalDelegation,
  OperationalRoleDefinition,
  RetentionPolicy,
} from "@apzhub/platform-service-contracts";

type Bucket = {
  delegations: Map<string, OperationalDelegation>;
  retention: Map<string, RetentionPolicy>;
  holds: Map<string, LegalHold>;
  searches: Map<string, GovernedSearch>;
  roles: Map<string, OperationalRoleDefinition>;
  audit: GovernanceAdminAuditEvent[];
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = {
      delegations: new Map(),
      retention: new Map(),
      holds: new Map(),
      searches: new Map(),
      roles: new Map(),
      audit: [],
    };
    tenants.set(tenantId, b);
  }
  return b;
}

export type ProjectsAdministrationStore = {
  readonly listDelegations: (
    tenantId: string,
  ) => Promise<readonly OperationalDelegation[]>;
  readonly getDelegation: (
    tenantId: string,
    id: string,
  ) => Promise<OperationalDelegation | null>;
  readonly upsertDelegation: (
    tenantId: string,
    row: OperationalDelegation,
  ) => Promise<OperationalDelegation>;
  readonly listRetentionPolicies: (
    tenantId: string,
  ) => Promise<readonly RetentionPolicy[]>;
  readonly upsertRetentionPolicy: (
    tenantId: string,
    row: RetentionPolicy,
  ) => Promise<RetentionPolicy>;
  readonly listLegalHolds: (tenantId: string) => Promise<readonly LegalHold[]>;
  readonly upsertLegalHold: (tenantId: string, row: LegalHold) => Promise<LegalHold>;
  readonly listGovernedSearches: (
    tenantId: string,
  ) => Promise<readonly GovernedSearch[]>;
  readonly upsertGovernedSearch: (
    tenantId: string,
    row: GovernedSearch,
  ) => Promise<GovernedSearch>;
  readonly listRoles: (
    tenantId: string,
  ) => Promise<readonly OperationalRoleDefinition[]>;
  readonly upsertRole: (
    tenantId: string,
    row: OperationalRoleDefinition,
  ) => Promise<OperationalRoleDefinition>;
  readonly listAudit: (
    tenantId: string,
    limit?: number,
  ) => Promise<readonly GovernanceAdminAuditEvent[]>;
  readonly appendAudit: (
    tenantId: string,
    row: GovernanceAdminAuditEvent,
  ) => Promise<void>;
};

let override: ProjectsAdministrationStore | null = null;

export function setProjectsAdministrationStoreForTests(
  store: ProjectsAdministrationStore | null,
): void {
  override = store;
}

export function resetProjectsAdministrationStoreForTests(): void {
  tenants.clear();
  override = null;
}

export function getMemoryProjectsAdministrationStore(): ProjectsAdministrationStore {
  return {
    async listDelegations(tenantId) {
      return [...bucket(tenantId).delegations.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    },
    async getDelegation(tenantId, id) {
      return bucket(tenantId).delegations.get(id) ?? null;
    },
    async upsertDelegation(tenantId, row) {
      bucket(tenantId).delegations.set(row.id, row);
      return row;
    },
    async listRetentionPolicies(tenantId) {
      return [...bucket(tenantId).retention.values()];
    },
    async upsertRetentionPolicy(tenantId, row) {
      bucket(tenantId).retention.set(row.id, row);
      return row;
    },
    async listLegalHolds(tenantId) {
      return [...bucket(tenantId).holds.values()].sort((a, b) =>
        b.placedAt.localeCompare(a.placedAt),
      );
    },
    async upsertLegalHold(tenantId, row) {
      bucket(tenantId).holds.set(row.id, row);
      return row;
    },
    async listGovernedSearches(tenantId) {
      return [...bucket(tenantId).searches.values()];
    },
    async upsertGovernedSearch(tenantId, row) {
      bucket(tenantId).searches.set(row.id, row);
      return row;
    },
    async listRoles(tenantId) {
      return [...bucket(tenantId).roles.values()];
    },
    async upsertRole(tenantId, row) {
      bucket(tenantId).roles.set(row.id, row);
      return row;
    },
    async listAudit(tenantId, limit = 100) {
      return bucket(tenantId).audit.slice(-limit).reverse();
    },
    async appendAudit(tenantId, row) {
      bucket(tenantId).audit.push(row);
    },
  };
}

export function resolveProjectsAdministrationStore(
  store?: ProjectsAdministrationStore,
): ProjectsAdministrationStore {
  if (store) return store;
  if (override) return override;
  return getMemoryProjectsAdministrationStore();
}

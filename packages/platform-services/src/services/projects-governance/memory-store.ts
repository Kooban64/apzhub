import type {
  OperationalPolicy,
  OrgGovernanceProfile,
} from "@apzhub/platform-service-contracts";

export type ProjectsGovernanceStore = {
  readonly listProfiles: (tenantId: string) => Promise<readonly OrgGovernanceProfile[]>;
  readonly getProfile: (
    tenantId: string,
    id: string,
  ) => Promise<OrgGovernanceProfile | null>;
  readonly upsertProfile: (
    tenantId: string,
    row: OrgGovernanceProfile,
  ) => Promise<OrgGovernanceProfile>;
  readonly listPolicies: (tenantId: string) => Promise<readonly OperationalPolicy[]>;
  readonly getPolicy: (
    tenantId: string,
    id: string,
  ) => Promise<OperationalPolicy | null>;
  readonly upsertPolicy: (
    tenantId: string,
    row: OperationalPolicy,
  ) => Promise<OperationalPolicy>;
};

type Bucket = {
  profiles: Map<string, OrgGovernanceProfile>;
  policies: Map<string, OperationalPolicy>;
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = { profiles: new Map(), policies: new Map() };
    tenants.set(tenantId, b);
  }
  return b;
}

export function resetProjectsGovernanceStoreForTests(): void {
  tenants.clear();
}

export function getMemoryProjectsGovernanceStore(): ProjectsGovernanceStore {
  return {
    async listProfiles(tenantId) {
      return Object.freeze([...bucket(tenantId).profiles.values()]);
    },
    async getProfile(tenantId, id) {
      return bucket(tenantId).profiles.get(id) ?? null;
    },
    async upsertProfile(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        boundPolicyIds: Object.freeze([...row.boundPolicyIds]),
        allowedDeliveryModels: Object.freeze([...row.allowedDeliveryModels]),
        allowedClassifications: Object.freeze([...row.allowedClassifications]),
      });
      bucket(tenantId).profiles.set(row.id, frozen);
      return frozen;
    },
    async listPolicies(tenantId) {
      return Object.freeze([...bucket(tenantId).policies.values()]);
    },
    async getPolicy(tenantId, id) {
      return bucket(tenantId).policies.get(id) ?? null;
    },
    async upsertPolicy(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        areas: Object.freeze([...row.areas]),
        boundProfileIds: Object.freeze([...row.boundProfileIds]),
        rules: Object.freeze({ ...row.rules }),
      });
      bucket(tenantId).policies.set(row.id, frozen);
      return frozen;
    },
  };
}

let testOverride: ProjectsGovernanceStore | undefined;

export function setProjectsGovernanceStoreForTests(
  store: ProjectsGovernanceStore | undefined,
): void {
  testOverride = store;
}

export function resolveProjectsGovernanceStore(
  preferred?: ProjectsGovernanceStore,
): ProjectsGovernanceStore {
  if (preferred) return preferred;
  if (testOverride) return testOverride;
  if (process.env.APZHUB_PROJECTS_GOVERNANCE_STORE === "memory") {
    return getMemoryProjectsGovernanceStore();
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPostgresProjectsGovernanceStore } = require("./postgres-store") as {
      createPostgresProjectsGovernanceStore: () => ProjectsGovernanceStore;
    };
    return createPostgresProjectsGovernanceStore();
  } catch {
    return getMemoryProjectsGovernanceStore();
  }
}

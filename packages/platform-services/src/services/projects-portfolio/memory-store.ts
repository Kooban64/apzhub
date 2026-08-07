import type {
  EnterprisePortfolio,
  Programme,
  StrategicInitiative,
  StrategicObjective,
} from "@apzhub/platform-service-contracts";

export type ProjectsPortfolioStore = {
  readonly getEnterprise: (tenantId: string) => Promise<EnterprisePortfolio>;
  readonly listInitiatives: (
    tenantId: string,
  ) => Promise<readonly StrategicInitiative[]>;
  readonly getInitiative: (
    tenantId: string,
    id: string,
  ) => Promise<StrategicInitiative | null>;
  readonly upsertInitiative: (
    tenantId: string,
    row: StrategicInitiative,
  ) => Promise<StrategicInitiative>;
  readonly listProgrammes: (tenantId: string) => Promise<readonly Programme[]>;
  readonly getProgramme: (tenantId: string, id: string) => Promise<Programme | null>;
  readonly upsertProgramme: (tenantId: string, row: Programme) => Promise<Programme>;
  readonly listObjectives: (tenantId: string) => Promise<readonly StrategicObjective[]>;
  readonly getObjective: (
    tenantId: string,
    id: string,
  ) => Promise<StrategicObjective | null>;
  readonly upsertObjective: (
    tenantId: string,
    row: StrategicObjective,
  ) => Promise<StrategicObjective>;
};

type Bucket = {
  enterprise: EnterprisePortfolio;
  initiatives: Map<string, StrategicInitiative>;
  programmes: Map<string, Programme>;
  objectives: Map<string, StrategicObjective>;
};

const tenants = new Map<string, Bucket>();

function now() {
  return new Date().toISOString();
}

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    const ts = now();
    b = {
      enterprise: Object.freeze({
        id: "enterprise",
        name: "Enterprise Portfolio",
        status: "active",
        initiativeIds: Object.freeze([] as string[]),
        createdAt: ts,
        updatedAt: ts,
      }),
      initiatives: new Map(),
      programmes: new Map(),
      objectives: new Map(),
    };
    tenants.set(tenantId, b);
  }
  return b;
}

export function resetProjectsPortfolioStoreForTests(): void {
  tenants.clear();
}

export function getMemoryProjectsPortfolioStore(): ProjectsPortfolioStore {
  return {
    async getEnterprise(tenantId) {
      return bucket(tenantId).enterprise;
    },
    async listInitiatives(tenantId) {
      return Object.freeze([...bucket(tenantId).initiatives.values()]);
    },
    async getInitiative(tenantId, id) {
      return bucket(tenantId).initiatives.get(id) ?? null;
    },
    async upsertInitiative(tenantId, row) {
      const b = bucket(tenantId);
      const frozen = Object.freeze({ ...row });
      b.initiatives.set(row.id, frozen);
      if (!b.enterprise.initiativeIds.includes(row.id) && row.status !== "archived") {
        b.enterprise = Object.freeze({
          ...b.enterprise,
          initiativeIds: Object.freeze([...b.enterprise.initiativeIds, row.id]),
          updatedAt: now(),
        });
      }
      return frozen;
    },
    async listProgrammes(tenantId) {
      return Object.freeze([...bucket(tenantId).programmes.values()]);
    },
    async getProgramme(tenantId, id) {
      return bucket(tenantId).programmes.get(id) ?? null;
    },
    async upsertProgramme(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).programmes.set(row.id, frozen);
      return frozen;
    },
    async listObjectives(tenantId) {
      return Object.freeze([...bucket(tenantId).objectives.values()]);
    },
    async getObjective(tenantId, id) {
      return bucket(tenantId).objectives.get(id) ?? null;
    },
    async upsertObjective(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).objectives.set(row.id, frozen);
      return frozen;
    },
  };
}

let testOverride: ProjectsPortfolioStore | undefined;

export function setProjectsPortfolioStoreForTests(
  store: ProjectsPortfolioStore | undefined,
): void {
  testOverride = store;
}

export function resolveProjectsPortfolioStore(
  preferred?: ProjectsPortfolioStore,
): ProjectsPortfolioStore {
  if (preferred) return preferred;
  if (testOverride) return testOverride;
  if (process.env.APZHUB_PROJECTS_PORTFOLIO_STORE === "memory") {
    return getMemoryProjectsPortfolioStore();
  }
  try {
    // Lazy require postgres to avoid hard fail when DB unavailable
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPostgresProjectsPortfolioStore } = require("./postgres-store") as {
      createPostgresProjectsPortfolioStore: () => ProjectsPortfolioStore;
    };
    return createPostgresProjectsPortfolioStore();
  } catch {
    return getMemoryProjectsPortfolioStore();
  }
}

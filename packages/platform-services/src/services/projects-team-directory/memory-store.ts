import type {
  EnterpriseDeliveryTeam,
  EnterpriseTeamMembership,
} from "@apzhub/platform-service-contracts";

export type ProjectsTeamDirectoryStore = {
  readonly listTeams: (tenantId: string) => Promise<readonly EnterpriseDeliveryTeam[]>;
  readonly getTeam: (
    tenantId: string,
    teamId: string,
  ) => Promise<EnterpriseDeliveryTeam | null>;
  readonly upsertTeam: (
    tenantId: string,
    row: EnterpriseDeliveryTeam,
  ) => Promise<EnterpriseDeliveryTeam>;
  readonly listMemberships: (
    tenantId: string,
    teamId: string,
  ) => Promise<readonly EnterpriseTeamMembership[]>;
  readonly upsertMembership: (
    tenantId: string,
    row: EnterpriseTeamMembership,
  ) => Promise<EnterpriseTeamMembership>;
};

type Bucket = {
  teams: Map<string, EnterpriseDeliveryTeam>;
  memberships: Map<string, EnterpriseTeamMembership[]>;
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = { teams: new Map(), memberships: new Map() };
    tenants.set(tenantId, b);
  }
  return b;
}

export function resetProjectsTeamDirectoryStoreForTests(): void {
  tenants.clear();
}

export function getMemoryProjectsTeamDirectoryStore(): ProjectsTeamDirectoryStore {
  return {
    async listTeams(tenantId) {
      return Object.freeze(
        [...bucket(tenantId).teams.values()].filter((t) => t.status === "active"),
      );
    },
    async getTeam(tenantId, teamId) {
      return bucket(tenantId).teams.get(teamId) ?? null;
    },
    async upsertTeam(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        skillTags: Object.freeze([...row.skillTags]),
      });
      bucket(tenantId).teams.set(row.id, frozen);
      return frozen;
    },
    async listMemberships(tenantId, teamId) {
      return Object.freeze([...(bucket(tenantId).memberships.get(teamId) ?? [])]);
    },
    async upsertMembership(tenantId, row) {
      const b = bucket(tenantId);
      const existing = [...(b.memberships.get(row.teamId) ?? [])];
      const idx = existing.findIndex((m) => m.id === row.id);
      const frozen = Object.freeze({ ...row });
      if (idx >= 0) existing[idx] = frozen;
      else existing.push(frozen);
      b.memberships.set(row.teamId, existing);
      return frozen;
    },
  };
}

let testOverride: ProjectsTeamDirectoryStore | undefined;

export function setProjectsTeamDirectoryStoreForTests(
  store: ProjectsTeamDirectoryStore | undefined,
): void {
  testOverride = store;
}

export function resolveProjectsTeamDirectoryStore(
  preferred?: ProjectsTeamDirectoryStore,
): ProjectsTeamDirectoryStore {
  if (preferred) return preferred;
  if (testOverride) return testOverride;
  if (process.env.APZHUB_PROJECTS_TEAM_DIRECTORY_STORE === "memory") {
    return getMemoryProjectsTeamDirectoryStore();
  }
  try {
    const { createPostgresProjectsTeamDirectoryStore } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy postgres load
      require("./postgres-store") as {
        createPostgresProjectsTeamDirectoryStore: () => ProjectsTeamDirectoryStore;
      };
    return createPostgresProjectsTeamDirectoryStore();
  } catch {
    return getMemoryProjectsTeamDirectoryStore();
  }
}

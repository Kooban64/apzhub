import type {
  OperationalHistoryEntry,
  ProjectCheckpoint,
  ProjectCommitment,
  ProjectDependency,
  ProjectException,
  ProjectOpsDecision,
  ProjectWaiting,
} from "@apzhub/platform-service-contracts";

export type ProjectsOperationalStore = {
  listCommitments(
    tenantId: string,
    projectId: string,
  ): Promise<readonly ProjectCommitment[]>;
  getCommitment(
    tenantId: string,
    projectId: string,
    id: string,
  ): Promise<ProjectCommitment | null>;
  upsertCommitment(
    tenantId: string,
    item: ProjectCommitment,
  ): Promise<ProjectCommitment>;

  listWaiting(tenantId: string, projectId: string): Promise<readonly ProjectWaiting[]>;
  getWaiting(
    tenantId: string,
    projectId: string,
    id: string,
  ): Promise<ProjectWaiting | null>;
  upsertWaiting(tenantId: string, item: ProjectWaiting): Promise<ProjectWaiting>;

  listDependencies(
    tenantId: string,
    projectId: string,
  ): Promise<readonly ProjectDependency[]>;
  upsertDependency(
    tenantId: string,
    item: ProjectDependency,
  ): Promise<ProjectDependency>;

  listDecisions(
    tenantId: string,
    projectId: string,
  ): Promise<readonly ProjectOpsDecision[]>;
  getDecision(
    tenantId: string,
    projectId: string,
    id: string,
  ): Promise<ProjectOpsDecision | null>;
  upsertDecision(
    tenantId: string,
    item: ProjectOpsDecision,
  ): Promise<ProjectOpsDecision>;

  listCheckpoints(
    tenantId: string,
    projectId: string,
  ): Promise<readonly ProjectCheckpoint[]>;
  getCheckpoint(
    tenantId: string,
    projectId: string,
    id: string,
  ): Promise<ProjectCheckpoint | null>;
  upsertCheckpoint(
    tenantId: string,
    item: ProjectCheckpoint,
  ): Promise<ProjectCheckpoint>;

  listExceptions(
    tenantId: string,
    projectId: string,
  ): Promise<readonly ProjectException[]>;
  getException(
    tenantId: string,
    projectId: string,
    id: string,
  ): Promise<ProjectException | null>;
  upsertException(tenantId: string, item: ProjectException): Promise<ProjectException>;

  addHistory(tenantId: string, entry: OperationalHistoryEntry): Promise<void>;
  listHistory(
    tenantId: string,
    projectId: string,
    objectType: string,
    objectId: string,
  ): Promise<readonly OperationalHistoryEntry[]>;
};

type Bucket = {
  commitments: Map<string, ProjectCommitment>;
  waiting: Map<string, ProjectWaiting>;
  dependencies: Map<string, ProjectDependency>;
  decisions: Map<string, ProjectOpsDecision>;
  checkpoints: Map<string, ProjectCheckpoint>;
  exceptions: Map<string, ProjectException>;
  history: OperationalHistoryEntry[];
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = {
      commitments: new Map(),
      waiting: new Map(),
      dependencies: new Map(),
      decisions: new Map(),
      checkpoints: new Map(),
      exceptions: new Map(),
      history: [],
    };
    tenants.set(tenantId, b);
  }
  return b;
}

function byProject<T extends { projectId: string }>(
  map: Map<string, T>,
  projectId: string,
): T[] {
  return [...map.values()].filter((x) => x.projectId === projectId);
}

export function getMemoryProjectsOperationalStore(): ProjectsOperationalStore {
  return {
    async listCommitments(tenantId, projectId) {
      return byProject(bucket(tenantId).commitments, projectId);
    },
    async getCommitment(tenantId, projectId, id) {
      const item = bucket(tenantId).commitments.get(id);
      return item?.projectId === projectId ? item : null;
    },
    async upsertCommitment(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      bucket(tenantId).commitments.set(item.id, frozen);
      return frozen;
    },
    async listWaiting(tenantId, projectId) {
      return byProject(bucket(tenantId).waiting, projectId);
    },
    async getWaiting(tenantId, projectId, id) {
      const item = bucket(tenantId).waiting.get(id);
      return item?.projectId === projectId ? item : null;
    },
    async upsertWaiting(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      bucket(tenantId).waiting.set(item.id, frozen);
      return frozen;
    },
    async listDependencies(tenantId, projectId) {
      return byProject(bucket(tenantId).dependencies, projectId);
    },
    async upsertDependency(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      bucket(tenantId).dependencies.set(item.id, frozen);
      return frozen;
    },
    async listDecisions(tenantId, projectId) {
      return byProject(bucket(tenantId).decisions, projectId);
    },
    async getDecision(tenantId, projectId, id) {
      const item = bucket(tenantId).decisions.get(id);
      return item?.projectId === projectId ? item : null;
    },
    async upsertDecision(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      bucket(tenantId).decisions.set(item.id, frozen);
      return frozen;
    },
    async listCheckpoints(tenantId, projectId) {
      return byProject(bucket(tenantId).checkpoints, projectId);
    },
    async getCheckpoint(tenantId, projectId, id) {
      const item = bucket(tenantId).checkpoints.get(id);
      return item?.projectId === projectId ? item : null;
    },
    async upsertCheckpoint(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      bucket(tenantId).checkpoints.set(item.id, frozen);
      return frozen;
    },
    async listExceptions(tenantId, projectId) {
      return byProject(bucket(tenantId).exceptions, projectId);
    },
    async getException(tenantId, projectId, id) {
      const item = bucket(tenantId).exceptions.get(id);
      return item?.projectId === projectId ? item : null;
    },
    async upsertException(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      bucket(tenantId).exceptions.set(item.id, frozen);
      return frozen;
    },
    async addHistory(tenantId, entry) {
      bucket(tenantId).history.push(Object.freeze({ ...entry }));
    },
    async listHistory(tenantId, projectId, objectType, objectId) {
      return bucket(tenantId)
        .history.filter(
          (h) =>
            h.projectId === projectId &&
            h.objectType === objectType &&
            h.objectId === objectId,
        )
        .sort((a, b) => b.at.localeCompare(a.at));
    },
  };
}

let preferred: ProjectsOperationalStore | undefined;

export function setProjectsOperationalStoreForTests(store: ProjectsOperationalStore) {
  preferred = store;
}

export function resolveProjectsOperationalStore(): ProjectsOperationalStore {
  if (preferred) return preferred;
  if (process.env.APZHUB_PROJECTS_OPERATIONAL_STORE === "memory") {
    return getMemoryProjectsOperationalStore();
  }
  try {
    // Lazy require postgres to avoid hard fail when DB unavailable
    const { createPostgresProjectsOperationalStore } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy load
      require("./postgres-store") as typeof import("./postgres-store");
    return createPostgresProjectsOperationalStore();
  } catch {
    return getMemoryProjectsOperationalStore();
  }
}

export function resetProjectsOperationalMemoryForTests() {
  tenants.clear();
}

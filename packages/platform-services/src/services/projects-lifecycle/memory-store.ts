import type {
  LifecycleTransitionRecord,
  LifecycleWaiver,
  ProjectBaseline,
  ProjectLifecycleRecord,
} from "@apzhub/platform-service-contracts";

export type ProjectsLifecycleStore = {
  getLifecycle(
    tenantId: string,
    projectId: string,
  ): Promise<ProjectLifecycleRecord | null>;
  upsertLifecycle(
    tenantId: string,
    record: ProjectLifecycleRecord,
  ): Promise<ProjectLifecycleRecord>;
  listLifecycles(
    tenantId: string,
    stages?: readonly string[],
  ): Promise<readonly ProjectLifecycleRecord[]>;
  listBaselines(
    tenantId: string,
    projectId: string,
  ): Promise<readonly ProjectBaseline[]>;
  addBaseline(tenantId: string, baseline: ProjectBaseline): Promise<ProjectBaseline>;
  listTransitions(
    tenantId: string,
    projectId: string,
  ): Promise<readonly LifecycleTransitionRecord[]>;
  addTransition(
    tenantId: string,
    record: LifecycleTransitionRecord,
  ): Promise<LifecycleTransitionRecord>;
  listWaivers(tenantId: string, projectId: string): Promise<readonly LifecycleWaiver[]>;
  addWaiver(tenantId: string, waiver: LifecycleWaiver): Promise<LifecycleWaiver>;
};

type Bucket = {
  lifecycle: Map<string, ProjectLifecycleRecord>;
  baselines: Map<string, ProjectBaseline[]>;
  transitions: Map<string, LifecycleTransitionRecord[]>;
  waivers: Map<string, LifecycleWaiver[]>;
};

const globalStore = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = globalStore.get(tenantId);
  if (!b) {
    b = {
      lifecycle: new Map(),
      baselines: new Map(),
      transitions: new Map(),
      waivers: new Map(),
    };
    globalStore.set(tenantId, b);
  }
  return b;
}

export function getMemoryProjectsLifecycleStore(): ProjectsLifecycleStore {
  return {
    async getLifecycle(tenantId, projectId) {
      return bucket(tenantId).lifecycle.get(projectId) ?? null;
    },
    async upsertLifecycle(tenantId, record) {
      const frozen = Object.freeze({ ...record });
      bucket(tenantId).lifecycle.set(record.projectId, frozen);
      return frozen;
    },
    async listLifecycles(tenantId, stages) {
      const all = [...bucket(tenantId).lifecycle.values()];
      if (!stages?.length) return Object.freeze(all);
      return Object.freeze(all.filter((r) => stages.includes(r.stage)));
    },
    async listBaselines(tenantId, projectId) {
      return Object.freeze([...(bucket(tenantId).baselines.get(projectId) ?? [])]);
    },
    async addBaseline(tenantId, baseline) {
      const b = bucket(tenantId);
      const list = [
        ...(b.baselines.get(baseline.projectId) ?? []),
        Object.freeze(baseline),
      ];
      b.baselines.set(baseline.projectId, list);
      return baseline;
    },
    async listTransitions(tenantId, projectId) {
      return Object.freeze([...(bucket(tenantId).transitions.get(projectId) ?? [])]);
    },
    async addTransition(tenantId, record) {
      const b = bucket(tenantId);
      const list = [
        ...(b.transitions.get(record.projectId) ?? []),
        Object.freeze(record),
      ];
      b.transitions.set(record.projectId, list);
      return record;
    },
    async listWaivers(tenantId, projectId) {
      return Object.freeze([...(bucket(tenantId).waivers.get(projectId) ?? [])]);
    },
    async addWaiver(tenantId, waiver) {
      const b = bucket(tenantId);
      const list = [...(b.waivers.get(waiver.projectId) ?? []), Object.freeze(waiver)];
      b.waivers.set(waiver.projectId, list);
      return waiver;
    },
  };
}

let preferred: ProjectsLifecycleStore | undefined;

export function setProjectsLifecycleStoreForTests(store: ProjectsLifecycleStore) {
  preferred = store;
}

export function clearMemoryProjectsLifecycleStoreForTests() {
  globalStore.clear();
  preferred = undefined;
}

export function resolveProjectsLifecycleStore(): ProjectsLifecycleStore {
  if (preferred) return preferred;
  if (process.env.APZHUB_PROJECTS_LIFECYCLE_STORE === "memory") {
    return getMemoryProjectsLifecycleStore();
  }
  try {
    // Lazy require postgres to avoid hard fail when DB unavailable
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPostgresProjectsLifecycleStore } = require("./postgres-store") as {
      createPostgresProjectsLifecycleStore: () => ProjectsLifecycleStore;
    };
    return createPostgresProjectsLifecycleStore();
  } catch {
    return getMemoryProjectsLifecycleStore();
  }
}

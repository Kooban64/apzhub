import type { ProjectsApprovalBinding } from "@apzhub/platform-service-contracts";

import type { ProjectsWorkflowBridgeStore } from "./types";

type Bucket = {
  byId: Map<string, ProjectsApprovalBinding>;
  byProject: Map<string, string[]>;
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = { byId: new Map(), byProject: new Map() };
    tenants.set(tenantId, b);
  }
  return b;
}

export function resetProjectsWorkflowBridgeStoreForTests(): void {
  tenants.clear();
}

export function getMemoryProjectsWorkflowBridgeStore(): ProjectsWorkflowBridgeStore {
  return {
    async get(tenantId, bindingId) {
      return bucket(tenantId).byId.get(bindingId) ?? null;
    },
    async listForProject(tenantId, projectId) {
      const b = bucket(tenantId);
      const ids = b.byProject.get(projectId) ?? [];
      return Object.freeze(
        ids
          .map((id) => b.byId.get(id))
          .filter((row): row is ProjectsApprovalBinding => Boolean(row)),
      );
    },
    async findOpenForSubject(tenantId, projectId, subjectType, subjectId, kind) {
      const rows = await this.listForProject(tenantId, projectId);
      return (
        rows.find(
          (r) =>
            r.subjectType === subjectType &&
            r.subjectId === subjectId &&
            r.kind === kind &&
            r.status === "pending",
        ) ?? null
      );
    },
    async findLatestForSubject(tenantId, projectId, subjectType, subjectId, kind) {
      const rows = await this.listForProject(tenantId, projectId);
      const matches = rows.filter(
        (r) =>
          r.subjectType === subjectType && r.subjectId === subjectId && r.kind === kind,
      );
      if (matches.length === 0) return null;
      return matches.reduce((a, b) => (a.updatedAt >= b.updatedAt ? a : b));
    },
    async upsert(tenantId, binding) {
      const b = bucket(tenantId);
      const frozen = Object.freeze({ ...binding });
      b.byId.set(binding.id, frozen);
      const list = b.byProject.get(binding.projectId) ?? [];
      if (!list.includes(binding.id)) {
        b.byProject.set(binding.projectId, [...list, binding.id]);
      }
      return frozen;
    },
  };
}

let testOverride: ProjectsWorkflowBridgeStore | undefined;

export function setProjectsWorkflowBridgeStoreForTests(
  store: ProjectsWorkflowBridgeStore | undefined,
): void {
  testOverride = store;
}

export function resolveProjectsWorkflowBridgeStore(
  preferred?: ProjectsWorkflowBridgeStore,
): ProjectsWorkflowBridgeStore {
  if (preferred) return preferred;
  if (testOverride) return testOverride;
  if (process.env.APZHUB_PROJECTS_WORKFLOW_BRIDGE_STORE === "memory") {
    return getMemoryProjectsWorkflowBridgeStore();
  }
  try {
    // Lazy require postgres to avoid hard fail when DB unavailable
    const { createPostgresProjectsWorkflowBridgeStore } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy postgres load
      require("./postgres-store") as {
        createPostgresProjectsWorkflowBridgeStore: () => ProjectsWorkflowBridgeStore;
      };
    return createPostgresProjectsWorkflowBridgeStore();
  } catch {
    return getMemoryProjectsWorkflowBridgeStore();
  }
}

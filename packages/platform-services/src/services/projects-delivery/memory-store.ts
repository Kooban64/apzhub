import type {
  ProjectActionItem,
  ProjectDecision,
  ProjectMilestone,
  ProjectRisk,
} from "@apzhub/platform-service-contracts";

export type ProjectsDeliveryStore = {
  listMilestones(tenantId: string, projectId: string): Promise<ProjectMilestone[]>;
  upsertMilestone(tenantId: string, item: ProjectMilestone): Promise<ProjectMilestone>;
  listRisks(tenantId: string, projectId: string): Promise<ProjectRisk[]>;
  upsertRisk(tenantId: string, item: ProjectRisk): Promise<ProjectRisk>;
  listDecisions(tenantId: string, projectId: string): Promise<ProjectDecision[]>;
  upsertDecision(tenantId: string, item: ProjectDecision): Promise<ProjectDecision>;
  listActions(tenantId: string, projectId: string): Promise<ProjectActionItem[]>;
  upsertAction(tenantId: string, item: ProjectActionItem): Promise<ProjectActionItem>;
};

function k(tenantId: string, projectId: string, id: string) {
  return `${tenantId}|${projectId}|${id}`;
}

export function createMemoryProjectsDeliveryStore(): ProjectsDeliveryStore {
  const milestones = new Map<string, ProjectMilestone>();
  const risks = new Map<string, ProjectRisk>();
  const decisions = new Map<string, ProjectDecision>();
  const actions = new Map<string, ProjectActionItem>();

  return {
    async listMilestones(tenantId, projectId) {
      return [...milestones.entries()]
        .filter(([id]) => id.startsWith(`${tenantId}|${projectId}|`))
        .map(([, item]) => item)
        .sort((a, b) => (a.targetDate ?? "").localeCompare(b.targetDate ?? ""));
    },
    async upsertMilestone(tenantId, item) {
      const frozen = Object.freeze({
        ...item,
        dependencyIds: Object.freeze([...item.dependencyIds]),
        achievementEvidence: Object.freeze([...item.achievementEvidence]),
      });
      milestones.set(k(tenantId, item.projectId, item.id), frozen);
      return frozen;
    },
    async listRisks(tenantId, projectId) {
      return [...risks.entries()]
        .filter(([id]) => id.startsWith(`${tenantId}|${projectId}|`))
        .map(([, item]) => item)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async upsertRisk(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      risks.set(k(tenantId, item.projectId, item.id), frozen);
      return frozen;
    },
    async listDecisions(tenantId, projectId) {
      return [...decisions.entries()]
        .filter(([id]) => id.startsWith(`${tenantId}|${projectId}|`))
        .map(([, item]) => item)
        .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
    },
    async upsertDecision(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      decisions.set(k(tenantId, item.projectId, item.id), frozen);
      return frozen;
    },
    async listActions(tenantId, projectId) {
      return [...actions.entries()]
        .filter(([id]) => id.startsWith(`${tenantId}|${projectId}|`))
        .map(([, item]) => item)
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
    },
    async upsertAction(tenantId, item) {
      const frozen = Object.freeze({ ...item });
      actions.set(k(tenantId, item.projectId, item.id), frozen);
      return frozen;
    },
  };
}

let singleton: ProjectsDeliveryStore | undefined;

export function getMemoryProjectsDeliveryStore(): ProjectsDeliveryStore {
  if (!singleton) singleton = createMemoryProjectsDeliveryStore();
  return singleton;
}

export function resetMemoryProjectsDeliveryStoreForTests(): void {
  singleton = createMemoryProjectsDeliveryStore();
}

import type {
  BusinessJourney,
  BusinessProcessAuditEntry,
  BusinessProcessInstance,
  BusinessProcessTemplate,
} from "@apzhub/platform-service-contracts";

export type BusinessProcessStore = {
  listJourneys(tenantId: string): Promise<BusinessJourney[]>;
  getJourney(tenantId: string, journeyId: string): Promise<BusinessJourney | null>;
  upsertJourney(item: BusinessJourney): Promise<BusinessJourney>;
  listTemplates(tenantId: string): Promise<BusinessProcessTemplate[]>;
  upsertTemplate(
    item: BusinessProcessTemplate & { tenantId: string },
  ): Promise<BusinessProcessTemplate>;
  listInstances(
    tenantId: string,
    journeyId?: string,
  ): Promise<BusinessProcessInstance[]>;
  upsertInstance(item: BusinessProcessInstance): Promise<BusinessProcessInstance>;
  listAudit(tenantId: string, journeyId: string): Promise<BusinessProcessAuditEntry[]>;
  appendAudit(
    tenantId: string,
    entry: BusinessProcessAuditEntry,
  ): Promise<BusinessProcessAuditEntry>;
};

function jk(tenantId: string, id: string) {
  return `${tenantId}|${id}`;
}

export function createMemoryBusinessProcessStore(): BusinessProcessStore {
  const journeys = new Map<string, BusinessJourney>();
  const templates = new Map<string, BusinessProcessTemplate & { tenantId: string }>();
  const instances = new Map<string, BusinessProcessInstance>();
  const audit = new Map<string, BusinessProcessAuditEntry[]>();

  return {
    async listJourneys(tenantId) {
      return [...journeys.values()]
        .filter((j) => j.tenantId === tenantId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async getJourney(tenantId, journeyId) {
      return journeys.get(jk(tenantId, journeyId)) ?? null;
    },
    async upsertJourney(item) {
      const frozen = Object.freeze({
        ...item,
        outcomes: Object.freeze([...item.outcomes]),
        stages: Object.freeze(item.stages.map((s) => Object.freeze({ ...s }))),
        transitions: Object.freeze(
          item.transitions.map((t) => Object.freeze({ ...t })),
        ),
      });
      journeys.set(jk(item.tenantId, item.id), frozen);
      return frozen;
    },
    async listTemplates(tenantId) {
      return [...templates.values()]
        .filter((t) => t.tenantId === tenantId)
        .map(({ tenantId: _t, ...rest }) => Object.freeze({ ...rest }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    async upsertTemplate(item) {
      templates.set(jk(item.tenantId, item.key), item);
      const { tenantId: _t, ...rest } = item;
      return Object.freeze({ ...rest });
    },
    async listInstances(tenantId, journeyId) {
      return [...instances.values()]
        .filter(
          (i) =>
            i.tenantId === tenantId &&
            (journeyId === undefined || i.journeyId === journeyId),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async upsertInstance(item) {
      const frozen = Object.freeze({ ...item });
      instances.set(jk(item.tenantId, item.id), frozen);
      return frozen;
    },
    async listAudit(tenantId, journeyId) {
      return [...(audit.get(jk(tenantId, journeyId)) ?? [])].sort((a, b) =>
        b.at.localeCompare(a.at),
      );
    },
    async appendAudit(tenantId, entry) {
      const key = jk(tenantId, entry.journeyId);
      const list = audit.get(key) ?? [];
      const frozen = Object.freeze({ ...entry });
      list.push(frozen);
      audit.set(key, list);
      return frozen;
    },
  };
}

let singleton: BusinessProcessStore | undefined;

export function getMemoryBusinessProcessStore(): BusinessProcessStore {
  if (!singleton) singleton = createMemoryBusinessProcessStore();
  return singleton;
}

export function resetMemoryBusinessProcessStoreForTests(): void {
  singleton = createMemoryBusinessProcessStore();
}

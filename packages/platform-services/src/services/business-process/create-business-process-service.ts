import { randomUUID } from "node:crypto";

import type {
  BusinessJourney,
  BusinessJourneyStage,
  BusinessJourneyTransition,
  BusinessProcessAuditEntry,
  BusinessProcessInstance,
  BusinessProcessMonitoring,
  BusinessProcessPublicationStatus,
  BusinessProcessTemplate,
  CreateBusinessJourneyInput,
  CreateBusinessProcessInstanceInput,
  ServiceRequestContext,
  TransitionBusinessJourneyGovernanceInput,
  UpdateBusinessJourneyInput,
  UpdateBusinessProcessInstanceInput,
} from "@apzhub/platform-service-contracts";

import { computeBusinessProcessMonitoring } from "./compute-monitoring";
import {
  getMemoryBusinessProcessStore,
  type BusinessProcessStore,
} from "./memory-store";
import { createPostgresBusinessProcessStore } from "./postgres-store";
import { BUSINESS_PROCESS_TEMPLATE_SEEDS } from "./template-catalogue";

function requireText(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`business_process_${field}_required`);
  return trimmed;
}

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

const PUBLICATION: readonly BusinessProcessPublicationStatus[] = [
  "draft",
  "review",
  "approved",
  "retired",
];

function normalizeStages(
  stages: CreateBusinessJourneyInput["stages"],
): BusinessJourneyStage[] {
  if (!stages?.length) return [];
  return stages.map((stage, index) =>
    Object.freeze({
      id: stage.id?.trim() || id("bpst"),
      name: requireText(stage.name, "stage_name"),
      description: stage.description?.trim() || undefined,
      order: stage.order ?? index + 1,
      responsibility: stage.responsibility?.trim() || undefined,
      entryCondition: stage.entryCondition?.trim() || undefined,
      exitCondition: stage.exitCondition?.trim() || undefined,
    }),
  );
}

function normalizeTransitions(
  transitions: CreateBusinessJourneyInput["transitions"],
): BusinessJourneyTransition[] {
  if (!transitions?.length) return [];
  return transitions.map((t) =>
    Object.freeze({
      id: t.id?.trim() || id("bptr"),
      fromStageId: requireText(t.fromStageId, "from_stage"),
      toStageId: requireText(t.toStageId, "to_stage"),
      name: requireText(t.name, "transition_name"),
      outcome: t.outcome?.trim() || undefined,
    }),
  );
}

function nextReviewAt(days: number | undefined, from: Date): string | undefined {
  if (!days || days <= 0) return undefined;
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export type BusinessProcessService = {
  ensureTemplates(
    ctx: ServiceRequestContext,
  ): Promise<readonly BusinessProcessTemplate[]>;
  listTemplates(
    ctx: ServiceRequestContext,
  ): Promise<readonly BusinessProcessTemplate[]>;
  instantiateTemplate(
    ctx: ServiceRequestContext,
    templateKey: string,
    input: {
      readonly processOwner: string;
      readonly businessSteward: string;
      readonly name?: string;
    },
  ): Promise<BusinessJourney>;
  listJourneys(ctx: ServiceRequestContext): Promise<readonly BusinessJourney[]>;
  getJourney(
    ctx: ServiceRequestContext,
    journeyId: string,
  ): Promise<BusinessJourney | null>;
  createJourney(
    ctx: ServiceRequestContext,
    input: CreateBusinessJourneyInput,
  ): Promise<BusinessJourney>;
  updateJourney(
    ctx: ServiceRequestContext,
    journeyId: string,
    input: UpdateBusinessJourneyInput,
  ): Promise<BusinessJourney>;
  transitionGovernance(
    ctx: ServiceRequestContext,
    journeyId: string,
    input: TransitionBusinessJourneyGovernanceInput,
  ): Promise<BusinessJourney>;
  listAudit(
    ctx: ServiceRequestContext,
    journeyId: string,
  ): Promise<readonly BusinessProcessAuditEntry[]>;
  listInstances(
    ctx: ServiceRequestContext,
    journeyId?: string,
  ): Promise<readonly BusinessProcessInstance[]>;
  createInstance(
    ctx: ServiceRequestContext,
    input: CreateBusinessProcessInstanceInput,
  ): Promise<BusinessProcessInstance>;
  updateInstance(
    ctx: ServiceRequestContext,
    instanceId: string,
    input: UpdateBusinessProcessInstanceInput,
  ): Promise<BusinessProcessInstance>;
  getMonitoring(
    ctx: ServiceRequestContext,
    journeyId?: string,
  ): Promise<BusinessProcessMonitoring>;
};

let preferred: BusinessProcessStore | undefined;

export function setBusinessProcessStoreForTests(store: BusinessProcessStore) {
  preferred = store;
}

export function resolveBusinessProcessStore(): BusinessProcessStore {
  if (preferred) return preferred;
  if (process.env.APZHUB_BUSINESS_PROCESS_STORE === "memory") {
    return getMemoryBusinessProcessStore();
  }
  try {
    return createPostgresBusinessProcessStore();
  } catch {
    return getMemoryBusinessProcessStore();
  }
}

export function createBusinessProcessService(
  store: BusinessProcessStore = resolveBusinessProcessStore(),
): BusinessProcessService {
  const tenant = (ctx: ServiceRequestContext) => ctx.tenantId ?? "default";
  const actor = (ctx: ServiceRequestContext) => ctx.userId ?? "system";

  async function ensureTemplates(ctx: ServiceRequestContext) {
    const tenantId = tenant(ctx);
    const existing = await store.listTemplates(tenantId);
    if (existing.length >= BUSINESS_PROCESS_TEMPLATE_SEEDS.length) {
      return existing;
    }
    const byKey = new Map(existing.map((t) => [t.key, t]));
    for (const seed of BUSINESS_PROCESS_TEMPLATE_SEEDS) {
      if (byKey.has(seed.key)) continue;
      const created = await store.upsertTemplate({
        id: id("bptpl"),
        tenantId,
        ...seed,
        defaultOutcomes: Object.freeze([...seed.defaultOutcomes]),
        defaultStages: Object.freeze([...seed.defaultStages]),
        defaultTransitions: Object.freeze([...seed.defaultTransitions]),
      });
      byKey.set(created.key, created);
    }
    return store.listTemplates(tenantId);
  }

  async function writeAudit(
    ctx: ServiceRequestContext,
    entry: Omit<BusinessProcessAuditEntry, "id" | "at"> & { at?: string },
  ) {
    return store.appendAudit(tenant(ctx), {
      id: id("bpaud"),
      at: entry.at ?? new Date().toISOString(),
      ...entry,
    });
  }

  async function createJourney(
    ctx: ServiceRequestContext,
    input: CreateBusinessJourneyInput,
  ): Promise<BusinessJourney> {
    const now = new Date();
    const nowIso = now.toISOString();
    const stages = normalizeStages(input.stages);
    const item: BusinessJourney = Object.freeze({
      id: id("bpj"),
      tenantId: tenant(ctx),
      name: requireText(input.name, "name"),
      summary: requireText(input.summary, "summary"),
      outcomes: Object.freeze(
        (input.outcomes ?? []).map((o) => requireText(o, "outcome")),
      ),
      stages: Object.freeze(stages),
      transitions: Object.freeze(normalizeTransitions(input.transitions)),
      processOwner: requireText(input.processOwner, "process_owner"),
      businessSteward: requireText(input.businessSteward, "business_steward"),
      version: 1,
      publicationStatus: input.publicationStatus ?? "draft",
      reviewCycleDays: input.reviewCycleDays,
      nextReviewAt: nextReviewAt(input.reviewCycleDays, now),
      templateKey: input.templateKey,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    const created = await store.upsertJourney(item);
    await writeAudit(ctx, {
      journeyId: created.id,
      action: "created",
      toStatus: created.publicationStatus,
      actor: actor(ctx),
    });
    return created;
  }

  return {
    ensureTemplates,

    async listTemplates(ctx) {
      return ensureTemplates(ctx);
    },

    async instantiateTemplate(ctx, templateKey, input) {
      const templates = await ensureTemplates(ctx);
      const template = templates.find((t) => t.key === templateKey);
      if (!template) throw new Error("business_process_template_not_found");

      const stages = template.defaultStages.map((stage, index) =>
        Object.freeze({
          id: id("bpst"),
          name: stage.name,
          description: stage.description,
          order: stage.order ?? index + 1,
          responsibility: stage.responsibility,
          entryCondition: stage.entryCondition,
          exitCondition: stage.exitCondition,
        }),
      );

      const transitions = template.defaultTransitions.map((transition, index) => {
        const from = stages[index];
        const to = stages[index + 1] ?? stages[stages.length - 1];
        return Object.freeze({
          id: id("bptr"),
          fromStageId: from?.id ?? stages[0]!.id,
          toStageId: to?.id ?? stages[0]!.id,
          name: transition.name,
          outcome: transition.outcome,
        });
      });

      return createJourney(ctx, {
        name: input.name?.trim() || template.name,
        summary: template.summary,
        outcomes: [...template.defaultOutcomes],
        stages,
        transitions,
        processOwner: input.processOwner,
        businessSteward: input.businessSteward,
        templateKey: template.key,
        publicationStatus: "draft",
      });
    },

    async listJourneys(ctx) {
      return store.listJourneys(tenant(ctx));
    },

    async getJourney(ctx, journeyId) {
      return store.getJourney(tenant(ctx), journeyId);
    },

    createJourney,

    async updateJourney(ctx, journeyId, input) {
      const existing = await store.getJourney(tenant(ctx), journeyId);
      if (!existing) throw new Error("business_process_journey_not_found");
      if (existing.publicationStatus === "retired") {
        throw new Error("business_process_journey_retired");
      }
      const now = new Date();
      const reviewCycleDays =
        input.reviewCycleDays === null
          ? undefined
          : (input.reviewCycleDays ?? existing.reviewCycleDays);
      const item: BusinessJourney = Object.freeze({
        ...existing,
        name:
          input.name !== undefined ? requireText(input.name, "name") : existing.name,
        summary:
          input.summary !== undefined
            ? requireText(input.summary, "summary")
            : existing.summary,
        outcomes: Object.freeze(
          input.outcomes !== undefined
            ? input.outcomes.map((o) => requireText(o, "outcome"))
            : [...existing.outcomes],
        ),
        stages: Object.freeze(
          input.stages !== undefined
            ? normalizeStages(input.stages)
            : [...existing.stages],
        ),
        transitions: Object.freeze(
          input.transitions !== undefined
            ? normalizeTransitions(input.transitions)
            : [...existing.transitions],
        ),
        processOwner:
          input.processOwner !== undefined
            ? requireText(input.processOwner, "process_owner")
            : existing.processOwner,
        businessSteward:
          input.businessSteward !== undefined
            ? requireText(input.businessSteward, "business_steward")
            : existing.businessSteward,
        version: existing.version + 1,
        publicationStatus: input.publicationStatus ?? existing.publicationStatus,
        reviewCycleDays,
        nextReviewAt: nextReviewAt(reviewCycleDays, now),
        updatedAt: now.toISOString(),
      });
      const updated = await store.upsertJourney(item);
      await writeAudit(ctx, {
        journeyId,
        action: "updated",
        fromStatus: existing.publicationStatus,
        toStatus: updated.publicationStatus,
        actor: actor(ctx),
      });
      return updated;
    },

    async transitionGovernance(ctx, journeyId, input) {
      if (!PUBLICATION.includes(input.publicationStatus)) {
        throw new Error("business_process_publication_status_invalid");
      }
      const existing = await store.getJourney(tenant(ctx), journeyId);
      if (!existing) throw new Error("business_process_journey_not_found");
      const now = new Date();
      const item: BusinessJourney = Object.freeze({
        ...existing,
        publicationStatus: input.publicationStatus,
        version: existing.version + 1,
        nextReviewAt:
          input.publicationStatus === "approved"
            ? nextReviewAt(existing.reviewCycleDays, now)
            : existing.nextReviewAt,
        updatedAt: now.toISOString(),
      });
      const updated = await store.upsertJourney(item);
      await writeAudit(ctx, {
        journeyId,
        action: "governance_transition",
        fromStatus: existing.publicationStatus,
        toStatus: updated.publicationStatus,
        actor: actor(ctx),
        notes: input.notes,
      });
      return updated;
    },

    async listAudit(ctx, journeyId) {
      return store.listAudit(tenant(ctx), journeyId);
    },

    async listInstances(ctx, journeyId) {
      return store.listInstances(tenant(ctx), journeyId);
    },

    async createInstance(ctx, input) {
      const journey = await store.getJourney(tenant(ctx), input.journeyId);
      if (!journey) throw new Error("business_process_journey_not_found");
      if (journey.publicationStatus !== "approved") {
        throw new Error("business_process_journey_not_published");
      }
      const stageId =
        input.currentStageId?.trim() ||
        [...journey.stages].sort((a, b) => a.order - b.order)[0]?.id;
      if (!stageId) throw new Error("business_process_stage_required");
      const now = new Date().toISOString();
      const item: BusinessProcessInstance = Object.freeze({
        id: id("bpinst"),
        tenantId: tenant(ctx),
        journeyId: journey.id,
        title: requireText(input.title, "title"),
        currentStageId: stageId,
        status: "active",
        enteredStageAt: now,
        dueAt: input.dueAt,
        createdAt: now,
        updatedAt: now,
      });
      return store.upsertInstance(item);
    },

    async updateInstance(ctx, instanceId, input) {
      const existing = (await store.listInstances(tenant(ctx))).find(
        (i) => i.id === instanceId,
      );
      if (!existing) throw new Error("business_process_instance_not_found");
      const now = new Date().toISOString();
      const stageChanged =
        input.currentStageId !== undefined &&
        input.currentStageId !== existing.currentStageId;
      const status = input.status ?? existing.status;
      const item: BusinessProcessInstance = Object.freeze({
        ...existing,
        title:
          input.title !== undefined
            ? requireText(input.title, "title")
            : existing.title,
        currentStageId: input.currentStageId ?? existing.currentStageId,
        status,
        enteredStageAt: stageChanged ? now : existing.enteredStageAt,
        dueAt: input.dueAt === null ? undefined : (input.dueAt ?? existing.dueAt),
        completedAt:
          status === "completed"
            ? (existing.completedAt ?? now)
            : status === "active"
              ? undefined
              : existing.completedAt,
        updatedAt: now,
      });
      return store.upsertInstance(item);
    },

    async getMonitoring(ctx, journeyId) {
      if (journeyId) {
        const journey = await store.getJourney(tenant(ctx), journeyId);
        const instances = await store.listInstances(tenant(ctx), journeyId);
        return computeBusinessProcessMonitoring({
          journey: journey ?? undefined,
          journeyId,
          instances,
        });
      }
      const instances = await store.listInstances(tenant(ctx));
      return computeBusinessProcessMonitoring({ instances });
    },
  };
}

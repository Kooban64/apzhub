import { randomUUID } from "node:crypto";

import type {
  CreateProgrammeInput,
  CreateStrategicInitiativeInput,
  CreateStrategicObjectiveInput,
  MoveProjectMembershipInput,
  Programme,
  ServiceRequestContext,
  StrategicInitiative,
  StrategicObjective,
  UpdateProgrammeInput,
  UpdateStrategicInitiativeInput,
  UpdateStrategicObjectiveInput,
} from "@apzhub/platform-service-contracts";

import {
  computeObjectiveProgress,
  type ObjectiveEvidenceBundle,
} from "./compute-objective-progress";
import {
  resolveProjectsPortfolioStore,
  type ProjectsPortfolioStore,
} from "./memory-store";

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function tenant(ctx: ServiceRequestContext) {
  return ctx.tenantId ?? "default";
}

function now() {
  return new Date().toISOString();
}

function requireText(value: string | undefined, field: string): string {
  const t = value?.trim() ?? "";
  if (!t) throw new Error(`${field}_required`);
  return t;
}

export type PortfolioEvidenceLoader = (
  ctx: ServiceRequestContext,
  projectIds: readonly string[],
) => Promise<ObjectiveEvidenceBundle>;

export type CreateProjectsPortfolioServiceOptions = {
  readonly loadEvidence?: PortfolioEvidenceLoader;
};

export type ProjectsPortfolioService = {
  readonly getEnterprise: (
    ctx: ServiceRequestContext,
  ) => Promise<Awaited<ReturnType<ProjectsPortfolioStore["getEnterprise"]>>>;
  readonly listInitiatives: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly StrategicInitiative[]>;
  readonly getInitiative: (
    ctx: ServiceRequestContext,
    initiativeId: string,
  ) => Promise<StrategicInitiative | null>;
  readonly createInitiative: (
    ctx: ServiceRequestContext,
    input: CreateStrategicInitiativeInput,
  ) => Promise<StrategicInitiative>;
  readonly updateInitiative: (
    ctx: ServiceRequestContext,
    initiativeId: string,
    input: UpdateStrategicInitiativeInput,
  ) => Promise<StrategicInitiative>;
  readonly archiveInitiative: (
    ctx: ServiceRequestContext,
    initiativeId: string,
  ) => Promise<StrategicInitiative>;
  readonly listProgrammes: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly Programme[]>;
  readonly getProgramme: (
    ctx: ServiceRequestContext,
    programmeId: string,
  ) => Promise<Programme | null>;
  readonly createProgramme: (
    ctx: ServiceRequestContext,
    input: CreateProgrammeInput,
  ) => Promise<Programme>;
  readonly updateProgramme: (
    ctx: ServiceRequestContext,
    programmeId: string,
    input: UpdateProgrammeInput,
  ) => Promise<Programme>;
  readonly archiveProgramme: (
    ctx: ServiceRequestContext,
    programmeId: string,
  ) => Promise<Programme>;
  readonly listObjectives: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly StrategicObjective[]>;
  readonly getObjective: (
    ctx: ServiceRequestContext,
    objectiveId: string,
  ) => Promise<StrategicObjective | null>;
  readonly createObjective: (
    ctx: ServiceRequestContext,
    input: CreateStrategicObjectiveInput,
  ) => Promise<StrategicObjective>;
  readonly updateObjective: (
    ctx: ServiceRequestContext,
    objectiveId: string,
    input: UpdateStrategicObjectiveInput,
  ) => Promise<StrategicObjective>;
  readonly archiveObjective: (
    ctx: ServiceRequestContext,
    objectiveId: string,
  ) => Promise<StrategicObjective>;
  readonly moveProject: (
    ctx: ServiceRequestContext,
    input: MoveProjectMembershipInput,
  ) => Promise<{ readonly programme: Programme | null }>;
  /** Recompute and persist evidence-derived progress for one objective. */
  readonly refreshObjectiveProgress: (
    ctx: ServiceRequestContext,
    objectiveId: string,
  ) => Promise<StrategicObjective>;
  /** Recompute and persist progress for all active objectives. */
  readonly refreshAllObjectiveProgress: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly StrategicObjective[]>;
};

export function createProjectsPortfolioService(
  store: ProjectsPortfolioStore = resolveProjectsPortfolioStore(),
  options: CreateProjectsPortfolioServiceOptions = {},
): ProjectsPortfolioService {
  async function applyEvidenceProgress(
    ctx: ServiceRequestContext,
    objective: StrategicObjective,
  ): Promise<StrategicObjective> {
    if (objective.archivedAt || objective.status === "abandoned") {
      return objective;
    }
    if (!options.loadEvidence) {
      return objective;
    }
    const evidence = await options.loadEvidence(ctx, objective.contributingProjectIds);
    const derived = computeObjectiveProgress(evidence);
    if (
      derived.progress === objective.progress &&
      derived.status === objective.status
    ) {
      return objective;
    }
    const next: StrategicObjective = Object.freeze({
      ...objective,
      progress: derived.progress,
      status: derived.status,
      updatedAt: now(),
    });
    return store.upsertObjective(tenant(ctx), next);
  }

  const service: ProjectsPortfolioService = {
    getEnterprise(ctx) {
      return store.getEnterprise(tenant(ctx));
    },

    listInitiatives(ctx) {
      return store.listInitiatives(tenant(ctx));
    },

    getInitiative(ctx, initiativeId) {
      return store.getInitiative(tenant(ctx), initiativeId);
    },

    async createInitiative(ctx, input) {
      const ts = now();
      const row: StrategicInitiative = Object.freeze({
        id: id("ini"),
        name: requireText(input.name, "name"),
        sponsorUserId: requireText(input.sponsorUserId, "sponsorUserId"),
        status: input.status ?? "active",
        governanceProfileId: input.governanceProfileId,
        strategicObjectiveIds: Object.freeze([...(input.strategicObjectiveIds ?? [])]),
        programmeIds: Object.freeze([] as string[]),
        projectIds: Object.freeze([] as string[]),
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertInitiative(tenant(ctx), row);
    },

    async updateInitiative(ctx, initiativeId, input) {
      const current = await store.getInitiative(tenant(ctx), initiativeId);
      if (!current) throw new Error("initiative_not_found");
      const next: StrategicInitiative = Object.freeze({
        ...current,
        name: input.name !== undefined ? requireText(input.name, "name") : current.name,
        sponsorUserId:
          input.sponsorUserId !== undefined
            ? requireText(input.sponsorUserId, "sponsorUserId")
            : current.sponsorUserId,
        governanceProfileId: input.governanceProfileId ?? current.governanceProfileId,
        status: input.status ?? current.status,
        strategicObjectiveIds: Object.freeze([
          ...(input.strategicObjectiveIds ?? current.strategicObjectiveIds),
        ]),
        programmeIds: Object.freeze([...(input.programmeIds ?? current.programmeIds)]),
        projectIds: Object.freeze([...(input.projectIds ?? current.projectIds)]),
        updatedAt: now(),
      });
      return store.upsertInitiative(tenant(ctx), next);
    },

    async archiveInitiative(ctx, initiativeId) {
      return service.updateInitiative(ctx, initiativeId, { status: "archived" });
    },

    listProgrammes(ctx) {
      return store.listProgrammes(tenant(ctx));
    },

    getProgramme(ctx, programmeId) {
      return store.getProgramme(tenant(ctx), programmeId);
    },

    async createProgramme(ctx, input) {
      const ts = now();
      const row: Programme = Object.freeze({
        id: id("prg"),
        name: requireText(input.name, "name"),
        ownerUserId: requireText(input.ownerUserId, "ownerUserId"),
        strategicInitiativeId: input.strategicInitiativeId,
        classification: input.classification,
        governanceProfileId: input.governanceProfileId,
        status: input.status ?? "active",
        strategicImportance: input.strategicImportance ?? "normal",
        strategicObjectiveIds: Object.freeze([...(input.strategicObjectiveIds ?? [])]),
        memberProjectIds: Object.freeze([...(input.memberProjectIds ?? [])]),
        targetEndAt: input.targetEndAt,
        createdAt: ts,
        updatedAt: ts,
      });
      const saved = await store.upsertProgramme(tenant(ctx), row);
      if (saved.strategicInitiativeId) {
        const ini = await store.getInitiative(tenant(ctx), saved.strategicInitiativeId);
        if (ini && !ini.programmeIds.includes(saved.id)) {
          await store.upsertInitiative(tenant(ctx), {
            ...ini,
            programmeIds: Object.freeze([...ini.programmeIds, saved.id]),
            updatedAt: now(),
          });
        }
      }
      return saved;
    },

    async updateProgramme(ctx, programmeId, input) {
      const current = await store.getProgramme(tenant(ctx), programmeId);
      if (!current) throw new Error("programme_not_found");
      const nextInitiative =
        input.strategicInitiativeId === null
          ? undefined
          : (input.strategicInitiativeId ?? current.strategicInitiativeId);
      const next: Programme = Object.freeze({
        ...current,
        name: input.name !== undefined ? requireText(input.name, "name") : current.name,
        ownerUserId:
          input.ownerUserId !== undefined
            ? requireText(input.ownerUserId, "ownerUserId")
            : current.ownerUserId,
        strategicInitiativeId: nextInitiative,
        classification: input.classification ?? current.classification,
        governanceProfileId: input.governanceProfileId ?? current.governanceProfileId,
        status: input.status ?? current.status,
        strategicImportance: input.strategicImportance ?? current.strategicImportance,
        strategicObjectiveIds: Object.freeze([
          ...(input.strategicObjectiveIds ?? current.strategicObjectiveIds),
        ]),
        memberProjectIds: Object.freeze([
          ...(input.memberProjectIds ?? current.memberProjectIds),
        ]),
        targetEndAt:
          input.targetEndAt === null
            ? undefined
            : (input.targetEndAt ?? current.targetEndAt),
        updatedAt: now(),
      });
      return store.upsertProgramme(tenant(ctx), next);
    },

    async archiveProgramme(ctx, programmeId) {
      return service.updateProgramme(ctx, programmeId, { status: "archived" });
    },

    async listObjectives(ctx) {
      const items = await store.listObjectives(tenant(ctx));
      if (!options.loadEvidence) return items;
      const refreshed: StrategicObjective[] = [];
      for (const item of items) {
        refreshed.push(await applyEvidenceProgress(ctx, item));
      }
      return Object.freeze(refreshed);
    },

    async getObjective(ctx, objectiveId) {
      const item = await store.getObjective(tenant(ctx), objectiveId);
      if (!item) return null;
      return applyEvidenceProgress(ctx, item);
    },

    async createObjective(ctx, input) {
      const ts = now();
      const row: StrategicObjective = Object.freeze({
        id: id("obj"),
        name: requireText(input.name, "name"),
        statement: requireText(input.statement, "statement"),
        ownerUserId: requireText(input.ownerUserId, "ownerUserId"),
        status: input.status ?? "on_track",
        progress: 0,
        initiativeIds: Object.freeze([...(input.initiativeIds ?? [])]),
        programmeIds: Object.freeze([...(input.programmeIds ?? [])]),
        contributingProjectIds: Object.freeze([
          ...(input.contributingProjectIds ?? []),
        ]),
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertObjective(tenant(ctx), row);
    },

    async updateObjective(ctx, objectiveId, input) {
      const current = await store.getObjective(tenant(ctx), objectiveId);
      if (!current) throw new Error("objective_not_found");
      // progress is evidence-derived only — ignore any manual progress field
      const next: StrategicObjective = Object.freeze({
        ...current,
        name: input.name !== undefined ? requireText(input.name, "name") : current.name,
        statement:
          input.statement !== undefined
            ? requireText(input.statement, "statement")
            : current.statement,
        ownerUserId:
          input.ownerUserId !== undefined
            ? requireText(input.ownerUserId, "ownerUserId")
            : current.ownerUserId,
        // status may be set to abandoned via archive; otherwise evidence engine owns it
        status:
          input.status === "abandoned" ? "abandoned" : (input.status ?? current.status),
        progress: current.progress,
        initiativeIds: Object.freeze([
          ...(input.initiativeIds ?? current.initiativeIds),
        ]),
        programmeIds: Object.freeze([...(input.programmeIds ?? current.programmeIds)]),
        contributingProjectIds: Object.freeze([
          ...(input.contributingProjectIds ?? current.contributingProjectIds),
        ]),
        updatedAt: now(),
      });
      const saved = await store.upsertObjective(tenant(ctx), next);
      return applyEvidenceProgress(ctx, saved);
    },

    async archiveObjective(ctx, objectiveId) {
      const current = await store.getObjective(tenant(ctx), objectiveId);
      if (!current) throw new Error("objective_not_found");
      return store.upsertObjective(tenant(ctx), {
        ...current,
        status: "abandoned",
        archivedAt: now(),
        updatedAt: now(),
      });
    },

    async moveProject(ctx, input) {
      const tid = tenant(ctx);
      const programmes = await store.listProgrammes(tid);
      for (const prog of programmes) {
        if (!prog.memberProjectIds.includes(input.projectId)) continue;
        if (prog.id === input.toProgrammeId) {
          return { programme: prog };
        }
        await store.upsertProgramme(tid, {
          ...prog,
          memberProjectIds: Object.freeze(
            prog.memberProjectIds.filter((pid) => pid !== input.projectId),
          ),
          updatedAt: now(),
        });
      }
      if (!input.toProgrammeId) return { programme: null };
      const target = await store.getProgramme(tid, input.toProgrammeId);
      if (!target) throw new Error("programme_not_found");
      const next = await store.upsertProgramme(tid, {
        ...target,
        memberProjectIds: Object.freeze(
          target.memberProjectIds.includes(input.projectId)
            ? [...target.memberProjectIds]
            : [...target.memberProjectIds, input.projectId],
        ),
        strategicInitiativeId:
          input.toInitiativeId === null
            ? target.strategicInitiativeId
            : (input.toInitiativeId ?? target.strategicInitiativeId),
        updatedAt: now(),
      });
      return { programme: next };
    },

    async refreshObjectiveProgress(ctx, objectiveId) {
      const current = await store.getObjective(tenant(ctx), objectiveId);
      if (!current) throw new Error("objective_not_found");
      return applyEvidenceProgress(ctx, current);
    },

    async refreshAllObjectiveProgress(ctx) {
      const items = await store.listObjectives(tenant(ctx));
      const refreshed: StrategicObjective[] = [];
      for (const item of items) {
        refreshed.push(await applyEvidenceProgress(ctx, item));
      }
      return Object.freeze(refreshed);
    },
  };

  return service;
}

export {
  getMemoryProjectsPortfolioStore,
  resetProjectsPortfolioStoreForTests,
  setProjectsPortfolioStoreForTests,
  resolveProjectsPortfolioStore,
} from "./memory-store";

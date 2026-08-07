import { randomUUID } from "node:crypto";

import type {
  ContinuityCase,
  CreateContinuityCaseInput,
  CreateDeliveryAssignmentInput,
  CreateExternalParticipantInput,
  CreateStakeholderInput,
  DeliveryAssignment,
  DeliveryAssignmentEvent,
  DeliveryCapacity,
  ExternalParticipant,
  ReassignDeliveryAssignmentInput,
  ResourceForecast,
  Responsibility,
  ResponsibilityMatrix,
  ResponsibilityMatrixRow,
  ResponsibilityObjectType,
  ServiceRequestContext,
  Stakeholder,
  TeamHealth,
  UpdateContinuityCaseInput,
  UpdateDeliveryAssignmentInput,
} from "@apzhub/platform-service-contracts";

import {
  computeDeliveryCapacity,
  computeResourceForecast,
  computeTeamHealth,
  type TeamSignalInput,
} from "./compute-team-signals";
import {
  resolveProjectsResourceStore,
  type ProjectsResourceStore,
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

export type TeamSignalLoader = (
  ctx: ServiceRequestContext,
  teamId: string,
) => Promise<Omit<TeamSignalInput, "teamId">>;

export type OperationalObjectSeed = {
  readonly objectType: ResponsibilityObjectType;
  readonly objectId: string;
  readonly objectLabel: string;
  readonly ownerUserId?: string;
  readonly unavailable?: boolean;
};

export type ProjectsResourceService = {
  readonly listAssignments: (
    ctx: ServiceRequestContext,
    scopeType?: string,
    scopeId?: string,
  ) => Promise<readonly DeliveryAssignment[]>;
  readonly createAssignment: (
    ctx: ServiceRequestContext,
    input: CreateDeliveryAssignmentInput,
  ) => Promise<DeliveryAssignment>;
  readonly updateAssignment: (
    ctx: ServiceRequestContext,
    assignmentId: string,
    input: UpdateDeliveryAssignmentInput,
  ) => Promise<DeliveryAssignment>;
  readonly reassignAssignment: (
    ctx: ServiceRequestContext,
    assignmentId: string,
    input: ReassignDeliveryAssignmentInput,
  ) => Promise<{
    readonly ended: DeliveryAssignment;
    readonly created: DeliveryAssignment;
  }>;
  readonly listAssignmentHistory: (
    ctx: ServiceRequestContext,
    assignmentId: string,
  ) => Promise<readonly DeliveryAssignmentEvent[]>;
  readonly getTeamHealth: (
    ctx: ServiceRequestContext,
    teamId: string,
  ) => Promise<TeamHealth>;
  readonly getTeamCapacity: (
    ctx: ServiceRequestContext,
    teamId: string,
  ) => Promise<DeliveryCapacity>;
  readonly getTeamForecast: (
    ctx: ServiceRequestContext,
    teamId: string,
  ) => Promise<ResourceForecast>;
  readonly getResponsibilityMatrix: (
    ctx: ServiceRequestContext,
    scopeType: string,
    scopeId: string,
    seeds: readonly OperationalObjectSeed[],
  ) => Promise<ResponsibilityMatrix>;
  readonly upsertResponsibility: (
    ctx: ServiceRequestContext,
    input: {
      readonly scopeType: "project" | "programme" | "initiative";
      readonly scopeId: string;
      readonly objectType: ResponsibilityObjectType;
      readonly objectId: string;
      readonly objectLabel: string;
      readonly dimension: Responsibility["dimension"];
      readonly principalType: Responsibility["principalType"];
      readonly principalId: string;
    },
  ) => Promise<Responsibility>;
  readonly listContinuityCases: (
    ctx: ServiceRequestContext,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly ContinuityCase[]>;
  readonly openContinuityCase: (
    ctx: ServiceRequestContext,
    input: CreateContinuityCaseInput,
  ) => Promise<ContinuityCase>;
  readonly updateContinuityCase: (
    ctx: ServiceRequestContext,
    caseId: string,
    input: UpdateContinuityCaseInput,
  ) => Promise<ContinuityCase>;
  readonly listStakeholders: (
    ctx: ServiceRequestContext,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly Stakeholder[]>;
  readonly createStakeholder: (
    ctx: ServiceRequestContext,
    input: CreateStakeholderInput,
  ) => Promise<Stakeholder>;
  readonly listExternals: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly ExternalParticipant[]>;
  readonly createExternal: (
    ctx: ServiceRequestContext,
    input: CreateExternalParticipantInput,
  ) => Promise<ExternalParticipant>;
};

export function createProjectsResourceService(
  store: ProjectsResourceStore = resolveProjectsResourceStore(),
  options: { readonly loadTeamSignals?: TeamSignalLoader } = {},
): ProjectsResourceService {
  async function signals(
    ctx: ServiceRequestContext,
    teamId: string,
  ): Promise<TeamSignalInput> {
    const base = options.loadTeamSignals
      ? await options.loadTeamSignals(ctx, teamId)
      : {
          memberCount: 0,
          openCommitments: 0,
          agedWaits: 0,
          openExceptions: 0,
          escalations: 0,
          slippedMilestones: 0,
          avgConfidence: 0,
          dueIn7: 0,
          dueIn14: 0,
          dueIn30: 0,
        };
    return { teamId, ...base };
  }

  async function recordEvent(
    ctx: ServiceRequestContext,
    event: Omit<DeliveryAssignmentEvent, "id" | "at"> & { readonly at?: string },
  ) {
    const row: DeliveryAssignmentEvent = Object.freeze({
      id: id("dae"),
      at: event.at ?? now(),
      assignmentId: event.assignmentId,
      kind: event.kind,
      actorUserId: event.actorUserId,
      fromPrincipalId: event.fromPrincipalId,
      toPrincipalId: event.toPrincipalId,
      note: event.note,
    });
    return store.addAssignmentEvent(tenant(ctx), row);
  }

  return {
    listAssignments(ctx, scopeType, scopeId) {
      return store.listAssignments(tenant(ctx), scopeType, scopeId);
    },

    async createAssignment(ctx, input) {
      const ts = now();
      const row: DeliveryAssignment = Object.freeze({
        id: id("das"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        principalType: input.principalType,
        principalId: requireText(input.principalId, "principalId"),
        assignmentType: input.assignmentType ?? "core",
        from: input.from ?? ts,
        to: input.to,
        allocationPercent: input.allocationPercent,
        primaryRoleKey: input.primaryRoleKey,
        notes: input.notes,
        createdAt: ts,
        updatedAt: ts,
      });
      const saved = await store.upsertAssignment(tenant(ctx), row);
      await recordEvent(ctx, {
        assignmentId: saved.id,
        kind: "created",
        actorUserId: ctx.userId ?? "system",
        toPrincipalId: saved.principalId,
      });
      return saved;
    },

    async updateAssignment(ctx, assignmentId, input) {
      const current = await store.getAssignment(tenant(ctx), assignmentId);
      if (!current) throw new Error("assignment_not_found");
      const ended = input.to !== undefined && input.to !== null;
      const next: DeliveryAssignment = Object.freeze({
        ...current,
        assignmentType: input.assignmentType ?? current.assignmentType,
        to: input.to === null ? undefined : (input.to ?? current.to),
        allocationPercent:
          input.allocationPercent === null
            ? undefined
            : (input.allocationPercent ?? current.allocationPercent),
        primaryRoleKey:
          input.primaryRoleKey === null
            ? undefined
            : (input.primaryRoleKey ?? current.primaryRoleKey),
        notes: input.notes === null ? undefined : (input.notes ?? current.notes),
        updatedAt: now(),
      });
      const saved = await store.upsertAssignment(tenant(ctx), next);
      await recordEvent(ctx, {
        assignmentId,
        kind: ended ? "ended" : "updated",
        actorUserId: ctx.userId ?? "system",
        fromPrincipalId: current.principalId,
        note: input.notes ?? undefined,
      });
      return saved;
    },

    async reassignAssignment(ctx, assignmentId, input) {
      const current = await store.getAssignment(tenant(ctx), assignmentId);
      if (!current) throw new Error("assignment_not_found");
      const ts = now();
      const ended = await store.upsertAssignment(tenant(ctx), {
        ...current,
        to: ts,
        updatedAt: ts,
      });
      const created = await this.createAssignment(ctx, {
        scopeType: current.scopeType,
        scopeId: current.scopeId,
        principalType: input.toPrincipalType,
        principalId: requireText(input.toPrincipalId, "toPrincipalId"),
        assignmentType: current.assignmentType,
        allocationPercent: current.allocationPercent,
        primaryRoleKey: current.primaryRoleKey,
        notes: input.notes ?? current.notes,
      });
      await recordEvent(ctx, {
        assignmentId: current.id,
        kind: input.transferAccountability
          ? "accountability_transferred"
          : "reassigned",
        actorUserId: ctx.userId ?? "system",
        fromPrincipalId: current.principalId,
        toPrincipalId: created.principalId,
        note: input.notes,
      });
      return { ended, created };
    },

    listAssignmentHistory(ctx, assignmentId) {
      return store.listAssignmentEvents(tenant(ctx), assignmentId);
    },

    async getTeamHealth(ctx, teamId) {
      return computeTeamHealth(await signals(ctx, teamId));
    },

    async getTeamCapacity(ctx, teamId) {
      return computeDeliveryCapacity(await signals(ctx, teamId));
    },

    async getTeamForecast(ctx, teamId) {
      return computeResourceForecast(await signals(ctx, teamId));
    },

    async getResponsibilityMatrix(ctx, scopeType, scopeId, seeds) {
      const stored = await store.listResponsibilities(tenant(ctx), scopeType, scopeId);
      const byObject = new Map<string, ResponsibilityMatrixRow>();

      for (const seed of seeds) {
        const key = `${seed.objectType}:${seed.objectId}`;
        byObject.set(key, {
          objectType: seed.objectType,
          objectId: seed.objectId,
          objectLabel: seed.objectLabel,
          accountable: seed.ownerUserId,
          consulted: Object.freeze([]),
          informed: Object.freeze([]),
          gap: !seed.ownerUserId,
          continuityFlag: Boolean(seed.unavailable),
        });
      }

      for (const r of stored) {
        const key = `${r.objectType}:${r.objectId}`;
        const existing = byObject.get(key) ?? {
          objectType: r.objectType,
          objectId: r.objectId,
          objectLabel: r.objectLabel,
          consulted: Object.freeze([] as string[]),
          informed: Object.freeze([] as string[]),
          gap: true,
          continuityFlag: false,
        };
        if (r.dimension === "accountable") {
          byObject.set(key, {
            ...existing,
            accountable: r.principalId,
            gap: false,
          });
        } else if (r.dimension === "responsible") {
          byObject.set(key, { ...existing, responsible: r.principalId });
        } else if (r.dimension === "consulted") {
          byObject.set(key, {
            ...existing,
            consulted: Object.freeze([...existing.consulted, r.principalId]),
          });
        } else {
          byObject.set(key, {
            ...existing,
            informed: Object.freeze([...existing.informed, r.principalId]),
          });
        }
      }

      const rows = Object.freeze([...byObject.values()]);
      return {
        scopeType: scopeType as ResponsibilityMatrix["scopeType"],
        scopeId,
        rows,
        gapCount: rows.filter((r) => r.gap).length,
        computedAt: now(),
      };
    },

    async upsertResponsibility(ctx, input) {
      const ts = now();
      const row: Responsibility = Object.freeze({
        id: id("rsc"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        objectType: input.objectType,
        objectId: requireText(input.objectId, "objectId"),
        objectLabel: requireText(input.objectLabel, "objectLabel"),
        dimension: input.dimension,
        principalType: input.principalType,
        principalId: requireText(input.principalId, "principalId"),
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertResponsibility(tenant(ctx), row);
    },

    listContinuityCases(ctx, scopeType, scopeId) {
      return store.listContinuityCases(tenant(ctx), scopeType, scopeId);
    },

    async openContinuityCase(ctx, input) {
      const ts = now();
      const row: ContinuityCase = Object.freeze({
        id: id("ctc"),
        principalId: requireText(input.principalId, "principalId"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        actingOwnerUserId: input.actingOwnerUserId,
        affectedCommitments: Object.freeze([...(input.affectedCommitments ?? [])]),
        affectedMilestones: Object.freeze([...(input.affectedMilestones ?? [])]),
        pendingDecisions: Object.freeze([...(input.pendingDecisions ?? [])]),
        openExceptions: Object.freeze([...(input.openExceptions ?? [])]),
        agedWaitsChasing: Object.freeze([...(input.agedWaitsChasing ?? [])]),
        recommendedReplacementRoles: Object.freeze([
          ...(input.recommendedReplacementRoles ?? ["delivery_lead", "project_owner"]),
        ]),
        status: "open",
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertContinuityCase(tenant(ctx), row);
    },

    async updateContinuityCase(ctx, caseId, input) {
      const current = await store.getContinuityCase(tenant(ctx), caseId);
      if (!current) throw new Error("continuity_case_not_found");
      const next: ContinuityCase = Object.freeze({
        ...current,
        actingOwnerUserId:
          input.actingOwnerUserId === null
            ? undefined
            : (input.actingOwnerUserId ?? current.actingOwnerUserId),
        status: input.status ?? current.status,
        recommendedReplacementRoles: Object.freeze([
          ...(input.recommendedReplacementRoles ?? current.recommendedReplacementRoles),
        ]),
        updatedAt: now(),
      });
      return store.upsertContinuityCase(tenant(ctx), next);
    },

    listStakeholders(ctx, scopeType, scopeId) {
      return store.listStakeholders(tenant(ctx), scopeType, scopeId);
    },

    async createStakeholder(ctx, input) {
      const ts = now();
      const row: Stakeholder = Object.freeze({
        id: id("stk"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        principalType: input.principalType,
        principalId: requireText(input.principalId, "principalId"),
        interest: input.interest,
        influence: input.influence ?? "medium",
        engagementCadence: input.engagementCadence,
        communicationPreference: input.communicationPreference,
        notes: input.notes,
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertStakeholder(tenant(ctx), row);
    },

    listExternals(ctx) {
      return store.listExternals(tenant(ctx));
    },

    async createExternal(ctx, input) {
      const ts = now();
      const row: ExternalParticipant = Object.freeze({
        id: id("ext"),
        displayName: requireText(input.displayName, "displayName"),
        organisation: input.organisation,
        email: input.email,
        linkedUserId: input.linkedUserId,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertExternal(tenant(ctx), row);
    },
  };
}

export {
  getMemoryProjectsResourceStore,
  resetProjectsResourceStoreForTests,
  setProjectsResourceStoreForTests,
  resolveProjectsResourceStore,
} from "./memory-store";
export {
  computeTeamHealth,
  computeDeliveryCapacity,
  computeResourceForecast,
} from "./compute-team-signals";

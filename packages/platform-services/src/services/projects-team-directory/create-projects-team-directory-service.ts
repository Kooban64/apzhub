import { randomUUID } from "node:crypto";

import type {
  CreateEnterpriseDeliveryTeamInput,
  CreateEnterpriseTeamMembershipInput,
  EnterpriseDeliveryTeam,
  EnterpriseTeamMembership,
  ServiceRequestContext,
  UpdateEnterpriseDeliveryTeamInput,
} from "@apzhub/platform-service-contracts";

import {
  resolveProjectsTeamDirectoryStore,
  type ProjectsTeamDirectoryStore,
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

export type ProjectsTeamDirectoryService = {
  readonly listTeams: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly EnterpriseDeliveryTeam[]>;
  readonly getTeam: (
    ctx: ServiceRequestContext,
    teamId: string,
  ) => Promise<EnterpriseDeliveryTeam | null>;
  readonly createTeam: (
    ctx: ServiceRequestContext,
    input: CreateEnterpriseDeliveryTeamInput,
  ) => Promise<EnterpriseDeliveryTeam>;
  readonly updateTeam: (
    ctx: ServiceRequestContext,
    teamId: string,
    input: UpdateEnterpriseDeliveryTeamInput,
  ) => Promise<EnterpriseDeliveryTeam>;
  readonly listMemberships: (
    ctx: ServiceRequestContext,
    teamId: string,
  ) => Promise<readonly EnterpriseTeamMembership[]>;
  readonly addMembership: (
    ctx: ServiceRequestContext,
    teamId: string,
    input: CreateEnterpriseTeamMembershipInput,
  ) => Promise<EnterpriseTeamMembership>;
};

export function createProjectsTeamDirectoryService(
  store: ProjectsTeamDirectoryStore = resolveProjectsTeamDirectoryStore(),
): ProjectsTeamDirectoryService {
  return {
    listTeams(ctx) {
      return store.listTeams(tenant(ctx));
    },

    getTeam(ctx, teamId) {
      return store.getTeam(tenant(ctx), teamId);
    },

    async createTeam(ctx, input) {
      const ts = now();
      const row: EnterpriseDeliveryTeam = Object.freeze({
        id: id("edt"),
        name: requireText(input.name, "name"),
        description: input.description?.trim() || undefined,
        leadUserId: requireText(input.leadUserId, "leadUserId"),
        status: input.status ?? "active",
        skillTags: Object.freeze([...(input.skillTags ?? [])]),
        orgUnitLabel: input.orgUnitLabel?.trim() || undefined,
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertTeam(tenant(ctx), row);
    },

    async updateTeam(ctx, teamId, input) {
      const current = await store.getTeam(tenant(ctx), teamId);
      if (!current) throw new Error("team_not_found");
      const next: EnterpriseDeliveryTeam = Object.freeze({
        ...current,
        name: input.name !== undefined ? requireText(input.name, "name") : current.name,
        leadUserId:
          input.leadUserId !== undefined
            ? requireText(input.leadUserId, "leadUserId")
            : current.leadUserId,
        description:
          input.description === null
            ? undefined
            : (input.description ?? current.description),
        status: input.status ?? current.status,
        skillTags: Object.freeze([...(input.skillTags ?? current.skillTags)]),
        orgUnitLabel:
          input.orgUnitLabel === null
            ? undefined
            : (input.orgUnitLabel ?? current.orgUnitLabel),
        updatedAt: now(),
      });
      return store.upsertTeam(tenant(ctx), next);
    },

    listMemberships(ctx, teamId) {
      return store.listMemberships(tenant(ctx), teamId);
    },

    async addMembership(ctx, teamId, input) {
      const team = await store.getTeam(tenant(ctx), teamId);
      if (!team) throw new Error("team_not_found");
      const ts = now();
      const row: EnterpriseTeamMembership = Object.freeze({
        id: id("etm"),
        teamId,
        userId: requireText(input.userId, "userId"),
        roleInTeam: input.roleInTeam ?? "member",
        from: input.from ?? ts,
        to: input.to,
        allocationPercent: input.allocationPercent,
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertMembership(tenant(ctx), row);
    },
  };
}

export {
  getMemoryProjectsTeamDirectoryStore,
  resetProjectsTeamDirectoryStoreForTests,
  setProjectsTeamDirectoryStoreForTests,
  resolveProjectsTeamDirectoryStore,
} from "./memory-store";

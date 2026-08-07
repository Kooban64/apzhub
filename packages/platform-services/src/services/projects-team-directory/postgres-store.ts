import {
  getDb,
  platformEnterpriseDeliveryTeam,
  platformEnterpriseTeamMembership,
} from "@apzhub/config/db";
import { and, eq } from "drizzle-orm";

import type {
  EnterpriseDeliveryTeam,
  EnterpriseTeamMembership,
  EnterpriseTeamStatus,
  TeamMembershipRole,
} from "@apzhub/platform-service-contracts";

import type { ProjectsTeamDirectoryStore } from "./memory-store";

function mapTeam(
  row: typeof platformEnterpriseDeliveryTeam.$inferSelect,
): EnterpriseDeliveryTeam {
  return Object.freeze({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    leadUserId: row.leadUserId,
    status: row.status as EnterpriseTeamStatus,
    skillTags: Object.freeze([...(row.skillTags ?? [])]),
    orgUnitLabel: row.orgUnitLabel ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapMembership(
  row: typeof platformEnterpriseTeamMembership.$inferSelect,
): EnterpriseTeamMembership {
  return Object.freeze({
    id: row.id,
    teamId: row.teamId,
    userId: row.userId,
    roleInTeam: row.roleInTeam as TeamMembershipRole,
    from: row.fromAt.toISOString(),
    to: row.toAt?.toISOString(),
    allocationPercent: row.allocationPercent ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function createPostgresProjectsTeamDirectoryStore(): ProjectsTeamDirectoryStore {
  const db = getDb();

  return {
    async listTeams(tenantId) {
      const rows = await db
        .select()
        .from(platformEnterpriseDeliveryTeam)
        .where(
          and(
            eq(platformEnterpriseDeliveryTeam.tenantId, tenantId),
            eq(platformEnterpriseDeliveryTeam.status, "active"),
          ),
        );
      return Object.freeze(rows.map(mapTeam));
    },

    async getTeam(tenantId, teamId) {
      const rows = await db
        .select()
        .from(platformEnterpriseDeliveryTeam)
        .where(
          and(
            eq(platformEnterpriseDeliveryTeam.tenantId, tenantId),
            eq(platformEnterpriseDeliveryTeam.id, teamId),
          ),
        )
        .limit(1);
      return rows[0] ? mapTeam(rows[0]) : null;
    },

    async upsertTeam(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        name: row.name,
        description: row.description ?? null,
        leadUserId: row.leadUserId,
        status: row.status,
        skillTags: [...row.skillTags],
        orgUnitLabel: row.orgUnitLabel ?? null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      };
      await db
        .insert(platformEnterpriseDeliveryTeam)
        .values(values)
        .onConflictDoUpdate({
          target: platformEnterpriseDeliveryTeam.id,
          set: { ...values, createdAt: undefined },
        });
      return Object.freeze({ ...row, skillTags: Object.freeze([...row.skillTags]) });
    },

    async listMemberships(tenantId, teamId) {
      const rows = await db
        .select()
        .from(platformEnterpriseTeamMembership)
        .where(
          and(
            eq(platformEnterpriseTeamMembership.tenantId, tenantId),
            eq(platformEnterpriseTeamMembership.teamId, teamId),
          ),
        );
      return Object.freeze(rows.map(mapMembership));
    },

    async upsertMembership(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        teamId: row.teamId,
        userId: row.userId,
        roleInTeam: row.roleInTeam,
        fromAt: new Date(row.from),
        toAt: row.to ? new Date(row.to) : null,
        allocationPercent: row.allocationPercent ?? null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      };
      await db
        .insert(platformEnterpriseTeamMembership)
        .values(values)
        .onConflictDoUpdate({
          target: platformEnterpriseTeamMembership.id,
          set: { ...values, createdAt: undefined },
        });
      return Object.freeze({ ...row });
    },
  };
}

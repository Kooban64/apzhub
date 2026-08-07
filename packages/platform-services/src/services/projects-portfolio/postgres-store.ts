import {
  getDb,
  platformPortfolioEnterprise,
  platformProgramme,
  platformStrategicInitiative,
  platformStrategicObjective,
} from "@apzhub/config/db";
import { and, eq } from "drizzle-orm";

import type {
  EnterprisePortfolio,
  PortfolioNodeStatus,
  Programme,
  StrategicImportance,
  StrategicInitiative,
  StrategicObjective,
  StrategicObjectiveStatus,
} from "@apzhub/platform-service-contracts";

import type { ProjectsPortfolioStore } from "./memory-store";

function mapEnterprise(
  row: typeof platformPortfolioEnterprise.$inferSelect,
): EnterprisePortfolio {
  return Object.freeze({
    id: row.id,
    name: row.name,
    status: row.status as PortfolioNodeStatus,
    initiativeIds: Object.freeze([...(row.initiativeIds ?? [])]),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapInitiative(
  row: typeof platformStrategicInitiative.$inferSelect,
): StrategicInitiative {
  return Object.freeze({
    id: row.id,
    name: row.name,
    sponsorUserId: row.sponsorUserId,
    status: row.status as PortfolioNodeStatus,
    governanceProfileId: row.governanceProfileId ?? undefined,
    strategicObjectiveIds: Object.freeze([...(row.strategicObjectiveIds ?? [])]),
    programmeIds: Object.freeze([...(row.programmeIds ?? [])]),
    projectIds: Object.freeze([...(row.projectIds ?? [])]),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
  });
}

function mapProgramme(row: typeof platformProgramme.$inferSelect): Programme {
  return Object.freeze({
    id: row.id,
    name: row.name,
    ownerUserId: row.ownerUserId,
    strategicInitiativeId: row.strategicInitiativeId ?? undefined,
    classification: row.classification ?? undefined,
    governanceProfileId: row.governanceProfileId ?? undefined,
    status: row.status as PortfolioNodeStatus,
    strategicImportance: row.strategicImportance as StrategicImportance,
    strategicObjectiveIds: Object.freeze([...(row.strategicObjectiveIds ?? [])]),
    memberProjectIds: Object.freeze([...(row.memberProjectIds ?? [])]),
    targetEndAt: row.targetEndAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
  });
}

function mapObjective(
  row: typeof platformStrategicObjective.$inferSelect,
): StrategicObjective {
  return Object.freeze({
    id: row.id,
    name: row.name,
    statement: row.statement,
    ownerUserId: row.ownerUserId,
    status: row.status as StrategicObjectiveStatus,
    progress: row.progress,
    initiativeIds: Object.freeze([...(row.initiativeIds ?? [])]),
    programmeIds: Object.freeze([...(row.programmeIds ?? [])]),
    contributingProjectIds: Object.freeze([...(row.contributingProjectIds ?? [])]),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
  });
}

async function ensureEnterprise(
  db: ReturnType<typeof getDb>,
  tenantId: string,
): Promise<EnterprisePortfolio> {
  const rows = await db
    .select()
    .from(platformPortfolioEnterprise)
    .where(
      and(
        eq(platformPortfolioEnterprise.tenantId, tenantId),
        eq(platformPortfolioEnterprise.id, "enterprise"),
      ),
    )
    .limit(1);
  if (rows[0]) return mapEnterprise(rows[0]);
  const ts = new Date();
  const values = {
    id: "enterprise",
    tenantId,
    name: "Enterprise Portfolio",
    status: "active",
    initiativeIds: [] as string[],
    createdAt: ts,
    updatedAt: ts,
  };
  await db.insert(platformPortfolioEnterprise).values(values);
  const inserted = await db
    .select()
    .from(platformPortfolioEnterprise)
    .where(
      and(
        eq(platformPortfolioEnterprise.tenantId, tenantId),
        eq(platformPortfolioEnterprise.id, "enterprise"),
      ),
    )
    .limit(1);
  return mapEnterprise(inserted[0]!);
}

export function createPostgresProjectsPortfolioStore(): ProjectsPortfolioStore {
  const db = getDb();

  return {
    async getEnterprise(tenantId) {
      return ensureEnterprise(db, tenantId);
    },

    async listInitiatives(tenantId) {
      const rows = await db
        .select()
        .from(platformStrategicInitiative)
        .where(eq(platformStrategicInitiative.tenantId, tenantId));
      return Object.freeze(rows.map(mapInitiative));
    },

    async getInitiative(tenantId, id) {
      const rows = await db
        .select()
        .from(platformStrategicInitiative)
        .where(
          and(
            eq(platformStrategicInitiative.tenantId, tenantId),
            eq(platformStrategicInitiative.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapInitiative(rows[0]) : null;
    },

    async upsertInitiative(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        name: row.name,
        sponsorUserId: row.sponsorUserId,
        status: row.status,
        governanceProfileId: row.governanceProfileId ?? null,
        strategicObjectiveIds: [...row.strategicObjectiveIds],
        programmeIds: [...row.programmeIds],
        projectIds: [...row.projectIds],
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
      };
      await db
        .insert(platformStrategicInitiative)
        .values(values)
        .onConflictDoUpdate({
          target: platformStrategicInitiative.id,
          set: { ...values, createdAt: undefined },
        });

      const enterprise = await ensureEnterprise(db, tenantId);
      if (!enterprise.initiativeIds.includes(row.id) && row.status !== "archived") {
        const nextIds = [...enterprise.initiativeIds, row.id];
        await db
          .update(platformPortfolioEnterprise)
          .set({
            initiativeIds: nextIds,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(platformPortfolioEnterprise.tenantId, tenantId),
              eq(platformPortfolioEnterprise.id, "enterprise"),
            ),
          );
      }
      return Object.freeze({ ...row });
    },

    async listProgrammes(tenantId) {
      const rows = await db
        .select()
        .from(platformProgramme)
        .where(eq(platformProgramme.tenantId, tenantId));
      return Object.freeze(rows.map(mapProgramme));
    },

    async getProgramme(tenantId, id) {
      const rows = await db
        .select()
        .from(platformProgramme)
        .where(
          and(eq(platformProgramme.tenantId, tenantId), eq(platformProgramme.id, id)),
        )
        .limit(1);
      return rows[0] ? mapProgramme(rows[0]) : null;
    },

    async upsertProgramme(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        name: row.name,
        ownerUserId: row.ownerUserId,
        strategicInitiativeId: row.strategicInitiativeId ?? null,
        classification: row.classification ?? null,
        governanceProfileId: row.governanceProfileId ?? null,
        status: row.status,
        strategicImportance: row.strategicImportance,
        strategicObjectiveIds: [...row.strategicObjectiveIds],
        memberProjectIds: [...row.memberProjectIds],
        targetEndAt: row.targetEndAt ? new Date(row.targetEndAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
      };
      await db
        .insert(platformProgramme)
        .values(values)
        .onConflictDoUpdate({
          target: platformProgramme.id,
          set: { ...values, createdAt: undefined },
        });
      return Object.freeze({ ...row });
    },

    async listObjectives(tenantId) {
      const rows = await db
        .select()
        .from(platformStrategicObjective)
        .where(eq(platformStrategicObjective.tenantId, tenantId));
      return Object.freeze(rows.map(mapObjective));
    },

    async getObjective(tenantId, id) {
      const rows = await db
        .select()
        .from(platformStrategicObjective)
        .where(
          and(
            eq(platformStrategicObjective.tenantId, tenantId),
            eq(platformStrategicObjective.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapObjective(rows[0]) : null;
    },

    async upsertObjective(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        name: row.name,
        statement: row.statement,
        ownerUserId: row.ownerUserId,
        status: row.status,
        progress: row.progress,
        initiativeIds: [...row.initiativeIds],
        programmeIds: [...row.programmeIds],
        contributingProjectIds: [...row.contributingProjectIds],
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
      };
      await db
        .insert(platformStrategicObjective)
        .values(values)
        .onConflictDoUpdate({
          target: platformStrategicObjective.id,
          set: { ...values, createdAt: undefined },
        });
      return Object.freeze({ ...row });
    },
  };
}

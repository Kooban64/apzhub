/**
 * Postgres SoR for assignments; accountability entities use memory overlay
 * until full dual-write is required. Assignment CRUD remains on PostgreSQL.
 */
import { getDb, platformDeliveryAssignment } from "@apzhub/config/db";
import { and, eq } from "drizzle-orm";

import type {
  AssignmentPrincipalType,
  AssignmentScopeType,
  AssignmentType,
  DeliveryAssignment,
} from "@apzhub/platform-service-contracts";

import {
  getMemoryProjectsResourceStore,
  type ProjectsResourceStore,
} from "./memory-store";

function mapRow(
  row: typeof platformDeliveryAssignment.$inferSelect,
): DeliveryAssignment {
  return Object.freeze({
    id: row.id,
    scopeType: row.scopeType as AssignmentScopeType,
    scopeId: row.scopeId,
    principalType: row.principalType as AssignmentPrincipalType,
    principalId: row.principalId,
    assignmentType: row.assignmentType as AssignmentType,
    from: row.fromAt.toISOString(),
    to: row.toAt?.toISOString(),
    allocationPercent: row.allocationPercent ?? undefined,
    primaryRoleKey: row.primaryRoleKey ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function createPostgresProjectsResourceStore(): ProjectsResourceStore {
  const db = getDb();
  const mem = getMemoryProjectsResourceStore();

  return {
    async listAssignments(tenantId, scopeType, scopeId) {
      const rows = await db
        .select()
        .from(platformDeliveryAssignment)
        .where(eq(platformDeliveryAssignment.tenantId, tenantId));
      return Object.freeze(
        rows.map(mapRow).filter((a) => {
          if (scopeType && a.scopeType !== scopeType) return false;
          if (scopeId && a.scopeId !== scopeId) return false;
          return true;
        }),
      );
    },
    async getAssignment(tenantId, id) {
      const rows = await db
        .select()
        .from(platformDeliveryAssignment)
        .where(
          and(
            eq(platformDeliveryAssignment.tenantId, tenantId),
            eq(platformDeliveryAssignment.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapRow(rows[0]) : null;
    },
    async upsertAssignment(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        scopeType: row.scopeType,
        scopeId: row.scopeId,
        principalType: row.principalType,
        principalId: row.principalId,
        assignmentType: row.assignmentType,
        fromAt: new Date(row.from),
        toAt: row.to ? new Date(row.to) : null,
        allocationPercent: row.allocationPercent ?? null,
        primaryRoleKey: row.primaryRoleKey ?? null,
        notes: row.notes ?? null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      };
      await db
        .insert(platformDeliveryAssignment)
        .values(values)
        .onConflictDoUpdate({
          target: platformDeliveryAssignment.id,
          set: { ...values, createdAt: undefined },
        });
      return Object.freeze({ ...row });
    },
    listAssignmentEvents: mem.listAssignmentEvents,
    addAssignmentEvent: mem.addAssignmentEvent,
    listResponsibilities: mem.listResponsibilities,
    upsertResponsibility: mem.upsertResponsibility,
    listContinuityCases: mem.listContinuityCases,
    getContinuityCase: mem.getContinuityCase,
    upsertContinuityCase: mem.upsertContinuityCase,
    listStakeholders: mem.listStakeholders,
    upsertStakeholder: mem.upsertStakeholder,
    listExternals: mem.listExternals,
    upsertExternal: mem.upsertExternal,
  };
}

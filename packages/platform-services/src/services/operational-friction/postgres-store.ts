import {
  getDb,
  platformOperationalFriction,
  platformOperationalFrictionAudit,
} from "@apzhub/config/db";
import { and, asc, desc, eq } from "drizzle-orm";

import type {
  FrictionBoardDecision,
  FrictionEngineeringStatus,
  FrictionSource,
  OperationalFriction,
} from "@apzhub/platform-service-contracts";

import type { OperationalFrictionStore } from "./store";

function mapRow(
  row: typeof platformOperationalFriction.$inferSelect,
): OperationalFriction {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    title: row.title,
    reportedAt: row.reportedAt.toISOString(),
    reporter: row.reporter,
    productsAffected: Object.freeze([...(row.productsAffected ?? [])]),
    userRole: row.userRole,
    frustration: row.frustration,
    whoExperiences: row.whoExperiences,
    evidence: row.evidence,
    nonEngineeringOptions: row.nonEngineeringOptions,
    smallestCapability: row.smallestCapability,
    boardDecision: row.boardDecision as FrictionBoardDecision,
    engineeringStatus: row.engineeringStatus as FrictionEngineeringStatus,
    source: row.source as FrictionSource,
    outcomeFaster: row.outcomeFaster ?? null,
    outcomeClearer: row.outcomeClearer ?? null,
    outcomeSafer: row.outcomeSafer ?? null,
    outcomeBetterDecision: row.outcomeBetterDecision ?? null,
    outcomeNotes: row.outcomeNotes ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdByUserId: row.createdByUserId ?? undefined,
    updatedByUserId: row.updatedByUserId ?? undefined,
  });
}

export function createPostgresOperationalFrictionStore(): OperationalFrictionStore {
  return {
    async create(friction) {
      const db = getDb();
      await db.insert(platformOperationalFriction).values({
        id: friction.id,
        tenantId: friction.tenantId,
        title: friction.title,
        reportedAt: new Date(friction.reportedAt),
        reporter: friction.reporter,
        productsAffected: [...friction.productsAffected],
        userRole: friction.userRole,
        frustration: friction.frustration,
        whoExperiences: friction.whoExperiences,
        evidence: friction.evidence,
        nonEngineeringOptions: friction.nonEngineeringOptions,
        smallestCapability: friction.smallestCapability,
        boardDecision: friction.boardDecision,
        engineeringStatus: friction.engineeringStatus,
        source: friction.source,
        outcomeFaster: friction.outcomeFaster,
        outcomeClearer: friction.outcomeClearer,
        outcomeSafer: friction.outcomeSafer,
        outcomeBetterDecision: friction.outcomeBetterDecision,
        outcomeNotes: friction.outcomeNotes,
        createdAt: new Date(friction.createdAt),
        updatedAt: new Date(friction.updatedAt),
        createdByUserId: friction.createdByUserId,
        updatedByUserId: friction.updatedByUserId,
      });
      return friction;
    },

    async update(friction) {
      const db = getDb();
      await db
        .update(platformOperationalFriction)
        .set({
          title: friction.title,
          reporter: friction.reporter,
          productsAffected: [...friction.productsAffected],
          userRole: friction.userRole,
          frustration: friction.frustration,
          whoExperiences: friction.whoExperiences,
          evidence: friction.evidence,
          nonEngineeringOptions: friction.nonEngineeringOptions,
          smallestCapability: friction.smallestCapability,
          boardDecision: friction.boardDecision,
          engineeringStatus: friction.engineeringStatus,
          outcomeFaster: friction.outcomeFaster,
          outcomeClearer: friction.outcomeClearer,
          outcomeSafer: friction.outcomeSafer,
          outcomeBetterDecision: friction.outcomeBetterDecision,
          outcomeNotes: friction.outcomeNotes,
          updatedAt: new Date(friction.updatedAt),
          updatedByUserId: friction.updatedByUserId,
        })
        .where(
          and(
            eq(platformOperationalFriction.tenantId, friction.tenantId),
            eq(platformOperationalFriction.id, friction.id),
          ),
        );
      return friction;
    },

    async get(tenantId, id) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformOperationalFriction)
        .where(
          and(
            eq(platformOperationalFriction.tenantId, tenantId),
            eq(platformOperationalFriction.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapRow(rows[0]) : null;
    },

    async list(tenantId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformOperationalFriction)
        .where(eq(platformOperationalFriction.tenantId, tenantId))
        .orderBy(desc(platformOperationalFriction.updatedAt));
      return rows.map(mapRow);
    },

    async appendAudit(entry) {
      const db = getDb();
      await db.insert(platformOperationalFrictionAudit).values({
        id: entry.id,
        frictionId: entry.frictionId,
        tenantId: entry.tenantId,
        actorUserId: entry.actorUserId,
        action: entry.action,
        detailJson: { ...entry.detail },
        createdAt: new Date(entry.createdAt),
      });
    },

    async listAudit(tenantId, frictionId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformOperationalFrictionAudit)
        .where(
          and(
            eq(platformOperationalFrictionAudit.tenantId, tenantId),
            eq(platformOperationalFrictionAudit.frictionId, frictionId),
          ),
        )
        .orderBy(asc(platformOperationalFrictionAudit.createdAt));
      return rows.map((row) =>
        Object.freeze({
          id: row.id,
          frictionId: row.frictionId,
          tenantId: row.tenantId,
          actorUserId: row.actorUserId,
          action: row.action,
          detail: Object.freeze({ ...(row.detailJson ?? {}) }),
          createdAt: row.createdAt.toISOString(),
        }),
      );
    },
  };
}

import { getDb, platformKnowledgeObject } from "@apzhub/config/db";
import { and, desc, eq } from "drizzle-orm";

import type {
  KnowledgeLibraryCategory,
  KnowledgeLifecycleStatus,
  KnowledgeObject,
  KnowledgeObjectKind,
  KnowledgeVersionEntry,
} from "@apzhub/platform-service-contracts";

import type { OrganisationalMemoryStore } from "./memory-store";

function mapRow(row: typeof platformKnowledgeObject.$inferSelect): KnowledgeObject {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    kind: row.kind as KnowledgeObjectKind,
    title: row.title,
    summary: row.summary,
    body: Object.freeze({ ...(row.body ?? {}) }),
    owner: row.owner,
    version: row.version,
    status: row.status as KnowledgeLifecycleStatus,
    tags: Object.freeze([...(row.tags ?? [])]),
    relatedProducts: Object.freeze([...(row.relatedProducts ?? [])]),
    relatedCapabilities: Object.freeze([...(row.relatedCapabilities ?? [])]),
    libraryCategory:
      (row.libraryCategory as KnowledgeLibraryCategory | null) ?? undefined,
    decisionRef: row.decisionRef ?? undefined,
    reviewDate: row.reviewDate?.toISOString(),
    expiresAt: row.expiresAt?.toISOString(),
    versionHistory: Object.freeze([
      ...(row.versionHistory ?? []),
    ] as KnowledgeVersionEntry[]),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function createPostgresOrganisationalMemoryStore(): OrganisationalMemoryStore {
  return {
    async list(tenantId, kind) {
      const db = getDb();
      const rows = kind
        ? await db
            .select()
            .from(platformKnowledgeObject)
            .where(
              and(
                eq(platformKnowledgeObject.tenantId, tenantId),
                eq(platformKnowledgeObject.kind, kind),
              ),
            )
            .orderBy(desc(platformKnowledgeObject.updatedAt))
        : await db
            .select()
            .from(platformKnowledgeObject)
            .where(eq(platformKnowledgeObject.tenantId, tenantId))
            .orderBy(desc(platformKnowledgeObject.updatedAt));
      return rows.map(mapRow);
    },

    async get(tenantId, id) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformKnowledgeObject)
        .where(
          and(
            eq(platformKnowledgeObject.tenantId, tenantId),
            eq(platformKnowledgeObject.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapRow(rows[0]) : null;
    },

    async upsert(item) {
      const db = getDb();
      await db
        .insert(platformKnowledgeObject)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          kind: item.kind,
          title: item.title,
          summary: item.summary,
          body: { ...item.body },
          owner: item.owner,
          version: item.version,
          status: item.status,
          tags: [...item.tags],
          relatedProducts: [...item.relatedProducts],
          relatedCapabilities: [...item.relatedCapabilities],
          libraryCategory: item.libraryCategory ?? null,
          decisionRef: item.decisionRef ?? null,
          reviewDate: item.reviewDate ? new Date(item.reviewDate) : null,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
          versionHistory: [...item.versionHistory],
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformKnowledgeObject.id,
          set: {
            title: item.title,
            summary: item.summary,
            body: { ...item.body },
            owner: item.owner,
            version: item.version,
            status: item.status,
            tags: [...item.tags],
            relatedProducts: [...item.relatedProducts],
            relatedCapabilities: [...item.relatedCapabilities],
            libraryCategory: item.libraryCategory ?? null,
            decisionRef: item.decisionRef ?? null,
            reviewDate: item.reviewDate ? new Date(item.reviewDate) : null,
            expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
            versionHistory: [...item.versionHistory],
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },
  };
}

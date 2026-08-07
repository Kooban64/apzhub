import { randomUUID } from "node:crypto";

import type {
  CreateDecisionKnowledgeInput,
  CreateKnowledgeLessonInput,
  CreateKnowledgeLibraryItemInput,
  KnowledgeLibraryCategory,
  KnowledgeLifecycleStatus,
  KnowledgeObject,
  KnowledgeObjectKind,
  KnowledgeQualityReport,
  KnowledgeVersionEntry,
  ServiceRequestContext,
  TransitionKnowledgeLifecycleInput,
  UpdateKnowledgeObjectInput,
} from "@apzhub/platform-service-contracts";

import { computeKnowledgeQuality } from "./compute-quality";
import {
  getMemoryOrganisationalMemoryStore,
  type OrganisationalMemoryStore,
} from "./memory-store";
import { createPostgresOrganisationalMemoryStore } from "./postgres-store";

function requireText(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`organisational_memory_${field}_required`);
  return trimmed;
}

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

const LIFECYCLE: readonly KnowledgeLifecycleStatus[] = [
  "draft",
  "review",
  "approved",
  "archived",
];

const LIBRARY_KIND: Record<KnowledgeLibraryCategory, KnowledgeObjectKind> = {
  standards: "standard",
  procedures: "procedure",
  best_practices: "best_practice",
  operational_guides: "operational_guide",
  reference_material: "reference",
};

function historyEntry(
  version: number,
  status: KnowledgeLifecycleStatus,
  actor: string,
  note?: string,
): KnowledgeVersionEntry {
  return Object.freeze({
    version,
    status,
    at: new Date().toISOString(),
    actor,
    note,
  });
}

export type OrganisationalMemoryService = {
  list(
    ctx: ServiceRequestContext,
    kind?: KnowledgeObjectKind,
  ): Promise<readonly KnowledgeObject[]>;
  get(ctx: ServiceRequestContext, objectId: string): Promise<KnowledgeObject | null>;
  createLesson(
    ctx: ServiceRequestContext,
    input: CreateKnowledgeLessonInput,
  ): Promise<KnowledgeObject>;
  createLibraryItem(
    ctx: ServiceRequestContext,
    input: CreateKnowledgeLibraryItemInput,
  ): Promise<KnowledgeObject>;
  createDecisionKnowledge(
    ctx: ServiceRequestContext,
    input: CreateDecisionKnowledgeInput,
  ): Promise<KnowledgeObject>;
  update(
    ctx: ServiceRequestContext,
    objectId: string,
    input: UpdateKnowledgeObjectInput,
  ): Promise<KnowledgeObject>;
  transitionLifecycle(
    ctx: ServiceRequestContext,
    objectId: string,
    input: TransitionKnowledgeLifecycleInput,
  ): Promise<KnowledgeObject>;
  getQuality(ctx: ServiceRequestContext): Promise<KnowledgeQualityReport>;
};

let preferred: OrganisationalMemoryStore | undefined;

export function setOrganisationalMemoryStoreForTests(store: OrganisationalMemoryStore) {
  preferred = store;
}

export function resolveOrganisationalMemoryStore(): OrganisationalMemoryStore {
  if (preferred) return preferred;
  if (process.env.APZHUB_KNOWLEDGE_MEMORY_STORE === "memory") {
    return getMemoryOrganisationalMemoryStore();
  }
  try {
    return createPostgresOrganisationalMemoryStore();
  } catch {
    return getMemoryOrganisationalMemoryStore();
  }
}

export function createOrganisationalMemoryService(
  store: OrganisationalMemoryStore = resolveOrganisationalMemoryStore(),
): OrganisationalMemoryService {
  const tenant = (ctx: ServiceRequestContext) => ctx.tenantId ?? "default";
  const actor = (ctx: ServiceRequestContext) => ctx.userId ?? "system";

  async function createBase(
    ctx: ServiceRequestContext,
    partial: Omit<
      KnowledgeObject,
      | "id"
      | "tenantId"
      | "version"
      | "status"
      | "versionHistory"
      | "createdAt"
      | "updatedAt"
    >,
  ): Promise<KnowledgeObject> {
    const now = new Date().toISOString();
    const item: KnowledgeObject = Object.freeze({
      id: id("kobj"),
      tenantId: tenant(ctx),
      ...partial,
      version: 1,
      status: "draft",
      versionHistory: Object.freeze([historyEntry(1, "draft", actor(ctx), "created")]),
      createdAt: now,
      updatedAt: now,
    });
    return store.upsert(item);
  }

  return {
    async list(ctx, kind) {
      return store.list(tenant(ctx), kind);
    },

    async get(ctx, objectId) {
      return store.get(tenant(ctx), objectId);
    },

    async createLesson(ctx, input) {
      return createBase(ctx, {
        kind: "lesson",
        title: requireText(input.title, "title"),
        summary: requireText(input.summary, "summary"),
        body: Object.freeze({
          context: requireText(input.context, "context"),
          situation: requireText(input.situation, "situation"),
          resolution: requireText(input.resolution, "resolution"),
          recommendation: requireText(input.recommendation, "recommendation"),
        }),
        owner: requireText(input.owner, "owner"),
        tags: Object.freeze([...(input.tags ?? [])]),
        relatedProducts: Object.freeze([...(input.relatedProducts ?? [])]),
        relatedCapabilities: Object.freeze([...(input.relatedCapabilities ?? [])]),
        reviewDate: input.reviewDate,
        expiresAt: input.expiresAt,
      });
    },

    async createLibraryItem(ctx, input) {
      const kind = LIBRARY_KIND[input.libraryCategory];
      if (!kind) throw new Error("organisational_memory_library_category_invalid");
      return createBase(ctx, {
        kind,
        title: requireText(input.title, "title"),
        summary: requireText(input.summary, "summary"),
        body: Object.freeze({
          content: requireText(input.content, "content"),
        }),
        owner: requireText(input.owner, "owner"),
        tags: Object.freeze([...(input.tags ?? [])]),
        relatedProducts: Object.freeze([...(input.relatedProducts ?? [])]),
        relatedCapabilities: Object.freeze([...(input.relatedCapabilities ?? [])]),
        libraryCategory: input.libraryCategory,
        reviewDate: input.reviewDate,
        expiresAt: input.expiresAt,
      });
    },

    async createDecisionKnowledge(ctx, input) {
      return createBase(ctx, {
        kind: "decision_knowledge",
        title: requireText(input.title, "title"),
        summary: requireText(input.summary, "summary"),
        body: Object.freeze({
          rationale: requireText(input.rationale, "rationale"),
          relatedQuestionId: input.relatedQuestionId,
        }),
        owner: requireText(input.owner, "owner"),
        tags: Object.freeze([...(input.tags ?? [])]),
        relatedProducts: Object.freeze([...(input.relatedProducts ?? [])]),
        relatedCapabilities: Object.freeze([]),
        decisionRef: requireText(input.decisionRef, "decision_ref"),
        reviewDate: input.reviewDate,
      });
    },

    async update(ctx, objectId, input) {
      const existing = await store.get(tenant(ctx), objectId);
      if (!existing) throw new Error("organisational_memory_not_found");
      if (existing.status === "archived") {
        throw new Error("organisational_memory_archived");
      }
      const now = new Date().toISOString();
      const version = existing.version + 1;
      const item: KnowledgeObject = Object.freeze({
        ...existing,
        title:
          input.title !== undefined
            ? requireText(input.title, "title")
            : existing.title,
        summary:
          input.summary !== undefined
            ? requireText(input.summary, "summary")
            : existing.summary,
        body: Object.freeze(
          input.body !== undefined
            ? { ...existing.body, ...input.body }
            : { ...existing.body },
        ),
        owner:
          input.owner !== undefined
            ? requireText(input.owner, "owner")
            : existing.owner,
        tags: Object.freeze(
          input.tags !== undefined ? [...input.tags] : [...existing.tags],
        ),
        relatedProducts: Object.freeze(
          input.relatedProducts !== undefined
            ? [...input.relatedProducts]
            : [...existing.relatedProducts],
        ),
        relatedCapabilities: Object.freeze(
          input.relatedCapabilities !== undefined
            ? [...input.relatedCapabilities]
            : [...existing.relatedCapabilities],
        ),
        reviewDate:
          input.reviewDate === null
            ? undefined
            : (input.reviewDate ?? existing.reviewDate),
        expiresAt:
          input.expiresAt === null
            ? undefined
            : (input.expiresAt ?? existing.expiresAt),
        decisionRef: input.decisionRef ?? existing.decisionRef,
        version,
        versionHistory: Object.freeze([
          ...existing.versionHistory,
          historyEntry(version, existing.status, actor(ctx), "updated"),
        ]),
        updatedAt: now,
      });
      return store.upsert(item);
    },

    async transitionLifecycle(ctx, objectId, input) {
      if (!LIFECYCLE.includes(input.status)) {
        throw new Error("organisational_memory_status_invalid");
      }
      const existing = await store.get(tenant(ctx), objectId);
      if (!existing) throw new Error("organisational_memory_not_found");
      const now = new Date().toISOString();
      const version = existing.version + 1;
      const item: KnowledgeObject = Object.freeze({
        ...existing,
        status: input.status,
        version,
        versionHistory: Object.freeze([
          ...existing.versionHistory,
          historyEntry(version, input.status, actor(ctx), input.note),
        ]),
        updatedAt: now,
      });
      return store.upsert(item);
    },

    async getQuality(ctx) {
      const objects = await store.list(tenant(ctx));
      return computeKnowledgeQuality(objects);
    },
  };
}

/**
 * W009 / PX-06 — Projects Productivity Platform Service.
 */

import { randomUUID } from "node:crypto";

import type {
  BulkOperation,
  ConfirmBulkOperationInput,
  CreateBulkOperationInput,
  CreateProductivitySessionInput,
  CreateSavedSearchInput,
  CrossProductNavTarget,
  ProductivitySession,
  ProjectsShortcut,
  SavedSearch,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  BULK_OPERATION_KINDS,
  CROSS_PRODUCT_TARGETS,
  PROJECTS_SHORTCUT_CATALOGUE,
} from "@apzhub/platform-service-contracts";

import {
  resolveProjectsProductivityStore,
  type ProjectsProductivityStore,
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

function requireUser(ctx: ServiceRequestContext): string {
  const uid = ctx.userId?.trim() ?? "";
  if (!uid) throw new Error("user_required");
  return uid;
}

function requireText(value: string | undefined, field: string): string {
  const t = value?.trim() ?? "";
  if (!t) throw new Error(`${field}_required`);
  return t;
}

export type ProjectsProductivityService = {
  readonly listSavedSearches: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly SavedSearch[]>;
  readonly createSavedSearch: (
    ctx: ServiceRequestContext,
    input: CreateSavedSearchInput,
  ) => Promise<SavedSearch>;
  readonly deleteSavedSearch: (
    ctx: ServiceRequestContext,
    searchId: string,
  ) => Promise<void>;
  readonly createBulkOperation: (
    ctx: ServiceRequestContext,
    input: CreateBulkOperationInput,
  ) => Promise<BulkOperation>;
  readonly confirmBulkOperation: (
    ctx: ServiceRequestContext,
    operationId: string,
    input: ConfirmBulkOperationInput,
  ) => Promise<BulkOperation>;
  readonly getBulkOperation: (
    ctx: ServiceRequestContext,
    operationId: string,
  ) => Promise<BulkOperation | null>;
  readonly listSessions: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly ProductivitySession[]>;
  readonly createSession: (
    ctx: ServiceRequestContext,
    input: CreateProductivitySessionInput,
  ) => Promise<ProductivitySession>;
  readonly resumeSession: (
    ctx: ServiceRequestContext,
    sessionId: string,
  ) => Promise<ProductivitySession>;
  readonly listShortcuts: () => readonly ProjectsShortcut[];
  readonly listCrossProductTargets: () => readonly CrossProductNavTarget[];
};

export {
  getMemoryProjectsProductivityStore,
  resetProjectsProductivityStoreForTests,
  setProjectsProductivityStoreForTests,
  resolveProjectsProductivityStore,
} from "./memory-store";

export function createProjectsProductivityService(
  store?: ProjectsProductivityStore,
): ProjectsProductivityService {
  const s = resolveProjectsProductivityStore(store);

  return {
    async listSavedSearches(ctx) {
      return s.listSavedSearches(tenant(ctx), requireUser(ctx));
    },

    async createSavedSearch(ctx, input) {
      const userId = requireUser(ctx);
      const row: SavedSearch = {
        id: id("ss"),
        name: requireText(input.name, "name"),
        query: requireText(input.query, "query"),
        facets: input.facets ?? {},
        scopeMode: input.scopeMode ?? "global",
        ownerUserId: userId,
        createdAt: now(),
        updatedAt: now(),
      };
      await s.upsertSavedSearch(tenant(ctx), row);
      await s.publishEvent(tenant(ctx), "projects.saved_search.created", {
        id: row.id,
        ownerUserId: userId,
      });
      return row;
    },

    async deleteSavedSearch(ctx, searchId) {
      const userId = requireUser(ctx);
      const existing = await s.getSavedSearch(tenant(ctx), searchId);
      if (!existing) throw new Error("saved_search_not_found");
      if (existing.ownerUserId !== userId) throw new Error("saved_search_forbidden");
      await s.deleteSavedSearch(tenant(ctx), searchId);
      await s.publishEvent(tenant(ctx), "projects.saved_search.deleted", {
        id: searchId,
        ownerUserId: userId,
      });
    },

    async createBulkOperation(ctx, input) {
      const userId = requireUser(ctx);
      if (!(BULK_OPERATION_KINDS as readonly string[]).includes(input.kind)) {
        throw new Error("bulk_kind_invalid");
      }
      if (!input.objectIds?.length) throw new Error("object_ids_required");
      if (input.objectIds.length > 100) throw new Error("bulk_limit_exceeded");

      const row: BulkOperation = {
        id: id("bulk"),
        kind: input.kind,
        objectIds: [...input.objectIds],
        payload: input.payload ?? {},
        status: "pending_confirm",
        actorUserId: userId,
        confirmationToken: id("tok"),
        createdAt: now(),
      };
      await s.upsertBulkOperation(tenant(ctx), row);
      await s.publishEvent(tenant(ctx), "projects.bulk_operation.prepared", {
        id: row.id,
        kind: row.kind,
        count: row.objectIds.length,
        actorUserId: userId,
      });
      return row;
    },

    async confirmBulkOperation(ctx, operationId, input) {
      const userId = requireUser(ctx);
      const existing = await s.getBulkOperation(tenant(ctx), operationId);
      if (!existing) throw new Error("bulk_operation_not_found");
      if (existing.actorUserId !== userId) throw new Error("bulk_operation_forbidden");
      if (existing.status !== "pending_confirm") {
        throw new Error("bulk_operation_not_pending");
      }
      if (input.confirmationToken !== existing.confirmationToken) {
        throw new Error("bulk_confirmation_invalid");
      }

      const executed: BulkOperation = {
        ...existing,
        status: "executed",
        auditNote: input.auditNote?.trim() || undefined,
        executedAt: now(),
      };
      await s.upsertBulkOperation(tenant(ctx), executed);
      await s.publishEvent(tenant(ctx), "projects.bulk_operation.executed", {
        id: executed.id,
        kind: executed.kind,
        count: executed.objectIds.length,
        actorUserId: userId,
        auditNote: executed.auditNote,
        objectIds: executed.objectIds,
      });
      return executed;
    },

    async getBulkOperation(ctx, operationId) {
      return s.getBulkOperation(tenant(ctx), operationId);
    },

    async listSessions(ctx) {
      return s.listSessions(tenant(ctx), requireUser(ctx));
    },

    async createSession(ctx, input) {
      const userId = requireUser(ctx);
      const ts = now();
      const row: ProductivitySession = {
        id: id("psess"),
        type: requireText(input.type, "type"),
        name: input.name?.trim() || undefined,
        scopeSnapshot: input.scopeSnapshot ?? {},
        openedObjectIds: input.openedObjectIds ?? [],
        ownerUserId: userId,
        createdAt: ts,
        lastResumedAt: ts,
      };
      await s.upsertSession(tenant(ctx), row);
      return row;
    },

    async resumeSession(ctx, sessionId) {
      const userId = requireUser(ctx);
      const existing = await s.getSession(tenant(ctx), sessionId);
      if (!existing) throw new Error("session_not_found");
      if (existing.ownerUserId !== userId) throw new Error("session_forbidden");
      const resumed: ProductivitySession = {
        ...existing,
        lastResumedAt: now(),
      };
      await s.upsertSession(tenant(ctx), resumed);
      await s.publishEvent(tenant(ctx), "projects.productivity_session.resumed", {
        id: resumed.id,
        ownerUserId: userId,
      });
      return resumed;
    },

    listShortcuts() {
      return PROJECTS_SHORTCUT_CATALOGUE;
    },

    listCrossProductTargets() {
      return CROSS_PRODUCT_TARGETS;
    },
  };
}

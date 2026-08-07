import { randomUUID } from "node:crypto";

import type {
  CreateOperationalFrictionInput,
  OperationalFriction,
  OperationalFrictionAuditEntry,
  ServiceRequestContext,
  UpdateOperationalFrictionInput,
} from "@apzhub/platform-service-contracts";
import {
  FRICTION_BOARD_DECISIONS,
  FRICTION_ENGINEERING_STATUSES,
  FRICTION_SOURCES,
} from "@apzhub/platform-service-contracts";

import { getMemoryOperationalFrictionStore } from "./memory-store";
import { createPostgresOperationalFrictionStore } from "./postgres-store";
import type { OperationalFrictionStore } from "./store";

function requireText(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`friction_${field}_required`);
  return trimmed;
}

export type OperationalFrictionService = {
  create(
    ctx: ServiceRequestContext,
    input: CreateOperationalFrictionInput,
  ): Promise<OperationalFriction>;
  update(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateOperationalFrictionInput,
  ): Promise<OperationalFriction>;
  get(ctx: ServiceRequestContext, id: string): Promise<OperationalFriction | null>;
  list(ctx: ServiceRequestContext): Promise<readonly OperationalFriction[]>;
  listAudit(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly OperationalFrictionAuditEntry[]>;
};

let preferredStore: OperationalFrictionStore | undefined;

export function setOperationalFrictionStoreForTests(
  store: OperationalFrictionStore,
): void {
  preferredStore = store;
}

export function resolveOperationalFrictionStore(): OperationalFrictionStore {
  if (preferredStore) return preferredStore;
  if (process.env.APZHUB_FRICTION_STORE === "memory") {
    return getMemoryOperationalFrictionStore();
  }
  try {
    return createPostgresOperationalFrictionStore();
  } catch {
    return getMemoryOperationalFrictionStore();
  }
}

async function withStoreFallback<T>(
  store: OperationalFrictionStore,
  run: (active: OperationalFrictionStore) => Promise<T>,
): Promise<T> {
  try {
    return await run(store);
  } catch {
    if (store === getMemoryOperationalFrictionStore())
      throw new Error("friction_store_failed");
    return run(getMemoryOperationalFrictionStore());
  }
}

export function createOperationalFrictionService(
  store: OperationalFrictionStore = resolveOperationalFrictionStore(),
): OperationalFrictionService {
  return {
    async create(ctx, input) {
      const now = new Date().toISOString();
      const tenantId = ctx.tenantId ?? "default";
      const boardDecision = input.boardDecision ?? "needs_more_evidence";
      const engineeringStatus = input.engineeringStatus ?? "no_engineering";
      const source = input.source ?? "manual";

      if (!FRICTION_BOARD_DECISIONS.includes(boardDecision)) {
        throw new Error("friction_board_decision_invalid");
      }
      if (!FRICTION_ENGINEERING_STATUSES.includes(engineeringStatus)) {
        throw new Error("friction_engineering_status_invalid");
      }
      if (!FRICTION_SOURCES.includes(source)) {
        throw new Error("friction_source_invalid");
      }

      const friction: OperationalFriction = Object.freeze({
        id: `ofr_${randomUUID().replace(/-/g, "")}`,
        tenantId,
        title: requireText(input.title, "title"),
        reportedAt: input.reportedAt ?? now,
        reporter: requireText(input.reporter, "reporter"),
        productsAffected: Object.freeze(
          (input.productsAffected ?? []).map((item) => item.trim()).filter(Boolean),
        ),
        userRole: requireText(input.userRole, "userRole"),
        frustration: requireText(input.frustration, "frustration"),
        whoExperiences: requireText(input.whoExperiences, "whoExperiences"),
        evidence: requireText(input.evidence, "evidence"),
        nonEngineeringOptions: requireText(
          input.nonEngineeringOptions,
          "nonEngineeringOptions",
        ),
        smallestCapability: requireText(input.smallestCapability, "smallestCapability"),
        boardDecision,
        engineeringStatus,
        source,
        outcomeFaster: null,
        outcomeClearer: null,
        outcomeSafer: null,
        outcomeBetterDecision: null,
        outcomeNotes: null,
        createdAt: now,
        updatedAt: now,
        createdByUserId: ctx.userId,
        updatedByUserId: ctx.userId,
      });

      return withStoreFallback(store, async (active) => {
        const created = await active.create(friction);
        await active.appendAudit({
          id: `ofa_${randomUUID().replace(/-/g, "")}`,
          frictionId: created.id,
          tenantId,
          actorUserId: ctx.userId ?? "unknown",
          action: "created",
          detail: { source: created.source, boardDecision: created.boardDecision },
          createdAt: now,
        });
        return created;
      });
    },

    async update(ctx, id, input) {
      const tenantId = ctx.tenantId ?? "default";
      return withStoreFallback(store, async (active) => {
        const existing = await active.get(tenantId, id);
        if (!existing) throw new Error("friction_not_found");

        if (
          input.boardDecision &&
          !FRICTION_BOARD_DECISIONS.includes(input.boardDecision)
        ) {
          throw new Error("friction_board_decision_invalid");
        }
        if (
          input.engineeringStatus &&
          !FRICTION_ENGINEERING_STATUSES.includes(input.engineeringStatus)
        ) {
          throw new Error("friction_engineering_status_invalid");
        }

        const now = new Date().toISOString();
        const updated: OperationalFriction = Object.freeze({
          ...existing,
          title:
            input.title !== undefined
              ? requireText(input.title, "title")
              : existing.title,
          reporter:
            input.reporter !== undefined
              ? requireText(input.reporter, "reporter")
              : existing.reporter,
          productsAffected:
            input.productsAffected !== undefined
              ? Object.freeze(
                  input.productsAffected.map((item) => item.trim()).filter(Boolean),
                )
              : existing.productsAffected,
          userRole:
            input.userRole !== undefined
              ? requireText(input.userRole, "userRole")
              : existing.userRole,
          frustration:
            input.frustration !== undefined
              ? requireText(input.frustration, "frustration")
              : existing.frustration,
          whoExperiences:
            input.whoExperiences !== undefined
              ? requireText(input.whoExperiences, "whoExperiences")
              : existing.whoExperiences,
          evidence:
            input.evidence !== undefined
              ? requireText(input.evidence, "evidence")
              : existing.evidence,
          nonEngineeringOptions:
            input.nonEngineeringOptions !== undefined
              ? requireText(input.nonEngineeringOptions, "nonEngineeringOptions")
              : existing.nonEngineeringOptions,
          smallestCapability:
            input.smallestCapability !== undefined
              ? requireText(input.smallestCapability, "smallestCapability")
              : existing.smallestCapability,
          boardDecision: input.boardDecision ?? existing.boardDecision,
          engineeringStatus: input.engineeringStatus ?? existing.engineeringStatus,
          outcomeFaster:
            input.outcomeFaster !== undefined
              ? input.outcomeFaster
              : existing.outcomeFaster,
          outcomeClearer:
            input.outcomeClearer !== undefined
              ? input.outcomeClearer
              : existing.outcomeClearer,
          outcomeSafer:
            input.outcomeSafer !== undefined
              ? input.outcomeSafer
              : existing.outcomeSafer,
          outcomeBetterDecision:
            input.outcomeBetterDecision !== undefined
              ? input.outcomeBetterDecision
              : existing.outcomeBetterDecision,
          outcomeNotes:
            input.outcomeNotes !== undefined
              ? input.outcomeNotes
              : existing.outcomeNotes,
          updatedAt: now,
          updatedByUserId: ctx.userId,
        });

        const saved = await active.update(updated);
        await active.appendAudit({
          id: `ofa_${randomUUID().replace(/-/g, "")}`,
          frictionId: saved.id,
          tenantId,
          actorUserId: ctx.userId ?? "unknown",
          action: "updated",
          detail: {
            boardDecision: saved.boardDecision,
            engineeringStatus: saved.engineeringStatus,
          },
          createdAt: now,
        });
        return saved;
      });
    },

    async get(ctx, id) {
      const tenantId = ctx.tenantId ?? "default";
      return withStoreFallback(store, (active) => active.get(tenantId, id));
    },

    async list(ctx) {
      const tenantId = ctx.tenantId ?? "default";
      return withStoreFallback(store, (active) => active.list(tenantId));
    },

    async listAudit(ctx, id) {
      const tenantId = ctx.tenantId ?? "default";
      return withStoreFallback(store, (active) => active.listAudit(tenantId, id));
    },
  };
}

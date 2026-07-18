/**
 * Generic product lifecycle → orchestration hooks (APZSEARCH-016).
 * Composition only — does not modify platform product service packages.
 */

import type { PublicationDispatcher } from "../dispatcher";
import type { PublicationProductId } from "../types";
import {
  enqueueProductPublicationSafely,
  type ProductPublicationHookContext,
} from "./safe-hooks";

export type ProductEntityLike = {
  readonly id: string;
  readonly name?: string;
  readonly title?: string;
  readonly summary?: string;
  readonly description?: string;
  readonly status?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type ProductHookOptions = {
  readonly productId: PublicationProductId;
  readonly entityType: string;
  readonly navigationBasePath: string;
};

function draftFromEntity(entity: ProductEntityLike, options: ProductHookOptions) {
  return {
    entityId: entity.id,
    entityType: options.entityType,
    title: entity.title ?? entity.name ?? entity.id,
    summary: entity.summary ?? entity.description,
    metadata: entity.status ? { status: entity.status } : {},
    navigationTarget: `${options.navigationBasePath}/${entity.id}`,
    sourceId: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function enqueueCreatePublication(
  dispatcher: PublicationDispatcher,
  context: ProductPublicationHookContext,
  options: ProductHookOptions,
  entity: ProductEntityLike,
): Promise<{ readonly accepted: boolean; readonly deduplicated?: boolean }> {
  return enqueueProductPublicationSafely(dispatcher, context, {
    entityId: entity.id,
    entityType: options.entityType,
    productId: options.productId,
    operation: "publish",
    payload: draftFromEntity(entity, options),
  });
}

export function enqueueUpdatePublication(
  dispatcher: PublicationDispatcher,
  context: ProductPublicationHookContext,
  options: ProductHookOptions,
  entity: ProductEntityLike,
): Promise<{ readonly accepted: boolean; readonly deduplicated?: boolean }> {
  return enqueueProductPublicationSafely(dispatcher, context, {
    entityId: entity.id,
    entityType: options.entityType,
    productId: options.productId,
    operation: "update",
    payload: draftFromEntity(entity, options),
  });
}

export function enqueueArchivePublication(
  dispatcher: PublicationDispatcher,
  context: ProductPublicationHookContext,
  options: ProductHookOptions,
  entityId: string,
): Promise<{ readonly accepted: boolean; readonly deduplicated?: boolean }> {
  return enqueueProductPublicationSafely(dispatcher, context, {
    entityId,
    entityType: options.entityType,
    productId: options.productId,
    operation: "lifecycle",
    payload: { entityId, state: "archived", reason: "archive" },
  });
}

export function enqueueRestorePublication(
  dispatcher: PublicationDispatcher,
  context: ProductPublicationHookContext,
  options: ProductHookOptions,
  entityId: string,
): Promise<{ readonly accepted: boolean; readonly deduplicated?: boolean }> {
  return enqueueProductPublicationSafely(dispatcher, context, {
    entityId,
    entityType: options.entityType,
    productId: options.productId,
    operation: "lifecycle",
    payload: { entityId, state: "published", reason: "restore" },
  });
}

export function enqueueDeletePublication(
  dispatcher: PublicationDispatcher,
  context: ProductPublicationHookContext,
  options: ProductHookOptions,
  entityId: string,
): Promise<{ readonly accepted: boolean; readonly deduplicated?: boolean }> {
  return enqueueProductPublicationSafely(dispatcher, context, {
    entityId,
    entityType: options.entityType,
    productId: options.productId,
    operation: "remove",
    payload: { entityId },
  });
}

export const PRODUCT_HOOK_PRESETS = {
  projects: {
    productId: "projects",
    entityType: "project",
    navigationBasePath: "/workspace/projects",
  },
  support: {
    productId: "support",
    entityType: "ticket",
    navigationBasePath: "/workspace/support/tickets",
  },
  documents: {
    productId: "documents",
    entityType: "document",
    navigationBasePath: "/workspace/documents",
  },
  testing: {
    productId: "testing",
    entityType: "test-case",
    navigationBasePath: "/workspace/testing/cases",
  },
  reporting: {
    productId: "reporting",
    entityType: "report",
    navigationBasePath: "/workspace/reporting",
  },
} as const satisfies Record<string, ProductHookOptions>;

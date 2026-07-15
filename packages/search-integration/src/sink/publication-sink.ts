/**
 * Publication sink — journal of canonical entities only (APZSEARCH-009).
 * Does not call Search Platform services, engines, or Meilisearch.
 * Future milestones may replace the sink with a platform bridge.
 */

import type { CanonicalSearchEntity } from "../entity/canonical-search-entity";
import type { SearchEntityLifecycleState } from "../entity/lifecycle";

export type SearchPublicationSinkKind = "memory" | "noop" | "custom";

export interface SearchPublicationSink {
  readonly kind: SearchPublicationSinkKind;
  get(entityId: string): CanonicalSearchEntity | null;
  list(filter?: {
    readonly tenantId?: string;
    readonly productId?: string;
  }): readonly CanonicalSearchEntity[];
  upsert(entity: CanonicalSearchEntity): CanonicalSearchEntity;
  remove(entityId: string): CanonicalSearchEntity | null;
  setLifecycle(
    entityId: string,
    state: SearchEntityLifecycleState,
    reason?: string,
  ): CanonicalSearchEntity | null;
  count(): number;
}

export class InMemorySearchPublicationSink implements SearchPublicationSink {
  readonly kind = "memory" as const;
  private readonly store = new Map<string, CanonicalSearchEntity>();

  get(entityId: string): CanonicalSearchEntity | null {
    return this.store.get(entityId) ?? null;
  }

  list(filter?: {
    readonly tenantId?: string;
    readonly productId?: string;
  }): readonly CanonicalSearchEntity[] {
    const all = [...this.store.values()];
    return all.filter((e) => {
      if (filter?.tenantId && e.tenantId !== filter.tenantId) return false;
      if (filter?.productId && e.productId !== filter.productId) return false;
      return e.lifecycleState !== "removed";
    });
  }

  upsert(entity: CanonicalSearchEntity): CanonicalSearchEntity {
    this.store.set(entity.id, entity);
    return entity;
  }

  remove(entityId: string): CanonicalSearchEntity | null {
    const existing = this.store.get(entityId);
    if (!existing) return null;
    const removed: CanonicalSearchEntity = {
      ...existing,
      lifecycleState: "removed",
      updatedAt: new Date().toISOString(),
    };
    this.store.set(entityId, removed);
    return removed;
  }

  setLifecycle(
    entityId: string,
    state: SearchEntityLifecycleState,
    _reason?: string,
  ): CanonicalSearchEntity | null {
    const existing = this.store.get(entityId);
    if (!existing) return null;
    const next: CanonicalSearchEntity = {
      ...existing,
      lifecycleState: state,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(entityId, next);
    return next;
  }

  count(): number {
    return [...this.store.values()].filter(
      (e) => e.lifecycleState !== "removed",
    ).length;
  }
}

export class NoopSearchPublicationSink implements SearchPublicationSink {
  readonly kind = "noop" as const;

  get(): CanonicalSearchEntity | null {
    return null;
  }

  list(): readonly CanonicalSearchEntity[] {
    return [];
  }

  upsert(entity: CanonicalSearchEntity): CanonicalSearchEntity {
    return entity;
  }

  remove(): CanonicalSearchEntity | null {
    return null;
  }

  setLifecycle(): CanonicalSearchEntity | null {
    return null;
  }

  count(): number {
    return 0;
  }
}

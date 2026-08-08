import type {
  OrchestrationArtefactKind,
  OrchestrationDocumentStore,
} from "./document-store";

export type DurableMapMeta<_T = unknown> = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly orchestrationId?: string;
  readonly correlationId?: string;
  readonly status?: string;
  readonly actorId?: string;
};

/**
 * Cache + optional durable write-through for orchestration SoR maps.
 * Reads are sync from cache (after hydrate). Writes are async and durable when a store is bound.
 */
export class DurableMap<T extends object> {
  private readonly cache = new Map<string, T>();

  constructor(
    private readonly kind: OrchestrationArtefactKind,
    private readonly store: OrchestrationDocumentStore | undefined,
    private readonly metaOf: (value: T) => DurableMapMeta<T>,
  ) {}

  async hydrate(): Promise<void> {
    if (!this.store) return;
    const docs = await this.store.listByKind(this.kind);
    this.cache.clear();
    for (const doc of docs) {
      this.cache.set(doc.artefactKey, doc.payload as T);
    }
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  values(): readonly T[] {
    return [...this.cache.values()];
  }

  get size(): number {
    return this.cache.size;
  }

  async set(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
    if (!this.store) return;
    const meta = this.metaOf(value);
    await this.store.upsert({
      artefactKind: this.kind,
      artefactKey: key,
      tenantId: meta.tenantId,
      projectId: meta.projectId,
      orchestrationId: meta.orchestrationId,
      correlationId: meta.correlationId,
      status: meta.status,
      payload: value as unknown as Record<string, unknown>,
      actorId: meta.actorId,
    });
  }

  /** Memory-only seed (built-ins / test fixtures) — does not write SoR. */
  seed(key: string, value: T): void {
    this.cache.set(key, value);
  }
}

/**
 * Event deduplication store — in-memory implementation for tests only.
 * Production persistence is out of scope for OSS-100-08.
 */

export interface EventDeduplicationStore {
  has(key: string): Promise<boolean>;
  remember(key: string, ttlMs?: number): Promise<void>;
  forget?(key: string): Promise<void>;
  clear?(): Promise<void>;
}

export interface InMemoryEventDeduplicationStoreOptions {
  readonly defaultTtlMs?: number;
  readonly now?: () => number;
}

export class InMemoryEventDeduplicationStore implements EventDeduplicationStore {
  private readonly entries = new Map<string, number>();
  private readonly defaultTtlMs: number;
  private readonly now: () => number;

  constructor(options: InMemoryEventDeduplicationStoreOptions = {}) {
    this.defaultTtlMs = options.defaultTtlMs ?? 60 * 60 * 1000;
    this.now = options.now ?? (() => Date.now());
  }

  async has(key: string): Promise<boolean> {
    this.evictExpired();
    return this.entries.has(key);
  }

  async remember(key: string, ttlMs?: number): Promise<void> {
    this.entries.set(key, this.now() + (ttlMs ?? this.defaultTtlMs));
  }

  async forget(key: string): Promise<void> {
    this.entries.delete(key);
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }

  size(): number {
    this.evictExpired();
    return this.entries.size;
  }

  private evictExpired(): void {
    const now = this.now();
    for (const [key, expires] of this.entries) {
      if (expires <= now) {
        this.entries.delete(key);
      }
    }
  }
}

export function createInMemoryEventDeduplicationStore(
  options?: InMemoryEventDeduplicationStoreOptions,
): InMemoryEventDeduplicationStore {
  return new InMemoryEventDeduplicationStore(options);
}

export type ReplayDecision =
  "accept" | "reject_replay" | "reject_skew" | "reject_missing";

export interface ReplayCheckInput {
  readonly deliveryId: string;
  readonly timestamp?: string | number;
  readonly correlationId: string;
  readonly nowMs?: number;
}

export interface ReplayCheckResult {
  readonly decision: ReplayDecision;
  readonly ok: boolean;
  readonly reason?: string;
  readonly ageMs?: number;
}

export interface ReplayStore {
  has(deliveryId: string): Promise<boolean>;
  remember(deliveryId: string, expiresAtMs: number): Promise<void>;
  clear?(): Promise<void>;
}

export interface ReplayProtectionOptions {
  readonly store: ReplayStore;
  /** Maximum accepted clock skew / delivery age in milliseconds. Default 5 minutes. */
  readonly maxAgeMs?: number;
  /** How long to remember delivery IDs. Default 10 minutes. */
  readonly rememberForMs?: number;
  readonly now?: () => number;
}

export interface ReplayProtection {
  check(input: ReplayCheckInput): Promise<ReplayCheckResult>;
  /** Mark delivery as seen after successful processing. */
  commit(deliveryId: string): Promise<void>;
}

export interface InMemoryReplayStoreOptions {
  readonly now?: () => number;
}

/** In-memory replay store for tests only — not for production persistence. */
export class InMemoryReplayStore implements ReplayStore {
  private readonly entries = new Map<string, number>();
  private readonly now: () => number;

  constructor(options: InMemoryReplayStoreOptions = {}) {
    this.now = options.now ?? (() => Date.now());
  }

  async has(deliveryId: string): Promise<boolean> {
    this.evictExpired();
    return this.entries.has(deliveryId);
  }

  async remember(deliveryId: string, expiresAtMs: number): Promise<void> {
    this.entries.set(deliveryId, expiresAtMs);
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
    for (const [id, expires] of this.entries) {
      if (expires <= now) {
        this.entries.delete(id);
      }
    }
  }
}

export function createInMemoryReplayStore(
  options?: InMemoryReplayStoreOptions,
): InMemoryReplayStore {
  return new InMemoryReplayStore(options);
}

export class DefaultReplayProtection implements ReplayProtection {
  private readonly store: ReplayStore;
  private readonly maxAgeMs: number;
  private readonly rememberForMs: number;
  private readonly now: () => number;

  constructor(options: ReplayProtectionOptions) {
    this.store = options.store;
    this.maxAgeMs = options.maxAgeMs ?? 5 * 60 * 1000;
    this.rememberForMs = options.rememberForMs ?? 10 * 60 * 1000;
    this.now = options.now ?? (() => Date.now());
  }

  async check(input: ReplayCheckInput): Promise<ReplayCheckResult> {
    if (!input.deliveryId?.trim()) {
      return { decision: "reject_missing", ok: false, reason: "delivery_id_required" };
    }

    if (await this.store.has(input.deliveryId)) {
      return { decision: "reject_replay", ok: false, reason: "duplicate_delivery" };
    }

    if (input.timestamp !== undefined) {
      const ts =
        typeof input.timestamp === "number"
          ? input.timestamp
          : Date.parse(input.timestamp);
      if (Number.isNaN(ts)) {
        return { decision: "reject_missing", ok: false, reason: "invalid_timestamp" };
      }
      const nowMs = input.nowMs ?? this.now();
      const ageMs = Math.abs(nowMs - ts);
      if (ageMs > this.maxAgeMs) {
        return {
          decision: "reject_skew",
          ok: false,
          reason: "clock_skew_exceeded",
          ageMs,
        };
      }
      return { decision: "accept", ok: true, ageMs };
    }

    return { decision: "accept", ok: true };
  }

  async commit(deliveryId: string): Promise<void> {
    await this.store.remember(deliveryId, this.now() + this.rememberForMs);
  }
}

export function createReplayProtection(
  options: ReplayProtectionOptions,
): DefaultReplayProtection {
  return new DefaultReplayProtection(options);
}

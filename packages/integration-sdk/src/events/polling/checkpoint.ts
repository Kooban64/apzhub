import { pollingCheckpointError, type EventError } from "../errors";
import type { PollingCursor } from "./cursor";

export type CheckpointState = "proposed" | "committed" | "abandoned";

export interface PollingCheckpoint {
  readonly id: string;
  readonly sourceId: string;
  readonly cursor: PollingCursor;
  readonly state: CheckpointState;
  readonly proposedAt: string;
  readonly committedAt?: string;
  readonly abandonedAt?: string;
  readonly recordsProcessed?: number;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface ProposeCheckpointInput {
  readonly sourceId: string;
  readonly cursor: PollingCursor;
  readonly recordsProcessed?: number;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly correlationId: string;
}

/**
 * Checkpoint store with propose/commit/abandon semantics.
 * Callers MUST NOT auto-commit before acknowledgement.
 */
export interface PollingCheckpointStore {
  getLatest(sourceId: string): Promise<PollingCheckpoint | undefined>;
  propose(input: ProposeCheckpointInput): Promise<PollingCheckpoint>;
  commit(checkpointId: string, correlationId: string): Promise<PollingCheckpoint>;
  abandon(checkpointId: string, correlationId: string): Promise<PollingCheckpoint>;
  clear?(sourceId?: string): Promise<void>;
}

export interface InMemoryPollingCheckpointStoreOptions {
  readonly now?: () => number;
  readonly idFactory?: () => string;
}

/** In-memory checkpoint store for tests only. */
export class InMemoryPollingCheckpointStore implements PollingCheckpointStore {
  private readonly checkpoints = new Map<string, PollingCheckpoint>();
  private readonly latestBySource = new Map<string, string>();
  private readonly now: () => number;
  private readonly idFactory: () => string;
  private seq = 0;

  constructor(options: InMemoryPollingCheckpointStoreOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.idFactory =
      options.idFactory ??
      (() => {
        this.seq += 1;
        return `ckpt_${this.seq}`;
      });
  }

  async getLatest(sourceId: string): Promise<PollingCheckpoint | undefined> {
    const id = this.latestBySource.get(sourceId);
    return id ? this.checkpoints.get(id) : undefined;
  }

  async propose(input: ProposeCheckpointInput): Promise<PollingCheckpoint> {
    const id = this.idFactory();
    const checkpoint: PollingCheckpoint = {
      id,
      sourceId: input.sourceId,
      cursor: input.cursor,
      state: "proposed",
      proposedAt: new Date(this.now()).toISOString(),
      recordsProcessed: input.recordsProcessed,
      metadata: input.metadata,
    };
    this.checkpoints.set(id, checkpoint);
    return checkpoint;
  }

  async commit(
    checkpointId: string,
    correlationId: string,
  ): Promise<PollingCheckpoint> {
    const existing = this.checkpoints.get(checkpointId);
    if (!existing) {
      throw pollingCheckpointError(
        { correlationId },
        `Checkpoint "${checkpointId}" not found`,
      );
    }
    if (existing.state === "abandoned") {
      throw pollingCheckpointError(
        { correlationId },
        `Cannot commit abandoned checkpoint "${checkpointId}"`,
      );
    }
    const committed: PollingCheckpoint = {
      ...existing,
      state: "committed",
      committedAt: new Date(this.now()).toISOString(),
    };
    this.checkpoints.set(checkpointId, committed);
    this.latestBySource.set(existing.sourceId, checkpointId);
    return committed;
  }

  async abandon(
    checkpointId: string,
    correlationId: string,
  ): Promise<PollingCheckpoint> {
    const existing = this.checkpoints.get(checkpointId);
    if (!existing) {
      throw pollingCheckpointError(
        { correlationId },
        `Checkpoint "${checkpointId}" not found`,
      );
    }
    if (existing.state === "committed") {
      throw pollingCheckpointError(
        { correlationId },
        `Cannot abandon committed checkpoint "${checkpointId}"`,
      );
    }
    const abandoned: PollingCheckpoint = {
      ...existing,
      state: "abandoned",
      abandonedAt: new Date(this.now()).toISOString(),
    };
    this.checkpoints.set(checkpointId, abandoned);
    return abandoned;
  }

  async clear(sourceId?: string): Promise<void> {
    if (!sourceId) {
      this.checkpoints.clear();
      this.latestBySource.clear();
      return;
    }
    for (const [id, ckpt] of this.checkpoints) {
      if (ckpt.sourceId === sourceId) {
        this.checkpoints.delete(id);
      }
    }
    this.latestBySource.delete(sourceId);
  }
}

export function createInMemoryPollingCheckpointStore(
  options?: InMemoryPollingCheckpointStoreOptions,
): InMemoryPollingCheckpointStore {
  return new InMemoryPollingCheckpointStore(options);
}

export function isPollingCheckpointError(value: unknown): value is EventError {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as EventError).code === "integration.events.polling.checkpoint_error"
  );
}

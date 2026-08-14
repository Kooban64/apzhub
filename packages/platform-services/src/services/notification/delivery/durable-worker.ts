/**
 * Durable notification delivery worker (ENG-001B-P2/P3).
 * Claim → dispatch orchestrator → lease release on shutdown.
 * No new providers — uses existing in-app channel via orchestrator.
 */

import type { NotificationDeliveryDurableRuntimeStore } from "@apzhub/notification-contracts";
import { asNotificationDeliveryId } from "@apzhub/notification-contracts";
import { randomUUID } from "node:crypto";

import type { DomainEventPublisher } from "../../../events/domain-event-publisher";
import {
  createDurableDispatchOrchestrator,
  type DurableDispatchOrchestrator,
  type DurableDispatchOutcome,
} from "./durable-dispatch-orchestrator";
import {
  isNotificationDeliveryEnabled,
  isNotificationDurableRuntimeEnabled,
  isNotificationWorkerEnabled,
  type NotificationDeliveryEnv,
} from "./delivery-env";

export type DurableNotificationWorkerConfig = {
  readonly store: NotificationDeliveryDurableRuntimeStore;
  readonly env?: NotificationDeliveryEnv;
  readonly workerId?: string;
  readonly leaseTtlMs?: number;
  readonly claimBatchSize?: number;
  readonly idleWaitMs?: number;
  readonly shutdownGraceMs?: number;
  readonly publisher?: DomainEventPublisher;
  readonly resolveEmail?: (input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly userId: string;
  }) => string | undefined | Promise<string | undefined>;
  readonly simulateInAppFailure?: boolean;
  readonly simulateUncertainTimeout?: boolean;
  readonly orchestrator?: DurableDispatchOrchestrator;
  /** When false, claim/renew only (P2 behaviour). Default true for P3. */
  readonly enableDispatch?: boolean;
  readonly setIntervalFn?: typeof setInterval;
  readonly clearIntervalFn?: typeof clearInterval;
  readonly sleepFn?: (ms: number) => Promise<void>;
};

export type DurableWorkerTickResult = {
  readonly reclaimed: number;
  readonly claimed: number;
  readonly renewed: number;
  readonly dispatched: number;
  readonly held: number;
  readonly outcomes: readonly DurableDispatchOutcome[];
};

export type DurableNotificationWorker = {
  readonly workerId: string;
  readonly runtimeMode: "postgresql_durable";
  start(): void;
  stop(): Promise<void>;
  isRunning(): boolean;
  tick(): Promise<DurableWorkerTickResult>;
  heldDeliveryIds(): readonly string[];
};

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createDurableNotificationWorker(
  config: DurableNotificationWorkerConfig,
): DurableNotificationWorker {
  const env = config.env ?? process.env;
  const workerId =
    config.workerId ??
    `notification-delivery-worker:${typeof process !== "undefined" ? process.pid : "0"}:${randomUUID()}`;
  const leaseTtlMs = config.leaseTtlMs ?? 30_000;
  const claimBatchSize = config.claimBatchSize ?? 10;
  const idleWaitMs = config.idleWaitMs ?? 500;
  const shutdownGraceMs = config.shutdownGraceMs ?? 2_000;
  const enableDispatch = config.enableDispatch !== false;
  const setIntervalFn = config.setIntervalFn ?? setInterval;
  const clearIntervalFn = config.clearIntervalFn ?? clearInterval;
  const sleepFn = config.sleepFn ?? defaultSleep;

  const orchestrator =
    config.orchestrator ??
    createDurableDispatchOrchestrator({
      store: config.store,
      workerId,
      env,
      publisher: config.publisher,
      resolveEmail: config.resolveEmail,
      simulateInAppFailure: config.simulateInAppFailure,
      simulateUncertainTimeout: config.simulateUncertainTimeout,
    });

  let running = false;
  let acceptingClaims = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let tickInFlight: Promise<DurableWorkerTickResult> | null = null;
  const held = new Set<string>();

  async function releaseAllHeld(reason: string): Promise<void> {
    const ids = [...held];
    for (const id of ids) {
      await config.store.releaseLease({
        deliveryId: asNotificationDeliveryId(id),
        workerId,
        requeueReason: reason,
      });
      held.delete(id);
    }
  }

  async function runTick(): Promise<DurableWorkerTickResult> {
    const reclaimedRows = await config.store.reclaimExpiredLeases({
      limit: claimBatchSize,
    });
    for (const row of reclaimedRows) {
      held.delete(row.id);
    }

    let claimed = 0;
    let renewed = 0;
    let dispatched = 0;
    const outcomes: DurableDispatchOutcome[] = [];

    if (acceptingClaims) {
      const claimedRows = await config.store.claimBatch({
        workerId,
        limit: claimBatchSize,
        leaseTtlMs,
      });
      claimed = claimedRows.length;
      for (const row of claimedRows) {
        held.add(row.id);
      }

      if (enableDispatch) {
        for (const row of claimedRows) {
          try {
            const result = await orchestrator.dispatchClaimed(row);
            outcomes.push(result.outcome);
            dispatched += 1;
            if (result.outcome !== "fencing_rejected") {
              held.delete(row.id);
            }
          } catch {
            // Continue worker loop after individual delivery failures.
            outcomes.push("skipped_invalid");
            const renewedRow = await config.store.renewLease({
              deliveryId: row.id,
              workerId,
              leaseTtlMs,
            });
            if (!renewedRow) held.delete(row.id);
          }
        }
      } else {
        for (const id of [...held]) {
          const renewedRow = await config.store.renewLease({
            deliveryId: asNotificationDeliveryId(id),
            workerId,
            leaseTtlMs,
          });
          if (renewedRow) renewed += 1;
          else held.delete(id);
        }
      }
    }

    return {
      reclaimed: reclaimedRows.length,
      claimed,
      renewed,
      dispatched,
      held: held.size,
      outcomes,
    };
  }

  async function guardedTick(): Promise<DurableWorkerTickResult> {
    if (tickInFlight) return tickInFlight;
    tickInFlight = runTick().finally(() => {
      tickInFlight = null;
    });
    return tickInFlight;
  }

  return {
    workerId,
    runtimeMode: "postgresql_durable",

    start() {
      if (running) return;
      if (!isNotificationDeliveryEnabled(env)) return;
      if (!isNotificationWorkerEnabled(env)) return;
      if (!isNotificationDurableRuntimeEnabled(env)) return;

      running = true;
      acceptingClaims = true;
      timer = setIntervalFn(() => {
        void guardedTick();
      }, idleWaitMs);
    },

    async stop() {
      acceptingClaims = false;
      if (timer) {
        clearIntervalFn(timer);
        timer = undefined;
      }
      const deadline = Date.now() + shutdownGraceMs;
      while (tickInFlight && Date.now() < deadline) {
        await sleepFn(10);
      }
      await releaseAllHeld("worker_shutdown");
      running = false;
    },

    isRunning() {
      return running;
    },

    tick: guardedTick,

    heldDeliveryIds() {
      return [...held];
    },
  };
}

export function createDurableNotificationWorkerIfEnabled(
  config: DurableNotificationWorkerConfig,
): DurableNotificationWorker | null {
  const env = config.env ?? process.env;
  if (!isNotificationDurableRuntimeEnabled(env)) return null;
  if (!isNotificationDeliveryEnabled(env)) return null;
  if (!isNotificationWorkerEnabled(env)) return null;
  return createDurableNotificationWorker(config);
}

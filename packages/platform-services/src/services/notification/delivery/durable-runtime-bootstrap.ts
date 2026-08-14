/**
 * Durable Notification Runtime bootstrap (ENG-001B-P0…P3).
 * Process-local delivery service remains available; durable path is additive + flag-gated.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type {
  NotificationDeliveryDurableRuntimeStore,
  NotificationDeliveryDurableStorePort,
  NotificationDurableRuntimeMode,
} from "@apzhub/notification-contracts";
import {
  createNotificationDeliveryDurableStore,
  createProductionNotificationDeliveryDurableStore,
} from "@apzhub/notification-delivery-persistence";

import type { DomainEventPublisher } from "../../../events/domain-event-publisher";
import {
  isNotificationDurableRuntimeEnabled,
  type NotificationDeliveryEnv,
} from "./delivery-env";
import {
  createDurableNotificationWorker,
  createDurableNotificationWorkerIfEnabled,
  type DurableNotificationWorker,
} from "./durable-worker";

export type DurableNotificationRuntimeBootstrap = {
  /** Raw flag value (default OFF). */
  readonly durableRuntimeFlagEnabled: boolean;
  /**
   * Selected runtime mode for diagnostics.
   * OFF → process_local; ON → postgresql_durable (Maps intake may still exist separately).
   */
  readonly mode: NotificationDurableRuntimeMode;
  /** Store for DI / durable worker — null when flag OFF. */
  readonly store: NotificationDeliveryDurableRuntimeStore | null;
  /** Durable worker — null when flag OFF or worker flags deny. */
  readonly durableWorker: DurableNotificationWorker | null;
};

export type CreateDurableNotificationRuntimeBootstrapInput = {
  readonly env?: NotificationDeliveryEnv;
  readonly store?: NotificationDeliveryDurableRuntimeStore | null;
  readonly autoStartWorker?: boolean;
  readonly workerId?: string;
  readonly enableDispatch?: boolean;
  readonly publisher?: DomainEventPublisher;
  readonly resolveEmail?: (input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly userId: string;
  }) => string | undefined | Promise<string | undefined>;
};

/**
 * Builds bootstrap descriptor.
 * Flag OFF → store/worker null (process-local path active).
 * Flag ON → durable store + worker may dispatch via orchestrator (P3).
 */
export function createDurableNotificationRuntimeBootstrap(
  envOrInput:
    | NotificationDeliveryEnv
    | CreateDurableNotificationRuntimeBootstrapInput = process.env,
): DurableNotificationRuntimeBootstrap {
  const input: CreateDurableNotificationRuntimeBootstrapInput =
    envOrInput &&
    typeof envOrInput === "object" &&
    ("env" in envOrInput ||
      "store" in envOrInput ||
      "autoStartWorker" in envOrInput ||
      "workerId" in envOrInput ||
      "enableDispatch" in envOrInput ||
      "publisher" in envOrInput ||
      "resolveEmail" in envOrInput)
      ? (envOrInput as CreateDurableNotificationRuntimeBootstrapInput)
      : { env: envOrInput as NotificationDeliveryEnv };

  const env = input.env ?? process.env;
  const durableRuntimeFlagEnabled = isNotificationDurableRuntimeEnabled(env);

  if (!durableRuntimeFlagEnabled) {
    return {
      durableRuntimeFlagEnabled: false,
      mode: "process_local",
      store: null,
      durableWorker: null,
    };
  }

  const store =
    input.store === undefined
      ? createNotificationDeliveryDurableStore({ mode: "memory" })
      : input.store;

  const durableWorker = store
    ? createDurableNotificationWorkerIfEnabled({
        store,
        env,
        workerId: input.workerId,
        enableDispatch: input.enableDispatch,
        publisher: input.publisher,
        resolveEmail: input.resolveEmail,
      })
    : null;

  if (input.autoStartWorker && durableWorker) {
    durableWorker.start();
  }

  return {
    durableRuntimeFlagEnabled: true,
    mode: "postgresql_durable",
    store,
    durableWorker,
  };
}

export function createDurableDeliveryStoreFromDb(
  db: DatabaseExecutor,
): NotificationDeliveryDurableRuntimeStore {
  return createProductionNotificationDeliveryDurableStore({ db });
}

export function createDurableDeliveryStoreForTest(): NotificationDeliveryDurableRuntimeStore {
  return createNotificationDeliveryDurableStore({ mode: "memory" });
}

/** @deprecated P0 placeholder */
export function createUnimplementedDurableDeliveryStore(): NotificationDeliveryDurableStorePort {
  return createDurableDeliveryStoreForTest();
}

export { createDurableNotificationWorker, createDurableNotificationWorkerIfEnabled };
export type {
  DurableNotificationWorker,
  DurableNotificationWorkerConfig,
  DurableWorkerTickResult,
} from "./durable-worker";
export { createDurableDispatchOrchestrator } from "./durable-dispatch-orchestrator";
export type {
  DurableDispatchOrchestrator,
  DurableDispatchOrchestratorConfig,
  DurableDispatchOutcome,
  DurableDispatchResult,
} from "./durable-dispatch-orchestrator";
export { dispatchInAppChannel } from "./in-app-channel";
export type {
  InAppChannelDispatchInput,
  InAppChannelDispatchResult,
} from "./in-app-channel";

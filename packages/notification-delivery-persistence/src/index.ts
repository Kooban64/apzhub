/** @apzhub/notification-delivery-persistence — ADR-0073 / ENG-001B-P1/P2 */

export { NOTIFICATION_DELIVERY_PERSISTENCE_VERSION } from "./version";
export {
  mapIntentRow,
  intentToRow,
  mapDeliveryRow,
  deliveryToRow,
  mapTryRow,
  tryToRow,
  mapInAppRow,
  inAppToRow,
} from "./mappers";
export {
  nowIso,
  leaseExpiresIso,
  isClaimable,
  releaseStatusFor,
  mapSqlDeliveryRow,
  passesCompletionFence,
  redactErrorMetadata,
} from "./claim-helpers";
export {
  createEmptyNotificationDeliveryInMemoryStores,
  createInMemoryNotificationDeliveryDurableStore,
} from "./in-memory/store";
export type { NotificationDeliveryInMemoryStores } from "./in-memory/store";
export { createPostgresNotificationDeliveryDurableStore } from "./postgres/store";
export {
  createNotificationDeliveryDurableStore,
  createProductionNotificationDeliveryDurableStore,
  createNotificationDeliveryDurableStoreForTest,
} from "./factories";
export type { CreateNotificationDeliveryDurableStoreInput } from "./factories";

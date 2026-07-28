/**
 * Notification Delivery feature flags (ENG-004) — deny-by-default.
 */

export type NotificationDeliveryEnv = Readonly<Record<string, string | undefined>>;

function isTruthy(value: string | undefined): boolean {
  const v = value?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "on";
}

export function isNotificationDeliveryEnabled(
  env: NotificationDeliveryEnv = process.env,
): boolean {
  return isTruthy(env.APZHUB_NOTIFICATION_DELIVERY_ENABLED);
}

export function isNotificationInAppEnabled(
  env: NotificationDeliveryEnv = process.env,
): boolean {
  if (!isNotificationDeliveryEnabled(env)) return false;
  const explicit = env.APZHUB_NOTIFICATION_IN_APP_ENABLED;
  if (explicit === undefined || explicit.trim() === "") return true;
  return isTruthy(explicit);
}

export function isNotificationEventIntakeEnabled(
  env: NotificationDeliveryEnv = process.env,
): boolean {
  return (
    isNotificationDeliveryEnabled(env) &&
    isTruthy(env.APZHUB_NOTIFICATION_EVENT_INTAKE_ENABLED)
  );
}

export function isNotificationCommandIntakeEnabled(
  env: NotificationDeliveryEnv = process.env,
): boolean {
  return (
    isNotificationDeliveryEnabled(env) &&
    isTruthy(env.APZHUB_NOTIFICATION_COMMAND_INTAKE_ENABLED)
  );
}

export function isNotificationWorkerEnabled(
  env: NotificationDeliveryEnv = process.env,
): boolean {
  return (
    isNotificationDeliveryEnabled(env) &&
    isTruthy(env.APZHUB_NOTIFICATION_WORKER_ENABLED)
  );
}

/**
 * ADR-0073 / ENG-001B-P0 — PostgreSQL durable runtime SoR flag.
 * Deny-by-default. Phase 0 introduces the flag only; no runtime cut-over.
 */
export function isNotificationDurableRuntimeEnabled(
  env: NotificationDeliveryEnv = process.env,
): boolean {
  return isTruthy(env.APZHUB_NOTIFICATION_DURABLE_RUNTIME);
}

export function notificationMaxAttempts(
  env: NotificationDeliveryEnv = process.env,
): number {
  const raw = Number(env.APZHUB_NOTIFICATION_MAX_ATTEMPTS ?? "5");
  if (!Number.isFinite(raw) || raw < 1) return 5;
  return Math.min(Math.floor(raw), 20);
}

export function notificationRetryBaseDelayMs(
  env: NotificationDeliveryEnv = process.env,
): number {
  const raw = Number(env.APZHUB_NOTIFICATION_RETRY_BASE_DELAY ?? "1000");
  if (!Number.isFinite(raw) || raw < 100) return 1000;
  return Math.min(Math.floor(raw), 60_000);
}

export function notificationMaxQueueDepth(
  env: NotificationDeliveryEnv = process.env,
): number {
  const raw = Number(env.APZHUB_NOTIFICATION_MAX_QUEUE_DEPTH ?? "10000");
  if (!Number.isFinite(raw) || raw < 10) return 10_000;
  return Math.min(Math.floor(raw), 100_000);
}

export function notificationRetentionDays(
  env: NotificationDeliveryEnv = process.env,
): number {
  const raw = Number(env.APZHUB_NOTIFICATION_RETENTION_DAYS ?? "90");
  if (!Number.isFinite(raw) || raw < 1) return 90;
  return Math.min(Math.floor(raw), 3650);
}

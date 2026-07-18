/** Authorized publisher for provisioning lifecycle envelopes. */
export const PLATFORM_PROVISIONING_PUBLISHER = "platform-provisioning";

export const PROVISIONING_EVENT_STARTED = "platform.provisioning.started";
export const PROVISIONING_EVENT_STEP_COMPLETED = "platform.provisioning.step.completed";
export const PROVISIONING_EVENT_COMPLETED = "platform.provisioning.completed";
export const PROVISIONING_EVENT_FAILED = "platform.provisioning.failed";

export const PROVISIONING_EVENT_VERSION = "1.0.0";

export const OUTBOX_AGGREGATE_TYPE_PROVISIONING = "provisioning-flow";
export const OUTBOX_EVENT_TYPE_PROVISIONING_STEP = "platform.provisioning.step";

export const DEFAULT_PRODUCT_KEYS = ["law-platform"] as const;

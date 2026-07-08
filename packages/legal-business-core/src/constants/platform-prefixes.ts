/** Canonical reference number prefixes — APZHUB-Law-Domain-Model.md §4.2. */
export const REFERENCE_PREFIXES = {
  client: "CLT",
  matter: "MAT",
  document: "DOC",
  task: "TSK",
  calendarEvent: "CAL",
  timeEntry: "TIM",
  invoice: "INV",
  payment: "PAY",
  trustAccount: "TRU",
  trustTransaction: "TRX",
  expense: "EXP",
  contact: "CON",
  organisation: "ORG",
} as const;

export type ReferencePrefixKey = keyof typeof REFERENCE_PREFIXES;

/** Platform identifier prefixes — APZHUB-Law-Domain-Model.md §4.1. */
export const LEGAL_PERMISSION_PREFIX = "legal";
export const LEGAL_EVENT_PREFIX = "legal";
export const LEGAL_ACTIVITY_PREFIX = "legal.activity";
export const LEGAL_KNOWLEDGE_PREFIX = "legal.help";
export const LEGAL_NOTIFICATION_PREFIX = "legal";
export const LEGAL_MODULE_PREFIX = "legal";

export const LEGAL_BUSINESS_CORE_VERSION = "1.0.0";

export function buildPermissionKey(module: string, action: string): string {
  return `${LEGAL_PERMISSION_PREFIX}.${module}.${action}`;
}

export function buildEventId(entity: string, verb: string): string {
  return `${LEGAL_EVENT_PREFIX}.${entity}.${verb}`;
}

export function buildActivityTypeId(noun: string, verb: string): string {
  return `${LEGAL_ACTIVITY_PREFIX}.${noun}.${verb}`;
}

export function buildKnowledgeSourceId(topic: string): string {
  return `${LEGAL_KNOWLEDGE_PREFIX}.${topic}`;
}

export function buildNotificationRouteId(entity: string, channel: string): string {
  return `${LEGAL_NOTIFICATION_PREFIX}.${entity}.${channel}`;
}

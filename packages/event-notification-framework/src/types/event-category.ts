/** Canonical event taxonomy categories — ADR-0031. */
export type EventCategory =
  | "system"
  | "user"
  | "capability"
  | "integration"
  | "security"
  | "infrastructure"
  | "business"
  | "notification"
  | "ai";

export const CANONICAL_EVENT_CATEGORIES = [
  "system",
  "user",
  "capability",
  "integration",
] as const satisfies readonly EventCategory[];

export type CanonicalEventCategory = (typeof CANONICAL_EVENT_CATEGORIES)[number];

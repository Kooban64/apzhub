import type { EventCategory } from "../types/event-category";

/** Declarative metadata for a built-in platform event (pre-registration). */
export interface PlatformEventCatalogueEntry {
  readonly eventId: string;
  readonly version: string;
  readonly category: EventCategory;
  readonly publisher: string;
  readonly label: string;
  readonly description: string;
  readonly subscribers?: readonly string[];
  readonly tags?: readonly string[];
  readonly status?: "active" | "planned" | "deprecated";
}

/**
 * Foundational Platform Event Catalogue — registered at bootstrap without manifest files.
 *
 * Definitions only — no publish, subscribe, or notification behaviour.
 */
export const PLATFORM_EVENT_CATALOGUE = Object.freeze([
  {
    eventId: "system.platform.bootstrap.completed",
    version: "1.0.0",
    category: "system",
    publisher: "platform-runtime",
    label: "Platform Bootstrap Completed",
    description: "Emitted when platform runtime bootstrap completes successfully",
    subscribers: ["notifications", "audit"],
    tags: ["platform", "bootstrap", "lifecycle"],
  },
  {
    eventId: "system.platform.health.changed",
    version: "1.0.0",
    category: "system",
    publisher: "platform-runtime",
    label: "Platform Health Changed",
    description: "Emitted when aggregate platform health status changes",
    subscribers: ["notifications"],
    tags: ["platform", "health"],
  },
  {
    eventId: "capability.action.executed",
    version: "1.0.0",
    category: "capability",
    publisher: "command-framework",
    label: "Action Executed",
    description: "Emitted after successful platform action execution",
    subscribers: ["notifications", "audit"],
    tags: ["action", "audit"],
  },
  {
    eventId: "capability.knowledge.query.completed",
    version: "1.0.0",
    category: "capability",
    publisher: "knowledge-discovery-framework",
    label: "Knowledge Query Completed",
    description: "Emitted when a knowledge discovery query completes",
    subscribers: ["notifications"],
    tags: ["knowledge", "discovery"],
  },
] satisfies readonly PlatformEventCatalogueEntry[]);

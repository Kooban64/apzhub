import type { EventRegistry } from "@apzhub/event-notification-framework";

const SUPPORT_EVENTS = [
  {
    eventId: "support.request.created",
    label: "Support Request Created",
    description: "Emitted when a Support request is created.",
  },
  {
    eventId: "support.request.updated",
    label: "Support Request Updated",
    description: "Emitted when a Support request is updated or reopened.",
  },
  {
    eventId: "support.request.assigned",
    label: "Support Request Assigned",
    description: "Emitted when a Support request is assigned.",
  },
  {
    eventId: "support.request.closed",
    label: "Support Request Closed",
    description: "Emitted when a Support request is closed.",
  },
  {
    eventId: "support.article.created",
    label: "Support Article Created",
    description: "Emitted when a Support article (note/reply) is created.",
  },
] as const;

/** Registers Support domain events on the platform Event Registry (APZHUB-1.1-003). */
export function registerSupportEvents(registry: EventRegistry): void {
  for (const event of SUPPORT_EVENTS) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "support-service",
        label: event.label,
        description: event.description,
        sourceCapability: "support",
        source: "manifest",
        status: "active",
      });
    }
  }
}

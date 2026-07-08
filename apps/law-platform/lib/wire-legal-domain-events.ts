import type { EventNotificationContext } from "@apzhub/event-notification-framework";
import type {
  ActivityMapper,
  ActivityService,
} from "@apzhub/activity-timeline-framework/server";

/**
 * Subscribes legal domain events to notification mapper (LAW-002-03).
 * Complements capability.action.* wiring in wireAppEventNotifications.
 */
export function wireLegalDomainNotifications(
  context: EventNotificationContext,
): string[] {
  const clientSubscription = context.eventBus.subscribe({
    eventPattern: "legal.client.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  const matterSubscription = context.eventBus.subscribe({
    eventPattern: "legal.matter.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  const documentSubscription = context.eventBus.subscribe({
    eventPattern: "legal.document.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  const taskSubscription = context.eventBus.subscribe({
    eventPattern: "legal.task.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  const timeSubscription = context.eventBus.subscribe({
    eventPattern: "legal.time.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  const invoiceSubscription = context.eventBus.subscribe({
    eventPattern: "legal.invoice.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  const calendarSubscription = context.eventBus.subscribe({
    eventPattern: "legal.calendar.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  const searchSubscription = context.eventBus.subscribe({
    eventPattern: "legal.search.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });

  return [
    clientSubscription,
    matterSubscription,
    documentSubscription,
    taskSubscription,
    timeSubscription,
    invoiceSubscription,
    calendarSubscription,
    searchSubscription,
  ];
}

/** Subscribes legal domain events to activity mapper (LAW-002-03 / LAW-003-01). */
export function wireLegalDomainActivities(input: {
  readonly eventBus: EventNotificationContext["eventBus"];
  readonly mapper: ActivityMapper;
  readonly service: ActivityService;
}): string[] {
  const clientSubscription = input.eventBus.subscribe({
    eventPattern: "legal.client.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  const matterSubscription = input.eventBus.subscribe({
    eventPattern: "legal.matter.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  const documentSubscription = input.eventBus.subscribe({
    eventPattern: "legal.document.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  const taskSubscription = input.eventBus.subscribe({
    eventPattern: "legal.task.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  const timeSubscription = input.eventBus.subscribe({
    eventPattern: "legal.time.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  const invoiceSubscription = input.eventBus.subscribe({
    eventPattern: "legal.invoice.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  const calendarSubscription = input.eventBus.subscribe({
    eventPattern: "legal.calendar.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  const searchSubscription = input.eventBus.subscribe({
    eventPattern: "legal.search.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });

  return [
    clientSubscription,
    matterSubscription,
    documentSubscription,
    taskSubscription,
    timeSubscription,
    invoiceSubscription,
    calendarSubscription,
    searchSubscription,
  ];
}

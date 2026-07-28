import type { NotificationRegistry } from "@apzhub/event-notification-framework";

const SUPPORT_ROUTES = [
  {
    routeId: "support.request.created.inbox",
    eventPattern: "support.request.created",
    notificationKind: "inbox" as const,
    label: "Support request created",
    titleTemplate: "Support request created",
    bodyTemplate: "{{payload.title}}",
    templateRef: "support-request-created-inbox",
  },
  {
    routeId: "support.request.updated.toast",
    eventPattern: "support.request.updated",
    notificationKind: "toast" as const,
    label: "Support request updated",
    titleTemplate: "Support request updated",
    bodyTemplate: "{{payload.title}}",
    templateRef: "support-request-updated-toast",
  },
  {
    routeId: "support.request.assigned.inbox",
    eventPattern: "support.request.assigned",
    notificationKind: "inbox" as const,
    label: "Support request assigned",
    titleTemplate: "Support request assigned",
    bodyTemplate: "{{payload.title}}",
    templateRef: "support-request-assigned-inbox",
  },
  {
    routeId: "support.request.closed.toast",
    eventPattern: "support.request.closed",
    notificationKind: "toast" as const,
    label: "Support request closed",
    titleTemplate: "Support request closed",
    bodyTemplate: "{{payload.title}}",
    templateRef: "support-request-closed-toast",
  },
  {
    routeId: "support.article.created.toast",
    eventPattern: "support.article.created",
    notificationKind: "toast" as const,
    label: "Support article created",
    titleTemplate: "Support article added",
    bodyTemplate: "Article on request {{payload.supportRequestId}}",
    templateRef: "support-article-created-toast",
  },
] as const;

/** Registers Support → in-app notification routes (APZHUB-1.1-003). */
export function registerSupportNotificationRoutes(
  registry: NotificationRegistry,
): void {
  for (const route of SUPPORT_ROUTES) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }
}

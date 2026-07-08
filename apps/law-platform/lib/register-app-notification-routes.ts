import type { NotificationRegistry } from "@apzhub/event-notification-framework";

/** Application notification routes for platform action audit events (EN-015). */
export function registerAppNotificationRoutes(registry: NotificationRegistry): void {
  if (registry.has("capability.action.executed.inbox")) {
    return;
  }

  registry.register({
    routeId: "capability.action.executed.inbox",
    eventPattern: "capability.action.executed",
    notificationKind: "inbox",
    channel: "in-app",
    templateRef: "action-executed-inbox",
    version: "1.0.0",
    status: "active",
    label: "Action executed inbox",
    titleTemplate: "Action {{payload.actionId}} completed",
    bodyTemplate: "Executed by {{payload.actor}}",
  });

  registry.register({
    routeId: "capability.action.executed.toast",
    eventPattern: "capability.action.executed",
    notificationKind: "toast",
    channel: "in-app",
    templateRef: "action-executed-toast",
    version: "1.0.0",
    status: "active",
    label: "Action executed toast",
    titleTemplate: "{{payload.actionId}} finished",
  });
}

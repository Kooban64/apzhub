import type { EventEnvelope } from "../event/event-envelope";
import type { NotificationDescriptor } from "./notification-descriptor";
import {
  freezeNotificationItem,
  type NotificationItem,
  type NotificationItemDiagnostics,
  type NotificationItemMetadata,
} from "./notification-item";
import type { NotificationRouteTemplate } from "./notification-mapper-registry";
import {
  assertRenderableTemplate,
  NotificationTemplateRenderError,
  renderNotificationTemplate,
} from "./render-notification-template";

export interface CreateNotificationItemInput {
  readonly envelope: EventEnvelope;
  readonly route: NotificationDescriptor;
  readonly title: string;
  readonly body?: string;
  readonly renderedAt: string;
}

export function buildNotificationItemId(envelopeId: string, routeId: string): string {
  return `${envelopeId}:${routeId}`;
}

export function createNotificationItem(
  input: CreateNotificationItemInput,
): NotificationItem {
  const metadata: NotificationItemMetadata = Object.freeze({
    templateRef: input.route.templateRef,
    sourceEnvelopeId: input.envelope.envelopeId,
    category: input.envelope.category,
    correlationId: input.envelope.correlationId,
    publisher: input.envelope.publisher,
    read: false,
    actorId: input.envelope.actorId,
  });

  const diagnostics: NotificationItemDiagnostics = Object.freeze({
    renderedAt: input.renderedAt,
    routeStatus: input.route.status ?? "active",
    eventPattern: input.route.eventPattern,
    message: "Notification item mapped — not delivered",
  });

  return freezeNotificationItem({
    notificationId: buildNotificationItemId(
      input.envelope.envelopeId,
      input.route.routeId,
    ),
    routeId: input.route.routeId,
    eventId: input.envelope.eventId,
    title: input.title,
    body: input.body,
    kind: input.route.notificationKind,
    channel: input.route.channel,
    priority: input.route.priority ?? "normal",
    timestamp: input.envelope.timestamp,
    metadata,
    diagnostics,
  });
}

export function renderRouteNotificationItem(
  envelope: EventEnvelope,
  route: NotificationDescriptor,
  template: NotificationRouteTemplate | undefined,
  renderedAt: string,
): NotificationItem {
  const titleTemplate = template?.titleTemplate ?? route.label ?? route.routeId;
  const bodyTemplate = template?.bodyTemplate;

  assertRenderableTemplate(titleTemplate, "titleTemplate");

  const title = renderNotificationTemplate(titleTemplate, envelope);
  const body = bodyTemplate
    ? renderNotificationTemplate(bodyTemplate, envelope)
    : undefined;

  return createNotificationItem({
    envelope,
    route,
    title,
    body,
    renderedAt,
  });
}

export function isTemplateRenderError(
  error: unknown,
): error is NotificationTemplateRenderError {
  return error instanceof NotificationTemplateRenderError;
}

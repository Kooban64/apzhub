import type { EventEnvelope } from "../event/event-envelope";
import { NOTIFICATION_LAYER_STATUS } from "../status";
import type { NotificationMapperDiagnostics } from "../types/diagnostics";
import {
  isTemplateRenderError,
  renderRouteNotificationItem,
} from "./create-notification-item";
import { createDefaultNotificationMapperRegistry } from "./default-notification-mapper-registry";
import type { NotificationRegistry } from "./notification-descriptor";
import type {
  NotificationMapper,
  NotificationMapperResult,
  NotificationMappingIssue,
} from "./notification-mapper";
import type { NotificationMapperRegistry } from "./notification-mapper-registry";
import { resolveNotificationRoutes } from "./resolve-notification-routes";

export interface DefaultNotificationMapperOptions {
  readonly notificationRegistry: NotificationRegistry;
  readonly templateRegistry: NotificationMapperRegistry;
}

export function syncNotificationMapperRegistryFromDescriptors(
  registry: NotificationRegistry,
  templateRegistry: NotificationMapperRegistry,
  options: { clearExisting?: boolean } = {},
): void {
  if (options.clearExisting) {
    templateRegistry.clear();
  }

  for (const descriptor of registry.list()) {
    if (descriptor.titleTemplate) {
      templateRegistry.register({
        routeId: descriptor.routeId,
        titleTemplate: descriptor.titleTemplate,
        bodyTemplate: descriptor.bodyTemplate,
      });
    }
  }
}

/**
 * Default Event-to-Notification mapper.
 *
 * Consumes platform events, resolves matching routes, renders templates, and returns
 * immutable NotificationItem instances. Does not deliver, persist, publish, or call UI.
 */
export class DefaultNotificationMapper implements NotificationMapper {
  private mappedCount = 0;
  private templateErrorCount = 0;
  private lastMappedCount = 0;
  private lastMatchedRouteCount = 0;
  private lastEventId: string | undefined;

  constructor(private readonly options: DefaultNotificationMapperOptions) {
    syncNotificationMapperRegistryFromDescriptors(
      options.notificationRegistry,
      options.templateRegistry,
    );
  }

  refreshTemplatesFromRegistry(): void {
    syncNotificationMapperRegistryFromDescriptors(
      this.options.notificationRegistry,
      this.options.templateRegistry,
      { clearExisting: true },
    );
  }

  map(envelope: EventEnvelope): NotificationMapperResult {
    const routes = resolveNotificationRoutes(
      this.options.notificationRegistry,
      envelope.eventId,
    );
    this.lastMatchedRouteCount = routes.length;
    this.lastEventId = envelope.eventId;

    if (routes.length === 0) {
      this.lastMappedCount = 0;
      return Object.freeze({
        ok: true,
        createdCount: 0,
        matchedRouteCount: 0,
        items: [],
        issues: Object.freeze([
          {
            code: "NO_MATCH" as const,
            message: `No notification routes matched event "${envelope.eventId}"`,
          },
        ]),
      });
    }

    const renderedAt = new Date().toISOString();
    const items = [];
    const issues: NotificationMappingIssue[] = [];

    for (const route of routes) {
      const template = this.options.templateRegistry.get(route.routeId);

      try {
        items.push(renderRouteNotificationItem(envelope, route, template, renderedAt));
      } catch (error) {
        if (isTemplateRenderError(error)) {
          this.templateErrorCount += 1;
          issues.push({
            code: "TEMPLATE_ERROR",
            routeId: route.routeId,
            message: error.message,
          });
          continue;
        }

        throw error;
      }
    }

    this.mappedCount += items.length;
    this.lastMappedCount = items.length;

    return Object.freeze({
      ok: true,
      createdCount: items.length,
      matchedRouteCount: routes.length,
      items: Object.freeze([...items]),
      issues: Object.freeze([...issues]),
    });
  }

  getDiagnostics(): NotificationMapperDiagnostics {
    const registryReady =
      this.options.notificationRegistry.getDiagnostics().status === "ready";

    return Object.freeze({
      status: registryReady ? "ready" : "empty",
      layerStatus: NOTIFICATION_LAYER_STATUS,
      mappedCount: this.mappedCount,
      lastMappedCount: this.lastMappedCount,
      lastMatchedRouteCount: this.lastMatchedRouteCount,
      lastEventId: this.lastEventId,
      templateErrorCount: this.templateErrorCount,
      message: registryReady
        ? "DefaultNotificationMapper ready — returns items only"
        : "DefaultNotificationMapper idle — notification registry not bootstrapped",
    });
  }
}

export interface CreateDefaultNotificationMapperOptions {
  readonly notificationRegistry: NotificationRegistry;
  readonly templateRegistry?: NotificationMapperRegistry;
}

export function createDefaultNotificationMapper(
  options: CreateDefaultNotificationMapperOptions,
): DefaultNotificationMapper {
  const templateRegistry =
    options.templateRegistry ?? createDefaultNotificationMapperRegistry();

  return new DefaultNotificationMapper({
    notificationRegistry: options.notificationRegistry,
    templateRegistry,
  });
}

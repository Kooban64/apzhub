import type {
  NotificationMapperRegistry,
  NotificationRouteTemplate,
} from "./notification-mapper-registry";

export class DefaultNotificationMapperRegistry implements NotificationMapperRegistry {
  private readonly templates = new Map<string, NotificationRouteTemplate>();

  register(template: NotificationRouteTemplate): void {
    this.templates.set(template.routeId, Object.freeze({ ...template }));
  }

  registerMany(templates: readonly NotificationRouteTemplate[]): void {
    for (const template of templates) {
      this.register(template);
    }
  }

  replace(template: NotificationRouteTemplate): void {
    this.templates.set(template.routeId, Object.freeze({ ...template }));
  }

  has(routeId: string): boolean {
    return this.templates.has(routeId);
  }

  get(routeId: string): NotificationRouteTemplate | undefined {
    const template = this.templates.get(routeId);
    return template ? Object.freeze({ ...template }) : undefined;
  }

  list(): readonly NotificationRouteTemplate[] {
    return Object.freeze(
      [...this.templates.values()].map((template) => Object.freeze({ ...template })),
    );
  }

  clear(): void {
    this.templates.clear();
  }
}

export function createDefaultNotificationMapperRegistry(): NotificationMapperRegistry {
  return new DefaultNotificationMapperRegistry();
}

/** Template definition keyed by notification route id. */
export interface NotificationRouteTemplate {
  readonly routeId: string;
  readonly titleTemplate: string;
  readonly bodyTemplate?: string;
}

/**
 * Registry of notification route templates used by the mapper for rendering.
 * Separate from NotificationRegistry — holds presentation templates only.
 */
export interface NotificationMapperRegistry {
  register(template: NotificationRouteTemplate): void;
  registerMany(templates: readonly NotificationRouteTemplate[]): void;
  replace(template: NotificationRouteTemplate): void;
  has(routeId: string): boolean;
  get(routeId: string): NotificationRouteTemplate | undefined;
  list(): readonly NotificationRouteTemplate[];
  clear(): void;
}

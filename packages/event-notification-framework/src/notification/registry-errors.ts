export class NotificationRegistryValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "NotificationRegistryValidationError";
    this.field = field;
  }
}

export class NotificationRegistryDuplicateError extends Error {
  readonly routeId: string;

  constructor(routeId: string) {
    super(`Duplicate notification route id: ${routeId}`);
    this.name = "NotificationRegistryDuplicateError";
    this.routeId = routeId;
  }
}

export class NotificationRegistryNotFoundError extends Error {
  readonly routeId: string;

  constructor(routeId: string) {
    super(`Notification route not found: ${routeId}`);
    this.name = "NotificationRegistryNotFoundError";
    this.routeId = routeId;
  }
}

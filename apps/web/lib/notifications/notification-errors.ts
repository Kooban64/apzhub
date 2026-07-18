/** User-facing Platform Notification client errors (APZNOTIFY-003). */

export class NotificationClientError extends Error {
  readonly code: string;
  readonly correlationId?: string;
  readonly status?: number;

  constructor(input: {
    readonly message: string;
    readonly code?: string;
    readonly correlationId?: string;
    readonly status?: number;
  }) {
    super(input.message);
    this.name = "NotificationClientError";
    this.code = input.code ?? "NOTIFICATION_CLIENT_ERROR";
    this.correlationId = input.correlationId;
    this.status = input.status;
  }
}

export function toNotificationUserMessage(error: unknown): string {
  if (error instanceof NotificationClientError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "You are not authorized to access notifications.";
    }
    if (error.status === 403 || error.code === "FORBIDDEN") {
      return "You do not have permission for this notification operation.";
    }
    if (error.status === 404) {
      return "Notification resource was not found.";
    }
    if (error.status === 503 || error.code === "NOTIFICATION_SERVICE_UNAVAILABLE") {
      return "Notification Platform is temporarily unavailable.";
    }
    if (error.status === 501) {
      return "Notification delivery is not available.";
    }
    return error.message || "Unable to complete notification request.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to complete notification request.";
}

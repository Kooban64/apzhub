/** Thrown when register/replace would duplicate an existing event id. */
export class EventRegistryDuplicateError extends Error {
  readonly eventId: string;

  constructor(eventId: string) {
    super(`Event id "${eventId}" is already registered`);
    this.name = "EventRegistryDuplicateError";
    this.eventId = eventId;
  }
}

/** Thrown when an event descriptor fails validation. */
export class EventRegistryValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "EventRegistryValidationError";
    this.field = field;
  }
}

/** Thrown when replace targets an unknown event id. */
export class EventRegistryNotFoundError extends Error {
  readonly eventId: string;

  constructor(eventId: string) {
    super(`Event id "${eventId}" is not registered`);
    this.name = "EventRegistryNotFoundError";
    this.eventId = eventId;
  }
}

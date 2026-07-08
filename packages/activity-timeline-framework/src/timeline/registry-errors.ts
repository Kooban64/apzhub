export class TimelineRegistryDuplicateError extends Error {
  readonly timelineId: string;

  constructor(timelineId: string) {
    super(`Timeline id "${timelineId}" is already registered`);
    this.name = "TimelineRegistryDuplicateError";
    this.timelineId = timelineId;
  }
}

export class TimelineRegistryValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "TimelineRegistryValidationError";
    this.field = field;
  }
}

export class TimelineRegistryNotFoundError extends Error {
  readonly timelineId: string;

  constructor(timelineId: string) {
    super(`Timeline id "${timelineId}" is not registered`);
    this.name = "TimelineRegistryNotFoundError";
    this.timelineId = timelineId;
  }
}

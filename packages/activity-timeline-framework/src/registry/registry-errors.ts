export class ActivityRegistryDuplicateError extends Error {
  readonly activityTypeId: string;

  constructor(activityTypeId: string) {
    super(`Activity type id "${activityTypeId}" is already registered`);
    this.name = "ActivityRegistryDuplicateError";
    this.activityTypeId = activityTypeId;
  }
}

export class ActivityRegistryValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ActivityRegistryValidationError";
    this.field = field;
  }
}

export class ActivityRegistryNotFoundError extends Error {
  readonly activityTypeId: string;

  constructor(activityTypeId: string) {
    super(`Activity type id "${activityTypeId}" is not registered`);
    this.name = "ActivityRegistryNotFoundError";
    this.activityTypeId = activityTypeId;
  }
}

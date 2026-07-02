/** Thrown when register/replace would duplicate an existing action id. */
export class ActionRegistryDuplicateError extends Error {
  readonly actionId: string;

  constructor(actionId: string) {
    super(`Action id "${actionId}" is already registered`);
    this.name = "ActionRegistryDuplicateError";
    this.actionId = actionId;
  }
}

/** Thrown when an action descriptor fails validation. */
export class ActionRegistryValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ActionRegistryValidationError";
    this.field = field;
  }
}

/** Thrown when replace targets an unknown action id. */
export class ActionRegistryNotFoundError extends Error {
  readonly actionId: string;

  constructor(actionId: string) {
    super(`Action id "${actionId}" is not registered`);
    this.name = "ActionRegistryNotFoundError";
    this.actionId = actionId;
  }
}

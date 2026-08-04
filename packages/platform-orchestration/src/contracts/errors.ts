export type OrchestrationErrorCategory =
  "validation" | "lifecycle" | "configuration" | "registry" | "internal";

export class OrchestrationError extends Error {
  readonly category: OrchestrationErrorCategory;
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    category: OrchestrationErrorCategory,
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "OrchestrationError";
    this.category = category;
    this.code = code;
    this.details = details;
  }
}

export function isOrchestrationError(error: unknown): error is OrchestrationError {
  return error instanceof OrchestrationError;
}

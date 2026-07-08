export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: Readonly<Record<string, string>>;
}

export interface Validator<TInput> {
  validate(input: TInput): ValidationResult;
}

export function createValidationResult(
  errors: Readonly<Record<string, string>>,
): ValidationResult {
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function mergeValidationResults(
  ...results: readonly ValidationResult[]
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const result of results) {
    Object.assign(errors, result.errors);
  }
  return createValidationResult(errors);
}

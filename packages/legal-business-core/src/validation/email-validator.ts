import { createValidationResult, type ValidationResult } from "../interfaces";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailInput {
  readonly address: string;
}

export const EmailValidator = {
  validate(input: EmailInput): ValidationResult {
    const errors: Record<string, string> = {};
    const address = input.address.trim();

    if (address.length === 0) {
      errors.address = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(address)) {
      errors.address = "Enter a valid email address.";
    }

    return createValidationResult(errors);
  },
};

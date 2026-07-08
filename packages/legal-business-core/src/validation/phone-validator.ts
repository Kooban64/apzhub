import { PHONE_TYPES, type Phone } from "../domain";
import { createValidationResult, type ValidationResult } from "../interfaces";

const PHONE_DIGITS_PATTERN = /^\+?[0-9()\-\s]{7,20}$/;

export const PhoneValidator = {
  validate(input: Phone): ValidationResult {
    const errors: Record<string, string> = {};

    if (!PHONE_TYPES.includes(input.phoneType)) {
      errors.phoneType = "Select a valid phone type.";
    }

    if (input.number.trim().length === 0) {
      errors.number = "Telephone number is required.";
    } else if (!PHONE_DIGITS_PATTERN.test(input.number.trim())) {
      errors.number = "Enter a valid telephone number.";
    }

    return createValidationResult(errors);
  },
};

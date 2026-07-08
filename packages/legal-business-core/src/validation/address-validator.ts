import { ADDRESS_TYPES, type Address } from "../domain";
import { createValidationResult, type ValidationResult } from "../interfaces";

export const AddressValidator = {
  validate(input: Address): ValidationResult {
    const errors: Record<string, string> = {};

    if (!ADDRESS_TYPES.includes(input.addressType)) {
      errors.addressType = "Select a valid address type.";
    }

    if (input.line1.trim().length === 0) {
      errors.line1 = "Address line 1 is required.";
    }

    if (input.city.trim().length === 0) {
      errors.city = "City is required.";
    }

    if (input.countryCode.trim().length !== 2) {
      errors.countryCode = "Country code must be a two-letter ISO code.";
    }

    return createValidationResult(errors);
  },
};

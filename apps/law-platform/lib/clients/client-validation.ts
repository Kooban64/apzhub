import { ClientValidator, type ValidationResult } from "@apzhub/legal-business-core";

import type { ClientFormValues } from "./client-types";

export type ClientValidationResult = ValidationResult;

function parseCustomFieldsValue(
  input: string,
): Readonly<Record<string, string>> | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {};
  }

  const fields: Record<string, string> = {};
  for (const line of trimmed.split("\n")) {
    const segment = line.trim();
    if (segment.length === 0) {
      continue;
    }

    const separatorIndex = segment.indexOf("=");
    if (separatorIndex <= 0) {
      return null;
    }

    const key = segment.slice(0, separatorIndex).trim();
    const value = segment.slice(separatorIndex + 1).trim();
    if (key.length === 0) {
      return null;
    }

    fields[key] = value;
  }

  return fields;
}

/** Validates Client Management form values via the shared Legal Business Core. */
export function validateClientForm(values: ClientFormValues): ClientValidationResult {
  const result = ClientValidator.validate({
    clientReference: values.clientReference,
    displayName: values.displayName,
    clientType: values.clientType,
    status: values.status,
    primaryContactId: values.primaryContactId,
    billingAddressId: values.billingAddressId,
  });

  const customFields = parseCustomFieldsValue(values.customFields);
  if (customFields === null) {
    return {
      valid: false,
      errors: {
        ...result.errors,
        customFields: "Custom fields must use key=value format, one per line.",
      },
    };
  }

  return result;
}

export function parseTagsInput(input: string): readonly string[] {
  return ClientValidator.parseTagsInput(input);
}

export function parseCustomFieldsInput(
  input: string,
): Readonly<Record<string, string>> {
  return parseCustomFieldsValue(input) ?? {};
}

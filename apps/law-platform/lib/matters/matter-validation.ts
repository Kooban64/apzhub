import { MatterValidator, type ValidationResult } from "@apzhub/legal-business-core";

import type { MatterFormValues } from "./matter-types";

export type MatterValidationResult = ValidationResult;

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

/** Validates Matter Management form values via the shared Legal Business Core. */
export function validateMatterForm(values: MatterFormValues): MatterValidationResult {
  const result = MatterValidator.validate({
    matterReference: values.matterReference,
    title: values.title,
    clientId: values.clientId,
    matterTypeId: values.matterTypeId,
    matterStatus: values.matterStatus,
    practiceAreaId: values.practiceAreaId,
    priority: values.priority,
    leadAttorneyId: values.leadAttorneyId,
  });

  if (values.leadAttorneyId.trim().length === 0) {
    return {
      valid: false,
      errors: {
        ...result.errors,
        leadAttorneyId: "Assigned attorney is required.",
      },
    };
  }

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
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function parseCustomFieldsInput(
  input: string,
): Readonly<Record<string, string>> {
  return parseCustomFieldsValue(input) ?? {};
}

import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  type Client,
  type ClientStatus,
  type ClientType,
} from "../domain";
import { createValidationResult, type ValidationResult } from "../interfaces";
import { isClientReference } from "./reference-validator";

export interface ClientFormInput {
  readonly clientReference: string;
  readonly displayName: string;
  readonly clientType: ClientType;
  readonly status: ClientStatus;
  readonly primaryContactId?: string;
  readonly billingAddressId?: string;
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

function parseCustomFieldsInput(
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

export const ClientValidator = {
  validate(input: ClientFormInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (input.displayName.trim().length === 0) {
      errors.displayName = "Display name is required.";
    }

    if (!CLIENT_TYPES.includes(input.clientType)) {
      errors.clientType = "Select a valid client type.";
    }

    if (!CLIENT_STATUSES.includes(input.status)) {
      errors.status = "Select a valid client status.";
    }

    if (
      input.clientReference.trim().length > 0 &&
      !isClientReference(input.clientReference.trim())
    ) {
      errors.clientReference = "Reference must match CLT-YYYY-NNNNN.";
    }

    const primaryContactId = input.primaryContactId?.trim() ?? "";
    if (primaryContactId.length > 0 && primaryContactId.length < 8) {
      errors.primaryContactId =
        "Primary contact ID must be at least 8 characters when provided.";
    }

    const billingAddressId = input.billingAddressId?.trim() ?? "";
    if (billingAddressId.length > 0 && billingAddressId.length < 8) {
      errors.billingAddressId =
        "Billing address ID must be at least 8 characters when provided.";
    }

    return createValidationResult(errors);
  },

  validateEntity(client: Client): ValidationResult {
    return ClientValidator.validate({
      clientReference: client.clientReference,
      displayName: client.displayName,
      clientType: client.clientType,
      status: client.status,
      primaryContactId: client.primaryContactId,
      billingAddressId: client.billingAddressId,
      tags: client.tags,
      customFields: client.customFields,
    });
  },

  parseCustomFieldsInput(input: string): Readonly<Record<string, string>> {
    return parseCustomFieldsInput(input) ?? {};
  },

  parseTagsInput(input: string): readonly string[] {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  },
};

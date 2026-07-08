import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  REFERENCE_PREFIXES,
  createValidationResult,
  validateReferenceNumber,
  type ValidationResult,
} from "@apzhub/legal-business-core";

import type { DocumentFormValues } from "./document-types";
import { getSharedMatterRepository } from "../persistence/repository-factory";

export type DocumentValidationResult = ValidationResult;

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

/** Validates Document Management form values for in-memory workflow (LAW-004-01). */
export function validateDocumentForm(
  values: DocumentFormValues,
): DocumentValidationResult {
  const errors: Record<string, string> = {};

  if (values.title.trim().length === 0) {
    errors.title = "Document title is required.";
  }

  if (values.matterId.trim().length === 0) {
    errors.matterId = "Matter is required.";
  } else if (!getSharedMatterRepository().getById(values.matterId.trim())) {
    errors.matterId = "Select a valid matter from the repository.";
  }

  if (!DOCUMENT_TYPES.includes(values.documentType)) {
    errors.documentType = "Select a valid document type.";
  }

  if (!DOCUMENT_STATUSES.includes(values.documentStatus)) {
    errors.documentStatus = "Select a valid document status.";
  }

  if (values.documentCategoryId.trim().length === 0) {
    errors.documentCategoryId = "Document category is required.";
  }

  if (
    values.documentReference.trim().length > 0 &&
    !validateReferenceNumber(values.documentReference.trim(), {
      prefix: REFERENCE_PREFIXES.document,
    })
  ) {
    errors.documentReference = "Reference must match DOC-YYYY-NNNNNN.";
  }

  const sizeBytes = Number.parseInt(values.sizeBytes, 10);
  if (Number.isNaN(sizeBytes) || sizeBytes < 0) {
    errors.sizeBytes = "Size must be a non-negative number of bytes.";
  }

  const customFields = parseCustomFieldsValue(values.customFields);
  if (customFields === null) {
    errors.customFields = "Custom fields must use key=value format, one per line.";
  }

  return createValidationResult(errors);
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

export function parseSizeBytesInput(input: string): number {
  const parsed = Number.parseInt(input, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

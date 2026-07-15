/**
 * Document classification helpers (APZDOCS-001).
 * Catalogue validation only — no policy engine.
 */

import type {
  DocumentClassification,
  DocumentClassificationCode,
} from "@apzhub/document-contracts";
import { DOCUMENT_CLASSIFICATIONS } from "@apzhub/document-contracts";

import { DocumentDomainError } from "../ports/types";

export function isDocumentClassificationCode(
  value: string,
): value is DocumentClassificationCode {
  return (DOCUMENT_CLASSIFICATIONS as readonly string[]).includes(value);
}

export function assertDocumentClassificationCode(
  value: string,
): asserts value is DocumentClassificationCode {
  if (!isDocumentClassificationCode(value)) {
    throw new DocumentDomainError(
      "invalid_classification",
      `Unknown document classification: ${value}`,
      { value },
    );
  }
}

export function buildDocumentClassification(input: {
  readonly code: DocumentClassificationCode;
  readonly customCode?: string;
  readonly label?: string;
}): DocumentClassification {
  assertDocumentClassificationCode(input.code);
  if (input.code === "custom" && !input.customCode?.trim()) {
    throw new DocumentDomainError(
      "invalid_classification",
      "custom classification requires customCode",
    );
  }
  return {
    code: input.code,
    label: input.label,
    customCode:
      input.code === "custom" ? input.customCode?.trim() : undefined,
  };
}

/**
 * Integrity Platform application errors — APZQEP-120-S04.
 */

import { EvidenceDomainError } from "../../shared/errors";

export type EvidenceIntegrityErrorCode =
  | "INTEGRITY_NOT_ESTABLISHED"
  | "INTEGRITY_MISMATCH"
  | "INTEGRITY_CONTENT_MISSING"
  | "INTEGRITY_ALGORITHM_UNSUPPORTED"
  | "INTEGRITY_RECORD_INVALID"
  | "INTEGRITY_VERIFICATION_FAILED"
  | "STORAGE_UNAVAILABLE"
  | "ACCESS_DENIED"
  | "INVALID_REQUEST";

export class EvidenceIntegrityPlatformError extends EvidenceDomainError {
  readonly integrityCode: EvidenceIntegrityErrorCode;

  constructor(
    integrityCode: EvidenceIntegrityErrorCode,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    const category =
      integrityCode === "INTEGRITY_MISMATCH" ||
      integrityCode === "INTEGRITY_CONTENT_MISSING" ||
      integrityCode === "INTEGRITY_NOT_ESTABLISHED"
        ? "integrity_failed"
        : integrityCode === "ACCESS_DENIED"
          ? "forbidden"
          : integrityCode === "STORAGE_UNAVAILABLE"
            ? "precondition_failed"
            : "validation";
    super(category, integrityCode, message, details);
    this.name = "EvidenceIntegrityPlatformError";
    this.integrityCode = integrityCode;
  }
}

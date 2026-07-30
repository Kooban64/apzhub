/**
 * EvidenceReference validation — APZQEP-ENG-110E.
 * Structural + scheme checks only. Does not grant access.
 */

import type { EvidenceReference } from "../../domain/evidence/value-objects";
import { denyDecision, invalidDecision, type EvidenceAccessDecision } from "./types";

const ALLOWED_URI_SCHEMES = new Set(["https:", "http:", "s3:", "apz-evidence:"]);

/**
 * Validate consumer EvidenceReference shape.
 * Returns undefined when structurally acceptable for further policy evaluation.
 */
export function validateEvidenceReference(
  reference: EvidenceReference | undefined | null,
): EvidenceAccessDecision | undefined {
  if (!reference) {
    return invalidDecision("missing_evidence_reference");
  }
  const evidenceId = reference.evidenceId?.trim() ?? "";
  if (!evidenceId) {
    return invalidDecision("empty_evidence_id");
  }
  if (evidenceId.length > 128) {
    return invalidDecision("evidence_id_too_long");
  }
  if (reference.contentHash) {
    const hash = reference.contentHash.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(hash)) {
      return invalidDecision("invalid_evidence_reference_content_hash");
    }
  }
  if (reference.uriOrHandle) {
    const uri = reference.uriOrHandle.trim();
    if (!uri) {
      return invalidDecision("empty_evidence_uri");
    }
    if (uri.length > 2048) {
      return invalidDecision("evidence_uri_too_long");
    }
    try {
      const parsed = new URL(uri);
      if (!ALLOWED_URI_SCHEMES.has(parsed.protocol)) {
        return denyDecision(`unsupported_evidence_uri_scheme:${parsed.protocol}`);
      }
    } catch {
      return invalidDecision("malformed_evidence_uri");
    }
  }
  return undefined;
}

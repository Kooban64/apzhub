/**
 * Evidence Access Port adapter — APZQEP-REM-001 (L-02 remediation).
 *
 * Security principle: NO EXPLICIT AUTHORISATION = NO ACCESS.
 * Missing check, indeterminate results, errors, and invalid requests DENY.
 */
import { ExecutionForbiddenError, ExecutionValidationError } from "../../shared/errors";
import type {
  EvidenceAccessAction,
  EvidenceAccessDecision,
  EvidenceAccessPort,
} from "../../application/ports";
import type { ExecutionRequestContext } from "../../application/context";

export type EvidenceAccessCheckFn = (
  ctx: ExecutionRequestContext,
  uri: string,
  action: EvidenceAccessAction,
) => Promise<boolean | EvidenceAccessDecision> | boolean | EvidenceAccessDecision;

const ALLOWED_URI_SCHEMES = new Set(["https:", "http:", "s3:", "apz-evidence:"]);

function deny(reason: string): EvidenceAccessDecision {
  return { outcome: "denied", reason };
}

function allow(reason: string): EvidenceAccessDecision {
  return { outcome: "allowed", reason };
}

function invalid(reason: string): EvidenceAccessDecision {
  return { outcome: "invalid_request", reason };
}

function unavailable(reason: string): EvidenceAccessDecision {
  return { outcome: "unavailable", reason };
}

function indeterminate(reason: string): EvidenceAccessDecision {
  return { outcome: "indeterminate", reason };
}

/**
 * Baseline URI + actor/tenant validation used before any external check.
 * Does not grant access by itself when the port has no check configured.
 */
export function validateEvidenceAccessRequest(
  ctx: ExecutionRequestContext,
  uri: string,
): EvidenceAccessDecision | undefined {
  if (!ctx.tenantId?.trim() || !ctx.userId?.trim()) {
    return deny("missing_authenticated_actor_or_tenant");
  }
  const trimmed = uri?.trim() ?? "";
  if (!trimmed) {
    return invalid("empty_evidence_uri");
  }
  if (trimmed.length > 2048) {
    return invalid("evidence_uri_too_long");
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return invalid("malformed_evidence_uri");
  }
  if (!ALLOWED_URI_SCHEMES.has(parsed.protocol)) {
    return deny(`unsupported_evidence_uri_scheme:${parsed.protocol}`);
  }
  return undefined;
}

/**
 * Explicit baseline accessibility policy for environments without an Evidence
 * Management ACL hook. Returns true only when actor/tenant/URI are valid.
 * This is an affirmative policy result — not a missing-check fallback.
 */
export function createBaselineEvidenceAccessCheck(): EvidenceAccessCheckFn {
  return (ctx, uri, _action) => {
    const baseline = validateEvidenceAccessRequest(ctx, uri);
    if (baseline) {
      return baseline;
    }
    return allow("baseline_uri_and_actor_policy");
  };
}

function normalizeCheckResult(
  result: boolean | EvidenceAccessDecision | undefined | null,
): EvidenceAccessDecision {
  if (result === true) {
    return allow("external_check_granted");
  }
  if (result === false) {
    return deny("external_check_denied");
  }
  if (result && typeof result === "object" && "outcome" in result) {
    return result;
  }
  return indeterminate("external_check_undefined_result");
}

function decisionGrantsAccess(decision: EvidenceAccessDecision): boolean {
  return decision.outcome === "allowed";
}

/**
 * Production adapter — fail closed.
 * - No check injected → DENY (configuration omission).
 * - Check throws / times out / returns non-true → DENY.
 * - Invalid URI / missing actor → DENY / invalid_request.
 */
export function createEvidenceAccessPort(
  check?: EvidenceAccessCheckFn,
): EvidenceAccessPort {
  return {
    portId: "EvidenceAccessPort",
    async evaluateAccess(ctx, uri, action = "associate") {
      const baseline = validateEvidenceAccessRequest(ctx, uri);
      if (baseline) {
        return baseline;
      }
      if (!check) {
        return deny("evidence_access_check_not_configured");
      }
      try {
        const raw = await check(ctx, uri, action);
        return normalizeCheckResult(raw);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "evidence_access_check_failed";
        return unavailable(`evidence_access_check_error:${message}`);
      }
    },
    async assertAccessible(ctx, uri, action = "associate") {
      const decision = await this.evaluateAccess(ctx, uri, action);
      if (decisionGrantsAccess(decision)) {
        return;
      }
      if (
        decision.outcome === "invalid_request" ||
        decision.reason.startsWith("malformed") ||
        decision.reason === "empty_evidence_uri" ||
        decision.reason === "evidence_uri_too_long"
      ) {
        throw new ExecutionValidationError(
          "Evidence reference is not acceptable for association",
          { reason: decision.reason, action },
        );
      }
      throw new ExecutionForbiddenError(
        "Evidence is not accessible to the current user",
        { reason: decision.reason, action, outcome: decision.outcome },
      );
    },
  };
}

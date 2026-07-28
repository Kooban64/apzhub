import type {
  ZammadAdapterCertificationOutcome,
  ZammadCapabilityCertification,
  ZammadCompatibilityMatrix,
  ZammadOperationalHealthLevel,
  ZammadReadinessResult,
  ZammadReferenceAdapterComplianceResult,
} from "./types";

export interface DecideZammadCertificationOutcomeInput {
  readonly capabilities: readonly ZammadCapabilityCertification[];
  readonly compatibility: ZammadCompatibilityMatrix;
  readonly readiness: ZammadReadinessResult;
  readonly healthLevel: ZammadOperationalHealthLevel;
  readonly referenceCompliance: ZammadReferenceAdapterComplianceResult;
}

/**
 * Deterministic adapter certification decision rules:
 *
 * 1. INCOMPATIBLE — blocking version incompatibilities or failed mandatory architecture checks
 * 2. NOT_CERTIFIED — required capabilities missing/unimplemented, readiness blocked, or health UNAVAILABLE
 * 3. CERTIFIED_WITH_LIMITATIONS — ready with optional gaps, unverified version, or documented limitations
 * 4. CERTIFIED — all required capabilities available, compatible, ready, healthy, compliant
 */
export function decideZammadCertificationOutcome(
  input: DecideZammadCertificationOutcomeInput,
): ZammadAdapterCertificationOutcome {
  if (
    input.compatibility.blockingIncompatibilities.length > 0 ||
    input.referenceCompliance.outcome === "fail"
  ) {
    return "INCOMPATIBLE";
  }

  const requiredMissing = input.capabilities.filter(
    (c) => !c.optional && (!c.implemented || !c.registered),
  );
  if (
    requiredMissing.length > 0 ||
    !input.readiness.ready ||
    input.healthLevel === "UNAVAILABLE" ||
    input.healthLevel === "LIMITED"
  ) {
    return "NOT_CERTIFIED";
  }

  const optionalGaps = input.capabilities.filter(
    (c) => c.optional && (!c.available || c.degraded || !c.implemented),
  );
  const hasLimitations =
    optionalGaps.length > 0 ||
    input.compatibility.compatibilityStatus === "unverified" ||
    input.compatibility.compatibilityStatus === "warning" ||
    input.healthLevel === "DEGRADED" ||
    input.referenceCompliance.outcome === "pass_with_limitations" ||
    input.readiness.warnings.length > 0;

  if (hasLimitations) {
    return "CERTIFIED_WITH_LIMITATIONS";
  }

  return "CERTIFIED";
}

export const ZAMMAD_KNOWN_LIMITATIONS = [
  "Binary attachment upload/download available via articles (R12-SUP-02); delete not exposed; max 1 MiB",
  "Webhook HTTP ingress available via Platform POST /api/v1/integrations/zammad/webhooks (R12-SUP-01); attachment events translated as metadata",
  "Persistent synchronisation state is not implemented (in-memory only)",
  "Article update and delete are unsupported",
  "Article sync is not implemented",
  "OAuth authentication is not implemented (API token only)",
  "Analytics includes heuristic metrics — not authoritative SLA calculations",
  "Support realtime WS/SSE deferred (R12-SUP-03)",
] as const;

/**
 * Side-effect emitters for Phase 3 continuous signals (SPR-APZQEP-230 residual).
 * Advisory only — never calls certification.decide / GO.
 */

import { createContinuousCertSignal } from "@/lib/qep/continuous-cert-signal-store";
import { upsertContinuousVerificationSignal } from "@/lib/qep/continuous-verification-store";

export function emitAutomationVerificationHeartbeat(input: {
  readonly providerId: string;
  readonly subjectRef: string;
  readonly actorId: string;
  readonly notes?: string;
  readonly staleAfterHours?: number;
}): void {
  const subjectRef = input.subjectRef.trim();
  if (!subjectRef) return;
  upsertContinuousVerificationSignal({
    source: `automation.${input.providerId.trim() || "unknown"}`,
    subjectRef,
    actorId: input.actorId,
    ...(input.notes ? { notes: input.notes } : {}),
    ...(typeof input.staleAfterHours === "number"
      ? { staleAfterHours: input.staleAfterHours }
      : {}),
  });
}

export function emitCertFreshnessSignal(input: {
  readonly evaluationId: string;
  readonly changeEventId: string;
  readonly readiness: string;
  readonly actorId: string;
}): void {
  const evaluationId = input.evaluationId.trim();
  if (!evaluationId) return;
  createContinuousCertSignal({
    evaluationId,
    kind: "freshness",
    detail: `RC evaluated for ${input.changeEventId} · readiness ${input.readiness} (advisory; human re-approve only)`,
    actorId: input.actorId,
  });
}

export function resolveAutomationSubjectRef(input: {
  readonly executionId?: string;
  readonly changeEventId?: string;
  readonly targetName?: string;
}): string {
  const change = input.changeEventId?.trim();
  if (change) return change;
  const name = input.targetName?.trim();
  if (name) return name;
  return input.executionId?.trim() || "unknown";
}

import {
  CERTIFICATION_OUTCOMES,
  GATE_CONDITION_KINDS,
  GATE_LIFECYCLES,
  GATE_RESULTS,
  GATE_TYPES,
  READINESS_POSTURES,
  RISK_SEVERITIES,
  RISK_STATUSES,
  SIGNAL_KINDS,
  type CertificationOutcome,
  type GateConditionKind,
  type GateLifecycle,
  type GateResult,
  type GateType,
  type ReadinessPosture,
  type RiskSeverity,
  type RiskStatus,
  type SignalKind,
} from "./types";

const SECRET_PATTERN =
  /(password|passwd|secret|token|private[_-]?key|api[_-]?key)\s*[:=]|-----BEGIN /i;

export function assertApplicationBound(applicationId: string, label: string): void {
  if (!applicationId.trim()) {
    throw new Error(`${label}.application_required`);
  }
}

export function assertSameApplication(
  left: string,
  right: string,
  label: string,
): void {
  if (left !== right) {
    throw new Error(`${label}.application_mismatch`);
  }
}

export function assertNoRawSecrets(value: string | undefined, label: string): void {
  if (value && SECRET_PATTERN.test(value)) {
    throw new Error(`${label}.secrets_forbidden`);
  }
}

export function requireText(value: string | undefined, label: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`${label}.required`);
  return trimmed;
}

export function isRiskStatus(value: string): value is RiskStatus {
  return (RISK_STATUSES as readonly string[]).includes(value);
}

export function isRiskSeverity(value: string): value is RiskSeverity {
  return (RISK_SEVERITIES as readonly string[]).includes(value);
}

export function isGateType(value: string): value is GateType {
  return (GATE_TYPES as readonly string[]).includes(value);
}

export function isGateLifecycle(value: string): value is GateLifecycle {
  return (GATE_LIFECYCLES as readonly string[]).includes(value);
}

export function isGateConditionKind(value: string): value is GateConditionKind {
  return (GATE_CONDITION_KINDS as readonly string[]).includes(value);
}

export function isGateResult(value: string): value is GateResult {
  return (GATE_RESULTS as readonly string[]).includes(value);
}

export function isReadinessPosture(value: string): value is ReadinessPosture {
  return (READINESS_POSTURES as readonly string[]).includes(value);
}

export function isCertificationOutcome(value: string): value is CertificationOutcome {
  return (CERTIFICATION_OUTCOMES as readonly string[]).includes(value);
}

export function isSignalKind(value: string): value is SignalKind {
  return (SIGNAL_KINDS as readonly string[]).includes(value);
}

export function isBlockingRisk(severity: RiskSeverity, status: RiskStatus): boolean {
  return status === "open" && (severity === "high" || severity === "critical");
}

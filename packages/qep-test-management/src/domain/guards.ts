import {
  EXECUTION_SURFACES,
  FORBIDDEN_INFRASTRUCTURE_ALIASES,
  INFRASTRUCTURE_TARGET_TYPES,
  TEST_CASE_PRIORITIES,
  TEST_CASE_TYPES,
  VERIFICATION_CAPABILITIES,
  type ExecutionSurface,
  type InfrastructureTargetType,
  type VerificationCapability,
} from "./types";

const SECRET_PATTERN =
  /(password|passwd|secret|token|private[_-]?key|api[_-]?key)\s*[:=]|-----BEGIN /i;

export function assertApplicationBound(applicationId: string, label: string): void {
  if (!applicationId.trim()) {
    throw new Error(`${label}.application_required`);
  }
}

export function assertSameApplication(left: string, right: string): void {
  if (left !== right) {
    throw new Error("test_management.application_mismatch");
  }
}

export function assertNoRawSecrets(value: string | undefined, label: string): void {
  if (value && SECRET_PATTERN.test(value)) {
    throw new Error(`${label}.secrets_forbidden`);
  }
}

export function isVerificationCapability(
  value: string,
): value is VerificationCapability {
  return (VERIFICATION_CAPABILITIES as readonly string[]).includes(value);
}

export function isExecutionSurface(value: string): value is ExecutionSurface {
  return (EXECUTION_SURFACES as readonly string[]).includes(value);
}

export function isInfrastructureTargetType(
  value: string,
): value is InfrastructureTargetType {
  return (INFRASTRUCTURE_TARGET_TYPES as readonly string[]).includes(value);
}

export function assertInfrastructureTargetType(value: string | undefined): void {
  if (!value) return;
  const normalized = value.trim().toLowerCase().replaceAll(" ", "_");
  if ((FORBIDDEN_INFRASTRUCTURE_ALIASES as readonly string[]).includes(normalized)) {
    throw new Error("strategy.infrastructure_target.surface_not_allowed");
  }
  if (!isInfrastructureTargetType(normalized)) {
    throw new Error("strategy.infrastructure_target.type_invalid");
  }
}

export function normalizeTestCaseType(value: string | undefined): string {
  const next = (value ?? "functional").trim() || "functional";
  if (!(TEST_CASE_TYPES as readonly string[]).includes(next)) {
    return "functional";
  }
  return next;
}

export function normalizePriority(value: string | undefined): string {
  const next = (value ?? "medium").trim() || "medium";
  if (!(TEST_CASE_PRIORITIES as readonly string[]).includes(next)) {
    return "medium";
  }
  return next;
}

export function assertNoTcAlias(number: string): void {
  if (/^TC-\d+$/i.test(number.trim())) {
    throw new Error("test_case.tc_alias_forbidden");
  }
}

export function parseTsNumber(number: string): number | undefined {
  const match = /^TS-(\d+)$/i.exec(number.trim());
  return match ? Number(match[1]) : undefined;
}

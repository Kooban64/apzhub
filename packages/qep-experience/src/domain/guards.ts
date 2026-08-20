import {
  CRITERION_RESULT_STATES,
  DEVICE_CLASSES,
  FORBIDDEN_INFRASTRUCTURE_ALIASES,
  ISSUE_PRIORITIES,
  OPTIONAL_TRACE_KINDS,
  QUALITY_HOST_KINDS,
  QUALITY_LIFECYCLE_STATES,
  VERIFICATION_DISCIPLINES,
  type CriterionResultState,
  type DeviceClass,
  type IssuePriority,
  type OptionalTraceKind,
  type QualityHostKind,
  type QualityLifecycleState,
  type VerificationDiscipline,
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

export function assertNotInfrastructureAlias(
  value: string | undefined,
  label: string,
): void {
  if (!value) return;
  const normalized = value.trim().toLowerCase().replaceAll(" ", "_");
  if ((FORBIDDEN_INFRASTRUCTURE_ALIASES as readonly string[]).includes(normalized)) {
    throw new Error(`${label}.infrastructure_target_forbidden`);
  }
}

export function isLifecycle(value: string): value is QualityLifecycleState {
  return (QUALITY_LIFECYCLE_STATES as readonly string[]).includes(value);
}

export function isDiscipline(value: string): value is VerificationDiscipline {
  return (VERIFICATION_DISCIPLINES as readonly string[]).includes(value);
}

export function isDeviceClass(value: string): value is DeviceClass {
  return (DEVICE_CLASSES as readonly string[]).includes(value);
}

export function isCriterionState(value: string): value is CriterionResultState {
  return (CRITERION_RESULT_STATES as readonly string[]).includes(value);
}

export function isHostKind(value: string): value is QualityHostKind {
  return (QUALITY_HOST_KINDS as readonly string[]).includes(value);
}

export function isIssuePriority(value: string): value is IssuePriority {
  return (ISSUE_PRIORITIES as readonly string[]).includes(value);
}

export function isOptionalTraceKind(value: string): value is OptionalTraceKind {
  return (OPTIONAL_TRACE_KINDS as readonly string[]).includes(value);
}

export function requireText(value: string | undefined, label: string): string {
  const next = value?.trim() ?? "";
  if (!next) throw new Error(`${label}.required`);
  return next;
}

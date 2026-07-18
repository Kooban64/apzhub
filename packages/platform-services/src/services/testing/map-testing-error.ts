import {
  PlatformServiceError,
  isPlatformServiceError,
} from "@apzhub/platform-service-contracts";
import type {
  PlatformServiceErrorCategory,
  PlatformServiceErrorCode,
} from "@apzhub/platform-service-contracts";
import { PersistenceError } from "@apzhub/testing-persistence";
import { DomainRuleError } from "@apzhub/testing-services";

interface ErrorMapping {
  readonly category: PlatformServiceErrorCategory;
  readonly code: PlatformServiceErrorCode;
  readonly message: string;
  readonly retryable: boolean;
}

const DOMAIN_CODE_MAPPINGS: readonly [RegExp, ErrorMapping][] = [
  [
    /validation|invalid_.+format|unsupported_.+format/i,
    {
      category: "validation",
      code: "VALIDATION_FAILED",
      message: "Testing request validation failed",
      retryable: false,
    },
  ],
  [
    /invalid_.+transition|state_transition/i,
    {
      category: "business_rule",
      code: "INVALID_STATE_TRANSITION",
      message: "Testing state transition is not allowed",
      retryable: false,
    },
  ],
  [
    /approval.*order/i,
    {
      category: "business_rule",
      code: "APPROVAL_ORDER_VIOLATION",
      message: "Testing approval order is not valid",
      retryable: false,
    },
  ],
  [
    /evidence.*incomplete|missing_evidence/i,
    {
      category: "business_rule",
      code: "EVIDENCE_INCOMPLETE",
      message: "Testing evidence is incomplete",
      retryable: false,
    },
  ],
  [
    /certification.*gate/i,
    {
      category: "business_rule",
      code: "CERTIFICATION_GATE_FAILURE",
      message: "Certification gate failed",
      retryable: false,
    },
  ],
  [
    /certification.*not_ready|release.*not_ready/i,
    {
      category: "business_rule",
      code: "CERTIFICATION_NOT_READY",
      message: "Certification is not ready",
      retryable: false,
    },
  ],
  [
    /duplicate.*automation/i,
    {
      category: "conflict",
      code: "DUPLICATE_AUTOMATION_IMPORT",
      message: "Automation import already exists",
      retryable: false,
    },
  ],
  [
    /automation.*result|invalid_automation/i,
    {
      category: "validation",
      code: "INVALID_AUTOMATION_RESULT",
      message: "Automation result is not valid",
      retryable: false,
    },
  ],
  [
    /not_implemented|unsupported/i,
    {
      category: "configuration",
      code: "CAPABILITY_UNSUPPORTED",
      message: "Testing capability is not supported",
      retryable: false,
    },
  ],
];

export function mapTestingDomainError(
  error: unknown,
  correlationId: string,
): PlatformServiceError {
  if (isPlatformServiceError(error)) {
    return error;
  }

  if (error instanceof DomainRuleError) {
    const mapped = DOMAIN_CODE_MAPPINGS.find(([pattern]) =>
      pattern.test(error.code),
    )?.[1] ?? {
      category: "business_rule" as const,
      code: "BUSINESS_RULE_VIOLATION" as const,
      message: "Testing business rule violation",
      retryable: false,
    };

    return new PlatformServiceError({
      ...mapped,
      correlationId,
      details: { classification: error.code },
    });
  }

  if (error instanceof PersistenceError) {
    switch (error.code) {
      case "NOT_FOUND":
        return new PlatformServiceError({
          category: "not_found",
          code: "NOT_FOUND",
          message: "Testing resource was not found",
          correlationId,
          retryable: false,
        });
      case "REVISION_CONFLICT":
        return new PlatformServiceError({
          category: "conflict",
          code: "CONFLICT",
          message: "Testing resource was changed by another operation",
          correlationId,
          retryable: false,
        });
      case "TENANT_MISMATCH":
        return new PlatformServiceError({
          category: "authorization",
          code: "TENANT_MISMATCH",
          message: "Testing resource is outside the current tenant",
          correlationId,
          retryable: false,
        });
      case "UNAUTHORIZED":
        return new PlatformServiceError({
          category: "authorization",
          code: "PERMISSION_DENIED",
          message: "Permission denied",
          correlationId,
          retryable: false,
        });
      case "VALIDATION":
        return new PlatformServiceError({
          category: "validation",
          code: "VALIDATION_FAILED",
          message: "Testing persistence validation failed",
          correlationId,
          retryable: false,
        });
    }
  }

  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Testing service operation failed",
    correlationId,
    retryable: false,
  });
}

export async function withTestingErrorMapping<T>(
  fn: () => Promise<T>,
  correlationId: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw mapTestingDomainError(error, correlationId);
  }
}

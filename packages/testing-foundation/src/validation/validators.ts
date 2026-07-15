import { z } from "zod";
import {
  CERTIFICATION_STATUSES,
  EXECUTION_STATUSES,
  PRIORITIES,
  TEST_RESULT_STATUSES,
  TEST_STATUSES,
  isPlatformIdShape,
} from "@apzhub/testing-contracts";

export interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

export interface ValidationOutcome {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export function createValidationOutcome(
  issues: readonly ValidationIssue[],
): ValidationOutcome {
  return { valid: issues.length === 0, issues };
}

export function validateRequiredString(
  value: unknown,
  path: string,
): ValidationIssue | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { path, message: `${path} is required` };
  }
  return undefined;
}

export function validatePlatformId(
  value: unknown,
  path: string,
): ValidationIssue | undefined {
  const required = validateRequiredString(value, path);
  if (required) return required;
  if (!isPlatformIdShape(value as string)) {
    return { path, message: `${path} has invalid platform id shape` };
  }
  return undefined;
}

export function validateEnumMembership<T extends string>(
  value: unknown,
  path: string,
  allowed: readonly T[],
): ValidationIssue | undefined {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    return {
      path,
      message: `${path} must be one of: ${allowed.join(", ")}`,
    };
  }
  return undefined;
}

const requirementInputSchema = z.object({
  tenantId: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  priority: z.enum(PRIORITIES),
  workItemRefs: z.array(z.unknown()).optional(),
  riskIds: z.array(z.string()).optional(),
});

const testCaseInputSchema = z.object({
  tenantId: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(TEST_STATUSES),
  priority: z.enum(PRIORITIES),
  suiteIds: z.array(z.string()).default([]),
  requirementIds: z.array(z.string()).default([]),
  steps: z
    .array(
      z.object({
        id: z.string().min(1),
        caseId: z.string().min(1),
        ordinal: z.number().int().nonnegative(),
        action: z.string().min(1),
        expectedResult: z.string().min(1),
      }),
    )
    .default([]),
});

const certificationTransitionSchema = z.object({
  certificationRecordId: z.string().min(1),
  nextStatus: z.enum(CERTIFICATION_STATUSES),
  reason: z.string().optional(),
});

export function validateRequirementInput(input: unknown): ValidationOutcome {
  const parsed = requirementInputSchema.safeParse(input);
  if (!parsed.success) {
    return createValidationOutcome(
      parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const issues: ValidationIssue[] = [];
  for (const [index, riskId] of (parsed.data.riskIds ?? []).entries()) {
    const issue = validatePlatformId(riskId, `riskIds.${index}`);
    if (issue) issues.push(issue);
  }
  return createValidationOutcome(issues);
}

export function validateTestCaseInput(input: unknown): ValidationOutcome {
  const parsed = testCaseInputSchema.safeParse(input);
  if (!parsed.success) {
    return createValidationOutcome(
      parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const issues: ValidationIssue[] = [];
  for (const [index, suiteId] of parsed.data.suiteIds.entries()) {
    const issue = validatePlatformId(suiteId, `suiteIds.${index}`);
    if (issue) issues.push(issue);
  }
  for (const [index, requirementId] of parsed.data.requirementIds.entries()) {
    const issue = validatePlatformId(requirementId, `requirementIds.${index}`);
    if (issue) issues.push(issue);
  }
  for (const [index, step] of parsed.data.steps.entries()) {
    const stepIdIssue = validatePlatformId(step.id, `steps.${index}.id`);
    if (stepIdIssue) issues.push(stepIdIssue);
    const caseIdIssue = validatePlatformId(step.caseId, `steps.${index}.caseId`);
    if (caseIdIssue) issues.push(caseIdIssue);
  }
  return createValidationOutcome(issues);
}

export function validateCertificationTransition(input: unknown): ValidationOutcome {
  const parsed = certificationTransitionSchema.safeParse(input);
  if (!parsed.success) {
    return createValidationOutcome(
      parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const idIssue = validatePlatformId(
    parsed.data.certificationRecordId,
    "certificationRecordId",
  );
  return createValidationOutcome(idIssue ? [idIssue] : []);
}

export function validateExecutionStatusValue(value: unknown): ValidationOutcome {
  const issue = validateEnumMembership(value, "status", EXECUTION_STATUSES);
  return createValidationOutcome(issue ? [issue] : []);
}

export function validateTestResultStatusValue(value: unknown): ValidationOutcome {
  const issue = validateEnumMembership(value, "status", TEST_RESULT_STATUSES);
  return createValidationOutcome(issue ? [issue] : []);
}

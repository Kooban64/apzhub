/**
 * Parameter and variable validation (APZWORKFLOW-001).
 */

import type {
  WorkflowParameter,
  WorkflowValidationIssue,
  WorkflowVariable,
} from "@apzhub/workflow-contracts";
import { WORKFLOW_VALUE_TYPES } from "@apzhub/workflow-contracts";

const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

function validateKey(
  key: string | undefined,
  path: string,
  issues: WorkflowValidationIssue[],
): void {
  if (!key || !KEY_PATTERN.test(key)) {
    issues.push({
      code: "parameter",
      message: `Invalid key at ${path}: must match ${KEY_PATTERN}`,
      path,
      severity: "error",
    });
  }
}

function isAllowedDefault(
  valueType: string,
  value: string | number | boolean | undefined,
): boolean {
  if (value === undefined) return true;
  if (valueType === "string") return typeof value === "string";
  if (valueType === "number") return typeof value === "number";
  if (valueType === "boolean") return typeof value === "boolean";
  if (valueType === "json") return typeof value === "string";
  return false;
}

export type WorkflowParameterValidationInput = {
  readonly parameters?: readonly WorkflowParameter[];
  readonly variables?: readonly WorkflowVariable[];
};

export function validateWorkflowParameters(
  input: WorkflowParameterValidationInput,
): readonly WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];
  const seenKeys = new Set<string>();

  for (const [index, parameter] of (input.parameters ?? []).entries()) {
    validateKey(parameter.key, `parameters[${index}].key`, issues);
    if (seenKeys.has(parameter.key)) {
      issues.push({
        code: "parameter",
        message: `Duplicate parameter key: ${parameter.key}`,
        path: `parameters[${index}].key`,
        severity: "error",
      });
    }
    seenKeys.add(parameter.key);

    const valueType = parameter.valueType as string;
    if (
      !(WORKFLOW_VALUE_TYPES as readonly string[]).includes(valueType) ||
      valueType === "json"
    ) {
      issues.push({
        code: "parameter",
        message: `Invalid parameter valueType: ${valueType}`,
        path: `parameters[${index}].valueType`,
        severity: "error",
      });
    } else if (!isAllowedDefault(valueType, parameter.defaultValue)) {
      issues.push({
        code: "parameter",
        message: `Parameter defaultValue does not match valueType ${valueType}`,
        path: `parameters[${index}].defaultValue`,
        severity: "error",
      });
    }
  }

  const seenVarKeys = new Set<string>();
  for (const [index, variable] of (input.variables ?? []).entries()) {
    validateKey(variable.key, `variables[${index}].key`, issues);
    if (seenVarKeys.has(variable.key)) {
      issues.push({
        code: "parameter",
        message: `Duplicate variable key: ${variable.key}`,
        path: `variables[${index}].key`,
        severity: "error",
      });
    }
    seenVarKeys.add(variable.key);

    if (
      !(WORKFLOW_VALUE_TYPES as readonly string[]).includes(variable.valueType)
    ) {
      issues.push({
        code: "parameter",
        message: `Invalid variable valueType: ${String(variable.valueType)}`,
        path: `variables[${index}].valueType`,
        severity: "error",
      });
    } else if (!isAllowedDefault(variable.valueType, variable.defaultValue)) {
      issues.push({
        code: "parameter",
        message: `Variable defaultValue does not match valueType ${variable.valueType}`,
        path: `variables[${index}].defaultValue`,
        severity: "error",
      });
    }
  }

  return issues;
}

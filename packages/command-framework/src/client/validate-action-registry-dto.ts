import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import {
  collectDescriptorValidationIssues,
  collectDuplicateActionIssues,
} from "../registry/action-batch-helpers";
import type { ActionRegistryDto } from "../server/map-action-registry-dto";
import { createEmptyActionRegistryDto } from "../server/map-action-registry-dto";

export interface ActionRegistryDtoValidationResult {
  readonly ok: boolean;
  readonly dto: ActionRegistryDto;
  readonly errors: readonly ActionRegistrationIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normaliseToolbarRegions(
  value: unknown,
  errors: ActionRegistrationIssue[],
): ActionRegistryDto["toolbar"] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push({
      code: "VALIDATION",
      message: "ActionRegistryDto.toolbar must be an array",
      field: "toolbar",
    });
    return [];
  }

  return value as ActionRegistryDto["toolbar"];
}

/**
 * Validate an unknown server payload before client hydration.
 * Returns structured errors instead of throwing for invalid DTO shapes.
 */
export function validateActionRegistryDto(
  dto: unknown,
): ActionRegistryDtoValidationResult {
  const errors: ActionRegistrationIssue[] = [];

  if (!isRecord(dto)) {
    return {
      ok: false,
      dto: createEmptyActionRegistryDto(),
      errors: Object.freeze([
        {
          code: "VALIDATION",
          message: "ActionRegistryDto must be an object",
        },
      ]),
    };
  }

  if (!Array.isArray(dto.actions)) {
    errors.push({
      code: "VALIDATION",
      message: "ActionRegistryDto.actions must be an array",
      field: "actions",
    });
    return {
      ok: false,
      dto: createEmptyActionRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  const toolbar = normaliseToolbarRegions(dto.toolbar, errors);
  if (errors.length > 0) {
    return {
      ok: false,
      dto: createEmptyActionRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  const validationIssues = collectDescriptorValidationIssues(dto.actions);
  if (validationIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyActionRegistryDto(),
      errors: Object.freeze([...validationIssues]),
    };
  }

  const duplicateIssues = collectDuplicateActionIssues(dto.actions, new Set());
  if (duplicateIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyActionRegistryDto(),
      errors: Object.freeze([...duplicateIssues]),
    };
  }

  return {
    ok: true,
    dto: {
      actions: Object.freeze([...dto.actions]),
      toolbar: Object.freeze([...toolbar]),
    },
    errors: [],
  };
}

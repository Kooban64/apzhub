import { MATTER_PRIORITIES, MATTER_STATUSES, type Matter } from "../domain";
import { createValidationResult, type ValidationResult } from "../interfaces";
import { isMatterReference } from "./reference-validator";

export interface MatterFormInput {
  readonly matterReference: string;
  readonly title: string;
  readonly clientId: string;
  readonly matterTypeId: string;
  readonly matterStatus: Matter["matterStatus"];
  readonly practiceAreaId: string;
  readonly priority: Matter["priority"];
  readonly leadAttorneyId: string;
}

export const MatterValidator = {
  validate(input: MatterFormInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (input.title.trim().length === 0) {
      errors.title = "Matter title is required.";
    }

    if (input.clientId.trim().length === 0) {
      errors.clientId = "Client is required.";
    }

    if (!MATTER_STATUSES.includes(input.matterStatus)) {
      errors.matterStatus = "Select a valid matter status.";
    }

    if (!MATTER_PRIORITIES.includes(input.priority)) {
      errors.priority = "Select a valid matter priority.";
    }

    if (
      input.matterReference.trim().length > 0 &&
      !isMatterReference(input.matterReference.trim())
    ) {
      errors.matterReference = "Reference must match MAT-YYYY-NNNNNN.";
    }

    return createValidationResult(errors);
  },
};

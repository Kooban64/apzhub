import type { Requirement } from "../entities/requirement";

export interface RequirementValidationService {
  validate(requirement: Requirement): Promise<readonly string[]>;
}

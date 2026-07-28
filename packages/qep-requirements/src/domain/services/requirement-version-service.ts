import type { Requirement } from "../entities/requirement";
import type { RequirementVersion } from "../value-objects/requirement-version";

export interface RequirementVersionService {
  nextVersion(requirement: Requirement): Promise<RequirementVersion>;
}

import type { Requirement } from "../entities/requirement";
import type { RequirementId } from "../value-objects/requirement-id";

/** Domain service contract — no implementation in ENG-020A. */
export interface RequirementService {
  validateForApproval(requirement: Requirement): Promise<void>;
  assertMutable(requirement: Requirement): Promise<void>;
  getById(id: RequirementId): Promise<Requirement | null>;
}

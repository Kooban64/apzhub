import type { RequirementRelationship } from "../value-objects/requirement-relationship";
import type { RequirementId } from "../value-objects/requirement-id";

export interface RequirementRelationshipService {
  validate(relationship: RequirementRelationship): Promise<void>;
  listFor(requirementId: RequirementId): Promise<readonly RequirementRelationship[]>;
}

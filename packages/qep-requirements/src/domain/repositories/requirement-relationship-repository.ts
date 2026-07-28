import type { RequirementId } from "../value-objects/requirement-id";
import type { RequirementRelationship } from "../value-objects/requirement-relationship";

export interface RequirementRelationshipRepository {
  listFor(requirementId: RequirementId): Promise<readonly RequirementRelationship[]>;
}

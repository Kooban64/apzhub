import type { Requirement } from "../entities/requirement";

export interface RequirementApprovalService {
  canSubmit(requirement: Requirement): Promise<boolean>;
  canApprove(requirement: Requirement): Promise<boolean>;
}

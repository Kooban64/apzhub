import type { QepModuleId } from "@apzhub/qep-types";

export const QEP_CONTRACTS_VERSION = "0.2.0";

/** Marker for future service contracts — no operations defined in ENG-010. */
export type QepContractNamespace = {
  moduleId: QepModuleId;
  contractVersion: string;
  implemented: false;
};

export function createContractStub(moduleId: QepModuleId): QepContractNamespace {
  return {
    moduleId,
    contractVersion: QEP_CONTRACTS_VERSION,
    implemented: false,
  };
}

export {
  QEP_REQUIREMENTS_PERMISSIONS,
  type QepRequirementsPermission,
  type QepRequestContext,
  type QepRequirementOwnerDto,
  type QepRequirementReferenceDto,
  type QepRequirementBaselineDto,
  type QepRequirementAcceptanceCriteriaDto,
  type QepRequirementAttributesDto,
  type QepRequirementContentVersionMetadataDto,
  type QepRequirementContentVersionDetailDto,
  type QepRequirementVersionComparisonDto,
  type QepRequirementDto,
  type CreateQepRequirementInput,
  type UpdateQepRequirementInput,
  type QepRequirementLifecycleTransitionInput,
  type QepRequirementLifecycleTransitionDto,
  type QepRequirementLifecycleHistoryDto,
  type ListQepRequirementsQuery,
  type SearchQepRequirementsQuery,
  type ListQepRequirementContentVersionsQuery,
  type QepRequirementContentVersionsListResult,
  type QepRequirementsListResult,
  type QepRequirementService,
  type QepRequirementsGateway,
  type QepBaselineItemDto,
  type QepBaselineDto,
  type QepBaselineAction,
  type QepBaselineIntegrityVerificationStatus,
  QEP_BASELINE_ACTIONS,
  computeQepBaselineAvailableActions,
  type CreateQepBaselineInput,
  type UpdateQepBaselineDraftInput,
  type AddQepBaselineItemInput,
  type ListQepBaselinesQuery,
  type QepBaselineListResult,
  type CompareQepBaselinesInput,
  type QepBaselineCompareResult,
  type QepBaselineVersionChangeDto,
  type QepRelationshipEndpointDto,
  type QepRelationshipHistorySummaryDto,
  type QepRelationshipDto,
  type QepRelationshipAction,
  type QepRelationshipTaxonomyDto,
  QEP_RELATIONSHIP_ACTIONS,
  computeQepRelationshipAvailableActions,
  type CreateQepRelationshipInput,
  type UpdateQepRelationshipProfileInput,
  type SupersedeQepRelationshipInput,
  type ListQepRelationshipsQuery,
  type QepRelationshipListResult,
} from "./requirements";

export {
  QEP_TRACEABILITY_PERMISSIONS,
  type QepTraceabilityPermission,
  type QepTraceEndpointDto,
  type QepTraceEndpointInput,
  type QepTraceLinkHistorySummaryDto,
  QEP_TRACE_LINK_ACTIONS,
  type QepTraceLinkAction,
  type QepTraceLinkDto,
  computeQepTraceLinkAvailableActions,
  type CreateQepTraceLinkInput,
  type UpdateQepTraceLinkEndpointInput,
  type SupersedeQepTraceLinkInput,
  type ListQepTraceLinksQuery,
  type QepTraceLinkListResult,
  type QepTraceLinkTaxonomyDto,
} from "./traceability";

export {
  QEP_TEST_SPECIFICATION_PERMISSIONS,
  type QepTestSpecificationPermission,
  type QepTestSpecificationRelationshipDto,
  type QepTestSpecificationHistorySummaryDto,
  QEP_TEST_SPECIFICATION_ACTIONS,
  type QepTestSpecificationAction,
  type QepTestSpecificationDto,
  computeQepTestSpecificationAvailableActions,
  type CreateQepTestSpecificationInput,
  type UpdateQepTestSpecificationDraftInput,
  type SubmitQepTestSpecificationReviewInput,
  type ApproveQepTestSpecificationInput,
  type RejectQepTestSpecificationInput,
  type SupersedeQepTestSpecificationInput,
  type AddQepTestSpecificationRelationshipInput,
  type ListQepTestSpecificationsQuery,
  type QepTestSpecificationListResult,
} from "./test-specification";

export {
  QEP_TEST_PLAN_PERMISSIONS,
  type QepTestPlanPermission,
  type QepTestPlanItemDto,
  type QepTestPlanScheduleDto,
  type QepTestPlanAssignmentDto,
  type QepTestPlanApprovalDto,
  type QepTestPlanRevisionDto,
  type QepTestPlanHistorySummaryDto,
  type QepTestPlanMetricsDto,
  QEP_TEST_PLAN_ACTIONS,
  type QepTestPlanAction,
  type QepTestPlanDto,
  computeQepTestPlanAvailableActions,
  type CreateQepTestPlanInput,
  type UpdateQepTestPlanContentInput,
  type UpdateQepTestPlanMetadataInput,
  type TransferQepTestPlanOwnershipInput,
  type UpdateQepTestPlanAssignmentInput,
  type UpdateQepTestPlanScheduleInput,
  type AddQepTestPlanItemInput,
  type UpdateQepTestPlanItemInput,
  type ReorderQepTestPlanItemsInput,
  type SubmitQepTestPlanReviewInput,
  type ApproveQepTestPlanInput,
  type RejectQepTestPlanInput,
  type SupersedeQepTestPlanInput,
  type CloneQepTestPlanInput,
  type ListQepTestPlansQuery,
  type QepTestPlanListResult,
} from "./test-plan";

export {
  QEP_VERIFICATION_PERMISSIONS,
  type QepVerificationPermission,
  type QepVerificationSubjectDto,
  type QepVerificationSubjectInput,
  type QepVerificationHistorySummaryDto,
  QEP_VERIFICATION_ACTIONS,
  type QepVerificationAction,
  type QepVerificationDto,
  computeQepVerificationAvailableActions,
  type CreateQepVerificationInput,
  type AssignQepVerificationInput,
  type CompleteQepVerificationInput,
  type RejectQepVerificationInput,
  type SupersedeQepVerificationInput,
  type ListQepVerificationsQuery,
  type QepVerificationListResult,
} from "./verification";

export { QEP_EXPERIENCE_PERMISSIONS, type QepExperiencePermission } from "./experience";

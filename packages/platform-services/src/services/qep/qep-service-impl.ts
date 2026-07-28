/**
 * QEP Requirements platform service — maps ServiceRequestContext to QEP contracts (APZQEP-ENG-020B/020C).
 */

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  AddQepBaselineItemInput,
  CompareQepBaselinesInput,
  CreateQepBaselineInput,
  CreateQepRelationshipInput,
  CreateQepRequirementInput,
  ListQepBaselinesQuery,
  ListQepRelationshipsQuery,
  ListQepRequirementContentVersionsQuery,
  ListQepRequirementsQuery,
  QepBaselineCompareResult,
  QepBaselineDto,
  QepBaselineItemDto,
  QepBaselineListResult,
  QepRelationshipDto,
  QepRelationshipListResult,
  QepRelationshipTaxonomyDto,
  QepRequirementContentVersionDetailDto,
  QepRequirementContentVersionsListResult,
  QepRequirementDto,
  QepRequirementLifecycleHistoryDto,
  QepRequirementLifecycleTransitionDto,
  QepRequirementLifecycleTransitionInput,
  QepRequirementsListResult,
  QepRequirementVersionComparisonDto,
  QepRequirementService,
  QepRequestContext,
  SearchQepRequirementsQuery,
  SupersedeQepRelationshipInput,
  UpdateQepBaselineDraftInput,
  UpdateQepRelationshipProfileInput,
  UpdateQepRequirementInput,
} from "@apzhub/qep-contracts";
import {
  QepBaselineAlreadyLockedError,
  QepBaselineArchivedError,
  QepBaselineDuplicateMembershipError,
  QepBaselineIntegrityError,
  QepBaselineInvalidStateError,
  QepBaselineNotFoundError,
  QepConflictError,
  QepDomainError,
  QepForbiddenError,
  QepInvariantViolation,
  QepLifecycleTransitionError,
  QepNotFoundError,
  QepRevisionConflictError,
  QepRelationshipNotFoundError,
} from "@apzhub/qep-requirements";

function toQepContext(ctx: ServiceRequestContext): QepRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    organisationId: ctx.organisationId,
    correlationId: ctx.correlationId,
    permissions: ctx.permissions,
  };
}

export function mapQepDomainError(
  error: QepDomainError,
  correlationId: string,
): PlatformServiceError {
  if (error.code === "VERSION_NOT_FOUND") {
    return new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error.code === "NO_CONTENT_CHANGE") {
    return new PlatformServiceError({
      category: "conflict",
      code: "CONFLICT",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error.code === "VERSION_INTEGRITY" ||
    error.code.startsWith("INVALID_") ||
    error.code === "UNSUPPORTED_SNAPSHOT_SCHEMA"
  ) {
    return new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_FAILED",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error instanceof QepNotFoundError ||
    error instanceof QepBaselineNotFoundError ||
    error instanceof QepRelationshipNotFoundError
  ) {
    return new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error instanceof QepBaselineAlreadyLockedError ||
    error instanceof QepBaselineArchivedError ||
    error instanceof QepBaselineDuplicateMembershipError
  ) {
    return new PlatformServiceError({
      category: "conflict",
      code: "CONFLICT",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error instanceof QepBaselineIntegrityError ||
    error instanceof QepBaselineInvalidStateError
  ) {
    return new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_FAILED",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof QepForbiddenError) {
    return new PlatformServiceError({
      category: "authorization",
      code: "FORBIDDEN",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof QepConflictError || error instanceof QepRevisionConflictError) {
    return new PlatformServiceError({
      category: "conflict",
      code: "CONFLICT",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error instanceof QepLifecycleTransitionError ||
    error instanceof QepInvariantViolation
  ) {
    return new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_FAILED",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  return new PlatformServiceError({
    category: "validation",
    code: "VALIDATION_FAILED",
    message: error.message,
    correlationId,
    retryable: false,
  });
}

async function invoke<T>(
  ctx: ServiceRequestContext,
  fn: (qepCtx: QepRequestContext) => Promise<T>,
): Promise<T> {
  try {
    return await fn(toQepContext(ctx));
  } catch (error) {
    if (error instanceof QepDomainError) {
      throw mapQepDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

/** Platform-facing requirement service with short operation names for pipeline auth. */
export type QepRequirementPlatformService = {
  list(
    ctx: ServiceRequestContext,
    query?: ListQepRequirementsQuery,
  ): Promise<QepRequirementsListResult>;
  get(ctx: ServiceRequestContext, id: string): Promise<QepRequirementDto | null>;
  create(
    ctx: ServiceRequestContext,
    input: CreateQepRequirementInput,
  ): Promise<QepRequirementDto>;
  update(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepRequirementInput,
  ): Promise<QepRequirementDto>;
  archive(
    ctx: ServiceRequestContext,
    id: string,
    input?: QepRequirementLifecycleTransitionInput,
  ): Promise<QepRequirementDto>;
  search(
    ctx: ServiceRequestContext,
    query: SearchQepRequirementsQuery,
  ): Promise<QepRequirementsListResult>;
  submit(
    ctx: ServiceRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  review(
    ctx: ServiceRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  approve(
    ctx: ServiceRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  reject(
    ctx: ServiceRequestContext,
    id: string,
    input: Omit<QepRequirementLifecycleTransitionInput, "action"> & { reason: string },
  ): Promise<QepRequirementDto>;
  markImplemented(
    ctx: ServiceRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  markVerified(
    ctx: ServiceRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  deprecate(
    ctx: ServiceRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  transition(
    ctx: ServiceRequestContext,
    id: string,
    input: QepRequirementLifecycleTransitionInput,
  ): Promise<QepRequirementDto>;
  availableTransitions(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepRequirementLifecycleTransitionDto[]>;
  listHistory(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepRequirementLifecycleHistoryDto[]>;
  listVersions(
    ctx: ServiceRequestContext,
    id: string,
    query?: ListQepRequirementContentVersionsQuery,
  ): Promise<QepRequirementContentVersionsListResult>;
  getVersion(
    ctx: ServiceRequestContext,
    id: string,
    versionNumber: number,
  ): Promise<QepRequirementContentVersionDetailDto>;
  getLatestVersion(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepRequirementContentVersionDetailDto>;
  compareVersions(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly baseVersionNumber: number; readonly targetVersionNumber: number },
  ): Promise<QepRequirementVersionComparisonDto>;
  verifyVersionIntegrity(
    ctx: ServiceRequestContext,
    id: string,
    versionNumber: number,
  ): Promise<void>;

  listBaselines(
    ctx: ServiceRequestContext,
    query?: ListQepBaselinesQuery,
  ): Promise<QepBaselineListResult>;
  getBaseline(ctx: ServiceRequestContext, id: string): Promise<QepBaselineDto | null>;
  createBaseline(
    ctx: ServiceRequestContext,
    input: CreateQepBaselineInput,
  ): Promise<QepBaselineDto>;
  updateDraftBaseline(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepBaselineDraftInput,
  ): Promise<QepBaselineDto>;
  addBaselineItem(
    ctx: ServiceRequestContext,
    id: string,
    input: AddQepBaselineItemInput,
  ): Promise<QepBaselineDto>;
  removeBaselineItem(
    ctx: ServiceRequestContext,
    id: string,
    contentVersionId: string,
  ): Promise<QepBaselineDto>;
  lockBaseline(ctx: ServiceRequestContext, id: string): Promise<QepBaselineDto>;
  archiveBaseline(ctx: ServiceRequestContext, id: string): Promise<QepBaselineDto>;
  verifyBaselineIntegrity(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepBaselineDto>;
  listBaselineItems(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepBaselineItemDto[]>;
  requirementBaselineHistory(
    ctx: ServiceRequestContext,
    requirementId: string,
  ): Promise<readonly QepBaselineDto[]>;
  compareBaselines(
    ctx: ServiceRequestContext,
    input: CompareQepBaselinesInput,
  ): Promise<QepBaselineCompareResult>;

  listRelationships(
    ctx: ServiceRequestContext,
    query?: ListQepRelationshipsQuery,
  ): Promise<QepRelationshipListResult>;
  getRelationship(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepRelationshipDto | null>;
  createRelationship(
    ctx: ServiceRequestContext,
    input: CreateQepRelationshipInput,
  ): Promise<QepRelationshipDto>;
  activateRelationship(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepRelationshipDto>;
  deprecateRelationship(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepRelationshipDto>;
  retireRelationship(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepRelationshipDto>;
  supersedeRelationship(
    ctx: ServiceRequestContext,
    input: SupersedeQepRelationshipInput,
  ): Promise<QepRelationshipDto>;
  updateRelationshipRationale(
    ctx: ServiceRequestContext,
    id: string,
    rationale: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipProfile(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepRelationshipProfileInput,
  ): Promise<QepRelationshipDto>;
  updateRelationshipStrength(
    ctx: ServiceRequestContext,
    id: string,
    strength: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipClassification(
    ctx: ServiceRequestContext,
    id: string,
    classification: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipCriticality(
    ctx: ServiceRequestContext,
    id: string,
    criticality: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipScope(
    ctx: ServiceRequestContext,
    id: string,
    scope: { readonly kind: string; readonly referenceId?: string },
  ): Promise<QepRelationshipDto>;
  listRelationshipsByRequirement(
    ctx: ServiceRequestContext,
    requirementId: string,
    direction?: "inbound" | "outbound" | "both",
  ): Promise<readonly QepRelationshipDto[]>;
  listInboundRelationships(
    ctx: ServiceRequestContext,
    requirementId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listOutboundRelationships(
    ctx: ServiceRequestContext,
    requirementId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByTaxonomy(
    ctx: ServiceRequestContext,
    type: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByLifecycle(
    ctx: ServiceRequestContext,
    lifecycleState: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByBaseline(
    ctx: ServiceRequestContext,
    baselineId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByContentVersion(
    ctx: ServiceRequestContext,
    contentVersionId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipConflicts(
    ctx: ServiceRequestContext,
  ): Promise<readonly QepRelationshipDto[]>;
  listSupersessionChains(
    ctx: ServiceRequestContext,
    requirementId?: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipTaxonomy(
    ctx: ServiceRequestContext,
  ): Promise<readonly QepRelationshipTaxonomyDto[]>;
};

export function createQepRequirementPlatformService(
  service: QepRequirementService,
): QepRequirementPlatformService {
  return {
    list(ctx, query = {}) {
      return invoke(ctx, (qepCtx) => service.listRequirements(qepCtx, query));
    },
    get(ctx, id) {
      return invoke(ctx, (qepCtx) => service.getRequirement(qepCtx, id));
    },
    create(ctx, input) {
      return invoke(ctx, (qepCtx) => service.createRequirement(qepCtx, input));
    },
    update(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.updateRequirement(qepCtx, id, input));
    },
    archive(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.archiveRequirement(qepCtx, id, input));
    },
    search(ctx, query) {
      return invoke(ctx, (qepCtx) => service.searchRequirements(qepCtx, query));
    },
    submit(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.submitRequirement(qepCtx, id, input));
    },
    review(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.reviewRequirement(qepCtx, id, input));
    },
    approve(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.approveRequirement(qepCtx, id, input));
    },
    reject(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.rejectRequirement(qepCtx, id, input));
    },
    markImplemented(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.markImplemented(qepCtx, id, input));
    },
    markVerified(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.markVerified(qepCtx, id, input));
    },
    deprecate(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.deprecateRequirement(qepCtx, id, input));
    },
    transition(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.transitionRequirement(qepCtx, id, input));
    },
    availableTransitions(ctx, id) {
      return invoke(ctx, (qepCtx) => service.getAvailableTransitions(qepCtx, id));
    },
    listHistory(ctx, id) {
      return invoke(ctx, (qepCtx) => service.getLifecycleHistory(qepCtx, id));
    },
    listVersions(ctx, id, query) {
      return invoke(ctx, (qepCtx) => service.listContentVersions(qepCtx, id, query));
    },
    getVersion(ctx, id, versionNumber) {
      return invoke(ctx, (qepCtx) =>
        service.getContentVersion(qepCtx, id, versionNumber),
      );
    },
    getLatestVersion(ctx, id) {
      return invoke(ctx, (qepCtx) => service.getLatestContentVersion(qepCtx, id));
    },
    compareVersions(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.compareContentVersions(qepCtx, id, input));
    },
    verifyVersionIntegrity(ctx, id, versionNumber) {
      return invoke(ctx, (qepCtx) =>
        service.verifyContentVersionIntegrity(qepCtx, id, versionNumber),
      );
    },

    listBaselines(ctx, query = {}) {
      return invoke(ctx, (qepCtx) => service.listBaselines(qepCtx, query));
    },
    getBaseline(ctx, id) {
      return invoke(ctx, (qepCtx) => service.getBaseline(qepCtx, id));
    },
    createBaseline(ctx, input) {
      return invoke(ctx, (qepCtx) => service.createBaseline(qepCtx, input));
    },
    updateDraftBaseline(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.updateDraftBaseline(qepCtx, id, input));
    },
    addBaselineItem(ctx, id, input) {
      return invoke(ctx, (qepCtx) => service.addBaselineItem(qepCtx, id, input));
    },
    removeBaselineItem(ctx, id, contentVersionId) {
      return invoke(ctx, (qepCtx) =>
        service.removeBaselineItem(qepCtx, id, contentVersionId),
      );
    },
    lockBaseline(ctx, id) {
      return invoke(ctx, (qepCtx) => service.lockBaseline(qepCtx, id));
    },
    archiveBaseline(ctx, id) {
      return invoke(ctx, (qepCtx) => service.archiveBaseline(qepCtx, id));
    },
    verifyBaselineIntegrity(ctx, id) {
      return invoke(ctx, (qepCtx) => service.verifyBaselineIntegrity(qepCtx, id));
    },
    listBaselineItems(ctx, id) {
      return invoke(ctx, (qepCtx) => service.listBaselineItems(qepCtx, id));
    },
    requirementBaselineHistory(ctx, requirementId) {
      return invoke(ctx, (qepCtx) =>
        service.requirementBaselineHistory(qepCtx, requirementId),
      );
    },
    compareBaselines(ctx, input) {
      return invoke(ctx, (qepCtx) => service.compareBaselines(qepCtx, input));
    },

    listRelationships(ctx, query = {}) {
      return invoke(ctx, (qepCtx) => service.listRelationships(qepCtx, query));
    },
    getRelationship(ctx, id) {
      return invoke(ctx, (qepCtx) => service.getRelationship(qepCtx, id));
    },
    createRelationship(ctx, input) {
      return invoke(ctx, (qepCtx) => service.createRelationship(qepCtx, input));
    },
    activateRelationship(ctx, id) {
      return invoke(ctx, (qepCtx) => service.activateRelationship(qepCtx, id));
    },
    deprecateRelationship(ctx, id) {
      return invoke(ctx, (qepCtx) => service.deprecateRelationship(qepCtx, id));
    },
    retireRelationship(ctx, id) {
      return invoke(ctx, (qepCtx) => service.retireRelationship(qepCtx, id));
    },
    supersedeRelationship(ctx, input) {
      return invoke(ctx, (qepCtx) => service.supersedeRelationship(qepCtx, input));
    },
    updateRelationshipRationale(ctx, id, rationale) {
      return invoke(ctx, (qepCtx) =>
        service.updateRelationshipRationale(qepCtx, id, rationale),
      );
    },
    updateRelationshipProfile(ctx, id, input) {
      return invoke(ctx, (qepCtx) =>
        service.updateRelationshipProfile(qepCtx, id, input),
      );
    },
    updateRelationshipStrength(ctx, id, strength) {
      return invoke(ctx, (qepCtx) =>
        service.updateRelationshipStrength(qepCtx, id, strength),
      );
    },
    updateRelationshipClassification(ctx, id, classification) {
      return invoke(ctx, (qepCtx) =>
        service.updateRelationshipClassification(qepCtx, id, classification),
      );
    },
    updateRelationshipCriticality(ctx, id, criticality) {
      return invoke(ctx, (qepCtx) =>
        service.updateRelationshipCriticality(qepCtx, id, criticality),
      );
    },
    updateRelationshipScope(ctx, id, scope) {
      return invoke(ctx, (qepCtx) =>
        service.updateRelationshipScope(qepCtx, id, scope),
      );
    },
    listRelationshipsByRequirement(ctx, requirementId, direction) {
      return invoke(ctx, (qepCtx) =>
        service.listRelationshipsByRequirement(qepCtx, requirementId, direction),
      );
    },
    listInboundRelationships(ctx, requirementId) {
      return invoke(ctx, (qepCtx) =>
        service.listInboundRelationships(qepCtx, requirementId),
      );
    },
    listOutboundRelationships(ctx, requirementId) {
      return invoke(ctx, (qepCtx) =>
        service.listOutboundRelationships(qepCtx, requirementId),
      );
    },
    listRelationshipsByTaxonomy(ctx, type) {
      return invoke(ctx, (qepCtx) => service.listRelationshipsByTaxonomy(qepCtx, type));
    },
    listRelationshipsByLifecycle(ctx, lifecycleState) {
      return invoke(ctx, (qepCtx) =>
        service.listRelationshipsByLifecycle(qepCtx, lifecycleState),
      );
    },
    listRelationshipsByBaseline(ctx, baselineId) {
      return invoke(ctx, (qepCtx) =>
        service.listRelationshipsByBaseline(qepCtx, baselineId),
      );
    },
    listRelationshipsByContentVersion(ctx, contentVersionId) {
      return invoke(ctx, (qepCtx) =>
        service.listRelationshipsByContentVersion(qepCtx, contentVersionId),
      );
    },
    listRelationshipConflicts(ctx) {
      return invoke(ctx, (qepCtx) => service.listRelationshipConflicts(qepCtx));
    },
    listSupersessionChains(ctx, requirementId) {
      return invoke(ctx, (qepCtx) =>
        service.listSupersessionChains(qepCtx, requirementId),
      );
    },
    listRelationshipTaxonomy(ctx) {
      return invoke(ctx, (qepCtx) => service.listRelationshipTaxonomy(qepCtx));
    },
  };
}

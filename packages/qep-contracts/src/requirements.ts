/** QEP Requirements service contracts (APZQEP-ENG-020B / ENG-020C lifecycle). */

export const QEP_REQUIREMENTS_PERMISSIONS = [
  "qep.requirements.view",
  "qep.requirements.create",
  "qep.requirements.edit",
  "qep.requirements.delete",
  "qep.requirements.submit",
  "qep.requirements.review",
  "qep.requirements.approve",
  "qep.requirements.reject",
  "qep.requirements.implement",
  "qep.requirements.verify",
  "qep.requirements.deprecate",
  "qep.requirements.archive",
  "qep.requirements.baseline",
  "qep.requirements.export",
  "qep.requirements.import",
  "qep.requirements.versions.history",
  "qep.requirements.versions.view",
  "qep.requirements.versions.compare",
  "qep.requirements.versions.verify",
  "qep.requirements.baselines.view",
  "qep.requirements.baselines.create",
  "qep.requirements.baselines.modify",
  "qep.requirements.baselines.lock",
  "qep.requirements.baselines.archive",
  "qep.requirements.baselines.compare",
  "qep.requirements.baselines.verify",
  "qep.requirements.relationships.view",
  "qep.requirements.relationships.create",
  "qep.requirements.relationships.modify",
  "qep.requirements.relationships.transition",
  "qep.requirements.relationships.retire",
  "qep.requirements.relationships.taxonomy.administer",
] as const;

export type QepRequirementsPermission = (typeof QEP_REQUIREMENTS_PERMISSIONS)[number];

export type QepRequestContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly organisationId?: string;
  readonly correlationId: string;
  readonly permissions?: readonly string[];
};

export type QepRequirementOwnerDto = {
  readonly userId: string;
  readonly displayName?: string;
};

export type QepRequirementReferenceDto = {
  readonly system: string;
  readonly externalId: string;
  readonly label?: string;
};

export type QepRequirementBaselineDto = {
  readonly baselineId: string;
  readonly label: string;
};

export type QepRequirementAcceptanceCriteriaDto = {
  readonly items: readonly string[];
};

export type QepRequirementAttributesDto = {
  readonly tags: readonly string[];
  readonly custom: Readonly<Record<string, string>>;
};

export type QepRequirementContentVersionMetadataDto = {
  readonly id: string;
  readonly requirementId: string;
  readonly versionNumber: number;
  readonly parentVersionNumber?: number;
  readonly parentVersionId?: string;
  readonly snapshotSchemaVersion: string;
  readonly hashAlgorithm: string;
  readonly snapshotHash: string;
  readonly changeReason: string;
  readonly actorUserId: string;
  readonly createdAt: string;
  readonly sourceRevision: number;
  readonly correlationId: string;
};

export type QepRequirementContentVersionDetailDto =
  QepRequirementContentVersionMetadataDto & {
    readonly snapshot: Readonly<Record<string, unknown>>;
  };

export type QepRequirementVersionComparisonDto = {
  readonly requirementId: string;
  readonly baseVersionNumber: number;
  readonly targetVersionNumber: number;
  readonly fieldChanges: readonly {
    readonly field: string;
    readonly classification: string;
    readonly base: unknown;
    readonly target: unknown;
  }[];
  readonly changedFieldCount: number;
};

export type ListQepRequirementContentVersionsQuery = {
  readonly limit?: number;
  readonly offset?: number;
};

export type QepRequirementContentVersionsListResult = {
  readonly items: readonly QepRequirementContentVersionMetadataDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

/** Serializable requirement including persistence metadata. */
export type QepRequirementDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly type: string;
  readonly status: string;
  readonly priority: string;
  readonly category?: string;
  readonly owner?: QepRequirementOwnerDto;
  readonly approvalState: string;
  readonly versionMajor: number;
  readonly versionMinor: number;
  readonly versionPatch: number;
  readonly acceptanceCriteria?: QepRequirementAcceptanceCriteriaDto;
  readonly attributes: QepRequirementAttributesDto;
  readonly references: readonly QepRequirementReferenceDto[];
  readonly baseline?: QepRequirementBaselineDto;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
  readonly archivedBy?: string;
  readonly revision: number;
  readonly latestContentVersion?: QepRequirementContentVersionMetadataDto;
};

export type CreateQepRequirementInput = {
  readonly projectId: string;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly type: string;
  readonly status?: string;
  readonly priority: string;
  readonly category?: string;
  readonly owner?: QepRequirementOwnerDto;
  readonly acceptanceCriteriaItems?: readonly string[];
  readonly attributes?: {
    readonly tags?: readonly string[];
    readonly custom?: Readonly<Record<string, string>>;
  };
  readonly references?: readonly QepRequirementReferenceDto[];
  readonly baseline?: QepRequirementBaselineDto;
  readonly changeReason?: string;
};

export type UpdateQepRequirementInput = {
  readonly changeReason: string;
  readonly title?: string;
  readonly description?: string | null;
  readonly type?: string;
  readonly priority?: string;
  readonly category?: string | null;
  readonly owner?: QepRequirementOwnerDto | null;
  readonly approvalState?: string;
  readonly acceptanceCriteriaItems?: readonly string[] | null;
  readonly attributes?: {
    readonly tags?: readonly string[];
    readonly custom?: Readonly<Record<string, string>>;
  };
  readonly references?: readonly QepRequirementReferenceDto[];
  readonly baseline?: QepRequirementBaselineDto | null;
  readonly expectedRevision?: number;
};

export type QepRequirementLifecycleTransitionInput = {
  readonly action: string;
  readonly reason?: string;
  readonly comments?: string;
  readonly expectedRevision?: number;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type QepRequirementLifecycleTransitionDto = {
  readonly from: string;
  readonly to: string;
  readonly action: string;
};

export type QepRequirementLifecycleHistoryDto = {
  readonly id: string;
  readonly requirementId: string;
  readonly previousState: string;
  readonly newState: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly reason?: string;
  readonly comments?: string;
  readonly correlationId: string;
  readonly revision?: number;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
};

export type ListQepRequirementsQuery = {
  readonly projectId?: string;
  readonly status?: string;
  readonly includeArchived?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

export type SearchQepRequirementsQuery = {
  readonly q: string;
  readonly projectId?: string;
  readonly includeArchived?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepRequirementsListResult = {
  readonly items: readonly QepRequirementDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

export interface QepRequirementService {
  createRequirement(
    ctx: QepRequestContext,
    input: CreateQepRequirementInput,
  ): Promise<QepRequirementDto>;
  updateRequirement(
    ctx: QepRequestContext,
    id: string,
    input: UpdateQepRequirementInput,
  ): Promise<QepRequirementDto>;
  archiveRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: QepRequirementLifecycleTransitionInput,
  ): Promise<QepRequirementDto>;
  submitRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  reviewRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  approveRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  rejectRequirement(
    ctx: QepRequestContext,
    id: string,
    input: Omit<QepRequirementLifecycleTransitionInput, "action"> & { reason: string },
  ): Promise<QepRequirementDto>;
  markImplemented(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  markVerified(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  deprecateRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<QepRequirementLifecycleTransitionInput, "action">,
  ): Promise<QepRequirementDto>;
  transitionRequirement(
    ctx: QepRequestContext,
    id: string,
    input: QepRequirementLifecycleTransitionInput,
  ): Promise<QepRequirementDto>;
  getAvailableTransitions(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly QepRequirementLifecycleTransitionDto[]>;
  getLifecycleHistory(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly QepRequirementLifecycleHistoryDto[]>;
  listContentVersions(
    ctx: QepRequestContext,
    id: string,
    query?: ListQepRequirementContentVersionsQuery,
  ): Promise<QepRequirementContentVersionsListResult>;
  getContentVersion(
    ctx: QepRequestContext,
    id: string,
    versionNumber: number,
  ): Promise<QepRequirementContentVersionDetailDto>;
  getLatestContentVersion(
    ctx: QepRequestContext,
    id: string,
  ): Promise<QepRequirementContentVersionDetailDto>;
  compareContentVersions(
    ctx: QepRequestContext,
    id: string,
    input: { readonly baseVersionNumber: number; readonly targetVersionNumber: number },
  ): Promise<QepRequirementVersionComparisonDto>;
  verifyContentVersionIntegrity(
    ctx: QepRequestContext,
    id: string,
    versionNumber: number,
  ): Promise<void>;
  getRequirement(ctx: QepRequestContext, id: string): Promise<QepRequirementDto | null>;
  listRequirements(
    ctx: QepRequestContext,
    query: ListQepRequirementsQuery,
  ): Promise<QepRequirementsListResult>;
  searchRequirements(
    ctx: QepRequestContext,
    query: SearchQepRequirementsQuery,
  ): Promise<QepRequirementsListResult>;

  createBaseline(
    ctx: QepRequestContext,
    input: CreateQepBaselineInput,
  ): Promise<QepBaselineDto>;
  updateDraftBaseline(
    ctx: QepRequestContext,
    id: string,
    input: UpdateQepBaselineDraftInput,
  ): Promise<QepBaselineDto>;
  addBaselineItem(
    ctx: QepRequestContext,
    id: string,
    input: AddQepBaselineItemInput,
  ): Promise<QepBaselineDto>;
  removeBaselineItem(
    ctx: QepRequestContext,
    id: string,
    contentVersionId: string,
  ): Promise<QepBaselineDto>;
  lockBaseline(ctx: QepRequestContext, id: string): Promise<QepBaselineDto>;
  archiveBaseline(ctx: QepRequestContext, id: string): Promise<QepBaselineDto>;
  verifyBaselineIntegrity(ctx: QepRequestContext, id: string): Promise<QepBaselineDto>;
  listBaselines(
    ctx: QepRequestContext,
    query?: ListQepBaselinesQuery,
  ): Promise<QepBaselineListResult>;
  getBaseline(
    ctx: QepRequestContext,
    id: string,
    includeItems?: boolean,
  ): Promise<QepBaselineDto | null>;
  listBaselineItems(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly QepBaselineItemDto[]>;
  requirementBaselineHistory(
    ctx: QepRequestContext,
    requirementId: string,
  ): Promise<readonly QepBaselineDto[]>;
  compareBaselines(
    ctx: QepRequestContext,
    input: CompareQepBaselinesInput,
  ): Promise<QepBaselineCompareResult>;

  createRelationship(
    ctx: QepRequestContext,
    input: CreateQepRelationshipInput,
  ): Promise<QepRelationshipDto>;
  activateRelationship(ctx: QepRequestContext, id: string): Promise<QepRelationshipDto>;
  deprecateRelationship(
    ctx: QepRequestContext,
    id: string,
  ): Promise<QepRelationshipDto>;
  retireRelationship(ctx: QepRequestContext, id: string): Promise<QepRelationshipDto>;
  supersedeRelationship(
    ctx: QepRequestContext,
    input: SupersedeQepRelationshipInput,
  ): Promise<QepRelationshipDto>;
  updateRelationshipRationale(
    ctx: QepRequestContext,
    id: string,
    rationale: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipProfile(
    ctx: QepRequestContext,
    id: string,
    input: UpdateQepRelationshipProfileInput,
  ): Promise<QepRelationshipDto>;
  updateRelationshipStrength(
    ctx: QepRequestContext,
    id: string,
    strength: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipClassification(
    ctx: QepRequestContext,
    id: string,
    classification: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipCriticality(
    ctx: QepRequestContext,
    id: string,
    criticality: string,
  ): Promise<QepRelationshipDto>;
  updateRelationshipScope(
    ctx: QepRequestContext,
    id: string,
    scope: { readonly kind: string; readonly referenceId?: string },
  ): Promise<QepRelationshipDto>;
  getRelationship(
    ctx: QepRequestContext,
    id: string,
  ): Promise<QepRelationshipDto | null>;
  listRelationships(
    ctx: QepRequestContext,
    query?: ListQepRelationshipsQuery,
  ): Promise<QepRelationshipListResult>;
  listRelationshipsByRequirement(
    ctx: QepRequestContext,
    requirementId: string,
    direction?: "inbound" | "outbound" | "both",
  ): Promise<readonly QepRelationshipDto[]>;
  listInboundRelationships(
    ctx: QepRequestContext,
    requirementId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listOutboundRelationships(
    ctx: QepRequestContext,
    requirementId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByTaxonomy(
    ctx: QepRequestContext,
    type: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByLifecycle(
    ctx: QepRequestContext,
    lifecycleState: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByBaseline(
    ctx: QepRequestContext,
    baselineId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipsByContentVersion(
    ctx: QepRequestContext,
    contentVersionId: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipConflicts(
    ctx: QepRequestContext,
  ): Promise<readonly QepRelationshipDto[]>;
  listSupersessionChains(
    ctx: QepRequestContext,
    requirementId?: string,
  ): Promise<readonly QepRelationshipDto[]>;
  listRelationshipTaxonomy(
    ctx: QepRequestContext,
  ): Promise<readonly QepRelationshipTaxonomyDto[]>;
}

/** Requirement Baseline (configuration-management) contracts — APZQEP-ENG-020E Part 2. */

export type QepBaselineItemDto = {
  readonly requirementId: string;
  readonly contentVersionId: string;
  readonly contentVersionNumber: number;
  readonly includedAt: string;
  readonly includedBy: string;
};

/** Baseline integrity verification lifecycle status (APZQEP-ENG-020E Part 3). */
export type QepBaselineIntegrityVerificationStatus =
  "verified" | "not_yet_verified" | "verification_failed" | "unsupported_schema";

/** Baseline commands surfaced to the Workbench for the caller's permissions + current state. */
export const QEP_BASELINE_ACTIONS = [
  "edit",
  "addItem",
  "removeItem",
  "lock",
  "archive",
  "compare",
  "verifyIntegrity",
] as const;
export type QepBaselineAction = (typeof QEP_BASELINE_ACTIONS)[number];

export type QepBaselineDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly number: number;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly itemCount: number;
  readonly items?: readonly QepBaselineItemDto[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly integrityFingerprint?: string;
  readonly integrityAlgorithm?: string;
  readonly integritySchemaVersion?: string;
  readonly integrityVerificationStatus?: QepBaselineIntegrityVerificationStatus;
  readonly integrityVerifiedAt?: string;
  readonly lockedAt?: string;
  readonly lockedBy?: string;
  readonly archivedAt?: string;
  readonly archivedBy?: string;
  readonly availableActions: readonly QepBaselineAction[];
};

/**
 * Computes the baseline commands a caller may perform for the given status,
 * mirroring the permission + state-machine rules enforced server-side. The
 * server is authoritative; this is a rendering convenience for the Workbench
 * and must not be relied on as an authorization boundary.
 */
export function computeQepBaselineAvailableActions(
  status: string,
  permissions?: readonly string[],
): readonly QepBaselineAction[] {
  const granted = permissions;
  const has = (permission: QepRequirementsPermission): boolean =>
    !granted ||
    granted.length === 0 ||
    granted.includes("qep.requirements.*") ||
    granted.includes(permission);

  const actions: QepBaselineAction[] = [];
  if (status === "draft") {
    if (has("qep.requirements.baselines.modify")) {
      actions.push("edit", "addItem", "removeItem");
    }
    if (has("qep.requirements.baselines.lock")) {
      actions.push("lock");
    }
  }
  if (status === "locked" && has("qep.requirements.baselines.archive")) {
    actions.push("archive");
  }
  if (
    (status === "locked" || status === "archived") &&
    has("qep.requirements.baselines.verify")
  ) {
    actions.push("verifyIntegrity");
  }
  if (has("qep.requirements.baselines.compare")) {
    actions.push("compare");
  }
  return actions;
}

export type CreateQepBaselineInput = {
  readonly name: string;
  readonly description?: string;
};

export type UpdateQepBaselineDraftInput = {
  readonly name?: string;
  readonly description?: string | null;
};

export type AddQepBaselineItemInput = {
  readonly contentVersionId: string;
  readonly requirementId?: string;
};

export type ListQepBaselinesQuery = {
  readonly status?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepBaselineListResult = {
  readonly items: readonly QepBaselineDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

export type CompareQepBaselinesInput = {
  readonly baseBaselineId: string;
  readonly targetBaselineId: string;
};

/**
 * A `removed`/`added` pair sharing the same requirement id — the requirement was
 * re-versioned between the two baselines rather than added or dropped outright.
 */
export type QepBaselineVersionChangeDto = {
  readonly requirementId: string;
  readonly removed: QepBaselineItemDto;
  readonly added: QepBaselineItemDto;
};

export type QepBaselineCompareResult = {
  readonly baseBaselineId: string;
  readonly targetBaselineId: string;
  readonly added: readonly QepBaselineItemDto[];
  readonly removed: readonly QepBaselineItemDto[];
  readonly unchanged: readonly QepBaselineItemDto[];
  readonly versionChanged: readonly QepBaselineVersionChangeDto[];
  readonly summary: {
    readonly addedCount: number;
    readonly removedCount: number;
    readonly unchangedCount: number;
    readonly versionChangedCount: number;
  };
};

/** Requirements Relationship contracts — APZQEP-ENG-020F Part 2. */

export type QepRelationshipEndpointDto = {
  readonly mode: string;
  readonly requirementId: string;
  readonly contentVersionId?: string;
};

export type QepRelationshipHistorySummaryDto = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

/** Relationship commands surfaced to the Workbench for the caller's permissions + current state. */
export const QEP_RELATIONSHIP_ACTIONS = [
  "activate",
  "deprecate",
  "retire",
  "updateProfile",
  "updateRationale",
  "updateStrength",
  "updateClassification",
  "updateCriticality",
  "updateScope",
] as const;
export type QepRelationshipAction = (typeof QEP_RELATIONSHIP_ACTIONS)[number];

export type QepRelationshipDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly type: string;
  readonly lifecycleState: string;
  readonly source: QepRelationshipEndpointDto;
  readonly target: QepRelationshipEndpointDto;
  readonly strength: string;
  readonly criticality: string;
  readonly classification: string;
  readonly scope: { readonly kind: string; readonly referenceId?: string };
  readonly rationale?: string;
  readonly revision: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly activatedAt?: string;
  readonly activatedBy?: string;
  readonly deprecatedAt?: string;
  readonly deprecatedBy?: string;
  readonly retiredAt?: string;
  readonly retiredBy?: string;
  readonly historySummaries: readonly QepRelationshipHistorySummaryDto[];
  readonly availableActions: readonly QepRelationshipAction[];
};

/**
 * Computes relationship commands a caller may perform for the given lifecycle
 * state, mirroring permission + state-machine rules enforced server-side.
 */
export function computeQepRelationshipAvailableActions(
  lifecycleState: string,
  permissions?: readonly string[],
): readonly QepRelationshipAction[] {
  const granted = permissions;
  const has = (permission: QepRequirementsPermission): boolean =>
    !granted ||
    granted.length === 0 ||
    granted.includes("qep.requirements.*") ||
    granted.includes(permission);

  const actions: QepRelationshipAction[] = [];

  if (lifecycleState === "draft" && has("qep.requirements.relationships.transition")) {
    actions.push("activate");
  }
  if (lifecycleState === "active" && has("qep.requirements.relationships.transition")) {
    actions.push("deprecate");
  }
  if (lifecycleState === "deprecated" && has("qep.requirements.relationships.retire")) {
    actions.push("retire");
  }
  if (
    (lifecycleState === "draft" || lifecycleState === "active") &&
    has("qep.requirements.relationships.modify")
  ) {
    actions.push(
      "updateProfile",
      "updateRationale",
      "updateStrength",
      "updateClassification",
      "updateCriticality",
      "updateScope",
    );
  }

  return actions;
}

export type CreateQepRelationshipInput = {
  readonly type: string;
  readonly source: QepRelationshipEndpointDto;
  readonly target: QepRelationshipEndpointDto;
  readonly strength?: string;
  readonly criticality?: string;
  readonly classification?: string;
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly rationale?: string;
  readonly expectedRevision?: number;
};

export type UpdateQepRelationshipProfileInput = {
  readonly strength?: string;
  readonly criticality?: string;
  readonly classification?: string;
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly rationale?: string;
};

export type SupersedeQepRelationshipInput = {
  readonly successorRequirementId: string;
  readonly predecessorRequirementId: string;
  readonly successorContentVersionId?: string;
  readonly predecessorContentVersionId?: string;
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly rationale: string;
  readonly strength?: string;
  readonly criticality?: string;
  readonly classification?: string;
};

export type ListQepRelationshipsQuery = {
  readonly type?: string;
  readonly lifecycleState?: string;
  readonly requirementId?: string;
  readonly direction?: "inbound" | "outbound" | "both";
  readonly baselineId?: string;
  readonly contentVersionId?: string;
  readonly conflictsOnly?: boolean;
  readonly supersessionOnly?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepRelationshipListResult = {
  readonly items: readonly QepRelationshipDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

export type QepRelationshipTaxonomyDto = {
  readonly type: string;
  readonly displayName: string;
  readonly description: string;
  readonly symmetric: boolean;
  readonly inverseLabel: string;
  readonly cyclePolicy: string;
  readonly rationalePolicy: string;
  readonly defaultStrength: string;
  readonly certificationRelevant: boolean | "conditional";
  readonly baselineProjectionDefault: string;
  readonly strictTraceabilityDefault: boolean;
  readonly highlightInTraceability: boolean;
};

export type QepRequirementsGateway = {
  readonly requirements: QepRequirementService;
};

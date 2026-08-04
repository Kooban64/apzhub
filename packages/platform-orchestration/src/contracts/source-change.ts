/**
 * Enterprise Source Change Coordination contracts (QO-012).
 * Primary output: Source Change Package.
 *
 * Associates normalized source change identity with Quality Flows and Decision Packages.
 * Never inspects repositories. Never invokes SCM providers.
 */

/** Provider-neutral logical source identity kinds. */
export const SOURCE_IDENTITY_KINDS = [
  "repository",
  "branch",
  "commit",
  "pull_request",
  "merge_request",
  "tag",
  "release",
  "configuration_change",
  "manual_change_declaration",
  "external_change_reference",
  "future_registered_source",
] as const;

export type SourceIdentityKind = (typeof SOURCE_IDENTITY_KINDS)[number];

/** Normalized source identity — opaque refs only. */
export interface SourceIdentity {
  readonly identityId: string;
  readonly kind: SourceIdentityKind;
  /** Opaque external/provider-neutral reference (never a product API handle). */
  readonly reference: string;
  readonly displayLabel?: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface SourceChangeAssociation {
  readonly associationId: string;
  readonly qualityFlowRef: string;
  readonly decisionPackageRef?: string;
  readonly automationCoordinationPackageRef?: string;
  readonly sourceChangeRefs: readonly string[];
  readonly associatedAt: string;
  readonly rationale: string;
}

export interface SourceChangeAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

/** Authoritative SoR for source change coordination (not SCM operations). */
export interface SourceChangePackage {
  readonly sourceChangePackageId: string;
  readonly qualityFlowRef: string;
  readonly decisionPackageRef?: string;
  readonly automationCoordinationPackageRef?: string;
  readonly sourceChangeRefs: readonly string[];
  readonly identities: readonly SourceIdentity[];
  readonly repositoryRef?: string;
  readonly branchRef?: string;
  readonly commitRef?: string;
  readonly pullOrMergeRequestRef?: string;
  readonly tagOrReleaseRef?: string;
  readonly association: SourceChangeAssociation;
  readonly changeMetadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly supersedesPackageId?: string;
  readonly auditHistory: readonly SourceChangeAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit: coordination of identity only — not SCM execution. */
  readonly advisory: true;
  readonly scmOperations: false;
}

export interface NormalizedSourceChangeInput {
  readonly changeRef: string;
  readonly identities: readonly {
    readonly kind: SourceIdentityKind;
    readonly reference: string;
    readonly displayLabel?: string;
    readonly metadata?: Readonly<Record<string, string>>;
  }[];
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface CreateSourceChangePackageInput {
  readonly qualityFlowRef: string;
  readonly decisionPackageRef?: string;
  readonly automationCoordinationPackageRef?: string;
  readonly sourceChanges: readonly NormalizedSourceChangeInput[];
  /** Convenience opaque refs (merged into package-level refs when present). */
  readonly repositoryRef?: string;
  readonly branchRef?: string;
  readonly commitRef?: string;
  readonly pullOrMergeRequestRef?: string;
  readonly tagOrReleaseRef?: string;
  readonly supersedesPackageId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly rationale?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface SourceChangeDiagnostics {
  readonly packageCount: number;
  readonly identityCount: number;
  readonly changeTypeDistribution: Readonly<Record<string, number>>;
  readonly repositoryAssociationCount: number;
  readonly associationCount: number;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}

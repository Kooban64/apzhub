/**
 * Enterprise Evidence & Reporting Integration contracts (QO-014).
 * Primary output: Evidence Integration Package.
 *
 * Evidence is referenced, never copied.
 * Reports consume evidence; they never become evidence.
 * Never creates, alters, or replaces authoritative artefacts.
 */

/** Declarative report profile kinds — inclusion criteria only. */
export const REPORT_PROFILE_KINDS = [
  "developer",
  "pull_request",
  "regression",
  "executive",
  "production_readiness",
  "compliance",
  "audit",
  "custom",
] as const;

export type ReportProfileKind = (typeof REPORT_PROFILE_KINDS)[number];

/** Artefact reference slots that may be included in a report profile. */
export const EVIDENCE_REFERENCE_SLOTS = [
  "quality_flow",
  "impact_graph",
  "governance_decision",
  "approval_bundle",
  "decision_package",
  "automation_coordination_package",
  "source_change_package",
  "enrichment_package",
  "evidence",
  "report",
  "audit",
] as const;

export type EvidenceReferenceSlot = (typeof EVIDENCE_REFERENCE_SLOTS)[number];

export const EVIDENCE_INTEGRATION_STATUSES = [
  "complete",
  "partial",
  "empty",
  "superseded",
] as const;

export type EvidenceIntegrationStatus = (typeof EVIDENCE_INTEGRATION_STATUSES)[number];

/**
 * Immutable declarative Report Profile.
 * Defines inclusion criteria only — presentation is external.
 */
export interface ReportProfile {
  readonly profileId: string;
  readonly kind: ReportProfileKind;
  readonly name: string;
  readonly description: string;
  /** Which reference slots are included when this profile is applied. */
  readonly inclusionSlots: readonly EvidenceReferenceSlot[];
  readonly immutable: true;
  readonly presentationExternal: true;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface EvidenceIntegrationAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

/**
 * Immutable end-to-end traceability between report views,
 * the Evidence Integration Package, and referenced artefacts.
 */
export interface TraceabilityRecord {
  readonly traceabilityId: string;
  readonly evidenceIntegrationPackageId: string;
  readonly reportViewId?: string;
  readonly reportProfileId?: string;
  readonly artefactRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly reportRefs: readonly string[];
  readonly auditRefs: readonly string[];
  readonly createdAt: string;
  readonly immutable: true;
}

/**
 * Authoritative SoR for evidence integration only.
 * Contains references — never copies of artefact content.
 */
export interface EvidenceIntegrationPackage {
  readonly evidenceIntegrationPackageId: string;
  readonly qualityFlowRef: string;
  readonly impactGraphRef?: string;
  readonly governanceDecisionRef?: string;
  readonly approvalBundleRef?: string;
  readonly decisionPackageRef?: string;
  readonly automationCoordinationPackageRef?: string;
  readonly sourceChangePackageRef?: string;
  readonly enrichmentPackageRef?: string;
  /** Opaque refs to Evidence Platform artefacts — never duplicated content. */
  readonly evidenceRefs: readonly string[];
  /** Opaque refs to previously assembled/external report artefacts. */
  readonly reportRefs: readonly string[];
  readonly auditRefs: readonly string[];
  readonly traceability: TraceabilityRecord;
  readonly integrationStatus: EvidenceIntegrationStatus;
  readonly createdAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly supersedesPackageId?: string;
  readonly auditHistory: readonly EvidenceIntegrationAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit architectural guards. */
  readonly referencesOnly: true;
  readonly copiesEvidence: false;
  readonly reportIsEvidence: false;
}

/**
 * Derived report view — consumes evidence by reference.
 * Never a system of record.
 */
export interface ReportView {
  readonly reportViewId: string;
  readonly evidenceIntegrationPackageId: string;
  readonly profile: ReportProfile;
  /** Selected opaque refs included by the profile — never artefact bodies. */
  readonly includedRefs: Readonly<Record<EvidenceReferenceSlot, readonly string[]>>;
  readonly traceabilityId: string;
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit: view only — not evidence. */
  readonly viewOnly: true;
  readonly isEvidence: false;
  readonly presentationExternal: true;
}

export interface CreateEvidenceIntegrationPackageInput {
  readonly qualityFlowRef: string;
  readonly impactGraphRef?: string;
  readonly governanceDecisionRef?: string;
  readonly approvalBundleRef?: string;
  readonly decisionPackageRef?: string;
  readonly automationCoordinationPackageRef?: string;
  readonly sourceChangePackageRef?: string;
  readonly enrichmentPackageRef?: string;
  readonly evidenceRefs?: readonly string[];
  readonly reportRefs?: readonly string[];
  readonly auditRefs?: readonly string[];
  readonly supersedesPackageId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface GenerateReportViewInput {
  readonly evidenceIntegrationPackageId: string;
  readonly profileKind: ReportProfileKind;
  /** Required when profileKind is custom. */
  readonly customInclusionSlots?: readonly EvidenceReferenceSlot[];
  readonly customProfileName?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface EvidenceIntegrationDiagnostics {
  readonly packageCount: number;
  readonly reportViewCount: number;
  readonly reportProfileStatistics: Readonly<Record<string, number>>;
  readonly traceabilityCount: number;
  readonly referenceIntegrityOk: boolean;
  readonly referenceSlotCoverage: Readonly<Record<string, number>>;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}

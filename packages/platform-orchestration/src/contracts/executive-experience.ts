/**
 * Enterprise Executive Experience Integration contracts (QO-015).
 * Primary output: Executive Experience Package.
 *
 * Executive Experience is a projection, not a presentation.
 * Executives consume decisions — they never become part of the decision pipeline.
 * References only — never duplicates artefacts.
 */

/** Declarative executive personas — consumption preferences only. */
export const EXECUTIVE_PERSONA_KINDS = [
  "ceo",
  "cio",
  "cto",
  "head_of_engineering",
  "qa_director",
  "compliance_officer",
  "product_board",
  "programme_manager",
  "custom",
] as const;

export type ExecutivePersonaKind = (typeof EXECUTIVE_PERSONA_KINDS)[number];

/** Artefact slots an executive projection may include. */
export const EXECUTIVE_ARTEFACT_SLOTS = [
  "report_profiles",
  "evidence_integration_package",
  "decision_package",
  "approval_bundle",
  "enrichment_package",
  "executive_view_configuration",
  "presentation_preferences",
  "navigation_model",
] as const;

export type ExecutiveArtefactSlot = (typeof EXECUTIVE_ARTEFACT_SLOTS)[number];

export const EXECUTIVE_EXPERIENCE_STATUSES = [
  "projected",
  "partial",
  "empty",
  "superseded",
] as const;

export type ExecutiveExperienceStatus = (typeof EXECUTIVE_EXPERIENCE_STATUSES)[number];

export const INFORMATION_PRIORITIES = ["critical", "high", "normal", "low"] as const;

export type InformationPriority = (typeof INFORMATION_PRIORITIES)[number];

/**
 * Immutable declarative Executive Persona.
 * Defines consumption preferences only — never rendering.
 */
export interface ExecutivePersona {
  readonly personaId: string;
  readonly kind: ExecutivePersonaKind;
  readonly name: string;
  readonly description: string;
  /** Default report profile kinds to consume (opaque kind strings). */
  readonly defaultReportProfileKinds: readonly string[];
  /** Default artefact slots included in projections for this persona. */
  readonly defaultArtefactSlots: readonly ExecutiveArtefactSlot[];
  readonly defaultInformationPriority: InformationPriority;
  readonly immutable: true;
  readonly projectionOnly: true;
  readonly metadata: Readonly<Record<string, string>>;
}

/** Presentation preferences — hints only; rendering remains external (Wave 4). */
export interface PresentationPreferences {
  readonly preferenceId: string;
  /** Opaque channel hints (web, mobile, pdf, email, teams, slack, future). */
  readonly channelHints: readonly string[];
  readonly densityHint?: "compact" | "comfortable" | "spacious";
  readonly localeHint?: string;
  readonly timezoneHint?: string;
  /** Never rendering instructions. */
  readonly renderingExternal: true;
  readonly metadata: Readonly<Record<string, string>>;
}

/** Navigation model — structure of what to navigate, not UI chrome. */
export interface NavigationModel {
  readonly navigationModelId: string;
  readonly entryPoints: readonly string[];
  readonly sectionOrder: readonly string[];
  readonly deepLinkHints: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

/** Executive view configuration — which artefacts/profiles to project. */
export interface ExecutiveViewConfiguration {
  readonly viewConfigurationId: string;
  readonly includedArtefactSlots: readonly ExecutiveArtefactSlot[];
  readonly reportProfileKinds: readonly string[];
  readonly informationPriority: InformationPriority;
  readonly groupingHints: readonly string[];
  readonly filterHints: readonly string[];
  readonly presentationHints: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

/**
 * Projection model — what an executive should see.
 * No rendering. No metrics. No report generation.
 */
export interface ExecutiveProjectionModel {
  readonly projectionId: string;
  readonly personaKind: ExecutivePersonaKind;
  readonly includedArtefacts: Readonly<
    Record<ExecutiveArtefactSlot, readonly string[]>
  >;
  readonly reportProfileSelection: readonly string[];
  readonly navigationPreferences: NavigationModel;
  readonly informationPriority: InformationPriority;
  readonly grouping: readonly string[];
  readonly filters: readonly string[];
  readonly presentationHints: readonly string[];
  readonly projectionOnly: true;
  readonly rendersNothing: true;
}

export interface ExecutiveExperienceAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

/**
 * Authoritative SoR for executive experience integration only.
 * Contains references and projection definitions — never presentation logic.
 */
export interface ExecutiveExperiencePackage {
  readonly executiveExperiencePackageId: string;
  readonly persona: ExecutivePersona;
  readonly reportProfileRefs: readonly string[];
  readonly evidenceIntegrationPackageRef?: string;
  readonly decisionPackageRef?: string;
  readonly approvalBundleRef?: string;
  readonly enrichmentPackageRef?: string;
  readonly viewConfiguration: ExecutiveViewConfiguration;
  readonly presentationPreferences: PresentationPreferences;
  readonly navigationModel: NavigationModel;
  readonly projection: ExecutiveProjectionModel;
  readonly experienceStatus: ExecutiveExperienceStatus;
  readonly createdAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly supersedesPackageId?: string;
  readonly auditHistory: readonly ExecutiveExperienceAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit architectural guards. */
  readonly projectionOnly: true;
  readonly presentationExternal: true;
  readonly influencesDecisions: false;
  readonly copiesEvidence: false;
}

export interface CreateExecutiveExperiencePackageInput {
  readonly personaKind: ExecutivePersonaKind;
  /** Required when personaKind is custom. */
  readonly customPersonaName?: string;
  readonly customReportProfileKinds?: readonly string[];
  readonly customArtefactSlots?: readonly ExecutiveArtefactSlot[];
  readonly reportProfileRefs?: readonly string[];
  readonly evidenceIntegrationPackageRef?: string;
  readonly decisionPackageRef?: string;
  readonly approvalBundleRef?: string;
  readonly enrichmentPackageRef?: string;
  readonly channelHints?: readonly string[];
  readonly densityHint?: "compact" | "comfortable" | "spacious";
  readonly localeHint?: string;
  readonly timezoneHint?: string;
  readonly entryPoints?: readonly string[];
  readonly sectionOrder?: readonly string[];
  readonly deepLinkHints?: readonly string[];
  readonly groupingHints?: readonly string[];
  readonly filterHints?: readonly string[];
  readonly presentationHints?: readonly string[];
  readonly informationPriority?: InformationPriority;
  readonly supersedesPackageId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface ExecutiveExperienceDiagnostics {
  readonly packageCount: number;
  readonly personaStatistics: Readonly<Record<string, number>>;
  readonly projectionCount: number;
  readonly navigationEntryPointCount: number;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}

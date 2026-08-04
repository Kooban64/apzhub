/**
 * Enterprise Workspace & Operations Experience contracts (QO-017).
 * Primary output: Workspace Experience Package.
 *
 * The workspace assembles experiences — never business logic.
 * References authoritative artefacts — never duplicates them.
 * Downstream of the platform — never part of the decision pipeline.
 */

export const WORKSPACE_LAYOUT_KINDS = [
  "operations_console",
  "operator_home",
  "incident_focus",
  "readiness_focus",
  "evidence_focus",
  "custom",
] as const;

export type WorkspaceLayoutKind = (typeof WORKSPACE_LAYOUT_KINDS)[number];

export const WORKSPACE_EXPERIENCE_STATUSES = [
  "composed",
  "partial",
  "empty",
  "superseded",
] as const;

export type WorkspaceExperienceStatus = (typeof WORKSPACE_EXPERIENCE_STATUSES)[number];

/** Composition slots — resolve only to existing artefacts/contracts. */
export const WORKSPACE_COMPOSITION_SLOTS = [
  "executive_experience_package",
  "operational_readiness_package",
  "evidence_integration_package",
  "navigation",
  "layouts",
  "operational_context",
  "role_context",
  "session_context",
] as const;

export type WorkspaceCompositionSlot = (typeof WORKSPACE_COMPOSITION_SLOTS)[number];

export interface WorkspaceNavigationPreferences {
  readonly navigationModelId: string;
  readonly entryPoints: readonly string[];
  readonly navigationGroups: readonly string[];
  readonly breadcrumbs: readonly string[];
  readonly deepLinkHints: readonly string[];
  readonly compositionOnly: true;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface WorkspaceLayout {
  readonly layoutId: string;
  readonly kind: WorkspaceLayoutKind;
  readonly name: string;
  /** Opaque panel/view refs — never business widgets with logic. */
  readonly panelRefs: readonly string[];
  readonly contextPanelRefs: readonly string[];
  readonly viewRefs: readonly string[];
  readonly compositionOnly: true;
  readonly ownsBusinessState: false;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface WorkspacePreferences {
  readonly preferenceId: string;
  readonly defaultLayoutKind: WorkspaceLayoutKind;
  readonly densityHint?: "compact" | "comfortable" | "spacious";
  readonly pinnedEntryPoints: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface OperationalContext {
  readonly contextId: string;
  readonly operationalReadinessPackageRef?: string;
  readonly environmentRef?: string;
  readonly focusHints: readonly string[];
  readonly workflowGroupRefs: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface RoleContext {
  readonly contextId: string;
  /** Opaque role hint — identity/permissions remain external. */
  readonly roleHint?: string;
  readonly personaHint?: string;
  readonly capabilityHints: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface SessionContext {
  readonly contextId: string;
  readonly sessionRef?: string;
  readonly localeHint?: string;
  readonly timezoneHint?: string;
  readonly restoreHints: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface WorkspaceComposition {
  readonly compositionId: string;
  readonly includedSlots: readonly WorkspaceCompositionSlot[];
  readonly navigation: WorkspaceNavigationPreferences;
  readonly layouts: readonly WorkspaceLayout[];
  readonly preferences: WorkspacePreferences;
  readonly operationalViews: readonly string[];
  readonly workflowGroupRefs: readonly string[];
  readonly compositionOnly: true;
  readonly ownsBusinessState: false;
  readonly assemblesBusinessLogic: false;
}

export interface WorkspaceExperienceAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

/**
 * Authoritative SoR for workspace composition only.
 * Never owns business state.
 */
export interface WorkspaceExperiencePackage {
  readonly workspaceExperiencePackageId: string;
  readonly executiveExperiencePackageRef?: string;
  readonly operationalReadinessPackageRef?: string;
  readonly evidenceIntegrationPackageRef?: string;
  readonly navigation: WorkspaceNavigationPreferences;
  readonly layouts: readonly WorkspaceLayout[];
  readonly preferences: WorkspacePreferences;
  readonly composition: WorkspaceComposition;
  readonly operationalContext: OperationalContext;
  readonly roleContext: RoleContext;
  readonly sessionContext: SessionContext;
  readonly experienceStatus: WorkspaceExperienceStatus;
  readonly createdAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly supersedesPackageId?: string;
  readonly auditHistory: readonly WorkspaceExperienceAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit architectural guards. */
  readonly compositionOnly: true;
  readonly ownsBusinessState: false;
  readonly assemblesBusinessLogic: false;
  readonly influencesDecisions: false;
}

export interface CreateWorkspaceExperiencePackageInput {
  readonly executiveExperiencePackageRef?: string;
  readonly operationalReadinessPackageRef?: string;
  readonly evidenceIntegrationPackageRef?: string;
  readonly layoutKind?: WorkspaceLayoutKind;
  readonly customLayoutName?: string;
  readonly panelRefs?: readonly string[];
  readonly contextPanelRefs?: readonly string[];
  readonly viewRefs?: readonly string[];
  readonly entryPoints?: readonly string[];
  readonly navigationGroups?: readonly string[];
  readonly breadcrumbs?: readonly string[];
  readonly deepLinkHints?: readonly string[];
  readonly operationalViews?: readonly string[];
  readonly workflowGroupRefs?: readonly string[];
  readonly environmentRef?: string;
  readonly focusHints?: readonly string[];
  readonly roleHint?: string;
  readonly personaHint?: string;
  readonly capabilityHints?: readonly string[];
  readonly sessionRef?: string;
  readonly localeHint?: string;
  readonly timezoneHint?: string;
  readonly restoreHints?: readonly string[];
  readonly densityHint?: "compact" | "comfortable" | "spacious";
  readonly pinnedEntryPoints?: readonly string[];
  readonly supersedesPackageId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface WorkspaceExperienceDiagnostics {
  readonly packageCount: number;
  readonly workspaceStatistics: Readonly<Record<string, number>>;
  readonly navigationStatistics: Readonly<Record<string, number>>;
  readonly layoutStatistics: Readonly<Record<string, number>>;
  readonly contextStatistics: Readonly<Record<string, number>>;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}

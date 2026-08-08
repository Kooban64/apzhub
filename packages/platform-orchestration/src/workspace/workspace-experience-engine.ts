/**
 * Enterprise Workspace & Operations Experience (QO-017).
 *
 * Answers: how do operators work with the completed platform?
 *
 * Composition layer only — never owns business state or business logic.
 */

import type {
  CreateWorkspaceExperiencePackageInput,
  OperationalContext,
  RoleContext,
  SessionContext,
  WorkspaceComposition,
  WorkspaceCompositionSlot,
  WorkspaceExperienceAuditEntry,
  WorkspaceExperienceDiagnostics,
  WorkspaceExperiencePackage,
  WorkspaceExperienceStatus,
  WorkspaceLayoutKind,
} from "../contracts/workspace-experience";
import { WORKSPACE_COMPOSITION_SLOTS } from "../contracts/workspace-experience";
import { OrchestrationError } from "../contracts/errors";
import { WORKSPACE_EVENT_TYPES } from "../contracts/events";
import type { QualityEventBackbone } from "../events/event-backbone";
import {
  buildNavigationPreferences,
  buildWorkspaceLayout,
  buildWorkspacePreferences,
  isWorkspaceLayoutKind,
} from "./workspace-composition";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface WorkspaceExperienceEngineOptions {
  readonly events: QualityEventBackbone;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function bump(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

export class WorkspaceExperienceEngine {
  private readonly events: QualityEventBackbone;
  private readonly orchestrationId: string;
  private readonly packages: DurableMap<WorkspaceExperiencePackage>;
  private readonly workspaceStatistics: Record<string, number> = {};
  private readonly navigationStatistics: Record<string, number> = {};
  private readonly layoutStatistics: Record<string, number> = {};
  private readonly contextStatistics: Record<string, number> = {};
  private eventPublishCount = 0;
  private latestPackageId?: string;

  constructor(options: WorkspaceExperienceEngineOptions) {
    this.events = options.events;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.packages = new DurableMap<WorkspaceExperiencePackage>(
      "workspace_experience_package",
      options.documentStore,
      (pkg) => ({
        tenantId: pkg.tenantId,
        projectId: pkg.projectId,
        orchestrationId: this.orchestrationId,
        correlationId:
          pkg.executiveExperiencePackageRef ?? pkg.workspaceExperiencePackageId,
        status: pkg.experienceStatus,
        actorId: pkg.actorId,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.packages.hydrate();
  }

  /**
   * Create an immutable Workspace Experience Package.
   * Assembles references only — never business logic or business state.
   */
  async createWorkspaceExperiencePackage(
    input: CreateWorkspaceExperiencePackageInput,
  ): Promise<WorkspaceExperiencePackage> {
    const tenantId = input.tenantId.trim();
    if (!tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_WORKSPACE_EXPERIENCE_PACKAGE",
        "tenantId is required",
      );
    }
    if (input.supersedesPackageId && !this.packages.has(input.supersedesPackageId)) {
      throw new OrchestrationError(
        "validation",
        "WORKSPACE_EXPERIENCE_PACKAGE_NOT_FOUND",
        `Prior workspace experience package not found: ${input.supersedesPackageId}`,
        { workspaceExperiencePackageId: input.supersedesPackageId },
      );
    }

    const layoutKind: WorkspaceLayoutKind =
      input.layoutKind && isWorkspaceLayoutKind(input.layoutKind)
        ? input.layoutKind
        : "operations_console";

    if (input.layoutKind && !isWorkspaceLayoutKind(input.layoutKind)) {
      throw new OrchestrationError(
        "validation",
        "UNKNOWN_WORKSPACE_LAYOUT",
        `Unknown workspace layout kind: ${input.layoutKind}`,
      );
    }

    const executiveExperiencePackageRef =
      input.executiveExperiencePackageRef?.trim() || undefined;
    const operationalReadinessPackageRef =
      input.operationalReadinessPackageRef?.trim() || undefined;
    const evidenceIntegrationPackageRef =
      input.evidenceIntegrationPackageRef?.trim() || undefined;

    const navigation = buildNavigationPreferences({
      entryPoints: input.entryPoints,
      navigationGroups: input.navigationGroups,
      breadcrumbs: input.breadcrumbs,
      deepLinkHints: input.deepLinkHints,
    });

    const layout = buildWorkspaceLayout({
      kind: layoutKind,
      name: input.customLayoutName,
      panelRefs: input.panelRefs,
      contextPanelRefs: input.contextPanelRefs,
      viewRefs: input.viewRefs,
    });

    const preferences = buildWorkspacePreferences({
      defaultLayoutKind: layoutKind,
      densityHint: input.densityHint,
      pinnedEntryPoints: input.pinnedEntryPoints ?? navigation.entryPoints.slice(0, 2),
    });

    const operationalContext: OperationalContext = Object.freeze({
      contextId: createId("wsoc"),
      operationalReadinessPackageRef,
      environmentRef: input.environmentRef?.trim() || undefined,
      focusHints: Object.freeze([...(input.focusHints ?? ["readiness", "operations"])]),
      workflowGroupRefs: Object.freeze([
        ...(input.workflowGroupRefs ?? ["wf:ops_triage", "wf:readiness_check"]),
      ]),
      metadata: Object.freeze({}),
    });

    const roleContext: RoleContext = Object.freeze({
      contextId: createId("wsrc"),
      roleHint: input.roleHint?.trim() || undefined,
      personaHint: input.personaHint?.trim() || undefined,
      capabilityHints: Object.freeze([
        ...(input.capabilityHints ?? ["ops.view", "ops.navigate"]),
      ]),
      metadata: Object.freeze({}),
    });

    const sessionContext: SessionContext = Object.freeze({
      contextId: createId("wssc"),
      sessionRef: input.sessionRef?.trim() || undefined,
      localeHint: input.localeHint?.trim() || undefined,
      timezoneHint: input.timezoneHint?.trim() || undefined,
      restoreHints: Object.freeze([
        ...(input.restoreHints ?? ["restore:layout", "restore:navigation"]),
      ]),
      metadata: Object.freeze({}),
    });

    const includedSlots: WorkspaceCompositionSlot[] = [];
    for (const slot of WORKSPACE_COMPOSITION_SLOTS) {
      if (slot === "executive_experience_package" && executiveExperiencePackageRef)
        includedSlots.push(slot);
      else if (
        slot === "operational_readiness_package" &&
        operationalReadinessPackageRef
      )
        includedSlots.push(slot);
      else if (slot === "evidence_integration_package" && evidenceIntegrationPackageRef)
        includedSlots.push(slot);
      else if (
        slot === "navigation" ||
        slot === "layouts" ||
        slot === "operational_context" ||
        slot === "role_context" ||
        slot === "session_context"
      )
        includedSlots.push(slot);
    }

    const operationalViews = Object.freeze([
      ...(input.operationalViews ?? [
        "view:ops_overview",
        "view:readiness",
        "view:evidence",
      ]),
    ]);

    const composition: WorkspaceComposition = Object.freeze({
      compositionId: createId("wsc"),
      includedSlots: Object.freeze(includedSlots),
      navigation,
      layouts: Object.freeze([layout]),
      preferences,
      operationalViews,
      workflowGroupRefs: operationalContext.workflowGroupRefs,
      compositionOnly: true as const,
      ownsBusinessState: false as const,
      assemblesBusinessLogic: false as const,
    });

    const artefactCount = [
      executiveExperiencePackageRef,
      operationalReadinessPackageRef,
      evidenceIntegrationPackageRef,
    ].filter(Boolean).length;

    let experienceStatus: WorkspaceExperienceStatus = "composed";
    if (artefactCount === 0) {
      experienceStatus = "empty";
    } else if (artefactCount < 2) {
      experienceStatus = "partial";
    }
    if (input.supersedesPackageId && experienceStatus === "empty") {
      experienceStatus = "superseded";
    }

    const workspaceExperiencePackageId = createId("wep");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;

    const auditHistory: WorkspaceExperienceAuditEntry[] = [
      Object.freeze({
        entryId: createId("wsa"),
        timestamp: now,
        action: "workspace_experience_package_created",
        actorId,
        detail: `Status ${experienceStatus}; composition-only; layout ${layoutKind}`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("wsa"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const pkg: WorkspaceExperiencePackage = Object.freeze({
      workspaceExperiencePackageId,
      executiveExperiencePackageRef,
      operationalReadinessPackageRef,
      evidenceIntegrationPackageRef,
      navigation,
      layouts: Object.freeze([layout]),
      preferences,
      composition,
      operationalContext,
      roleContext,
      sessionContext,
      experienceStatus,
      createdAt: now,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      actorId,
      supersedesPackageId: input.supersedesPackageId,
      auditHistory: Object.freeze(auditHistory),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      compositionOnly: true as const,
      ownsBusinessState: false as const,
      assemblesBusinessLogic: false as const,
      influencesDecisions: false as const,
    });

    await this.packages.set(workspaceExperiencePackageId, pkg);
    this.latestPackageId = workspaceExperiencePackageId;
    bump(this.workspaceStatistics, experienceStatus);
    bump(this.layoutStatistics, layoutKind);
    bump(this.navigationStatistics, "composed");
    bump(this.contextStatistics, "operational");
    bump(this.contextStatistics, "role");
    bump(this.contextStatistics, "session");

    const correlationId =
      operationalReadinessPackageRef ??
      executiveExperiencePackageRef ??
      workspaceExperiencePackageId;

    this.publishFact(WORKSPACE_EVENT_TYPES.navigationComposed, {
      correlationId,
      causationId: workspaceExperiencePackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: navigation.navigationModelId,
      actorId,
      payload: {
        workspaceExperiencePackageId,
        entryPointCount: navigation.entryPoints.length,
        compositionOnly: true,
      },
    });

    this.publishFact(WORKSPACE_EVENT_TYPES.experienceCreated, {
      correlationId,
      causationId: workspaceExperiencePackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: workspaceExperiencePackageId,
      actorId,
      payload: {
        workspaceExperiencePackageId,
        experienceStatus,
        ownsBusinessState: false,
        assemblesBusinessLogic: false,
      },
    });

    this.publishFact(WORKSPACE_EVENT_TYPES.packageCompleted, {
      correlationId,
      causationId: workspaceExperiencePackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: workspaceExperiencePackageId,
      actorId,
      payload: {
        workspaceExperiencePackageId,
        note: "Workspace Experience Package completed — composition only",
      },
    });

    if (input.supersedesPackageId) {
      this.publishFact(WORKSPACE_EVENT_TYPES.layoutUpdated, {
        correlationId,
        causationId: input.supersedesPackageId,
        tenantId,
        projectId: pkg.projectId,
        subjectRef: layout.layoutId,
        actorId,
        payload: {
          workspaceExperiencePackageId,
          supersedesPackageId: input.supersedesPackageId,
          layoutKind,
          note: "New package supersedes prior layout composition; history preserved",
        },
      });
    }

    return pkg;
  }

  getWorkspaceExperiencePackage(
    workspaceExperiencePackageId: string,
  ): WorkspaceExperiencePackage {
    const pkg = this.packages.get(workspaceExperiencePackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "WORKSPACE_EXPERIENCE_PACKAGE_NOT_FOUND",
        `Workspace experience package not found: ${workspaceExperiencePackageId}`,
        { workspaceExperiencePackageId },
      );
    }
    return pkg;
  }

  getLatestWorkspaceExperiencePackage(): WorkspaceExperiencePackage | undefined {
    if (!this.latestPackageId) return undefined;
    return this.packages.get(this.latestPackageId);
  }

  getWorkspaceLayouts(workspaceExperiencePackageId?: string) {
    return this.resolvePackage(workspaceExperiencePackageId).layouts;
  }

  getNavigationModel(workspaceExperiencePackageId?: string) {
    return this.resolvePackage(workspaceExperiencePackageId).navigation;
  }

  getWorkspaceContext(workspaceExperiencePackageId?: string): {
    readonly operationalContext: OperationalContext;
    readonly roleContext: RoleContext;
    readonly sessionContext: SessionContext;
  } {
    const pkg = this.resolvePackage(workspaceExperiencePackageId);
    return {
      operationalContext: pkg.operationalContext,
      roleContext: pkg.roleContext,
      sessionContext: pkg.sessionContext,
    };
  }

  getWorkspaceHistory(
    workspaceExperiencePackageId: string,
  ): readonly WorkspaceExperienceAuditEntry[] {
    return this.getWorkspaceExperiencePackage(workspaceExperiencePackageId)
      .auditHistory;
  }

  listWorkspaceExperiencePackages(): readonly WorkspaceExperiencePackage[] {
    return [...this.packages.values()];
  }

  diagnostics(): WorkspaceExperienceDiagnostics {
    let healthy = true;
    for (const pkg of this.packages.values()) {
      if (
        !pkg.compositionOnly ||
        pkg.ownsBusinessState ||
        pkg.assemblesBusinessLogic ||
        pkg.influencesDecisions
      ) {
        healthy = false;
        break;
      }
    }
    return {
      packageCount: this.packages.size,
      workspaceStatistics: { ...this.workspaceStatistics },
      navigationStatistics: { ...this.navigationStatistics },
      layoutStatistics: { ...this.layoutStatistics },
      contextStatistics: { ...this.contextStatistics },
      eventPublishCount: this.eventPublishCount,
      health: healthy ? "healthy" : "degraded",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  private resolvePackage(
    workspaceExperiencePackageId?: string,
  ): WorkspaceExperiencePackage {
    if (workspaceExperiencePackageId) {
      return this.getWorkspaceExperiencePackage(workspaceExperiencePackageId);
    }
    const latest = this.getLatestWorkspaceExperiencePackage();
    if (!latest) {
      throw new OrchestrationError(
        "validation",
        "WORKSPACE_EXPERIENCE_PACKAGE_NOT_FOUND",
        "No Workspace Experience Package available",
      );
    }
    return latest;
  }

  private publishFact(
    eventType: string,
    args: {
      correlationId: string;
      causationId?: string;
      tenantId: string;
      projectId?: string;
      subjectRef: string;
      actorId?: string;
      payload: Readonly<Record<string, unknown>>;
    },
  ): void {
    this.events.publish({
      eventType,
      correlationId: args.correlationId,
      causationId: args.causationId,
      tenantId: args.tenantId,
      projectId: args.projectId,
      producer: "orchestration.workspace_experience",
      subjectRef: args.subjectRef,
      actorId: args.actorId,
      payload: {
        ...args.payload,
        orchestrationId: this.orchestrationId,
      },
      metadata: { slice: "QO-017" },
    });
    this.eventPublishCount += 1;
  }
}

/**
 * Enterprise Executive Experience Integration (QO-015).
 *
 * Answers: how does an executive consume the authoritative artefacts
 * already produced by the platform?
 *
 * Projection, not presentation. Downstream of governance only.
 */

import type {
  CreateExecutiveExperiencePackageInput,
  ExecutiveArtefactSlot,
  ExecutiveExperienceAuditEntry,
  ExecutiveExperienceDiagnostics,
  ExecutiveExperiencePackage,
  ExecutiveExperienceStatus,
  ExecutivePersona,
  ExecutiveProjectionModel,
  ExecutiveViewConfiguration,
  NavigationModel,
  PresentationPreferences,
} from "../contracts/executive-experience";
import { EXECUTIVE_ARTEFACT_SLOTS } from "../contracts/executive-experience";
import { OrchestrationError } from "../contracts/errors";
import { EXECUTIVE_EXPERIENCE_EVENT_TYPES } from "../contracts/events";
import type { QualityEventBackbone } from "../events/event-backbone";
import {
  isExecutivePersonaKind,
  listBuiltinExecutivePersonas,
  resolveExecutivePersona,
} from "./executive-personas";

export interface ExecutiveExperienceEngineOptions {
  readonly events: QualityEventBackbone;
  readonly orchestrationId?: string;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function emptyIncludedArtefacts(): Record<ExecutiveArtefactSlot, string[]> {
  const out = {} as Record<ExecutiveArtefactSlot, string[]>;
  for (const slot of EXECUTIVE_ARTEFACT_SLOTS) {
    out[slot] = [];
  }
  return out;
}

export class ExecutiveExperienceEngine {
  private readonly events: QualityEventBackbone;
  private readonly orchestrationId: string;
  private readonly packages = new Map<string, ExecutiveExperiencePackage>();
  private readonly personaStatistics: Record<string, number> = {};
  private projectionCount = 0;
  private navigationEntryPointCount = 0;
  private eventPublishCount = 0;

  constructor(options: ExecutiveExperienceEngineOptions) {
    this.events = options.events;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
  }

  /**
   * Create an immutable Executive Experience Package.
   * Defines projection only — never renders, never influences decisions.
   */
  createExecutiveExperiencePackage(
    input: CreateExecutiveExperiencePackageInput,
  ): ExecutiveExperiencePackage {
    const tenantId = input.tenantId.trim();
    if (!tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_EXECUTIVE_EXPERIENCE_PACKAGE",
        "tenantId is required",
      );
    }
    if (!isExecutivePersonaKind(input.personaKind)) {
      throw new OrchestrationError(
        "validation",
        "UNKNOWN_EXECUTIVE_PERSONA",
        `Unknown executive persona kind: ${input.personaKind}`,
      );
    }
    if (
      input.personaKind === "custom" &&
      (!input.customArtefactSlots || input.customArtefactSlots.length === 0) &&
      (!input.customReportProfileKinds || input.customReportProfileKinds.length === 0)
    ) {
      throw new OrchestrationError(
        "validation",
        "CUSTOM_PERSONA_PREFERENCES_REQUIRED",
        "custom personas require customArtefactSlots and/or customReportProfileKinds",
      );
    }
    if (input.supersedesPackageId && !this.packages.has(input.supersedesPackageId)) {
      throw new OrchestrationError(
        "validation",
        "EXECUTIVE_EXPERIENCE_PACKAGE_NOT_FOUND",
        `Prior executive experience package not found: ${input.supersedesPackageId}`,
        { executiveExperiencePackageId: input.supersedesPackageId },
      );
    }

    const persona = resolveExecutivePersona(input.personaKind, {
      customPersonaName: input.customPersonaName,
      customReportProfileKinds: input.customReportProfileKinds,
      customArtefactSlots: input.customArtefactSlots,
    });

    const evidenceIntegrationPackageRef =
      input.evidenceIntegrationPackageRef?.trim() || undefined;
    const decisionPackageRef = input.decisionPackageRef?.trim() || undefined;
    const approvalBundleRef = input.approvalBundleRef?.trim() || undefined;
    const enrichmentPackageRef = input.enrichmentPackageRef?.trim() || undefined;

    const reportProfileRefs = Object.freeze([
      ...(input.reportProfileRefs ??
        persona.defaultReportProfileKinds.map((k) => `report_profile_${k}`)),
    ]);

    const includedSlots =
      input.customArtefactSlots && input.customArtefactSlots.length > 0
        ? input.customArtefactSlots
        : persona.defaultArtefactSlots;

    const reportProfileKinds =
      input.customReportProfileKinds && input.customReportProfileKinds.length > 0
        ? input.customReportProfileKinds
        : persona.defaultReportProfileKinds;

    const informationPriority =
      input.informationPriority ?? persona.defaultInformationPriority;

    const executiveExperiencePackageId = createId("eep");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;

    const presentationPreferences: PresentationPreferences = Object.freeze({
      preferenceId: createId("epp"),
      channelHints: Object.freeze([
        ...(input.channelHints ?? ["web", "future_channel"]),
      ]),
      densityHint: input.densityHint,
      localeHint: input.localeHint?.trim() || undefined,
      timezoneHint: input.timezoneHint?.trim() || undefined,
      renderingExternal: true as const,
      metadata: Object.freeze({}),
    });

    const navigationModel: NavigationModel = Object.freeze({
      navigationModelId: createId("enm"),
      entryPoints: Object.freeze([
        ...(input.entryPoints ?? ["executive_home", "decision_summary"]),
      ]),
      sectionOrder: Object.freeze([
        ...(input.sectionOrder ?? ["decisions", "approvals", "evidence", "enrichment"]),
      ]),
      deepLinkHints: Object.freeze([
        ...(input.deepLinkHints ?? [
          decisionPackageRef ? `decision:${decisionPackageRef}` : "decision:none",
        ]),
      ]),
      metadata: Object.freeze({}),
    });

    const viewConfiguration: ExecutiveViewConfiguration = Object.freeze({
      viewConfigurationId: createId("evc"),
      includedArtefactSlots: Object.freeze([...includedSlots]),
      reportProfileKinds: Object.freeze([...reportProfileKinds]),
      informationPriority,
      groupingHints: Object.freeze([
        ...(input.groupingHints ?? ["by_decision", "by_risk"]),
      ]),
      filterHints: Object.freeze([...(input.filterHints ?? ["tenant", "project"])]),
      presentationHints: Object.freeze([
        ...(input.presentationHints ?? ["projection_only", "wave4_dashboard_consumes"]),
      ]),
      metadata: Object.freeze({}),
    });

    const included = emptyIncludedArtefacts();
    const slotToRefs: Record<ExecutiveArtefactSlot, readonly string[]> = {
      report_profiles: reportProfileRefs,
      evidence_integration_package: evidenceIntegrationPackageRef
        ? [evidenceIntegrationPackageRef]
        : [],
      decision_package: decisionPackageRef ? [decisionPackageRef] : [],
      approval_bundle: approvalBundleRef ? [approvalBundleRef] : [],
      enrichment_package: enrichmentPackageRef ? [enrichmentPackageRef] : [],
      executive_view_configuration: [viewConfiguration.viewConfigurationId],
      presentation_preferences: [presentationPreferences.preferenceId],
      navigation_model: [navigationModel.navigationModelId],
    };

    for (const slot of includedSlots) {
      included[slot] = [...slotToRefs[slot]];
    }

    const frozenIncluded = {} as Record<ExecutiveArtefactSlot, readonly string[]>;
    for (const slot of EXECUTIVE_ARTEFACT_SLOTS) {
      frozenIncluded[slot] = Object.freeze(included[slot]);
    }

    const projection: ExecutiveProjectionModel = Object.freeze({
      projectionId: createId("eproj"),
      personaKind: persona.kind,
      includedArtefacts: Object.freeze(frozenIncluded),
      reportProfileSelection: Object.freeze([...reportProfileKinds]),
      navigationPreferences: navigationModel,
      informationPriority,
      grouping: viewConfiguration.groupingHints,
      filters: viewConfiguration.filterHints,
      presentationHints: viewConfiguration.presentationHints,
      projectionOnly: true as const,
      rendersNothing: true as const,
    });

    const artefactRefCount = [
      evidenceIntegrationPackageRef,
      decisionPackageRef,
      approvalBundleRef,
      enrichmentPackageRef,
    ].filter(Boolean).length;

    let experienceStatus: ExecutiveExperienceStatus = "projected";
    if (artefactRefCount === 0 && reportProfileRefs.length === 0) {
      experienceStatus = "empty";
    } else if (artefactRefCount < 2 || !decisionPackageRef) {
      experienceStatus = "partial";
    }
    if (input.supersedesPackageId && experienceStatus === "empty") {
      experienceStatus = "superseded";
    }

    const auditHistory: ExecutiveExperienceAuditEntry[] = [
      Object.freeze({
        entryId: createId("eea"),
        timestamp: now,
        action: "executive_experience_package_created",
        actorId,
        detail: `Status ${experienceStatus}; persona ${persona.kind}; projection-only`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("eea"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const pkg: ExecutiveExperiencePackage = Object.freeze({
      executiveExperiencePackageId,
      persona,
      reportProfileRefs,
      evidenceIntegrationPackageRef,
      decisionPackageRef,
      approvalBundleRef,
      enrichmentPackageRef,
      viewConfiguration,
      presentationPreferences,
      navigationModel,
      projection,
      experienceStatus,
      createdAt: now,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      actorId,
      supersedesPackageId: input.supersedesPackageId,
      auditHistory: Object.freeze(auditHistory),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      projectionOnly: true as const,
      presentationExternal: true as const,
      influencesDecisions: false as const,
      copiesEvidence: false as const,
    });

    this.packages.set(executiveExperiencePackageId, pkg);
    this.personaStatistics[persona.kind] =
      (this.personaStatistics[persona.kind] ?? 0) + 1;
    this.projectionCount += 1;
    this.navigationEntryPointCount += navigationModel.entryPoints.length;

    const correlationId =
      decisionPackageRef ??
      evidenceIntegrationPackageRef ??
      executiveExperiencePackageId;

    this.publishFact(EXECUTIVE_EXPERIENCE_EVENT_TYPES.personaApplied, {
      correlationId,
      causationId: executiveExperiencePackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: persona.personaId,
      actorId,
      payload: {
        executiveExperiencePackageId,
        personaKind: persona.kind,
        projectionOnly: true,
      },
    });

    this.publishFact(EXECUTIVE_EXPERIENCE_EVENT_TYPES.experienceCreated, {
      correlationId,
      causationId: decisionPackageRef ?? executiveExperiencePackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: executiveExperiencePackageId,
      actorId,
      payload: {
        executiveExperiencePackageId,
        personaKind: persona.kind,
        experienceStatus,
        influencesDecisions: false,
      },
    });

    this.publishFact(EXECUTIVE_EXPERIENCE_EVENT_TYPES.packageCompleted, {
      correlationId,
      causationId: executiveExperiencePackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: executiveExperiencePackageId,
      actorId,
      payload: {
        executiveExperiencePackageId,
        note: "Executive Experience Package completed — projection only, no presentation",
      },
    });

    if (input.supersedesPackageId) {
      this.publishFact(EXECUTIVE_EXPERIENCE_EVENT_TYPES.projectionUpdated, {
        correlationId,
        causationId: input.supersedesPackageId,
        tenantId,
        projectId: pkg.projectId,
        subjectRef: projection.projectionId,
        actorId,
        payload: {
          executiveExperiencePackageId,
          supersedesPackageId: input.supersedesPackageId,
          projectionId: projection.projectionId,
          note: "New package supersedes prior projection; history preserved",
        },
      });
    }

    return pkg;
  }

  getExecutiveExperiencePackage(
    executiveExperiencePackageId: string,
  ): ExecutiveExperiencePackage {
    const pkg = this.packages.get(executiveExperiencePackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "EXECUTIVE_EXPERIENCE_PACKAGE_NOT_FOUND",
        `Executive experience package not found: ${executiveExperiencePackageId}`,
        { executiveExperiencePackageId },
      );
    }
    return pkg;
  }

  listExecutivePersonas(): readonly ExecutivePersona[] {
    return listBuiltinExecutivePersonas();
  }

  getExecutivePersona(kind: string): ExecutivePersona {
    if (!isExecutivePersonaKind(kind)) {
      throw new OrchestrationError(
        "validation",
        "UNKNOWN_EXECUTIVE_PERSONA",
        `Unknown executive persona kind: ${kind}`,
        { kind },
      );
    }
    return resolveExecutivePersona(kind);
  }

  getProjectionModel(executiveExperiencePackageId: string): ExecutiveProjectionModel {
    return this.getExecutiveExperiencePackage(executiveExperiencePackageId).projection;
  }

  getExperienceHistory(
    executiveExperiencePackageId: string,
  ): readonly ExecutiveExperienceAuditEntry[] {
    return this.getExecutiveExperiencePackage(executiveExperiencePackageId)
      .auditHistory;
  }

  listExecutiveExperiencePackages(): readonly ExecutiveExperiencePackage[] {
    return [...this.packages.values()];
  }

  diagnostics(): ExecutiveExperienceDiagnostics {
    let healthy = true;
    for (const pkg of this.packages.values()) {
      if (
        !pkg.projectionOnly ||
        !pkg.presentationExternal ||
        pkg.influencesDecisions ||
        pkg.copiesEvidence ||
        !pkg.projection.rendersNothing
      ) {
        healthy = false;
        break;
      }
    }
    return {
      packageCount: this.packages.size,
      personaStatistics: { ...this.personaStatistics },
      projectionCount: this.projectionCount,
      navigationEntryPointCount: this.navigationEntryPointCount,
      eventPublishCount: this.eventPublishCount,
      health: healthy ? "healthy" : "degraded",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
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
      producer: "orchestration.executive_experience",
      subjectRef: args.subjectRef,
      actorId: args.actorId,
      payload: {
        ...args.payload,
        orchestrationId: this.orchestrationId,
      },
      metadata: { slice: "QO-015" },
    });
    this.eventPublishCount += 1;
  }
}

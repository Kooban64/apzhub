/**
 * Enterprise Evidence & Reporting Integration (QO-014).
 *
 * Answers: how can the platform present and trace authoritative evidence
 * across the entire Quality Flow?
 *
 * Evidence is referenced, never copied.
 * Reports consume evidence; they never become evidence.
 */

import type {
  CreateEvidenceIntegrationPackageInput,
  EvidenceIntegrationAuditEntry,
  EvidenceIntegrationDiagnostics,
  EvidenceIntegrationPackage,
  EvidenceIntegrationStatus,
  EvidenceReferenceSlot,
  GenerateReportViewInput,
  ReportProfile,
  ReportView,
  TraceabilityRecord,
} from "../contracts/evidence-integration";
import { EVIDENCE_REFERENCE_SLOTS } from "../contracts/evidence-integration";
import { OrchestrationError } from "../contracts/errors";
import { EVIDENCE_INTEGRATION_EVENT_TYPES } from "../contracts/events";
import type { QualityEventBackbone } from "../events/event-backbone";
import {
  isReportProfileKind,
  listBuiltinReportProfiles,
  resolveReportProfile,
} from "./report-profiles";

export interface EvidenceIntegrationEngineOptions {
  readonly events: QualityEventBackbone;
  readonly orchestrationId?: string;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function emptyIncludedRefs(): Record<EvidenceReferenceSlot, string[]> {
  const out = {} as Record<EvidenceReferenceSlot, string[]>;
  for (const slot of EVIDENCE_REFERENCE_SLOTS) {
    out[slot] = [];
  }
  return out;
}

export class EvidenceIntegrationEngine {
  private readonly events: QualityEventBackbone;
  private readonly orchestrationId: string;
  private readonly packages = new Map<string, EvidenceIntegrationPackage>();
  private readonly reportViews = new Map<string, ReportView>();
  private readonly reportingHistory: EvidenceIntegrationAuditEntry[] = [];
  private readonly reportProfileStatistics: Record<string, number> = {};
  private readonly referenceSlotCoverage: Record<string, number> = {};
  private eventPublishCount = 0;

  constructor(options: EvidenceIntegrationEngineOptions) {
    this.events = options.events;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
  }

  /**
   * Create an immutable Evidence Integration Package.
   * Stores opaque references only — never copies artefact content.
   */
  createEvidenceIntegrationPackage(
    input: CreateEvidenceIntegrationPackageInput,
  ): EvidenceIntegrationPackage {
    const qualityFlowRef = input.qualityFlowRef.trim();
    const tenantId = input.tenantId.trim();
    if (!qualityFlowRef || !tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_EVIDENCE_INTEGRATION_PACKAGE",
        "qualityFlowRef and tenantId are required",
      );
    }

    if (input.supersedesPackageId && !this.packages.has(input.supersedesPackageId)) {
      throw new OrchestrationError(
        "validation",
        "EVIDENCE_INTEGRATION_PACKAGE_NOT_FOUND",
        `Prior evidence integration package not found: ${input.supersedesPackageId}`,
        { evidenceIntegrationPackageId: input.supersedesPackageId },
      );
    }

    const evidenceRefs = Object.freeze([...(input.evidenceRefs ?? [])]);
    const reportRefs = Object.freeze([...(input.reportRefs ?? [])]);
    const auditRefs = Object.freeze([...(input.auditRefs ?? [])]);

    const impactGraphRef = input.impactGraphRef?.trim() || undefined;
    const governanceDecisionRef = input.governanceDecisionRef?.trim() || undefined;
    const approvalBundleRef = input.approvalBundleRef?.trim() || undefined;
    const decisionPackageRef = input.decisionPackageRef?.trim() || undefined;
    const automationCoordinationPackageRef =
      input.automationCoordinationPackageRef?.trim() || undefined;
    const sourceChangePackageRef = input.sourceChangePackageRef?.trim() || undefined;
    const enrichmentPackageRef = input.enrichmentPackageRef?.trim() || undefined;

    const artefactRefs = [
      qualityFlowRef,
      impactGraphRef,
      governanceDecisionRef,
      approvalBundleRef,
      decisionPackageRef,
      automationCoordinationPackageRef,
      sourceChangePackageRef,
      enrichmentPackageRef,
    ].filter((r): r is string => Boolean(r));

    let integrationStatus: EvidenceIntegrationStatus = "complete";
    if (artefactRefs.length === 1 && evidenceRefs.length === 0) {
      integrationStatus = "empty";
    } else if (
      !decisionPackageRef ||
      artefactRefs.length < 3 ||
      evidenceRefs.length === 0
    ) {
      integrationStatus = "partial";
    }
    if (input.supersedesPackageId && integrationStatus === "empty") {
      integrationStatus = "superseded";
    }

    const evidenceIntegrationPackageId = createId("eip");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;

    const traceability: TraceabilityRecord = Object.freeze({
      traceabilityId: createId("eitr"),
      evidenceIntegrationPackageId,
      artefactRefs: Object.freeze(artefactRefs),
      evidenceRefs,
      reportRefs,
      auditRefs,
      createdAt: now,
      immutable: true as const,
    });

    this.bumpSlotCoverage("quality_flow", 1);
    if (impactGraphRef) this.bumpSlotCoverage("impact_graph", 1);
    if (governanceDecisionRef) this.bumpSlotCoverage("governance_decision", 1);
    if (approvalBundleRef) this.bumpSlotCoverage("approval_bundle", 1);
    if (decisionPackageRef) this.bumpSlotCoverage("decision_package", 1);
    if (automationCoordinationPackageRef)
      this.bumpSlotCoverage("automation_coordination_package", 1);
    if (sourceChangePackageRef) this.bumpSlotCoverage("source_change_package", 1);
    if (enrichmentPackageRef) this.bumpSlotCoverage("enrichment_package", 1);
    this.bumpSlotCoverage("evidence", evidenceRefs.length);
    this.bumpSlotCoverage("report", reportRefs.length);
    this.bumpSlotCoverage("audit", auditRefs.length);

    const auditHistory: EvidenceIntegrationAuditEntry[] = [
      Object.freeze({
        entryId: createId("eia"),
        timestamp: now,
        action: "evidence_integration_package_created",
        actorId,
        detail: `Status ${integrationStatus}; refs-only; artefacts ${artefactRefs.length}; evidence ${evidenceRefs.length}`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("eia"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const pkg: EvidenceIntegrationPackage = Object.freeze({
      evidenceIntegrationPackageId,
      qualityFlowRef,
      impactGraphRef,
      governanceDecisionRef,
      approvalBundleRef,
      decisionPackageRef,
      automationCoordinationPackageRef,
      sourceChangePackageRef,
      enrichmentPackageRef,
      evidenceRefs,
      reportRefs,
      auditRefs,
      traceability,
      integrationStatus,
      createdAt: now,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      actorId,
      supersedesPackageId: input.supersedesPackageId,
      auditHistory: Object.freeze(auditHistory),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      referencesOnly: true as const,
      copiesEvidence: false as const,
      reportIsEvidence: false as const,
    });

    this.packages.set(evidenceIntegrationPackageId, pkg);
    this.reportingHistory.push(...auditHistory);

    const correlationId = decisionPackageRef ?? qualityFlowRef;

    this.publishFact(EVIDENCE_INTEGRATION_EVENT_TYPES.integrationCreated, {
      correlationId,
      causationId: qualityFlowRef,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: evidenceIntegrationPackageId,
      actorId,
      payload: {
        evidenceIntegrationPackageId,
        qualityFlowRef,
        decisionPackageRef,
        integrationStatus,
        referencesOnly: true,
      },
    });

    this.publishFact(EVIDENCE_INTEGRATION_EVENT_TYPES.packageCompleted, {
      correlationId,
      causationId: evidenceIntegrationPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: evidenceIntegrationPackageId,
      actorId,
      payload: {
        evidenceIntegrationPackageId,
        note: "Evidence Integration Package completed — artefacts referenced, never copied",
      },
    });

    return pkg;
  }

  getEvidenceIntegrationPackage(
    evidenceIntegrationPackageId: string,
  ): EvidenceIntegrationPackage {
    const pkg = this.packages.get(evidenceIntegrationPackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "EVIDENCE_INTEGRATION_PACKAGE_NOT_FOUND",
        `Evidence integration package not found: ${evidenceIntegrationPackageId}`,
        { evidenceIntegrationPackageId },
      );
    }
    return pkg;
  }

  listReportProfiles(): readonly ReportProfile[] {
    return listBuiltinReportProfiles();
  }

  getReportProfile(kind: string): ReportProfile {
    if (!isReportProfileKind(kind)) {
      throw new OrchestrationError(
        "validation",
        "UNKNOWN_REPORT_PROFILE",
        `Unknown report profile kind: ${kind}`,
        { kind },
      );
    }
    return resolveReportProfile(kind);
  }

  /**
   * Assemble a derived report view over referenced evidence.
   * Presentation remains external — this returns inclusion refs only.
   */
  generateReportView(input: GenerateReportViewInput): ReportView {
    const pkg = this.getEvidenceIntegrationPackage(input.evidenceIntegrationPackageId);
    const tenantId = input.tenantId.trim() || pkg.tenantId;
    if (!tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_REPORT_VIEW",
        "tenantId is required",
      );
    }
    if (!isReportProfileKind(input.profileKind)) {
      throw new OrchestrationError(
        "validation",
        "UNKNOWN_REPORT_PROFILE",
        `Unknown report profile kind: ${input.profileKind}`,
      );
    }
    if (
      input.profileKind === "custom" &&
      (!input.customInclusionSlots || input.customInclusionSlots.length === 0)
    ) {
      throw new OrchestrationError(
        "validation",
        "CUSTOM_PROFILE_SLOTS_REQUIRED",
        "custom report profiles require customInclusionSlots",
      );
    }

    const profile = resolveReportProfile(
      input.profileKind,
      input.customInclusionSlots,
      input.customProfileName,
    );

    const included = emptyIncludedRefs();
    const slotToRefs: Record<EvidenceReferenceSlot, readonly string[]> = {
      quality_flow: [pkg.qualityFlowRef],
      impact_graph: pkg.impactGraphRef ? [pkg.impactGraphRef] : [],
      governance_decision: pkg.governanceDecisionRef ? [pkg.governanceDecisionRef] : [],
      approval_bundle: pkg.approvalBundleRef ? [pkg.approvalBundleRef] : [],
      decision_package: pkg.decisionPackageRef ? [pkg.decisionPackageRef] : [],
      automation_coordination_package: pkg.automationCoordinationPackageRef
        ? [pkg.automationCoordinationPackageRef]
        : [],
      source_change_package: pkg.sourceChangePackageRef
        ? [pkg.sourceChangePackageRef]
        : [],
      enrichment_package: pkg.enrichmentPackageRef ? [pkg.enrichmentPackageRef] : [],
      evidence: pkg.evidenceRefs,
      report: pkg.reportRefs,
      audit: pkg.auditRefs,
    };

    for (const slot of profile.inclusionSlots) {
      included[slot] = [...slotToRefs[slot]];
    }

    const frozenIncluded = {} as Record<EvidenceReferenceSlot, readonly string[]>;
    for (const slot of EVIDENCE_REFERENCE_SLOTS) {
      frozenIncluded[slot] = Object.freeze(included[slot]);
    }

    const reportViewId = createId("rpv");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || pkg.actorId;
    const traceabilityId = createId("eitr");

    const view: ReportView = Object.freeze({
      reportViewId,
      evidenceIntegrationPackageId: pkg.evidenceIntegrationPackageId,
      profile,
      includedRefs: Object.freeze(frozenIncluded),
      traceabilityId,
      generatedAt: now,
      tenantId,
      projectId: input.projectId?.trim() || pkg.projectId,
      actorId,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      viewOnly: true as const,
      isEvidence: false as const,
      presentationExternal: true as const,
    });

    this.reportViews.set(reportViewId, view);
    this.reportProfileStatistics[profile.kind] =
      (this.reportProfileStatistics[profile.kind] ?? 0) + 1;

    const historyEntry: EvidenceIntegrationAuditEntry = Object.freeze({
      entryId: createId("eia"),
      timestamp: now,
      action: "report_view_generated",
      actorId,
      detail: `package=${pkg.evidenceIntegrationPackageId}; profile=${profile.kind}; view=${reportViewId}; not evidence`,
    });
    this.reportingHistory.push(historyEntry);

    const correlationId = pkg.decisionPackageRef ?? pkg.qualityFlowRef;

    this.publishFact(EVIDENCE_INTEGRATION_EVENT_TYPES.profileApplied, {
      correlationId,
      causationId: pkg.evidenceIntegrationPackageId,
      tenantId,
      projectId: view.projectId,
      subjectRef: profile.profileId,
      actorId,
      payload: {
        reportViewId,
        profileKind: profile.kind,
        evidenceIntegrationPackageId: pkg.evidenceIntegrationPackageId,
        inclusionSlotCount: profile.inclusionSlots.length,
      },
    });

    this.publishFact(EVIDENCE_INTEGRATION_EVENT_TYPES.reportGenerated, {
      correlationId,
      causationId: reportViewId,
      tenantId,
      projectId: view.projectId,
      subjectRef: reportViewId,
      actorId,
      payload: {
        reportViewId,
        evidenceIntegrationPackageId: pkg.evidenceIntegrationPackageId,
        profileKind: profile.kind,
        viewOnly: true,
        isEvidence: false,
      },
    });

    return view;
  }

  getReportView(reportViewId: string): ReportView {
    const view = this.reportViews.get(reportViewId);
    if (!view) {
      throw new OrchestrationError(
        "validation",
        "REPORT_VIEW_NOT_FOUND",
        `Report view not found: ${reportViewId}`,
        { reportViewId },
      );
    }
    return view;
  }

  queryTraceability(evidenceIntegrationPackageId: string): TraceabilityRecord {
    const pkg = this.getEvidenceIntegrationPackage(evidenceIntegrationPackageId);
    return pkg.traceability;
  }

  getReportingHistory(
    evidenceIntegrationPackageId?: string,
  ): readonly EvidenceIntegrationAuditEntry[] {
    if (!evidenceIntegrationPackageId) {
      return [...this.reportingHistory];
    }
    const pkg = this.getEvidenceIntegrationPackage(evidenceIntegrationPackageId);
    return [
      ...pkg.auditHistory,
      ...this.reportingHistory.filter((e) =>
        e.detail.includes(evidenceIntegrationPackageId),
      ),
    ];
  }

  listEvidenceIntegrationPackages(): readonly EvidenceIntegrationPackage[] {
    return [...this.packages.values()];
  }

  listReportViews(): readonly ReportView[] {
    return [...this.reportViews.values()];
  }

  diagnostics(): EvidenceIntegrationDiagnostics {
    let referenceIntegrityOk = true;
    for (const pkg of this.packages.values()) {
      if (!pkg.qualityFlowRef || pkg.copiesEvidence || !pkg.referencesOnly) {
        referenceIntegrityOk = false;
        break;
      }
      if (pkg.reportIsEvidence) {
        referenceIntegrityOk = false;
        break;
      }
    }
    for (const view of this.reportViews.values()) {
      if (view.isEvidence || !view.viewOnly) {
        referenceIntegrityOk = false;
        break;
      }
    }

    return {
      packageCount: this.packages.size,
      reportViewCount: this.reportViews.size,
      reportProfileStatistics: { ...this.reportProfileStatistics },
      traceabilityCount: this.packages.size,
      referenceIntegrityOk,
      referenceSlotCoverage: { ...this.referenceSlotCoverage },
      eventPublishCount: this.eventPublishCount,
      health: referenceIntegrityOk ? "healthy" : "degraded",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  private bumpSlotCoverage(slot: EvidenceReferenceSlot, count: number): void {
    if (count <= 0) return;
    this.referenceSlotCoverage[slot] = (this.referenceSlotCoverage[slot] ?? 0) + count;
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
      producer: "orchestration.evidence_integration",
      subjectRef: args.subjectRef,
      actorId: args.actorId,
      payload: {
        ...args.payload,
        orchestrationId: this.orchestrationId,
      },
      metadata: { slice: "QO-014" },
    });
    this.eventPublishCount += 1;
  }
}

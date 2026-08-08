/**
 * Enterprise Approval Decision Platform (QO-008).
 * Internal alias: Human Approval Engine.
 *
 * Records authorised human governance decisions via immutable Approval Bundles.
 * Does not evaluate policies/gates/evidence. Does not manage identity/RBAC.
 * Does not know subject semantics beyond opaque references.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  APPROVAL_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import type {
  ApprovalAuditEntry,
  ApprovalBundle,
  ApprovalDecision,
  ApprovalDiagnostics,
  ApprovalExplainability,
  ApprovalRequest,
  ApprovalTemplateInput,
  AuthorityId,
  AuthorityInput,
  BundleFinalStatus,
  CreateApprovalBundleInput,
  SubmitDecisionInput,
} from "../contracts/approval";
import { ApprovalTemplateRegistry, AuthorityRegistry } from "./registries";
import { evaluateSod, mandatoryAuthoritiesSatisfied, twoPersonSatisfied } from "./sod";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface ApprovalEngineOptions {
  readonly authorities?: AuthorityRegistry;
  readonly templates?: ApprovalTemplateRegistry;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

const POSITIVE = new Set(["approved", "conditionally_approved"]);

export class ApprovalEngine {
  readonly authorities: AuthorityRegistry;
  readonly templates: ApprovalTemplateRegistry;

  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly bundles: DurableMap<ApprovalBundle>;
  private readonly requests = new Map<string, ApprovalRequest>();
  private readonly explainability = new Map<string, ApprovalExplainability>();
  private delegationCount = 0;
  private readonly authorityDecisionCounts: Record<string, number> = {};

  constructor(options: ApprovalEngineOptions = {}) {
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.authorities = options.authorities ?? new AuthorityRegistry();
    this.templates =
      options.templates ??
      new ApprovalTemplateRegistry({
        documentStore: options.documentStore,
        orchestrationId: this.orchestrationId,
      });
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.bundles = new DurableMap<ApprovalBundle>(
      "approval_bundle",
      options.documentStore,
      (bundle) => ({
        tenantId: bundle.tenantId,
        projectId: bundle.projectId,
        orchestrationId: this.orchestrationId,
        status: bundle.finalStatus,
        actorId: bundle.changeOwnerActorId,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.templates.hydrate();
    await this.bundles.hydrate();
  }

  registerAuthority(input: AuthorityInput) {
    return this.authorities.register(input);
  }

  async registerTemplate(input: ApprovalTemplateInput) {
    for (const authorityId of input.requiredAuthorities) {
      this.authorities.get(authorityId);
    }
    for (const rule of input.sodRules ?? []) {
      if (rule.type === "mandatory_authority" || rule.type === "emergency_authority") {
        this.authorities.get(rule.authorityId);
      }
    }
    for (const esc of input.escalationRules ?? []) {
      this.authorities.get(esc.fromAuthorityId);
      this.authorities.get(esc.toAuthorityId);
    }
    return await this.templates.register(input);
  }

  /**
   * Create an Approval Bundle from a template + opaque subject refs.
   * Consumes governanceDecisionRef only — never re-evaluates governance.
   */
  async createApprovalBundle(
    input: CreateApprovalBundleInput,
  ): Promise<ApprovalBundle> {
    const tenantId = input.tenantId.trim();
    const governanceDecisionRef = input.subject.governanceDecisionRef.trim();
    if (!tenantId || !governanceDecisionRef) {
      throw new OrchestrationError(
        "validation",
        "INVALID_APPROVAL_BUNDLE",
        "tenantId and subject.governanceDecisionRef are required",
      );
    }

    const template = this.templates.get(input.templateId, input.templateVersion);
    if (template.lifecycleState === "retired") {
      throw new OrchestrationError(
        "lifecycle",
        "TEMPLATE_RETIRED",
        `Cannot create bundle from retired template: ${template.templateId}`,
      );
    }

    const required = unique([
      ...template.requiredAuthorities,
      ...(input.additionalAuthorities ?? []),
    ]);

    const bundleId = createId("apb");
    const requestId = createId("apr");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || "system";

    const audit: ApprovalAuditEntry[] = [
      {
        entryId: createId("apa"),
        timestamp: now,
        action: "bundle_created",
        actorId,
        detail: `Bundle created from template ${template.templateId}@${template.version}; governance ref ${governanceDecisionRef}`,
      },
    ];

    const bundle: ApprovalBundle = {
      bundleId,
      templateId: template.templateId,
      templateVersion: template.version,
      qualityFlowRef: input.subject.qualityFlowRef?.trim() || undefined,
      governanceDecisionRef,
      requiredAuthorities: required,
      authorityDecisions: [],
      conditions: [],
      exceptions: [],
      finalStatus: "pending",
      createdAt: now,
      updatedAt: now,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      changeOwnerActorId: input.subject.changeOwnerActorId?.trim() || undefined,
      emergency: Boolean(input.subject.emergency),
      auditHistory: Object.freeze(audit),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    };

    const request: ApprovalRequest = Object.freeze({
      requestId,
      bundleId,
      templateId: template.templateId,
      templateVersion: template.version,
      governanceDecisionRef,
      requiredAuthorities: required,
      status: "pending",
      createdAt: now,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    });

    await this.bundles.set(bundleId, bundle);
    this.requests.set(requestId, request);
    this.refreshExplainability(bundleId);

    this.emit(
      APPROVAL_EVENT_TYPES.bundleCreated,
      bundleId,
      {
        bundleId,
        templateId: template.templateId,
        governanceDecisionRef,
        requiredAuthorities: required,
        // Explicit: no subject semantics beyond opaque refs
        evaluatesGovernance: false,
        releaseApproval: false,
      },
      tenantId,
    );

    return bundle;
  }

  getBundle(bundleId: string): ApprovalBundle {
    const bundle = this.bundles.get(bundleId.trim());
    if (!bundle) {
      throw new OrchestrationError(
        "validation",
        "BUNDLE_MISSING",
        `Approval bundle not found: ${bundleId}`,
        { bundleId },
      );
    }
    return bundle;
  }

  getRequiredAuthorities(bundleId: string): readonly AuthorityId[] {
    return this.getBundle(bundleId).requiredAuthorities;
  }

  getOutstandingAuthorities(bundleId: string): readonly AuthorityId[] {
    const bundle = this.getBundle(bundleId);
    return bundle.requiredAuthorities.filter(
      (authorityId) => !this.hasTerminalDecision(bundle, authorityId),
    );
  }

  getDecision(bundleId: string, decisionId: string): ApprovalDecision {
    const decision = this.getBundle(bundleId).authorityDecisions.find(
      (d) => d.decisionId === decisionId,
    );
    if (!decision) {
      throw new OrchestrationError(
        "validation",
        "DECISION_MISSING",
        `Decision not found: ${decisionId}`,
        { bundleId, decisionId },
      );
    }
    return decision;
  }

  getFinalStatus(bundleId: string): BundleFinalStatus {
    return this.getBundle(bundleId).finalStatus;
  }

  getHistory(bundleId: string): readonly ApprovalAuditEntry[] {
    return this.getBundle(bundleId).auditHistory;
  }

  getExplainability(bundleId: string): ApprovalExplainability {
    const explain = this.explainability.get(bundleId.trim());
    if (!explain) {
      this.refreshExplainability(bundleId);
      return this.explainability.get(bundleId.trim())!;
    }
    return explain;
  }

  listBundles(): readonly ApprovalBundle[] {
    return [...this.bundles.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  /**
   * Submit an authority decision. Records only — no policy/gate evaluation.
   */
  async submitDecision(
    bundleId: string,
    input: SubmitDecisionInput,
  ): Promise<ApprovalBundle> {
    const bundle = this.getBundle(bundleId);
    if (
      bundle.finalStatus === "approved" ||
      bundle.finalStatus === "conditionally_approved" ||
      bundle.finalStatus === "rejected" ||
      bundle.finalStatus === "cancelled"
    ) {
      throw new OrchestrationError(
        "lifecycle",
        "BUNDLE_CLOSED",
        `Cannot submit decision to closed bundle in status ${bundle.finalStatus}`,
        { bundleId, finalStatus: bundle.finalStatus },
      );
    }

    const authorityId = input.authorityId.trim();
    const actorId = input.actorId.trim();
    if (!authorityId || !actorId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_DECISION",
        "authorityId and actorId are required",
      );
    }
    if (!bundle.requiredAuthorities.includes(authorityId)) {
      throw new OrchestrationError(
        "validation",
        "AUTHORITY_NOT_REQUIRED",
        `Authority not required on this bundle: ${authorityId}`,
        { authorityId, bundleId },
      );
    }
    this.authorities.get(authorityId);

    if (this.hasTerminalDecision(bundle, authorityId)) {
      throw new OrchestrationError(
        "lifecycle",
        "DECISION_EXISTS",
        `Terminal decision already recorded for authority ${authorityId}`,
        { authorityId, bundleId },
      );
    }

    if (input.state === "delegated") {
      const auth = this.authorities.get(authorityId);
      if (!auth.delegationSupported) {
        throw new OrchestrationError(
          "validation",
          "DELEGATION_NOT_SUPPORTED",
          `Authority does not support delegation: ${authorityId}`,
        );
      }
      if (!input.delegatedToAuthorityId?.trim()) {
        throw new OrchestrationError(
          "validation",
          "INVALID_DELEGATION",
          "delegatedToAuthorityId is required for delegated state",
        );
      }
      this.authorities.get(input.delegatedToAuthorityId);
      this.delegationCount += 1;
    }

    if (input.state === "escalated") {
      const auth = this.authorities.get(authorityId);
      if (!auth.escalationSupported) {
        throw new OrchestrationError(
          "validation",
          "ESCALATION_NOT_SUPPORTED",
          `Authority does not support escalation: ${authorityId}`,
        );
      }
      if (!input.escalatedToAuthorityId?.trim()) {
        throw new OrchestrationError(
          "validation",
          "INVALID_ESCALATION",
          "escalatedToAuthorityId is required for escalated state",
        );
      }
      this.authorities.get(input.escalatedToAuthorityId);
    }

    const now = new Date().toISOString();
    const decision: ApprovalDecision = {
      decisionId: createId("apd"),
      authorityId,
      state: input.state,
      timestamp: now,
      actorId,
      comments: input.comments?.trim() || undefined,
      conditions: Object.freeze([...(input.conditions ?? [])]),
      exceptions: Object.freeze([...(input.exceptions ?? [])]),
      auditRef: input.auditRef?.trim() || undefined,
      delegatedToAuthorityId: input.delegatedToAuthorityId?.trim() || undefined,
      delegatedToActorId: input.delegatedToActorId?.trim() || undefined,
      escalatedToAuthorityId: input.escalatedToAuthorityId?.trim() || undefined,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    };

    // Provisional SoD check on positive decisions
    const provisionalDecisions = [...bundle.authorityDecisions, decision];
    const template = this.templates.get(bundle.templateId, bundle.templateVersion);
    const sod = evaluateSod({
      template,
      decisions: provisionalDecisions,
      changeOwnerActorId: bundle.changeOwnerActorId,
      emergency: bundle.emergency,
      delegations: this.collectDelegations(provisionalDecisions, template),
    });
    if (sod.blocking.length && POSITIVE.has(input.state)) {
      throw new OrchestrationError(
        "lifecycle",
        "SOD_VIOLATION",
        sod.blocking.join("; "),
        { blocking: sod.blocking },
      );
    }

    const conditions = unique([...bundle.conditions, ...decision.conditions]);
    const exceptions = unique([...bundle.exceptions, ...decision.exceptions]);
    const auditHistory = Object.freeze([
      ...bundle.auditHistory,
      {
        entryId: createId("apa"),
        timestamp: now,
        action: "decision_submitted",
        actorId,
        detail: `${authorityId} → ${input.state}`,
      },
    ]);

    let nextAuthorities = bundle.requiredAuthorities;
    if (input.state === "delegated" && decision.delegatedToAuthorityId) {
      if (!nextAuthorities.includes(decision.delegatedToAuthorityId)) {
        nextAuthorities = Object.freeze([
          ...nextAuthorities,
          decision.delegatedToAuthorityId,
        ]);
      }
    }
    if (input.state === "escalated" && decision.escalatedToAuthorityId) {
      if (!nextAuthorities.includes(decision.escalatedToAuthorityId)) {
        nextAuthorities = Object.freeze([
          ...nextAuthorities,
          decision.escalatedToAuthorityId,
        ]);
      }
    }

    const updated: ApprovalBundle = {
      ...bundle,
      requiredAuthorities: nextAuthorities,
      authorityDecisions: Object.freeze([...bundle.authorityDecisions, decision]),
      conditions: Object.freeze(conditions),
      exceptions: Object.freeze(exceptions),
      updatedAt: now,
      auditHistory,
    };

    const finalStatus = this.deriveFinalStatus(updated);
    const closed: ApprovalBundle = {
      ...updated,
      finalStatus,
      auditHistory:
        finalStatus !== bundle.finalStatus
          ? Object.freeze([
              ...updated.auditHistory,
              {
                entryId: createId("apa"),
                timestamp: now,
                action: "final_status",
                actorId,
                detail: `Final status → ${finalStatus}`,
              },
            ])
          : updated.auditHistory,
    };

    await this.bundles.set(bundleId, closed);
    this.authorityDecisionCounts[authorityId] =
      (this.authorityDecisionCounts[authorityId] ?? 0) + 1;
    this.refreshExplainability(bundleId);

    this.emit(
      APPROVAL_EVENT_TYPES.decisionSubmitted,
      bundleId,
      {
        bundleId,
        decisionId: decision.decisionId,
        authorityId,
        state: input.state,
        finalStatus: closed.finalStatus,
        evaluatesGovernance: false,
      },
      bundle.tenantId,
    );

    return closed;
  }

  diagnostics(): ApprovalDiagnostics {
    let pendingDecisionCount = 0;
    let approvedBundleCount = 0;
    let rejectedBundleCount = 0;
    for (const bundle of this.bundles.values()) {
      if (bundle.finalStatus === "pending" || bundle.finalStatus === "incomplete") {
        pendingDecisionCount += this.getOutstandingAuthorities(bundle.bundleId).length;
      }
      if (
        bundle.finalStatus === "approved" ||
        bundle.finalStatus === "conditionally_approved"
      ) {
        approvedBundleCount += 1;
      }
      if (bundle.finalStatus === "rejected") {
        rejectedBundleCount += 1;
      }
    }
    return {
      templateCount: this.templates.count(),
      authorityCount: this.authorities.count(),
      bundleCount: this.bundles.size,
      pendingDecisionCount,
      approvedBundleCount,
      rejectedBundleCount,
      delegationCount: this.delegationCount,
      authorityDecisionCounts: { ...this.authorityDecisionCounts },
      health: "healthy",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  health(): { readonly status: "healthy"; readonly ready: boolean } {
    return { status: "healthy", ready: true };
  }

  // —— Internals ——

  private hasTerminalDecision(bundle: ApprovalBundle, authorityId: string): boolean {
    return bundle.authorityDecisions.some(
      (d) =>
        d.authorityId === authorityId &&
        d.state !== "pending" &&
        d.state !== "delegated" &&
        d.state !== "escalated" &&
        d.state !== "superseded",
    );
  }

  private collectDelegations(
    decisions: readonly ApprovalDecision[],
    template: { sodRules: readonly { type: string; maxHours?: number }[] },
  ) {
    const maxHours =
      template.sodRules.find((r) => r.type === "time_limited_delegation")?.maxHours ??
      24;
    return decisions
      .filter((d) => d.state === "delegated" && d.delegatedToAuthorityId)
      .map((d) => ({
        fromAuthorityId: d.authorityId,
        toAuthorityId: d.delegatedToAuthorityId!,
        actorId: d.actorId,
        createdAt: d.timestamp,
        maxHours,
      }));
  }

  private deriveFinalStatus(bundle: ApprovalBundle): BundleFinalStatus {
    const template = this.templates.get(bundle.templateId, bundle.templateVersion);
    const decisions = bundle.authorityDecisions;

    if (decisions.some((d) => d.state === "rejected")) {
      return "rejected";
    }
    if (decisions.some((d) => d.state === "cancelled")) {
      return "cancelled";
    }
    if (decisions.some((d) => d.state === "expired")) {
      return "expired";
    }

    const sod = evaluateSod({
      template,
      decisions,
      changeOwnerActorId: bundle.changeOwnerActorId,
      emergency: bundle.emergency,
      delegations: this.collectDelegations(decisions, template),
    });
    if (sod.blocking.length) {
      return "incomplete";
    }

    // Emergency override (declarative)
    if (bundle.emergency && template.decisionRule.type === "emergency_override") {
      const overrideAuthorityId = template.decisionRule.authorityId;
      const emergencyDecision = decisions.find(
        (d) => d.authorityId === overrideAuthorityId && POSITIVE.has(d.state),
      );
      if (emergencyDecision) {
        return emergencyDecision.state === "conditionally_approved"
          ? "conditionally_approved"
          : "approved";
      }
    }
    if (bundle.emergency) {
      for (const rule of template.sodRules) {
        if (rule.type !== "emergency_authority") continue;
        const hit = decisions.find(
          (d) => d.authorityId === rule.authorityId && POSITIVE.has(d.state),
        );
        if (hit) {
          return hit.state === "conditionally_approved"
            ? "conditionally_approved"
            : "approved";
        }
      }
    }

    if (!mandatoryAuthoritiesSatisfied(template, decisions)) {
      return "pending";
    }
    if (!twoPersonSatisfied(template, decisions)) {
      return "pending";
    }

    const positive = decisions.filter((d) => POSITIVE.has(d.state));
    const required = bundle.requiredAuthorities.filter((authorityId) => {
      // Delegated/escalated source authorities don't need their own positive if target covers
      const last = [...decisions].reverse().find((d) => d.authorityId === authorityId);
      if (last?.state === "delegated" || last?.state === "escalated") {
        return false;
      }
      return true;
    });

    const covered = required.every((authorityId) =>
      positive.some((d) => d.authorityId === authorityId),
    );

    if (template.decisionRule.type === "minimum") {
      if (positive.length >= template.decisionRule.count) {
        return positive.some((d) => d.state === "conditionally_approved")
          ? "conditionally_approved"
          : "approved";
      }
      return "pending";
    }

    // all_required (default)
    if (covered && required.length > 0) {
      return positive.some((d) => d.state === "conditionally_approved")
        ? "conditionally_approved"
        : "approved";
    }
    if (required.length === 0 && positive.length > 0) {
      return positive.some((d) => d.state === "conditionally_approved")
        ? "conditionally_approved"
        : "approved";
    }
    return "pending";
  }

  private refreshExplainability(bundleId: string): void {
    const bundle = this.getBundle(bundleId);
    const template = this.templates.get(bundle.templateId, bundle.templateVersion);
    const sod = evaluateSod({
      template,
      decisions: bundle.authorityDecisions,
      changeOwnerActorId: bundle.changeOwnerActorId,
      emergency: bundle.emergency,
      delegations: this.collectDelegations(bundle.authorityDecisions, template),
    });

    const outstanding = this.getOutstandingAuthorities(bundleId);
    const explain: ApprovalExplainability = {
      bundleId,
      requiredAuthorities: bundle.requiredAuthorities,
      authorityAssignments: bundle.requiredAuthorities.map((id) => {
        const auth = this.authorities.tryGet(id);
        return `${id}${auth ? ` (${auth.name})` : ""}`;
      }),
      decisions: bundle.authorityDecisions.map(
        (d) => `${d.authorityId}:${d.state} by ${d.actorId}`,
      ),
      comments: bundle.authorityDecisions
        .map((d) => d.comments)
        .filter((c): c is string => Boolean(c)),
      conditions: bundle.conditions,
      outstandingAuthorities: outstanding,
      delegatedApprovals: bundle.authorityDecisions
        .filter((d) => d.state === "delegated")
        .map(
          (d) =>
            `${d.authorityId} → ${d.delegatedToAuthorityId ?? "?"} by ${d.actorId}`,
        ),
      escalations: bundle.authorityDecisions
        .filter((d) => d.state === "escalated")
        .map(
          (d) =>
            `${d.authorityId} → ${d.escalatedToAuthorityId ?? "?"} by ${d.actorId}`,
        ),
      residualGovernanceState: bundle.finalStatus,
      sodFindings: sod.findings,
      reasons: [
        `Governance decision ref (opaque): ${bundle.governanceDecisionRef}`,
        `Template ${bundle.templateId}@${bundle.templateVersion}`,
        `Final status: ${bundle.finalStatus}`,
        ...sod.blocking.map((b) => `SoD blocking: ${b}`),
        "Platform does not evaluate policies, gates, or evidence",
      ],
    };
    this.explainability.set(bundleId, explain);
  }

  private emit(
    type: (typeof APPROVAL_EVENT_TYPES)[keyof typeof APPROVAL_EVENT_TYPES],
    correlationId: string,
    payload: Record<string, unknown>,
    tenantId?: string,
  ): void {
    void this.publishEvent({
      type,
      occurredAt: new Date().toISOString(),
      orchestrationId: this.orchestrationId,
      correlationId,
      tenantId,
      payload,
    });
  }
}

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values.map((v) => v.trim()).filter(Boolean))]);
}

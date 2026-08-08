/**
 * Enterprise Automation Coordination (QO-011).
 *
 * Answers: given the completed Decision Package, what automation coordination is required?
 * Never executes automation. Never invokes providers. Never re-evaluates decisions.
 */

import type {
  AutomationCoordinationDiagnostics,
  AutomationCoordinationPackage,
  AutomationIntent,
  AutomationIntentType,
  AutomationPriority,
  CoordinationAuditEntry,
  CoordinationStatus,
  CreateAutomationCoordinationInput,
  ExecutionConstraints,
  ProviderEligibility,
} from "../contracts/automation-coordination";
import { OrchestrationError } from "../contracts/errors";
import { AUTOMATION_COORDINATION_EVENT_TYPES } from "../contracts/events";
import type { QualityEventBackbone } from "../events/event-backbone";
import type { CapabilityRegistry } from "../registry/capability-registry";
import { defaultIntentsForProfile, mapOutstandingToIntents } from "./intent-mapper";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface AutomationCoordinatorOptions {
  readonly capabilities: CapabilityRegistry;
  readonly events: QualityEventBackbone;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function priorityFromConclusion(
  conclusion: string,
  residualRiskLevel?: string,
  explicit?: AutomationPriority,
): AutomationPriority {
  if (explicit) return explicit;
  if (conclusion === "CONDITIONAL_GO" || residualRiskLevel === "high") return "high";
  if (residualRiskLevel === "critical") return "critical";
  if (conclusion === "GO") return "normal";
  return "low";
}

function statusFromConclusion(conclusion: string): CoordinationStatus {
  switch (conclusion) {
    case "GO":
    case "CONDITIONAL_GO":
      return "coordinated";
    case "DEFERRED":
      return "deferred";
    case "SUPERSEDED":
      return "superseded";
    case "CANCELLED":
      return "cancelled";
    case "NO_GO":
    default:
      return "not_required";
  }
}

export class AutomationCoordinator {
  private readonly capabilities: CapabilityRegistry;
  private readonly events: QualityEventBackbone;
  private readonly orchestrationId: string;
  private readonly packages: DurableMap<AutomationCoordinationPackage>;
  private readonly intentDistribution: Record<string, number> = {};
  private readonly statusDistribution: Record<string, number> = {};
  private eventPublishCount = 0;
  private intentCount = 0;

  constructor(options: AutomationCoordinatorOptions) {
    this.capabilities = options.capabilities;
    this.events = options.events;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.packages = new DurableMap<AutomationCoordinationPackage>(
      "automation_coordination_package",
      options.documentStore,
      (pkg) => ({
        tenantId: pkg.tenantId,
        projectId: pkg.projectId,
        orchestrationId: this.orchestrationId,
        correlationId: pkg.decisionPackageRef,
        status: pkg.coordinationStatus,
        actorId: pkg.actorId,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.packages.hydrate();
  }

  /**
   * Create an immutable Automation Coordination Package from a Decision Package snapshot.
   * Publishes past-tense facts via the Event Backbone only.
   */
  async createCoordinationPackage(
    input: CreateAutomationCoordinationInput,
  ): Promise<AutomationCoordinationPackage> {
    const dp = input.decisionPackage;
    const decisionPackageRef = dp.decisionPackageId.trim();
    const qualityFlowRef = dp.qualityFlowRef.trim();
    const tenantId = dp.tenantId.trim();
    if (!decisionPackageRef || !qualityFlowRef || !tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_COORDINATION_PACKAGE",
        "decisionPackageId, qualityFlowRef, and tenantId are required",
      );
    }

    if (input.supersedesPackageId) {
      const prior = this.packages.get(input.supersedesPackageId);
      if (!prior) {
        throw new OrchestrationError(
          "validation",
          "COORDINATION_PACKAGE_NOT_FOUND",
          `Prior coordination package not found: ${input.supersedesPackageId}`,
          { coordinationPackageId: input.supersedesPackageId },
        );
      }
    }

    const conclusion = dp.platformConclusion.trim();
    const status = statusFromConclusion(conclusion);
    const priority = priorityFromConclusion(
      conclusion,
      dp.residualRiskLevel,
      input.priority,
    );

    const constraints: ExecutionConstraints = Object.freeze({
      maxParallelActivities: input.executionConstraints?.maxParallelActivities,
      requireDecisionGo: input.executionConstraints?.requireDecisionGo ?? true,
      allowConditionalGo: input.executionConstraints?.allowConditionalGo ?? true,
      timeoutHintMinutes: input.executionConstraints?.timeoutHintMinutes,
      environmentHint: input.executionConstraints?.environmentHint,
      metadata: Object.freeze({
        ...(input.executionConstraints?.metadata ?? {}),
      }),
    });

    let intentTypes: AutomationIntentType[] = [];
    if (status === "coordinated") {
      intentTypes = [
        ...mapOutstandingToIntents(
          dp.outstandingItems ?? [],
          input.additionalIntents ?? [],
        ),
      ];
      if (intentTypes.length === 0) {
        intentTypes = [...defaultIntentsForProfile(dp.decisionProfileId)];
      }
    } else if (input.additionalIntents?.length && status === "deferred") {
      // Deferred may record intended future intents without requiring execution
      intentTypes = [...input.additionalIntents];
    }

    const intents: AutomationIntent[] = intentTypes.map((intentType) => {
      const eligibility = this.resolveEligibility(intentType);
      const intentId = createId("aint");
      this.intentCount += 1;
      this.intentDistribution[intentType] =
        (this.intentDistribution[intentType] ?? 0) + 1;
      return Object.freeze({
        intentId,
        intentType,
        priority,
        rationale: `Mapped from Decision Package ${decisionPackageRef} conclusion ${conclusion}`,
        sourceActivityRefs: Object.freeze(
          (dp.outstandingItems ?? []).filter((i) =>
            i.toLowerCase().includes(intentType.split("_")[0] ?? ""),
          ),
        ),
        eligibility,
        metadata: Object.freeze({}),
      });
    });

    const providerEligibility = Object.freeze(intents.map((i) => i.eligibility));

    const coordinationPackageId = createId("acp");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;

    const auditHistory: CoordinationAuditEntry[] = [
      Object.freeze({
        entryId: createId("aca"),
        timestamp: now,
        action: "coordination_package_created",
        actorId,
        detail: `Status ${status}; ${intents.length} intent(s); conclusion ${conclusion}`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("aca"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const pkg: AutomationCoordinationPackage = Object.freeze({
      coordinationPackageId,
      decisionPackageRef,
      qualityFlowRef,
      requiredActivities: Object.freeze(intents),
      automationPriority: priority,
      executionConstraints: constraints,
      providerEligibility,
      coordinationStatus: status,
      platformConclusion: conclusion,
      createdAt: now,
      tenantId,
      projectId: dp.projectId?.trim() || undefined,
      actorId,
      supersedesPackageId: input.supersedesPackageId,
      auditHistory: Object.freeze(auditHistory),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      advisory: true as const,
      execution: false as const,
    });

    await this.packages.set(coordinationPackageId, pkg);
    this.statusDistribution[status] = (this.statusDistribution[status] ?? 0) + 1;

    const correlationId = decisionPackageRef;
    for (const intent of intents) {
      this.publishFact(AUTOMATION_COORDINATION_EVENT_TYPES.intentIdentified, {
        correlationId,
        causationId: decisionPackageRef,
        tenantId,
        projectId: pkg.projectId,
        subjectRef: intent.intentId,
        actorId,
        payload: {
          coordinationPackageId,
          intentType: intent.intentType,
          priority: intent.priority,
          eligibleCapabilityIds: intent.eligibility.eligibleCapabilityIds,
        },
      });
    }

    this.publishFact(AUTOMATION_COORDINATION_EVENT_TYPES.coordinationCreated, {
      correlationId,
      causationId: decisionPackageRef,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: coordinationPackageId,
      actorId,
      payload: {
        coordinationPackageId,
        decisionPackageRef,
        qualityFlowRef,
        status,
        intentCount: intents.length,
        supersedesPackageId: input.supersedesPackageId,
      },
    });

    if (input.supersedesPackageId) {
      this.publishFact(AUTOMATION_COORDINATION_EVENT_TYPES.coordinationUpdated, {
        correlationId,
        causationId: input.supersedesPackageId,
        tenantId,
        projectId: pkg.projectId,
        subjectRef: coordinationPackageId,
        actorId,
        payload: {
          coordinationPackageId,
          supersedesPackageId: input.supersedesPackageId,
        },
      });
    }

    this.publishFact(AUTOMATION_COORDINATION_EVENT_TYPES.coordinationCompleted, {
      correlationId,
      causationId: coordinationPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: coordinationPackageId,
      actorId,
      payload: {
        coordinationPackageId,
        status,
        note: "Automation coordination completed — execution remains external",
      },
    });

    return pkg;
  }

  getCoordinationPackage(coordinationPackageId: string): AutomationCoordinationPackage {
    const pkg = this.packages.get(coordinationPackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "COORDINATION_PACKAGE_NOT_FOUND",
        `Coordination package not found: ${coordinationPackageId}`,
        { coordinationPackageId },
      );
    }
    return pkg;
  }

  queryAutomationIntent(coordinationPackageId: string): readonly AutomationIntent[] {
    return this.getCoordinationPackage(coordinationPackageId).requiredActivities;
  }

  getCoordinationHistory(
    coordinationPackageId: string,
  ): readonly CoordinationAuditEntry[] {
    return this.getCoordinationPackage(coordinationPackageId).auditHistory;
  }

  getCoordinationStatus(coordinationPackageId: string): CoordinationStatus {
    return this.getCoordinationPackage(coordinationPackageId).coordinationStatus;
  }

  listCoordinationPackages(): readonly AutomationCoordinationPackage[] {
    return [...this.packages.values()];
  }

  diagnostics(): AutomationCoordinationDiagnostics {
    return {
      packageCount: this.packages.size,
      intentCount: this.intentCount,
      intentDistribution: { ...this.intentDistribution },
      activityDistribution: { ...this.intentDistribution },
      statusDistribution: { ...this.statusDistribution },
      eventPublishCount: this.eventPublishCount,
      health: "healthy",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  /** Logical eligibility from Capability Registry — never product-specific. */
  private resolveEligibility(intentType: AutomationIntentType): ProviderEligibility {
    const candidates = this.capabilities.listByQualityFlowStage(
      "capability_coordination",
    );
    const eligible = candidates.filter((cap) => {
      if (cap.lifecycle !== "active" && cap.lifecycle !== "registered") {
        return false;
      }
      const label = cap.labels?.automationIntent?.trim();
      if (!label) return true; // stage participation is sufficient
      return label === intentType || label === "*";
    });

    return Object.freeze({
      intentType,
      eligibleCapabilityIds: Object.freeze(eligible.map((c) => c.capabilityId)),
      note:
        eligible.length === 0
          ? "No catalogue capabilities currently eligible for this intent (logical)"
          : `${eligible.length} catalogue capability(ies) eligible (logical; not invoked)`,
    });
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
      producer: "orchestration.automation_coordination",
      subjectRef: args.subjectRef,
      actorId: args.actorId,
      payload: {
        ...args.payload,
        orchestrationId: this.orchestrationId,
      },
      metadata: { slice: "QO-011" },
    });
    this.eventPublishCount += 1;
  }
}

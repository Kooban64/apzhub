/**
 * Immutable Event Registry (QO-010).
 */

import { OrchestrationError } from "../contracts/errors";
import type {
  EventTypeDefinition,
  EventTypeDefinitionInput,
} from "../contracts/event-backbone";
import {
  APPROVAL_EVENT_TYPES,
  AUTOMATION_COORDINATION_EVENT_TYPES,
  DECISION_EVENT_TYPES,
  SOURCE_CHANGE_EVENT_TYPES,
  ENRICHMENT_EVENT_TYPES,
  EVIDENCE_INTEGRATION_EVENT_TYPES,
  EXECUTIVE_EXPERIENCE_EVENT_TYPES,
  OPERATIONAL_EVENT_TYPES,
  WORKSPACE_EVENT_TYPES,
  GOVERNANCE_EVENT_TYPES,
  IMPACT_CORRELATION_EVENT_TYPES,
  ORCHESTRATION_KERNEL_EVENT_TYPES,
  POLICY_SELECTION_EVENT_TYPES,
  QUALITY_FLOW_EVENT_TYPES,
  TRIGGER_EVENT_TYPES,
} from "../contracts/events";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as object)) {
      deepFreeze(child);
    }
  }
  return value;
}

/** Past-tense fact types already emitted by QO-001…QO-009 (integration contracts). */
const PLATFORM_BUILTIN_EVENTS: readonly EventTypeDefinitionInput[] = [
  {
    eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelCreated,
    version: "1.0.0",
    description: "Orchestration kernel created",
    producer: "orchestration.kernel",
    consumers: ["event.backbone", "diagnostics"],
    schemaRef: "schema://orchestration.kernel.created/1.0.0",
    documentationRef: "docs://events/kernel.created",
  },
  {
    eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelReady,
    version: "1.0.0",
    description: "Orchestration kernel ready",
    producer: "orchestration.kernel",
    consumers: ["event.backbone", "diagnostics"],
    schemaRef: "schema://orchestration.kernel.ready/1.0.0",
    documentationRef: "docs://events/kernel.ready",
  },
  {
    eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelPaused,
    version: "1.0.0",
    description: "Orchestration kernel paused",
    producer: "orchestration.kernel",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.kernel.paused/1.0.0",
    documentationRef: "docs://events/kernel.paused",
  },
  {
    eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelStopped,
    version: "1.0.0",
    description: "Orchestration kernel stopped",
    producer: "orchestration.kernel",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.kernel.stopped/1.0.0",
    documentationRef: "docs://events/kernel.stopped",
  },
  {
    eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelFailed,
    version: "1.0.0",
    description: "Orchestration kernel failed",
    producer: "orchestration.kernel",
    consumers: ["event.backbone", "diagnostics"],
    schemaRef: "schema://orchestration.kernel.failed/1.0.0",
    documentationRef: "docs://events/kernel.failed",
  },
  {
    eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.capabilityRegistered,
    version: "1.0.0",
    description: "Capability catalogue entry registered",
    producer: "orchestration.kernel",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.capability.registered/1.0.0",
    documentationRef: "docs://events/capability.registered",
  },
  {
    eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.contractRegistered,
    version: "1.0.0",
    description: "Contract descriptor registered",
    producer: "orchestration.kernel",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.contract.registered/1.0.0",
    documentationRef: "docs://events/contract.registered",
  },
  {
    eventType: TRIGGER_EVENT_TYPES.received,
    version: "1.0.0",
    description: "Normalized trigger received",
    producer: "orchestration.trigger",
    consumers: ["event.backbone", "quality.flow"],
    schemaRef: "schema://orchestration.trigger.received/1.0.0",
    documentationRef: "docs://events/trigger.received",
  },
  {
    eventType: TRIGGER_EVENT_TYPES.ignored,
    version: "1.0.0",
    description: "Normalized trigger ignored",
    producer: "orchestration.trigger",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.trigger.ignored/1.0.0",
    documentationRef: "docs://events/trigger.ignored",
  },
  {
    eventType: TRIGGER_EVENT_TYPES.routed,
    version: "1.0.0",
    description: "Normalized trigger routed",
    producer: "orchestration.trigger",
    consumers: ["event.backbone", "quality.flow"],
    schemaRef: "schema://orchestration.trigger.routed/1.0.0",
    documentationRef: "docs://events/trigger.routed",
  },
  {
    eventType: TRIGGER_EVENT_TYPES.rejected,
    version: "1.0.0",
    description: "Normalized trigger rejected",
    producer: "orchestration.trigger",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.trigger.rejected/1.0.0",
    documentationRef: "docs://events/trigger.rejected",
  },
  {
    eventType: QUALITY_FLOW_EVENT_TYPES.definitionRegistered,
    version: "1.0.0",
    description: "Quality Flow definition registered",
    producer: "orchestration.quality_flow",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.quality_flow.definition_registered/1.0.0",
    documentationRef: "docs://events/quality-flow.definition-registered",
  },
  {
    eventType: QUALITY_FLOW_EVENT_TYPES.definitionVersioned,
    version: "1.0.0",
    description: "Quality Flow definition versioned",
    producer: "orchestration.quality_flow",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.quality_flow.definition_versioned/1.0.0",
    documentationRef: "docs://events/quality-flow.definition-versioned",
  },
  {
    eventType: QUALITY_FLOW_EVENT_TYPES.instanceCreated,
    version: "1.0.0",
    description: "Quality Flow instance created (started)",
    producer: "orchestration.quality_flow",
    consumers: ["event.backbone", "impact", "policy", "governance"],
    schemaRef: "schema://orchestration.quality_flow.instance_created/1.0.0",
    documentationRef: "docs://events/quality-flow.started",
  },
  {
    eventType: QUALITY_FLOW_EVENT_TYPES.stateTransitioned,
    version: "1.0.0",
    description: "Quality Flow state transitioned",
    producer: "orchestration.quality_flow",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.quality_flow.state_transitioned/1.0.0",
    documentationRef: "docs://events/quality-flow.state-transitioned",
  },
  {
    eventType: QUALITY_FLOW_EVENT_TYPES.instancePaused,
    version: "1.0.0",
    description: "Quality Flow instance paused",
    producer: "orchestration.quality_flow",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.quality_flow.instance_paused/1.0.0",
    documentationRef: "docs://events/quality-flow.paused",
  },
  {
    eventType: QUALITY_FLOW_EVENT_TYPES.instanceResumed,
    version: "1.0.0",
    description: "Quality Flow instance resumed",
    producer: "orchestration.quality_flow",
    consumers: ["event.backbone"],
    schemaRef: "schema://orchestration.quality_flow.instance_resumed/1.0.0",
    documentationRef: "docs://events/quality-flow.resumed",
  },
  {
    eventType: IMPACT_CORRELATION_EVENT_TYPES.created,
    version: "1.0.0",
    description: "Impact correlation completed",
    producer: "orchestration.impact",
    consumers: ["event.backbone", "policy"],
    schemaRef: "schema://orchestration.impact_correlation.created/1.0.0",
    documentationRef: "docs://events/impact.correlation.completed",
  },
  {
    eventType: POLICY_SELECTION_EVENT_TYPES.decisionProduced,
    version: "1.0.0",
    description: "Policy selection completed",
    producer: "orchestration.policy",
    consumers: ["event.backbone", "governance"],
    schemaRef: "schema://orchestration.policy_selection.decision_produced/1.0.0",
    documentationRef: "docs://events/policy.selection.completed",
  },
  {
    eventType: GOVERNANCE_EVENT_TYPES.decisionProduced,
    version: "1.0.0",
    description: "Governance evaluation completed",
    producer: "orchestration.governance",
    consumers: ["event.backbone", "approval"],
    schemaRef: "schema://orchestration.governance.decision_produced/1.0.0",
    documentationRef: "docs://events/governance.evaluation.completed",
  },
  {
    eventType: APPROVAL_EVENT_TYPES.bundleCreated,
    version: "1.0.0",
    description: "Approval bundle created",
    producer: "orchestration.approval",
    consumers: ["event.backbone", "decision"],
    schemaRef: "schema://orchestration.approval.bundle_created/1.0.0",
    documentationRef: "docs://events/approval.bundle.created",
  },
  {
    eventType: APPROVAL_EVENT_TYPES.decisionSubmitted,
    version: "1.0.0",
    description: "Approval decision submitted (bundle may complete)",
    producer: "orchestration.approval",
    consumers: ["event.backbone", "decision"],
    schemaRef: "schema://orchestration.approval.decision_submitted/1.0.0",
    documentationRef: "docs://events/approval.bundle.completed",
  },
  {
    eventType: DECISION_EVENT_TYPES.packageCreated,
    version: "1.0.0",
    description: "Decision package created",
    producer: "orchestration.decision",
    consumers: [
      "event.backbone",
      "automation.future",
      "scm.future",
      "dashboard.future",
    ],
    schemaRef: "schema://orchestration.decision.package_created/1.0.0",
    documentationRef: "docs://events/decision.package.created",
  },
  {
    eventType: AUTOMATION_COORDINATION_EVENT_TYPES.coordinationCreated,
    version: "1.0.0",
    description: "Automation coordination package created",
    producer: "orchestration.automation_coordination",
    consumers: ["event.backbone", "automation.platform.future"],
    schemaRef: "schema://automation.coordination.created/1.0.0",
    documentationRef: "docs://events/automation.coordination.created",
  },
  {
    eventType: AUTOMATION_COORDINATION_EVENT_TYPES.coordinationUpdated,
    version: "1.0.0",
    description: "Automation coordination superseded by a new package",
    producer: "orchestration.automation_coordination",
    consumers: ["event.backbone", "automation.platform.future"],
    schemaRef: "schema://automation.coordination.updated/1.0.0",
    documentationRef: "docs://events/automation.coordination.updated",
  },
  {
    eventType: AUTOMATION_COORDINATION_EVENT_TYPES.coordinationCompleted,
    version: "1.0.0",
    description: "Automation coordination completed (not execution)",
    producer: "orchestration.automation_coordination",
    consumers: ["event.backbone", "automation.platform.future"],
    schemaRef: "schema://automation.coordination.completed/1.0.0",
    documentationRef: "docs://events/automation.coordination.completed",
  },
  {
    eventType: AUTOMATION_COORDINATION_EVENT_TYPES.intentIdentified,
    version: "1.0.0",
    description: "Automation intent identified",
    producer: "orchestration.automation_coordination",
    consumers: ["event.backbone", "automation.platform.future"],
    schemaRef: "schema://automation.intent.identified/1.0.0",
    documentationRef: "docs://events/automation.intent.identified",
  },
  {
    eventType: SOURCE_CHANGE_EVENT_TYPES.changeAssociated,
    version: "1.0.0",
    description: "Normalized source change associated with a Quality Flow",
    producer: "orchestration.source_change",
    consumers: ["event.backbone", "scm.platform.future"],
    schemaRef: "schema://source.change.associated/1.0.0",
    documentationRef: "docs://events/source.change.associated",
  },
  {
    eventType: SOURCE_CHANGE_EVENT_TYPES.packageCreated,
    version: "1.0.0",
    description: "Source Change Package created",
    producer: "orchestration.source_change",
    consumers: ["event.backbone", "scm.platform.future"],
    schemaRef: "schema://source.package.created/1.0.0",
    documentationRef: "docs://events/source.package.created",
  },
  {
    eventType: SOURCE_CHANGE_EVENT_TYPES.packageUpdated,
    version: "1.0.0",
    description: "Source Change Package superseded by a new package",
    producer: "orchestration.source_change",
    consumers: ["event.backbone", "scm.platform.future"],
    schemaRef: "schema://source.package.updated/1.0.0",
    documentationRef: "docs://events/source.package.updated",
  },
  {
    eventType: SOURCE_CHANGE_EVENT_TYPES.identityNormalized,
    version: "1.0.0",
    description: "Source identity normalized",
    producer: "orchestration.source_change",
    consumers: ["event.backbone", "scm.platform.future"],
    schemaRef: "schema://source.identity.normalized/1.0.0",
    documentationRef: "docs://events/source.identity.normalized",
  },
  {
    eventType: ENRICHMENT_EVENT_TYPES.enrichmentCreated,
    version: "1.0.0",
    description: "Quality intelligence enrichment created",
    producer: "orchestration.enrichment",
    consumers: ["event.backbone", "qi.platform.future"],
    schemaRef: "schema://quality.enrichment.created/1.0.0",
    documentationRef: "docs://events/quality.enrichment.created",
  },
  {
    eventType: ENRICHMENT_EVENT_TYPES.enrichmentCompleted,
    version: "1.0.0",
    description: "Quality intelligence enrichment completed",
    producer: "orchestration.enrichment",
    consumers: ["event.backbone", "qi.platform.future"],
    schemaRef: "schema://quality.enrichment.completed/1.0.0",
    documentationRef: "docs://events/quality.enrichment.completed",
  },
  {
    eventType: ENRICHMENT_EVENT_TYPES.insightAttached,
    version: "1.0.0",
    description: "Advisory insight attached to enrichment package",
    producer: "orchestration.enrichment",
    consumers: ["event.backbone", "qi.platform.future"],
    schemaRef: "schema://advisory.insight.attached/1.0.0",
    documentationRef: "docs://events/advisory.insight.attached",
  },
  {
    eventType: ENRICHMENT_EVENT_TYPES.packageCreated,
    version: "1.0.0",
    description: "Enrichment package created",
    producer: "orchestration.enrichment",
    consumers: ["event.backbone", "qi.platform.future"],
    schemaRef: "schema://enrichment.package.created/1.0.0",
    documentationRef: "docs://events/enrichment.package.created",
  },
  {
    eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.integrationCreated,
    version: "1.0.0",
    description: "Evidence Integration Package created",
    producer: "orchestration.evidence_integration",
    consumers: ["event.backbone", "evidence.platform.future"],
    schemaRef: "schema://evidence.integration.created/1.0.0",
    documentationRef: "docs://events/evidence.integration.created",
  },
  {
    eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.packageCompleted,
    version: "1.0.0",
    description: "Evidence Integration Package completed",
    producer: "orchestration.evidence_integration",
    consumers: ["event.backbone", "evidence.platform.future"],
    schemaRef: "schema://evidence.package.completed/1.0.0",
    documentationRef: "docs://events/evidence.package.completed",
  },
  {
    eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.reportGenerated,
    version: "1.0.0",
    description: "Declarative report view generated over evidence references",
    producer: "orchestration.evidence_integration",
    consumers: ["event.backbone", "evidence.platform.future"],
    schemaRef: "schema://report.generated/1.0.0",
    documentationRef: "docs://events/report.generated",
  },
  {
    eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.profileApplied,
    version: "1.0.0",
    description: "Report profile applied during report assembly",
    producer: "orchestration.evidence_integration",
    consumers: ["event.backbone", "evidence.platform.future"],
    schemaRef: "schema://report.profile.applied/1.0.0",
    documentationRef: "docs://events/report.profile.applied",
  },
  {
    eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.experienceCreated,
    version: "1.0.0",
    description: "Executive Experience Package created",
    producer: "orchestration.executive_experience",
    consumers: ["event.backbone", "dashboard.platform.future"],
    schemaRef: "schema://executive.experience.created/1.0.0",
    documentationRef: "docs://events/executive.experience.created",
  },
  {
    eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.packageCompleted,
    version: "1.0.0",
    description: "Executive Experience Package completed",
    producer: "orchestration.executive_experience",
    consumers: ["event.backbone", "dashboard.platform.future"],
    schemaRef: "schema://executive.package.completed/1.0.0",
    documentationRef: "docs://events/executive.package.completed",
  },
  {
    eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.personaApplied,
    version: "1.0.0",
    description: "Executive persona applied to experience projection",
    producer: "orchestration.executive_experience",
    consumers: ["event.backbone", "dashboard.platform.future"],
    schemaRef: "schema://executive.persona.applied/1.0.0",
    documentationRef: "docs://events/executive.persona.applied",
  },
  {
    eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.projectionUpdated,
    version: "1.0.0",
    description: "Executive projection superseded by a new package",
    producer: "orchestration.executive_experience",
    consumers: ["event.backbone", "dashboard.platform.future"],
    schemaRef: "schema://executive.projection.updated/1.0.0",
    documentationRef: "docs://events/executive.projection.updated",
  },
  {
    eventType: OPERATIONAL_EVENT_TYPES.readinessCreated,
    version: "1.0.0",
    description: "Operational Readiness Package created",
    producer: "orchestration.operational",
    consumers: ["event.backbone", "ops.platform.future"],
    schemaRef: "schema://operational.readiness.created/1.0.0",
    documentationRef: "docs://events/operational.readiness.created",
  },
  {
    eventType: OPERATIONAL_EVENT_TYPES.healthContractUpdated,
    version: "1.0.0",
    description: "Descriptive health contract updated",
    producer: "orchestration.operational",
    consumers: ["event.backbone", "ops.platform.future"],
    schemaRef: "schema://health.contract.updated/1.0.0",
    documentationRef: "docs://events/health.contract.updated",
  },
  {
    eventType: OPERATIONAL_EVENT_TYPES.readinessContractPublished,
    version: "1.0.0",
    description: "Descriptive readiness contract published",
    producer: "orchestration.operational",
    consumers: ["event.backbone", "ops.platform.future"],
    schemaRef: "schema://readiness.contract.published/1.0.0",
    documentationRef: "docs://events/readiness.contract.published",
  },
  {
    eventType: OPERATIONAL_EVENT_TYPES.packageCompleted,
    version: "1.0.0",
    description: "Operational Readiness Package completed",
    producer: "orchestration.operational",
    consumers: ["event.backbone", "ops.platform.future"],
    schemaRef: "schema://operational.package.completed/1.0.0",
    documentationRef: "docs://events/operational.package.completed",
  },
  {
    eventType: WORKSPACE_EVENT_TYPES.experienceCreated,
    version: "1.0.0",
    description: "Workspace Experience Package created",
    producer: "orchestration.workspace_experience",
    consumers: ["event.backbone", "shell.platform.future"],
    schemaRef: "schema://workspace.experience.created/1.0.0",
    documentationRef: "docs://events/workspace.experience.created",
  },
  {
    eventType: WORKSPACE_EVENT_TYPES.packageCompleted,
    version: "1.0.0",
    description: "Workspace Experience Package completed",
    producer: "orchestration.workspace_experience",
    consumers: ["event.backbone", "shell.platform.future"],
    schemaRef: "schema://workspace.package.completed/1.0.0",
    documentationRef: "docs://events/workspace.package.completed",
  },
  {
    eventType: WORKSPACE_EVENT_TYPES.layoutUpdated,
    version: "1.0.0",
    description: "Workspace layout composition superseded by a new package",
    producer: "orchestration.workspace_experience",
    consumers: ["event.backbone", "shell.platform.future"],
    schemaRef: "schema://workspace.layout.updated/1.0.0",
    documentationRef: "docs://events/workspace.layout.updated",
  },
  {
    eventType: WORKSPACE_EVENT_TYPES.navigationComposed,
    version: "1.0.0",
    description: "Workspace navigation composed from authoritative refs",
    producer: "orchestration.workspace_experience",
    consumers: ["event.backbone", "shell.platform.future"],
    schemaRef: "schema://workspace.navigation.composed/1.0.0",
    documentationRef: "docs://events/workspace.navigation.composed",
  },
];

export class EventTypeRegistry {
  private readonly definitions = new Map<string, EventTypeDefinition>();

  private key(eventType: string, version: string): string {
    return `${eventType}@${version}`;
  }

  register(input: EventTypeDefinitionInput): EventTypeDefinition {
    const eventType = input.eventType.trim();
    const version = input.version.trim();
    const description = input.description.trim();
    const producer = input.producer.trim();
    const schemaRef = input.schemaRef.trim();
    const documentationRef = input.documentationRef.trim();
    if (
      !eventType ||
      !version ||
      !description ||
      !producer ||
      !schemaRef ||
      !documentationRef
    ) {
      throw new OrchestrationError(
        "validation",
        "INVALID_EVENT_DEFINITION",
        "eventType, version, description, producer, schemaRef, and documentationRef are required",
      );
    }
    const key = this.key(eventType, version);
    if (this.definitions.has(key)) {
      throw new OrchestrationError(
        "validation",
        "EVENT_DEFINITION_EXISTS",
        `Event definition already registered: ${key}`,
        { eventType, version },
      );
    }
    const def: EventTypeDefinition = deepFreeze({
      eventType,
      version,
      description,
      producer,
      consumers: Object.freeze([...(input.consumers ?? [])]),
      schemaRef,
      documentationRef,
      routingDefault: input.routingDefault ?? "broadcast",
      replayEligibleDefault: input.replayEligibleDefault ?? true,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.definitions.set(key, def);
    return def;
  }

  get(eventType: string, version?: string): EventTypeDefinition {
    const type = eventType.trim();
    if (version) {
      const found = this.definitions.get(this.key(type, version.trim()));
      if (!found) {
        throw new OrchestrationError(
          "validation",
          "EVENT_DEFINITION_NOT_FOUND",
          `Event definition not found: ${type}@${version}`,
          { eventType: type, version },
        );
      }
      return found;
    }
    const matches = [...this.definitions.values()]
      .filter((d) => d.eventType === type)
      .sort((a, b) => b.version.localeCompare(a.version));
    if (!matches.length) {
      throw new OrchestrationError(
        "validation",
        "EVENT_DEFINITION_NOT_FOUND",
        `Event definition not found: ${type}`,
        { eventType: type },
      );
    }
    return matches[0]!;
  }

  has(eventType: string, version?: string): boolean {
    try {
      this.get(eventType, version);
      return true;
    } catch {
      return false;
    }
  }

  listTypes(): readonly string[] {
    return [...new Set([...this.definitions.values()].map((d) => d.eventType))].sort();
  }

  listVersions(eventType: string): readonly EventTypeDefinition[] {
    return [...this.definitions.values()]
      .filter((d) => d.eventType === eventType.trim())
      .sort((a, b) => a.version.localeCompare(b.version));
  }

  list(): readonly EventTypeDefinition[] {
    return [...this.definitions.values()];
  }

  count(): number {
    return this.definitions.size;
  }

  /** Register platform built-in past-tense event contracts (idempotent). */
  registerBuiltIns(): void {
    for (const def of PLATFORM_BUILTIN_EVENTS) {
      const key = this.key(def.eventType, def.version);
      if (!this.definitions.has(key)) {
        this.register(def);
      }
    }
  }
}

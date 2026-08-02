import type { ProjectionDefinition } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export type ProjectionRegistry = {
  register(definition: ProjectionDefinition): void;
  get(projectionId: string): ProjectionDefinition | undefined;
  list(): readonly ProjectionDefinition[];
  forEventType(eventType: string): readonly ProjectionDefinition[];
};

export function createProjectionRegistry(
  seed: readonly ProjectionDefinition[] = [],
): ProjectionRegistry {
  const byId = new Map<string, ProjectionDefinition>();
  for (const d of seed) byId.set(d.projectionId, d);

  return {
    register(definition) {
      if (byId.has(definition.projectionId)) {
        throw new Error(`Projection already registered: ${definition.projectionId}`);
      }
      byId.set(definition.projectionId, definition);
    },
    get(projectionId) {
      return byId.get(projectionId);
    },
    list() {
      return [...byId.values()];
    },
    forEventType(eventType) {
      return [...byId.values()].filter((d) => d.eventTypes.includes(eventType));
    },
  };
}

export const EVIDENCE_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.evidence.v1",
  entityKind: "evidence",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description: "Evidence Quality Knowledge Index projection",
  eventTypes: [
    "qep.evidence.created",
    "qep.evidence.updated",
    "qep.evidence.lifecycle_changed",
    "qep.evidence.integrity_established",
    "qep.evidence.integrity_verified",
    "qep.evidence.archived",
    "qep.evidence.superseded",
    "qep.evidence.deleted",
  ],
};

export const SUITE_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.suite.v1",
  entityKind: "suite",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description: "Enterprise Test Suite Knowledge Index projection (APZQEP-140-A)",
  eventTypes: [
    "qep.suite.created",
    "qep.suite.updated",
    "qep.suite.published",
    "qep.suite.archived",
    "qep.suite.versioned",
    "qep.suite.deleted",
    "qep.suite.restored",
    "qep.suite.retired",
    "qep.suite.lifecycle_changed",
  ],
};

export const EXECUTION_PLAN_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.execution_plan.v1",
  entityKind: "run",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description:
    "Enterprise Test Execution Planning Knowledge Index projection (APZQEP-140-B)",
  eventTypes: [
    "qep.execution-plan.created",
    "qep.execution-plan.updated",
    "qep.execution-plan.submitted-for-review",
    "qep.execution-plan.approved",
    "qep.execution-plan.readiness-evaluated",
    "qep.execution-plan.ready",
    "qep.execution-plan.scheduled",
    "qep.execution-plan.handed-off",
    "qep.execution-plan.cancelled",
    "qep.execution-plan.archived",
  ],
};

export const EXECUTION_SESSION_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.execution.v1",
  entityKind: "execution",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description:
    "Enterprise Test Execution Workspace Knowledge Index projection (APZQEP-140-C)",
  eventTypes: [
    "qep.execution.created",
    "qep.execution.started",
    "qep.execution.paused",
    "qep.execution.resumed",
    "qep.execution.blocked",
    "qep.execution.completed",
    "qep.execution.cancelled",
    "qep.execution.result_recorded",
    "qep.execution.evidence_attached",
    "qep.execution.progress_updated",
    "qep.execution.archived",
    "qep.execution.amended",
  ],
};

export const DEFECT_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.defect.v1",
  entityKind: "defect",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description: "Enterprise Defect Management Knowledge Index projection (APZQEP-140-D)",
  eventTypes: [
    "qep.defect.created",
    "qep.defect.updated",
    "qep.defect.assigned",
    "qep.defect.fixed",
    "qep.defect.verified",
    "qep.defect.closed",
    "qep.defect.reopened",
    "qep.defect.status_changed",
  ],
};

export const REQUIREMENT_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.requirement.v1",
  entityKind: "requirement",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description:
    "Enterprise Requirements & Traceability Knowledge Index projection (APZQEP-140-E)",
  eventTypes: [
    "qep.requirement.created",
    "qep.requirement.updated",
    "qep.requirement.approved",
    "qep.requirement.linked",
    "qep.requirement.coverage_updated",
    "qep.requirement.traceability_changed",
    "qep.requirement.status_changed",
  ],
};

export const DOCUMENT_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.document.v1",
  entityKind: "document",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description:
    "Enterprise Reporting document projection — saved reports metadata (APZQEP-140-F)",
  eventTypes: [
    "qep.reporting.saved_report_created",
    "qep.reporting.saved_report_updated",
  ],
};

/**
 * Orchestration document SoR port — QX-PR-05.
 * Persists SYSTEM-OF-RECORD-CATALOGUE artefacts as typed documents.
 */

export type OrchestrationArtefactKind =
  | "flow_definition"
  | "flow_instance"
  | "impact_correlation"
  | "impact_asset"
  | "impact_relationship"
  | "selection_decision"
  | "governance_decision"
  | "approval_bundle"
  | "decision_package"
  | "quality_event"
  | "automation_coordination_package"
  | "source_change_package"
  | "evidence_integration_package"
  | "operational_readiness_package"
  | "workspace_experience_package"
  | "enrichment_package"
  | "executive_experience_package"
  | "report_view"
  | "policy"
  | "gate_definition"
  | "approval_template"
  | "decision_profile"
  | "trigger_binding";

export interface OrchestrationDocument {
  readonly id: string;
  readonly artefactKind: OrchestrationArtefactKind;
  readonly artefactKey: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly orchestrationId: string;
  readonly correlationId?: string;
  readonly status?: string;
  readonly payload: Record<string, unknown>;
  readonly revision: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface UpsertOrchestrationDocumentInput {
  readonly artefactKind: OrchestrationArtefactKind;
  readonly artefactKey: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly orchestrationId?: string;
  readonly correlationId?: string;
  readonly status?: string;
  readonly payload: Record<string, unknown>;
  readonly actorId?: string;
}

export interface OrchestrationDocumentStore {
  upsert(input: UpsertOrchestrationDocumentInput): Promise<OrchestrationDocument>;
  get(
    artefactKind: OrchestrationArtefactKind,
    artefactKey: string,
  ): Promise<OrchestrationDocument | undefined>;
  listByKind(
    artefactKind: OrchestrationArtefactKind,
    tenantId?: string,
  ): Promise<readonly OrchestrationDocument[]>;
  delete(artefactKind: OrchestrationArtefactKind, artefactKey: string): Promise<void>;
}

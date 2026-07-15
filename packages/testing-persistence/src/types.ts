/** Repository execution context for APZ TCMS persistence. */

export interface RepositoryContext {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly actorUserId: string;
  readonly permissions: readonly string[];
  readonly correlationId?: string;
}

/** Shared persistence metadata layered on domain fields. */
export interface PersistenceMeta {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly revision: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly archivedAt?: string;
}

export type AggregateKind =
  | "requirement"
  | "work_item"
  | "risk"
  | "test_plan"
  | "test_suite"
  | "test_case"
  | "test_step"
  | "test_case_version"
  | "test_plan_version"
  | "test_suite_version"
  | "regression_set"
  | "execution_session"
  | "execution_history"
  | "manual_execution"
  | "manual_step_actual"
  | "evidence"
  | "approval"
  | "approval_history"
  | "certification_record"
  | "certification_gate_definition"
  | "certification_gate_evaluation"
  | "certification_rule"
  | "certification_audit"
  | "certification_history"
  | "release_readiness"
  | "release"
  | "release_scope"
  | "release_package"
  | "release_candidate"
  | "release_approval"
  | "release_decision"
  | "release_evidence"
  | "release_dependency"
  | "release_note"
  | "release_risk_assessment"
  | "release_readiness_snapshot"
  | "release_audit_entry"
  | "release_summary_snapshot"
  | "coverage_record"
  | "defect_link"
  | "quality_snapshot"
  | "regression_analysis"
  | "automation_definition"
  | "automation_import"
  | "automated_execution"
  | "automation_run"
  | "automation_result_item"
  | "automation_import_history"
  | "automation_coverage_snapshot"
  | "pipeline"
  | "pipeline_import"
  | "pipeline_run"
  | "pipeline_import_history"
  | "engineering_snapshot"
  | "engineering_historical_snapshot"
  | "engineering_trend_series"
  | "engineering_benchmark"
  | "engineering_baseline"
  | "engineering_quality_summary"
  | "report_template"
  | "report_generation_metadata"
  | "traceability_link"
  | "audit_record"
  | "configuration"
  | "registry_entry";

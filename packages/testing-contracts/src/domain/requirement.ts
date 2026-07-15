import type { AuditFields } from "./audit";
import type {
  EpicRefId,
  FeatureRefId,
  RequirementId,
  RiskId,
  StoryRefId,
  TaskRefId,
} from "../identifiers";
import type {
  BusinessCriticality,
  Impact,
  Likelihood,
  Priority,
  RegressionImportance,
  RiskLevel,
  Severity,
  WorkItemRefKind,
} from "../enums";

/** Soft reference to a Projects work item — never an authoritative copy. */
export interface WorkItemRef {
  readonly kind: WorkItemRefKind;
  readonly projectRefId: string;
  readonly workItemId: FeatureRefId | EpicRefId | StoryRefId | TaskRefId;
  readonly label?: string;
}

export interface Requirement extends AuditFields {
  readonly id: RequirementId;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly priority: Priority;
  readonly workItemRefs: readonly WorkItemRef[];
  readonly riskIds: readonly RiskId[];
  readonly tags?: readonly string[];
  readonly ownerId?: string;
}

export interface Risk extends AuditFields {
  readonly id: RiskId;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly level: RiskLevel;
  readonly requirementIds: readonly RequirementId[];
  readonly mitigationSummary?: string;
  readonly severity?: Severity;
  readonly likelihood?: Likelihood;
  readonly impact?: Impact;
  readonly businessCriticality?: BusinessCriticality;
  readonly regressionImportance?: RegressionImportance;
  readonly ownerId?: string;
}

/**
 * APZHUB Platform Workflow domain models (APZWORKFLOW-001).
 * Engine-neutral metadata only — no execution state, no n8n node types.
 */

import type { AuditFields } from "../common/audit";
import type {
  WorkflowLifecycleState,
  WorkflowNodeKind,
  WorkflowValidationIssueCode,
  WorkflowValueType,
  WorkflowVersionStatus,
} from "../enums/catalogue";
import type {
  WorkflowActionId,
  WorkflowAuditId,
  WorkflowCategoryId,
  WorkflowConditionId,
  WorkflowConnectionId,
  WorkflowFolderId,
  WorkflowId,
  WorkflowMetadataId,
  WorkflowParameterId,
  WorkflowTemplateId,
  WorkflowTriggerId,
  WorkflowVariableId,
  WorkflowVersionId,
} from "../identifiers";

/** Allowlisted config scalar — strings, numbers, booleans only. */
export type WorkflowConfigValue = string | number | boolean;

/** Engine-neutral typed config map (never vendor node schemas). */
export type WorkflowConfig = Readonly<Record<string, WorkflowConfigValue>>;

export type WorkflowTrigger = {
  readonly id: WorkflowTriggerId;
  readonly kind: string;
  readonly label?: string;
  readonly config: WorkflowConfig;
};

export type WorkflowAction = {
  readonly id: WorkflowActionId;
  readonly kind: string;
  readonly label?: string;
  readonly config: WorkflowConfig;
};

export type WorkflowCondition = {
  readonly id: WorkflowConditionId;
  readonly kind: string;
  readonly label?: string;
  readonly config: WorkflowConfig;
};

export type WorkflowConnection = {
  readonly id: WorkflowConnectionId;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly label?: string;
  readonly config?: WorkflowConfig;
};

/** Structured JSON-safe graph node (metadata only). */
export type WorkflowGraphNode = {
  readonly id: string;
  readonly nodeKind: WorkflowNodeKind;
  readonly kind: string;
  readonly label?: string;
  readonly config: WorkflowConfig;
};

/** Immutable snapshot of workflow graph metadata. */
export type WorkflowGraphSnapshot = {
  readonly nodes: readonly WorkflowGraphNode[];
  readonly connections: readonly WorkflowConnection[];
};

export type WorkflowVariable = {
  readonly id: WorkflowVariableId;
  readonly key: string;
  readonly label?: string;
  readonly valueType: WorkflowValueType;
  readonly defaultValue?: WorkflowConfigValue;
  readonly required?: boolean;
};

export type WorkflowParameter = {
  readonly id: WorkflowParameterId;
  readonly key: string;
  readonly label?: string;
  readonly valueType: Exclude<WorkflowValueType, "json">;
  readonly required?: boolean;
  readonly defaultValue?: WorkflowConfigValue;
};

export type WorkflowCategory = {
  readonly id: WorkflowCategoryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly name: string;
  readonly description?: string;
  readonly parentCategoryId?: WorkflowCategoryId;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type WorkflowFolder = {
  readonly id: WorkflowFolderId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly name: string;
  readonly parentFolderId?: WorkflowFolderId;
  readonly path: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type WorkflowMetadata = {
  readonly id: WorkflowMetadataId;
  readonly workflowId: WorkflowId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly labels?: Readonly<Record<string, string>>;
  readonly tags?: readonly string[];
  readonly custom?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/**
 * Immutable versioned snapshot of workflow graph metadata.
 * No execution / runtime / queue fields.
 */
export type WorkflowVersion = {
  readonly id: WorkflowVersionId;
  readonly workflowId: WorkflowId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly versionNumber: number;
  readonly status: WorkflowVersionStatus;
  readonly lifecycle: WorkflowLifecycleState;
  readonly graph: WorkflowGraphSnapshot;
  readonly variables: readonly WorkflowVariable[];
  readonly parameters: readonly WorkflowParameter[];
  readonly triggers: readonly WorkflowTrigger[];
  readonly actions: readonly WorkflowAction[];
  readonly conditions: readonly WorkflowCondition[];
  readonly connections: readonly WorkflowConnection[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly changeSummary?: string;
};

export type Workflow = {
  readonly id: WorkflowId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly lifecycle: WorkflowLifecycleState;
  readonly currentVersionId?: WorkflowVersionId;
  readonly categoryId?: WorkflowCategoryId;
  readonly folderId?: WorkflowFolderId;
  readonly templateId?: WorkflowTemplateId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
};

export type WorkflowTemplate = {
  readonly id: WorkflowTemplateId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly lifecycle: WorkflowLifecycleState;
  readonly categoryId?: WorkflowCategoryId;
  /** Template graph blueprint (metadata). */
  readonly graph: WorkflowGraphSnapshot;
  readonly parameters: readonly WorkflowParameter[];
  readonly variables: readonly WorkflowVariable[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type WorkflowAuditEntry = {
  readonly id: WorkflowAuditId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workflowId: WorkflowId;
  readonly versionId?: WorkflowVersionId;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId?: string;
  readonly detail?: Readonly<Record<string, string>>;
  readonly createdAt: string;
};

export type WorkflowValidationIssue = {
  readonly code: WorkflowValidationIssueCode;
  readonly message: string;
  readonly path?: string;
  readonly severity: "error" | "warning";
};

/** Structural / reference / parameter / version / lifecycle validation — NOT runtime. */
export type WorkflowValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly WorkflowValidationIssue[];
};

export type WorkflowSummary = {
  readonly id: WorkflowId;
  readonly key: string;
  readonly name: string;
  readonly lifecycle: WorkflowLifecycleState;
  readonly currentVersionId?: WorkflowVersionId;
  readonly categoryId?: WorkflowCategoryId;
  readonly folderId?: WorkflowFolderId;
  readonly updatedAt: string;
};

/** Convenience: Workflow timestamps satisfy AuditFields. */
export type WorkflowWithAudit = Workflow & AuditFields;

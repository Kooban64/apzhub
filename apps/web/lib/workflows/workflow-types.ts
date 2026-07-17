/** Platform Workflow typed client view models (APZWORKFLOW-003). */

export type WorkflowClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type WorkflowCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export type WorkflowSummaryViewModel = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly lifecycle: string;
  readonly currentVersionId?: string;
  readonly categoryId?: string;
  readonly folderId?: string;
  readonly updatedAt: string;
};

export type WorkflowViewModel = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly lifecycle: string;
  readonly currentVersionId?: string;
  readonly categoryId?: string;
  readonly folderId?: string;
  readonly templateId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
};

/** Read-only definition node for Definition Viewer / Graph (APZWORKFLOW-004). */
export type WorkflowDefinitionNodeViewModel = {
  readonly id: string;
  readonly nodeKind?: string;
  readonly kind?: string;
  readonly label?: string;
  readonly config?: Readonly<Record<string, unknown>>;
};

export type WorkflowDefinitionConnectionViewModel = {
  readonly id?: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly label?: string;
};

export type WorkflowDefinitionGraphViewModel = {
  readonly nodes: readonly WorkflowDefinitionNodeViewModel[];
  readonly connections: readonly WorkflowDefinitionConnectionViewModel[];
};

export type WorkflowVersionViewModel = {
  readonly id: string;
  readonly workflowId: string;
  readonly versionNumber: number;
  readonly status: string;
  readonly lifecycle: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly changeSummary?: string;
  /** Canonical definition metadata when returned by GET version. */
  readonly graph?: WorkflowDefinitionGraphViewModel;
  readonly variables?: readonly Readonly<Record<string, unknown>>[];
  readonly parameters?: readonly Readonly<Record<string, unknown>>[];
  readonly triggers?: readonly Readonly<Record<string, unknown>>[];
  readonly actions?: readonly Readonly<Record<string, unknown>>[];
  readonly conditions?: readonly Readonly<Record<string, unknown>>[];
  readonly connections?: readonly WorkflowDefinitionConnectionViewModel[];
};

export type WorkflowTemplateViewModel = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly lifecycle: string;
  readonly categoryId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly graph?: WorkflowDefinitionGraphViewModel;
  readonly variables?: readonly Readonly<Record<string, unknown>>[];
  readonly parameters?: readonly Readonly<Record<string, unknown>>[];
};

export type WorkflowCategoryViewModel = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly parentCategoryId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type WorkflowFolderViewModel = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly parentFolderId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type WorkflowAuditViewModel = {
  readonly id: string;
  readonly workflowId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly createdAt: string;
};

export type WorkflowValidationViewModel = {
  readonly valid: boolean;
  readonly issues: readonly {
    readonly code: string;
    readonly message: string;
    readonly path?: string;
    readonly severity: string;
  }[];
};

export type WorkflowManagementPlaneViewModel = {
  readonly workflowEnabled: boolean;
  readonly executionEnabled: false;
  readonly engineConfigured: false;
  readonly persistenceMode: string;
  readonly capabilities: {
    readonly metadataCrud: boolean;
    readonly lifecycle: boolean;
    readonly validation: boolean;
    readonly templates: boolean;
    readonly categories: boolean;
    readonly folders: boolean;
    readonly audit: boolean;
    readonly execution: false;
    readonly schedules: false;
    readonly n8n: false;
  };
  readonly status?: string;
  readonly healthy?: boolean;
  readonly ready?: boolean;
  readonly platformServicesVersion?: string;
};

export type ListWorkflowsClientQuery = {
  readonly query?: string;
  readonly lifecycle?: string;
  readonly categoryId?: string;
  readonly folderId?: string;
  readonly limit?: number;
};

export type CreateWorkflowClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
  readonly categoryId?: string;
  readonly folderId?: string;
  readonly templateId?: string;
};

export type UpdateWorkflowClientInput = {
  readonly name?: string;
  readonly description?: string;
  readonly categoryId?: string | null;
  readonly folderId?: string | null;
};

export type TransitionWorkflowClientInput = {
  readonly to: string;
  readonly reason?: string;
};

export type CreateWorkflowVersionClientInput = {
  readonly graph: {
    readonly nodes: readonly Record<string, unknown>[];
    readonly connections: readonly Record<string, unknown>[];
  };
  readonly variables?: readonly Record<string, unknown>[];
  readonly parameters?: readonly Record<string, unknown>[];
  readonly triggers?: readonly Record<string, unknown>[];
  readonly actions?: readonly Record<string, unknown>[];
  readonly conditions?: readonly Record<string, unknown>[];
  readonly connections?: readonly Record<string, unknown>[];
  readonly changeSummary?: string;
};

export type CreateWorkflowTemplateClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
  readonly categoryId?: string;
  readonly graph: CreateWorkflowVersionClientInput["graph"];
  readonly parameters?: readonly Record<string, unknown>[];
  readonly variables?: readonly Record<string, unknown>[];
};

export type UpdateWorkflowTemplateClientInput = {
  readonly name?: string;
  readonly description?: string;
  readonly categoryId?: string | null;
  readonly graph?: CreateWorkflowVersionClientInput["graph"];
  readonly parameters?: readonly Record<string, unknown>[];
  readonly variables?: readonly Record<string, unknown>[];
};

export type CreateWorkflowCategoryClientInput = {
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
  readonly parentCategoryId?: string;
};

export type CreateWorkflowFolderClientInput = {
  readonly name: string;
  readonly organisationId?: string;
  readonly parentFolderId?: string;
  readonly path: string;
};

export type ValidateWorkflowClientInput = {
  readonly workflowId?: string;
  readonly versionId?: string;
  readonly lifecycle?: string;
  readonly graph?: CreateWorkflowVersionClientInput["graph"];
  readonly variables?: readonly Record<string, unknown>[];
  readonly parameters?: readonly Record<string, unknown>[];
  readonly triggers?: readonly Record<string, unknown>[];
  readonly actions?: readonly Record<string, unknown>[];
  readonly conditions?: readonly Record<string, unknown>[];
  readonly connections?: readonly Record<string, unknown>[];
  readonly versionNumber?: number;
  readonly categoryId?: string;
  readonly folderId?: string;
  readonly templateId?: string;
};

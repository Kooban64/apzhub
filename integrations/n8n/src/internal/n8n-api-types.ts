/** Vendor-private n8n REST shapes — never exported from package index. */

export interface N8nWorkflowRecord {
  readonly id: string;
  readonly name: string;
  readonly active?: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly tags?: readonly { readonly id?: string; readonly name?: string }[];
  readonly nodes?: readonly Readonly<Record<string, unknown>>[];
  readonly connections?: Readonly<Record<string, unknown>>;
  readonly settings?: Readonly<Record<string, unknown>>;
  readonly versionId?: string;
  readonly meta?: Readonly<Record<string, unknown>>;
}

export interface N8nWorkflowListResponse {
  readonly data: readonly N8nWorkflowRecord[];
  readonly nextCursor?: string | null;
}

export interface N8nTagRecord {
  readonly id: string;
  readonly name: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface N8nTagsListResponse {
  readonly data: readonly N8nTagRecord[];
}

export interface N8nCredentialMetadataRecord {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface N8nCredentialsListResponse {
  readonly data: readonly N8nCredentialMetadataRecord[];
}

export interface N8nExecutionMetadataRecord {
  readonly id: string;
  readonly finished?: boolean;
  readonly mode?: string;
  readonly startedAt?: string;
  readonly stoppedAt?: string;
  readonly workflowId?: string;
  readonly status?: string;
}

export interface N8nExecutionsListResponse {
  readonly data: readonly N8nExecutionMetadataRecord[];
  readonly nextCursor?: string | null;
}

export interface N8nUserRecord {
  readonly id: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly role?: string;
}

export interface N8nUsersListResponse {
  readonly data: readonly N8nUserRecord[];
}

export interface N8nProjectRecord {
  readonly id: string;
  readonly name: string;
  readonly type?: string;
}

export interface N8nProjectsListResponse {
  readonly data: readonly N8nProjectRecord[];
}

export interface N8nVariableMetadataRecord {
  readonly id: string;
  readonly key: string;
  readonly type?: string;
}

export interface N8nVariablesListResponse {
  readonly data: readonly N8nVariableMetadataRecord[];
}

export interface N8nHealthzResponse {
  readonly status?: string;
}

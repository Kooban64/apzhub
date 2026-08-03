/**
 * Provider-neutral SCM contracts.
 * External APIs must never expose GitHub-specific types.
 */

export type ScmProviderId =
  "github" | "gitlab" | "azure_devops" | "bitbucket" | "gitea" | "forgejo";

export type ScmProviderStatus = "active" | "placeholder";

export type RepositoryVisibility = "public" | "private" | "internal" | "unknown";

export type RepositoryRegistrationState = "enabled" | "disabled";

export interface ScmProviderDescriptor {
  readonly providerId: ScmProviderId;
  readonly name: string;
  readonly version: string;
  readonly status: ScmProviderStatus;
  readonly capabilities: readonly string[];
}

export interface ScmAuthCredentials {
  readonly kind: "pat" | "oauth" | "app" | "none";
  /** Opaque secret reference — never log plaintext. */
  readonly secretRef?: string;
  readonly token?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface ScmRepositoryRef {
  readonly providerId: ScmProviderId;
  readonly externalId: string;
  readonly fullName: string;
  readonly defaultBranch?: string;
  readonly htmlUrl?: string;
  readonly visibility?: RepositoryVisibility;
  readonly cloneUrl?: string;
}

export interface ScmBranchRef {
  readonly name: string;
  readonly sha?: string;
  readonly protected?: boolean;
}

export interface ScmCommitRef {
  readonly sha: string;
  readonly message: string;
  readonly authorName?: string;
  readonly authorEmail?: string;
  readonly committedAt?: string;
  readonly branch?: string;
  readonly htmlUrl?: string;
}

export interface ScmPullRequestRef {
  readonly externalId: string;
  readonly number: number;
  readonly title: string;
  readonly state: "open" | "closed" | "merged" | "draft" | "unknown";
  readonly sourceBranch?: string;
  readonly targetBranch?: string;
  readonly authorLogin?: string;
  readonly htmlUrl?: string;
  readonly updatedAt?: string;
}

export interface ScmTagRef {
  readonly name: string;
  readonly sha?: string;
}

export interface ScmReleaseRef {
  readonly externalId: string;
  readonly tagName: string;
  readonly name?: string;
  readonly publishedAt?: string;
  readonly htmlUrl?: string;
}

export interface RegisteredRepository {
  readonly repositoryId: string;
  readonly tenantId: string;
  readonly providerId: ScmProviderId;
  readonly externalId: string;
  readonly fullName: string;
  readonly defaultBranch: string;
  readonly visibility: RepositoryVisibility;
  readonly state: RepositoryRegistrationState;
  readonly htmlUrl?: string;
  readonly selectedBranches?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
  readonly health?: {
    readonly ok: boolean;
    readonly detail?: string;
    readonly checkedAt?: string;
  };
  readonly registeredAt: string;
  readonly updatedAt: string;
  readonly registeredBy: string;
}

export interface RegisterRepositoryRequest {
  readonly tenantId: string;
  readonly providerId: ScmProviderId;
  readonly fullName: string;
  readonly externalId?: string;
  readonly defaultBranch?: string;
  readonly visibility?: RepositoryVisibility;
  readonly htmlUrl?: string;
  readonly selectedBranches?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
  readonly registeredBy: string;
  readonly credentials?: ScmAuthCredentials;
}

export interface ScmTraceabilityLink {
  readonly linkId: string;
  readonly tenantId: string;
  readonly repositoryId: string;
  readonly kind:
    | "commit"
    | "branch"
    | "pull_request"
    | "execution_plan"
    | "execution_session"
    | "evidence"
    | "defect"
    | "requirement"
    | "quality_report";
  readonly externalRef: string;
  readonly platformRef?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly note?: string;
}

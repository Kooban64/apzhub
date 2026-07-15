/** Internal GitHub REST DTO shapes — never exported from public index. */

export interface GitHubUserRecord {
  readonly login: string;
  readonly id: number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly type?: string;
}

export interface GitHubRateLimitResource {
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number;
  readonly used?: number;
}

export interface GitHubRateLimitRecord {
  readonly resources: {
    readonly core: GitHubRateLimitResource;
    readonly search?: GitHubRateLimitResource;
    readonly graphql?: GitHubRateLimitResource;
    readonly actions_runner_registration?: GitHubRateLimitResource;
  };
  readonly rate: GitHubRateLimitResource;
}

export interface GitHubRepositoryRecord {
  readonly id: number;
  readonly name: string;
  readonly full_name: string;
  readonly private: boolean;
  readonly html_url: string;
  readonly description?: string | null;
  readonly default_branch?: string;
  readonly owner?: { readonly login: string; readonly id: number };
}

export interface GitHubWorkflowRecord {
  readonly id: number;
  readonly node_id?: string;
  readonly name: string;
  readonly path: string;
  readonly state: string;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly url?: string;
  readonly html_url?: string;
  readonly badge_url?: string;
}

export interface GitHubWorkflowsListResponse {
  readonly total_count: number;
  readonly workflows: readonly GitHubWorkflowRecord[];
}

export interface GitHubWorkflowRunRecord {
  readonly id: number;
  readonly name?: string | null;
  readonly node_id?: string;
  readonly head_branch?: string | null;
  readonly head_sha?: string;
  readonly path?: string;
  readonly display_title?: string;
  readonly run_number?: number;
  readonly event?: string;
  readonly status?: string | null;
  readonly conclusion?: string | null;
  readonly workflow_id: number;
  readonly check_suite_id?: number;
  readonly url?: string;
  readonly html_url?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly run_started_at?: string;
  readonly actor?: { readonly login?: string; readonly id?: number };
  readonly triggering_actor?: { readonly login?: string; readonly id?: number };
  readonly run_attempt?: number;
  readonly repository?: {
    readonly full_name?: string;
    readonly name?: string;
    readonly owner?: { readonly login?: string };
  };
  readonly head_commit?: {
    readonly id?: string;
    readonly message?: string;
    readonly timestamp?: string;
  };
  readonly jobs_url?: string;
  readonly logs_url?: string;
  readonly artifacts_url?: string;
  readonly cancel_url?: string;
  readonly rerun_url?: string;
  readonly workflow_url?: string;
  readonly environment?: string;
}

export interface GitHubWorkflowRunsListResponse {
  readonly total_count: number;
  readonly workflow_runs: readonly GitHubWorkflowRunRecord[];
}

export interface GitHubJobStepRecord {
  readonly name: string;
  readonly status?: string | null;
  readonly conclusion?: string | null;
  readonly number?: number;
  readonly started_at?: string | null;
  readonly completed_at?: string | null;
}

export interface GitHubJobRecord {
  readonly id: number;
  readonly run_id: number;
  readonly workflow_name?: string | null;
  readonly head_branch?: string | null;
  readonly head_sha?: string;
  readonly name: string;
  readonly status?: string | null;
  readonly conclusion?: string | null;
  readonly started_at?: string | null;
  readonly completed_at?: string | null;
  readonly steps?: readonly GitHubJobStepRecord[];
  readonly runner_name?: string | null;
  readonly runner_group_name?: string | null;
  readonly labels?: readonly string[];
  readonly html_url?: string;
  readonly check_run_url?: string;
}

export interface GitHubJobsListResponse {
  readonly total_count: number;
  readonly jobs: readonly GitHubJobRecord[];
}

export interface GitHubArtifactRecord {
  readonly id: number;
  readonly node_id?: string;
  readonly name: string;
  readonly size_in_bytes?: number;
  readonly url?: string;
  readonly archive_download_url?: string;
  readonly expired?: boolean;
  readonly created_at?: string;
  readonly expires_at?: string | null;
  readonly updated_at?: string;
  readonly digest?: string | null;
}

export interface GitHubArtifactsListResponse {
  readonly total_count: number;
  readonly artifacts: readonly GitHubArtifactRecord[];
}

export interface GitHubEnvironmentRecord {
  readonly id: number;
  readonly name: string;
  readonly url?: string | null;
  readonly html_url?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface GitHubEnvironmentsListResponse {
  readonly total_count: number;
  readonly environments: readonly GitHubEnvironmentRecord[];
}

export interface GitHubApprovalRecord {
  readonly environments?: readonly {
    readonly name?: string;
    readonly id?: number;
  }[];
  readonly state?: string;
  readonly user?: { readonly login?: string };
  readonly comment?: string;
  readonly created_at?: string;
}

export interface GitHubListQuery {
  readonly per_page?: number;
  readonly page?: number;
  readonly status?: string;
  readonly branch?: string;
  readonly event?: string;
  readonly created?: string;
}

export interface GitHubRateLimitSnapshot {
  readonly remaining?: number;
  readonly limit?: number;
  readonly reset?: number;
}

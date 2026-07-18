/** Adapter-internal Plane API shapes — never exported from package public API. */

export interface PlaneInstanceResponse {
  readonly instance: {
    readonly id: string;
    readonly version?: string;
    readonly is_setup_done?: boolean;
  };
}

export interface PlaneWorkspaceResponse {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly url?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface PlanePaginatedResponse<T> {
  readonly count?: number;
  readonly total_count?: number;
  readonly total_results?: number;
  readonly next_cursor?: string | null;
  readonly prev_cursor?: string | null;
  readonly next_page_results?: boolean;
  readonly results: readonly T[];
}

export interface PlaneProjectRecord {
  readonly id: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly workspace?: string;
  readonly project_lead?: string | null;
  readonly archived_at?: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PlaneStateRecord {
  readonly id: string;
  readonly name: string;
  readonly group: string;
  readonly color?: string;
  readonly sequence?: number;
  readonly default?: boolean;
}

export interface PlaneLabelRecord {
  readonly id: string;
  readonly name: string;
  readonly color?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface PlaneCycleRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly start_date?: string | null;
  readonly end_date?: string | null;
  readonly status?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface PlaneModuleRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly status?: string;
  readonly start_date?: string | null;
  readonly target_date?: string | null;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface PlaneMemberRecord {
  readonly id: string;
  readonly member: string;
  readonly role: number | string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

/** Plane CE issue (task) record — adapter-internal only. */
export interface PlaneIssueRecord {
  readonly id: string;
  readonly name: string;
  readonly description_html?: string | null;
  readonly description_stripped?: string | null;
  readonly description?: string | null;
  readonly project?: string;
  readonly state?:
    | string
    | { readonly id: string; readonly group?: string; readonly name?: string }
    | null;
  readonly priority?: string | null;
  readonly assignees?: readonly string[] | readonly { readonly id: string }[];
  readonly labels?: readonly string[] | readonly { readonly id: string }[];
  readonly cycle?: string | null;
  readonly module?: string | null;
  readonly parent?: string | null;
  readonly estimate_point?: number | null;
  readonly start_date?: string | null;
  readonly target_date?: string | null;
  readonly sequence_id?: number | null;
  readonly sort_order?: number | null;
  readonly archived_at?: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Plane CE issue comment — adapter-internal only. */
export interface PlaneCommentRecord {
  readonly id: string;
  readonly comment_html?: string | null;
  readonly comment_stripped?: string | null;
  readonly comment?: string | null;
  readonly actor?: string | { readonly id: string } | null;
  readonly issue?: string;
  readonly project?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Plane CE issue activity / history entry — adapter-internal only. */
export interface PlaneActivityRecord {
  readonly id: string;
  readonly verb?: string | null;
  readonly field?: string | null;
  readonly old_value?: string | null;
  readonly new_value?: string | null;
  readonly comment?: string | null;
  readonly actor?: string | { readonly id: string } | null;
  readonly issue?: string | null;
  readonly project?: string | null;
  readonly created_at: string;
  readonly updated_at?: string;
}

/** Plane CE issue subscriber (watcher) — adapter-internal only. */
export interface PlaneSubscriberRecord {
  readonly id: string;
  readonly subscriber: string | { readonly id: string };
  readonly issue?: string;
  readonly project?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface PlaneProjectStatsRecord {
  readonly id: string;
  readonly total_issues?: number;
  readonly completed_issues?: number;
  readonly total_members?: number;
  readonly total_cycles?: number;
  readonly total_modules?: number;
}

export interface PlaneCycleProgressRecord {
  readonly total_issues?: number;
  readonly completed_issues?: number;
  readonly cancelled_issues?: number;
  readonly started_issues?: number;
  readonly unstarted_issues?: number;
  readonly backlog_issues?: number;
  readonly distribution?: Readonly<Record<string, number>>;
  readonly completion_chart?: readonly {
    readonly date?: string;
    readonly completed?: number;
    readonly total?: number;
    readonly ideal?: number;
  }[];
}

export interface PlaneCycleAnalyticsRecord {
  readonly estimate_distribution?: Readonly<Record<string, number>>;
  readonly issue_distribution?: Readonly<Record<string, number>>;
  readonly completion_chart?: readonly {
    readonly date?: string;
    readonly completed?: number;
    readonly total?: number;
  }[];
  readonly total_estimate_points?: number;
  readonly completed_estimate_points?: number;
}

/** Plane CE webhook registration — adapter-internal only. */
export interface PlaneWebhookRecord {
  readonly id: string;
  readonly url: string;
  readonly is_active?: boolean;
  readonly secret_key?: string | null;
  readonly project?: boolean;
  readonly issue?: boolean;
  readonly cycle?: boolean;
  readonly module?: boolean;
  readonly issue_comment?: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Plane CE webhook delivery payload — adapter-internal only. */
export interface PlaneWebhookPayload {
  readonly event: string;
  readonly action: string;
  readonly webhook_id?: string;
  readonly workspace_id?: string;
  readonly data?: Record<string, unknown> | { readonly id?: string };
  readonly activity?: {
    readonly field?: string;
    readonly old_value?: string | null;
    readonly new_value?: string | null;
    readonly verb?: string;
  };
}

export interface PlaneApiErrorBody {
  readonly error?: string;
  readonly error_code?: string;
  readonly message?: string;
  readonly detail?: string;
}

export interface PlaneConnectionTestResult {
  readonly ok: boolean;
  readonly engineVersion?: string;
  readonly workspaceId?: string;
  readonly workspaceName?: string;
  readonly latencyMs: number;
}

export interface PlaneListQuery {
  readonly per_page?: number;
  readonly cursor?: string;
  readonly order_by?: string;
  readonly search?: string;
  readonly archived?: boolean;
  readonly state?: string;
  readonly priority?: string;
  readonly assignees?: string;
  readonly labels?: string;
  readonly cycle?: string;
  readonly module?: string;
  readonly parent?: string;
  readonly created_at__gte?: string;
  readonly created_at__lte?: string;
  readonly updated_at__gte?: string;
  readonly updated_at__lte?: string;
  readonly project?: string;
  readonly project_ids?: string;
  readonly fields?: string;
  readonly activity_type?: string;
  readonly created_at__gt?: string;
}

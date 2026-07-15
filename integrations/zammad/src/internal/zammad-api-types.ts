/** Internal Zammad REST record shapes — never exported from the package. */

export interface ZammadListQuery {
  readonly page?: number;
  readonly per_page?: number;
  readonly query?: string;
  readonly expand?: boolean | string;
  readonly sort_by?: string;
  readonly order_by?: string;
  readonly [key: string]: string | number | boolean | undefined;
}

export interface ZammadListResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly page: number;
  readonly perPage: number;
}

export interface ZammadTicketRecord {
  readonly id: number;
  readonly number?: string | number;
  readonly title: string;
  readonly group_id: number;
  readonly customer_id: number;
  readonly owner_id?: number | null;
  readonly organization_id?: number | null;
  readonly state_id?: number;
  readonly priority_id?: number;
  readonly state?: string;
  readonly priority?: string;
  readonly tags?: readonly string[];
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ZammadOrganizationRecord {
  readonly id: number;
  readonly name: string;
  readonly note?: string;
  readonly domain?: string;
  readonly shared?: boolean;
  readonly active?: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ZammadGroupRecord {
  readonly id: number;
  readonly name: string;
  readonly note?: string;
  readonly active?: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ZammadUserRecord {
  readonly id: number;
  readonly login?: string;
  readonly email?: string;
  readonly firstname?: string;
  readonly lastname?: string;
  readonly active?: boolean;
  readonly organization_id?: number | null;
  readonly organization_ids?: readonly number[];
  readonly role_ids?: readonly number[];
  readonly roles?: readonly string[];
  readonly created_at?: string;
  readonly updated_at?: string;
}

/** Internal article attachment metadata — binary fields stripped before mapping. */
export interface ZammadArticleAttachmentRecord {
  readonly id: number;
  readonly filename?: string;
  readonly size?: number;
  readonly preferences?: Readonly<Record<string, unknown>>;
  readonly created_at?: string;
  /** Never mapped into canonical DTOs. */
  readonly data?: string;
}

export interface ZammadArticleRecord {
  readonly id: number;
  readonly ticket_id: number;
  readonly type?: string;
  readonly sender?: string;
  readonly from?: string;
  readonly to?: string;
  readonly cc?: string;
  readonly subject?: string;
  readonly body?: string;
  readonly content_type?: string;
  readonly internal?: boolean;
  readonly created_by_id?: number;
  readonly updated_by_id?: number;
  readonly created_at: string;
  readonly updated_at?: string;
  readonly attachments?: readonly ZammadArticleAttachmentRecord[];
  readonly preferences?: Readonly<Record<string, unknown>>;
}

/** Internal ticket history row — never exported. */
export interface ZammadHistoryRecord {
  readonly id: number;
  readonly o_id?: number;
  readonly ticket_id?: number;
  readonly history_type?: string;
  readonly history_object?: string;
  readonly type?: string;
  readonly object?: string;
  readonly created_by_id?: number | null;
  readonly created_at: string;
  readonly value_from?: string | null;
  readonly value_to?: string | null;
  readonly id_from?: number | null;
  readonly id_to?: number | null;
  readonly attribute?: string | null;
  readonly sourceable_type?: string | null;
  readonly sourceable_id?: number | null;
}

/** Internal webhook registration — never exported. */
export interface ZammadWebhookRecord {
  readonly id: number;
  readonly name?: string;
  readonly endpoint: string;
  readonly active?: boolean;
  readonly signature_token?: string | null;
  readonly subscriptions?: readonly string[];
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Zammad webhook delivery payload — adapter-internal only.
 * Supports explicit event/action envelopes and default ticket/article payloads.
 */
export interface ZammadWebhookPayload {
  readonly event?: string;
  readonly action?: string;
  readonly type?: string;
  readonly ticket?: Record<string, unknown> | { readonly id?: number };
  readonly article?: Record<string, unknown> | { readonly id?: number };
  readonly organization?: Record<string, unknown> | { readonly id?: number };
  readonly group?: Record<string, unknown> | { readonly id?: number };
  readonly user?: Record<string, unknown> | { readonly id?: number };
  readonly changes?: Readonly<Record<string, readonly [unknown, unknown]>>;
  readonly created_at?: string;
  readonly updated_at?: string;
}

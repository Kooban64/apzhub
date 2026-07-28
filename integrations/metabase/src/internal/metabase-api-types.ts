/** Vendor Metabase API shapes — adapter-internal only. */

export interface MetabaseHealthResponse {
  readonly status?: string;
}

export interface MetabaseSessionResponse {
  readonly id: string;
}

export interface MetabaseSessionProperties {
  readonly version?: {
    readonly tag?: string;
    readonly date?: string;
  };
  readonly "application-name"?: string;
  readonly "embedding-app-origin"?: string | null;
  readonly "enable-embedding"?: boolean;
}

export interface MetabaseCollectionRecord {
  readonly id: number | string;
  readonly name: string;
  readonly slug?: string;
  readonly location?: string;
  readonly archived?: boolean;
}

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

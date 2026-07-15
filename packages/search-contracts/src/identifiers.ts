/** Branded search identifiers (APZSEARCH-001). */

const PLATFORM_ID = /^[a-z][a-z0-9_]{1,63}:[A-Za-z0-9._-]{1,128}$/;

export type SearchHitId = string & { readonly __brand: "SearchHitId" };
export type SearchIndexId = string & { readonly __brand: "SearchIndexId" };
export type SearchCollectionId = string & { readonly __brand: "SearchCollectionId" };
export type SearchProviderId = string & { readonly __brand: "SearchProviderId" };
export type SearchSourceId = string & { readonly __brand: "SearchSourceId" };
export type SearchSessionId = string & { readonly __brand: "SearchSessionId" };
export type SearchProfileId = string & { readonly __brand: "SearchProfileId" };
export type SearchAuditId = string & { readonly __brand: "SearchAuditId" };

export function isPlatformIdShape(value: string): boolean {
  return PLATFORM_ID.test(value);
}

export function asSearchHitId(value: string): SearchHitId {
  if (!value || value.length > 256) {
    throw new Error("invalid SearchHitId");
  }
  return value as SearchHitId;
}

export function asSearchIndexId(value: string): SearchIndexId {
  if (!value || value.length > 128) {
    throw new Error("invalid SearchIndexId");
  }
  return value as SearchIndexId;
}

export function asSearchCollectionId(value: string): SearchCollectionId {
  if (!value || value.length > 128) {
    throw new Error("invalid SearchCollectionId");
  }
  return value as SearchCollectionId;
}

export function asSearchProviderId(value: string): SearchProviderId {
  if (!value || value.length > 128) {
    throw new Error("invalid SearchProviderId");
  }
  return value as SearchProviderId;
}

export function asSearchSourceId(value: string): SearchSourceId {
  if (!value || value.length > 128) {
    throw new Error("invalid SearchSourceId");
  }
  return value as SearchSourceId;
}

export function asSearchSessionId(value: string): SearchSessionId {
  if (!value || value.length > 128) {
    throw new Error("invalid SearchSessionId");
  }
  return value as SearchSessionId;
}

export function asSearchProfileId(value: string): SearchProfileId {
  if (!value || value.length > 128) {
    throw new Error("invalid SearchProfileId");
  }
  return value as SearchProfileId;
}

export function asSearchAuditId(value: string): SearchAuditId {
  if (!value || value.length > 128) {
    throw new Error("invalid SearchAuditId");
  }
  return value as SearchAuditId;
}

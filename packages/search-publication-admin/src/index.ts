/** @apzhub/search-publication-admin — Search Publication Operations & Administration (APZSEARCH-017) */

export { SEARCH_PUBLICATION_ADMIN_VERSION } from "./version";

export {
  SEARCH_PUBLICATION_PERMISSIONS,
  isSearchPublicationPermission,
  expandSearchPublicationPermissions,
  type SearchPublicationPermission,
} from "./permissions/catalogue";

export {
  SearchPublicationAdminError,
  SearchPublicationForbiddenError,
  SearchPublicationNotFoundError,
} from "./errors";

export {
  assertSearchPublicationPermission,
  hasSearchPublicationPermission,
} from "./authz";

export type {
  PublicationAdminActor,
  PublicationListFilter,
  PublicationSortField,
  PublicationListQuery,
  PublicationListResult,
  PublicationQueueSummary,
  PublicationProductSummary,
  PublicationAdminDiagnostics,
  DeadLetterMarkerKind,
  DeadLetterMarker,
  PublicationAdminAuditAction,
  PublicationAdminAuditEntry,
  RetryResult,
} from "./types";

export type { PublicationAdminAuditStore } from "./audit/port";
export { createInMemoryPublicationAdminAuditStore } from "./audit/memory";
export type { PublicationAdminMarkerStore } from "./markers/port";
export { createInMemoryPublicationAdminMarkerStore } from "./markers/memory";

export {
  createSearchPublicationAdminService,
  type SearchPublicationAdminService,
  type CreateSearchPublicationAdminServiceOptions,
} from "./service";

export {
  createSearchPublicationAdminGateway,
  type SearchPublicationAdminGateway,
} from "./gateway";

export {
  createSearchPublicationAdmin,
  type SearchPublicationAdminFramework,
  type CreateSearchPublicationAdminInput,
} from "./factory";

/** Static content for the Law API documentation landing page (LAW-014-07). */

export interface LawApiDeveloperGuide {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
}

export interface LawApiDocDownload {
  readonly label: string;
  readonly href: string;
  readonly description: string;
}

export const LAW_API_OPENAPI_YAML_PATH = "/api/law/v1/openapi.yaml";
export const LAW_API_OPENAPI_JSON_PATH = "/api/law/v1/openapi.json";

export const LAW_API_DOC_DOWNLOADS: readonly LawApiDocDownload[] = [
  {
    label: "OpenAPI YAML",
    href: LAW_API_OPENAPI_YAML_PATH,
    description: "Canonical OpenAPI 3.1 specification (YAML)",
  },
  {
    label: "OpenAPI JSON",
    href: LAW_API_OPENAPI_JSON_PATH,
    description: "Canonical OpenAPI 3.1 specification (JSON)",
  },
  {
    label: "Postman Collection",
    href: "/specs/collections/LAW-OpenAPI-v1.postman_collection.json",
    description: "Import into Postman for manual testing",
  },
  {
    label: "Postman Environment",
    href: "/specs/collections/LAW-OpenAPI-v1.postman_environment.json",
    description: "Local development variables for Postman",
  },
  {
    label: "Bruno Collection",
    href: "/specs/collections/bruno/LAW-OpenAPI-v1",
    description: "Bruno folder collection for API testing",
  },
];

export const LAW_API_DEVELOPER_GUIDES: readonly LawApiDeveloperGuide[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Base URL, first request, and response envelopes.",
    href: "/docs/developer/legal-api-getting-started.md",
  },
  {
    slug: "onboarding",
    title: "API Onboarding",
    description: "Step-by-step integration checklist for new consumers.",
    href: "/docs/developer/legal-api-onboarding.md",
  },
  {
    slug: "authentication",
    title: "Authentication",
    description: "Session cookies, bearer tokens, and example auth flow.",
    href: "/docs/developer/legal-api-authentication.md",
  },
  {
    slug: "tenant-resolution",
    title: "Tenant Resolution",
    description: "x-tenant-id header, session claims, and tenant isolation.",
    href: "/docs/developer/legal-api-tenant-resolution.md",
  },
  {
    slug: "permissions",
    title: "Permissions",
    description: "Workbench permission strings per resource and operation.",
    href: "/docs/developer/legal-api-permissions.md",
  },
  {
    slug: "filtering",
    title: "Filtering",
    description: "Query filters per resource and filter conventions.",
    href: "/docs/developer/legal-api-filtering.md",
  },
  {
    slug: "pagination",
    title: "Pagination",
    description: "Cursor pagination, limits, and sort parameters.",
    href: "/docs/developer/legal-api-pagination.md",
  },
  {
    slug: "optimistic-concurrency",
    title: "Optimistic Concurrency",
    description: "ETag headers and If-Match preconditions.",
    href: "/docs/developer/legal-api-optimistic-concurrency.md",
  },
  {
    slug: "error-handling",
    title: "Error Handling",
    description: "Standard error envelope and error code catalogue.",
    href: "/docs/developer/legal-api-error-handling.md",
  },
  {
    slug: "versioning",
    title: "Versioning",
    description: "API version policy, base path, and changelog.",
    href: "/docs/developer/legal-api-versioning.md",
  },
  {
    slug: "examples",
    title: "Examples",
    description: "Request and response examples for every resource.",
    href: "/docs/specs/LAW-API-Examples.md",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Common 401/403/404/412 issues and fixes.",
    href: "/docs/developer/legal-api-troubleshooting.md",
  },
  {
    slug: "changelog",
    title: "API Changelog",
    description: "Version history, implemented resources, and deprecation policy.",
    href: "/docs/developer/legal-api-changelog.md",
  },
];

export const LAW_API_IMPLEMENTED_RESOURCES = [
  "Clients",
  "Matters",
  "Documents",
  "Tasks",
  "Calendar Events",
  "Time Entries",
  "Invoices",
] as const;

export const LAW_API_PLANNED_RESOURCES = [
  "Search",
  "Dashboard",
  "Activities",
  "Notifications",
] as const;

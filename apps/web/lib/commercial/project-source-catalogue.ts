/**
 * Client-safe catalogue for project source providers (no Node I/O).
 */

import type { ScmProviderId } from "@apzhub/platform-scm";

export type ProjectSourceOperatingMode = "granted_read" | "customer_pipeline";

export type SourceBoundProductKey = "qep" | "pentest";

export const PROJECT_SOURCE_PROVIDER_CATALOGUE = [
  {
    providerId: "github" as const,
    name: "GitHub",
    status: "available" as const,
    note: "Per project — App / installation / PAT via secret ref",
  },
  {
    providerId: "gitlab" as const,
    name: "GitLab",
    status: "available" as const,
    note: "Per project — PAT / secret ref; CE + self-hosted API",
  },
  {
    providerId: "azure_devops" as const,
    name: "Azure DevOps",
    status: "coming_soon" as const,
    note: "Typed; adapter deferred",
  },
  {
    providerId: "bitbucket" as const,
    name: "Bitbucket",
    status: "coming_soon" as const,
    note: "Typed; adapter deferred",
  },
  {
    providerId: "gitea" as const,
    name: "Gitea",
    status: "coming_soon" as const,
    note: "Typed; adapter deferred",
  },
  {
    providerId: "forgejo" as const,
    name: "Forgejo",
    status: "coming_soon" as const,
    note: "Typed; adapter deferred",
  },
] as const;

export function isKnownSourceProvider(value: string): value is ScmProviderId {
  return PROJECT_SOURCE_PROVIDER_CATALOGUE.some((p) => p.providerId === value);
}

export function isSourceProviderAvailable(providerId: ScmProviderId): boolean {
  return PROJECT_SOURCE_PROVIDER_CATALOGUE.some(
    (p) => p.providerId === providerId && p.status === "available",
  );
}
